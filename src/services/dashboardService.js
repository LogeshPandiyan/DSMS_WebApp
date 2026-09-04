import API from '../api/axiosConfig';

export const getUserProfile = async () => {
    try {
        const userProfileResponse = await API.get('/dashboard/get-profile');
        return userProfileResponse.data;
    } catch (error) {
        console.error('Error in getUserProfile:', error.response?.data || error.message);
        throw error;
    }
};

export const getDashboardStats = async (params = {}) => {
    try {
        const dashboardStatsResponse = await API.get('/dashboard/get-stats', { params });
        return dashboardStatsResponse.data;
    } catch (error) {
        console.error('Error in getDashboardStats:', error.response?.data || error.message);
        throw error;
    }
};

export const getNotifications = async () => {
    try {
        const response = await API.get('/notifications');
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

export const markNotificationsAsRead = async () => {
    try {
        const response = await API.put('/notifications/read-all');
        return response.data;
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        throw error;
    }
};

export const clearAllNotifications = async () => {
    try {
        const response = await API.delete('/notifications/clear-all');
        return response.data;
    } catch (error) {
        console.error('Error clearing notifications:', error);
        throw error;
    }
};

export const markNotificationAsRead = async (id) => {
    try {
        const response = await API.put(`/notifications/${id}/read`);
        return response.data;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};
