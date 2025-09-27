// src/App.tsx - Updated with cart initialization
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import { TechnicianDashboard } from './pages/TechnicianDashboard';
import CheckoutPage from './pages/CheckoutPage';

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
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/services" element={<ServiceCategoryPage />} />
          <Route path="/services/request/:categoryId" element={<ServiceRequestPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/my-orders" element={<OrdersPage />} />
          <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;