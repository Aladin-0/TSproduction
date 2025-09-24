// src/App.tsx
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useUserStore } from './stores/userStore'; // Import the user store

// Import your components
import { NavBar } from './components/NavBar';
import { LandingPage } from './pages/LandingPage';
import { StorePage } from './pages/StorePage';
import { LoginPage } from './pages/LoginPage';
import { ServiceCategoryPage } from './pages/ServiceCategoryPage';
import { ServiceRequestPage } from './pages/ServiceRequestPage';
// Add any other page imports here

function App() {
  // Get the function from our user store
  const { checkAuthStatus } = useUserStore();

  // THIS IS THE CRUCIAL PART
  // This useEffect hook runs once when the app first loads
  useEffect(() => {
    // It calls the function that asks the Django backend "who is logged in?"
    checkAuthStatus();
  }, [checkAuthStatus]); // The dependency array ensures it only runs once

  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/services" aname='services' element={<ServiceCategoryPage />} />
          <Route path="/services/request/:categoryId" aname='create_service_request' element={<ServiceRequestPage />} />
          <Route path="/login" aname='login' element={<LoginPage />} />
          {/* Add other routes like /profile here later */}
        </Routes>
      </main>
    </>
  );
}

export default App;