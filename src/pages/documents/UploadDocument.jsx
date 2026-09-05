import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { uploadDocument } from '../../services/documentService';
import { getAllUsers } from '../../services/adminService';
import { 
    Upload, 
    FileText, 
    Loader2, 
    CheckCircle2, 
    X, 
    Users, 
    Info, 
    ArrowRight,
    UserCheck,
    Briefcase,
    Check,
    Search
} from 'lucide-react';
import { toast } from 'sonner';

const workflowSteps = [
    {
        icon: FileText,
        label: 'Document name',
        desc: 'Write document name'
    },
    {
        icon: Users,
        label: 'Assign Signers',
        desc: 'Select who needs to sign'
    },
    {
        icon: FileText,
        label: 'Upload PDF',
        desc: 'Securely upload your document'
    },
    {
        icon: ArrowRight,
        label: 'Prepare Fields',
        desc: 'Place signature boxes (next step)'
    }
];

const UploadDocument = () => {
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState(false);
    const [assignedTo, setAssignedTo] = useState([]);
    const [customEmails, setCustomEmails] = useState('');
    const [selfSign, setSelfSign] = useState(false);
    const [availableSigners, setAvailableSigners] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [openRoleDropdown, setOpenRoleDropdown] = useState(null); // 'admin', 'manager', 'user', or null
    const [assignmentMode, setAssignmentMode] = useState('single'); // 'single' or 'roles'
    const [signerSearch, setSignerSearch] = useState('');
    const { user: currentUser } = useOutletContext();
    const navigate = useNavigate();
    const singleRef = useRef(null);
    const adminRef = useRef(null);
    const managerRef = useRef(null);
    const userRef = useRef(null);

    // Outside click handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (singleRef.current && !singleRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (openRoleDropdown) {
                let activeRef = null;
                if (openRoleDropdown === 'admin') activeRef = adminRef;
                if (openRoleDropdown === 'manager') activeRef = managerRef;
                if (openRoleDropdown === 'user') activeRef = userRef;
                
                if (activeRef && activeRef.current && !activeRef.current.contains(event.target)) {
                    setOpenRoleDropdown(null);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openRoleDropdown]);

    const toggleUser = (id) => {
        setAssignedTo(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (assignedTo.length === availableSigners.length) {
            setAssignedTo([]);
        } else {
            setAssignedTo(availableSigners.map(e => e._id));
        }
    };

    const toggleAllInRole = (role) => {
        const roleUsers = availableSigners.filter(u => u.role === role);
        const roleUserIds = roleUsers.map(u => u._id);
        const allSelected = roleUserIds.every(id => assignedTo.includes(id));
        
        if (allSelected) {
            setAssignedTo(prev => prev.filter(id => {
                const user = availableSigners.find(u => u._id === id);
                return user?.role !== role;
            }));
        } else {
            setAssignedTo(prev => {
                const filtered = prev.filter(id => {
                    const user = availableSigners.find(u => u._id === id);
                    return user?.role !== role;
                });
                return [...filtered, ...roleUserIds];
            });
        }
    };

    const removeUser = (id, e) => {
        e.stopPropagation();
        setAssignedTo(prev => prev.filter(i => i !== id));
    };

    useEffect(() => {
        const fetchSigners = async () => {
            try {
                const data = await getAllUsers();
                // Filter out the current user to prevent selecting themselves in the dropdown
                const otherUsers = data.data.filter(u => u._id !== currentUser?._id);
                setAvailableSigners(otherUsers);
            } catch {
                console.error('Failed to fetch signers');
            }
        };

        if (currentUser?.role === 'admin') {
            fetchSigners();
        } else if (currentUser) {
            navigate('/dashboard');
            toast.error('Not authorized to upload documents');
        }
    }, [currentUser, navigate]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setFileError(false);
        } else {
            toast.error('Please select a valid PDF file');
            e.target.value = null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const hasTitle = !!title.trim();
        const hasRecipients = assignedTo.length > 0 || selfSign || !!customEmails.trim();

        if (!file) {
            setFileError(true);
            if (!hasTitle || !hasRecipients) {
                toast.error('Please fill in all fields and select at least one recipient');
            }
            return;
        }

        if (!hasTitle || !hasRecipients) {
            return toast.error('Please fill in all fields and select at least one recipient');
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('document', file);
        
        let finalRecipients = [...assignedTo];
        if (selfSign && !finalRecipients.includes(currentUser._id)) {
            finalRecipients.push(currentUser._id);
        }
        
        formData.append('assignedTo', finalRecipients);
        formData.append('customEmails', customEmails);

        try {
            const response = await uploadDocument(formData);
            toast.success('Document uploaded successfully!');
            
            const docId = response.data?.documentId || response.data?._id;
            if (docId) {
                navigate(`/prepare/${docId}`);
            } else {
                navigate('/documents');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const renderRoleDropdown = (role, RoleIcon, roleLabel) => {
        const usersInRole = availableSigners.filter(u => u.role === role);
        const selectedInRole = assignedTo.filter(id => {
            const u = availableSigners.find(x => x._id === id);
            return u?.role === role;
        });
        const isRoleDropdownOpen = openRoleDropdown === role;

        const ref = role === 'admin' ? adminRef : role === 'manager' ? managerRef : userRef;

        return (
            <div className="relative" ref={ref}>
                <button
                    type="button"
                    onClick={() => {
                        setOpenRoleDropdown(isRoleDropdownOpen ? null : role);
                        setSignerSearch('');
                        setDropdownOpen(false);
                    }}
                    className={`w-full p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-[5px] text-left flex items-center justify-between transition-all focus:border-primary-500 min-h-[50px]
                        ${isRoleDropdownOpen ? 'border-primary-500 ring-1 ring-primary-500/10' : ''}`}
                >
                    <div className="flex items-center gap-2.5">
                        <div className={`h-8 w-8 rounded-[5px] flex items-center justify-center transition-all ${selectedInRole.length > 0 ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                            <RoleIcon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {selectedInRole.length === 0 ? `Select ${roleLabel}` : `${selectedInRole.length} ${roleLabel} Selected`}
                        </span>
                    </div>
                    <svg className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180 text-primary-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isRoleDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] shadow-2xl z-[999] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 ring-1 ring-black/5">
                        <div className="p-2 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex flex-col gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={`Search ${roleLabel.toLowerCase()}...`}
                                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[4px] text-[11px] text-slate-900 dark:text-white outline-none focus:border-primary-500 transition-all font-bold placeholder:font-medium placeholder:text-slate-400"
                                    value={signerSearch}
                                    onChange={(e) => setSignerSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => toggleAllInRole(role)}
                                className="w-full px-2 py-1.5 text-left flex items-center gap-2.5 transition-colors rounded-[4px] hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                <div className={`h-4 w-4 rounded-[4px] border flex items-center justify-center transition-all ${selectedInRole.length === usersInRole.length && usersInRole.length > 0 ? 'bg-primary-600 border-primary-600 text-white shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm'}`}>
                                    {selectedInRole.length === usersInRole.length && usersInRole.length > 0 && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
                                </div>
                                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 capitalize tracking-wide">
                                    Select All {roleLabel} ({usersInRole.length})
                                </span>
                            </button>
                        </div>

                        <div className="max-h-52 overflow-y-auto custom-scrollbar p-1">
                            {usersInRole
                                .filter(u => u.name.toLowerCase().includes(signerSearch.toLowerCase()) || u.email.toLowerCase().includes(signerSearch.toLowerCase()))
                                .map(signerUser => (
                                    <button
                                        key={signerUser._id}
                                        type="button"
                                        onClick={() => toggleUser(signerUser._id)}
                                        className={`w-full px-2 py-2 text-left flex items-center gap-2.5 transition-all rounded-[4px] mb-0.5 border
                                            ${assignedTo.includes(signerUser._id) ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-500/20' : 'hover:bg-slate-50 dark:hover:bg-white/5 border-transparent'}`}
                                    >
                                        <div className={`h-4 w-4 rounded-[4px] border flex items-center justify-center transition-all ${assignedTo.includes(signerUser._id) ? 'bg-primary-600 border-primary-600 text-white shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm'}`}>
                                            {assignedTo.includes(signerUser._id) && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-bold ${assignedTo.includes(signerUser._id) ? 'text-primary-700 dark:text-primary-400' : 'text-slate-900 dark:text-white'}`}>
                                                {signerUser.name}
                                            </span>
                                            <span className="text-[9px] text-slate-400">
                                                {signerUser.email}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            {usersInRole.filter(u => u.name.toLowerCase().includes(signerSearch.toLowerCase()) || u.email.toLowerCase().includes(signerSearch.toLowerCase())).length === 0 && (
                                <div className="py-6 text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        No users found
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-500 py-4 px-2">
            <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                {/* Center/Left: The Form */}
                <div className="w-full lg:flex-1">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] p-6 shadow-sm space-y-5 relative h-full">
                        
                        <div className="space-y-5 relative z-20">
                            {/* Document Title Section */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[13px] font-bold text-slate-900 dark:text-white block">
                                        Document Title
                                    </label>
                                    
                                    {/* Toggle selection mode */}
                                    <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-[5px] border border-slate-200 dark:border-slate-700/60 shadow-sm">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAssignmentMode('single');
                                                setOpenRoleDropdown(null);
                                                setDropdownOpen(false);
                                            }}
                                            className={`px-3 py-1 text-[10px] font-bold rounded-[3.5px] transition-all capitalize
                                                ${assignmentMode === 'single' 
                                                    ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm border border-slate-200/50 dark:border-white/5' 
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                        >
                                            <span>
                                                All Users
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAssignmentMode('roles');
                                                setOpenRoleDropdown(null);
                                                setDropdownOpen(false);
                                            }}
                                            className={`px-3 py-1 text-[10px] font-bold rounded-[3.5px] transition-all capitalize
                                                ${assignmentMode === 'roles' 
                                                    ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm border border-slate-200/50 dark:border-white/5' 
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                        >
                                            <span>
                                                By Roles
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Enter Document Titile"
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[5px] text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500 transition-all font-bold placeholder:font-medium"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Options Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Self Sign Toggle */}
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-900 dark:text-white block ml-1">
                                        My Signature
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setSelfSign(!selfSign)}
                                        className={`w-full p-3 rounded-[5px] border flex items-center justify-between transition-all ${selfSign ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className={`h-8 w-8 rounded-[5px] flex items-center justify-center transition-all ${selfSign ? 'bg-primary-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                                <UserCheck className="h-4 w-4" />
                                            </div>
                                            <span className={`text-xs font-bold ${selfSign ? 'text-primary-700 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                                I need to sign
                                            </span>
                                        </div>
                                        <div className={`h-5 w-5 rounded-[4px] border flex items-center justify-center transition-all ${selfSign ? 'bg-primary-600 border-primary-600 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm'}`}>
                                            {selfSign && <Check className="h-3.5 w-3.5 text-white" strokeWidth={4} />}
                                        </div>
                                    </button>
                                </div>

                                {/* Row 1 Right: Assign Signers (Single mode) OR Select Admins (Roles mode) */}
                                <div className="space-y-1.5">
                                    {assignmentMode === 'single' ? (
                                        <>
                                            <label className="text-[13px] font-bold text-slate-900 dark:text-white block ml-1">
                                                Assign Signers
                                            </label>
                                            <div className="relative" ref={singleRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setDropdownOpen(!dropdownOpen);
                                                        setSignerSearch('');
                                                    }}
                                                    className={`w-full p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-[5px] text-left flex items-center justify-between transition-all focus:border-primary-500 min-h-[50px]
                                                        ${dropdownOpen ? 'border-primary-500' : ''}`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-8 w-8 rounded-[5px] bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                                            <Briefcase className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                                            {assignedTo.length === 0 ? 'Select Signers' : `${assignedTo.length} Selected`}
                                                        </span>
                                                    </div>
                                                    <svg className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>

                                                {dropdownOpen && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] shadow-2xl z-[999] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 ring-1 ring-black/5">
                                                        <div className="p-2 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex flex-col gap-2">
                                                            <div className="relative">
                                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search by name or email..."
                                                                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[4px] text-[11px] text-slate-900 dark:text-white outline-none focus:border-primary-500 transition-all font-bold placeholder:font-medium placeholder:text-slate-400"
                                                                    value={signerSearch}
                                                                    onChange={(e) => setSignerSearch(e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={toggleAll}
                                                                className="w-full px-2 py-1.5 text-left hover:bg-white dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors rounded-[5px]"
                                                            >
                                                                <div className={`h-4 w-4 rounded-[4px] border flex items-center justify-center transition-all ${assignedTo.length === availableSigners.length && availableSigners.length > 0 ? 'bg-primary-600 border-primary-600 text-white shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm'}`}>
                                                                    {assignedTo.length === availableSigners.length && availableSigners.length > 0 && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
                                                                </div>
                                                                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 capitalize tracking-wide">
                                                                    Select All ({availableSigners.length})
                                                                </span>
                                                            </button>
                                                        </div>

                                                        <div className="max-h-72 overflow-y-auto custom-scrollbar">
                                                            {['admin', 'user'].map(role => {
                                                                const usersInRole = availableSigners.filter(u => 
                                                                    u.role === role && 
                                                                    (u.name.toLowerCase().includes(signerSearch.toLowerCase()) || 
                                                                     u.email.toLowerCase().includes(signerSearch.toLowerCase()))
                                                                );
                                                                if (usersInRole.length === 0) return null;

                                                                return (
                                                                    <div key={role} className="p-1">
                                                                        <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 capitalize tracking-wide bg-slate-50 dark:bg-white/5 rounded-[4px] mb-1">
                                                                            {role}s ({usersInRole.length})
                                                                        </div>
                                                                        {usersInRole.map(signerUser => (
                                                                            <button
                                                                                key={signerUser._id}
                                                                                type="button"
                                                                                onClick={() => toggleUser(signerUser._id)}
                                                                                className={`w-full px-2 py-2 text-left flex items-center gap-2.5 transition-all rounded-[5px] mb-0.5 border
                                                                                    ${assignedTo.includes(signerUser._id) ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-500/20' : 'hover:bg-slate-50 dark:hover:bg-white/5 border-transparent'}`}
                                                                            >
                                                                                <div className={`h-4 w-4 rounded-[4px] border flex items-center justify-center transition-all ${assignedTo.includes(signerUser._id) ? 'bg-primary-600 border-primary-600 text-white shadow-sm' : 'bg-white dark:bg-slate-805 border-slate-300 dark:border-slate-600 shadow-sm'}`}>
                                                                                    {assignedTo.includes(signerUser._id) && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
                                                                                </div>

                                                                                <div className="flex flex-col">
                                                                                    <span className={`text-xs font-bold ${assignedTo.includes(signerUser._id) ? 'text-primary-700 dark:text-primary-400' : 'text-slate-900 dark:text-white'}`}>
                                                                                        {signerUser.name}
                                                                                    </span>
                                                                                    <span className="text-[9px] text-slate-400">
                                                                                        {signerUser.email}
                                                                                    </span>
                                                                                </div>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                );
                                                            })}
                                                            {availableSigners.filter(u => 
                                                                (u.name.toLowerCase().includes(signerSearch.toLowerCase()) || 
                                                                 u.email.toLowerCase().includes(signerSearch.toLowerCase()))
                                                            ).length === 0 && (
                                                                <div className="py-8 text-center">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                        No users found
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <label className="text-[13px] font-bold text-slate-900 dark:text-white block ml-1">
                                                Select Admins
                                            </label>
                                            {renderRoleDropdown('admin', UserCheck, 'Admins')}
                                        </>
                                    )}
                                </div>

                                {/* Row 2: Select Users (Only if roles mode!) */}
                                {assignmentMode === 'roles' && (
                                    <div className="space-y-1.5">
                                        <label className="text-[13px] font-bold text-slate-900 dark:text-white block ml-1">
                                            Select Users
                                        </label>
                                        {renderRoleDropdown('user', Users, 'Users')}
                                    </div>
                                )}
                            </div>

                            {/* Custom Recipient Emails (Optional) */}
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-slate-900 dark:text-white block ml-1">
                                    Custom Recipient Emails (Optional, comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={customEmails}
                                    onChange={(e) => setCustomEmails(e.target.value)}
                                    placeholder="Enter email address"
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-[5px] text-xs font-medium outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                />
                                <p className="text-[12px] text-slate-400 ml-1">
                                    Separate multiple emails with commas. Users will be automatically created in the database.
                                </p>
                            </div>

                            {/* Selected Chips */}
                            {assignedTo.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {assignedTo.map(id => {
                                        const signerUser = availableSigners.find(e => e._id === id);
                                        return (
                                            <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] shadow-sm animate-in zoom-in-95 duration-150">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">
                                                    {signerUser?.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => removeUser(id, e)}
                                                    className="ml-0.5 p-0.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors group"
                                                >
                                                    <X className="h-3 w-3 text-slate-400 group-hover:text-red-500" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Upload Area Section */}
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-slate-900 dark:text-white block ml-1">
                                    Document Attachment <span className="text-red-500">*</span>
                                </label>
                                <div className={`group relative border-2 border-dashed rounded-[5px] p-8 text-center transition-all duration-300 
                                    ${fileError 
                                        ? 'border-red-500 bg-red-50/10 dark:bg-red-950/10' 
                                        : file 
                                            ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/10' 
                                            : 'border-slate-200 dark:border-slate-800 hover:border-primary-500 hover:bg-primary-50/10 dark:hover:bg-primary-950/10'
                                    }`}>
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                                        <div className={`h-12 w-12 rounded-[5px] flex items-center justify-center transition-all duration-300 ${file ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 group-hover:!bg-primary-600 group-hover:text-white group-hover:shadow-md'}`}>
                                            {file ? <CheckCircle2 className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {file ? file.name : 'Click to upload PDF'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold capitalize tracking-wide">
                                                {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document` : 'Max size: 10MB'}
                                            </p>
                                        </div>
                                        {!file && (
                                            <div className="mt-1 px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[5px] text-[10px] font-black capitalize tracking-wide text-slate-600 dark:text-slate-300 shadow-sm transition-all group-hover:border-primary-500/30 group-hover:text-primary-600">
                                                Choose File
                                            </div>
                                        )}
                                    </label>
                                </div>
                                {fileError && (
                                    <p className="text-xs text-red-500 font-bold mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                        Document attachment is required
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2 relative z-10">
                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 rounded-[5px] shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span className="capitalize tracking-wide text-xs">
                                            Uploading...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="capitalize tracking-wide text-xs">
                                            Initialize Workflow
                                        </span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Side: Info & Context */}
                <div className="w-full lg:w-[330px] lg:shrink-0">
                    <div className="border border-slate-200 dark:border-slate-800 rounded-[5px] p-5 space-y-5 bg-white dark:bg-slate-900 h-full">

                        <div className="space-y-2">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                Upload Document
                            </h2>
                            <p className="text-slate-500 font-semibold dark:text-slate-400 text-[12px] leading-relaxed">
                                Initialize a new signing workflow by uploading a PDF and assigning recipients.
                            </p>
                        </div>

                        <div className="space-y-2 pt-2">
                            <h3 className="text-[11px] font-black tracking-wide text-slate-500">
                                Workflow Steps
                            </h3>
                            <div className="space-y-2">
                                {workflowSteps.map((workflowStep, stepIndex) => (
                                    <div 
                                        key={stepIndex} 
                                        className="flex gap-3 p-3 rounded-[5px] border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/50 shadow-sm transition-all hover:bg-slate-50"
                                    >
                                        <div className="h-8 w-8 rounded-[5px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary-600 shrink-0 border border-slate-200/50">
                                            <workflowStep.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-bold text-slate-900 dark:text-white">
                                                {workflowStep.label}
                                            </p>
                                            <p className="text-[13px] text-slate-400">
                                                {workflowStep.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-[5px] border border-blue-100 dark:border-blue-900/30 flex gap-3">
                            <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-blue-800 dark:text-blue-400 font-bold leading-relaxed">
                                Ensure your document is in PDF format and does not exceed 10MB.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadDocument;
