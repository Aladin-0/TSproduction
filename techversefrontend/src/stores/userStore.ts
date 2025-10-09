// src/stores/userStore.ts - Complete version with Google OAuth support
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
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  setUserFromServer: (user: User) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  
  login: async (email, password) => {
    set({ loading: true, error: null });
    
    try {
      console.log('🔐 Attempting login for:', email);
      
      const response = await apiClient.post('/api/auth/login/', { 
        email, 
        password 
      });
      
      const { access, refresh, user } = response.data;
      
      // Store JWT tokens
      localStorage.setItem('access_token', access);
      if (refresh) {
        localStorage.setItem('refresh_token', refresh);
      }
      
      console.log('✓ Login successful, checking auth status...');
      
      // Sync cart for this user
      import('./cartStore').then(({ useCartStore }) => {
        useCartStore.getState().setCurrentUser(user.id.toString());
      }).catch(() => {});
      
      set({ 
        user, 
        isAuthenticated: true, 
        loading: false,
        error: null 
      });
      
    } catch (error: any) {
      console.error('✗ Login failed:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.non_field_errors?.[0] ||
                          'Login failed. Please check your credentials.';
      
      set({ 
        loading: false, 
        error: errorMessage,
        isAuthenticated: false,
        user: null
      });
      
      throw error;
    }
  },
  
  logout: () => {
    console.log('🚪 Logging out user');
    
    // Clear JWT tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Clear cart
    import('./cartStore').then(({ useCartStore }) => {
      useCartStore.getState().switchUser(null);
    }).catch(() => {});
    
    // Also logout from Django session
    fetch('http://127.0.0.1:8000/api/auth/logout/', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
    
    set({ 
      user: null, 
      isAuthenticated: false,
      loading: false,
      error: null
    });
    
    console.log('✓ Logout complete');
  },
  
  checkAuthStatus: async () => {
    console.log('🔍 Checking authentication status...');
    
    set({ loading: true });
    
    // First try JWT token
    const token = localStorage.getItem('access_token');
    console.log('JWT token exists:', !!token);
    
    if (token) {
      try {
        const response = await apiClient.get('/api/auth/user/');
        console.log('✓ JWT auth successful:', response.data.email);
        
        // Sync cart for this user
        import('./cartStore').then(({ useCartStore }) => {
          useCartStore.getState().setCurrentUser(response.data.id.toString());
        }).catch(() => {});
        
        set({ 
          user: response.data, 
          isAuthenticated: true,
          loading: false,
          error: null
        });
        return;
      } catch (error) {
        console.log('⚠️ JWT auth failed, removing token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    
    // If JWT fails, try session authentication
    try {
      console.log('🔍 Trying session authentication...');
      const response = await fetch('http://127.0.0.1:8000/api/auth/user/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✓ Session auth successful:', userData.email);
        
        // Sync cart for this user
        import('./cartStore').then(({ useCartStore }) => {
          useCartStore.getState().setCurrentUser(userData.id.toString());
        }).catch(() => {});
        
        set({ 
          user: userData, 
          isAuthenticated: true,
          loading: false,
          error: null
        });
        
        // Ensure CSRF cookie is set for subsequent writes
        try {
          await apiClient.get('/api/users/csrf/');
        } catch (e) {}
        
        return;
      } else {
        console.log('⚠️ Session auth failed with status:', response.status);
      }
    } catch (error) {
      console.log('⚠️ Session auth error:', error);
    }
    
    // If both fail, user is not authenticated
    console.log('❌ Authentication failed, setting unauthenticated state');
    
    // Clear cart when auth fails
    import('./cartStore').then(({ useCartStore }) => {
      useCartStore.getState().switchUser(null);
    }).catch(() => {});
    
    set({ 
      user: null, 
      isAuthenticated: false,
      loading: false,
      error: null
    });
  },
  
  updateProfile: async (data) => {
    set({ loading: true, error: null });
    
    try {
      console.log('📝 Updating profile in store with:', data);
      
      // Try JWT first; on failure, retry via Axios without JWT (session + CSRF)
      let response;
      try {
        response = await apiClient.patch('/api/users/profile/', data);
      } catch (jwtError) {
        console.log('⚠️ JWT update failed, retrying with session/CSRF...');
        // Response interceptor should have removed expired token.
        response = await apiClient.patch('/api/users/profile/', data);
      }
      
      console.log('✓ Profile updated successfully:', response.data);
      
      // Update the user state with the response data
      set({ 
        user: response.data,
        loading: false,
        error: null
      });
      
      return response.data;
    } catch (error: any) {
      console.error('✗ Profile update error in store:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          'Failed to update profile';
      
      set({ 
        loading: false,
        error: errorMessage
      });
      
      throw error;
    }
  },
  
  changePassword: async (currentPassword, newPassword) => {
    set({ loading: true, error: null });
    
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
      
      console.log('✓ Password changed successfully');
      
      set({ 
        loading: false,
        error: null
      });
      
    } catch (error: any) {
      console.error('✗ Password change error:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.current_password?.[0] ||
                          error.response?.data?.new_password?.[0] ||
                          'Failed to change password';
      
      set({ 
        loading: false,
        error: errorMessage
      });
      
      throw error;
    }
  },

  setUserFromServer: (user) => {
    // Update store state without triggering any network request
    console.log('✓ User set from server:', user.email);
    
    // Sync cart for this user
    import('./cartStore').then(({ useCartStore }) => {
      useCartStore.getState().setCurrentUser(user.id.toString());
    }).catch(() => {});
    
    set({ 
      user, 
      isAuthenticated: true,
      loading: false,
      error: null
    });
  },
}));