// src/components/LoginSuccessHandler.tsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';

export const LoginSuccessHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const checkAuthStatus = useUserStore((state) => state.checkAuthStatus);

  useEffect(() => {
    // Check if the 'login=success' parameter exists in the URL
    if (searchParams.get('login') === 'success') {
      console.log('Login success detected, checking auth status...');
      
      // Refresh user authentication status
      checkAuthStatus().then(() => {
        console.log('Auth status updated, redirecting to home...');
        // Clean the URL by replacing the current entry in history
        window.history.replaceState({}, document.title, '/');
      }).catch((error) => {
        console.error('Auth check failed:', error);
        // Still clean the URL even if auth check fails
        window.history.replaceState({}, document.title, '/');
      });
    }
  }, [searchParams, checkAuthStatus]);

  // This component doesn't render anything itself
  return null;
};