import API from '../api/axiosConfig';

export const register = async (userData) => {
    try {
        const registeredUserResult = await API.post('/auth/register', userData);
        return registeredUserResult.data;
    } catch (error) {
        console.error('RegisterUser Error:', error.response?.data || error.message);
        throw error;
    }
};

export const login = async (credentials) => {
    try {
        const loginResult = await API.post('/auth/login', credentials);
        return loginResult.data;
    } catch (error) {
        console.error('LoginUser Error:', error.response?.data || error.message);
        throw error;
    }
};

export const logout = async () => {
    try {
        const logoutResult = await API.post('/auth/logout');
        return logoutResult.data;
    } catch (error) {
        console.error('LogoutUser Error:', error.response?.data || error.message);
        throw error;
    }
};

export const getMe = async () => {
    try {
        const currentUserData = await API.get('/auth/me');
        return currentUserData.data;
    } catch (error) {
        console.error('GetMe Error:', error.response?.data || error.message);
        throw error;
    }
};

export const updateProfile = async (profileData) => {
    try {
        const updatedProfileData = await API.put('/auth/profile', profileData);
        return updatedProfileData.data;
    } catch (error) {
        console.error('UpdateProfile Error:', error.response?.data || error.message);
        throw error;
    }
};

export const updateSignature = async (signature) => {
    try {
        const updatedSignatureData = await API.put('/auth/signature', { signature });
        return updatedSignatureData.data;
    } catch (error) {
        console.error('UpdateSignature Error:', error.response?.data || error.message);
        throw error;
    }
};

export const updateNotifications = async (settings) => {
    try {
        const updatedSettingsData = await API.put('/auth/notifications', settings);
        return updatedSettingsData.data;
    } catch (error) {
        console.error('UpdateNotifications Error:', error.response?.data || error.message);
        throw error;
    }
};

export const updatePassword = async (passwordData) => {
    try {
        const updatedPasswordData = await API.put('/auth/update-password', passwordData);
        return updatedPasswordData.data;
    } catch (error) {
        console.error('UpdatePassword Error:', error.response?.data || error.message);
        throw error;
    }
};
