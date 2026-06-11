import React, { useState } from 'react';
import { Shield, Loader2, Key, Eye, EyeOff } from 'lucide-react';

const SecurityTab = ({ passwords, setPasswords, handlePasswordUpdate, loading }) => {
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };
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
                            <div className="relative">
                                <input
                                    type={showPassword[input.field] ? "text" : "password"}
                                    required
                                    value={input.value}
                                    onChange={(e) => setPasswords({...passwords, [input.field]: e.target.value})}
                                    className="w-full pl-5 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[5px] text-sm font-medium focus:border-slate-400 dark:focus:border-slate-600 outline-none transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(input.field)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    {showPassword[input.field] ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    disabled={loading}
                    className="bg-primary-600 hover:bg-primary-500 text-white px-10 py-4 rounded-[5px] text-[12px] font-medium tracking-wide flex items-center gap-2 shadow-lg shadow-primary-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                    Update password
                </button>
            </form>
        </div>
    );
};

export default SecurityTab;
