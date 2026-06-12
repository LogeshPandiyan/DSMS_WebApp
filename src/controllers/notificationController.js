const Notification = require('../models/notificationModel');

// Fetch user's notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50); // Optional: limit to 50 recent notifications
        res.status(200).json({
            success: true,
            status_code: 200,
            message: "Notifications fetched successfully",
            data: notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false, 
            status_code: 500,
            message: "Error fetching notifications", error: error.message
        });
    }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({
            success: true,
            status_code: 200,
            message: "All notifications marked as read",

        });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({
            success: false,   
            status_code: 500,
            message: "Error marking notifications as read", error: error.message
        });
    }
};

// Delete all notifications (Clear All)
exports.deleteAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user._id });
        res.status(200).json({
            success: true,
            status_code: 200,
            message: "All notifications cleared",

        });
    } catch (error) {
        console.error('Error clearing notifications:', error);
        res.status(500).json({
            success: false,
            status_code: 500,
            message: "Error clearing notifications", error: error.message
        });
    }
};
