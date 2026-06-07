import React, { useState, useEffect } from 'react';
import { 
    Activity, 
    User as UserIcon, 
    FileText, 
    Shield, 
    LogIn, 
    LogOut, 
    Trash2, 
    Settings, 
    ChevronLeft, 
    ChevronRight,
    Search,
    Filter,
    Globe,
    Monitor
} from 'lucide-react';
import { getAuditLogs } from '../../services/auditService';
import { toast } from 'sonner';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [filters, setFilters] = useState({ page: 1, limit: 10, action: '' });

    const fetchLogs = async (params = filters) => {
        setLoading(true);
        try {
            const data = await getAuditLogs(params);
            setLogs(data.data);
            setPagination(data.pagination);
        } catch (error) {
            toast.error(error.message || 'Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filters]);

    const getActionIcon = (action) => {
        if (action.includes('LOGIN')) return <LogIn className="h-4 w-4" />;
        if (action.includes('LOGOUT')) return <LogOut className="h-4 w-4" />;
        if (action.includes('DOCUMENT')) return <FileText className="h-4 w-4" />;
        if (action.includes('USER')) return <UserIcon className="h-4 w-4" />;
        if (action.includes('REGISTER')) return <Shield className="h-4 w-4" />;
        return <Activity className="h-4 w-4" />;
    };

    const getActionStyle = (action) => {
        if (action.includes('DELETED')) return 'bg-red-500/10 text-red-500 border-red-500/20';
        if (action.includes('SIGNED') || action.includes('SUCCESS')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        if (action.includes('UPLOADED') || action.includes('CREATED')) return 'bg-primary-500/10 text-primary-600 border-primary-500/20';
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-700 px-2 pb-10">
            {/* Header / Filters Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 mb-2">
                <div className="space-y-1">
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black capitalize tracking-wide font-mono">System Integrity</p>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-none">Activity History</h2>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select 
                            value={filters.action}
                            onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
                            className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 pr-10 rounded-[5px] text-[11px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer"
                        >
                            <option value="">All Actions</option>
                            <option value="LOGIN">Logins</option>
                            <option value="REGISTER">Registrations</option>
                            <option value="DOCUMENT_UPLOADED">Uploads</option>
                            <option value="DOCUMENT_SIGNED">Signatures</option>
                            <option value="DOCUMENT_DELETED">Deletions</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-[11px] font-black capitalize tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">Action Trail</th>
                                <th className="px-6 py-4 text-[11px] font-black capitalize tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">User / Actor</th>
                                <th className="px-6 py-4 text-[11px] font-black capitalize tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">Details</th>
                                <th className="px-6 py-4 text-[11px] font-black capitalize tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">Network Info</th>
                                <th className="px-6 py-4 text-[11px] font-black capitalize tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Activity className="h-10 w-10 text-slate-200" />
                                            <p className="text-slate-400 text-[10px] font-black capitalize tracking-wide">No activity logs found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="even:bg-slate-50/50 dark:even:bg-slate-800/20 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center border ${getActionStyle(log.action)}`}>
                                                    {getActionIcon(log.action)}
                                                </div>
                                                <span className="text-[10px] font-black capitalize tracking-wide text-slate-900 dark:text-white">{log.action.replace(/_/g, ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{log.user?.name || 'System'}</span>
                                                <span className="text-[9px] text-slate-400 font-medium">{log.user?.email || 'automated-task'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium max-w-[250px] truncate" title={log.details}>
                                                {log.details}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <Globe className="h-3 w-3" />
                                                    <span className="text-[10px] font-bold">{log.ipAddress}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <Monitor className="h-3 w-3" />
                                                    <span className="text-[9px] truncate max-w-[120px]">{log.userAgent}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black text-slate-500 whitespace-nowrap">{formatTime(log.createdAt)}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-bold capitalize tracking-wide hidden md:block">
                        {pagination.totalLogs} Events Captured
                    </p>
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-bold capitalize tracking-wide">Rows per page:</span>
                            <div className="relative group/select">
                                <select
                                    value={filters.limit}
                                    onChange={(e) => setFilters({ ...filters, limit: Number(e.target.value), page: 1 })}
                                    className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-[5px] pl-3 pr-8 py-1.5 outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                                >
                                    {[10, 20, 30, 40].map(val => (
                                        <option key={val} value={val}>{val}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                disabled={pagination.currentPage <= 1}
                                onClick={() => setFilters({ ...filters, page: pagination.currentPage - 1 })}
                                className="h-9 w-9 rounded-[5px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 disabled:opacity-30 transition-all hover:bg-slate-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mx-2">{pagination.currentPage} / {pagination.totalPages}</span>
                            <button
                                disabled={pagination.currentPage >= pagination.totalPages}
                                onClick={() => setFilters({ ...filters, page: pagination.currentPage + 1 })}
                                className="h-9 w-9 rounded-[5px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 disabled:opacity-30 transition-all hover:bg-slate-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
