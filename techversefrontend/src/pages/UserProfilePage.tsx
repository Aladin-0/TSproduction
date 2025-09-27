// src/pages/UserProfilePage.tsx - Simplified without 3D
import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  Typography, 
  Button,
  TextField,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Skeleton,
  Grid,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from "@mui/icons-material/Home";
import SecurityIcon from '@mui/icons-material/Security';
import { useSpring, animated } from '@react-spring/web';
import { useUserStore } from '../stores/userStore';
import { useProductStore } from '../stores/productStore';
import apiClient from '../api';
import { useSnackbar } from 'notistack';

// Main page wrapper with exact styling from LandingPage
const PageWrapper = styled(Box)({
  backgroundColor: '#000000',
  color: 'white',
  fontFamily: "'Inter', sans-serif",
  minHeight: '100vh',
  width: '100%',
  overflowX: 'hidden',
  paddingTop: '80px', // Account for navbar
});

// Premium hero section
const ProfileHero = styled(Box)({
  background: `
    radial-gradient(ellipse 1200px 800px at 50% 20%, rgba(64, 64, 64, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse 800px 600px at 20% 80%, rgba(32, 32, 32, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, #000000 0%, #111111 50%, #000000 100%)
  `,
  padding: '60px 60px 40px',
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle 600px at 75% 30%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
      radial-gradient(circle 400px at 25% 70%, rgba(255, 255, 255, 0.02) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },
});

const ProfileAvatar = styled(Avatar)({
  width: '120px',
  height: '120px',
  margin: '0 auto 24px',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
  border: '3px solid rgba(255, 255, 255, 0.15)',
  fontSize: '48px',
  color: 'rgba(255, 255, 255, 0.8)',
  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)',
  backdropFilter: 'blur(20px)',
});

const ProfileTitle = styled(Typography)({
  fontSize: '36px',
  fontWeight: 700,
  letterSpacing: '-0.5px',
  marginBottom: '8px',
  color: '#ffffff',
  background: 'linear-gradient(135deg, #ffffff, #e0e0e0)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontFamily: "'Helvetica Neue', sans-serif",
});

const ProfileSubtitle = styled(Typography)({
  fontSize: '18px',
  color: 'rgba(255, 255, 255, 0.65)',
  fontWeight: 300,
  marginBottom: '20px',
  letterSpacing: '0.1px',
});

const ProfileBadge = styled(Chip)({
  backgroundColor: 'rgba(96, 165, 250, 0.15)',
  color: '#60a5fa',
  border: '1px solid rgba(96, 165, 250, 0.3)',
  fontSize: '12px',
  fontWeight: 600,
  height: '28px',
});

// Content section
const ProfileContent = styled(Box)({
  padding: '60px',
  background: `
    linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #111111 50%, #0a0a0a 75%, #000000 100%)
  `,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(ellipse 1000px 300px at 50% 0%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
      radial-gradient(ellipse 800px 200px at 50% 100%, rgba(255, 255, 255, 0.01) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },
});

const ContentContainer = styled(Box)({
  maxWidth: '1200px',
  margin: '0 auto',
  position: 'relative',
  zIndex: 2,
});

// Premium cards
const SectionCard = styled(Card)({
  background: `
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.05) 0%, 
      rgba(255, 255, 255, 0.02) 50%, 
      rgba(255, 255, 255, 0.05) 100%
    )
  `,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '24px',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.320, 1)',
  position: 'relative',
  backdropFilter: 'blur(20px)',
  marginBottom: '32px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-4px)',
    boxShadow: `
      0 20px 40px rgba(0, 0, 0, 0.4),
      0 0 20px rgba(255, 255, 255, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      linear-gradient(135deg, 
        rgba(255, 255, 255, 0.1) 0%, 
        transparent 50%, 
        rgba(255, 255, 255, 0.05) 100%
      )
    `,
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  },
  '&:hover::before': {
    opacity: 1,
  },
});

