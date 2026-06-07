import React from 'react';
import { X, Bell, Info, FileText, CheckCircle2 } from 'lucide-react';

const NotificationSidebar = ({ isOpen, onClose, notifications, onMarkAllAsRead }) => {
    
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], 
            {
                 hour: '2-digit', 
                 minute: '2-digit' 
            });
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] transition-opacity duration-300
                ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Sidebar Content */}
            <div className={`fixed right-0 top-0 h-full w-80 md:w-96 bg-white dark:bg-slate-900 shadow-2xl z-[70] 
                transform transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200 dark:border-white/5
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                
                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary-600" />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md transition-colors"
                    >
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-40">
                            <Bell className="h-12 w-12 mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest">No Notifications Yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notif) => (
                                <div 
                                    key={notif.id}
                                    className={`p-4 rounded-[5px] border transition-all hover:scale-[1.02] cursor-default
                                        ${notif.read 
                                            ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5' 
                                            : 'bg-primary-500/5 border-primary-500/20 dark:bg-primary-500/10'}`}
                                >
                                    <div className="flex gap-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 
                                            ${notif.type === 'DOCUMENT_ASSIGNED' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                            {notif.type === 'DOCUMENT_ASSIGNED' ? <FileText className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{notif.title}</p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                                            <p className="text-[9px] text-slate-400 mt-2 font-medium">{formatTime(notif.time)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-transparent">
                        <button 
                            onClick={onMarkAllAsRead}
                            className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 
                            rounded-[5px] text-[12px] font-black text-slate-600 dark:text-slate-400 
                            hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all shadow-sm"
                        >
                            Clear All Notifications
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default NotificationSidebar;
