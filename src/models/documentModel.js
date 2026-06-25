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
            ipAddress: String,
            browser: String,
            os: String,
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
        },
        signTokens: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'authUserManagement'
            },
            token: String, // Hashed token (sha256)
            isUsed: { type: Boolean, default: false },
            expiresAt: Date
        }]
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret, options) {
                // Document root
                ret.documentId = ret._id ? ret._id.toString() : undefined;
                ret.documentTitle = ret.title;
                delete ret._id;
                delete ret.title;
                delete ret.id;

                // uploadedBy
                if (ret.uploadedBy) {
                    if (typeof ret.uploadedBy === 'object') {
                        ret.uploadedBy = {
                            userId: ret.uploadedBy._id ? ret.uploadedBy._id.toString() : undefined,
                            userName: ret.uploadedBy.name,
                            email: ret.uploadedBy.email,
                            role: ret.uploadedBy.role
                        };
                    } else {
                        ret.uploadedBy = { userId: ret.uploadedBy.toString() };
                    }
                }

                // assignedTo
                if (ret.assignedTo && Array.isArray(ret.assignedTo)) {
                    ret.assignedTo = ret.assignedTo.map(item => {
                        if (item && typeof item === 'object') {
                            return {
                                userId: item._id ? item._id.toString() : undefined,
                                userName: item.name,
                                email: item.email,
                                role: item.role,
                                isInvited: item.isInvited
                            };
                        }
                        return item;
                    });
                }

                // signatures
                if (ret.signatures && Array.isArray(ret.signatures)) {
                    ret.signatures = ret.signatures.map(item => {
                        if (item && typeof item === 'object') {
                            let userId, userName, email;
                            const isPopulated = item.user && typeof item.user === 'object' && (item.user.name || item.user.email);
                            if (isPopulated) {
                                userId = item.user._id ? item.user._id.toString() : undefined;
                                userName = item.user.name;
                                email = item.user.email;
                            } else if (item.user) {
                                const userStr = item.user.toString();
                                userId = userStr;
                                const matchedAssignee = ret.assignedTo?.find(a => (a.userId || a._id || a).toString() === userStr);
                                userName = matchedAssignee?.userName || matchedAssignee?.name || 'Guest Signer';
                                email = matchedAssignee?.email || '';
                            }

                            const newItem = {
                                userId,
                                userName,
                                email,
                                signatureId: item._id ? item._id.toString() : undefined,
                                fieldId: item.fieldId,
                                signatureData: item.signatureData,
                                color: item.color,
                                ipAddress: item.ipAddress,
                                browser: item.browser,
                                os: item.os,
                                signedAt: item.signedAt
                            };

                            return newItem;
                        }
                        return item;
                    });
                }

                // fields
                if (ret.fields && Array.isArray(ret.fields)) {
                    ret.fields = ret.fields.map(item => {
                        if (item && typeof item === 'object') {
                            let userId, userName, email;
                            const isPopulated = item.user && typeof item.user === 'object' && (item.user.name || item.user.email);
                            if (isPopulated) {
                                userId = item.user._id ? item.user._id.toString() : undefined;
                                userName = item.user.name;
                                email = item.user.email;
                            } else if (item.user) {
                                const userStr = item.user.toString();
                                userId = userStr;
                                const matchedAssignee = ret.assignedTo?.find(a => (a.userId || a._id || a).toString() === userStr);
                                userName = matchedAssignee?.userName || matchedAssignee?.name || 'Guest Signer';
                                email = matchedAssignee?.email || '';
                            }

                            const newItem = {
                                userId,
                                userName,
                                email,
                                fieldId: item._id ? item._id.toString() : undefined,
                                type: item.type,
                                page: item.page,
                                x: item.x,
                                y: item.y,
                                width: item.width,
                                height: item.height
                            };

                            return newItem;
                        }
                        return item;
                    });
                }

                // signTokens
                if (ret.signTokens && Array.isArray(ret.signTokens)) {
                    ret.signTokens = ret.signTokens.map(item => {
                        if (item && typeof item === 'object') {
                            let userId, userName, email;
                            const isPopulated = item.user && typeof item.user === 'object' && (item.user.name || item.user.email);
                            if (isPopulated) {
                                userId = item.user._id ? item.user._id.toString() : undefined;
                                userName = item.user.name;
                                email = item.user.email;
                            } else if (item.user) {
                                const userStr = item.user.toString();
                                userId = userStr;
                                const matchedAssignee = ret.assignedTo?.find(a => (a.userId || a._id || a).toString() === userStr);
                                userName = matchedAssignee?.userName || matchedAssignee?.name || 'Guest Signer';
                                email = matchedAssignee?.email || '';
                            }

                            const newItem = {
                                userId,
                                userName,
                                email,
                                signTokenId: item._id ? item._id.toString() : undefined,
                                token: item.token,
                                isUsed: item.isUsed,
                                expiresAt: item.expiresAt,
                                documentId: ret.documentId,
                                documentTitle: ret.documentTitle
                            };

                            return newItem;
                        }
                        return item;
                    });
                }

                return ret;
            }
        },
        toObject: { virtuals: true }
    }
);

module.exports = mongoose.model('Document', documentSchema);
