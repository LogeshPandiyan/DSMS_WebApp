const Log = require('../models/logModel');

/**
 * Creates an audit log entry
 * @param {Object} params
 * @param {string} params.user - User ID or object
 * @param {string} params.action - Action name (e.g., 'LOGIN')
 * @param {string} params.details - Description of the action
 * @param {string} params.targetType - Type of target (document, user, etc.)
 * @param {string} params.targetId - ID of the target
 * @param {Object} params.req - Express request object for IP and User Agent
 */
const createAuditLog = async ({ user, action, details, targetType, targetId, req }) => {
    try {
        const log = new Log({
            user: user._id || user,
            action,
            details,
            targetType,
            targetId,
            ipAddress: req?.ip || req?.headers['x-forwarded-for'] || '0.0.0.0',
            userAgent: req?.headers['user-agent'] || 'Unknown'
        });
        await log.save();
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
};

module.exports = { createAuditLog };
