// src/pages/LoginPage.tsx - Fixed version
import { useState } from 'react';
import { Container, Typography, Button, Box, Tabs, Tab, TextField, Alert } from '@mui/material';
import apiClient from '../api';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore'; 

export const LoginPage = () => {
    const [tab, setTab] = useState(0);
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const login = useUserStore((state) => state.login);

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
            const response = await apiClient.post('/api/auth/registration/', { 
                email, 
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
            setError(err.response?.data?.email?.[0] || err.response?.data?.non_field_errors?.[0] || 'Registration failed. Please try again.');
        }
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

            {tab === 0 && (
                <Box component="form" onSubmit={handleLogin}>
                    <TextField label="Email" type="email" fullWidth required margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
                    <TextField label="Password" type="password" fullWidth required margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
                    <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 2 }}>Login</Button>
                </Box>
            )}

            {tab === 1 && (
                <Box component="form" onSubmit={handleRegister}>
                    <TextField label="Email" type="email" fullWidth required margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
                    <TextField label="Password" type="password" fullWidth required margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
                    <TextField label="Confirm Password" type="password" fullWidth required margin="normal" value={password2} onChange={e => setPassword2(e.target.value)} />
                    <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 2 }}>Create Account</Button>
                </Box>
            )}

            <Typography align="center" sx={{ my: 2 }}>OR</Typography>

            <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => {
                    window.location.href = "http://127.0.0.1:8000/accounts/google/login/";
                }}
            >
                Sign in with Google
            </Button>
        </Container>
    );
};