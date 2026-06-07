import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
    Mail,
    User as UserIcon,
    ShieldCheck,
    FileText,
    CheckCircle2,
    Clock,
    Settings,
    ArrowUpRight,
    TrendingUp,
    Zap,
    Activity,
    Plus,
    Layout,
    ArrowRight,
    Search,
    History,
    Calendar,
    Send
} from 'lucide-react';
import { getDashboardStats } from '../../services/dashboardService';

const Dashboard = () => {
    const { user } = useOutletContext();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('Welcome');

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayIdx = new Date().getDay();

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        const fetchStats = async () => {
            try {
                const response = await getDashboardStats();
                setStats(response.data);
            } catch {
                console.error('Failed to fetch stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const brandColor = '#12b79f';

    const formatTime = (dateString) => {
        if (!dateString) return 'No Recent Data';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just Now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    const StatCard = ({ icon: Icon, label, value, color, delay }) => (
        <div
            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[5px] shadow-sm transition-all duration-300 group relative overflow-hidden animate-in fade-in slide-in-from-bottom-4`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between relative z-10">
                <div
                    className={`h-12 w-12 rounded-[5px] flex items-center justify-center transition-all duration-500 group-hover:scale-110`}
                    style={{ backgroundColor: `${color}20`, color: color }}
                >
                    <Icon className="h-6 w-6" />
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black tracking-wide capitalize text-slate-500">{label}</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-700">
            {/* Premium Hero Section */}
            <div className="relative overflow-hidden rounded-[5px] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900"></div>

                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#12b79f]/5 to-transparent pointer-events-none"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#12b79f]/5 rounded-full blur-3xl animate-pulse"></div>

                <div className="relative z-10 px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#12b79f]/10 rounded-full">
                            <Zap className="h-3 w-3" style={{ color: brandColor }} />
                            <span className="text-[10px] font-black capitalize tracking-wide" style={{ color: brandColor }}>System Online</span>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                {greeting}, <span style={{ color: brandColor }}>{user?.name}!</span>
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md font-medium leading-relaxed">
                                {user?.role === 'admin'
                                    ? 'Everything looks great today. You have pending administrative tasks and document reviews to complete.'
                                    : 'Welcome back to your secure document workspace. You have new documents waiting for your signature.'}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/upload')}
                                style={{ backgroundColor: brandColor }}
                                className="px-6 py-3 text-white rounded-[5px] font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
                            >
                                <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" strokeWidth={3} />
                                Start New Workflow
                            </button>
                            <button
                                onClick={() => navigate('/settings')}
                                className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-[5px] font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                            >
                                <Settings className="h-4 w-4" />
                                Preferences
                            </button>
                        </div>
                    </div>

                    <div className="hidden lg:flex gap-4 animate-in slide-in-from-right duration-1000">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-[#12b79f]/20 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[8px] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center gap-4 shadow-2xl ring-1 ring-black/5">
                                <div className="h-16 w-16 rounded-full border-4 border-[#12b79f]/10 border-t-[#12b79f] flex items-center justify-center">
                                    <ShieldCheck className="h-8 w-8" style={{ color: brandColor }} />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{stats?.securityScore || '98'}%</p>
                                    <p className="text-[10px] font-black capitalize tracking-wide text-slate-400 mt-2">Security Index</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Clock} label="Pending Reviews" value={stats?.pendingDocuments || '0'} color="#F59E0B" delay={100} />
                <StatCard icon={CheckCircle2} label="Signed Docs" value={stats?.signedDocuments || '0'} color="#10B981" delay={200} />
                <StatCard icon={FileText} label="Total Records" value={stats?.totalDocuments || '0'} color={brandColor} delay={300} />
                <StatCard icon={UserIcon} label="System Users" value={stats?.totalUsers || '0'} color="#6366F1" delay={400} />
            </div>

            {/* Activity & Quick Actions Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
                {/* Visual Activity Chart (Sun - Sat) */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] p-6 shadow-sm flex flex-col gap-8 group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-[#12b79f]/10 rounded-[5px] flex items-center justify-center text-[#12b79f] transition-transform group-hover:scale-110">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Activity</h3>
                                <p className="text-[11px] font-black capitalize text-slate-400">Weekly Performance Data (Sun - Sat)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full border border-emerald-100 dark:border-emerald-500/10">
                            <TrendingUp className="h-3 w-3" />
                            <span className="text-[10px] font-black uppercase tracking-tight">Live Tracking</span>
                        </div>
                    </div>

                    {/* Activity Visualization */}
                    <div className="flex-1 min-h-[240px] flex items-end justify-between gap-4 px-2 pb-2">
                            {days.map((day, i) => {
                                const data = stats?.weeklyActivity?.[i] || { pending: 0, signed: 0 };
                            const total = data.pending + data.signed;
                                const isToday = i === currentDayIdx;

                            // Find max total to scale
                            const allTotals = stats?.weeklyActivity?.map(d => d.pending + d.signed) || [1];
                            const maxTotal = Math.max(...allTotals, 1);
                            const barHeight = total > 0 ? (total / maxTotal) * 100 : 8;

                                return (
                                <div key={day} className="flex-1 flex flex-col items-center gap-4 group/bar h-full justify-end relative">
                                    <div
                                        className={`w-full rounded-t-[4px] transition-all duration-700 cursor-pointer relative group-hover/bar:opacity-80
                                            ${isToday ? 'bg-[#12b79f] shadow-lg shadow-[#12b79f]/20' : 'bg-slate-100 dark:bg-slate-800'}`}
                                                style={{
                                                    height: `${barHeight}%`,
                                            animation: `grow-up 1.2s ease-out forwards ${i * 80}ms`
                                                }}
                                    >
                                        {/* Real-time Tooltip */}
                                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-3 rounded-[8px] opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none whitespace-nowrap z-30 shadow-2xl scale-90 group-hover/bar:scale-100 border border-white/10">
                                                <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 pb-1 border-b border-white/10 dark:border-slate-100">
                                                        <Calendar className="h-3 w-3 text-[#12b79f]" />
                                                        <span className="text-[10px] font-black capitalize tracking-widest">{day} {isToday ? '(Today)' : ''}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-6">
                                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Sent (Pending)</span>
                                                    <span className="text-[10px] font-black">{data.pending}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-6">
                                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Signed (Completed)</span>
                                                        <span className="text-[10px] font-black text-[#12b79f]">{data.signed}</span>
                                                    </div>
                                                </div>
                                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 dark:bg-white rotate-45"></div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center">
                                            <span className={`text-[9px] font-black capitalize tracking-widest ${isToday ? 'text-[#12b79f]' : 'text-slate-400'}`}>
                                                {day}
                                            </span>
                                        {isToday && <div className="h-1 w-1 rounded-full bg-[#12b79f] mt-1"></div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                {/* Real-time Events & Navigation */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[13px] font-black capitalize">System Activity</h3>
                            <div className="px-3 py-1 bg-[#12b79f]/10 text-[#12b79f] rounded text-[10px] font-black capitalize">Today</div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-[5px] group hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5">
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                                    <Plus className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] font-bold text-slate-900 dark:text-white">New Doc Uploaded</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{stats?.todayCounts?.uploaded || 0} Records Today</p>
                                </div>
                                <ArrowUpRight className="h-3 w-3 text-slate-300" />
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-[5px] group hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5">
                                <div className="h-8 w-8 rounded-full bg-[#12b79f]/10 flex items-center justify-center text-[#12b79f]">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] font-bold text-slate-900 dark:text-white">Contract Signed</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{stats?.todayCounts?.signed || 0} Completed Today</p>
                                </div>
                                <ArrowUpRight className="h-3 w-3 text-slate-300" />
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-[5px] group hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5">
                                <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600">
                                    <History className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] font-bold text-slate-900 dark:text-white">User Access Updated</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Last Action: {formatTime(stats?.lastActionTime)}</p>
                                </div>
                                <ArrowUpRight className="h-3 w-3 text-slate-300" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            {[
                                { icon: FileText, label: 'Upload', path: '/upload' },
                                { icon: Clock, label: 'Queue', path: '/documents' },
                                { icon: UserIcon, label: 'Users', path: '/admin/users' },
                                { icon: Settings, label: 'Settings', path: '/settings' }
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => navigate(action.path)}
                                    className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[5px] hover:border-[#12b79f80] hover:bg-[#12b79f05] transition-all group"
                                >
                                    <action.icon className="h-4 w-4 text-slate-400 group-hover:text-[#12b79f] transition-colors" />
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">
                                        {action.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#12b79f] to-teal-700 p-6 rounded-[5px] shadow-xl text-white relative overflow-hidden group cursor-pointer">
                        <div className="relative z-10 space-y-4">
                            <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-[5px] flex items-center justify-center">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold leading-tight tracking-tight">Enterprise Protection</h3>
                                <p className="text-[10px] opacity-80 mt-1 font-medium italic">Compliant with ESIGN & eIDAS protocols.</p>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-black capitalize tracking-widest bg-white/20 w-fit px-3 py-1.5 rounded-full hover:bg-white/30 transition-all">
                                Protocol Active <ArrowUpRight className="h-3 w-3" />
                            </div>
                        </div>
                        <Activity className="absolute -right-6 -bottom-6 h-32 w-32 opacity-10 group-hover:scale-125 transition-transform duration-1000" />
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes grow-up {
                    from { height: 0; }
                }
            `}} />
        </div>
    );
};

export default Dashboard;
