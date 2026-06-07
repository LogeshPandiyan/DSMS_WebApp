import axios from 'axios';
import { toast } from 'sonner';
import { getUserLocal, removeUserLocal } from '../utils/authUtils';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 20000, // 20s timeout
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request Interceptor: Inject bearer token dynamically
API.interceptors.request.use(
    (config) => {
        const user = getUserLocal();
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Standardize error notification & handle session expiry
API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // 1. Network / Connection Errors (Backend offline or internet disconnected)
        if (!error.response) {
            toast.error('Network Error: Please check if the backend server is running.', {
                id: 'network-error-toast', // Prevent multiple duplicate toasts from firing at once
            });
            return Promise.reject(error);
        }

        const { status, config } = error.response;

        // 2. 401 Unauthorized / Token Expiry handling
        if (status === 401) {
            // Check if this error is NOT from credentials verification (login, register, forgot-password, reset-password)
            const isAuthEndpoint = config.url?.includes('/auth/login') || 
                                   config.url?.includes('/auth/register') ||
                                   config.url?.includes('/auth/forgot-password') ||
                                   config.url?.includes('/auth/reset-password');
            
            if (!isAuthEndpoint) {
                removeUserLocal();
                toast.error('Session expired. Please log in again.', {
                    id: 'auth-session-expired',
                });
                
                // Slight delay before redirecting to allow the user to see the toast notification
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1000);
            }
        }

        // 3. 500+ Internal Server Error handling
        if (status >= 500) {
            toast.error('Server encountered an issue. Please try again later.', {
                id: 'server-error-toast',
            });
        }

        return Promise.reject(error);
    }
);

export default API;
