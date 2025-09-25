import { create } from 'zustand';
import apiClient from '../api';

interface User {
  pk: number; // dj-rest-auth uses 'pk'
  email: string;
  name: string;
  role: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email, password) => {
    const response = await apiClient.post('/api/auth/login/', { email, password });
    // The token is in response.data.access
    localStorage.setItem('access_token', response.data.access);
    await useUserStore.getState().checkAuthStatus();
  },
  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null, isAuthenticated: false });
  },
  checkAuthStatus: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return;
    }
    try {
      // This is the correct endpoint from dj-rest-auth
      const response = await apiClient.get('/api/auth/user/');
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('access_token');
      set({ user: null, isAuthenticated: false });
    }
  },
}));