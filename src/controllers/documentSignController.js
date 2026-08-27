const Document = require('../models/documentModel');
const User = require('../models/userModel');
const fsp = require('fs').promises;
const { PDFDocument } = require('pdf-lib');
const { sendEmail, templates } = require('../utils/emailService');
const { createAuditLog } = require('../utils/auditLogger');
const { sendNotification } = require('../utils/socket');
const crypto = require('crypto');

const getBaseEmail = (email) => {
    if (!email) return '';
    const parts = email.toLowerCase().trim().split('@');
    if (parts.length !== 2) return email.toLowerCase().trim();
    const userPart = parts[0].split('+')[0];
    return `${userPart}@${parts[1]}`;
};

// @desc    Save signature fields and promote draft → pending (send for signing)
// @route   PUT /api/documents/save-fields/:id
// @access  Private (Admin/Manager)
const updateDocumentFields = async (req, res) => {
    try {
        const { fields, emailSettings } = req.body;
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: 'Document not found'
            });
        }

        document.fields = fields;
        if (emailSettings) {
            document.emailSettings = emailSettings;
        }

        // If it was a draft, promote it to pending now that fields are set
        let promoted = false;
        let tokenMap = {}; // userId -> rawToken
        if (document.status === 'draft') {
            document.status = 'pending';
            promoted = true;

            document.signTokens = [];
            const assignedToArray = document.assignedTo || [];
            assignedToArray.forEach(userId => {
                const rawToken = crypto.randomBytes(32).toString('hex');
                const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
                document.signTokens.push({
                    user: userId,
                    token: hashedToken,
                    isUsed: false,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
                });
                tokenMap[userId.toString()] = rawToken;
            });
        }

        await document.save();

        const populatedDoc = await Document.findById(document._id)
            .populate('uploadedBy', 'name email role')
            .populate('assignedTo', 'name email role isInvited')
            .populate('fields.user', 'name email role')
            .populate('signatures.user', 'name email role');

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: promoted ? 'Document completed and sent for signing' : 'Document fields updated',
            data: populatedDoc
        });

        // Audit Log
        await createAuditLog({
            user: req.user,
            action: 'DOCUMENT_PREPARED',
            details: `Signature fields prepared for "${document.title}"`,
            targetType: 'document',
            targetId: document._id,
            req
        });

        // Notify recipients ONLY if it was just promoted from draft → pending
        if (promoted) {
            const assignedToArray = document.assignedTo || [];

            // Real-time notifications
            assignedToArray.forEach(userId => {
                sendNotification(userId, {
                    type: 'DOCUMENT_ASSIGNED',
                    title: 'New Document Assigned',
                    message: `You have been assigned a new document: ${document.title}`,
                    metadata: { documentId: document._id }
                });
            });

            // Email notifications
            if (document.emailSettings?.sendEmail !== false) {
                try {
                    const usersToNotify = await User.find({ _id: { $in: assignedToArray } });
                    const uploaderBaseEmail = getBaseEmail(req.user.email);
                    const assignedBaseEmails = usersToNotify.map(u => getBaseEmail(u.email));

                    // 1. Send sign request email to each signer (with CC visible in header, but delivered strictly to signer)
                    const ccHeader = document.emailSettings?.cc ? document.emailSettings.cc.trim() : null;

                    usersToNotify.forEach(user => {
                        const rawToken = tokenMap[user._id.toString()];
                        const customLink = rawToken
                            ? `${process.env.FRONTEND_URL}/sign/${document._id}?token=${rawToken}&email=${encodeURIComponent(user.email)}`
                            : null;

                        const baseSubject = document.emailSettings?.subject || `Signature Request: ${document.title}`;
                        const recipientSubject = usersToNotify.length > 1 ? `${baseSubject} - ${user.name}` : baseSubject;

                        sendEmail(
                            user.email,
                            recipientSubject,
                            templates.documentAssigned(
                                user.name, 
                                document.title, 
                                document._id, 
                                document.emailSettings?.message, 
                                customLink,
                                ccHeader
                            ),
                            document.emailSettings?.replyTo || null,
                            ccHeader || null, // Adds 'Cc' MIME header so Gmail popup shows "cc: ..."
                            [user.email]      // SMTP delivers exclusively to user.email (preventing sign link leakage)
                        );
                    });

                    // 2. Send observer copy to CC recipients (strictly NO sign button/token)
                    if (ccHeader) {
                        const ccEmails = ccHeader
                            .split(',')
                            .map(email => email.trim().toLowerCase())
                            .filter(email => {
                                if (!email) return false;
                                const baseCc = getBaseEmail(email);
                                // Exclude uploader and all assigned signers
                                return baseCc !== uploaderBaseEmail && !assignedBaseEmails.includes(baseCc);
                            });

                        ccEmails.forEach(ccEmail => {
                            const ccName = ccEmail.split('@')[0];
                            const capitalizedCcName = ccName.charAt(0).toUpperCase() + ccName.slice(1);
                            sendEmail(
                                ccEmail,
                                `Observer Copy: ${document.emailSettings?.subject || document.title}`,
                                templates.documentCCNotification(
                                    capitalizedCcName, 
                                    document.title, 
                                    document._id, 
                                    document.emailSettings?.message,
                                    ccHeader
                                ),
                                document.emailSettings?.replyTo || null,
                                null,
                                [ccEmail]
                            );
                        });
                    }
                } catch (emailErr) {
                    console.error('Field Prep Notification Error:', emailErr.message);
                }
            }
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Internal Server Error'
        });
    }
};

