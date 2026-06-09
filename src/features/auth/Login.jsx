import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/authService';
import { Mail, Lock, Loader2, LogIn, Eye, EyeOff, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { setUserLocal } from '../../utils/authUtils';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

    const handleSubmit = async (e) => { 
        e.preventDefault(); 
        setError(''); 
        setLoading(true); 
        try {
            const data = await login(formData);
            setUserLocal(data.data);
            toast.success('Logged In Successfully!');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid Email Or Password');
        } finally {
            setLoading(false);
        }
    };

    const brandColor = 'rgba(18, 183, 159, 1)';

    const iconAndLabels =[
        { icon: CheckCircle2, label: 'Legally Binding' },
        { icon: CheckCircle2, label: 'Bank-Grade Security' },
        { icon: CheckCircle2, label: 'Cloud Synchronized' },
        { icon: CheckCircle2, label: 'Advanced Audit' }
    ]

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
                        <span className="text-xl font-black text-white tracking-tight capitalize">Techno Tackle</span>
                    </div>

                    <div className="space-y-6 mt-32">
                        <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
                            Secure Document <br />
                            <span style={{ color: brandColor }}>Management System.</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">
                            Experience the next generation of digital signatures. Secure, legal, and lightning fast.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-6 pt-8">
                            {iconAndLabels.map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-slate-300">
                                    <item.icon className="h-4 w-4" style={{ color: brandColor }} />
                                    <span className="text-sm font-bold capitalize">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                        <span>&copy; 2026 EliteSign Technology. All Rights Reserved.</span>
                    </div> */}
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
                <div className="w-full max-w-[440px] space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight capitalize">Welcome Back</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium capitalize">Please Enter Your Details To Sign In.</p>
                </div>

                {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-[5px] text-sm font-bold flex items-center gap-3">
                        <LogIn className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[13px] font-black text-slate-500 capitalize tracking-wide ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                    placeholder="Enter email"
                                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[5px] text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-medium placeholder:font-medium"
                            />
                        </div>
                    </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[13px] font-black text-slate-500 capitalize tracking-wide">Password</label>
                            <button 
                                type="button" 
                                onClick={() => navigate('/forgot-password')}
                                    className="text-[11px] font-black text-[#12b79f] hover:text-[#12b79f]/80 capitalize hover:underline transition-colors"
                            >
                                Forgot Password?
                            </button>
                        </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={formData.password}
                                onChange={handleChange}
                                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                                    className="w-full pl-10 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[5px] text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-medium placeholder:font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
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
                                    <span className="capitalize tracking-wide">Sign In To Workspace</span>
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
        </div>
    );
};

export default Login;

