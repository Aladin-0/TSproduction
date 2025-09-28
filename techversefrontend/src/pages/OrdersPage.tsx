// src/pages/OrdersPage.tsx - Redesigned with dark theme and detailed product display
import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useUserStore } from '../stores/userStore';
import { useSnackbar } from 'notistack';
import { RatingModal } from '../components/RatingModal';
import apiClient from '../api';

// Page wrapper matching your dark design system
const PageWrapper = styled(Box)({
  backgroundColor: '#000000',
  color: 'white',
  fontFamily: "'Inter', sans-serif",
  minHeight: '100vh',
  width: '100%',
  paddingTop: '100px',
});

// Hero section
const OrdersHero = styled(Box)({
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
  fontSize: '42px',
  fontWeight: 700,
  marginBottom: '16px',
  color: '#ffffff',
  background: 'linear-gradient(135deg, #ffffff, #e0e0e0)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
});

const HeroSubtitle = styled(Typography)({
  fontSize: '18px',
  color: 'rgba(255, 255, 255, 0.6)',
  marginBottom: '20px',
});

// Content section
const OrdersContent = styled(Box)({
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

// Premium order card
const OrderCard = styled(Card)({
  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)`,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
  marginBottom: '24px',
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(20px)',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  },
});

const OrderHeader = styled(Box)({
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
  padding: '24px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
});

const ProductCard = styled(Box)({
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '12px',
  padding: '16px',
  margin: '12px 0',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});

const ProductImage = styled('img')({
  width: '80px',
  height: '80px',
  objectFit: 'cover',
  borderRadius: '8px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
});

const ProductPlaceholder = styled(Box)({
  width: '80px',
  height: '80px',
  borderRadius: '8px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '10px',
  color: 'rgba(255, 255, 255, 0.4)',
  textAlign: 'center',
});

const StatusChip = styled(Chip)<{ status: string }>(({ status }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' };
      case 'processing':
        return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
      case 'shipped':
        return { bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', border: 'rgba(139, 92, 246, 0.3)' };
      case 'delivered':
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
    fontSize: '12px',
  };
});

const PremiumButton = styled(Button)({
  backgroundColor: 'rgba(251, 191, 36, 0.15)',
  border: '1px solid rgba(251, 191, 36, 0.3)',
  color: '#fbbf24',
  borderRadius: '12px',
  padding: '8px 16px',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(251, 191, 36, 0.25)',
    borderColor: 'rgba(251, 191, 36, 0.4)',
    transform: 'translateY(-1px)',
  },
});

const CancelButton = styled(Button)({
  backgroundColor: 'rgba(239, 68, 68, 0.15)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  color: '#ef4444',
  borderRadius: '12px',
  padding: '8px 16px',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
});

const InfoRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
  '& svg': {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

interface Order {
  id: number;
  order_date: string;
  status: string;
  total_amount: string;
  technician_name?: string;
  technician_phone?: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address_details: {
    street_address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    id: number;
    product_name: string;
    product_image?: string;
    quantity: number;
    price: string;
  }>;
  can_rate: boolean;
}

export const OrdersPage: React.FC = () => {
  const { user, isAuthenticated } = useUserStore();
  const { enqueueSnackbar } = useSnackbar();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get('/api/orders/');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      enqueueSnackbar('Failed to load orders', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRateClick = (order: Order) => {
    setSelectedOrder(order);
    setRatingModalOpen(true);
  };

  const handleRatingSubmitted = () => {
    fetchOrders();
    enqueueSnackbar('Thank you for your rating!', { variant: 'success' });
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await apiClient.post(`/api/orders/${orderId}/cancel/`);
      enqueueSnackbar('Order cancelled successfully', { variant: 'success' });
      fetchOrders();
    } catch (error) {
      enqueueSnackbar('Failed to cancel order', { variant: 'error' });
    }
  };

  if (!isAuthenticated) {
    return (
      <PageWrapper>
        <OrdersHero>
          <Alert 
            severity="warning" 
            sx={{ 
              backgroundColor: 'rgba(251, 191, 36, 0.15)',
              color: '#fbbf24',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              maxWidth: '500px',
              margin: '0 auto'
            }}
          >
            Please log in to view your orders.
          </Alert>
        </OrdersHero>
      </PageWrapper>
    );
  }

  if (loading) {
    return (
      <PageWrapper>
        <OrdersHero>
          <Typography sx={{ mb: 2 }}>Loading your orders...</Typography>
          <CircularProgress sx={{ color: '#60a5fa' }} />
        </OrdersHero>
      </PageWrapper>
    );
  }

  return (
    <>
      <PageWrapper>
        {/* Hero Section */}
        <OrdersHero>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <ShoppingBagIcon sx={{ fontSize: '48px', color: '#60a5fa' }} />
            <Box>
              <HeroTitle>Order History</HeroTitle>
              <HeroSubtitle>Track your purchases and manage your orders</HeroSubtitle>
            </Box>
          </Box>
          <Chip 
            label={`${orders.length} Orders Found`}
            sx={{ 
              backgroundColor: 'rgba(96, 165, 250, 0.15)',
              color: '#60a5fa',
              border: '1px solid rgba(96, 165, 250, 0.3)',
              fontWeight: 600
            }}
          />
        </OrdersHero>

        {/* Orders Content */}
        <OrdersContent>
          <ContentContainer>
            {orders.length === 0 ? (
              <Alert 
                severity="info" 
                sx={{ 
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: '#3b82f6',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '16px',
                  textAlign: 'center',
                  py: 4
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>No orders found</Typography>
                <Typography sx={{ mb: 3 }}>You haven't placed any orders yet. Start shopping to see your orders here!</Typography>
                <Button 
                  variant="contained" 
                  sx={{ 
                    backgroundColor: '#3b82f6',
                    '&:hover': { backgroundColor: '#2563eb' }
                  }}
                  onClick={() => window.location.href = '/store'}
                >
                  Start Shopping
                </Button>
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {orders.map((order) => (
                  <Grid item xs={12} key={order.id}>
                    <OrderCard>
                      {/* Order Header */}
                      <OrderHeader>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                              Order #{order.id}
                            </Typography>
                            <InfoRow>
                              <CalendarTodayIcon />
                              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                                Ordered on {new Date(order.order_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </Typography>
                            </InfoRow>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <StatusChip label={order.status} status={order.status} />
                            <Typography variant="h4" sx={{ 
                              fontWeight: 700, 
                              color: '#60a5fa', 
                              mt: 1,
                              textShadow: '0 2px 10px rgba(96, 165, 250, 0.3)'
                            }}>
                              ₹{order.total_amount}
                            </Typography>
                          </Box>
                        </Box>
                      </OrderHeader>

                      <CardContent sx={{ p: 3 }}>
                        {/* Products Section */}
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                          Items Ordered ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})
                        </Typography>
                        
                        {order.items.map((item) => (
                          <ProductCard key={item.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {/* Product Image */}
                              {item.product_image ? (
                                <ProductImage 
                                  src={item.product_image} 
                                  alt={item.product_name}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).nextElementSibling!.style.display = 'flex';
                                  }}
                                />
                              ) : (
                                <ProductPlaceholder>
                                  No Image
                                </ProductPlaceholder>
                              )}
                              
                              {/* Product Details */}
                              <Box sx={{ flex: 1 }}>
                                <Typography sx={{ 
                                  color: 'white', 
                                  fontWeight: 600, 
                                  fontSize: '16px', 
                                  mb: 1 
                                }}>
                                  {item.product_name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                  <Chip 
                                    label={`Qty: ${item.quantity}`}
                                    size="small"
                                    sx={{
                                      backgroundColor: 'rgba(139, 92, 246, 0.15)',
                                      color: '#8b5cf6',
                                      border: '1px solid rgba(139, 92, 246, 0.3)',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                    }}
                                  />
                                  <Typography sx={{ 
                                    color: 'rgba(255, 255, 255, 0.6)', 
                                    fontSize: '14px' 
                                  }}>
                                    Unit Price: ₹{item.price}
                                  </Typography>
                                </Box>
                                <Typography sx={{ 
                                  color: '#60a5fa', 
                                  fontWeight: 600,
                                  fontSize: '16px'
                                }}>
                                  Total: ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                                </Typography>
                              </Box>
                            </Box>
                          </ProductCard>
                        ))}

                        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', my: 3 }} />

                        {/* Shipping & Technician Info */}
                        <Grid container spacing={3}>
                          {/* Shipping Address */}
                          {order.shipping_address_details && (
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 600, 
                                color: 'rgba(255, 255, 255, 0.9)', 
                                mb: 2 
                              }}>
                                Shipping Address
                              </Typography>
                              <Box sx={{ 
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: '8px',
                                padding: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.06)'
                              }}>
                                <InfoRow>
                                  <LocationOnIcon />
                                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                                    {order.shipping_address_details.street_address}
                                  </Typography>
                                </InfoRow>
                                <Typography sx={{ 
                                  color: 'rgba(255, 255, 255, 0.8)', 
                                  fontSize: '14px',
                                  ml: 3
                                }}>
                                  {order.shipping_address_details.city}, {order.shipping_address_details.state} - {order.shipping_address_details.pincode}
                                </Typography>
                              </Box>
                            </Grid>
                          )}

                          {/* Technician Info */}
                          {order.technician_name && (
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 600, 
                                color: 'rgba(255, 255, 255, 0.9)', 
                                mb: 2 
                              }}>
                                Assigned Technician
                              </Typography>
                              <Box sx={{ 
                                background: 'rgba(34, 197, 94, 0.05)',
                                borderRadius: '8px',
                                padding: '12px',
                                border: '1px solid rgba(34, 197, 94, 0.2)'
                              }}>
                                <InfoRow>
                                  <Avatar sx={{ 
                                    width: 24, 
                                    height: 24, 
                                    backgroundColor: '#22c55e',
                                    fontSize: '12px' 
                                  }}>
                                    {order.technician_name.charAt(0)}
                                  </Avatar>
                                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: 600 }}>
                                    {order.technician_name}
                                  </Typography>
                                </InfoRow>
                                {order.technician_phone && (
                                  <InfoRow>
                                    <PhoneIcon />
                                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                                      {order.technician_phone}
                                    </Typography>
                                  </InfoRow>
                                )}
                              </Box>
                            </Grid>
                          )}
                        </Grid>

                        {/* Action Buttons */}
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'flex-end', 
                          gap: 2, 
                          pt: 3, 
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          mt: 3
                        }}>
                          {order.status === 'DELIVERED' && order.can_rate && order.technician_name && (
                            <PremiumButton
                              onClick={() => handleRateClick(order)}
                              startIcon={<StarIcon />}
                            >
                              Rate Technician
                            </PremiumButton>
                          )}
                          
                          {order.status === 'DELIVERED' && !order.can_rate && (
                            <Chip 
                              icon={<CheckCircleIcon />}
                              label="Rated" 
                              sx={{ 
                                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                                color: '#22c55e',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                fontWeight: 600
                              }}
                            />
                          )}
                          
                          {order.status === 'PENDING' && (
                            <CancelButton 
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              Cancel Order
                            </CancelButton>
                          )}
                        </Box>
                      </CardContent>
                    </OrderCard>
                  </Grid>
                ))}
              </Grid>
            )}
          </ContentContainer>
        </OrdersContent>
      </PageWrapper>

      {/* Rating Modal */}
      <RatingModal
        open={ratingModalOpen}
        onClose={() => {
          setRatingModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder ? {
          id: selectedOrder.id,
          technician_name: selectedOrder.technician_name,
          technician_phone: selectedOrder.technician_phone,
        } : undefined}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </>
  );
};