const SectionHeader = styled(Box)({
  padding: '24px 32px 20px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const SectionTitle = styled(Typography)({
  fontSize: '20px',
  fontWeight: 600,
  color: 'rgba(255, 255, 255, 0.95)',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  '& .MuiSvgIcon-root': {
    fontSize: '24px',
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

const PremiumButton = styled(Button)({
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '12px',
  padding: '12px 20px',
  fontSize: '13px',
  fontWeight: 600,
  textTransform: 'none',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(255, 255, 255, 0.1)',
  },
});

const PremiumTextField = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    color: 'white',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
      boxShadow: '0 0 0 4px rgba(255, 255, 255, 0.1)',
    },
  },
  '& .MuiInputBase-input': {
    color: 'white',
    fontSize: '14px',
    fontWeight: 400,
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.4)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.6)',
    '&.Mui-focused': {
      color: 'rgba(255, 255, 255, 0.9)',
    },
  },
});

// Address card styling
const AddressCard = styled(Card)({
  background: `
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.03) 0%, 
      rgba(255, 255, 255, 0.01) 50%, 
      rgba(255, 255, 255, 0.03) 100%
    )
  `,
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(10px)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-2px)',
  },
});

// Premium dialog styling
const PremiumDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    background: `
      linear-gradient(135deg, 
        rgba(20, 20, 20, 0.95) 0%, 
        rgba(10, 10, 10, 0.98) 100%
      )
    `,
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '20px',
    color: 'white',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
  },
  '& .MuiDialogTitle-root': {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: '20px',
    fontWeight: 600,
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '16px',
  },
});

interface Address {
  id: number;
  street_address: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  email_notifications: boolean;
  sms_notifications: boolean;
}

