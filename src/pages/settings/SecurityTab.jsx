import React from 'react';
import { Shield, Loader2, Key } from 'lucide-react';

const SecurityTab = ({ passwords, setPasswords, handlePasswordUpdate, loading }) => {
    return (
        <div className="space-y-10 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-1">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                     <div className="h-8 w-8 rounded-[5px] bg-blue-500/10 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-blue-600" />
                    </div>
                    Security & access
                </h3>
                <p className="text-sm text-slate-500 font-medium">Protect your account and e-signature credentials.</p>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-8">
                <div className="grid gap-6">
                    {[
                        { id: 'current', label: 'Current password', value: passwords.current, field: 'current' },
                        { id: 'new', label: 'New strong password', value: passwords.new, field: 'new' },
                        { id: 'confirm', label: 'Confirm password', value: passwords.confirm, field: 'confirm' },
                    ].map((input) => (
                        <div key={input.id} className="space-y-2">
                            <label className="text-[11px] font-medium tracking-widest text-slate-400 ml-1">{input.label}</label>
                            <input
                                type="password"
                                required
                                value={input.value}
                                onChange={(e) => setPasswords({...passwords, [input.field]: e.target.value})}
                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[5px] text-sm font-medium focus:border-slate-400 dark:focus:border-slate-600 outline-none transition-all shadow-sm"
                            />
                        </div>
                    ))}
                </div>
                <button
                    disabled={loading}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-[5px] text-[12px] font-medium tracking-wide flex items-center gap-2 shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                    Update password
                </button>
            </form>
        </div>
    );
};

export default SecurityTab;
