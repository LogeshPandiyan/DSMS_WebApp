import React, { useState, useEffect } from 'react';
import { X, UserPlus, Loader2, Copy, CheckCircle2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import API from '../../api/axiosConfig';

const InviteUserOffcanvas = ({ isOpen, onClose, onUserInvited }) => {
    const [loading, setLoading] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

    const roleOptions = [
        { label: 'Employee', value: 'employee' },
        { label: 'Manager', value: 'manager' },
        { label: 'Admin', value: 'admin' }
    ];

    useEffect(() => {
        const handleClickOutside = () => {
            setIsRoleDropdownOpen(false);
        };
        if (isRoleDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isRoleDropdownOpen]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        jobTitle: '',
        department: '',
        location: '',
        role: 'employee',
        phone: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post('/auth/invite', formData);
            if (res.data.success) {
                setInviteLink(res.data.data.inviteUrl);
                toast.success('User invited successfully');
                if (onUserInvited) onUserInvited();
            }
        } 
        catch (error) {
            toast.error(error.response?.data?.message || 'Failed to invite user');
        } 
        finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Invite link copied to clipboard');
    };

    const resetAndClose = () => {
        setFormData({ name: '', email: '', jobTitle: '', department: '', location: '', role: 'employee', phone: '' });
        setInviteLink('');
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={resetAndClose}
            ></div>

            {/* Offcanvas Panel */}
            <div className={`fixed inset-y-0 right-0 w-full max-w-[650px] bg-white dark:bg-slate-900 shadow-2xl z-[70] flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg flex items-center justify-center">
                            <UserPlus className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Invite New User</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Add a user to the organization</p>
                        </div>
                    </div>
                    <button 
                        onClick={resetAndClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[7px] transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {inviteLink ? (
                        <div className="space-y-6 flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-500">
                            <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center">User Invited!</h3>
                            <p className="text-sm text-slate-500 text-center -mt-4">
                                Share this link with the user to help them set up their account password.
                            </p>
                            
                            <div className="w-full relative group mt-4">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={inviteLink}
                                    className="w-full pr-12 pl-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 outline-none"
                                />
                                <button 
                                    onClick={handleCopy}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 rounded-md text-slate-600 transition-colors"
                                    title="Copy Link"
                                >
                                    {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>

                            <button 
                                onClick={resetAndClose}
                                className="w-full mt-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <form id="invite-form" onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 capitalize tracking-wide">Full Name *</label>
                                <input 
                                    type="text" name="name" required value={formData.name} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 capitalize tracking-wide">Email Address *</label>
                                <input 
                                    type="email" name="email" required value={formData.email} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500"
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-350 capitalize tracking-wide">Select Role *</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsRoleDropdownOpen(!isRoleDropdownOpen);
                                            }}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500 flex items-center justify-between transition-all"
                                        >
                                            <span className="capitalize">{formData.role}</span>
                                            <ChevronDown className={`h-4 w-4 text-slate-450 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isRoleDropdownOpen && (
                                            <div className="absolute left-0 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 p-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                                {roleOptions.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, role: opt.value });
                                                            setIsRoleDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-md transition-colors capitalize
                                                            ${formData.role === opt.value 
                                                                ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/20' 
                                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-350 capitalize tracking-wide">Phone</label>
                                    <input 
                                        type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 capitalize tracking-wide">Job Title / Designation</label>
                                <input 
                                    type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500"
                                    placeholder="Enter designation"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 capitalize tracking-wide">Department</label>
                                    <input 
                                        type="text" name="department" value={formData.department} onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500"
                                        placeholder="Enter department"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 capitalize tracking-wide">Location</label>
                                    <input 
                                        type="text" name="location" value={formData.location} onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500"
                                        placeholder="Enter location"
                                    />
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {!inviteLink && (
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                        <button 
                            type="submit" 
                            form="invite-form"
                            disabled={loading}
                            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Invitation'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default InviteUserOffcanvas;
