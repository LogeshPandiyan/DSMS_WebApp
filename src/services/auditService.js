import API from '../api/axiosConfig';

/**
 * Fetch all audit logs with optional filters
 * @param {Object} params - { action, userId, targetType, page, limit }
 */
export const getAuditLogs = async (params = {}) => {
    try {
        const auditLogsResponse = await API.get('/admin/logs/get-all', { params });
        return auditLogsResponse.data;
    } catch (error) {
        console.error('Error in getAuditLogs:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Failed to fetch audit logs' };
    }
};
