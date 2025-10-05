// src/pages/TechnicianDashboard.tsx - Updated with Job Sheet Integration
import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  Typography, 
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  Divider,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Alert
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BuildIcon from '@mui/icons-material/Build';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import { useSpring, animated } from '@react-spring/web';
import { useUserStore } from '../stores/userStore';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { TechnicianNavBar } from '../components/TechnicianNavBar';
import { JobSheetForm } from '../components/JobSheetForm';
import apiClient from '../api';

// Page wrapper matching your design system
const PageWrapper = styled(Box)({
  backgroundColor: '#000000',
  color: 'white',
  fontFamily: "'Inter', sans-serif",
  minHeight: '100vh',
  width: '100%',
  paddingTop: '80px',
});

// Premium hero section
const DashboardHero = styled(Box)({
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
});

const HeroTitle = styled(Typography)({
  fontSize: '36px',
  fontWeight: 700,
  marginBottom: '16px',
  color: '#ffffff',
  background: 'linear-gradient(135deg, #ffffff, #e0e0e0)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
});

const HeroSubtitle = styled(Typography)({
  fontSize: '16px',
  color: 'rgba(255, 255, 255, 0.6)',
  marginBottom: '20px',
});

// Content section
const DashboardContent = styled(Box)({
  padding: '60px',
  background: `linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #111111 50%, #0a0a0a 75%, #000000 100%)`,
  position: 'relative',
});

const ContentContainer = styled(Box)({
  maxWidth: '1200px',
  margin: '0 auto',
  position: 'relative',
  zIndex: 2,
});

// Premium cards
const StatsCard = styled(Card)({
  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)`,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(20px)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-4px)',
  },
});

const TaskCard = styled(Card)({
  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)`,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  marginBottom: '16px',
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(20px)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
});

const PremiumButton = styled(Button)({
  backgroundColor: 'rgba(96, 165, 250, 0.15)',
  border: '1px solid rgba(96, 165, 250, 0.3)',
  color: '#60a5fa',
  borderRadius: '12px',
  padding: '8px 16px',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(96, 165, 250, 0.25)',
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  '&.success': {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    color: '#22c55e',
    '&:hover': {
      backgroundColor: 'rgba(34, 197, 94, 0.25)',
    },
  },
});

const StatusChip = styled(Chip)<{ status: string }>(({ status }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'submitted':
        return { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' };
      case 'processing':
      case 'assigned':
        return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
      case 'shipped':
      case 'in_progress':
        return { bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', border: 'rgba(139, 92, 246, 0.3)' };
      case 'delivered':
      case 'completed':
        return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' };
      case 'cancelled':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      default:
        return { bg: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af', border: 'rgba(156, 163, 175, 0.3)' };
    }
  };
  
  const colors = getStatusColor();
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    border: `1px solid ${colors.border}`,
    fontWeight: 600,
    fontSize: '11px',
  };
});

// Interface definitions
interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  order_date: string;
  status: string;
  total_amount: string;
  shipping_address_details: {
    street_address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    product_name: string;
    quantity: number;
    price: string;
  }>;
}

interface ServiceRequest {
  id: number;
  customer: {
    name: string;
    phone: string;
  };
  service_category: {
    name: string;
  };
  issue: {
    description: string;
  } | null;
  custom_description: string;
  service_location: {
    street_address: string;
    city: string;
    state: string;
    pincode: string;
  };
  request_date: string;
  status: string;
  // NEW - Add job sheet fields
  has_job_sheet: boolean;
  job_sheet_status: 'PENDING' | 'APPROVED' | 'DECLINED' | null;
  job_sheet_id: number | null;
}

interface TechnicianStats {
  total_orders: number;
  completed_orders: number;
  total_services: number;
  completed_services: number;
  average_rating: number;
  this_month_completed: number;
}

