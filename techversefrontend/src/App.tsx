// src/App.tsx - Updated with TechnicianDashboard route
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useUserStore } from './stores/userStore';
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

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

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