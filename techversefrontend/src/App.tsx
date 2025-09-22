// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { LandingPage } from './pages/LandingPage';
import { StorePage } from './pages/StorePage';

function App() {
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/store" element={<StorePage />} />
          {/* We will add the /services route later */}
        </Routes>
      </main>
    </>
  );
}

export default App;