// src/api.ts - Updated to properly handle sessions
import axios from 'axios';
// Helper to read cookie value by name
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    withCredentials: true, // CRITICAL: Include cookies for session auth
    headers: {
        'Content-Type': 'application/json',
    },
});

// This interceptor adds the auth token to every request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Attach CSRF token for unsafe methods if not using JWT
    const method = (config.method || 'get').toUpperCase();
    const unsafe = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';
    if (unsafe && !token) {
        const csrfToken = getCookie('csrftoken');
        if (csrfToken) {
            (config.headers as any)['X-CSRFToken'] = csrfToken;
        }
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