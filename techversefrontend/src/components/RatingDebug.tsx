    // src/components/RatingDebug.tsx - Component to test rating API
    import React, { useState } from 'react';
    import { Button, Box, Typography, TextField, Alert } from '@mui/material';
    import apiClient from '../api';

    export const RatingDebug: React.FC = () => {
    const [testResult, setTestResult] = useState<string>('');
    const [orderId, setOrderId] = useState<string>('');
    const [rating, setRating] = useState<string>('5');

    const testEndpoint = async () => {
        try {
        const response = await apiClient.get('/services/api/ratings/test/');
        setTestResult(JSON.stringify(response.data, null, 2));
        } catch (error: any) {
        setTestResult(`Error: ${error.message}\nResponse: ${JSON.stringify(error.response?.data, null, 2)}`);
        }
    };

    const testRatingSubmission = async () => {
        try {
        const payload = {
            rating: parseInt(rating),
            comment: 'Test rating from debug component',
            order_id: parseInt(orderId)
        };
        
        console.log('Sending payload:', payload);
        
        const response = await apiClient.post('/services/api/ratings/create/', payload);
        setTestResult(`Success: ${JSON.stringify(response.data, null, 2)}`);
        } catch (error: any) {
        console.error('Rating submission error:', error);
        setTestResult(`Error: ${error.message}\nStatus: ${error.response?.status}\nResponse: ${JSON.stringify(error.response?.data, null, 2)}`);
        }
    };

    return (
        <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: '8px', m: 2 }}>
        <Typography variant="h6" gutterBottom>Rating API Debug</Typography>
        
        <Box sx={{ mb: 2 }}>
            <Button variant="outlined" onClick={testEndpoint} sx={{ mr: 2 }}>
            Test Endpoint Connection
            </Button>
        </Box>

        <Box sx={{ mb: 2 }}>
            <TextField
            label="Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            sx={{ mr: 2 }}
            size="small"
            />
            <TextField
            label="Rating (1-5)"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            sx={{ mr: 2 }}
            size="small"
            />
            <Button variant="contained" onClick={testRatingSubmission}>
            Test Rating Submission
            </Button>
        </Box>

        {testResult && (
            <Alert severity={testResult.includes('Error') ? 'error' : 'success'} sx={{ mt: 2 }}>
            <Typography component="pre" sx={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                {testResult}
            </Typography>
            </Alert>
        )}
        </Box>
    );
    };