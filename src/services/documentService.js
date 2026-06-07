import API from '../api/axiosConfig';

const API_URL = '/documents';

export const uploadDocument = async (formData) => {
    try {
        const uploadedDocResponse = await API.post(`${API_URL}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return uploadedDocResponse.data;
    }
    catch (error) {
        console.error('Error in uploadDocument:', error.response?.data || error.message);
        throw error || 'Error uploading document.';
    }
};

export const getDocumentCounts = async () => {
    try {
        const documentCountsResponse = await API.get(`${API_URL}/get-counts`);
        return documentCountsResponse.data;
    } catch (error) {
        console.error('Error in getDocumentCounts:', error.response?.data || error.message);
        throw error || 'Error getting document counts';
    }
};

export const getDocuments = async (params = {}) => {
    try {
        const { status, search, page, limit } = params;
        let url = `${API_URL}/get-all?`;
        if (status) url += `status=${status}&`;
        if (search) url += `search=${search}&`;
        if (page) url += `page=${page}&`;
        if (limit) url += `limit=${limit}&`;

        const documentsListResponse = await API.get(url);
        return documentsListResponse.data;
    }
    catch (error) {
        console.error('Error in getDocuments:', error.response?.data || error.message);
        throw error || 'Error getting documents';
    }
};

export const updateDocument = async (id, data) => {
    try {
        const updatedDocumentResponse = await API.put(`${API_URL}/update/${id}`, data);
        return updatedDocumentResponse.data;
    }
    catch (error) {
        console.error('Error in updateDocument:', error.response?.data || error.message);
        throw error || 'Error updating document.';
    }
};

export const deleteDocument = async (id) => {
    try {
        const deletedDocumentResponse = await API.delete(`${API_URL}/delete/${id}`);
        return deletedDocumentResponse.data;
    }
    catch (error) {
        console.error('Error in deleteDocument:', error.response?.data || error.message);
        throw error || 'Error deleting document.';
    }
};

export const getDocumentById = async (id) => {
    try {
        const documentDetailsResponse = await API.get(`${API_URL}/get-details/${id}`);
        return documentDetailsResponse.data;
    }
    catch (error) {
        console.error('Error in getDocumentById:', error.response?.data || error.message);
        throw error || 'Error getting single document.';
    }
};

export const signDocument = async (id, payload) => {
    try {
        const signedDocumentResponse = await API.post(`${API_URL}/sign/${id}`, payload);
        return signedDocumentResponse.data;
    }
    catch (error) {
        console.error('Error in signDocument:', error.response?.data || error.message);
        throw error || 'Error signing document.';
    }
};

export const saveDocumentFields = async (id, data) => {
    try {
        const savedFieldsResponse = await API.put(`${API_URL}/save-fields/${id}`, data);
        return savedFieldsResponse.data;
    }
    catch (error) {
        console.error('Error in saveDocumentFields:', error.response?.data || error.message);
        throw error || 'Error saving document fields.';
    }
};
