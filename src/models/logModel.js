const mongoose = require('mongoose');
require('./userModel'); // Ensure User model is registered

const logSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'authUserManagement',
        required: true
    },
    action: {
        type: String,
        required: true,
        // Example actions: 'LOGIN', 'LOGOUT', 'DOCUMENT_UPLOADED', 'DOCUMENT_SIGNED', 'DOCUMENT_DELETED', 'USER_CREATED'
    },
    details: {
        type: String
    },
    targetType: {
        type: String,
        enum: ['document', 'user', 'system', 'auth'],
        default: 'system'
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, { timestamps: true });

// Index for faster searching
logSchema.index({ user: 1, createdAt: -1 });
logSchema.index({ action: 1 });

module.exports = mongoose.model('Log', logSchema);
