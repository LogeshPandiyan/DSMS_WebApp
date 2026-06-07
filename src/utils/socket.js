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
    sendNotification: (userId, data) => {
        if (io) {
            io.to(userId.toString()).emit('notification', data);
        }
    }
};