// @desc    Sign a document (embed signature image into PDF)
// @route   POST /api/documents/sign/:id
// @access  Private (Assigned Users)
const signDocument = async (req, res) => {
    try {
        const { signatures } = req.body; // { fieldId: dataUrl, ... }
        console.log(`Signing document ${req.params.id} for user ${req.user._id}`);

        // Capture client details (IP Address, User-Agent browser & OS)
        const ua = req.headers['user-agent'];
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip || 'Unknown IP';
        
        let browser = 'Unknown Browser';
        let os = 'Unknown OS';
            
            if (ua) {
                if (ua.includes('Windows')) os = 'Windows';
                else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
                else if (ua.includes('Linux')) os = 'Linux';
                else if (ua.includes('Android')) os = 'Android';
                else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

                if (ua.includes('Chrome') && !ua.includes('Chromium') && !ua.includes('Edg')) browser = 'Google Chrome';
                else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
                else if (ua.includes('Firefox')) browser = 'Mozilla Firefox';
                else if (ua.includes('Edg')) browser = 'Microsoft Edge';
                else if (ua.includes('Trident') || ua.includes('MSIE')) browser = 'Internet Explorer';
                else if (ua.includes('Chromium')) browser = 'Chromium';
            }

        if (!signatures || Object.keys(signatures).length === 0) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'No signatures provided'
            });
        }

        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: 'Document not found'
            });
        }

        // Check if user is assigned to this document
        const isAssigned = document.assignedTo.some(id => id.toString() === req.user._id.toString());
        if (!isAssigned) {
            return res.status(403).json({
                success: false,
                statusCode: 403,
                message: 'You are not assigned to sign this document'
            });
        }

        // --- PDF SYNTHESIS: Embed signatures into the actual PDF ---
        try {
            console.log('Starting PDF synthesis for multiple fields...');
            const existingPdfBytes = await fsp.readFile(document.filePath);
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const pages = pdfDoc.getPages();

            for (const [fieldId, signatureData] of Object.entries(signatures)) {
                // Find the specific field in the document
                const field = document.fields.find(f => f._id.toString() === fieldId || f.id === fieldId);

                if (!field) {
                    console.warn(`Field ${fieldId} not found in document`);
                    continue;
                }

                // Security: Ensure this field belongs to the current user
                if (field.user.toString() !== req.user._id.toString()) {
                    console.warn(`Field ${fieldId} does not belong to user ${req.user._id}`);
                    continue;
                }

                // Skip already signed fields
                const isAlreadySigned = document.signatures.some(sig => sig.fieldId === fieldId);
                if (isAlreadySigned) continue;

                // Process signature image (base64 → buffer → embed)
                const actualDataUrl = typeof signatureData === 'string' ? signatureData : signatureData.dataUrl;
                const base64Data = actualDataUrl.split(',')[1];
                const signatureImageBytes = Buffer.from(base64Data, 'base64');
                const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

                // Target page (1-indexed from field, 0-indexed for pdf-lib)
                const pageIndex = (field.page || 1) - 1;
                const targetPage = pages[pageIndex];

                if (targetPage) {
                    const { height } = targetPage.getSize();
                    const pdfWidth = targetPage.getWidth();
                    const scale = pdfWidth / 800; // 800px is the canvas width in PrepareDocument.jsx

                    targetPage.drawImage(signatureImage, {
                        x: field.x * scale,
                        y: height - (field.y * scale) - (field.height * scale),
                        width: field.width * scale,
                        height: field.height * scale,
                    });

                    // Record the signature in DB
                    document.signatures.push({
                        user: req.user._id,
                        fieldId: fieldId,
                        signatureData: typeof signatureData === 'string' ? signatureData : signatureData.dataUrl,
                        color: typeof signatureData === 'object' ? signatureData.color : (signatureData.color || '#000000'),
                        ipAddress: ipAddress,
                        browser: browser,
                        os: os,
                        signedAt: new Date()
                    });
                }
            }

            // Save the modified PDF back to disk
            const pdfBytes = await pdfDoc.save();
            await fsp.writeFile(document.filePath, pdfBytes);
            console.log('PDF synthesis complete');
        }
        catch (pdfError) {
            console.error('PDF Synthesis Error:', pdfError.message);
        }

        // Update document status based on signature completion
        if (document.signatures.length === document.fields.length) {
            document.status = 'signed';
        }
        else {
            document.status = 'partially_signed';
        }

        // Mark sign token as used if it was a token-based sign
        const signToken = req.headers['x-sign-token'];
        if (signToken) {
            const hashedToken = crypto.createHash('sha256').update(signToken).digest('hex');
            const tokenEntry = document.signTokens.find(entry => entry.token === hashedToken);
            if (tokenEntry) {
                tokenEntry.isUsed = true;
            }
        }

        await document.save();
        console.log('Document signed and saved successfully');

        const populatedDoc = await Document.findById(document._id)
            .populate('uploadedBy', 'name email role')
            .populate('assignedTo', 'name email role isInvited')
            .populate('fields.user', 'name email role')
            .populate('signatures.user', 'name email role');

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Document signed successfully',
            data: [{ document: populatedDoc }]
        });

        // Audit Log
        await createAuditLog({
            user: req.user,
            action: 'DOCUMENT_SIGNED',
            details: `Document "${document.title}" signed`,
            targetType: 'document',
            targetId: document._id,
            req
        });

        // Email & Real-time progress notification to all participants
        try {
            const populatedDoc = await Document.findById(document._id)
                .populate('uploadedBy', 'name email')
                .populate('assignedTo', 'name email')
                .populate('fields.user', 'name email')
                .populate('signatures.user', 'name email');

            const allParticipants = [populatedDoc.uploadedBy, ...(populatedDoc.assignedTo || [])];
            
            // Extract unique IDs of users who have signed
            const signedUserIds = [...new Set(populatedDoc.signatures.map(s => {
                return s.user && s.user._id ? s.user._id.toString() : s.user.toString();
            }))];

            const unsignedUsers = populatedDoc.assignedTo.filter(u => !signedUserIds.includes(u._id.toString()));
            const unsignedNames = unsignedUsers.map(u => u.name);

            // Deduplicate participants to avoid sending multiple identical emails/notifications to the same user
            const participantMap = new Map();
            allParticipants.forEach(p => {
                if (p && p._id) {
                    participantMap.set(p._id.toString(), p);
                }
            });
            const uniqueParticipants = Array.from(participantMap.values());

            if (populatedDoc.status === 'signed') {
                // Send "Completed" email & notification to everyone
                uniqueParticipants.forEach(p => {
                    sendEmail(
                        p.email,
                        `Document Completed: ${populatedDoc.title}`,
                        templates.documentCompleted(populatedDoc.title)
                    );

                    sendNotification(p._id, {
                        type: 'DOCUMENT_COMPLETED',
                        title: 'Document Completed',
                        message: `Great news! All participants have signed: ${populatedDoc.title}`,
                        metadata: { documentId: populatedDoc._id }
                    });
                });
            }
            else {
                // Send progress update email & notification to everyone
                const totalSigners = populatedDoc.assignedTo.length;
                const signedCount = signedUserIds.length;
                
                const subject = `Update: ${signedCount}/${totalSigners} people have signed`;
                
                uniqueParticipants.forEach(p => {
                    sendEmail(
                        p.email,
                        subject,
                        templates.signatureProgress(
                            populatedDoc.title,
                            signedCount,
                            totalSigners,
                            unsignedNames.length > 0 ? unsignedNames : ['Wait, finalizing...'],
                            req.user.name, // The user who just signed
                            populatedDoc._id // The document ID for direct link
                        )
                    );

                    sendNotification(p._id, {
                        type: 'DOCUMENT_SIGNED',
                        title: 'Signature Update',
                        message: `${req.user.name} has signed the document. Progress: ${signedCount}/${totalSigners} signed.`,
                        metadata: { documentId: populatedDoc._id }
                    });
                });
            }
        }
        catch (emailErr) {
            console.error('Progress Notification Error:', emailErr.message);
        }
    }
    catch (error) {
        console.error('Sign Document Error:', error.message);
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: error.message
        });
    }
};

module.exports = {
    updateDocumentFields,
    signDocument
};
