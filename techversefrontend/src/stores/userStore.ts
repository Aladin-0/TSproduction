// src/stores/userStore.ts
import { create } from 'zustand';
import apiClient from '../api';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  checkAuthStatus: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    isAuthenticated: false,
    login: async (email, password) => { // New login function
        const response = await apiClient.post('/api/auth/login/', { email, password });
        localStorage.setItem('access_token', response.data.access_token);
        await useUserStore.getState().checkAuthStatus();
    },
    logout: () => { // New logout function
        localStorage.removeItem('access_token');
        set({ user: null, isAuthenticated: false });
    },
    checkAuthStatus: async () => {
        try {
            // This view now comes from dj-rest-auth
            const response = await apiClient.get('/api/auth/user/');
            set({ user: response.data, isAuthenticated: true });
        } catch (error) {
            set({ user: null, isAuthenticated: false });
        }
    },
}));