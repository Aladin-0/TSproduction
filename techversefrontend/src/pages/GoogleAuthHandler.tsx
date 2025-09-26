// src/pages/GoogleAuthHandler.tsx - Handle Google login on a dedicated page
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { Box, Typography, CircularProgress } from '@mui/material';

export const GoogleAuthHandler: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Extract user info from URL hash or query parameters
    // This is a simplified example - you'd get this data from Google OAuth
    const handleGoogleCallback = async () => {
      try {
        // In a real implementation, you'd extract this from the Google OAuth response
        // For now, let's simulate getting user data
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange the code for user info (this would normally be done on your backend)
        // For demo purposes, we'll simulate this
        const mockUserData = {
          email: 'user@gmail.com', // This would come from Google
          name: 'Test User',
          google_id: '123456789'
        };

        // Send user data to your backend to create/login user
        const response = await fetch('http://127.0.0.1:8000/api/users/create-from-google/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockUserData)
        });

        if (!response.ok) {
          throw new Error('Failed to create user account');
        }

        const data = await response.json();
        
        // Store the JWT token
        localStorage.setItem('access_token', data.access);
        
        // Update the user store
        useUserStore.setState({
          user: data.user,
          isAuthenticated: true
        });

        // Redirect to home page
        navigate('/', { replace: true });
        
      } catch (error) {
        console.error('Google auth error:', error);
        navigate('/login', { replace: true });
      }
    };

    handleGoogleCallback();
  }, [navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#000',
        color: 'white'
      }}
    >
      <CircularProgress sx={{ color: '#60a5fa', mb: 3 }} />
      <Typography variant="h6" sx={{ mb: 1 }}>
        Completing your login...
      </Typography>
      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
        Please wait while we set up your account
      </Typography>
    </Box>
  );
};