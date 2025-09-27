// src/pages/ProductDetailPage.tsx - Simple test component
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  return (
    <Box sx={{
      backgroundColor: '#000000',
      color: 'white',
      minHeight: '100vh',
      padding: '100px 60px',
      textAlign: 'center'
    }}>
      <Typography variant="h2" sx={{ mb: 3 }}>
        Product Detail Page
      </Typography>
      <Typography variant="h4" sx={{ mb: 3, color: '#60a5fa' }}>
        Product Slug: {slug}
      </Typography>
      <Typography sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.7)' }}>
        This is a test page to verify the routing is working.
        The full ProductDetailPage component should be implemented here.
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => navigate('/store')}
        sx={{ 
          backgroundColor: '#60a5fa',
          '&:hover': { backgroundColor: '#3b82f6' }
        }}
      >
        Back to Store
      </Button>
    </Box>
  );
};