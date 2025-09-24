// src/components/LoginSuccessHandler.tsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

export const LoginSuccessHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // Check if the 'login=success' parameter exists in the URL
    if (searchParams.get('login') === 'success') {
      enqueueSnackbar('Login successful!', { variant: 'success' });
      // Clean the URL by removing the query parameter
      navigate('/', { replace: true });
    }
  }, [searchParams, enqueueSnackbar, navigate]);

  // This component doesn't render anything itself
  return null;
};