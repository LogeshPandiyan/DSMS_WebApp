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
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getAllUsers, updateUserRole, deleteUser } from '../../services/adminService';
import ConfirmationModal from '../../components/ConfirmationModal';

const PortalUserTab = ({ currentUser }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null });
    const [roleModal, setRoleModal] = useState({ isOpen: false, userId: null, newRole: null, currentRole: null, userName: '' });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllUsers();
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
        const handleClickOutside = () => setOpenDropdownId(null);
        if (openDropdownId) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openDropdownId]);

    const handleDeleteConfirm = async () => {
        if (!deleteModal.userId) return;
        try {
            await deleteUser(deleteModal.userId);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch {
            toast.error('Failed to delete user');
        }
    };

    const handleRoleChange = (user, newRole) => {
        if (user.role === newRole) return;
        setRoleModal({
            isOpen: true,
            userId: user._id,
            newRole: newRole,
            currentRole: user.role,
            userName: user.name
        });
    };

    const handleRoleConfirm = async () => {
        const { userId, newRole } = roleModal;
        if (!userId || !newRole) return;
        try {
            await updateUserRole(userId, newRole);
            toast.success(`Role updated to ${newRole}`);
            fetchUsers();
        } catch {
            toast.error('Failed to update role');
        }
    };

    const getRoleBadgeStyle = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
            case 'manager':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'employee':
                return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            default:
                return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const getRoleIcon = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return <ShieldAlert className="h-3.5 w-3.5" />;
            case 'manager':
                return <Briefcase className="h-3.5 w-3.5" />;
            case 'employee':
                return <UserCircle className="h-3.5 w-3.5" />;
            default:
                return <Shield className="h-3.5 w-3.5" />;
        }
    };

    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-[10px]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-slate-800 rounded-[5px]">
                <p className="text-sm text-slate-500 font-medium">Manage platform users and their access levels.</p>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users..."
                        className="w-full md:w-72 pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[5px] text-sm font-medium focus:border-slate-400 dark:focus:border-slate-600 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-[10px]">
                {[
                    { label: 'Administrators', value: users.filter(u => u.role === 'admin').length, icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-500/10' },
                    { label: 'Managers', value: users.filter(u => u.role === 'manager').length, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-500/10' },
                    { label: 'Employees', value: users.filter(u => u.role === 'employee').length, icon: UserCircle, color: 'text-blue-600', bg: 'bg-blue-500/10' },
                    { label: 'Total users', value: users.length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-500/10' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[5px] shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                        <div>
                            <p className="text-[11px] font-medium text-slate-500 tracking-widest">
                            {stat.label}
                            </p>
                            <p className="text-3xl font-semibold text-slate-900 dark:text-white mt-1">
                            {stat.value}
                            </p>
                        </div>
                        <div className={`h-12 w-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-[13px] font-medium text-gray-800 tracking-wider border-b border-slate-200 dark:border-slate-800 w-20 text-center">Actions</th>
                                <th className="px-6 py-4 text-[13px] font-medium text-gray-800 tracking-wider border-b border-slate-200 dark:border-slate-800">User details</th>
                                <th className="px-6 py-4 text-[13px] font-medium text-gray-800 tracking-wider border-b border-slate-200 dark:border-slate-800">Email address</th>
                                <th className="px-6 py-4 text-[13px] font-medium text-gray-800 tracking-wider border-b border-slate-200 dark:border-slate-800">Access level</th>
                                <th className="px-6 py-4 text-[13px] font-medium text-gray-800 tracking-wider border-b border-slate-200 dark:border-slate-800">Joined on</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="h-6 w-6 text-primary-600 animate-spin" />
                                            <span className="text-xs font-medium text-slate-500 tracking-widest">Fetching user database...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-40">
                                            <Users className="h-12 w-12 text-slate-400" />
                                            <p className="text-sm font-medium text-slate-500 tracking-widest">No matching users found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, index) => (
                                    <tr key={user._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center relative">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenDropdownId(openDropdownId === user._id ? null : user._id);
                                                    }}
                                                    className={`h-9 w-9 rounded-[5px] flex items-center justify-center transition-all
                                                        ${openDropdownId === user._id 
                                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-white/5 shadow-sm' 
                                                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>

                                                {openDropdownId === user._id && (
                                                    <div className={`absolute ${index > 0 && index >= filteredUsers.length - 2 ? 'bottom-full mb-1' : 'top-full mt-1'} -left-2 w-[200px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150`}>
                                                        <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5 mb-1">
                                                            <p className="text-[10px] font-medium text-slate-400 tracking-widest">Modify access</p>
                                                        </div>
                                                        {['admin', 'manager', 'employee'].map(role => (
                                                            <button
                                                                key={role}
                                                                onClick={() => handleRoleChange(user, role)}
                                                                className={`w-full text-left px-3 py-2 text-xs font-medium capitalize transition-colors flex items-center justify-between
                                                                    ${user.role === role 
                                                                        ? 'text-primary-600 bg-primary-50/50 dark:bg-primary-900/10' 
                                                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                                            >
                                                                {role}
                                                                {user.role === role && <CheckCircle2 className="h-3 w-3" />}
                                                            </button>
                                                        ))}
                                                        {currentUser?.role === 'admin' && user._id !== currentUser?._id && (
                                                            <div className="mt-1 pt-1 border-t border-slate-100 dark:border-white/5">
                                                                <button
                                                                    onClick={() => setDeleteModal({ isOpen: true, userId: user._id })}
                                                                    className="w-full text-left px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                    Delete account
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-md
                                                    ${index % 3 === 0 ? 'bg-gradient-to-br from-primary-500 to-primary-700' : 
                                                      index % 3 === 1 ? 'bg-gradient-to-br from-indigo-500 to-indigo-700' : 
                                                      'bg-gradient-to-br from-violet-500 to-violet-700'}`}>
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{user.name}</p>
                                                    <p className="text-[11px] font-medium text-slate-400 tracking-tight">UID: {user._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                <Mail className="h-4 w-4 opacity-50" />
                                                <span className="text-sm font-medium">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-medium tracking-wider ${getRoleBadgeStyle(user.role)}`}>
                                                {getRoleIcon(user.role)}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                                            {new Date(user.createdAt).toLocaleDateString(undefined, { 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
        </div>
    );
};

export default PortalUserTab;
