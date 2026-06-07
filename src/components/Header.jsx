import { Bell, Sun, Moon, LayoutDashboard, FileText, Upload, Users, Settings, Activity } from 'lucide-react';
import UserDropdown from './UserDropdown';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from 'react-router-dom';

const Header = ({ user, onLogout, onNotificationClick, unreadCount }) => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/dashboard') 
            return { 
                title: 'Dashboard', 
                icon: LayoutDashboard 
            };

        if (path === '/documents') 
            return { 
                title: 'Document List', 
                icon: FileText 
            };

        if (path === '/upload') 
            return { 
                title: 'Upload Document', 
                icon: Upload 
            };

        if (path === '/admin/users') 
            return { 
            title: 'User Management', 
            icon: Users 
            };

        if (path === '/admin/activity') 
            return { 
            title: 'Activity History', 
            icon: Activity 
            };

        if (path === '/settings') 
            return { 
            title: 'Account settings', 
            icon: Settings 
            };

        if (path.startsWith('/prepare')) 
            return { 
            title: 'Prepare Document', 
            icon: FileText 
            };

        if (path.startsWith('/sign')) 
            return { 
            title: 'Sign Document', 
            icon: FileText 
            };
            
        return { 
            title: 'DSMS', 
            icon: FileText 
        };
    };

    const { title, icon: Icon } = getPageTitle();

    return (
        <header className="h-20 border-b border-slate-200 dark:border-white/5 bg-white
         dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8 relative 
         z-50 transition-colors duration-300">

            <div className="flex-1 flex items-center gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">{title}</h1>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="h-10 w-10 rounded-[5px] border border-slate-200 dark:border-white/5 
                    flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-white transition-all bg-white dark:bg-transparent"
                >
                    {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </button>

                <button 
                    onClick={onNotificationClick}
                    className="h-10 w-10 rounded-[5px] border border-slate-200 dark:border-white/5 
                    flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary-600 
                    dark:hover:text-white transition-all relative"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span 
                        className="absolute top-2 right-2 h-4 w-4 bg-red-500 text-white text-[8px] font-black 
                        flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                            {unreadCount}
                        </span>
                    )}
                </button>
                <div className="h-8 w-px bg-slate-200 dark:bg-white/5 mx-2"></div>

                {/* Modern User Dropdown */}
                <UserDropdown 
                    user={user} 
                    onLogout={onLogout} 
                />
            </div>
        </header>
    );
};


export default Header;