export const TechnicianDashboard: React.FC = () => {
  const { user, isAuthenticated, checkAuthStatus } = useUserStore();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<TechnicianStats>({
    total_orders: 0,
    completed_orders: 0,
    total_services: 0,
    completed_services: 0,
    average_rating: 0,
    this_month_completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'order' | 'service';
    id: number;
    title: string;
  }>({ open: false, type: 'order', id: 0, title: '' });

  // NEW: Job Sheet states
  const [jobSheetFormOpen, setJobSheetFormOpen] = useState(false);
  const [selectedServiceForJobSheet, setSelectedServiceForJobSheet] = useState<ServiceRequest | null>(null);

  // Hero animation
  const heroAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(40px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 60 },
    delay: 200,
  });

  // Enhanced authentication check
  useEffect(() => {
    const checkTechnicianAccess = async () => {
      try {
        console.log('Checking technician access...');
        
        if (!isAuthenticated || !user) {
          console.log('User not authenticated, checking auth status...');
          await checkAuthStatus();
          
          setTimeout(() => {
            const currentState = useUserStore.getState();
            
            if (!currentState.isAuthenticated || !currentState.user) {
              console.log('Still not authenticated, redirecting to login');
              enqueueSnackbar('Please login to access the dashboard', { variant: 'error' });
              navigate('/login');
              return;
            }
            
            if (currentState.user.role !== 'TECHNICIAN') {
              console.log('User role is not TECHNICIAN:', currentState.user.role);
              setAccessDenied(true);
              enqueueSnackbar('Access denied. Technician role required.', { variant: 'error' });
              setTimeout(() => {
                navigate('/login');
              }, 2000);
              return;
            }
            
            console.log('Access granted, fetching dashboard data');
            setAuthChecking(false);
            fetchDashboardData();
          }, 1000);
        } else {
          if (user.role !== 'TECHNICIAN') {
            console.log('User role is not TECHNICIAN:', user.role);
            setAccessDenied(true);
            enqueueSnackbar('Access denied. Technician role required.', { variant: 'error' });
            setTimeout(() => {
              navigate('/login');
            }, 2000);
            return;
          }
          
          console.log('User authenticated with TECHNICIAN role');
          setAuthChecking(false);
          fetchDashboardData();
        }
        
      } catch (error) {
        console.error('Error checking technician access:', error);
        setAuthChecking(false);
        enqueueSnackbar('Authentication error', { variant: 'error' });
        navigate('/login');
      }
    };

    checkTechnicianAccess();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch assigned orders
      const ordersResponse = await apiClient.get('/api/technician/assigned-orders/');
      setOrders(ordersResponse.data);
      
      // Fetch assigned service requests
      const servicesResponse = await apiClient.get('/api/technician/assigned-services/');
      setServiceRequests(servicesResponse.data);
      
      // Fetch technician stats
      const statsResponse = await apiClient.get('/api/technician/stats/');
      setStats(statsResponse.data);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      enqueueSnackbar('Failed to load dashboard data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async (orderId: number) => {
    try {
      await apiClient.patch(`/api/technician/complete-order/${orderId}/`);
      enqueueSnackbar('Order marked as delivered!', { variant: 'success' });
      fetchDashboardData();
    } catch (error) {
      console.error('Error completing order:', error);
      enqueueSnackbar('Failed to complete order', { variant: 'error' });
    }
  };

  const handleCompleteService = async (serviceId: number) => {
    try {
    await apiClient.patch(`/services/api/service-requests/${serviceId}/complete/`);
    enqueueSnackbar('Service marked as completed!', { variant: 'success' });
    fetchDashboardData();
  } catch (error: any) {
    console.error('Error completing service:', error);
    const errorMessage = error.response?.data?.error || 'Failed to complete service';
    enqueueSnackbar(errorMessage, { variant: 'error' });
  }
};

  const openConfirmDialog = (type: 'order' | 'service', id: number, title: string) => {
    setConfirmDialog({ open: true, type, id, title });
  };

  const handleConfirm = () => {
    if (confirmDialog.type === 'order') {
      handleCompleteOrder(confirmDialog.id);
    } else {
      handleCompleteService(confirmDialog.id);
    }
    setConfirmDialog({ open: false, type: 'order', id: 0, title: '' });
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  // Show loading while checking auth
  if (authChecking) {
    return (
      <PageWrapper>
        <TechnicianNavBar onRefresh={fetchDashboardData} />
        <DashboardHero>
          <Typography sx={{ mb: 2 }}>Verifying access...</Typography>
          <LinearProgress sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        </DashboardHero>
      </PageWrapper>
    );
  }

  // Show access denied
  if (accessDenied) {
    return (
      <PageWrapper>
        <TechnicianNavBar />
        <DashboardHero>
          <Alert 
            severity="error" 
            sx={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              maxWidth: '500px',
              margin: '0 auto'
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>Access Denied</Typography>
            <Typography>
              This dashboard is only accessible to users with TECHNICIAN role.
              Redirecting to login...
            </Typography>
          </Alert>
        </DashboardHero>
      </PageWrapper>
    );
  }

  if (loading) {
    return (
      <PageWrapper>
        <TechnicianNavBar onRefresh={fetchDashboardData} />
        <DashboardHero>
          <Typography>Loading dashboard...</Typography>
          <LinearProgress sx={{ mt: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        </DashboardHero>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Technician-specific NavBar */}
      <TechnicianNavBar onRefresh={fetchDashboardData} />
      
      {/* Hero Section */}
      <DashboardHero>
        <animated.div style={heroAnimation}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mb: 2 }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
              fontSize: '24px',
              fontWeight: 700
            }}>
              {user?.name ? getUserInitials(user.name) : <PersonIcon fontSize="large" />}
            </Avatar>
            <Box sx={{ textAlign: 'left' }}>
              <HeroTitle>Welcome back, {user?.name || 'Technician'}</HeroTitle>
              <HeroSubtitle>Your technician dashboard</HeroSubtitle>
              <Chip 
                label="TECHNICIAN DASHBOARD" 
                sx={{ 
                  backgroundColor: 'rgba(96, 165, 250, 0.15)',
                  color: '#60a5fa',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  fontWeight: 600
                }}
              />
            </Box>
          </Box>
        </animated.div>
      </DashboardHero>

      {/* Main Content */}
      <DashboardContent>
        <ContentContainer>
          {/* Stats Cards */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <AssignmentIcon sx={{ fontSize: '48px', color: '#60a5fa', mb: 2 }} />
                  <Typography variant="h4" sx={{ color: '#60a5fa', fontWeight: 700, mb: 1 }}>
                    {stats.total_orders + stats.total_services}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                    Total Assigned
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <CheckCircleIcon sx={{ fontSize: '48px', color: '#22c55e', mb: 2 }} />
                  <Typography variant="h4" sx={{ color: '#22c55e', fontWeight: 700, mb: 1 }}>
                    {stats.completed_orders + stats.completed_services}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                    Completed
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <StarIcon sx={{ fontSize: '48px', color: '#fbbf24', mb: 2 }} />
                  <Typography variant="h4" sx={{ color: '#fbbf24', fontWeight: 700, mb: 1 }}>
                    {stats.average_rating ? stats.average_rating.toFixed(1) : '0.0'}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                    Average Rating
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <TrendingUpIcon sx={{ fontSize: '48px', color: '#8b5cf6', mb: 2 }} />
                  <Typography variant="h4" sx={{ color: '#8b5cf6', fontWeight: 700, mb: 1 }}>
                    {stats.this_month_completed}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                    This Month
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>
          </Grid>

          {/* Tasks Section */}
          <StatsCard>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Tabs
                  value={currentTab}
                  onChange={(e, newValue) => setCurrentTab(newValue)}
                  sx={{
                    '& .MuiTab-root': {
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontWeight: 500,
                      '&.Mui-selected': {
                        color: '#60a5fa',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#60a5fa',
                    },
                  }}
                >
                  <Tab 
                    label={`Orders (${orders.filter(o => o.status !== 'DELIVERED').length})`} 
                    icon={<LocalShippingIcon />} 
                    iconPosition="start"
                  />
                  <Tab 
                    label={`Services (${serviceRequests.filter(s => s.status !== 'COMPLETED').length})`} 
                    icon={<BuildIcon />} 
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              <Box sx={{ p: 3 }}>
                {currentTab === 0 && (
                  <Box>
                    {orders.filter(order => order.status !== 'DELIVERED').length === 0 ? (
                      <Alert 
                        severity="info" 
                        sx={{ 
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          color: '#3b82f6',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                        }}
                      >
                        No pending orders assigned to you.
                      </Alert>
                    ) : (
                      orders.filter(order => order.status !== 'DELIVERED').map((order) => (
                        <TaskCard key={order.id}>
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box>
                                <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '16px', mb: 1 }}>
                                  Order #{order.id}
                                </Typography>
                                <StatusChip label={order.status} status={order.status} size="small" />
                              </Box>
                              <Typography sx={{ color: '#60a5fa', fontWeight: 600, fontSize: '18px' }}>
                                ₹{order.total_amount}
                              </Typography>
                            </Box>

                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <PersonIcon sx={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)' }} />
                                  <Typography sx={{ color: 'white', fontSize: '14px' }}>
                                    {order.customer_name}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <PhoneIcon sx={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)' }} />
                                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                                    {order.customer_phone}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                  <LocationOnIcon sx={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)', mt: 0.2 }} />
                                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                                    {order.shipping_address_details.street_address}, {order.shipping_address_details.city}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <CalendarTodayIcon sx={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)' }} />
                              <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                                Ordered: {new Date(order.order_date).toLocaleDateString()}
                              </Typography>
                            </Box>

                            <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                                Items: {order.items.map(item => item.product_name).join(', ')}
                              </Typography>
                              
                              {order.status !== 'DELIVERED' && (
                                <PremiumButton 
                                  className="success"
                                  onClick={() => openConfirmDialog('order', order.id, `Order #${order.id}`)}
                                >
                                  <CheckCircleIcon sx={{ mr: 1, fontSize: '16px' }} />
                                  Mark Delivered
                                </PremiumButton>
                              )}
                            </Box>
                          </CardContent>
                        </TaskCard>
                      ))
                    )}
                  </Box>
                )}

                {currentTab === 1 && (
                  <Box>
                    {serviceRequests.filter(service => service.status !== 'COMPLETED').length === 0 ? (
                      <Alert 
                        severity="info" 
                        sx={{ 
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          color: '#3b82f6',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                        }}
                      >
                        No pending service requests assigned to you.
                      </Alert>
                    ) : (
                      serviceRequests.filter(service => service.status !== 'COMPLETED').map((service) => (
                        <TaskCard key={service.id}>
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box>
                                <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '16px', mb: 1 }}>
                                  Service Request #{service.id}
                                </Typography>
                                <StatusChip label={service.status} status={service.status} size="small" />
                              </Box>
                              <Chip 
                                label={service.service_category.name}
                                sx={{
                                  backgroundColor: 'rgba(139, 92, 246, 0.15)',
                                  color: '#8b5cf6',
                                  border: '1px solid rgba(139, 92, 246, 0.3)',
                                }}
                              />
                            </Box>

                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <PersonIcon sx={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)' }} />
                                  <Typography sx={{ color: 'white', fontSize: '14px' }}>
                                    {service.customer.name}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <PhoneIcon sx={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)' }} />
                                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                                    {service.customer.phone}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                  <LocationOnIcon sx={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)', mt: 0.2 }} />
                                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                                    {service.service_location.street_address}, {service.service_location.city}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>

                            <Box sx={{ mb: 2 }}>
                              <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', mb: 1 }}>
                                Issue Description:
                              </Typography>
                              <Typography sx={{ color: 'white', fontSize: '14px' }}>
                                {service.issue?.description || service.custom_description || 'No description provided'}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <CalendarTodayIcon sx={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)' }} />
                              <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                                Requested: {new Date(service.request_date).toLocaleDateString()}
                              </Typography>
                            </Box>

                            {/* JOB SHEET STATUS INDICATOR - NEW */}
                            {service.has_job_sheet && (
                              <Box sx={{ 
                                mb: 2, 
                                p: 2, 
                                background: service.job_sheet_status === 'APPROVED' 
                                  ? 'rgba(34, 197, 94, 0.1)' 
                                  : service.job_sheet_status === 'DECLINED'
                                  ? 'rgba(239, 68, 68, 0.1)'
                                  : 'rgba(251, 191, 36, 0.1)',
                                border: service.job_sheet_status === 'APPROVED'
                                  ? '1px solid rgba(34, 197, 94, 0.3)'
                                  : service.job_sheet_status === 'DECLINED'
                                  ? '1px solid rgba(239, 68, 68, 0.3)'
                                  : '1px solid rgba(251, 191, 36, 0.3)',
                                borderRadius: '12px'
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <DescriptionIcon sx={{ 
                                    fontSize: '20px', 
                                    color: service.job_sheet_status === 'APPROVED' 
                                      ? '#22c55e' 
                                      : service.job_sheet_status === 'DECLINED'
                                      ? '#ef4444'
                                      : '#fbbf24'
                                  }} />
                                  <Box>
                                    <Typography sx={{ 
                                      color: service.job_sheet_status === 'APPROVED' 
                                        ? '#22c55e' 
                                        : service.job_sheet_status === 'DECLINED'
                                        ? '#ef4444'
                                        : '#fbbf24',
                                      fontSize: '14px',
                                      fontWeight: 600
                                    }}>
                                      Job Sheet: {service.job_sheet_status === 'APPROVED' 
                                        ? '✓ Approved by Customer' 
                                        : service.job_sheet_status === 'DECLINED'
                                        ? '✗ Declined by Customer'
                                        : '⏳ Pending Customer Approval'}
                                    </Typography>
                                    <Typography sx={{ 
                                      color: 'rgba(255, 255, 255, 0.6)', 
                                      fontSize: '12px',
                                      mt: 0.5
                                    }}>
                                      {service.job_sheet_status === 'APPROVED' 
                                        ? 'You can now mark this service as completed' 
                                        : service.job_sheet_status === 'DECLINED'
                                        ? 'Customer declined the job sheet. Please contact customer.'
                                        : 'Waiting for customer to review and approve the job sheet'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            )}

                            <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                              {/* CREATE JOB SHEET BUTTON */}
                              {!service.has_job_sheet && (
                                <PremiumButton
                                  onClick={() => {
                                    setSelectedServiceForJobSheet(service);
                                    setJobSheetFormOpen(true);
                                  }}
                                >
                                  <DescriptionIcon sx={{ mr: 1, fontSize: '16px' }} />
                                  Create Job Sheet
                                </PremiumButton>
                              )}

                              {/* MARK COMPLETED BUTTON - Only enabled if job sheet is approved */}
                              {service.status !== 'COMPLETED' && (
                                <PremiumButton 
                                  className="success"
                                  onClick={() => openConfirmDialog('service', service.id, `Service Request #${service.id}`)}
                                  disabled={!service.has_job_sheet || service.job_sheet_status !== 'APPROVED'}
                                  sx={{
                                    opacity: (!service.has_job_sheet || service.job_sheet_status !== 'APPROVED') ? 0.5 : 1,
                                    cursor: (!service.has_job_sheet || service.job_sheet_status !== 'APPROVED') ? 'not-allowed' : 'pointer'
                                  }}
                                >
                                  <CheckCircleIcon sx={{ mr: 1, fontSize: '16px' }} />
                                  Mark Completed
                                </PremiumButton>
                              )}
                            </Box>
                          </CardContent>
                        </TaskCard>
                      ))
                    )}
                  </Box>
                )}
              </Box>
            </CardContent>
          </StatsCard>
        </ContentContainer>
      </DashboardContent>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, type: 'order', id: 0, title: '' })}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            color: 'white',
          }
        }}
      >
        <DialogTitle sx={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: '18px', fontWeight: 600 }}>
          Confirm Completion
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Are you sure you want to mark {confirmDialog.title} as {confirmDialog.type === 'order' ? 'delivered' : 'completed'}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setConfirmDialog({ open: false, type: 'order', id: 0, title: '' })}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
            }}
          >
            Cancel
          </Button>
          <PremiumButton className="success" onClick={handleConfirm}>
            <CheckCircleIcon sx={{ mr: 1, fontSize: '16px' }} />
            {confirmDialog.type === 'order' ? 'Mark Delivered' : 'Mark Completed'}
          </PremiumButton>
        </DialogActions>
      </Dialog>

      {/* Job Sheet Creation Form - NEW */}
      {selectedServiceForJobSheet && (
        <JobSheetForm
          open={jobSheetFormOpen}
          onClose={() => {
            setJobSheetFormOpen(false);
            setSelectedServiceForJobSheet(null);
          }}
          serviceRequest={selectedServiceForJobSheet}
          onSuccess={() => {
            fetchDashboardData();
          }}
        />
      )}
    </PageWrapper>
  );
};