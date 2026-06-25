import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import ConfirmationModal from './ConfirmationModal';
import DashboardSkeleton from './DashboardSkeleton';
import { logout } from '../services/authService';
import { getUserProfile } from '../services/dashboardService';
import { getUserLocal, removeUserLocal } from '../utils/authUtils';
import { toast } from 'sonner';
import { SocketProvider, useSocket } from '../context/SocketContext';
import NotificationSidebar from './NotificationSidebar'; // Added

const MainLayoutContent = ({ user, setUser, onLogoutClick, isSidebarCollapsed, setIsSidebarCollapsed }) => {
    const { notifications, unreadCount, markAllAsRead, clearAll, markAsRead } = useSocket();
    const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] = useState(false);

    return (
        <div className="h-screen overflow-hidden bg-white dark:bg-slate-950 flex transition-colors duration-300">
            {/* Modular Sidebar - Stays mounted during navigation */}
            <Sidebar 
                user={user} 
                onLogout={onLogoutClick} 
                className="h-full" 
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* Notification Sidebar */}
            <NotificationSidebar 
                isOpen={isNotificationSidebarOpen} 
                onClose={() => setIsNotificationSidebarOpen(false)}
                notifications={notifications}
                onMarkAllAsRead={markAllAsRead}
                onClearAll={clearAll}
                onMarkAsRead={markAsRead}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300">
                {/* Modular Header - Stays mounted during navigation */}
                <Header 
                    user={user} 
                    onLogout={onLogoutClick} 
                    onNotificationClick={() => setIsNotificationSidebarOpen(true)}
                    unreadCount={unreadCount}
                />

                <main className="flex-1 overflow-y-auto p-[10px]">
                    {/* Child routes (Dashboard, Users, etc.) render here */}
                    <Outlet context={{ user, setUser }} />
                </main>
            </div>
        </div>
    );
};

const MainLayout = () => {
    const [user, setUser] = useState(getUserLocal());
    const [loading, setLoading] = useState(true);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        return localStorage.getItem('sidebarCollapsed') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
    }, [isSidebarCollapsed]);

    const navigate = useNavigate();

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const token = query.get('token');
        const email = query.get('email');

        if (token && email) {
            const localUser = getUserLocal();
            if (localUser && localUser.email?.trim().toLowerCase() === email.trim().toLowerCase()) {
                // Already logged in with matching email. Keep their session!
                const fetchProfile = async () => {
                    try {
                        const data = await getUserProfile();
                        setUser(data.data);
                    } catch {
                        setUser(localUser);
                    } finally {
                        setLoading(false);
                    }
                };
                fetchProfile();
                return;
            }

            const defaultName = email.split('@')[0];
            const capitalizedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
            setUser({
                name: capitalizedName,
                email: email,
                role: 'user',
                isGuestSigner: true
            });
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const data = await getUserProfile();
                setUser(data.data);
            } catch {
                const localUser = getUserLocal();
                if (localUser) {
                    setUser(localUser);
                } else {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            removeUserLocal();
            toast.info('Logged out successfully');
            navigate('/login');
        } catch {
            removeUserLocal();
            navigate('/login');
        }
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <SocketProvider user={user}>
            <MainLayoutContent 
                user={user} 
                setUser={setUser}
                onLogoutClick={() => setIsLogoutModalOpen(true)} 
                isSidebarCollapsed={isSidebarCollapsed}
                setIsSidebarCollapsed={setIsSidebarCollapsed}
            />

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                title="Confirm Logout"
                message="Are you sure you want to log out of your account? Any unsaved changes might be lost."
                confirmText="Logout"
                icon={AlertTriangle}
            />
        </SocketProvider>
    );
};




export default MainLayout;
