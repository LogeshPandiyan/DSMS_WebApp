import React, { useRef } from 'react';
import { 
    User, 
    Camera, 
    Mail, 
    Loader2, 
    Save, 
    Phone, 
    Briefcase, 
    Building2, 
    MapPin, 
    FileText, 
    Calendar, 
    Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const ProfileTab = ({ 
    userData, 
    name, 
    setName, 
    avatar, 
    setAvatar,
    phone, 
    setPhone, 
    jobTitle, 
    setJobTitle, 
    department, 
    setDepartment, 
    bio, 
    setBio, 
    location, 
    setLocation, 
    loading, 
    handleProfileUpdate 
}) => {
    const fileInputRef = useRef(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 2 * 1024 * 1024) {
                toast.error('Image size should be less than 2MB');
                return;
            }
            const fileReader = new FileReader();
            fileReader.onloadend = () => {
                setAvatar(fileReader.result);
                toast.success('Avatar updated! Save profile to persist changes.');
            };
            fileReader.readAsDataURL(selectedFile);
        }
    };

    const handleRemoveAvatar = (event) => {
        event.stopPropagation();
        setAvatar('');
        toast.info('Avatar removed. Save profile to persist.');
    };

    // Format member since date
    const memberSinceFormattedDate = userData?.createdAt 
        ? new Date(userData.createdAt).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        })
        : 'N/A';

    // Get name initial
    const firstLetter = name 
        ? name.charAt(0).toUpperCase() 
        : (userData?.name ? userData.name.charAt(0).toUpperCase() : 'U');

    return (
        <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarChange} 
            />

            {/* Profile Overview Card */}
            <section className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left p-6 bg-white dark:bg-slate-900 rounded-[8px] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                
                {/* Avatar Uploader UI */}
                <div 
                    onClick={handleAvatarClick} 
                    className="relative group shrink-0 cursor-pointer"
                >
                    <div className="h-28 w-28 rounded-full bg-slate-50 dark:bg-slate-800 border-[3px] border-slate-100 dark:border-slate-700 shadow-inner flex items-center justify-center overflow-hidden transition-colors group-hover:border-gray-300 dark:group-hover:border-primary-500">
                        {avatar ? (
                            <img 
                                src={avatar} 
                                alt="Avatar" 
                                className="h-full w-full object-cover" 
                            />
                        ) : (
                            <div className="h-full w-full bg-primary-600 text-white flex items-center justify-center text-4xl font-bold select-none">
                                {firstLetter}
                            </div>
                        )}
                    </div>
                    
                    {/* Camera Overlay Icon */}
                    <button 
                        type="button"
                        className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 hover:bg-slate-700 transition-colors"
                    >
                        <Camera className="h-3.5 w-3.5" />
                    </button>
                    
                    {/* Trash/Remove Icon if avatar is present */}
                    {avatar && (
                        <button 
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 hover:bg-rose-700 transition-colors"
                            title="Remove picture"
                        >
                            <Trash2 className="h-3 w-3" />
                        </button>
                    )}
                </div>

                {/* Explicitly Structured Info Section */}
                <div className="flex-1 space-y-2.5 py-1 w-full text-left">
                    <div className="flex flex-col gap-2.5 text-sm font-medium">
                        <div className="flex items-center gap-3">
                            <span className="text-slate-500 dark:text-slate-400 w-16 shrink-0 text-left">
                                Name:
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 font-semibold">
                                {userData?.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-slate-500 dark:text-slate-400 w-16 shrink-0 text-left">
                                Role:
                            </span>
                            <span className={`inline-flex items-center px-3 py-0.5 border text-xs font-semibold rounded-full ${
                                userData?.role?.toLowerCase() === 'admin' 
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                                    : userData?.role?.toLowerCase() === 'guest'
                                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                                    : 'bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20'
                            }`}>
                                {userData?.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : ''}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-slate-500 dark:text-slate-400 w-16 shrink-0 text-left">
                                Email:
                            </span>
                            <span className="text-slate-800 dark:text-slate-200">
                                {userData?.email}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-slate-500 dark:text-slate-400 w-16 shrink-0 text-left">
                                Joined:
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span>
                                    {memberSinceFormattedDate}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Profile Form */}
            <form 
                onSubmit={handleProfileUpdate} 
                className="space-y-6"
            >
                {/* Personal Information Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[8px] p-6 shadow-sm space-y-5">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                        <User className="h-4 w-4 text-primary-600" />
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            Personal information
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Display Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                Display name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[5px] text-sm font-medium focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-colors shadow-sm focus:ring-1 focus:ring-primary-500/20 text-slate-800 dark:text-slate-200"
                                    placeholder="Enter your full name"
                                    required
                                />
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                Phone number
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(event) => setPhone(event.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[5px] text-sm font-medium focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-colors shadow-sm focus:ring-1 focus:ring-primary-500/20 text-slate-800 dark:text-slate-200"
                                    placeholder="+1 (555) 000-0000"
                                />
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            </div>
                        </div>

                        {/* Email Address (ReadOnly) */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                Email address (primary)
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={userData?.email || ''}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800/80 rounded-[5px] text-sm font-medium text-slate-500 dark:text-slate-500 outline-none cursor-not-allowed transition-colors"
                                />
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Work Profile Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[8px] p-6 shadow-sm space-y-5">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-primary-600" />
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            Professional profile
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Job Title */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                Job title
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={jobTitle}
                                    onChange={(event) => setJobTitle(event.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[5px] text-sm font-medium focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-colors shadow-sm focus:ring-1 focus:ring-primary-500/20 text-slate-800 dark:text-slate-200"
                                    placeholder="e.g. UX Designer"
                                />
                                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            </div>
                        </div>

                        {/* Department */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                Department
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={department}
                                    onChange={(event) => setDepartment(event.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[5px] text-sm font-medium focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-colors shadow-sm focus:ring-1 focus:ring-primary-500/20 text-slate-800 dark:text-slate-200"
                                    placeholder="e.g. Marketing"
                                />
                                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                Location
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(event) => setLocation(event.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[5px] text-sm font-medium focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-colors shadow-sm focus:ring-1 focus:ring-primary-500/20 text-slate-800 dark:text-slate-200"
                                    placeholder="e.g. Remote / New York"
                                />
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            </div>
                        </div>

                        {/* Biography / About me */}
                        <div className="space-y-2 md:col-span-3">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                Bio / Short description
                            </label>
                            <div className="relative">
                                <textarea
                                    value={bio}
                                    onChange={(event) => setBio(event.target.value)}
                                    rows={4}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[5px] text-sm font-medium focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-colors shadow-sm focus:ring-1 focus:ring-primary-500/20 resize-none text-slate-800 dark:text-slate-200"
                                    placeholder="Tell us a little bit about yourself, your skills, or your role..."
                                />
                                <FileText className="absolute left-3.5 top-4 h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end pt-1">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-[5px] text-xs font-bold flex items-center gap-2 shadow-md shadow-primary-600/10 hover:shadow-primary-600/20 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>
                                    Saving changes...
                                </span>
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                <span>
                                    Save profile
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileTab;
