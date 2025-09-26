// src/components/LoginSuccessHandler.tsx - Much simpler approach
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';

export const LoginSuccessHandler = () => {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useUserStore();

  useEffect(() => {
    if (searchParams.get('login') === 'success') {
      console.log('Google login detected, creating user account...');
      
      const createUserAccount = async () => {
        try {
          // Simulate creating a user account from Google data
          // In a real app, you'd extract this from the Google OAuth response
          const userData = {
            email: 'demo@example.com', // You'd get this from Google
            name: 'Demo User',
            google_id: '123456789'
          };

          // Create user via your backend
          const response = await fetch('http://127.0.0.1:8000/api/users/create-from-google/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
          });

          if (response.ok) {
            const data = await response.json();
            
            // Store JWT token
            localStorage.setItem('access_token', data.access);
            
            // Update user store
            useUserStore.setState({
              user: data.user,
              isAuthenticated: true
            });
            
            console.log('User logged in successfully:', data.user);
          } else {
            console.error('Failed to create user account');
          }
          
          // Clean URL
          window.history.replaceState({}, document.title, '/');
          
        } catch (error) {
          console.error('Auth error:', error);
          window.history.replaceState({}, document.title, '/');
        }
      };

      createUserAccount();
    }
  }, [searchParams]);

  useEffect(() => {
    console.log('Current auth status:', { user, isAuthenticated });
  }, [user, isAuthenticated]);

  return null;
};