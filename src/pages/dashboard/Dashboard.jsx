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
    ZapOff,
    WifiOff,
    Activity,
    Plus,
    Layout,
    ArrowRight,
    Search,
    History,
    Calendar,
    Send,
    PenTool,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { getDashboardStats } from '../../services/dashboardService';
import { toast } from 'sonner';

const getGreenShadeClass = (index) => {
    const shades = [
        'bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/10 text-green-700 dark:text-green-300',
        'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800/20 text-green-800 dark:text-green-200',
        'bg-green-200 dark:bg-green-850/40 border-green-300 dark:border-green-700/30 text-green-900 dark:text-green-100',
        'bg-green-300 dark:bg-green-800/50 border-green-400 dark:border-green-600/40 text-green-950 dark:text-green-50',
        'bg-green-400 dark:bg-green-700/60 border-green-500 dark:border-green-500/50 text-white',
        'bg-green-500 dark:bg-green-600/70 border-green-600 dark:border-green-400/60 text-white',
        'bg-green-600 dark:bg-green-500/80 border-green-700 dark:border-green-300/70 text-white',
        'bg-green-700 dark:bg-green-400 border-green-850 dark:border-green-250 text-white',
        'bg-green-800 dark:bg-green-300 border-green-900 dark:border-green-200 text-white',
        'bg-green-900 dark:bg-green-200 border-green-950 dark:border-green-100 text-white'
    ];
    return shades[index % 10];
};

const getAmberShadeClass = (index) => {
    const shades = [
        'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/10 text-amber-700 dark:text-amber-300',
        'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800/20 text-amber-800 dark:text-amber-200',
        'bg-amber-200 dark:bg-amber-850/40 border-amber-300 dark:border-amber-700/30 text-amber-900 dark:text-amber-100',
        'bg-amber-300 dark:bg-amber-800/50 border-amber-400 dark:border-amber-600/40 text-amber-950 dark:text-amber-50',
        'bg-amber-400 dark:bg-amber-700/60 border-amber-500 dark:border-amber-500/50 text-white',
        'bg-amber-500 dark:bg-amber-600/70 border-amber-600 dark:border-amber-400/60 text-white',
        'bg-amber-600 dark:bg-amber-500/80 border-amber-700 dark:border-amber-300/70 text-white',
        'bg-amber-700 dark:bg-amber-400 border-amber-850 dark:border-amber-250 text-white',
        'bg-amber-800 dark:bg-amber-300 border-amber-900 dark:border-amber-200 text-white',
        'bg-amber-900 dark:bg-amber-200 border-amber-950 dark:border-amber-100 text-white'
    ];
    return shades[index % 10];
};

