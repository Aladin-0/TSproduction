// src/components/LoginSuccessHandler.tsx - Handle direct tokens
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';

export const LoginSuccessHandler = () => {
  const [searchParams] = useSearchParams();
  const { checkAuthStatus } = useUserStore();

  useEffect(() => {
    // Check if user just logged in via Google OAuth
    if (searchParams.get('login') === 'success') {
      console.log('Google OAuth login detected');
      
      // Check if we have a token in the URL
      const token = searchParams.get('token');
      if (token) {
        console.log('Token found in URL, storing...');
        localStorage.setItem('access_token', token);
        
        // Use the token to get user data
        const getUserData = async () => {
          try {
            await checkAuthStatus();
            console.log('User data fetched successfully');
          } catch (error) {
            console.error('Failed to fetch user data:', error);
          }
        };
        
        getUserData();
      }
      
      // Clean up the URL
      window.history.replaceState({}, document.title, '/');
    }
    
    // Listen for postMessage from popup window
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'http://127.0.0.1:8000') return;
      
      if (event.data.type === 'GOOGLE_LOGIN_SUCCESS') {
        console.log('Received login success message:', event.data);
        
        // Store tokens
        localStorage.setItem('access_token', event.data.tokens.access);
        localStorage.setItem('refresh_token', event.data.tokens.refresh);
        
        // Update user store
        useUserStore.setState({
          user: event.data.user,
          isAuthenticated: true
        });
        
        console.log('User logged in successfully:', event.data.user);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [searchParams, checkAuthStatus]);

  return null;
};