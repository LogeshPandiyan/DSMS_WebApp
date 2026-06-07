import React from 'react';
import { Bell, Loader2, Save } from 'lucide-react';

const NotificationsTab = ({ notifications, setNotifications, updateNotifications, loading }) => {
    return (
        <div className="space-y-10 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-1">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                     <div className="h-8 w-8 rounded-[5px] bg-amber-500/10 flex items-center justify-center">
                        <Bell className="h-4 w-4 text-amber-600" />
                    </div>
                    Notifications
                </h3>
                <p className="text-sm text-slate-500 font-medium">Configure how and when you receive updates about your documents.</p>
            </div>

            <div className="grid gap-4">
                {[
                    { id: 'email', title: 'Email notifications', desc: 'Receive daily summary and activity alerts.' },
                    { id: 'push', title: 'Push notifications', desc: 'Get instant alerts in your browser/app.' },
                    { id: 'documentRequest', title: 'Document requests', desc: 'When someone asks you to sign a document.' },
                    { id: 'documentCompleted', title: 'Document completion', desc: 'When all parties have finished signing.' },
                ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] shadow-sm hover:border-slate-300 transition-colors">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                        <button
                            onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                            className={`relative w-14 h-7 rounded-full transition-all duration-300 ${notifications[item.id] ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${notifications[item.id] ? 'left-8' : 'left-1'}`}></div>
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={updateNotifications}
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-500 text-white px-10 py-4 rounded-[5px] text-[12px] font-medium tracking-wide flex items-center gap-2 shadow-lg shadow-primary-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save preferences
            </button>
        </div>
    );
};

export default NotificationsTab;
