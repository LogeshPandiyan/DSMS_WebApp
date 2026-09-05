import React, { useEffect, useState, useCallback } from 'react';
import { 
    Users, 
    Mail, 
    Shield, 
    MoreVertical, 
    Trash2, 
    CheckCircle2, 
    Search, 
    UserCircle, 
    ShieldAlert, 
    Briefcase,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Info,
    UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { getAllUsers, updateUserRole, deleteUser, toggleUserStatus } from '../../services/adminService';
import ConfirmationModal from '../../components/ConfirmationModal';
import InviteUserOffcanvas from './InviteUserOffcanvas';

const AVAILABLE_ROLES = [
    'admin',
    'user'
];

const ROWS_PER_PAGE_OPTIONS = [
    10,
    20,
    30,
    40
];

const PortalUserTab = ({ currentUser }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null });
    const [roleModal, setRoleModal] = useState({ isOpen: false, userId: null, newRole: null, currentRole: null, userName: '' });
    const [toggleModal, setToggleModal] = useState({ isOpen: false, userId: null, isActive: null, userName: '' });
    const [showInviteOffcanvas, setShowInviteOffcanvas] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [rowsPerPageOpen, setRowsPerPageOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [isStatsPopoverOpen, setIsStatsPopoverOpen] = useState(false);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllUsers('all');
            setUsers(response.data);
        } catch {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        const handleClickOutside = () => {
            setOpenDropdownId(null);
            setRowsPerPageOpen(false);
            setIsFilterDropdownOpen(false);
            setIsStatsPopoverOpen(false);
        };
        if (openDropdownId || rowsPerPageOpen || isFilterDropdownOpen || isStatsPopoverOpen) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openDropdownId, rowsPerPageOpen, isFilterDropdownOpen, isStatsPopoverOpen]);

    const handleDeleteConfirm = async () => {
        if (!deleteModal.userId) return;
        try {
            await deleteUser(deleteModal.userId);
            toast.success('User deleted successfully');
            fetchUsers();
            setDeleteModal({ isOpen: false, userId: null, userName: '' });
        } catch {
            toast.error('Failed to delete user');
        }
    };

    const handleToggleConfirm = async () => {
        if (!toggleModal.userId) return;
        try {
            await toggleUserStatus(toggleModal.userId);
            toast.success(`User account has been ${toggleModal.isActive !== false ? 'deactivated' : 'activated'}`);
            fetchUsers();
            setToggleModal({ isOpen: false, userId: null, isActive: null, userName: '' });
        } catch {
            toast.error('Failed to update user status');
        }
    };

    const handleRoleChange = (portalUser, newRole) => {
        if (portalUser.role === newRole) return;
        setRoleModal({
            isOpen: true,
            userId: portalUser._id,
            newRole: newRole,
            currentRole: portalUser.role,
            userName: portalUser.name
        });
    };

    const handleRoleConfirm = async () => {
        const { userId, newRole } = roleModal;
        if (!userId || !newRole) return;
        try {
            await updateUserRole(userId, newRole);
            toast.success(`Role updated to ${newRole}`);
            fetchUsers();
            setRoleModal({ isOpen: false, userId: null, newRole: null, currentRole: null, userName: '' });
        } catch {
            toast.error('Failed to update role');
        }
    };

    const getRoleBadgeStyle = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
            case 'user':
                return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'guest':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            default:
                return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const getRoleIcon = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return (
                    <ShieldAlert className="h-3.5 w-3.5" />
                );
            case 'user':
                return (
                    <UserCircle className="h-3.5 w-3.5" />
                );
            case 'guest':
                return (
                    <Briefcase className="h-3.5 w-3.5" />
                );
            default:
                return (
                    <Shield className="h-3.5 w-3.5" />
                );
        }
    };

    const filteredUsers = users.filter((portalUser) => {
        if (statusFilter === 'active' && portalUser.isActive === false) return false;
        if (statusFilter === 'inactive' && portalUser.isActive !== false) return false;

        return (
            portalUser.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            portalUser.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            portalUser.role?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const totalCount = users.length;
    const activeCount = users.filter((u) => u.isActive !== false).length;
    const inactiveCount = users.filter((u) => u.isActive === false).length;

    const statusOptions = [
        { 
            label: 'All', 
            value: 'all', 
            icon: Users, 
            count: totalCount 
        },
        { 
            label: 'Active', 
            value: 'active', 
            icon: CheckCircle2, 
            count: activeCount 
        },
        { 
            label: 'Inactive', 
            value: 'inactive', 
            icon: ShieldAlert, 
            count: inactiveCount 
        }
    ];
    
    const activeFilterOption = statusOptions.find((opt) => opt.value === statusFilter) || statusOptions[0];

    const userStatCards = [
        { 
            label: 'Administrators', 
            value: users.filter((u) => u.role === 'admin').length, 
            icon: ShieldAlert, 
            color: 'text-rose-600', 
            bg: 'bg-rose-500/10' 
        },
        { 
            label: 'Registered Users', 
            value: users.filter((u) => u.role === 'user').length, 
            icon: UserCircle, 
            color: 'text-blue-600', 
            bg: 'bg-blue-500/10' 
        },
        { 
            label: 'Guest Signers', 
            value: users.filter((u) => u.role === 'guest').length, 
            icon: Briefcase, 
            color: 'text-amber-600', 
            bg: 'bg-amber-500/10' 
        },
        { 
            label: 'Total users', 
            value: users.length, 
            icon: Users, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-500/10' 
        }
    ];

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-[10px]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-slate-800 rounded-[5px]">
                
                {/* Left Side: Filter Dropdown & Stats Info */}
                <div className="flex items-center gap-3">
                    <div className="relative w-fit">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFilterDropdownOpen(!isFilterDropdownOpen);
                                setOpenDropdownId(null);
                                setRowsPerPageOpen(false);
                            }}
                            className={`px-4 min-w-[130px] h-[42px] text-[13px] font-bold transition-all rounded-[5px] flex items-center gap-3 whitespace-nowrap border justify-between shadow-sm bg-white dark:bg-slate-900/50 backdrop-blur-md
                                ${isFilterDropdownOpen 
                                    ? 'border-primary-500 ring-1 ring-primary-500/10 text-slate-900 dark:text-white' 
                                    : 'text-slate-600 dark:text-slate-350 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            <div className="flex items-center gap-2">
                                <activeFilterOption.icon className="h-4 w-4 text-primary-500" />
                                <span>
                                    {activeFilterOption.label}
                                </span>
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ml-1">
                                    {activeFilterOption.count}
                                </span>
                            </div>
                            <ChevronDown className={`h-3.5 w-3.5 text-slate-450 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Filter Dropdown Menu */}
                        {isFilterDropdownOpen && (
                            <div className="absolute left-0 mt-2 w-full min-w-[180px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[5px] shadow-2xl z-[1000] p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* Decorative pointer arrow on the top */}
                                <div className="absolute left-6 -top-1.5 w-2.5 h-2.5 rotate-45 bg-white dark:bg-slate-900 border-t border-l border-slate-200 dark:border-white/5 z-0"></div>
                                
                                <div className="relative z-10 space-y-1">
                                    {statusOptions.map((statusOption) => {
                                        const isActive = statusOption.value === statusFilter;
                                        return (
                                            <button
                                                key={statusOption.value}
                                                onClick={() => {
                                                    setStatusFilter(statusOption.value);
                                                    setIsFilterDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-[4px] transition-all
                                                    ${isActive 
                                                        ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/20' 
                                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <statusOption.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-450 group-hover:text-primary-500'}`} />
                                                    <span>
                                                        {statusOption.label}
                                                    </span>
                                                </div>
                                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-primary-700 text-primary-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                                    {statusOption.count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative w-fit">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsStatsPopoverOpen(!isStatsPopoverOpen);
                            }}
                            className={`h-8 w-8 flex items-center justify-center rounded-full transition-all border
                                ${isStatsPopoverOpen 
                                    ? 'bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-400' 
                                    : 'bg-white border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-primary-900/20'}`}
                        >
                            <Info className="h-4 w-4" />
                        </button>

                        {/* Stats Dropdown Menu */}
                        {isStatsPopoverOpen && (
                            <div className="absolute left-0 mt-2 w-[260px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[5px] shadow-2xl z-[1000] p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="space-y-2">
                                    {userStatCards.map((userStat, statIndex) => (
                                        <div 
                                            key={statIndex} 
                                            className="flex items-center justify-between p-2 rounded-[5px] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-[5px] flex items-center justify-center ${userStat.bg}`}>
                                                    <userStat.icon className={`h-4 w-4 ${userStat.color}`} />
                                                </div>
                                                <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300">
                                                    {userStat.label}
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                {userStat.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Search & Add User */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative group flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search users..."
                            className="w-full md:w-72 pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[5px] text-sm font-medium focus:border-slate-400 dark:focus:border-slate-600 outline-none transition-all"
                        />
                    </div>
                    {currentUser?.role === 'admin' && (
                        <button 
                            onClick={() => setShowInviteOffcanvas(true)}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-[5px] text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors"
                        >
                            <UserPlus className="h-4 w-4" />
                            <span>
                                Add User
                            </span>
                        </button>
                    )}
                </div>
            </div>

            <div className="relative">
                <div className="w-full overflow-x-auto min-h-[260px] rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-500">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-[13px] font-medium text-gray-800 tracking-wider border-b border-slate-200 dark:border-slate-800 w-20 text-center">
                                    Action
                                </th>
                                <th className="px-6 py-4 text-[13px] font-medium text-gray-800 tracking-wider border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">
                                    User Name
                                </th>
                                <th className="px-6 py-4 text-[13px] font-medium text-gray-800 tracking-wider border-b border-slate-200 dark:border-slate-800">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-[13px] font-medium text-gray-800 tracking-wider border-b border-slate-200 dark:border-slate-800">
                                    Designation
                                </th>
                                <th className="px-6 py-4 text-[13px] font-medium text-gray-800 tracking-wider border-b border-slate-200 dark:border-slate-800">
                                    Department
                                </th>
                                <th className="px-6 py-4 text-[13px] font-medium text-gray-800 tracking-wider border-b border-slate-200 dark:border-slate-800">
                                    Role
                                </th>
                                <th className="px-6 py-4 text-[13px] font-medium text-gray-800 tracking-wider border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">
                                    Invitation Status
                                </th>
                                <th className="px-6 py-4 text-[13px] font-medium text-gray-800 tracking-wider border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">
                                    Invitation Link
                                </th>
                                <th className="px-6 py-4 text-[13px] font-medium text-gray-800 tracking-wider border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">
                                    Password Updated At
                                </th>
                                <th className="px-6 py-4 text-[13px] font-medium text-gray-800 tracking-wider border-b border-slate-200 dark:border-slate-800">
                                    Action
                                </th>
                                <th className="px-6 py-4 text-[13px] font-medium text-gray-800 tracking-wider border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">
                                    Added At
                                </th>
                                <th className="px-6 py-4 text-[13px] font-medium text-gray-800 tracking-wider border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">
                                    Status Modified By
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td 
                                        colSpan="12" 
                                        className="px-6 py-20 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="h-6 w-6 text-primary-600 animate-spin" />
                                            <span className="text-xs font-medium text-slate-500 tracking-widest">
                                                Fetching user database...
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td 
                                        colSpan="12" 
                                        className="px-6 py-20 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-3 opacity-40">
                                            <Users className="h-12 w-12 text-slate-400" />
                                            <p className="text-sm font-medium text-slate-500 tracking-widest">
                                                No matching users found
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentItems.map((portalUser, userIndex) => (
                                <tr 
                                    key={portalUser._id} 
                                    className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    {/* Action Column */}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center relative">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const nextId = openDropdownId === portalUser._id ? null : portalUser._id;
                                                    setOpenDropdownId(nextId);
                                                    if (nextId) {
                                                        setIsFilterDropdownOpen(false);
                                                        setRowsPerPageOpen(false);
                                                    }
                                                }}
                                                className={`h-9 w-9 rounded-[5px] flex items-center justify-center transition-all
                                                    ${openDropdownId === portalUser._id 
                                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-white/5 shadow-sm' 
                                                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </button>

                                            {openDropdownId === portalUser._id && (
                                                <div className={`absolute ${userIndex > 0 && userIndex >= currentItems.length - 2 ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 w-[200px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150`}>
                                                    <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5 mb-1">
                                                        <p className="text-[10px] font-medium text-slate-400 tracking-widest">
                                                            Modify access
                                                        </p>
                                                    </div>
                                                    {AVAILABLE_ROLES.map((roleName) => (
                                                        <button
                                                            key={roleName}
                                                            onClick={() => handleRoleChange(portalUser, roleName)}
                                                            className={`w-full text-left px-3 py-2 text-xs font-medium capitalize rounded-[4px] transition-colors flex items-center justify-between
                                                                ${portalUser.role === roleName 
                                                                    ? 'text-primary-600 bg-primary-50/50 dark:bg-primary-900/10' 
                                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                                        >
                                                            <span>
                                                                {roleName}
                                                            </span>
                                                            {portalUser.role === roleName && (
                                                                <CheckCircle2 className="h-3 w-3" />
                                                            )}
                                                        </button>
                                                    ))}
                                                    {currentUser?.role === 'admin' && portalUser._id !== currentUser?._id && (
                                                        <div className="mt-1 pt-1 border-t border-slate-100 dark:border-white/5">
                                                            <button
                                                                onClick={() => setDeleteModal({ isOpen: true, userId: portalUser._id })}
                                                                className="w-full text-left px-3 py-2 text-xs font-medium text-red-500 rounded-[4px] hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                <span>
                                                                    Delete account
                                                                </span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* User Name Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-md
                                                ${userIndex % 3 === 0 ? 'bg-gradient-to-br from-primary-500 to-primary-700' : 
                                                  userIndex % 3 === 1 ? 'bg-gradient-to-br from-indigo-500 to-indigo-700' : 
                                                  'bg-gradient-to-br from-violet-500 to-violet-700'}`}>
                                                {portalUser.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                                                    {portalUser.name}
                                                </p>
                                                <p className="text-[11px] font-medium text-slate-400 tracking-tight">
                                                    UID: {portalUser._id.slice(-6)}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Email Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <Mail className="h-4 w-4 opacity-50" />
                                            <span className="text-sm font-medium">
                                                {portalUser.email}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Designation Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                                            {portalUser.jobTitle || '-'}
                                        </span>
                                    </td>

                                    {/* Department Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                                            {portalUser.department || '-'}
                                        </span>
                                    </td>

                                    {/* Role Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-medium tracking-wider ${getRoleBadgeStyle(portalUser.role)}`}>
                                            {getRoleIcon(portalUser.role)}
                                            <span>
                                                {portalUser.role}
                                            </span>
                                        </span>
                                    </td>

                                    {/* Invitation Status Column */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {portalUser.isInvited ? (
                                            <span className="text-slate-500">
                                                Sent
                                            </span>
                                        ) : (
                                            <span className="text-emerald-500">
                                                Accepted
                                            </span>
                                        )}
                                    </td>

                                    {/* Invitation Link Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {portalUser.isInvited ? (
                                            <button className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-full text-[11px] font-medium transition-colors shadow-sm">
                                                Link
                                            </button>
                                        ) : (
                                            <span className="text-[13px] text-slate-400">
                                                No link found
                                            </span>
                                        )}
                                    </td>

                                    {/* Password Updated At Column */}
                                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-slate-600 dark:text-slate-400">
                                        {portalUser.passwordUpdatedAt ? new Date(portalUser.passwordUpdatedAt).toLocaleString('en-GB') : '-'}
                                    </td>

                                    {/* Action (Toggle Active) Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className={`w-9 h-5 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${portalUser.isActive !== false ? 'bg-primary-500' : 'bg-slate-300'}`}
                                                onClick={() => setToggleModal({
                                                    isOpen: true,
                                                    userId: portalUser._id,
                                                    isActive: portalUser.isActive,
                                                    userName: portalUser.name
                                                })}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${portalUser.isActive !== false ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                            <span className="text-[11px] font-medium text-slate-600">
                                                {portalUser.isActive !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Added At Column */}
                                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-slate-600 dark:text-slate-400">
                                        {new Date(portalUser.createdAt).toLocaleString('en-GB', { 
                                            day: '2-digit', 
                                            month: '2-digit', 
                                            year: 'numeric', 
                                            hour: '2-digit', 
                                            minute: '2-digit', 
                                            hour12: true 
                                        })}
                                    </td>

                                    {/* Status Modified By Column */}
                                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-slate-600 dark:text-slate-400">
                                        {portalUser.statusChangedBy ? `${portalUser.isActive !== false ? 'Activated by' : 'Deactivated by'} ${portalUser.statusChangedBy}` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {filteredUsers.length > 0 && (
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between mt-[-10px] shadow-sm rounded-b-lg">
                    <p className="text-xs text-slate-500 font-bold capitalize tracking-wide hidden md:block">
                        Page {currentPage} of {totalPages || 1}
                    </p>
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-bold capitalize tracking-wide">
                                Rows per page:
                            </span>
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
                                    <span>
                                        {itemsPerPage}
                                    </span>
                                    <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${rowsPerPageOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {rowsPerPageOpen && (
                                    <div className="absolute bottom-full mb-2 left-0 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] shadow-2xl z-[100] p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                        {ROWS_PER_PAGE_OPTIONS.map((pageSize) => (
                                            <button
                                                key={pageSize}
                                                onClick={() => {
                                                    setItemsPerPage(pageSize);
                                                    setCurrentPage(1);
                                                    setRowsPerPageOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-[3px] transition-colors
                                                    ${itemsPerPage === pageSize 
                                                        ? 'bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white' 
                                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                            >
                                                {pageSize}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <span className="text-xs text-slate-500 font-bold capitalize tracking-wide">
                            {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                className="h-9 w-9 rounded-[5px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 disabled:opacity-30 transition-all hover:bg-slate-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                disabled={currentPage >= totalPages || totalPages === 0}
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                className="h-9 w-9 rounded-[5px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 disabled:opacity-30 transition-all hover:bg-slate-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, userId: null })}
                onConfirm={handleDeleteConfirm}
                title="Permanently delete account"
                message="Are you sure you want to delete this user? This action is irreversible and all their documents will be unlinked."
                confirmText="Delete account"
                variant="danger"
                icon={Trash2}
            />

            <ConfirmationModal
                isOpen={roleModal.isOpen}
                onClose={() => setRoleModal({ isOpen: false, userId: null, newRole: null, currentRole: null, userName: '' })}
                onConfirm={handleRoleConfirm}
                title="Change access level"
                message={`Are you sure you want to change the access level of ${roleModal.userName} from ${roleModal.currentRole} to ${roleModal.newRole}?`}
                confirmText="Modify access"
                variant="primary"
                icon={Shield}
            />

            <ConfirmationModal
                isOpen={toggleModal.isOpen}
                onClose={() => setToggleModal({ isOpen: false, userId: null, isActive: null, userName: '' })}
                onConfirm={handleToggleConfirm}
                title={toggleModal.isActive !== false ? "Deactivate Account" : "Activate Account"}
                message={`Are you sure you want to ${toggleModal.isActive !== false ? 'deactivate' : 'activate'} the account for ${toggleModal.userName}?`}
                confirmText={toggleModal.isActive !== false ? "Deactivate" : "Activate"}
                variant={toggleModal.isActive !== false ? "danger" : "primary"}
                icon={toggleModal.isActive !== false ? ShieldAlert : CheckCircle2}
            />

            <InviteUserOffcanvas  
                isOpen={showInviteOffcanvas}
                onClose={() => setShowInviteOffcanvas(false)}
                onUserInvited={fetchUsers}
            />
        </div>
    );
};

export default PortalUserTab;
