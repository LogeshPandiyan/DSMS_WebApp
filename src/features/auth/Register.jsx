import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/authService';
import { User, Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const Register = () => {
    const [formData, setFormData] = useState({name: '',email: '',password: ''});
    const [validationErrors, setValidationErrors] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const nameRegex = /^[a-zA-Z\s]{3,}$/;

        if (!nameRegex.test(formData.name)) {
            errors.name = "Name Must Be At Least 3 Characters And Alphabets Only.";
        }
        if (!emailRegex.test(formData.email)) {
            errors.email = "Please Enter A Valid Email Address.";
        }
        if (formData.password.length < 6) {
            errors.password = "Password Must Be At Least 6 Characters Long.";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) return;

        setLoading(true);
        try {
            await register(formData);
            toast.success('Registration Successful! Please Login To Continue.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Something Went Wrong. Please Try Again.');
        } finally {
            setLoading(false);
        }
    };

    const brandColor = 'rgba(18, 183, 159, 1)';

    const documentFeatures =[
        'Create Unlimited Documents',
        'Secure Cloud Storage',
        'Real-time Signing Notifications',
        'Enterprise-grade Encryption'
    ]

    return (
        <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-500">
            {/* Left Side: Visual/Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/auth_background_1778074890356.png" 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/80 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full h-full p-16 flex flex-col justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/login')}>
                        <div className="h-10 w-10 bg-primary-600 rounded-[5px] flex items-center justify-center shadow-lg shadow-primary-600/20">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-black text-white tracking-tight capitalize">Techno Tackle</span>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
                            Start Your Digital <br />
                            <span style={{ color: brandColor }}>Journey Today.</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">
                            Join thousands of professionals who trust EliteSign for their most important documents.
                        </p>
                        
                        <div className="space-y-4 pt-8">
                            {documentFeatures.map((text, i) => (
                                <div key={i} className="flex items-center gap-3 text-slate-300">
                                    <div className="h-6 w-6 rounded-full bg-primary-600/20 flex items-center justify-center">
                                        <CheckCircle2 className="h-4 w-4" style={{ color: brandColor }} />
                                    </div>
                                    <span className="text-sm font-bold capitalize">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                        <span>&copy; 2026 EliteSign Technology. All Rights Reserved.</span>
                    </div> */}
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
                <div className="w-full max-w-[440px] space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight capitalize">Create Account</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium capitalize">Join Us And Start Managing Your Documents.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-[5px] text-sm font-bold flex items-center gap-3">
                            <Lock className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-black text-slate-500 capitalize tracking-wide ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                    className={`w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border rounded-[5px] text-slate-900 dark:text-white outline-none transition-all font-medium placeholder:font-medium focus:ring-4 focus:ring-slate-900/5 ${validationErrors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                                />
                            </div>
                            {validationErrors.name && (
                                <p className="text-red-500 text-[10px] mt-1 font-black italic ml-1">{validationErrors.name}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
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
                                    className={`w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border rounded-[5px] text-slate-900 dark:text-white outline-none transition-all font-medium placeholder:font-medium focus:ring-4 focus:ring-slate-900/5 ${validationErrors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                                />
                            </div>
                            {validationErrors.email && (
                                <p className="text-red-500 text-[10px] mt-1 font-black italic ml-1">{validationErrors.email}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-black text-slate-500 capitalize tracking-wide ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                                    className={`w-full pl-10 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border rounded-[5px] text-slate-900 dark:text-white outline-none transition-all font-medium placeholder:font-medium focus:ring-4 focus:ring-slate-900/5 ${validationErrors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {validationErrors.password && (
                                <p className="text-red-500 text-[10px] mt-1 font-black italic ml-1">{validationErrors.password}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-[5px] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary-600/20 active:scale-[0.98] disabled:opacity-50 group mt-4"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span className="capitalize tracking-wide">Create My Account</span>
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 hover:text-primary-500 font-black capitalize transition-colors hover:underline">Login Instead</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
