// src/api.ts - Updated to support both JWT and session auth
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    withCredentials: true, // Always include cookies for session auth
});

// This interceptor adds the auth token to every request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// This interceptor handles token errors globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // If JWT token is invalid or expired, remove it
            // Don't automatically logout - let session auth try
            const token = localStorage.getItem('access_token');
            if (token) {
                localStorage.removeItem('access_token');
                console.log('JWT token expired, trying session auth...');
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;