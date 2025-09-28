// src/stores/userStore.ts - Fixed version without require()
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
  // Local-only setter to sync store with server-fetched user without network writes
  setUserFromServer: (user: User) => void;
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
    
    // Import cart store dynamically to avoid circular dependency
    import('./cartStore').then(({ useCartStore }) => {
      useCartStore.getState().switchUser(null);
    }).catch(() => {
      // Ignore errors during dynamic import
    });
    
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
    console.log('checkAuthStatus called');
    
    // First try JWT token
    const token = localStorage.getItem('access_token');
    console.log('JWT token exists:', !!token);
    
    if (token) {
      try {
        const response = await apiClient.get('/api/auth/user/');
        console.log('JWT auth successful:', response.data.email);
        
        // Sync cart for this user - dynamic import to avoid circular dependency
        import('./cartStore').then(({ useCartStore }) => {
          useCartStore.getState().setCurrentUser(response.data.id.toString());
        }).catch(() => {
          // Ignore errors during dynamic import
        });
        
        set({ user: response.data, isAuthenticated: true });
        return;
      } catch (error) {
        console.log('JWT auth failed, removing token');
        localStorage.removeItem('access_token');
      }
    }
    
    // If JWT fails, try session authentication
    try {
      console.log('Trying session authentication...');
      const response = await fetch('http://127.0.0.1:8000/api/auth/user/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Session auth successful:', userData.email);
        
        // Sync cart for this user - dynamic import to avoid circular dependency
        import('./cartStore').then(({ useCartStore }) => {
          useCartStore.getState().setCurrentUser(userData.id.toString());
        }).catch(() => {
          // Ignore errors during dynamic import
        });
        
        set({ user: userData, isAuthenticated: true });
        // Ensure CSRF cookie is set for subsequent writes
        try {
          await apiClient.get('/api/users/csrf/');
        } catch (e) {
          // Non-fatal: CSRF cookie may already exist
        }
        return;
      } else {
        console.log('Session auth failed with status:', response.status);
      }
    } catch (error) {
      console.log('Session auth error:', error);
    }
    
    // If both fail, user is not authenticated
    console.log('Authentication failed, setting unauthenticated state');
    
    // Clear cart when auth fails - dynamic import to avoid circular dependency
    import('./cartStore').then(({ useCartStore }) => {
      useCartStore.getState().switchUser(null);
    }).catch(() => {
      // Ignore errors during dynamic import
    });
    
    set({ user: null, isAuthenticated: false });
  },
  
  updateProfile: async (data) => {
    try {
      console.log('Updating profile in store with:', data);
      
      // Try JWT first; on failure, retry via Axios without JWT (session + CSRF)
      let response;
      try {
        response = await apiClient.patch('/api/users/profile/', data);
      } catch (jwtError) {
        console.log('JWT update failed, retrying with session/CSRF...');
        // Response interceptor should have removed expired token.
        response = await apiClient.patch('/api/users/profile/', data);
      }
      
      console.log('Profile updated successfully:', response.data);
      
      // Update the user state with the response data
      set({ user: response.data });
      
      return response.data;
    } catch (error) {
      console.error('Profile update error in store:', error);
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
        // Response interceptor should have removed expired token.
        await apiClient.post('/api/users/change-password/', {
          current_password: currentPassword,
          new_password: newPassword
        });
      }
    } catch (error) {
      throw error;
    }
  },

  setUserFromServer: (user) => {
    // Update store state without triggering any network request
    set({ user, isAuthenticated: true });
  },
}));