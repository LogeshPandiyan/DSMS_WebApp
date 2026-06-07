import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, LogOut, ChevronDown, Shield, Settings } from 'lucide-react';

const UserDropdown = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative z-50" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center rounded-full outline-none"
            >
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold border border-white/10 overflow-hidden shadow-sm">
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                        user?.name?.charAt(0) || 'U'
                    )}
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[5px] shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Top Triangle Arrow Pointer */}
                    <div className="absolute right-[14px] -top-[6px] w-3 h-3 rotate-45 bg-slate-50 dark:bg-[#151d30] border-t border-l border-slate-200 dark:border-white/5 z-0"></div>
                    
                    <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 rounded-t-[5px] relative z-10">
                        <p className="text-[12px] text-slate-500 font-bold mb-4">My Account</p>
                        
                        <div className="space-y-4">
                            {/* Name */}
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Name</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {user?.name}
                                    {/* <span className="text-[10px] text-primary-500 font-medium lowercase">(you)</span> */}
                                </p>
                            </div>

                            {/* Email */}
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Email</p>
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                                    {user?.email}
                                </p>
                            </div>

                            {/* Role */}
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Role</p>
                                <span className={`inline-flex px-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                    user?.role?.toLowerCase() === 'admin' ? 
                                    'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' : 
                                    user?.role?.toLowerCase() === 'manager' ? 
                                    'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' : 
                                    'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                                }`}>
                                    {user?.role || 'User'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-[5px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-600 dark:hover:text-white transition-all text-sm font-medium">
                            <Shield className="h-4 w-4 text-primary-500" />
                            Security Settings
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-[5px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-600 dark:hover:text-white transition-all text-sm font-medium">
                            <Settings className="h-4 w-4 text-slate-500" />
                            Account Preferences
                        </button>
                    </div>

                    <div className="p-2 border-t border-slate-100 dark:border-white/5">
                        <button 
                            onClick={() => {
                                setIsOpen(false);
                                onLogout();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-[5px] text-red-400 hover:bg-red-500/10 transition-all text-sm font-bold"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
