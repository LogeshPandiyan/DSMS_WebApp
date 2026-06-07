const Document = require('../models/documentModel');
const User = require('../models/userModel');
const fsp = require('fs').promises;
const { PDFDocument } = require('pdf-lib');
const { sendEmail, templates } = require('../utils/emailService');
const { createAuditLog } = require('../utils/auditLogger');
const { sendNotification } = require('../utils/socket');

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
        if (document.status === 'draft') {
            document.status = 'pending';
            promoted = true;
        }

        await document.save();

        const populatedDoc = await Document.findById(document._id)
            .populate('uploadedBy', 'name email role')
            .populate('assignedTo', 'name email role')
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
                    documentId: document._id
                });
            });

            // Email notifications
            if (document.emailSettings?.sendEmail !== false) {
                try {
                    const usersToNotify = await User.find({ _id: { $in: assignedToArray } });
                    usersToNotify.forEach(user => {
                        sendEmail(
                            user.email,
                            document.emailSettings?.subject || `Signature Request: ${document.title}`,
                            templates.documentAssigned(user.name, document.title, document._id, document.emailSettings?.message),
                            document.emailSettings?.replyTo,
                            document.emailSettings?.cc
                        );
                    });
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

        await document.save();
        console.log('Document signed and saved successfully');

        const populatedDoc = await Document.findById(document._id)
            .populate('uploadedBy', 'name email role')
            .populate('assignedTo', 'name email role')
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

        // Real-time notification → notify the uploader (Admin/Manager)
        sendNotification(document.uploadedBy, {
            type: 'DOCUMENT_SIGNED',
            title: 'Document Signed',
            message: `${req.user.name} has signed the document: ${document.title}`,
            documentId: document._id
        });

        // Email progress notification to all participants
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

            // Deduplicate participants to avoid sending multiple identical emails to the same user
            const uniqueParticipants = Array.from(new Map(allParticipants.map(p => [p.email, p])).values());

            if (populatedDoc.status === 'signed') {
                // Send "Completed" email to everyone
                uniqueParticipants.forEach(p => {
                    sendEmail(
                        p.email,
                        `Document Completed: ${populatedDoc.title}`,
                        templates.documentCompleted(populatedDoc.title)
                    );
                });
            }
            else {
                // Send progress update to everyone
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
                            req.user.name // The user who just signed
                        )
                    );
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
