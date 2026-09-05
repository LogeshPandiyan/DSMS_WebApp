import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import API from '../../api/axiosConfig';

const SetupAccount = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password.length < 6) {
            return toast.error('Password must be at least 6 characters long');
        }
        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setLoading(true);
        try {
            const res = await API.post(`/auth/setup-password/${token}`, { password });
            if (res.data.success) {
                toast.success('Account setup successful! You can now log in.');
                navigate('/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to setup account');
        } finally {
            setLoading(false);
        }
    };

    const brandColor = 'rgba(18, 183, 159, 1)';

    const iconAndLabels =[
        { icon: CheckCircle2, label: 'Personalized Workspace' },
        { icon: CheckCircle2, label: 'Instant Access' },
        { icon: CheckCircle2, label: 'Seamless Collaboration' },
        { icon: CheckCircle2, label: 'Secure Identity' }
    ];

    return (
        <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-500">
            {/* Left Side: Visual/Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
                {/* Decorative Elements */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/auth_background_1778074890356.png" 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/80 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full h-full p-16 flex flex-col justify-start">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary-600 rounded-[5px] flex items-center justify-center shadow-lg shadow-primary-600/20">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-black text-white tracking-tight capitalize">
                            Techno Tackle
                        </span>
                    </div>

                    <div className="space-y-6 mt-32">
                        <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
                            Begin Your <br />
                            <span style={{ color: brandColor }}>
                                Digital Journey.
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">
                            You've been invited to join Techno Tackle. Set up your secure password and step into your new workspace.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-6 pt-8">
                            {iconAndLabels.map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-slate-300">
                                    <item.icon className="h-4 w-4" style={{ color: brandColor }} />
                                    <span className="text-sm font-bold capitalize">
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Setup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
                <div className="w-full max-w-[440px] space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight capitalize">
                            Complete Setup
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium capitalize">
                            Create a secure password to activate your account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[13px] font-black text-slate-500 capitalize tracking-wide ml-1">
                                New Password
                            </label>
                            <div className="relative group">
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[5px] text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-medium placeholder:font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[13px] font-black text-slate-500 capitalize tracking-wide ml-1">
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <input
                                    name="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[5px] text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-medium placeholder:font-medium"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-[5px] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary-600/20 active:scale-[0.98] disabled:opacity-50 group"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span className="capitalize tracking-wide">
                                        Set Password & Activate
                                    </span>
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link 
                            to="/login" 
                            className="text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors hover:underline"
                        >
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetupAccount;
