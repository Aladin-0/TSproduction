// src/pages/CheckoutPage.tsx
import React, { useState, useEffect } from 'react';
import { useCartStore } from '../stores/cartStore';
import { useProductStore } from '../stores/productStore';
import { useUserStore } from '../stores/userStore';
import apiClient from '../api';

const CheckoutPage: React.FC = () => {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { addresses, fetchAddresses } = useProductStore();
  const { user, isAuthenticated } = useUserStore();
  
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    
    if (items.length === 0) {
      window.location.href = '/store';
      return;
    }
    
    fetchAddresses();
  }, [isAuthenticated, items.length, fetchAddresses]);

  useEffect(() => {
    const defaultAddress = addresses.find(addr => addr.is_default);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress.id.toString());
    }
  }, [addresses]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }

    setLoading(true);
    try {
      // Create orders for each item (simplified approach)
      const orderPromises = items.map(item =>
        apiClient.post('/api/orders/create/', {
          product_slug: item.product.slug,
          quantity: item.quantity,
          address_id: selectedAddress
        })
      );

      await Promise.all(orderPromises);
      
      clearCart();
      setOrderSuccess(true);
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = getTotalPrice();

  if (orderSuccess) {
    return (
      <div style={{
        backgroundColor: '#000000',
        color: 'white',
        minHeight: '100vh',
        paddingTop: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}>
        <div>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎉</div>
          <h1 style={{ fontSize: '36px', marginBottom: '16px', color: '#22c55e' }}>
            Order Placed Successfully!
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '32px' }}>
            Thank you for your purchase. You'll receive an email confirmation shortly.
          </p>
          <button
            onClick={() => window.location.href = '/my-orders'}
            style={{
              backgroundColor: 'rgba(96, 165, 250, 0.15)',
              border: '1px solid rgba(96, 165, 250, 0.3)',
              color: '#60a5fa',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginRight: '16px',
            }}
          >
            View Orders
          </button>
          <button
            onClick={() => window.location.href = '/store'}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'white',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#000000',
      color: 'white',
      minHeight: '100vh',
      paddingTop: '80px',
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, rgba(64, 64, 64, 0.15) 0%, transparent 50%)`,
        padding: '60px 60px 40px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '700',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #ffffff, #e0e0e0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Checkout
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '16px' }}>
          Review your order and complete your purchase
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '60px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
          
          {/* Order Items */}
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'rgba(255, 255, 255, 0.95)' }}>
              Order Summary
            </h2>
            <div style={{
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)`,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '32px',
            }}>
              {items.map((item) => (
                <div key={item.product.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {item.product.image ? (
                      <img 
                        src={item.product.image.startsWith('http') ? item.product.image : `http://127.0.0.1:8000${item.product.image}`}
                        alt={item.product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    ) : (
                      <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                        {item.product.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: '500', marginBottom: '4px' }}>
                      {item.product.name}
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px' }}>
                      Quantity: {item.quantity}
                    </div>
                  </div>
                  <div style={{ color: '#60a5fa', fontWeight: '600', fontSize: '18px' }}>
                    ₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Address */}
            <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'rgba(255, 255, 255, 0.95)' }}>
              Delivery Address
            </h2>
            <div style={{
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)`,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '24px',
            }}>
              {addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '16px' }}>
                    No addresses found. Please add an address first.
                  </p>
                  <button
                    onClick={() => window.location.href = '/profile'}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: 'white',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      cursor: 'pointer',
                    }}
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                addresses.map((address) => (
                  <div key={address.id} style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px',
                      backgroundColor: selectedAddress === address.id.toString() ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
                      border: `1px solid ${selectedAddress === address.id.toString() ? 'rgba(96, 165, 250, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                    }}>
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddress === address.id.toString()}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                        style={{ marginTop: '4px' }}
                      />
                      <div>
                        {address.is_default && (
                          <span style={{
                            backgroundColor: 'rgba(34, 197, 94, 0.15)',
                            color: '#22c55e',
                            fontSize: '10px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            marginBottom: '8px',
                            display: 'inline-block',
                          }}>
                            DEFAULT
                          </span>
                        )}
                        <div style={{ color: 'white', fontWeight: '500', marginBottom: '4px' }}>
                          {address.street_address}
                        </div>
                        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                          {address.city}, {address.state} - {address.pincode}
                        </div>
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Order Total */}
          <div>
            <div style={{
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)`,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '24px',
              position: 'sticky',
              top: '100px',
            }}>
              <h3 style={{ fontSize: '20px', marginBottom: '20px', color: 'rgba(255, 255, 255, 0.95)' }}>
                Order Total
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Subtotal:</span>
                  <span style={{ color: 'white' }}>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Delivery:</span>
                  <span style={{ color: '#22c55e' }}>Free</span>
                </div>
                <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '16px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '600' }}>
                  <span style={{ color: 'white' }}>Total:</span>
                  <span style={{ color: '#60a5fa' }}>₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress || addresses.length === 0}
                style={{
                  width: '100%',
                  backgroundColor: loading ? 'rgba(96, 165, 250, 0.1)' : 'rgba(96, 165, 250, 0.15)',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  color: loading ? 'rgba(96, 165, 250, 0.5)' : '#60a5fa',
                  borderRadius: '16px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;