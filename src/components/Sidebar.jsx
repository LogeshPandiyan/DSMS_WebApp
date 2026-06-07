import { LogOut, 
    LayoutDashboard, 
    User, 
    Bell, 
    CreditCard, 
    Settings, 
    ShieldCheck, 
    Users, 
    Upload,
    Clock,
    CheckCircle2,
    FileText,
    Activity,
    Edit3,
    ChevronLeft,
    ChevronRight } 
    from 'lucide-react';

import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ user, onLogout, isCollapsed, onToggle, className = '' }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { 
            icon: LayoutDashboard, 
            label: 'Dashboard', 
            path: '/dashboard' 
        },
        { icon: FileText, label: 'Documents', path: '/documents', roles: ['admin', 'manager', 'employee'] },
        { icon: Upload, label: 'Upload', path: '/upload', roles: ['admin', 'manager'] },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const filteredMenu = menuItems.filter(item => 
        !item.roles || item.roles.includes(user?.role?.toLowerCase())
    );

    return (
        <aside className={`hidden lg:flex flex-col ${isCollapsed ? 'w-20' : 'w-64'} h-full border-r border-slate-200 dark:border-white/5 
        bg-white dark:bg-slate-900/50 backdrop-blur-xl transition-all duration-300 ${className} relative`}>
            
            <div className={`h-20 flex items-center border-b border-slate-200 dark:border-white/5 ${isCollapsed ? 'px-4 justify-center' : 'px-6'}`}>
                <button 
                    onClick={onToggle}
                    className="flex items-center gap-3 group transition-all duration-300 w-full"
                >
                    <div className="h-10 w-10 shrink-0 rounded-[5px] bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/20 group-hover:scale-105 transition-transform">
                        <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex items-center justify-between flex-1">
                            <span className="text-xl font-sans font-bold text-slate-900 dark:text-white tracking-tighter animate-in fade-in slide-in-from-left-2 duration-500">
                                DSMS
                            </span>
                            <ChevronLeft className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )}
                </button>
            </div>


            <nav className={`flex-1 ${isCollapsed ? 'px-3' : 'px-4'} py-6 space-y-8 overflow-y-auto custom-scrollbar`}>
                <div className="space-y-2">
                    {filteredMenu.map((item, i) => (
                        <button 
                            key={i} 
                            onClick={() => navigate(item.path)}
                            title={isCollapsed ? item.label : ''}
                            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-[5px] transition-all 
                                ${
                                    location.pathname === item.path || 
                                    (item.path === '/upload' && location.pathname.startsWith('/prepare')) ||
                                    (item.path === '/documents' && location.pathname.startsWith('/sign'))
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary-600 dark:hover:text-white'
                                }
                                `}>
                            <item.icon className="h-5 w-5 shrink-0" />
                            {!isCollapsed && (
                                <span className="font-medium text-sm whitespace-nowrap animate-in slide-in-from-left-2 duration-300">
                                    {item.label}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </nav>
        </aside>
    );
};


export default Sidebar;

