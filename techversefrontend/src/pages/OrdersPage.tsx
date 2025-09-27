// src/pages/OrdersPage.tsx - Fixed version
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
  Skeleton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import BuildIcon from '@mui/icons-material/Build';
import StarIcon from '@mui/icons-material/Star';
import apiClient from '../api';
import { useSnackbar } from 'notistack';

// Page wrapper matching your design
const PageWrapper = styled(Box)({
  backgroundColor: '#000000',
  color: 'white',
  fontFamily: "'Inter', sans-serif",
  minHeight: '100vh',
  width: '100%',
  paddingTop: '80px',
});

// Hero section
const OrdersHero = styled(Box)({
  background: `
    radial-gradient(ellipse 1200px 800px at 50% 20%, rgba(64, 64, 64, 0.15) 0%, transparent 50%),
    linear-gradient(135deg, #000000 0%, #111111 50%, #000000 100%)
  `,
  padding: '60px 60px 40px',
  textAlign: 'center',
  position: 'relative',
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

// Premium order cards
const OrderCard = styled(Card)({
  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 255, 255, 0.05) 100%)`,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
  marginBottom: '24px',
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(20px)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-4px)',
  },
});

const OrderHeader = styled(Box)({
  padding: '24px 32px 20px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const OrderTitle = styled(Typography)({
  fontSize: '18px',
  fontWeight: 600,
  color: 'rgba(255, 255, 255, 0.95)',
});

const StatusChip = styled(Chip)<{ status: string }>(({ status }) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
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
  };
});

const PremiumButton = styled(Button)({
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '12px',
  padding: '8px 16px',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
});

// Order status icons
const StatusIcon = ({ status }: { status: string }) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return <PendingIcon sx={{ color: '#fbbf24' }} />;
    case 'processing':
      return <BuildIcon sx={{ color: '#3b82f6' }} />;
    case 'shipped':
      return <LocalShippingIcon sx={{ color: '#8b5cf6' }} />;
    case 'delivered':
      return <CheckCircleIcon sx={{ color: '#22c55e' }} />;
    case 'cancelled':
      return <CancelIcon sx={{ color: '#ef4444' }} />;
    default:
      return <PendingIcon sx={{ color: '#9ca3af' }} />;
  }
};

interface OrderItem {
  id: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: string;
}

interface ShippingAddress {
  street_address: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  id: number;
  order_date: string;
  status: string;
  total_amount: string;
  shipping_address_details?: ShippingAddress | null;
  items: OrderItem[];
  technician_name?: string;
  technician_phone?: string;
  can_rate?: boolean;
}

export const OrdersPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/orders/');
      console.log('Orders response:', response.data);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      enqueueSnackbar('Failed to load orders', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await apiClient.post(`/api/orders/${orderId}/cancel/`);
      enqueueSnackbar('Order cancelled successfully', { variant: 'success' });
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error cancelling order:', error);
      enqueueSnackbar('Failed to cancel order', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <OrdersHero>
          <HeroTitle>My Orders</HeroTitle>
        </OrdersHero>
        <OrdersContent>
          <ContentContainer>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton 
                key={index} 
                variant="rectangular" 
                height={200} 
                sx={{ 
                  mb: 3, 
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }} 
              />
            ))}
          </ContentContainer>
        </OrdersContent>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <OrdersHero>
        <HeroTitle>My Orders</HeroTitle>
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '16px' }}>
          Track and manage your orders
        </Typography>
      </OrdersHero>

      <OrdersContent>
        <ContentContainer>
          {orders.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <LocalShippingIcon sx={{ fontSize: '64px', color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '20px', mb: 1 }}>
                No orders yet
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 3 }}>
                Start shopping to see your orders here
              </Typography>
              <PremiumButton onClick={() => window.location.href = '/store'}>
                Browse Products
              </PremiumButton>
            </Box>
          ) : (
            orders.map((order) => (
              <OrderCard key={order.id}>
                <OrderHeader>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <StatusIcon status={order.status} />
                    <OrderTitle>Order #{order.id}</OrderTitle>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <StatusChip label={order.status} status={order.status} size="small" />
                    <PremiumButton onClick={() => handleOrderClick(order)}>
                      View Details
                    </PremiumButton>
                  </Box>
                </OrderHeader>

                <CardContent sx={{ padding: '24px 32px' }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', mb: 1 }}>
                        ORDER DATE
                      </Typography>
                      <Typography sx={{ color: 'white', fontWeight: 500, mb: 2 }}>
                        {new Date(order.order_date).toLocaleDateString()}
                      </Typography>
                      
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', mb: 1 }}>
                        TOTAL AMOUNT
                      </Typography>
                      <Typography sx={{ color: '#60a5fa', fontWeight: 600, fontSize: '18px' }}>
                        ₹{order.total_amount}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', mb: 1 }}>
                        SHIPPING ADDRESS
                      </Typography>
                      {order.shipping_address_details ? (
                        <Typography sx={{ color: 'white', fontWeight: 400, fontSize: '14px', lineHeight: 1.5 }}>
                          {order.shipping_address_details.street_address}<br />
                          {order.shipping_address_details.city}, {order.shipping_address_details.state} - {order.shipping_address_details.pincode}
                        </Typography>
                      ) : (
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', fontStyle: 'italic' }}>
                          No address provided
                        </Typography>
                      )}
                    </Grid>

                    {order.technician_name && (
                      <Grid item xs={12}>
                        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', mb: 1 }}>
                          ASSIGNED TECHNICIAN
                        </Typography>
                        <Typography sx={{ color: 'white', fontWeight: 500 }}>
                          {order.technician_name}
                          {order.technician_phone && (
                            <Typography component="span" sx={{ color: 'rgba(255, 255, 255, 0.6)', ml: 2 }}>
                              {order.technician_phone}
                            </Typography>
                          )}
                        </Typography>
                      </Grid>
                    )}

                    {/* Action buttons */}
                    <Grid item xs={12}>
                      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {order.status === 'DELIVERED' && order.can_rate && (
                          <PremiumButton 
                            onClick={() => window.location.href = `/rate-order/${order.id}`}
                            sx={{ 
                              backgroundColor: 'rgba(251, 191, 36, 0.15)',
                              borderColor: 'rgba(251, 191, 36, 0.3)',
                              color: '#fbbf24',
                              '&:hover': {
                                backgroundColor: 'rgba(251, 191, 36, 0.25)',
                              }
                            }}
                          >
                            <StarIcon sx={{ mr: 1, fontSize: '16px' }} />
                            Rate Service
                          </PremiumButton>
                        )}
                        
                        {(['PENDING', 'PROCESSING'].includes(order.status)) && (
                          <PremiumButton 
                            onClick={() => handleCancelOrder(order.id)}
                            sx={{ 
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              borderColor: 'rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              '&:hover': {
                                backgroundColor: 'rgba(239, 68, 68, 0.25)',
                              }
                            }}
                          >
                            Cancel Order
                          </PremiumButton>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </OrderCard>
            ))
          )}
        </ContentContainer>
      </OrdersContent>

      {/* Order Details Dialog */}
      <Dialog
        open={orderDetailsOpen}
        onClose={() => setOrderDetailsOpen(false)}
        maxWidth="md"
        fullWidth
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
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          Order #{selectedOrder?.id} Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedOrder && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
                  Order Items
                </Typography>
                {selectedOrder.items?.length > 0 ? (
                  selectedOrder.items.map((item) => (
                    <Box key={item.id} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      p: 2,
                      mb: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '12px'
                    }}>
                      <Box sx={{ 
                        width: '60px', 
                        height: '60px', 
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {item.product_image ? (
                          <img 
                            src={item.product_image.startsWith('http') ? item.product_image : `http://127.0.0.1:8000${item.product_image}`}
                            alt={item.product_name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                          />
                        ) : (
                          <Typography sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px' }}>
                            IMG
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: 'white', fontWeight: 500 }}>
                          {item.product_name}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                          Quantity: {item.quantity}
                        </Typography>
                      </Box>
                      <Typography sx={{ color: '#60a5fa', fontWeight: 600 }}>
                        ₹{item.price}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    No items found
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <PremiumButton onClick={() => setOrderDetailsOpen(false)}>
            Close
          </PremiumButton>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
};