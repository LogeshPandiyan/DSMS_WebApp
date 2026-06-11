import React, { useState } from 'react';
import { X, Bell, FileText, CheckCircle2, CheckCheck, Trash2 } from 'lucide-react';

const NotificationSidebar = ({ isOpen, onClose, notifications, onMarkAllAsRead, onClearAll }) => {
    const [clearingIds, setClearingIds] = useState(new Set());
    const [isClearing, setIsClearing] = useState(false);

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleClearAll = async () => {
        if (isClearing || notifications.length === 0) return;
        setIsClearing(true);

        // Animate each item out one by one with a stagger
        const ids = notifications.map(n => n.id);
        for (let i = 0; i < ids.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 60));
            setClearingIds(prev => new Set([...prev, ids[i]]));
        }

        // After animations complete, call the actual clear
        await new Promise(resolve => setTimeout(resolve, 400));
        await onClearAll();
        setClearingIds(new Set());
        setIsClearing(false);
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

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary-600" />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h2>
                        {notifications.filter(n => !n.read).length > 0 && (
                            <span className="bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {notifications.filter(n => !n.read).length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md transition-colors"
                    >
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                {/* Notification List */}
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
                                    style={{
                                        transition: 'transform 0.35s ease, opacity 0.35s ease',
                                        transform: clearingIds.has(notif.id) ? 'translateX(120%)' : 'translateX(0)',
                                        opacity: clearingIds.has(notif.id) ? 0 : 1,
                                    }}
                                    className={`p-4 rounded-[5px] border cursor-default
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
                                            <div className="flex items-start justify-between gap-1">
                                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{notif.title}</p>
                                                {!notif.read && (
                                                    <span className="h-2 w-2 rounded-full bg-primary-500 shrink-0 mt-1"></span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                                            <p className="text-[9px] text-slate-400 mt-2 font-medium">{formatTime(notif.time)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Action Buttons */}
                {notifications.length > 0 && (
                    <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-transparent flex gap-2">
                        {/* Read All Button */}
                        <button
                            onClick={onMarkAllAsRead}
                            className="flex-1 py-3 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 
                            rounded-[5px] text-[11px] font-bold text-slate-600 dark:text-slate-400 
                            hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all shadow-sm"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Read All
                        </button>

                        {/* Clear All Button */}
                        <button
                            onClick={handleClearAll}
                            disabled={isClearing}
                            className="flex-1 py-3 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 
                            rounded-[5px] text-[11px] font-bold text-slate-600 dark:text-slate-400 
                            hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm disabled:opacity-50"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Clear All
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default NotificationSidebar;
