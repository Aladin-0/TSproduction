import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000',
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
            // If token is invalid or expired, log the user out
            localStorage.removeItem('access_token');
            // We can optionally refresh the page to reset the app state
            // window.location.reload(); 
        }
        return Promise.reject(error);
    }
);

export default apiClient;