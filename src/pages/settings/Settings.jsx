import React, { useState, useEffect, useRef } from 'react';
import { User, Users, PenTool, Bell, Shield, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { getMe, updateProfile, updateSignature, updateNotifications, updatePassword } from '../../services/authService';

// Import Modular Tab Components
import ProfileTab from './ProfileTab';
import PortalUserTab from './PortalUserTab';
import SignatureTab from './SignatureTab';
import NotificationsTab from './NotificationsTab';
import SecurityTab from './SecurityTab';

const Settings = () => {
    const { user: currentUser, setUser: setGlobalUser } = useOutletContext();
    const routeLocation = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(routeLocation.search);
    const urlTab = queryParams.get('tab');

    const [activeTab, setActiveTabState] = useState(urlTab || 'profile');
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);

    // Profile State
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [phone, setPhone] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [department, setDepartment] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');

    // Signature State
    const [sigType, setSigType] = useState('draw');
    const [uploadedSignature, setUploadedSignature] = useState(null);
    const sigPad = useRef(null);

    // Notification State
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        documentRequest: true,
        documentCompleted: true
    });

    // Password State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await getMe();
                const user = response.data.user; 
                setUserData(user);
                setName(user.name);
                setAvatar(user.avatar || '');
                setPhone(user.phone || '');
                setJobTitle(user.jobTitle || '');
                setDepartment(user.department || '');
                setBio(user.bio || '');
                setLocation(user.location || '');
                setNotifications(user.notificationSettings || notifications);
            } 
            catch {
                toast.error('Failed to load settings');
            } 
            finally {
                setFetching(false);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        if (urlTab) {
            setActiveTabState(urlTab);
        } 
        else {
            navigate('?tab=profile', { replace: true });
        }
    }, [urlTab, navigate]);

    const setActiveTab = (tabId) => {
        setActiveTabState(tabId);
        navigate(`?tab=${tabId}`);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await updateProfile({ 
                name, 
                avatar,
                phone,
                jobTitle,
                department,
                bio,
                location
            });
            setUserData(response.data);
            setGlobalUser(response.data);
            toast.success('Profile updated successfully');
        } 
        catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } 
        finally {
            setLoading(false);
        }
    };

    const clearSignature = () => {
        if (sigType === 'draw') {
            sigPad.current?.clear();
        }
        else {
            setUploadedSignature(null);
        }
    };

    const handleSignatureUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedSignature(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveSignature = async () => {
        let signatureData = null;

        if (sigType === 'draw') {
            if (!sigPad.current) {
                return toast.error('Signature pad not initialized');
            }
            
            try {
                // getCanvas gets the raw HTML canvas element directly, avoiding buggy trimming logic
                const canvas = sigPad.current.getCanvas();
                signatureData = canvas.toDataURL('image/png');
                
                // Optional: Check if it's literally an empty canvas string, but we trust the user clicked save after drawing
            } catch (err) {
                console.error("Signature extraction error", err);
                return toast.error('Failed to process signature image');
            }
        } 
        else if (sigType === 'upload') {
            if (!uploadedSignature) {
                return toast.error('Please upload a signature image first');
            }
            signatureData = uploadedSignature;
        }

        setLoading(true);
        try {
            const response = await updateSignature(signatureData);
            setUserData(response.data);
            setGlobalUser(response.data);
            toast.success('Signature saved successfully');
            setUploadedSignature(null);
        } 
        catch {
            toast.error('Failed to save signature');
        } 
        finally {
            setLoading(false);
        }
    };

    const handleNotificationToggle = async (key, value) => {
        // Optimistic UI update
        const newNotifications = { ...notifications, [key]: value };
        setNotifications(newNotifications);
        
        try {
            const response = await updateNotifications(newNotifications);
            setUserData(response.data);
            setGlobalUser(response.data);
            toast.success('Notification preferences updated');
        } catch {
            // Revert on failure
            setNotifications(notifications);
            toast.error('Failed to update notifications');
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return toast.error('Passwords do not match');
        }
        setLoading(true);
        try {
            await updatePassword({
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            toast.success('Password updated successfully');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="h-10 w-10 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 font-medium tracking-wide">Loading preferences...</p>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-sm text-slate-500 font-medium">Failed to load user settings.</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="text-primary-600 hover:underline text-xs font-medium"
                >
                    Try refreshing the page
                </button>
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User, roles: ['admin', 'user'] },
        { id: 'portal-user', label: 'Portal user', icon: Users, roles: ['admin'] },
        { id: 'signature', label: 'Signature', icon: PenTool, roles: ['admin', 'user'] },
        { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'user'] },
        { id: 'security', label: 'Security', icon: Shield, roles: ['admin', 'user'] },
    ].filter(tab => tab.roles.includes(userData?.role));

    const isValidTab = tabs.some(tab => tab.id === activeTab);

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] shadow-sm overflow-hidden flex flex-col">
                {/* Horizontal Tab Navigation */}
                <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 px-2 bg-slate-50/50 dark:bg-white/[0.02]">
                    <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2.5 px-5 py-2 rounded-[5px] text-[12px] font-medium tracking-wide transition-all relative whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white'
                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 dark:text-slate-400 dark:hover:text-white'
                                }`}
                            >
                                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <main className="flex-1 p-[10px] min-h-[500px]">
                    {!isValidTab ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 space-y-4">
                            <ShieldAlert className="h-12 w-12 text-[#12b79f]" />
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Settings Tab Not Found</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                                The settings tab you are trying to access does not exist.
                            </p>
                            <button 
                                onClick={() => setActiveTab('profile')}
                                style={{ backgroundColor: '#12b79f' }}
                                className="px-4 py-2 text-white rounded-[5px] text-xs font-bold shadow-sm"
                            >
                                Go to Profile
                            </button>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'profile' && (
                                <ProfileTab 
                                    userData={userData}
                                    name={name}
                                    setName={setName}
                                    avatar={avatar}
                                    setAvatar={setAvatar}
                                    phone={phone}
                                    setPhone={setPhone}
                                    jobTitle={jobTitle}
                                    setJobTitle={setJobTitle}
                                    department={department}
                                    setDepartment={setDepartment}
                                    bio={bio}
                                    setBio={setBio}
                                    location={location}
                                    setLocation={setLocation}
                                    loading={loading}
                                    handleProfileUpdate={handleProfileUpdate}
                                />
                            )}

                            {activeTab === 'portal-user' && (
                                <PortalUserTab 
                                    currentUser={currentUser}
                                />
                            )}

                            {activeTab === 'signature' && (
                                <SignatureTab 
                                    sigType={sigType}
                                    setSigType={setSigType}
                                    sigPad={sigPad}
                                    userData={userData}
                                    clearSignature={clearSignature}
                                    saveSignature={saveSignature}
                                    loading={loading}
                                    uploadedSignature={uploadedSignature}
                                    handleSignatureUpload={handleSignatureUpload}
                                />
                            )}

                            {activeTab === 'notifications' && (
                                <NotificationsTab 
                                    notifications={notifications}
                                    onToggle={handleNotificationToggle}
                                />
                            )}

                            {activeTab === 'security' && (
                                <SecurityTab 
                                    passwords={passwords}
                                    setPasswords={setPasswords}
                                    handlePasswordUpdate={handlePasswordUpdate}
                                    loading={loading}
                                />
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Settings;
