// src/pages/LoginPage.tsx
import { useState } from 'react';
import { Container, Typography, Button, Box, Tabs, Tab, TextField, Alert } from '@mui/material';
import apiClient from '../api'; // Import our new API client
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore'; 


export const LoginPage = () => {
    const [tab, setTab] = useState(0); // 0 for Login, 1 for Register
    const navigate = useNavigate();

    // State for forms
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');

    const { login } = useUserStore(); // Get the login function

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password); // Use the store's login function
            window.location.href = '/'; // Redirect on success
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
            await apiClient.post('/accounts/signup/', { name, email, password, password2 });
            // After signup, allauth automatically logs the user in.
            window.location.href = '/';
        } catch (err: any) {
            setError(err.response?.data?.email?.[0] || 'Registration failed. Please try again.');
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

            {/* Login Form */}
            {tab === 0 && (
                <Box component="form" onSubmit={handleLogin}>
                    <TextField label="Email" type="email" fullWidth required margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
                    <TextField label="Password" type="password" fullWidth required margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
                    <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 2 }}>Login</Button>
                </Box>
            )}

            {/* Register Form */}
            {tab === 1 && (
                <Box component="form" onSubmit={handleRegister}>
                    <TextField label="Name" fullWidth required margin="normal" value={name} onChange={e => setName(e.target.value)} />
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
                component="a"
                href="http://127.0.0.1:8000/accounts/google/login/"
            >
                Sign in with Google
            </Button>
        </Container>
    );
};