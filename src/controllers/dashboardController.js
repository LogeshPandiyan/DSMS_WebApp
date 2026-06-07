const User = require('../models/userModel');
const Document = require('../models/documentModel');
const Log = require('../models/logModel');

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                success: true,
                statusCode: 200,
                message: 'User details fetched successfully.',
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    signature: user.signature,
                    avatar: user.avatar,
                    notificationSettings: user.notificationSettings
                }
            });
        } 
        else {
            res.status(404).json({ 
                success: false, 
                statusCode: 404, 
                message: 'User not found' 
            });
        }
    } 
    catch (error) {
        res.status(500).json({ 
            success: false, 
            statusCode: 500, 
            message: error.message 
        });
    }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin' || req.user.role === 'manager';
        const userId = req.user._id;

        // Basic Stats
        const totalDocs = isAdmin ? await Document.countDocuments() : await Document.countDocuments({ 
            assignedTo: userId 
        });
        const pendingDocs = isAdmin ? await Document.countDocuments({ status: 'pending' }) : await Document.countDocuments({ 
            assignedTo: userId, 
            status: { $in: ['pending', 'partially_signed'] } 
        });
        const signedDocs = isAdmin ? await Document.countDocuments({ status: 'signed' }) : await Document.countDocuments({ 
            assignedTo: userId, status: 'signed' 
        });
        const totalUsers = isAdmin ? await User.countDocuments() : 0;

        // Weekly Activity (Sun - Sat) with Pending vs Signed counts
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const activity = await Document.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfWeek },
                    ...(isAdmin ? {} : { assignedTo: userId })
                }
            },
            {
                $group: {
                    _id: { 
                        day: { $dayOfWeek: "$createdAt" },
                        status: "$status"
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        const weeklyActivity = Array.from({ length: 7 }, () => ({ pending: 0, signed: 0 }));
        activity.forEach(item => {
            const dayIdx = item._id.day - 1;
            const status = item._id.status;

            if (status === 'signed') {
                weeklyActivity[dayIdx].signed += item.count;
            } 
            else {
                weeklyActivity[dayIdx].pending += item.count;
            }
        });

        // Today's specific counts
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const uploadedToday = await Log.countDocuments({
            action: 'DOCUMENT_UPLOADED',
            createdAt: { $gte: startOfToday },
            ...(isAdmin ? {} : { user: userId })
        });

        const signedToday = await Log.countDocuments({
            action: 'DOCUMENT_SIGNED',
            createdAt: { $gte: startOfToday },
            ...(isAdmin ? {} : { user: userId })
        });

        // Last relevant action time
        const lastAction = await Log.findOne({
            user: userId,
            action: { $in: ['LOGIN', 'DOCUMENT_UPLOADED', 'DOCUMENT_SIGNED'] }
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            statusCode: 200,
            data: {
                totalDocuments: totalDocs,
                pendingDocuments: pendingDocs,
                signedDocuments: signedDocs,
                totalUsers: totalUsers,
                securityScore: 98,
                weeklyActivity,
                todayCounts: {
                    uploaded: uploadedToday,
                    signed: signedToday
                },
                lastActionTime: lastAction ? lastAction.createdAt : null
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            statusCode: 500, 
            message: error.message || 'Internal Server Error.'
        });
    }
};

module.exports = { getUserProfile, getDashboardStats };

