// src/pages/ServiceRequestPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useServiceStore } from '../stores/serviceStore';
import { useProductStore } from '../stores/productStore'; // Using this for addresses
import { Container, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextField, Button, Select, MenuItem, InputLabel, Box, Collapse } from '@mui/material';
import axios from 'axios';

export const ServiceRequestPage = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();

    // State from Zustand stores
    const { categories } = useServiceStore();
    const { addresses, fetchAddresses } = useProductStore();

    // State for the main service request form
    const [selectedIssue, setSelectedIssue] = useState<string>('');
    const [customDescription, setCustomDescription] = useState('');
    const [selectedAddress, setSelectedAddress] = useState<string>('');

    // State for the NEW address form
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');

    useEffect(() => {
        const initializeAddresses = async () => {
            await fetchAddresses();
        };
        initializeAddresses();
    }, [fetchAddresses]);

    // Pre-select the default address once addresses are loaded
    useEffect(() => {
        const defaultAddress = addresses.find(addr => addr.is_default);
        if (defaultAddress) {
            setSelectedAddress(defaultAddress.id.toString());
        }
    }, [addresses]);

    const category = categories.find(cat => cat.id === parseInt(categoryId || ''));

    const handleNewAddressSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const newAddress = { street_address: street, city, state, pincode };
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/addresses/create/', newAddress);
            // After creating, refresh the address list and select the new one
            await fetchAddresses();
            setSelectedAddress(response.data.id.toString());
            setShowNewAddressForm(false); // Hide the form
        } catch (error) {
            console.error('Failed to add address:', error);
        }
    };

    const handleServiceRequestSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // ... (This logic will be used to submit the final request to payment) ...
        alert('Main form submitted! (Redirect to payment pending)');
    };

    if (!category) {
        return <Typography>Category not found.</Typography>;
    }

    return (
        <Container sx={{ py: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
                Service Request for: {category.name}
            </Typography>
            <form onSubmit={handleServiceRequestSubmit}>
                {/* Issue Selection */}
                <FormControl component="fieldset" margin="normal" fullWidth>
                    {/* ... (Radio Group for issues - no changes here) ... */}
                </FormControl>

                {/* Custom Description */}
                {selectedIssue === 'other' && (
                    <TextField label="Describe your issue" /* ... (no changes here) ... */ />
                )}

                {/* Address Selection */}
                <FormControl fullWidth margin="normal">
                    <InputLabel id="address-select-label">Select Service Location</InputLabel>
                    <Select
                        labelId="address-select-label"
                        value={selectedAddress}
                        label="Select Service Location"
                        onChange={(e) => setSelectedAddress(e.target.value)}
                        required
                    >
                        {addresses.map((address) => (
                            <MenuItem key={address.id} value={address.id.toString()}>
                                {address.street_address}, {address.city}, {address.state}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* "Add New Address" Button */}
                <Button onClick={() => setShowNewAddressForm(!showNewAddressForm)} sx={{ mb: 2 }}>
                    {showNewAddressForm ? 'Cancel' : 'Add a New Address'}
                </Button>

                {/* Collapsible New Address Form */}
                <Collapse in={showNewAddressForm}>
                    <Box component="form" onSubmit={handleNewAddressSubmit} sx={{ border: 1, borderColor: 'grey.700', borderRadius: 1, p: 2, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>New Address</Typography>
                        <TextField label="Street Address" fullWidth required margin="normal" value={street} onChange={e => setStreet(e.target.value)} />
                        <TextField label="City" fullWidth required margin="normal" value={city} onChange={e => setCity(e.target.value)} />
                        <TextField label="State" fullWidth required margin="normal" value={state} onChange={e => setState(e.target.value)} />
                        <TextField label="Pincode" fullWidth required margin="normal" value={pincode} onChange={e => setPincode(e.target.value)} />
                        <Button type="submit" variant="outlined" sx={{ mt: 1 }}>Save New Address</Button>
                    </Box>
                </Collapse>

                <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
                    Submit & Proceed to Payment
                </Button>
            </form>
        </Container>
    );
};