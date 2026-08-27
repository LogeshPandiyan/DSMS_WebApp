import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { getNotifications, markNotificationsAsRead, clearAllNotifications, markNotificationAsRead } from '../services/dashboardService';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, user }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch saved notifications from DB on mount
    useEffect(() => {
        if (user && user._id) {
            const fetchSavedNotifications = async () => {
                try {
                    const response = await getNotifications();
                    // response is { success, status_code, message, data }
                    const notificationList = response?.data || [];
                    const mapped = notificationList.map(n => ({
                        id: n._id,
                        title: n.title,
                        message: n.message,
                        type: n.type,
                        read: n.read,
                        time: n.createdAt,
                        metadata: n.metadata
                    }));
                    setNotifications(mapped);
                    setUnreadCount(mapped.filter(n => !n.read).length);
                } catch {
                    // Silent fail - notifications just won't load
                }
            };
            fetchSavedNotifications();
        }
    }, [user]);

    useEffect(() => {
        if (user && user._id) {
            // Dynamically derive socket URL from API URL if VITE_SOCKET_URL is not defined                          
            let socketUrl = import.meta.env.VITE_SOCKET_URL;
            if (!socketUrl && import.meta.env.VITE_API_URL) {
                socketUrl = import.meta.env.VITE_API_URL.split('/api')[0];
            }
            if (!socketUrl) {
                socketUrl = 'http://localhost:5000';
            }

            const socketInstance = io(socketUrl, {
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
                    id: data.id || Date.now(),
                    read: false,
                    time: data.time || new Date()
                };

                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);

                // Show real-time toast notification
                if (data.type !== 'DOCUMENT_SIGNED' && data.type !== 'DOCUMENT_ASSIGNED') {
                    toast.success(data.title, {
                        description: data.message,
                        duration: 5000,
                    });
                }
            });

            setSocket(socketInstance);

            return () => {
                socketInstance.disconnect();
            };
        }
    }, [user]);

    const markAllAsRead = async () => {
        try {
            await markNotificationsAsRead();
        } catch {
            // Silent fail
        }
        // Update local state regardless
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const clearAll = async () => {
        try {
            await clearAllNotifications();
        } catch {
            // Silent fail
        }
        // Clear local state
        setNotifications([]);
        setUnreadCount(0);
    };

    const markAsRead = async (id) => {
        setNotifications(prev => {
            const wasUnread = prev.find(n => n.id === id && !n.read);
            if (wasUnread) {
                setUnreadCount(c => Math.max(0, c - 1));
            }
            return prev.map(n => n.id === id ? { ...n, read: true } : n);
        });
        try {
            await markNotificationAsRead(id);
        } catch {
            // Silent fail
        }
    };

    return (
        <SocketContext.Provider value={{ socket, notifications, unreadCount, markAllAsRead, clearAll, markAsRead }}>
            {children}
        </SocketContext.Provider>
    );
};

