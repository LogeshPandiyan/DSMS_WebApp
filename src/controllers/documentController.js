const Document = require('../models/documentModel');
const User = require('../models/userModel');
const path = require('path');
const fs = require('fs');
const { createAuditLog } = require('../utils/auditLogger');

// @desc    Upload a new document
// @route   POST /api/documents/upload
// @access  Private (Admin/Manager)
const uploadDocument = async (req, res) => {
    try {
        const { title, assignedTo, customEmails } = req.body;

        // 1. Validate title
        if (!title || !title.trim()) {
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'Document name is required'
            });
        }

        // 2. Validate file presence
        if (!req.file) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'Document attachment is required'
            });
        }

        // Parse assignedTo
        let assignedToArray = [];
        if (assignedTo) {
            assignedToArray = Array.isArray(assignedTo)
                ? assignedTo
                : assignedTo.split(',').map(id => id.trim()).filter(Boolean);
        }

        // Parse customEmails
        let emailList = [];
        if (customEmails) {
            emailList = customEmails.split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
        }

        // 3. Validate at least one recipient
        if (assignedToArray.length === 0 && emailList.length === 0) {
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'At least one recipient is required'
            });
        }

        // Process customEmails if provided
        if (emailList.length > 0) {
            for (const email of emailList) {
                let user = await User.findOne({ email });
                if (!user) {
                    const defaultName = email.split('@')[0];
                    const capitalizedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
                    user = await User.create({
                        name: capitalizedName,
                        email,
                        role: 'user',
                        isInvited: true, // Bypass password validation
                        isActive: true
                    });
                }
                const userIdStr = user._id.toString();
                if (!assignedToArray.includes(userIdStr)) {
                    assignedToArray.push(userIdStr);
                }
            }
        }

        const document = await Document.create({
            title,
            fileName: req.file.filename,
            filePath: req.file.path,
            uploadedBy: req.user._id,
            assignedTo: assignedToArray,
            status: 'draft'
        });

        const populatedDoc = await Document.findById(document._id)
            .populate('uploadedBy', 'name email role')
            .populate('assignedTo', 'name email role isInvited');

        res.status(201).json({
            success: true,
            statusCode: 201,
            message: 'Document uploaded as draft.',
            data: populatedDoc
        });

        // Audit Log
        await createAuditLog({
            user: req.user,
            action: 'DOCUMENT_UPLOADED',
            details: `Document "${title}" uploaded as draft`,
            targetType: 'document',
            targetId: document._id,
            req
        });
    }
    catch (error) {
        console.error('Upload Error:', error.message);
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'An internal error occurred while processing the document upload.',
            error: error.message
        });
    }
};

// @desc    Get document counts by status
// @route   GET /api/documents/get-counts
// @access  Private
const getDocumentCounts = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'user') {
            query = { assignedTo: req.user._id };
        }

        const counts = {
            all: 0,
            pending: 0,
            signed: 0,
            wfo: 0,
            draft: 0
        };

        if (req.user.role === 'admin' || req.user.role === 'manager') {
            counts.all = await Document.countDocuments({});
            counts.pending = await Document.countDocuments({ status: 'pending' });
            counts.signed = await Document.countDocuments({ status: 'signed' });
            counts.wfo = await Document.countDocuments({ status: 'partially_signed' });
            counts.draft = await Document.countDocuments({ status: 'draft' });
        }
        else {
            counts.all = await Document.countDocuments({ ...query, status: { $ne: 'draft' } });
            counts.pending = await Document.countDocuments({ ...query, status: 'pending' });
            counts.signed = await Document.countDocuments({ ...query, status: 'signed' });
            counts.wfo = await Document.countDocuments({ ...query, status: 'partially_signed' });
            counts.draft = 0; // Users can't see drafts
        }

        res.status(200).json({
            success: true,
            statusCode: 200,
            data: counts
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: error.message
        });
    }
};

