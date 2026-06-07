import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, user }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user && user._id) {
            const socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
                withCredentials: true
            });

            socketInstance.on('connect', () => {
                console.log('Connected to socket server');
                socketInstance.emit('join', user._id);
            });

            socketInstance.on('notification', (data) => {
                console.log('Received notification:', data);
                
                const newNotification = {
                    ...data,
                    id: Date.now(),
                    read: false,
                    time: new Date()
                };

                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);

                // Show real-time toast notification
                toast.success(data.title, {
                    description: data.message,
                    duration: 5000,
                });
            });

            setSocket(socketInstance);

            return () => {
                socketInstance.disconnect();
            };
        }
    }, [user]);

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    return (
        <SocketContext.Provider value={{ socket, notifications, unreadCount, markAllAsRead }}>
            {children}
        </SocketContext.Provider>
    );
};

