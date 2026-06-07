import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import API from '../../api/axiosConfig';
import { toast } from 'sonner';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await API.post('/auth/forgot-password', { email });
            toast.success(response.data.message);
            setSubmitted(true);
            // In a real app, the user would check their email. 
            // For this demo, we could log the token or just show success.
            console.log("Reset Token:", response.data.resetToken);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen w-full bg-white dark:bg-slate-950 font-['Outfit']">
            {/* Left Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/auth_background_1778074890356.png" 
                        alt="Security Background" 
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/80 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full p-16 flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-[#12b79f] rounded-[5px] flex items-center justify-center shadow-lg shadow-[#12b79f]/20">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tighter">EliteSign Pro</span>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-6xl font-black text-white leading-tight tracking-tighter">
                            Secure <span className="text-[#12b79f]">Password</span> <br />Recovery System.
                        </h1>
                        <p className="text-slate-400 text-lg max-w-md leading-relaxed font-medium">
                            Don't worry, it happens to the best of us. We'll help you regain access to your secure workspace in no time.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-slate-400">
                            <CheckCircle2 className="h-5 w-5 text-[#12b79f]" />
                            <span className="text-sm font-bold capitalize">Encrypted token delivery</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                            <CheckCircle2 className="h-5 w-5 text-[#12b79f]" />
                            <span className="text-sm font-bold capitalize">Multi-factor verification</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Form Section */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-24">
                <div className="w-full max-w-[440px] space-y-10">
                    <div className="space-y-3">
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Recover Account</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Enter your email and we'll send you recovery instructions.</p>
                    </div>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#12b79f] transition-colors">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your registered email"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-[5px] text-slate-900 dark:text-white font-medium focus:ring-0 focus:shadow-[0_0_0_2px_rgba(18,183,159,0.1),0_8px_20px_-4px_rgba(0,0,0,0.1)] transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-[#12b79f] text-white rounded-[5px] font-black text-sm shadow-xl shadow-[#12b79f]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Recovery Link'}
                            </button>
                        </form>
                    ) : (
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[5px] border border-emerald-100 dark:border-emerald-500/10 text-center space-y-4">
                            <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-400">Check Your Inbox</h3>
                            <p className="text-emerald-700 dark:text-emerald-500/80 text-sm font-medium">
                                We've sent a recovery link to <strong>{email}</strong>. Please follow the instructions to reset your password.
                            </p>
                        </div>
                    )}

                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full py-4 bg-transparent border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-[5px] font-black text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-2 group"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back To Login
                    </button>
                </div>

                {/* <div className="mt-20 text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center">
                    &copy; 2026 EliteSign Technology. All Rights Reserved.
                </div> */}
            </div>
        </div>
    );
};

export default ForgotPassword;