const Dashboard = () => {
    const { user } = useOutletContext();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activityLoading, setActivityLoading] = useState(false);
    const [greeting, setGreeting] = useState('Welcome');
    const [isBackendOnline, setIsBackendOnline] = useState(true);
    const [isBrowserOnline, setIsBrowserOnline] = useState(navigator.onLine);
    const [selectedWeekDate, setSelectedWeekDate] = useState(new Date());

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayIdx = new Date().getDay();

    // Calculate Sunday and Saturday of the selectedWeekDate
    const getWeekBoundaries = (refDate) => {
        const d = new Date(refDate);
        const day = d.getDay(); // 0 = Sun, 6 = Sat
        const start = new Date(d);
        start.setDate(d.getDate() - day);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        // Generate the 7 dates of this week
        const weekDates = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            return date;
        });

        return { start, end, weekDates };
    };

    const { start: weekStart, end: weekEnd, weekDates } = getWeekBoundaries(selectedWeekDate);

    // Format DD/MM/YYYY
    const formatDateDDMMYYYY = (date) => {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    // Check if selected week is current real-world week
    const isCurrentWeek = () => {
        const today = new Date();
        const { start } = getWeekBoundaries(today);
        return weekStart.getTime() === start.getTime();
    };

    const handlePrevWeek = () => {
        const newDate = new Date(selectedWeekDate);
        newDate.setDate(newDate.getDate() - 7);
        setSelectedWeekDate(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(selectedWeekDate);
        newDate.setDate(newDate.getDate() + 7);
        setSelectedWeekDate(newDate);
    };

    const handleResetToCurrentWeek = () => {
        setSelectedWeekDate(new Date());
    };

    useEffect(() => {
        const handleOnline = () => setIsBrowserOnline(true);
        const handleOffline = () => setIsBrowserOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        const now = new Date();
        const hour = now.getHours();
        const minutes = now.getMinutes();
        const timeInMinutes = hour * 60 + minutes;

        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else if (timeInMinutes >= 19 * 60 + 30) setGreeting('Good Night');
        else setGreeting('Good Evening');

        const fetchStats = async () => {
            setActivityLoading(true);
            try {
                const response = await getDashboardStats({
                    startDate: weekStart.toISOString(),
                    endDate: weekEnd.toISOString()
                });
                setStats(response.data);
                setIsBackendOnline(true);
            } catch {
                console.error('Failed to fetch stats');
                setIsBackendOnline(false);
            } finally {
                setLoading(false);
                setActivityLoading(false);
            }
        };
        fetchStats();
    }, [selectedWeekDate]);

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
                <div className="flex-1 flex flex-row items-center justify-between pl-4">
                    <span className="text-[12px] font-black tracking-wide capitalize text-slate-500">
                        {label}
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {value}
                    </span>
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
                        {/* Dynamic System Connection Status Badge */}
                        {!isBrowserOnline ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
                                <WifiOff className="h-3 w-3 text-red-500 animate-pulse" />
                                <span className="text-[10px] font-black capitalize tracking-wide">
                                    You're Offline
                                </span>
                            </div>
                        ) : !isBackendOnline ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
                                <ZapOff className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                                <span className="text-[10px] font-black capitalize tracking-wide">
                                    Server Offline
                                </span>
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#12b79f]/10 rounded-full border border-[#12b79f]/20">
                                <Zap className="h-3 w-3 animate-pulse" style={{ color: brandColor }} />
                                <span
                                    className="text-[10px] font-black capitalize tracking-wide"
                                    style={{ color: brandColor }}
                                >
                                    System Online
                                </span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <h2 className="text-4xl md:text-[40px] font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
                                {greeting},{' '}
                                <span style={{ color: brandColor }}>
                                    {user?.name}!
                                </span>
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md font-medium leading-relaxed">
                                {user?.role === 'admin'
                                    ? 'Everything looks great today. You have pending administrative tasks and document reviews to complete.'
                                    : 'Welcome back to your secure document workspace. You have new documents waiting for your signature.'}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {user?.role === 'admin' ? (
                                <button
                                    onClick={() => navigate('/upload')}
                                    style={{ backgroundColor: brandColor }}
                                    className="px-6 py-3 text-white rounded-[5px] font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
                                >
                                    <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" strokeWidth={3} />
                                    <span>Start New Workflow</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/documents')}
                                    style={{ backgroundColor: brandColor }}
                                    className="px-6 py-3 text-white rounded-[5px] font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
                                >
                                    <FileText className="h-4 w-4" />
                                    <span>View Documents</span>
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/settings')}
                                className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-[5px] font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                            >
                                <Settings className="h-4 w-4" />
                                <span>Preferences</span>
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
                                    <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                                        {stats?.securityScore || '98'}%
                                    </p>
                                    <p className="text-[10px] font-black capitalize tracking-wide text-slate-400 mt-2">
                                        Security Index
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={Clock} 
                    label="Pending Reviews" 
                    value={stats?.pendingDocuments || '0'} 
                    color="#F59E0B" 
                    delay={100} 
                />
                <StatCard 
                    icon={CheckCircle2} 
                    label="Signed Docs" 
                    value={stats?.signedDocuments || '0'} 
                    color="#10B981" 
                    delay={200} 
                />
                <StatCard 
                    icon={FileText} 
                    label="Total Records" 
                    value={stats?.totalDocuments || '0'} 
                    color={brandColor} 
                    delay={300} 
                />
                <StatCard 
                    icon={PenTool} 
                    label="Action Required" 
                    value={stats?.pendingDocuments || '0'} 
                    color="#6366F1" 
                    delay={400} 
                />
            </div>

            {/* Activity & Quick Actions Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
                {/* Visual Activity Chart (Sun - Sat) */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] p-4 shadow-sm flex flex-col gap-8 group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-[#12b79f]/10 rounded-[5px] flex items-center justify-center text-[#12b79f] transition-transform group-hover:scale-110">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Workspace Activity
                                </h3>
                                <p className="text-[11px] font-black capitalize text-slate-400">
                                    Weekly Performance Data (Sun - Sat)
                                </p>
                            </div>
                        </div>

                        {/* Interactive Week Range Picker */}
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded-full shadow-sm">
                                <button
                                    onClick={handlePrevWeek}
                                    title="Previous Week"
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full transition-all active:scale-95 hover:text-primary-600"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </button>

                                <div className="flex items-center gap-2 px-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 select-none">
                                    <Calendar className="h-3.5 w-3.5 text-[#12b79f]" />
                                    <span>{formatDateDDMMYYYY(weekStart)} to {formatDateDDMMYYYY(weekEnd)}</span>
                                </div>

                                <button
                                    onClick={handleNextWeek}
                                    title="Next Week"
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full transition-all active:scale-95 hover:text-primary-600"
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {isCurrentWeek() ? (
                                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-full border border-primary-100 dark:border-primary-500/10">
                                    <TrendingUp className="h-3 w-3" />
                                    <span className="text-[10px] font-black uppercase tracking-tight">
                                        Live Tracking
                                    </span>
                                </div>
                            ) : (
                                <button
                                    onClick={handleResetToCurrentWeek}
                                    className="hidden sm:inline-block text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-[5px] border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all"
                                >
                                    Current Week
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Activity Visualization */}
                    <div className="flex-1 min-h-[240px] flex items-end justify-between gap-4 px-2 pb-2">
                        {days.map((day, i) => {
                            const data = stats?.weeklyActivity?.[i] || { pending: 0, signed: 0 };
                            const total = data.pending + data.signed;
                            const thisDayDate = weekDates[i];
                            const isToday = isCurrentWeek() && i === currentDayIdx;
                            const formattedDayDate = formatDateDDMMYYYY(thisDayDate);

                            // Find max total to scale (minimum ceiling of 5 to ensure step-by-step scaling)
                            const allTotals = stats?.weeklyActivity?.map(d => d.pending + d.signed) || [];
                            const maxTotal = Math.max(5, ...allTotals);
                            
                            // Calculate height: ~20% (approx 50px) for 1 doc if max is 5.
                            let barHeight = 8; // Default empty height
                            if (total > 0) {
                                barHeight = Math.max(15, (total / maxTotal) * 100);
                            }

                            return (
                                <div key={day} className="flex-1 flex flex-col items-center gap-4 group/bar h-full justify-end relative hover:z-50 group-hover/bar:z-50">
                                    <div
                                        className={`w-full rounded-t-[4px] transition-all duration-700 cursor-pointer relative group-hover/bar:opacity-95 flex flex-col-reverse gap-[2px]
                                            ${total > 0 ? 'bg-transparent' : (isToday ? 'bg-[#12b79f]/20' : 'bg-slate-100 dark:bg-slate-800')}`}
                                        style={{
                                            height: `${barHeight}%`,
                                            animation: `grow-up 1.2s ease-out forwards ${i * 80}ms`
                                        }}
                                    >
                                        {total > 0 && (
                                            <>
                                                {/* Stack of Signed documents (Green) */}
                                                {Array.from({ length: data.signed }).map((_, idx) => (
                                                    <div 
                                                        key={`signed-${idx}`}
                                                        className={`flex-1 w-full rounded-[2px] border transition-all duration-300 ${getGreenShadeClass(idx)}`}
                                                    />
                                                ))}
                                                {/* Stack of Pending documents (Amber) */}
                                                {Array.from({ length: data.pending }).map((_, idx) => (
                                                    <div 
                                                        key={`pending-${idx}`}
                                                        className={`flex-1 w-full rounded-[2px] border transition-all duration-300 ${getAmberShadeClass(idx)}`}
                                                    />
                                                ))}
                                            </>
                                        )}

                                        {/* Real-time Tooltip (Always on top with z-[9999]) */}
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-3 rounded-[8px] opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none whitespace-nowrap z-[9999] shadow-2xl scale-90 group-hover/bar:scale-100 border border-white/10">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 pb-1 border-b border-white/10 dark:border-slate-100">
                                                    <Calendar className="h-3 w-3 text-[#12b79f]" />
                                                    <span className="text-[10px] font-black capitalize tracking-widest">
                                                        {day} ({formattedDayDate}) {isToday ? '• Today' : ''}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-6">
                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                                        Sent (Pending)
                                                    </span>
                                                    <span className="text-[10px] font-black">
                                                        {data.pending}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-6">
                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                                        Signed (Completed)
                                                    </span>
                                                    <span className="text-[10px] font-black text-[#12b79f]">
                                                        {data.signed}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 dark:bg-white rotate-45"></div>
                                        </div>
                                    </div>

                                    <div className={`flex items-center gap-1 text-[10px] whitespace-nowrap ${isToday ? 'text-[#12b79f] font-black' : 'text-slate-400 font-bold'}`}>
                                        <span className="capitalize tracking-wider">{day}</span>
                                        <span>{thisDayDate.getDate()}</span>
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
                            <h3 className="text-[13px] font-black capitalize">
                                System Activity
                            </h3>
                            <div className="px-3 py-1 bg-[#12b79f]/10 text-[#12b79f] rounded text-[10px] font-black capitalize">
                                Today
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-[5px] group hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5">
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                                    <Plus className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] font-bold text-slate-900 dark:text-white">
                                        New Doc Uploaded
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        {stats?.todayCounts?.uploaded || 0} Records Today
                                    </p>
                                </div>
                                <ArrowUpRight className="h-3 w-3 text-slate-300" />
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-[5px] group hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5">
                                <div className="h-8 w-8 rounded-full bg-[#12b79f]/10 flex items-center justify-center text-[#12b79f]">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] font-bold text-slate-900 dark:text-white">
                                        Contract Signed
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        {stats?.todayCounts?.signed || 0} Completed Today
                                    </p>
                                </div>
                                <ArrowUpRight className="h-3 w-3 text-slate-300" />
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-[5px] group hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5">
                                <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600">
                                    <History className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] font-bold text-slate-900 dark:text-white">
                                        User Access Updated
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        Last Action: {formatTime(stats?.lastActionTime)}
                                    </p>
                                </div>
                                <ArrowUpRight className="h-3 w-3 text-slate-300" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            {[
                                ...(user?.role === 'admin' ? [{ icon: FileText, label: 'Upload', path: '/upload' }] : []),
                                { icon: Clock, label: 'Queue', path: '/documents' },
                                ...(user?.role === 'admin' ? [{ icon: UserIcon, label: 'Users', path: '/admin/users' }] : []),
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

                    <div 
                        onClick={() => {
                            toast.success("Security Protocols Active", {
                                description: "All document signatures are legally binding, secured by AES-256 encryption, and compliant with US ESIGN & EU eIDAS regulations.",
                                duration: 5000,
                            });
                        }}
                        className="bg-gradient-to-br from-[#12b79f] to-teal-700 p-6 rounded-[5px] shadow-xl text-white relative overflow-hidden group cursor-pointer"
                    >
                        <div className="relative z-10 space-y-4">
                            <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-[5px] flex items-center justify-center">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold leading-tight tracking-tight">
                                    Enterprise Protection
                                </h3>
                                <p className="text-[10px] opacity-80 mt-1 font-medium italic">
                                    Compliant with ESIGN & eIDAS protocols.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-black capitalize tracking-widest bg-white/20 w-fit px-3 py-1.5 rounded-full hover:bg-white/30 transition-all">
                                <span>Protocol Active</span>
                                <ArrowUpRight className="h-3 w-3" />
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
