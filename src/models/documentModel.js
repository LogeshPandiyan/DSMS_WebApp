const mongoose = require('mongoose');

const documentSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Document title is required.'],
            trim: true
        },
        fileName: {
            type: String,
            required: true
        },
        filePath: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'partially_signed', 'signed', 'rejected', 'draft'],
            default: 'pending'
        },
        signatures: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'authUserManagement'
            },
            fieldId: String,
            signatureData: String, // Base64 signature image data
            color: String, // Hex color code
            signedAt: {
                type: Date,
                default: Date.now
            }
        }],
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'authUserManagement' // Matches the model name in userModel.js
        },
        assignedTo: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'authUserManagement'
        }],
        signedAt: {
            type: Date
        },
        signatureImage: {
            type: String // Base64 or path to signature image
        },
        fields: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'authUserManagement'
            },
            type: {
                type: String,
                enum: ['signature'],
                default: 'signature'
            },
            page: { type: Number, default: 1 },
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 },
            width: { type: Number, default: 150 },
            height: { type: Number, default: 70 }
        }],
        emailSettings: {
            replyTo: String,
            cc: String,
            subject: String,
            message: String,
            sendEmail: { type: Boolean, default: true }
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Document', documentSchema);
