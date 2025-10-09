// src/pages/LoginPage.tsx - Updated with custom Google login URL
import { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Tabs, Tab, TextField, Alert } from '@mui/material';
import apiClient from '../api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore } from '../stores/userStore'; 

export const LoginPage = () => {
    const [tab, setTab] = useState(0);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [infoMessage, setInfoMessage] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const login = useUserStore((state) => state.login);

    // Open Create Account tab when `?tab=signup` or `?tab=register` is present
    useEffect(() => {
        const t = (searchParams.get('tab') || '').toLowerCase();
        if (t === 'signup' || t === 'register') {
            setTab(1);
        }
        const info = (searchParams.get('info') || '').toLowerCase();
        if (info === 'no_account') {
            setInfoMessage("We couldn't find an account for this email. Please create your account to continue.");
        } else {
            setInfoMessage('');
        }
    }, [searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            setError('Login failed. Please check your credentials.');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== password2) {
            setError("Passwords do not match.");
            return;
        }
        try {
            // Ensure CSRF cookie is set before unsafe POST (session-based)
            try { await apiClient.get('/api/users/csrf/'); } catch {}
            const response = await apiClient.post('/api/auth/registration/', { 
                email,
                name,
                password1: password,
                password2: password2
            });
            
            // Store the token
            localStorage.setItem('access_token', response.data.access);
            
            // Update user store
            useUserStore.setState({
                user: response.data.user,
                isAuthenticated: true
            });
            
            navigate('/');
        } catch (err: any) {
            // Surface common field errors first, then fall back to flattening unknown errors
            const data = err.response?.data || {};
            let msg = data?.name?.[0]
                || data?.email?.[0]
                || data?.password1?.[0]
                || data?.password2?.[0]
                || 'Registration failed. Please try again.';
            setError(msg);
        }
    };

    const handleGoogleLogin = () => {
        // Use the custom Google login endpoint that forces account selection
        window.location.href = "http://127.0.0.1:8000/auth/google/login/";
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered>
                    <Tab label="Login" />
                    <Tab label="Create Account" />
                </Tabs>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {tab === 1 && infoMessage && (
                <Alert severity="info" sx={{ mb: 2 }}>{infoMessage}</Alert>
            )}

            {tab === 0 && (
                <Box component="form" onSubmit={handleLogin}>
                    <TextField label="Email" type="email" fullWidth required margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
                    <TextField label="Password" type="password" fullWidth required margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
                    <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 2 }}>Login</Button>
                </Box>
            )}

            {tab === 1 && (
                <Box component="form" onSubmit={handleRegister}>
                    <TextField label="Full Name" type="text" fullWidth required margin="normal" value={name} onChange={e => setName(e.target.value)} />
                    <TextField label="Email" type="email" fullWidth required margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
                    <TextField label="Password" type="password" fullWidth required margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
                    <TextField label="Confirm Password" type="password" fullWidth required margin="normal" value={password2} onChange={e => setPassword2(e.target.value)} />
                    <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 2 }}>Create Account</Button>
                </Box>
            )}

            <Typography align="center" sx={{ my: 2 }}>OR</Typography>

            {tab === 0 ? (
                <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    onClick={handleGoogleLogin}
                >
                    Sign in with Google
                </Button>
            ) : (
                <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    onClick={handleGoogleLogin}
                >
                    Sign up with Google
                </Button>
            )}
        </Container>
    );
};