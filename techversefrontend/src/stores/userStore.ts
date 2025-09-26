// src/stores/userStore.ts - Session-based authentication
import { create } from 'zustand';
import apiClient from '../api';

interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
  email_notifications: boolean;
  sms_notifications: boolean;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (email, password) => {
    const response = await apiClient.post('/api/auth/login/', { email, password });
    localStorage.setItem('access_token', response.data.access);
    await get().checkAuthStatus();
  },
  
  logout: () => {
    // Clear both JWT token and session
    localStorage.removeItem('access_token');
    
    // Also logout from Django session
    fetch('http://127.0.0.1:8000/api/auth/logout/', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {
      // Ignore errors during logout
    });
    
    set({ user: null, isAuthenticated: false });
  },
  
  checkAuthStatus: async () => {
    // First try JWT token
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await apiClient.get('/api/auth/user/');
        set({ user: response.data, isAuthenticated: true });
        return;
      } catch (error) {
        localStorage.removeItem('access_token');
      }
    }
    
    // If JWT fails, try session authentication
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/user/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        set({ user: userData, isAuthenticated: true });
        return;
      }
    } catch (error) {
      console.log('Session auth failed:', error);
    }
    
    // If both fail, user is not authenticated
    set({ user: null, isAuthenticated: false });
  },
  
  updateProfile: async (data) => {
    try {
      // Try JWT first, then session
      let response;
      try {
        response = await apiClient.patch('/api/users/profile/', data);
      } catch (jwtError) {
        // Fallback to session-based request
        response = await fetch('http://127.0.0.1:8000/api/users/profile/', {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error('Profile update failed');
        }
        
        response = { data: await response.json() };
      }
      
      set({ user: response.data });
    } catch (error) {
      throw error;
    }
  },
  
  changePassword: async (currentPassword, newPassword) => {
    try {
      // Try JWT first, then session
      try {
        await apiClient.post('/api/users/change-password/', {
          current_password: currentPassword,
          new_password: newPassword
        });
      } catch (jwtError) {
        // Fallback to session-based request
        const response = await fetch('http://127.0.0.1:8000/api/users/change-password/', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword
          }),
        });
        
        if (!response.ok) {
          throw new Error('Password change failed');
        }
      }
    } catch (error) {
      throw error;
    }
  },
}));