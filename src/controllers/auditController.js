const Log = require('../models/logModel');
const User = require('../models/userModel');

/**
 * @desc    Get all audit logs
 * @route   GET /api/admin/logs
 * @access  Private/Admin
 */
const getAuditLogs = async (req, res) => {
    try {
        const { action, userId, targetType, page = 1, limit = 20 } = req.query;
        const query = {};

        if (action) query.action = action;
        if (userId) query.user = userId;
        if (targetType) query.targetType = targetType;

        const skip = (page - 1) * limit;

        const totalLogs = await Log.countDocuments(query);
        const logs = await Log.find(query)
            .populate('user', 'name email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            pagination: {
                totalLogs,
                totalPages: Math.ceil(totalLogs / limit),
                currentPage: Number(page),
                limit: Number(limit)
            },
            data: logs
        });
    } catch (error) {
        console.error('Fetch Logs Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch audit logs',
            error: error.message 
        });
    }
};

module.exports = { getAuditLogs };
