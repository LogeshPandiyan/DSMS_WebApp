import API from '../api/axiosConfig';

export const getAllUsers = async (status = 'all') => {
    try {
        const response = await API.get(`/admin/users/get-all?status=${status}`);
        return response.data;
    } catch (error) {
        console.error('Error in getAllUsers:', error.response?.data || error.message);
        throw error;
    }
};

export const updateUserRole = async (userId, role) => {
    try {
        const updatedRoleResponse = await API.put(`/admin/users/update-role/${userId}`, { role });
        return updatedRoleResponse.data;
    } catch (error) {
        console.error('Error in updateUserRole:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const deletedUserResponse = await API.delete(`/admin/users/delete/${userId}`);
        return deletedUserResponse.data;
    } catch (error) {
        console.error('Error in deleteUser:', error.response?.data || error.message);
        throw error;
    }
};

export const toggleUserStatus = async (userId) => {
    try {
        const toggleResponse = await API.put(`/admin/users/toggle-status/${userId}`);
        return toggleResponse.data;
    } catch (error) {
        console.error('Error in toggleUserStatus:', error.response?.data || error.message);
        throw error;
    }
};
