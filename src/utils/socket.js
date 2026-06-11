const Notification = require('../models/notificationModel');
let io;

module.exports = {
    init: (server) => {
        io = require('socket.io')(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:5173',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            socket.on('join', (userId) => {
                socket.join(userId);
                console.log(`User ${userId} joined their room`);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });

        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    },
    sendNotification: async (userId, data) => {
        try {
            // Save to database first
            const notification = await Notification.create({
                recipient: userId,
                title: data.title,
                message: data.message,
                type: data.type || 'GENERAL',
                read: false,
                metadata: data.metadata || {}
            });

            // Emit via socket
            if (io) {
                // Attach the DB _id and createdAt to the emitted data
                const emitData = {
                    ...data,
                    id: notification._id,
                    read: false,
                    time: notification.createdAt
                };
                io.to(userId.toString()).emit('notification', emitData);
            }
        } catch (error) {
            console.error('Error saving/sending notification:', error);
        }
    }
};
