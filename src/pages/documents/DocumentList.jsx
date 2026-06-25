import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { getDocuments, deleteDocument } from '../../services/documentService';
import {
    FileText, Clock, CheckCircle2, MoreVertical, Eye, Download, Trash2, Plus,
    ChevronLeft, ChevronRight, ChevronDown, User, Calendar, PenTool, Layout,
    Inbox, FileCheck2, FileEdit, X, Shield, Monitor, MapPin
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
    const [selectedDocDetails, setSelectedDocDetails] = useState(null);
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
        const uploadedBy = doc.uploadedBy?.userId || doc.uploadedBy?._id || doc.uploadedBy;
        return currentUser?.role === 'admin' || uploadedBy === (currentUser?.userId || currentUser?._id);
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
                            setOpenDropdownId(null);
                            setRowsPerPageOpen(false);
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
                                <th className="px-6 py-4 text-[12px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">Created Date</th>
                                <th className="px-6 py-4 text-[12px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center text-[10px] text-slate-400 font-bold capitalize tracking-wide">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                            Syncing Records...
                                        </div>
                                    </td>
                                </tr>
                            ) : documents.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <FileText className="h-10 w-10 text-slate-200" />
                                            <p className="text-slate-400 text-[10px] font-black capitalize tracking-wide">No Documents Found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                documents.map((doc, index) => (
                                    <tr key={doc.documentId || doc._id} className="even:bg-slate-50/50 dark:even:bg-slate-800/20 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const nextId = openDropdownId === (doc.documentId || doc._id) ? null : (doc.documentId || doc._id);
                                                        setOpenDropdownId(nextId);
                                                        if (nextId) {
                                                            setIsFilterDropdownOpen(false);
                                                            setRowsPerPageOpen(false);
                                                        }
                                                    }}
                                                    className={`h-9 w-9 rounded-[5px] flex items-center justify-center transition-all
                                                        ${openDropdownId === (doc.documentId || doc._id)
                                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/5'
                                                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>

                                                {openDropdownId === (doc.documentId || doc._id) && (
                                                    <div className={`absolute ${index > 4 ? 'bottom-full mb-1' : 'top-full mt-1'} -left-2 w-[216px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] shadow-2xl z-[9999] py-2 animate-in fade-in zoom-in-95 duration-150`}>
                                                        {(doc.status === 'pending' || doc.status === 'partially_signed') && (
                                                            (Array.isArray(doc.assignedTo) && doc.assignedTo.some(a => (a.userId || a._id || a) === (currentUser?.userId || currentUser?._id))) ||
                                                            ((doc.assignedTo?.userId || doc.assignedTo?._id || doc.assignedTo) === (currentUser?.userId || currentUser?._id))
                                                        ) && (
                                                                !doc.signatures?.some(sig => (sig.userId || sig.user?.userId || sig.user?._id || sig.user) === (currentUser?.userId || currentUser?._id))
                                                            ) && (
                                                                <div className="px-1.5">
                                                                    <button
                                                                        onClick={() => navigate(`/sign/${doc.documentId || doc._id}`)}
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
                                                                    onClick={() => navigate(`/prepare/${doc.documentId || doc._id}`)}
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

                                                            {doc.signatures && doc.signatures.length > 0 && (
                                                                <button
                                                                    onClick={() => setSelectedDocDetails(doc)}
                                                                    className="w-full px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-600 transition-all flex items-center gap-3 rounded-[4px]"
                                                                >
                                                                    <FileCheck2 className="h-4 w-4" />
                                                                    Signature Details
                                                                </button>
                                                            )}

                                                            {canAction(doc) && (
                                                                <>
                                                                    <button
                                                                        onClick={() => setDeleteModal({ isOpen: true, docId: doc.documentId || doc._id })}
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
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[300px]" title={doc.documentTitle || doc.title}>
                                                {doc.documentTitle || doc.title}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{doc.uploadedBy?.userName || doc.uploadedBy?.name || 'Unknown'}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            {Array.isArray(doc.assignedTo) && doc.assignedTo.length > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center">
                                                        {doc.assignedTo[0].userName || doc.assignedTo[0].name}
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
                                                                                {user.userName || user.name}
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
                                                                const hasSigned = doc.signatures?.some(sig => (sig.userId || sig.user?._id || sig.user || '').toString() === (user.userId || user._id || user || '').toString());
                                                                return (
                                                                    <div key={idx} className="whitespace-nowrap flex items-center justify-between gap-4">
                                                                        <span className={`${hasSigned ? 'text-slate-200' : 'text-slate-400'}`}>{user.userName || user.name}</span>
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
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-350">
                                                    {new Date(doc.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Clock className="h-4 w-4 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-350">
                                                    {new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
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
                                        const nextOpen = !rowsPerPageOpen;
                                        setRowsPerPageOpen(nextOpen);
                                        if (nextOpen) {
                                            setOpenDropdownId(null);
                                            setIsFilterDropdownOpen(false);
                                        }
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
                        <span className="text-xs text-slate-500 font-bold capitalize tracking-wide">
                            {pagination.totalDocuments > 0 
                                ? `${(pagination.currentPage - 1) * limit + 1}–${Math.min(pagination.currentPage * limit, pagination.totalDocuments)} of ${pagination.totalDocuments}` 
                                : '0–0 of 0'}
                        </span>
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

            {/* Signature Verification Details Modal */}
            {selectedDocDetails && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm dark:bg-slate-950/80" 
                        onClick={() => setSelectedDocDetails(null)}
                    />
                    
                    {/* Modal */}
                    <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 w-full max-w-2xl rounded-[5px] shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] flex flex-col overflow-hidden">
                        
                        {/* Sticky Header Wrapper */}
                        <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 p-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                            {/* Close Button */}
                            <button 
                                type="button"
                                onClick={() => setSelectedDocDetails(null)}
                                className="absolute right-4 top-4 h-8 w-8 rounded-md bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            {/* Title */}
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Signature verification details
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">
                                    Document Name: <span className="text-slate-900 dark:text-white font-bold">{selectedDocDetails.documentTitle || selectedDocDetails.title}</span>
                                </p>
                            </div>

                            {/* Verification Status Banner */}
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20 rounded-[5px] flex gap-3">
                                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs text-emerald-800 dark:text-emerald-400 font-bold">
                                        Securely signed and verified
                                    </p>
                                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-500/80 font-medium leading-relaxed mt-0.5">
                                        All signatures listed below have been electronically captured, encrypted, and recorded in the audit logs.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Signers list container */}
                        <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar space-y-4">
                            {selectedDocDetails.signatures.map((sig, index) => {
                                // Find user profile details
                                const signerUser = selectedDocDetails.assignedTo?.find(u => (u.userId || u._id || u).toString() === (sig.userId || sig.user?._id || sig.user || '').toString()) || sig;
                                const inkName = sig.color === '#000000' ? 'Black' : sig.color === '#0033cc' ? 'Blue' : sig.color === '#cc0000' ? 'Red' : sig.color || 'Default';

                                return (
                                    <div key={index} className="border border-slate-250 dark:border-slate-800/80 rounded-[5px] p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/10">
                                        {/* Signer Profile */}
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                                                        user name: <span className="text-sm font-bold text-slate-900 dark:text-white ml-1">{signerUser?.userName || signerUser?.name || sig.userName || 'Unknown Signer'}</span>
                                                    </p>
                                                    <span className="text-slate-200 dark:text-slate-800 hidden sm:inline">|</span>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                                                        email id: <span className="text-xs font-semibold text-slate-900 dark:text-white ml-1">{signerUser?.email || sig.user?.email || 'Unknown Email'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider">Signed</span>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                            
                                            {/* Left Column: Signature Drawing */}
                                            <div className="space-y-2">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Signature preview</p>
                                                <div className="h-20 w-full bg-white border border-slate-200 dark:border-slate-800 rounded flex items-center justify-center p-2 shadow-inner">
                                                    {sig.signatureData ? (
                                                        <img src={sig.signatureData} alt="Signature" className="max-h-full max-w-full object-contain" />
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400">No signature image data</span>
                                                    )}
                                                </div>
                                                
                                                {/* Ink Color Indicator */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[11px] text-slate-400 font-bold">Ink color:</span>
                                                    <div 
                                                        className="h-3 w-3 rounded-full border border-slate-300 shadow-sm"
                                                        style={{ backgroundColor: sig.color || '#000000' }}
                                                    />
                                                    <span className="text-[11px] text-slate-600 dark:text-slate-350 font-bold capitalize">{inkName}</span>
                                                </div>
                                            </div>

                                            {/* Right Column: Metadata Proofs */}
                                            <div className="space-y-2.5">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Security proofs</p>
                                                
                                                {/* Timestamp */}
                                                <div className="flex items-center gap-2.5">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-bold">Date and time</p>
                                                        <p className="text-slate-800 dark:text-slate-200 font-bold">
                                                            {new Date(sig.signedAt).toLocaleString('en-GB', { hour12: true })}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* IP Address */}
                                                <div className="flex items-center gap-2.5">
                                                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-bold">IP address</p>
                                                        <p className="text-slate-800 dark:text-slate-200 font-bold">
                                                            {sig.ipAddress || 'Not recorded'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Device/Browser */}
                                                <div className="flex items-center gap-2.5">
                                                    <Monitor className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-bold">Device and browser</p>
                                                        <p className="text-slate-800 dark:text-slate-200 font-bold">
                                                            {sig.browser || sig.os ? `${sig.browser || 'Unknown Browser'} (${sig.os || 'Unknown OS'})` : 'Not recorded'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentList;
