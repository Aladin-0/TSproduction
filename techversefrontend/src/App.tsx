// src/App.tsx - Updated with technician redirect logic
import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from './stores/userStore';
import { useCartStore } from './stores/cartStore';
import { LoginSuccessHandler } from './components/LoginSuccessHandler';
import { NavBar } from './components/NavBar';
import { LandingPage } from './pages/LandingPage';
import { StorePage } from './pages/StorePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ServiceCategoryPage } from './pages/ServiceCategoryPage';
import { ServiceRequestPage } from './pages/ServiceRequestPage';
import { LoginPage } from './pages/LoginPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { OrdersPage } from './pages/OrdersPage';
import { ServiceHistoryPage } from './pages/ServiceHistoryPage';
import { TechnicianDashboard } from './pages/TechnicianDashboard';
import CheckoutPage from './pages/CheckoutPage';

// Protected Route Component for Technicians
const TechnicianRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'TECHNICIAN') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Protected Route Component for Non-Technicians
const CustomerRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  
  // If user is a technician, redirect to their dashboard
  if (isAuthenticated && user && user.role === 'TECHNICIAN') {
    return <Navigate to="/technician/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Component that handles initial redirect for technicians
const TechnicianRedirect = () => {
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is authenticated and is a technician, redirect to dashboard
    if (isAuthenticated && user && user.role === 'TECHNICIAN') {
      // Only redirect if not already on technician dashboard
      if (!location.pathname.startsWith('/technician')) {
        navigate('/technician/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location.pathname]);

  return null;
};

function App() {
  const checkAuthStatus = useUserStore((state) => state.checkAuthStatus);
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const setCurrentUser = useCartStore((state) => state.setCurrentUser);

  useEffect(() => {
    // Check authentication status on app start
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Sync cart with user authentication state
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, syncing cart for user:', user.id);
      setCurrentUser(user.id.toString());
    } else {
      console.log('User not authenticated, clearing cart');
      setCurrentUser(null);
    }
  }, [isAuthenticated, user, setCurrentUser]);

  return (
    <>
      <LoginSuccessHandler />
      <TechnicianRedirect />
      
      {/* Show NavBar only for non-technicians or on login page */}
      {(!isAuthenticated || !user || user.role !== 'TECHNICIAN') && <NavBar />}
      
      <main>
        <Routes>
          {/* Login Route - Accessible to all */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Technician Routes - Only for technicians */}
          <Route 
            path="/technician/dashboard" 
            element={
              <TechnicianRoute>
                <TechnicianDashboard />
              </TechnicianRoute>
            } 
          />
          
          {/* Customer Routes - Redirect technicians away */}
          <Route 
            path="/" 
            element={
              <CustomerRoute>
                <LandingPage />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/store" 
            element={
              <CustomerRoute>
                <StorePage />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/product/:slug" 
            element={
              <CustomerRoute>
                <ProductDetailPage />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/services" 
            element={
              <CustomerRoute>
                <ServiceCategoryPage />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/services/request/:categoryId" 
            element={
              <CustomerRoute>
                <ServiceRequestPage />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <CustomerRoute>
                <UserProfilePage />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/my-orders" 
            element={
              <CustomerRoute>
                <OrdersPage />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/service-history" 
            element={
              <CustomerRoute>
                <ServiceHistoryPage />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <CustomerRoute>
                <CheckoutPage />
              </CustomerRoute>
            } 
          />
          
          {/* Catch all route - redirect based on user role */}
          <Route 
            path="*" 
            element={
              isAuthenticated && user && user.role === 'TECHNICIAN' 
                ? <Navigate to="/technician/dashboard" replace />
                : <Navigate to="/" replace />
            } 
          />
        </Routes>
      </main>
    </>
  );
}

export default App;