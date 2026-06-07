import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { getDocuments, deleteDocument } from '../../services/documentService';
import {
    FileText,
    Clock,
    CheckCircle2,
    MoreVertical,
    Eye,
    Download,
    Trash2,
    Plus,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    User,
    Calendar,
    PenTool,
    Layout,
    Inbox,
    FileCheck2,
    FileEdit
} from 'lucide-react';
import { toast } from 'sonner';
import SearchBar from '../../components/SearchBar';
import ConfirmationModal from '../../components/ConfirmationModal';

const DocumentList = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [searchTerm, setSearchTerm] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, docId: null });
    const [tabCounts, setTabCounts] = useState({ all: 0, pending: 0, signed: 0, wfo: 0, draft: 0 });
    const [rowsPerPageOpen, setRowsPerPageOpen] = useState(false);
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

    const { user: currentUser } = useOutletContext();
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const statusFilter = searchParams.get('status') || 'all';

    useEffect(() => {
        const handleClickOutside = () => {
            setOpenDropdownId(null);
            setRowsPerPageOpen(false);
            setIsFilterDropdownOpen(false);
        };
        if (openDropdownId || rowsPerPageOpen || isFilterDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openDropdownId, rowsPerPageOpen, isFilterDropdownOpen]);

    const [limit, setLimit] = useState(10);

    const fetchDocs = useCallback(async (page = 1, currentLimit = limit) => {
            setLoading(true);
        try {
            const response = await getDocuments({
                status: statusFilter,
                search: searchTerm,
                page,
                limit: currentLimit
            });
            setDocuments(response.data);
            setPagination(response.pagination);
            
            // Sync counts from the same response (Industry Standard)
            if (response.counts) {
                setTabCounts(response.counts);
            }
        }
        catch {
            toast.error('Failed to fetch documents');
        }
        finally {
            setLoading(false);
        }
    }, [statusFilter, searchTerm]);

    useEffect(() => {
        fetchDocs(1);
    }, [fetchDocs]);

    const handleDeleteConfirm = async () => {
        if (!deleteModal.docId) return;
        try {
            await deleteDocument(deleteModal.docId);
            fetchDocs(pagination.currentPage); // Refresh everything
            toast.success('Document deleted successfully');
        }
        catch {
            toast.error('Failed to delete document');
        }
    };


    const getAssetUrl = (filePath) => {
        if (!filePath) return '';
        const baseUrl = import.meta.env.VITE_API_URL.split('/api')[0];
        const formattedPath = filePath.replace(/\\/g, '/');
        const finalPath = formattedPath.startsWith('/') ? formattedPath.substring(1) : formattedPath;
        return `${baseUrl}/${finalPath}`;
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'signed':
                return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'partially_signed':
                return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            case 'rejected':
                return 'bg-red-500/10 text-red-600 border-red-500/20';
            case 'draft':
                return 'bg-red-500/10 text-red-600 border-red-500/20';
            case 'pending':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            default:
                return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            all: 'All',
            pending: 'Pending',
            partially_signed: 'Waiting for Others',
            signed: 'Completed',
            draft: 'Draft'
        };
        return labels[status] || status;
    };

    const canAction = (doc) => {
        const uploadedBy = doc.uploadedBy?._id || doc.uploadedBy;
        return currentUser?.role === 'admin' || uploadedBy === currentUser?._id;
    };

    const filterOptions = [
        { label: 'All', status: 'all', icon: Inbox, count: tabCounts.all },
        { label: 'Pending', status: 'pending', icon: Clock, count: tabCounts.pending },
        { label: 'Waiting for Others', status: 'wfo', icon: User, count: tabCounts.wfo },
        { label: 'Completed', status: 'signed', icon: FileCheck2, count: tabCounts.signed },
        { label: 'Drafts', status: 'draft', icon: FileEdit, count: tabCounts.draft, roles: ['admin', 'manager'] }
    ].filter(tab => !tab.roles || tab.roles.includes(currentUser?.role?.toLowerCase()));

    const activeOption = filterOptions.find(opt => opt.status === statusFilter) || filterOptions[0];

    return (
        <div className="w-full animate-in fade-in duration-500">
            {/* Action Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
                <div className="relative w-fit">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsFilterDropdownOpen(!isFilterDropdownOpen);
                        }}
                        className={`px-4 min-w-[130px] h-10 text-[13px] font-bold transition-all rounded-[5px] flex items-center gap-3 whitespace-nowrap border justify-between shadow-sm bg-white dark:bg-slate-900/50 backdrop-blur-md
                            ${isFilterDropdownOpen 
                                ? 'border-primary-500 ring-1 ring-primary-500/10 text-slate-900 dark:text-white' 
                                : 'text-slate-600 dark:text-slate-350 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <div className="flex items-center gap-2">
                            <activeOption.icon className="h-4 w-4 text-primary-500" />
                            <span>{activeOption.label}</span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ml-1">
                                {activeOption.count}
                            </span>
                        </div>
                        <ChevronDown className={`h-3.5 w-3.5 text-slate-450 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Filter Dropdown Menu */}
                    {isFilterDropdownOpen && (
                        <div className="absolute left-0 mt-2 w-full min-w-[220px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[5px] shadow-2xl z-[1000] p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Decorative pointer arrow on the top */}
                            <div className="absolute left-6 -top-1.5 w-2.5 h-2.5 rotate-45 bg-white dark:bg-slate-900 border-t border-l border-slate-200 dark:border-white/5 z-0"></div>
                            
                            <div className="relative z-10 space-y-1">
                                {filterOptions.map((opt) => {
                                    const isActive = opt.status === statusFilter;
                                    return (
                                        <button
                                            key={opt.status}
                                            onClick={() => {
                                                navigate(`/documents?status=${opt.status}`);
                                                setIsFilterDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-[4px] transition-all
                                                ${isActive 
                                                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/20' 
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <opt.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-500'}`} />
                                                <span>{opt.label}</span>
                                            </div>
                                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full
                                                ${isActive 
                                                    ? 'bg-white/20 text-white' 
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                                            >
                                                {opt.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search documents..."
                        className="w-72"
                    />
                    {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
                        <button
                            onClick={() => navigate('/upload')}
                            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2.5 rounded-[5px] font-bold text-sm transition-all flex items-center justify-center gap-3.5
                            shadow-lg shadow-primary-600/20 active:scale-[0.98] whitespace-nowrap"
                        >
                            <Plus className="h-4 w-4" strokeWidth={3} />
                            New Document
                        </button>
                    )}
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] shadow-sm relative">

                <div className="overflow-visible">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-[12px] font-bold text-slate-500 w-24 text-center border-b border-slate-200 dark:border-slate-800">Actions</th>
                                <th className="px-6 py-4 text-[12px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">Document Title</th>
                                <th className="px-6 py-4 text-[12px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">Sender</th>
                                <th className="px-6 py-4 text-[12px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">Recipient</th>
                                <th className="px-6 py-4 text-[12px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">Status</th>
                                <th className="px-6 py-4 text-[12px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-[10px] text-slate-400 font-bold capitalize tracking-wide">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                            Syncing Records...
                                        </div>
                                    </td>
                                </tr>
                            ) : documents.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <FileText className="h-10 w-10 text-slate-200" />
                                            <p className="text-slate-400 text-[10px] font-black capitalize tracking-wide">No Documents Found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                documents.map((doc, index) => (
                                    <tr key={doc._id} className="even:bg-slate-50/50 dark:even:bg-slate-800/20 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenDropdownId(openDropdownId === doc._id ? null : doc._id);
                                                    }}
                                                    className={`h-9 w-9 rounded-[5px] flex items-center justify-center transition-all
                                                        ${openDropdownId === doc._id
                                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/5'
                                                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>

                                                {openDropdownId === doc._id && (
                                                    <div className={`absolute ${index > 4 ? 'bottom-full mb-1' : 'top-full mt-1'} -left-2 w-[216px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] shadow-2xl z-[9999] py-2 animate-in fade-in zoom-in-95 duration-150`}>
                                                        {(doc.status === 'pending' || doc.status === 'partially_signed') && (
                                                            (Array.isArray(doc.assignedTo) && doc.assignedTo.some(a => (a._id || a) === currentUser?._id)) ||
                                                            (doc.assignedTo?._id === currentUser?._id)
                                                        ) && (
                                                                !doc.signatures?.some(sig => (sig.user?._id || sig.user) === currentUser?._id)
                                                            ) && (
                                                                <div className="px-1.5">
                                                                    <button
                                                                        onClick={() => navigate(`/sign/${doc._id}`)}
                                                                        className="w-full px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-600 transition-all flex items-center gap-3 rounded-[4px]"
                                                                    >
                                                                        <PenTool className="h-4 w-4" />
                                                                        Sign Document
                                                                    </button>
                                                                </div>
                                                            )}

                                                        {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (doc.status === 'pending' || doc.status === 'partially_signed' || doc.status === 'draft') && (
                                                            <div className="px-1.5">
                                                                <button
                                                                    onClick={() => navigate(`/prepare/${doc._id}`)}
                                                                    className="w-full px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-600 transition-all flex items-center gap-3 rounded-[4px]"
                                                                >
                                                                    <Layout className="h-4 w-4" />
                                                                    Prepare Fields
                                                                </button>
                                                            </div>
                                                        )}

                                                        <div className="px-1.5">
                                                            <button
                                                                onClick={() => window.open(getAssetUrl(doc.filePath), '_blank')}
                                                                className="w-full px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center gap-3 rounded-[4px]"
                                                            >
                                                                <Download className="h-4 w-4" />
                                                                Download PDF
                                                            </button>

                                                            {canAction(doc) && (
                                                                <>
                                                                    <button
                                                                        onClick={() => setDeleteModal({ isOpen: true, docId: doc._id })}
                                                                        className="w-full px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center gap-3 rounded-[4px]"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                        Delete Document
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[300px]" title={doc.title}>
                                                {doc.title}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{doc.uploadedBy?.name || 'Unknown'}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            {Array.isArray(doc.assignedTo) && doc.assignedTo.length > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center">
                                                        {doc.assignedTo[0].name}
                                                        {doc.assignedTo.length > 1 && (
                                                            <div className="relative group ml-1">
                                                                <span className="text-[11px] text-slate-500 font-black bg-slate-500/10 dark:bg-slate-500/20 px-2 py-0.5 rounded-full cursor-help transition-colors hover:bg-slate-500/20">
                                                                    +{doc.assignedTo.length - 1}
                                                                </span>
                                                                
                                                                {/* Custom Tooltip */}
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold py-2 px-3 rounded-[5px] shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-[9999] border border-white/10">
                                                                    <div className="flex flex-col gap-1.5">
                                                                        <p className="text-[9px] tracking-wider text-slate-400 mb-0.5">Other Recipients</p>
                                                                        {doc.assignedTo.slice(1).map((user, idx) => (
                                                                            <div key={idx} className="whitespace-nowrap flex items-center gap-2">
                                                                                <div className="h-1 w-1 rounded-full bg-primary-500" />
                                                                                {user.name}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900 dark:border-t-slate-800" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="relative group inline-block">
                                                <span className={`px-3 py-[3px] rounded-[5px] border text-[10px] font-black capitalize tracking-wide cursor-help ${getStatusStyle(doc.status)}`}>
                                                    {getStatusLabel(doc.status)}
                                                </span>
                                                
                                                {/* Status Tooltip */}
                                                {(doc.status === 'partially_signed' || doc.status === 'pending' || doc.status === 'signed') && Array.isArray(doc.assignedTo) && doc.assignedTo.length > 0 && (
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[220px] bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold py-2.5 px-3 rounded-[5px] shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-[9999] border border-white/10">
                                                        <div className="flex flex-col gap-2">
                                                            <p className="text-[9px] tracking-wider text-slate-400 mb-0.5 border-b border-white/10 pb-1">Signature Status</p>
                                                            {doc.assignedTo.map((user, idx) => {
                                                                const hasSigned = doc.signatures?.some(sig => (sig.user?._id || sig.user).toString() === user._id.toString());
                                                                return (
                                                                    <div key={idx} className="whitespace-nowrap flex items-center justify-between gap-4">
                                                                        <span className={`${hasSigned ? 'text-slate-200' : 'text-slate-400'}`}>{user.name}</span>
                                                                        {hasSigned ? (
                                                                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                                                        ) : (
                                                                            <Clock className="h-3 w-3 text-amber-400" />
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900 dark:border-t-slate-800" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Calendar className="h-4 w-4" />
                                                <span className="text-sm font-medium">
                                                    {new Date(doc.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
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
                        Page {pagination?.currentPage || 1} of {pagination?.totalPages || 1}
                    </p>
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-bold capitalize tracking-wide">Rows per page:</span>
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setRowsPerPageOpen(!rowsPerPageOpen);
                                    }}
                                    className={`flex items-center gap-3 bg-white dark:bg-slate-900 border text-xs font-bold text-slate-700 dark:text-slate-300 rounded-[5px] pl-3 pr-2 py-1.5 transition-all min-w-[64px] justify-between
                                        ${rowsPerPageOpen ? 'border-primary-500 ring-1 ring-primary-500/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                                >
                                    {limit}
                                    <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${rowsPerPageOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {rowsPerPageOpen && (
                                    <div className="absolute bottom-full mb-2 left-0 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] shadow-2xl z-[100] p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                        {[10, 20, 30, 40].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => {
                                                    setLimit(val);
                                                    fetchDocs(1, val);
                                                    setRowsPerPageOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-[3px] transition-colors
                                                    ${limit === val 
                                                        ? 'bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white' 
                                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                disabled={pagination?.currentPage <= 1}
                                onClick={() => fetchDocs(pagination.currentPage - 1, limit)}
                                className="h-9 w-9 rounded-[5px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 disabled:opacity-30 transition-all hover:bg-slate-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                disabled={pagination?.currentPage >= pagination?.totalPages}
                                onClick={() => fetchDocs(pagination.currentPage + 1, limit)}
                                className="h-9 w-9 rounded-[5px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 disabled:opacity-30 transition-all hover:bg-slate-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reusable Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, docId: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Document"
                message="Are you sure you want to delete this document? This action will permanently remove the record."
                confirmText="Delete"
                variant="danger"
                icon={Trash2}
            />
        </div>
    );
};

export default DocumentList;