export const UserProfilePage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const user = useUserStore((state) => state.user);
  const updateUserInStore = useUserStore((state) => state.updateProfile);
  const { addresses, fetchAddresses } = useProductStore();
  
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfile>({
    id: 0,
    name: '',
    email: '',
    phone: '',
    role: 'CUSTOMER',
    email_notifications: true,
    sms_notifications: true
  });
  
  // Dialog states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  // Form states
  const [addressForm, setAddressForm] = useState({
    street_address: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false
  });

  // Hero animation
  const heroAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(40px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 60 },
    delay: 200,
  });

  // Load user data from backend
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Fetch latest user data from backend
        const response = await apiClient.get('/api/users/profile/');
        console.log('Fetched user profile:', response.data);
        setProfileData(response.data);
        
        // Also update the global user store
        updateUserInStore(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to store data if API fails
        if (user) {
          setProfileData({
            id: user.id,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'CUSTOMER',
            email_notifications: user.email_notifications ?? true,
            sms_notifications: user.sms_notifications ?? true
          });
        }
      }
      
      await fetchAddresses();
      setLoading(false);
    };
    
    loadUserData();
  }, [user, fetchAddresses, updateUserInStore]);

  const handleUpdateProfile = async () => {
    try {
      console.log('Updating profile with:', profileData);
      
      const response = await apiClient.patch('/api/users/profile/', {
        name: profileData.name,
        phone: profileData.phone,
        email_notifications: profileData.email_notifications,
        sms_notifications: profileData.sms_notifications
      });
      
      console.log('Profile update response:', response.data);
      
      // Update local state with response
      setProfileData(response.data);
      
      // Update global store
      updateUserInStore(response.data);
      
      enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
      setEditProfileOpen(false);
    } catch (error) {
      console.error('Profile update error:', error);
      enqueueSnackbar('Failed to update profile', { variant: 'error' });
    }
  };

  const handleSaveAddress = async () => {
    try {
      if (editingAddress) {
        // Update existing address
        await apiClient.patch(`/api/addresses/${editingAddress.id}/update/`, addressForm);
        enqueueSnackbar('Address updated successfully!', { variant: 'success' });
      } else {
        // Create new address
        await apiClient.post('/api/addresses/create/', addressForm);
        enqueueSnackbar('Address added successfully!', { variant: 'success' });
      }
      await fetchAddresses();
      setAddressDialogOpen(false);
      setEditingAddress(null);
      setAddressForm({ street_address: '', city: '', state: '', pincode: '', is_default: false });
    } catch (error) {
      console.error('Address save error:', error);
      enqueueSnackbar('Failed to save address', { variant: 'error' });
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await apiClient.delete(`/api/addresses/${addressId}/delete/`);
      enqueueSnackbar('Address deleted successfully!', { variant: 'success' });
      await fetchAddresses();
    } catch (error) {
      console.error('Address deletion error:', error);
      enqueueSnackbar('Failed to delete address', { variant: 'error' });
    }
  };

  const openAddressDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        street_address: address.street_address,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        is_default: address.is_default
      });
    } else {
      setEditingAddress(null);
      setAddressForm({ street_address: '', city: '', state: '', pincode: '', is_default: false });
    }
    setAddressDialogOpen(true);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <PageWrapper>
        <ProfileHero>
          <Skeleton variant="circular" width={120} height={120} sx={{ margin: '0 auto 24px' }} />
          <Skeleton variant="text" width={200} height={40} sx={{ margin: '0 auto 8px' }} />
          <Skeleton variant="text" width={150} height={20} sx={{ margin: '0 auto 20px' }} />
        </ProfileHero>
        <ProfileContent>
          <ContentContainer>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={200} sx={{ mb: 4, borderRadius: '24px' }} />
            ))}
          </ContentContainer>
        </ProfileContent>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Premium Profile Hero */}
      <ProfileHero>
        <animated.div style={heroAnimation}>
          <ProfileAvatar>
            {profileData.name ? getUserInitials(profileData.name) : <PersonIcon fontSize="inherit" />}
          </ProfileAvatar>
          <ProfileTitle>{profileData.name || 'User'}</ProfileTitle>
          <ProfileSubtitle>{profileData.email}</ProfileSubtitle>
          <ProfileBadge label={profileData.role} />
        </animated.div>
      </ProfileHero>

      {/* Profile Content */}
      <ProfileContent>
        <ContentContainer>
          {/* Personal Information Section */}
          <SectionCard>
            <SectionHeader>
              <SectionTitle>
                <PersonIcon />
                Personal Information
              </SectionTitle>
              <PremiumButton onClick={() => setEditProfileOpen(true)}>
                <EditIcon sx={{ mr: 1, fontSize: '16px' }} />
                Edit Profile
              </PremiumButton>
            </SectionHeader>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PersonIcon sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                        Full Name
                      </Typography>
                      <Typography sx={{ color: 'white', fontWeight: 500 }}>
                        {profileData.name || 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <EmailIcon sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                        Email Address
                      </Typography>
                      <Typography sx={{ color: 'white', fontWeight: 500 }}>
                        {profileData.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PhoneIcon sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                        Phone Number
                      </Typography>
                      <Typography sx={{ color: 'white', fontWeight: 500 }}>
                        {profileData.phone || 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SecurityIcon sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                        Account Type
                      </Typography>
                      <ProfileBadge label={profileData.role} size="small" />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </SectionCard>

          {/* Addresses Section */}
          <SectionCard>
            <SectionHeader>
              <SectionTitle>
                <HomeIcon />
                Saved Addresses
              </SectionTitle>
              <PremiumButton onClick={() => openAddressDialog()}>
                <AddIcon sx={{ mr: 1, fontSize: '16px' }} />
                Add Address
              </PremiumButton>
            </SectionHeader>
            <CardContent sx={{ p: 4 }}>
              {addresses.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <HomeIcon sx={{ fontSize: '48px', color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2 }}>
                    No addresses saved yet
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px' }}>
                    Add your first address to get started
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {addresses.map((address) => (
                    <Grid item xs={12} md={6} key={address.id}>
                      <AddressCard>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              {address.is_default && (
                                <Chip 
                                  label="Default" 
                                  size="small" 
                                  sx={{ 
                                    mb: 1, 
                                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                                    color: '#22c55e',
                                    border: '1px solid rgba(34, 197, 94, 0.3)'
                                  }} 
                                />
                              )}
                              <Typography sx={{ color: 'white', fontWeight: 500, mb: 1 }}>
                                {address.street_address}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                                {address.city}, {address.state} - {address.pincode}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton 
                                size="small" 
                                onClick={() => openAddressDialog(address)}
                                sx={{ 
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  '&:hover': { color: '#60a5fa' }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteAddress(address.id)}
                                sx={{ 
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  '&:hover': { color: '#ef4444' }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </AddressCard>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </SectionCard>

          {/* Account Settings Section */}
          <SectionCard>
            <SectionHeader>
              <SectionTitle>
                <SecurityIcon />
                Account Settings
              </SectionTitle>
            </SectionHeader>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={profileData.email_notifications}
                        onChange={(e) => setProfileData({ ...profileData, email_notifications: e.target.checked })}
                        sx={{
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '& .MuiSwitch-thumb': {
                            backgroundColor: '#60a5fa',
                          },
                          '&.Mui-checked .MuiSwitch-track': {
                            backgroundColor: '#60a5fa',
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 500 }}>
                          Email Notifications
                        </Typography>
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                          Receive order updates via email
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={profileData.sms_notifications}
                        onChange={(e) => setProfileData({ ...profileData, sms_notifications: e.target.checked })}
                        sx={{
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '& .MuiSwitch-thumb': {
                            backgroundColor: '#60a5fa',
                          },
                          '&.Mui-checked .MuiSwitch-track': {
                            backgroundColor: '#60a5fa',
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 500 }}>
                          SMS Notifications
                        </Typography>
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                          Get service updates via SMS
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />
                  <PremiumButton 
                    variant="outlined"
                    sx={{ 
                      borderColor: '#ef4444',
                      color: '#ef4444',
                      '&:hover': {
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderColor: '#ef4444',
                      }
                    }}
                  >
                    Change Password
                  </PremiumButton>
                </Grid>
              </Grid>
            </CardContent>
          </SectionCard>
        </ContentContainer>
      </ProfileContent>

      {/* Edit Profile Dialog */}
      <PremiumDialog
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <PremiumTextField
              label="Full Name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              fullWidth
              required
            />
            <PremiumTextField
              label="Email Address"
              value={profileData.email}
              disabled
              fullWidth
              helperText="Email cannot be changed"
            />
            <PremiumTextField
              label="Phone Number"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              fullWidth
              placeholder="+91 9876543210"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setEditProfileOpen(false)}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
            }}
          >
            Cancel
          </Button>
          <PremiumButton onClick={handleUpdateProfile}>
            Save Changes
          </PremiumButton>
        </DialogActions>
      </PremiumDialog>

      {/* Address Dialog */}
      <PremiumDialog
        open={addressDialogOpen}
        onClose={() => setAddressDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingAddress ? 'Edit Address' : 'Add New Address'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <PremiumTextField
              label="Street Address"
              value={addressForm.street_address}
              onChange={(e) => setAddressForm({ ...addressForm, street_address: e.target.value })}
              fullWidth
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label="City"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <PremiumTextField
                  label="State"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            <PremiumTextField
              label="Pincode"
              value={addressForm.pincode}
              onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
              fullWidth
              required
            />
            <FormControlLabel
              control={
                <Switch
                  checked={addressForm.is_default}
                  onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-track': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '& .MuiSwitch-thumb': {
                      backgroundColor: '#60a5fa',
                    },
                    '&.Mui-checked .MuiSwitch-track': {
                      backgroundColor: '#60a5fa',
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ color: 'white' }}>
                  Set as default address
                </Typography>
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setAddressDialogOpen(false)}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
            }}
          >
            Cancel
          </Button>
          <PremiumButton onClick={handleSaveAddress}>
            {editingAddress ? 'Update Address' : 'Add Address'}
          </PremiumButton>
        </DialogActions>
      </PremiumDialog>
    </PageWrapper>
  );
};