// @desc    Get documents by role (with pagination, search, status filter)
// @route   GET /api/documents/get-all
// @access  Private
const getDocuments = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 10 } = req.query;
        let query = {};

        const userRole = req.user.role?.toLowerCase();

        // Role-based filtering
        if (userRole === 'admin' || userRole === 'manager') {
            query = {}; // Admin/Manager sees all
        }
        else if (userRole === 'user') {
            query = { assignedTo: req.user._id, status: { $ne: 'draft' } };
        }

        // Status filtering
        if (status && status !== 'all') {
            query.status = status === 'wfo' ? 'partially_signed' : status;
        }

        // Multi-field search logic (Title, Sender, Recipient, Status)
        if (search) {
            // Find users whose names match the search term
            const matchingUsers = await User.find({
                name: { $regex: search, $options: 'i' }
            }).select('_id');
            const userIds = matchingUsers.map(u => u._id);

            // Build OR query
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { uploadedBy: { $in: userIds } },
                { assignedTo: { $in: userIds } },
                { status: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        // Base query for status counts
        let countBaseQuery = {};
        if (userRole === 'user') {
            countBaseQuery = { assignedTo: req.user._id };
        }

        // Apply search filter to counts as well
        if (query.$or) {
            countBaseQuery.$or = query.$or;
        }

        // Fetch main data and all status counts in parallel
        const [totalDocuments, documents, allCount, pendingCount, signedCount, wfoCount, draftCount] = await Promise.all([
            Document.countDocuments(query),
            Document.find(query)
                .populate('uploadedBy', 'name email role')
                .populate('assignedTo', 'name email role isInvited')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            userRole === 'admin' || userRole === 'manager'
                ? Document.countDocuments(query.$or ? { $or: query.$or } : {})
                : Document.countDocuments({ ...countBaseQuery, status: { $ne: 'draft' } }),
            Document.countDocuments({ ...countBaseQuery, status: 'pending' }),
            Document.countDocuments({ ...countBaseQuery, status: 'signed' }),
            Document.countDocuments({ ...countBaseQuery, status: 'partially_signed' }),
            userRole === 'admin' || userRole === 'manager'
                ? Document.countDocuments({ ...countBaseQuery, status: 'draft' })
                : Promise.resolve(0)
        ]);

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Documents and counts retrieved successfully.',
            pagination: {
                totalDocuments,
                totalPages: Math.ceil(totalDocuments / limit),
                currentPage: Number(page),
                limit: Number(limit)
            },
            data: documents,
            counts: {
                all: allCount,
                pending: pendingCount,
                signed: signedCount,
                wfo: wfoCount,
                draft: draftCount
            }
        });
    }
    catch (error) {
        console.error('Fetch Documents Error:', error.message);
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Could not fetch documents.',
            error: error.message
        });
    }
};

// @desc    Get single document by ID
// @route   GET /api/documents/get-details/:id
// @access  Private
const getDocumentById = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id)
            .populate('uploadedBy', 'name email role')
            .populate('assignedTo', 'name email role isInvited')
            .populate('fields.user', 'name email role')
            .populate('signatures.user', 'name email role');

        if (!document) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: 'The requested document could not be found.'
            });
        }

        // Authorization check — admin, uploader, or assigned user
        const isAssigned = Array.isArray(document.assignedTo)
            ? document.assignedTo.some(a => a._id.toString() === req.user._id.toString())
            : document.assignedTo?._id?.toString() === req.user._id.toString();

        if (
            req.user.role !== 'admin' &&
            document.uploadedBy._id.toString() !== req.user._id.toString() &&
            !isAssigned
        ) {
            return res.status(403).json({
                success: false,
                statusCode: 403,
                message: 'Access Denied: You do not have permission to view this document.'
            });
        }

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Document details retrieved successfully.',
            data: document
        });
    }
    catch (error) {
        console.error('Fetch Document Details Error:', error.message);
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'An error occurred while fetching the document details.',
            error: error.message
        });
    }
};

// @desc    Update document metadata (title, assignedTo, status)
// @route   PUT /api/documents/update/:id
// @access  Private (Admin/Manager)
const updateDocument = async (req, res) => {
    try {
        const { title, assignedTo, status } = req.body;
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        // Check permission (Creator or Admin)
        if (req.user.role !== 'admin' && document.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (title) document.title = title;
        if (assignedTo) document.assignedTo = assignedTo;
        if (status) document.status = status;

        await document.save();

        res.status(200).json({
            success: true,
            message: 'Document updated successfully',
            data: document
        });

        // Audit Log
        await createAuditLog({
            user: req.user,
            action: 'DOCUMENT_UPDATED',
            details: `Document metadata updated for "${document.title}"`,
            targetType: 'document',
            targetId: document._id,
            req
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete document (removes file from disk too)
// @route   DELETE /api/documents/delete/:id
// @access  Private (Admin/Manager)
const deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: 'Document not found'
            });
        }

        // Check permission (Creator or Admin)
        if (req.user.role !== 'admin' && document.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                statusCode: 403,
                message: 'Not authorized'
            });
        }

        // Delete the physical file from disk
        if (fs.existsSync(document.filePath)) {
            fs.unlinkSync(document.filePath);
        }

        await Document.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Document deleted successfully',
            data: []
        });

        // Audit Log
        await createAuditLog({
            user: req.user,
            action: 'DOCUMENT_DELETED',
            details: `Document "${document.title}" deleted`,
            targetType: 'document',
            targetId: document._id,
            req
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Internal Server Error'
        });
    }
};

module.exports = {
    uploadDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
    getDocumentCounts
};
