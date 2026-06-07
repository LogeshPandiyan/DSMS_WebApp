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

export const getDashboardStats = async () => {
    try {
        const dashboardStatsResponse = await API.get('/dashboard/get-stats');
        return dashboardStatsResponse.data;
    } catch (error) {
        console.error('Error in getDashboardStats:', error.response?.data || error.message);
        throw error;
    }
};
