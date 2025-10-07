// ==================== CORRECTED PART 1 START ====================

import React, { useRef, useEffect, Suspense, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Button, Grid, Typography, IconButton } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import { useSpring as useSpringWeb, animated as a } from '@react-spring/web';
import { useSpring as useSpring3d, animated as a3 } from '@react-spring/three';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { LoginSuccessHandler } from '../components/LoginSuccessHandler'; 
import { Footer } from '../components/Footer';

// A single theme for consistent breakpoints
const theme = createTheme();

// Main wrapper for the entire page
const PageWrapper = styled(Box)({
  backgroundColor: '#0a0a0a',
  color: 'white',
  fontFamily: "'Inter', sans-serif",
  minHeight: '100vh',
  width: '100%',
  overflowX: 'hidden',
});

// Hero section styles - KEEP BACKGROUND IMAGE
const HeroSection = styled(Box)({
  backgroundImage: 'url("/src/assets/hero-bg.png")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  position: 'relative',
  minHeight: '60vh',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#0a0a0a',
  '@media (max-width:900px)': {
    minHeight: '75vh',
    backgroundImage: 'url("/src/assets/hero-bg.png")', // KEEP IT ON MOBILE
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
});

// Navigation styles - PROFESSIONAL MOBILE NAV
const Nav = styled(Box)({
  position: 'relative',
  zIndex: 10,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '32px 55px',
  '@media (max-width:900px)': {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(10, 10, 10, 0.8)',
    backdropFilter: 'blur(10px)',
  },
});

const Logo = styled(Typography)({
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '1.5px',
  color: '#ffffff',
  '@media (max-width:900px)': {
    fontSize: '16px',
    letterSpacing: '2px',
  },
});

const BlankButton = styled(Button)({
  background: 'transparent',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  color: 'rgba(255, 255, 255, 0.75)',
  padding: '7px 20px',
  borderRadius: '18px',
  fontSize: '10px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  fontFamily: "'Inter', sans-serif",
  letterSpacing: '0.3px',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  '@media (max-width:900px)': {
    padding: '6px 16px',
    fontSize: '9px',
    borderRadius: '14px',
  },
});

// Hero container styles - MOBILE OPTIMIZED
const HeroContainer = styled(Box)({
  position: 'relative',
  zIndex: 5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '40px 55px 60px',
  maxWidth: '1200px',
  margin: '0 auto',
  width: '100%',
  '@media (max-width:900px)': {
    flexDirection: 'column',
    padding: '30px 20px 20px',
    textAlign: 'center',
    gap: '20px',
  },
});

const HeroLeft = styled(Box)({
  flex: '0 0 45%',
  paddingTop: '20px',
  position: 'relative',
  zIndex: 2,
  '@media (max-width:900px)': {
    flex: 'none',
    paddingTop: '10px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
});

const HeroTitle = styled(Typography)({
  fontSize: '64px',
  fontWeight: 700,
  letterSpacing: '-0.5px',
  marginBottom: '14px',
  color: '#ffffff',
  lineHeight: 1,
  marginLeft: '-60px',
  '@media (max-width:900px)': {
    fontSize: '36px',
    marginLeft: '0',
    marginBottom: '12px',
    letterSpacing: '1px',
  },
});

const HeroSubtitle = styled(Typography)({
  fontSize: '25px',
  color: 'rgba(255, 255, 255, 0.45)',
  fontWeight: 400,
  marginBottom: '28px',
  letterSpacing: '0.1px',
  marginLeft: '-60px',
  '@media (max-width:900px)': {
    fontSize: '14px',
    marginLeft: '0',
    marginBottom: '20px',
    maxWidth: '280px',
    lineHeight: 1.4,
  },
});

const ExploreButton = styled(Button)({
  background: 'transparent',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  color: 'rgba(255, 255, 255, 0.75)',
  padding: '10px 26px',
  borderRadius: '22px',
  fontSize: '15px',
  fontWeight: 1000,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  fontFamily: "'Inter', sans-serif",
  letterSpacing: '0.8px',
  textTransform: 'uppercase',
  marginLeft: '-60px',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    transform: 'translateY(-1px)',
  },
  '@media (max-width:900px)': {
    marginLeft: '0',
    padding: '8px 24px',
    fontSize: '11px',
    borderRadius: '18px',
    fontWeight: 700,
  },
});

const ArrowButton = styled(IconButton)({
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: 'rgba(255, 255, 255, 0.7)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  '@media (max-width:900px)': {
    width: '36px',
    height: '36px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
});

const CanvasWrapper = styled(Box)({
  position: 'absolute',
  top: '80%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '290%',
  height: '290%',
  zIndex: 1,
  overflow: 'visible',
  '@media (max-width:900px)': {
    position: 'relative',
    top: 'auto',
    left: 'auto',
    transform: 'none',
    width: '100%',
    height: '280px',
    marginTop: '15px',
  },
});

// CATEGORY SECTION - 3 CARDS PER ROW ON MOBILE
const CategorySection = styled(Box)({
  padding: '100px 55px',
  background: 'radial-gradient(circle at 50% 0%, #1a1a1a 0%, #0a0a0a 40%)',
  position: 'relative',
  overflow: 'hidden',
  zIndex: 10,
  '@media (max-width:900px)': {
    padding: '50px 20px',
  },
});

const SectionHeader = styled(Box)({
  textAlign: 'center',
  marginBottom: '64px',
  '@media (max-width:900px)': {
    marginBottom: '35px',
  },
});

const SectionTitle = styled(Typography)({
  fontSize: '32px',
  fontWeight: 700,
  marginBottom: '16px',
  color: 'rgba(255, 255, 255, 0.95)',
  '@media (max-width:900px)': {
    fontSize: '24px',
    marginBottom: '8px',
    letterSpacing: '0.3px',
  },
});

// UPDATED: 4 columns desktop, 3 columns mobile (600px+), 2 columns small mobile
const CategoryGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '48px 24px',
  maxWidth: '1200px',
  margin: '0 auto',
  '@media (max-width:1024px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '30px 16px',
  },
  '@media (max-width:900px)': {
    gridTemplateColumns: 'repeat(3, 1fr)', // 3 CARDS PER ROW
    gap: '24px 10px',
  },
  '@media (max-width:500px)': {
    gridTemplateColumns: 'repeat(2, 1fr)', // 2 cards on very small screens
    gap: '20px 10px',
  },
});

const CategoryItemWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  position: 'relative',
  zIndex: 11,
  '@media (max-width:900px)': {
    gap: '8px',
  },
});

const AnimatedCardBase = a(Box);
const AnimatedCardContainer = styled(AnimatedCardBase)({
    position: 'relative',
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: '12px',
    backgroundColor: '#101010',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    transformStyle: 'preserve-3d',
    willChange: 'transform, box-shadow',
    zIndex: 12,
    '@media (max-width:900px)': {
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
    },
});

const ProductImage = styled('img')({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '12px',
    opacity: 0,
    transform: 'translateZ(0px) scale(0.9)',
    transition: 'all 0.6s cubic-bezier(0.23, 1, 0.320, 1)',
    filter: 'brightness(0.8) contrast(1.1)',
    '@media (max-width:900px)': {
      borderRadius: '8px',
      opacity: 0.95,
      transform: 'translateZ(0px) scale(1)',
      filter: 'brightness(0.85) contrast(1.05)',
    },
});

const CardGlow = styled(Box)({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '12px',
    opacity: 0,
    transition: 'all 0.6s cubic-bezier(0.23, 1, 0.320, 1)',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02))',
    boxShadow: `
        0 0 30px 10px rgba(255, 255, 255, 0.05),
        inset 0 0 25px 5px rgba(255, 255, 255, 0.08)
    `,
    '@media (max-width:900px)': {
      borderRadius: '8px',
    },
});

const CategoryOverlay = styled(Box)({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.1))',
    opacity: 0,
    transition: 'all 0.6s cubic-bezier(0.23, 1, 0.320, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(2px)',
    '@media (max-width:900px)': {
      borderRadius: '8px',
      opacity: 0.1,
    },
});

const PlaceholderBox = styled(Box)({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #1a1a1a, #0f0f0f)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: 500,
    letterSpacing: '0.5px',
    transition: 'all 0.6s cubic-bezier(0.23, 1, 0.320, 1)',
    '@media (max-width:900px)': {
      borderRadius: '8px',
      fontSize: '10px',
    },
});

const CategoryName = styled(Typography)({
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.5)',
    transition: 'all 0.6s cubic-bezier(0.23, 1, 0.320, 1)',
    transform: 'translateY(20px)',
    opacity: 0,
    fontSize: '14px',
    letterSpacing: '0.5px',
    textAlign: 'center',
    '@media (max-width:900px)': {
      fontSize: '9px',
      opacity: 0.85,
      transform: 'translateY(0px)',
      color: 'rgba(255, 255, 255, 0.75)',
      letterSpacing: '0.2px',
      fontWeight: 500,
    },
});

// ABOUT SECTION - MOBILE OPTIMIZED
const AboutSection = styled(Box)({
  background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
  borderRadius: '24px',
  padding: '60px 65px',
  margin: '40px 55px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  display: 'grid',
  gridTemplateColumns: '1.2fr 1.4fr 1.2fr',
  gap: '65px',
  alignItems: 'start',
  position: 'relative',
  zIndex: 5,
  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  '@media (max-width:900px)': {
    gridTemplateColumns: '1fr',
    gap: '35px',
    margin: '30px 20px',
    padding: '35px 25px',
    textAlign: 'center',
    borderRadius: '16px',
  },
});

const AboutContent = styled(Box)({ 
  '& h3': { 
    fontSize: '24px', 
    fontWeight: 700, 
    marginBottom: '18px', 
    color: 'rgba(255, 255, 255, 0.95)',
    background: 'linear-gradient(135deg, #ffffff, #e0e0e0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '0.5px',
    '@media (max-width:900px)': {
      fontSize: '20px',
      marginBottom: '14px',
    },
  }, 
  '& p': { 
    fontSize: '14px', 
    lineHeight: 1.8, 
    color: 'rgba(255, 255, 255, 0.6)', 
    fontWeight: 400,
    marginBottom: '20px',
    '@media (max-width:900px)': {
      fontSize: '13px',
      lineHeight: 1.6,
      marginBottom: '15px',
    },
  } 
});

const ServicesWrapper = styled(Box)({ 
  display: 'flex', 
  gap: '45px', 
  justifyContent: 'center', 
  paddingTop: '15px',
  '@media (max-width:900px)': {
    gap: '20px',
    paddingTop: '10px',
  },
  '@media (max-width:600px)': {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '20px',
  },
});

const ServiceBox = styled(Box)({ 
  textAlign: 'center',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)'
  },
  '@media (max-width:900px)': {
    flex: '0 0 auto',
  },
});

const ServiceIconBox = styled(Box)({ 
  width: '64px', 
  height: '64px', 
  background: 'linear-gradient(135deg, #2a2a2a, #1e1e1e)', 
  border: '1px solid rgba(255, 255, 255, 0.12)', 
  borderRadius: '12px', 
  margin: '0 auto 15px', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  fontSize: '28px', 
  transition: 'all 0.4s ease', 
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
  '&:hover': { 
    background: 'linear-gradient(135deg, #3a3a3a, #2e2e2e)', 
    borderColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 25px rgba(0, 0, 0, 0.4)'
  },
  '@media (max-width:900px)': {
    width: '50px',
    height: '50px',
    fontSize: '22px',
    borderRadius: '10px',
    margin: '0 auto 10px',
  },
});

const ServiceText = styled(Typography)({ 
  fontSize: '12px', 
  color: 'rgba(255, 255, 255, 0.7)', 
  fontWeight: 500,
  letterSpacing: '0.3px',
  '@media (max-width:900px)': {
    fontSize: '10px',
  },
});

const StatsSection = styled(Box)({ 
  '& h3': { 
    fontSize: '24px', 
    fontWeight: 700, 
    marginBottom: '8px', 
    color: 'rgba(255, 255, 255, 0.95)',
    background: 'linear-gradient(135deg, #ffffff, #e0e0e0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '0.5px',
    '@media (max-width:900px)': {
      fontSize: '20px',
    },
  }, 
  '& .subtext': { 
    fontSize: '12px', 
    color: 'rgba(255, 255, 255, 0.4)', 
    marginBottom: '25px', 
    fontWeight: 400,
    '@media (max-width:900px)': {
      fontSize: '11px',
      marginBottom: '20px',
    },
  } 
});

const StatsGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
  '@media (max-width:900px)': {
    gap: '12px',
  },
});

const StatItem = styled(Box)({
  textAlign: 'center',
  padding: '20px 15px',
  background: 'rgba(255, 255, 255, 0.02)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-2px)'
  },
  '@media (max-width:900px)': {
    padding: '16px 12px',
    borderRadius: '10px',
  },
});

const StatNumber = styled(Typography)({
  fontSize: '28px',
  fontWeight: 700,
  color: '#ffffff',
  marginBottom: '5px',
  background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  '@media (max-width:900px)': {
    fontSize: '22px',
  },
});

const StatLabel = styled(Typography)({
  fontSize: '11px',
  color: 'rgba(255, 255, 255, 0.6)',
  fontWeight: 400,
  letterSpacing: '0.3px',
  '@media (max-width:900px)': {
    fontSize: '10px',
  },
});

// 3D Model components
function GamingLaptop(props) {
  const { scene } = useGLTF('/gaming_laptop.glb');
  return <primitive object={scene} scale={2.0} position={[0, 1, 0]} {...props} />;
}

function MechanicalKeyboard(props) {
  const { scene } = useGLTF('/aula_f75_mechanical_keyboard.glb');
  return <primitive object={scene} scale={1.0} position={[0, 2, 0]} {...props} />;
}

function GamingHeadphone(props) {
  const { scene } = useGLTF('/gaming_headphone.glb');
  return <primitive object={scene} scale={20.0} position={[0, -1, 0]} {...props} />;
}

// Data for categories
const categories = [
    { name: 'Laptop / PC', image: '/src/assets/laptop.jpg', hoverColor: 'rgba(59, 130, 246, 0.1)' },
    { name: 'Printer', image: '/src/assets/Printer.png', hoverColor: 'rgba(16, 185, 129, 0.1)' },
    { name: 'Keyboard', image: '/src/assets/Keyboard.png', hoverColor: 'rgba(139, 92, 246, 0.1)' },
    { name: 'Mouse', image: '/src/assets/Mouse.jpeg', hoverColor: 'rgba(245, 101, 101, 0.1)' },
    { name: 'Monitor', image: '/src/assets/Monitor.jpg', hoverColor: 'rgba(251, 191, 36, 0.1)' },
    { name: 'CCTV / Analog', image: '/src/assets/CCTV.jpg', hoverColor: 'rgba(236, 72, 153, 0.1)' },
    { name: 'Headphones', image: '/src/assets/Headphones.jpg', hoverColor: 'rgba(6, 182, 212, 0.1)' },
    { name: 'Refurbished', image: '/src/assets/Refurbished.jpg', hoverColor: 'rgba(34, 197, 94, 0.1)' },
];

const AnimatedCategoryCard = ({ category }) => {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth <= 900);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const [props, api] = useSpringWeb(() => ({
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        config: { mass: 0.8, tension: 280, friction: 35 },
    }));

    const handleMouseMove = (e) => {
        if (!hovered || isMobile) return;
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const rotateX = (clientY - centerY) / 8;
        const rotateY = (centerX - clientX) / 8;
        const rotateZ = (clientX - centerX) / 25;
        
        api.start({ 
            rotateX: Math.max(-25, Math.min(25, rotateX)), 
            rotateY: Math.max(-25, Math.min(25, rotateY)),
            rotateZ: Math.max(-10, Math.min(10, rotateZ))
        });
    };

    const handleMouseEnter = () => { 
        if (isMobile) return;
        setHovered(true); 
        api.start({ scale: 1.08 }); 
    };
    
    const handleMouseLeave = () => { 
        if (isMobile) return;
        setHovered(false); 
        api.start({ scale: 1, rotateX: 0, rotateY: 0, rotateZ: 0 }); 
    };

    const handleCategoryClick = () => {
        const target = encodeURIComponent(category.name);
        navigate(`/store?category=${target}`);
    };

    return (
        <CategoryItemWrapper>
            <AnimatedCardContainer
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleCategoryClick}
                style={isMobile ? {} : {
                    transform: 'perspective(1200px)',
                    scale: props.scale,
                    rotateX: props.rotateX.to(val => `${val}deg`),
                    rotateY: props.rotateY.to(val => `${val}deg`),
                    rotateZ: props.rotateZ.to(val => `${val}deg`),
                }}
            >
                {category.image && (
                  <ProductImage 
                    src={category.image}
                    alt={category.name}
                    style={{ 
                      opacity: hovered ? 1 : 0.95,
                      transform: hovered && !isMobile ? 'translateZ(6px) scale(1.02)' : 'translateZ(0px) scale(1)',
                      filter: hovered && !isMobile ? 'brightness(0.95) contrast(1.05)' : 'brightness(0.85) contrast(1.08)'
                    }}
                  />
                )}
                
                <CardGlow 
                    style={{ 
                        opacity: hovered && !isMobile ? 1 : 0,
                        background: hovered ? category.hoverColor : 'rgba(255, 255, 255, 0.05)'
                    }} 
                />
                
                <CategoryOverlay style={{ opacity: hovered && !isMobile ? 0.6 : 0 }} />
            </AnimatedCardContainer>
            
            <CategoryName 
                style={{ 
                    opacity: hovered && !isMobile ? 1 : 0.7, 
                    transform: hovered && !isMobile ? 'translateY(0px)' : 'translateY(10px)',
                    color: hovered && !isMobile ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.5)'
                }}
            >
                {category.name}
            </CategoryName>
        </CategoryItemWrapper>
    );
};

// ==================== PART 1 END - Confirm before Part 2 ====================
// ==================== CORRECTED PART 2 START ====================

const SendButton = styled(Button)({ 
  background: 'linear-gradient(135deg, #f8f8f8, #ffffff)', 
  color: '#0a0a0a', 
  border: 'none', 
  padding: '14px 35px', 
  borderRadius: '25px', 
  fontSize: '14px', 
  fontWeight: 700, 
  cursor: 'pointer', 
  transition: 'all 0.3s ease', 
  letterSpacing: '0.5px', 
  width: 'fit-content', 
  alignSelf: 'center', 
  display: 'block', 
  margin: '0 auto', 
  textTransform: 'uppercase', 
  boxShadow: '0 8px 20px rgba(248, 248, 248, 0.2)',
  '&:hover': { 
    background: 'linear-gradient(135deg, #ffffff, #f0f0f0)', 
    transform: 'translateY(-3px)', 
    boxShadow: '0 12px 25px rgba(248, 248, 248, 0.3)' 
  },
  '@media (max-width:900px)': {
    padding: '12px 28px',
    fontSize: '12px',
    borderRadius: '20px',
  },
});

const FeaturedWrapper = styled(Box)({ 
  padding: '80px 55px', 
  background: 'linear-gradient(135deg, #0f0f0f 0%, #0a0a0a 100%)', 
  position: 'relative', 
  zIndex: 5, 
  '@media (max-width:900px)': { 
    padding: '50px 20px',
  } 
});

const FeaturedContainer = styled(Box)({ 
  display: 'flex', 
  gap: '60px', 
  maxWidth: '1400px', 
  margin: '0 auto', 
  '@media (max-width:1024px)': { 
    flexDirection: 'column', 
    alignItems: 'center',
    gap: '40px',
  } 
});

const FeaturedLeft = styled(Box)({ 
  flex: '0 0 360px', 
  '@media (max-width:1024px)': { 
    flex: 'none', 
    width: '100%', 
    maxWidth: '600px', 
    textAlign: 'center',
  }, 
  '@media (max-width:900px)': {
    maxWidth: '100%',
  },
  '& h2': { 
    fontSize: '36px', 
    fontWeight: 700, 
    marginBottom: '20px', 
    color: 'rgba(255, 255, 255, 0.95)',
    background: 'linear-gradient(135deg, #ffffff, #e0e0e0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '0.5px',
    '@media (max-width:900px)': {
      fontSize: '26px',
      marginBottom: '16px',
    },
  }, 
  '& p': { 
    fontSize: '16px', 
    lineHeight: 1.7, 
    color: 'rgba(255, 255, 255, 0.6)', 
    marginBottom: '50px',
    fontWeight: 400,
    '@media (max-width:900px)': {
      fontSize: '14px',
      lineHeight: 1.6,
      marginBottom: '35px',
    },
  } 
});

const ContactBox = styled(Box)({ 
  background: 'linear-gradient(135deg, #1a1a1a, #151515)', 
  borderRadius: '18px', 
  padding: '35px', 
  border: '1px solid rgba(255, 255, 255, 0.08)', 
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  '@media (max-width:900px)': {
    padding: '28px 22px',
    borderRadius: '14px',
  },
  '& h3': { 
    fontSize: '22px', 
    fontWeight: 700, 
    marginBottom: '20px', 
    color: 'rgba(255, 255, 255, 0.95)',
    background: 'linear-gradient(135deg, #ffffff, #e0e0e0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '0.5px',
    '@media (max-width:900px)': {
      fontSize: '18px',
      marginBottom: '16px',
    },
  } 
});

const ContactInput = styled('input')({ 
  background: 'rgba(0, 0, 0, 0.4)', 
  border: '1px solid rgba(255, 255, 255, 0.1)', 
  padding: '14px 18px', 
  borderRadius: '8px', 
  color: 'rgba(255, 255, 255, 0.9)', 
  fontSize: '14px', 
  marginBottom: '18px', 
  width: '100%', 
  fontFamily: "'Inter', sans-serif", 
  transition: 'all 0.3s ease',
  '&::placeholder': { color: 'rgba(255, 255, 255, 0.3)' },
  '&:focus': {
    outline: 'none',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    background: 'rgba(0, 0, 0, 0.6)',
    boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.05)'
  },
  '@media (max-width:900px)': {
    padding: '12px 16px',
    fontSize: '13px',
    marginBottom: '14px',
  },
});

const FeaturedRight = styled(Box)({ 
  flex: 1, 
  display: 'grid', 
  gridTemplateColumns: 'repeat(3, 1fr)', 
  gap: '30px', 
  '@media (max-width:1024px)': { 
    width: '100%', 
    maxWidth: '800px',
  }, 
  '@media (max-width:900px)': { 
    gridTemplateColumns: '1fr', 
    gap: '20px',
  } 
});

const FeaturedCard = styled(Box)({ 
  background: 'linear-gradient(135deg, #1a1a1a, #0f0f0f)', 
  border: '1px solid rgba(255, 255, 255, 0.08)', 
  borderRadius: '16px', 
  overflow: 'hidden', 
  transition: 'all 0.4s ease', 
  height: 'fit-content', 
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
  '&:hover': { 
    transform: 'translateY(-8px)', 
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)', 
    borderColor: 'rgba(255, 255, 255, 0.15)' 
  },
  '@media (max-width:900px)': {
    borderRadius: '12px',
    '&:hover': {
      transform: 'translateY(-4px)',
    },
  },
});

const FeaturedImg = styled(Box)({ 
  height: '200px', 
  background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  fontSize: '48px', 
  color: '#404040', 
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  transition: 'all 0.3s ease',
  '.featured-card:hover &': {
    background: 'linear-gradient(135deg, #3a3a3a, #2a2a2a)'
  },
  '@media (max-width:900px)': {
    height: '160px',
    fontSize: '40px',
  },
});

const FeaturedDetails = styled(Box)({ 
  padding: '25px',
  '@media (max-width:900px)': {
    padding: '20px',
  },
});

const FeaturedTitle = styled(Typography)({ 
  fontSize: '20px', 
  fontWeight: 700, 
  marginBottom: '12px', 
  color: 'rgba(255, 255, 255, 0.95)',
  letterSpacing: '0.3px',
  '@media (max-width:900px)': {
    fontSize: '17px',
    marginBottom: '10px',
  },
});

const FeaturedDesc = styled(Typography)({ 
  fontSize: '14px', 
  color: 'rgba(255, 255, 255, 0.6)', 
  lineHeight: 1.6, 
  marginBottom: '20px', 
  fontWeight: 400,
  '@media (max-width:900px)': {
    fontSize: '13px',
    lineHeight: 1.5,
    marginBottom: '16px',
  },
});

const AuthorInfo = styled(Box)({ 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px',
  '@media (max-width:900px)': {
    gap: '10px',
  },
});

const AuthorAvatar = styled(Box)({ 
  width: '32px', 
  height: '32px', 
  borderRadius: '50%', 
  background: 'linear-gradient(135deg, #404040, #2a2a2a)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  '@media (max-width:900px)': {
    width: '28px',
    height: '28px',
  },
});

const AuthorDetails = styled(Box)({ 
  display: 'flex', 
  flexDirection: 'column' 
});

const AuthorName = styled(Typography)({ 
  fontSize: '14px', 
  fontWeight: 600, 
  color: 'rgba(255, 255, 255, 0.9)',
  letterSpacing: '0.2px',
  '@media (max-width:900px)': {
    fontSize: '12px',
  },
});

const AuthorRole = styled(Typography)({ 
  fontSize: '12px', 
  color: 'rgba(255, 255, 255, 0.5)', 
  fontWeight: 400,
  '@media (max-width:900px)': {
    fontSize: '11px',
  },
});

// Main Component
export const LandingPage = () => {
  const [currentModel, setCurrentModel] = useState(0);
  const [animating, setAnimating] = useState(false);
  const models = [GamingLaptop, MechanicalKeyboard, GamingHeadphone];

  const [slideProps, slideApi] = useSpring3d(() => ({
    position: [0, -0.5, 0],
    config: { mass: 1, tension: 170, friction: 26 },
  }));

  const { rotation } = useSpring3d({
    from: { rotation: [0, 0, 0] },
    to: { rotation: [0, Math.PI * 2, 0] },
    loop: true,
    config: { duration: 10000, easing: t => t },
  });

  const DISPLAY_TIME = 5000;

  const runAnimation = useCallback(async (direction) => {
    if (animating) return;
    setAnimating(true);
    const isNext = direction === 'next';
    const outPosition = isNext ? -20 : 20;
    const inPosition = isNext ? 20 : -20;
    await slideApi.start({ to: { position: [outPosition, -0.5, 0] } });
    setCurrentModel(current => (isNext ? (current + 1) : (current - 1 + models.length)) % models.length);
    slideApi.set({ position: [inPosition, -0.5, 0] });
    await slideApi.start({ to: { position: [0, -0.5, 0] } });
    setAnimating(false);
  }, [animating, slideApi, models.length]);

  useEffect(() => {
    if (animating) return;
    const timer = setTimeout(() => runAnimation('next'), DISPLAY_TIME);
    return () => clearTimeout(timer);
  }, [animating, currentModel, runAnimation]);

  const CurrentModelComponent = models[currentModel];
  
  return (
    <ThemeProvider theme={theme}>
    <PageWrapper>
      <HeroSection>
        <Nav>
          <Logo>TECHVERSE</Logo>
          <BlankButton>BLANK</BlankButton>
        </Nav>
        <HeroContainer>
          <HeroLeft>
            <HeroTitle>TECHVERSE</HeroTitle>
            <HeroSubtitle>Your Gateway to Innovation</HeroSubtitle>
            <ExploreButton>Explore Now</ExploreButton>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              marginTop: { xs: 3, md: 4 }, 
              marginLeft: { xs: 0, md: '-60px' }, 
              justifyContent: { xs: 'center', md: 'flex-start'}
            }}>
              <ArrowButton onClick={() => runAnimation('prev')}>
                <ArrowBackIosNewIcon sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }} />
              </ArrowButton>
              <ArrowButton onClick={() => runAnimation('next')}>
                <ArrowForwardIosIcon sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }} />
              </ArrowButton>
            </Box>
          </HeroLeft>
          <CanvasWrapper>
            <Canvas
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
              camera={{ position: [10, 10, 10], fov: 55 }}
            >
              <Suspense fallback={null}>
                <OrbitControls
                  enableZoom={false} enablePan={false}
                  minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 1.8}
                />
                <a3.group position={slideProps.position}>
                  <a3.group rotation={rotation}>
                    <CurrentModelComponent />
                  </a3.group>
                </a3.group>
                <Environment preset="city" />
                <ambientLight intensity={0.7} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
              </Suspense>
            </Canvas>
            <div style={{
              position: 'absolute', bottom: '10px', left: '50%',
              transform: 'translateX(-50%)', display: 'flex',
              flexDirection: 'column', alignItems: 'center',
              gap: '10px', zIndex: 10
            }}>
              <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                {models.map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: window.innerWidth <= 900 ? '8px' : '10px', 
                      height: window.innerWidth <= 900 ? '8px' : '10px', 
                      borderRadius: '50%',
                      backgroundColor: currentModel === index ? 'white' : 'rgba(255, 255, 255, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => {
                      if (index > currentModel) runAnimation('next');
                      if (index < currentModel) runAnimation('prev');
                    }}
                  />
                ))}
              </div>
            </div>
          </CanvasWrapper>
        </HeroContainer>
      </HeroSection>
      
      <CategorySection>
        <SectionHeader>
            <SectionTitle>Shop by Category</SectionTitle>
        </SectionHeader>
        <CategoryGrid>
            {categories.map((category) => (
                <AnimatedCategoryCard key={category.name} category={category} />
            ))}
        </CategoryGrid>
      </CategorySection>

      <AboutSection>
        <AboutContent>
          <Typography variant="h3">About TechVerse</Typography>
          <Typography>
            We are passionate technology enthusiasts dedicated to bringing you the latest and greatest in tech innovation. 
            Our mission is to bridge the gap between cutting-edge technology and everyday users, making advanced tech accessible to everyone.
          </Typography>
          <Typography>
            With years of experience in the tech industry, we curate only the finest products that meet our strict quality standards.
          </Typography>
        </AboutContent>
        <ServicesWrapper>
          <ServiceBox>
            <ServiceIconBox>🔧</ServiceIconBox>
            <ServiceText>Expert Installation</ServiceText>
          </ServiceBox>
          <ServiceBox>
            <ServiceIconBox>⚡</ServiceIconBox>
            <ServiceText>Fast Delivery</ServiceText>
          </ServiceBox>
          <ServiceBox>
            <ServiceIconBox>🛡️</ServiceIconBox>
            <ServiceText>Premium Support</ServiceText>
          </ServiceBox>
        </ServicesWrapper>
        <StatsSection>
          <Typography variant="h3">Our Impact</Typography>
          <Typography className="subtext">Numbers that speak for themselves</Typography>
          <StatsGrid>
            <StatItem>
              <StatNumber>10K+</StatNumber>
              <StatLabel>Happy Customers</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>500+</StatNumber>
              <StatLabel>Products Sold</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>98%</StatNumber>
              <StatLabel>Satisfaction Rate</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>24/7</StatNumber>
              <StatLabel>Support Available</StatLabel>
            </StatItem>
          </StatsGrid>
        </StatsSection>
      </AboutSection>

      <FeaturedWrapper>
        <FeaturedContainer>
          <FeaturedLeft>
            <Typography variant="h2">Featured Technology</Typography>
            <Typography>
              Discover our handpicked selection of premium technology products. Each item is carefully chosen for its innovation, 
              quality, and ability to enhance your digital lifestyle. From cutting-edge computing solutions to immersive audio experiences.
            </Typography>
            <ContactBox>
              <Typography variant="h3">Get In Touch</Typography>
              <ContactInput type="text" placeholder="Your Name" />
              <ContactInput type="email" placeholder="Your Email" />
              <ContactInput type="text" placeholder="Subject" />
              <SendButton>Send Message</SendButton>
            </ContactBox>
          </FeaturedLeft>
          <FeaturedRight>
            <FeaturedCard className="featured-card">
              <FeaturedImg>🎧</FeaturedImg>
              <FeaturedDetails>
                <FeaturedTitle>Premium Audio</FeaturedTitle>
                <FeaturedDesc>Experience crystal-clear sound quality with our premium headphone collection. Featuring noise cancellation, wireless connectivity, and studio-grade audio performance for professionals and enthusiasts alike.</FeaturedDesc>
                <AuthorInfo><AuthorAvatar /><AuthorDetails><AuthorName>Sarah Chen</AuthorName><AuthorRole>Audio Specialist</AuthorRole></AuthorDetails></AuthorInfo>
              </FeaturedDetails>
            </FeaturedCard>
            <FeaturedCard className="featured-card">
              <FeaturedImg>💻</FeaturedImg>
              <FeaturedDetails>
                <FeaturedTitle>High-Performance Computing</FeaturedTitle>
                <FeaturedDesc>Unleash your productivity with our latest laptop and desktop solutions. Featuring cutting-edge processors, advanced graphics, and lightning-fast storage for gaming, creative work, and professional applications.</FeaturedDesc>
                <AuthorInfo><AuthorAvatar /><AuthorDetails><AuthorName>Marcus Rodriguez</AuthorName><AuthorRole>Tech Consultant</AuthorRole></AuthorDetails></AuthorInfo>
              </FeaturedDetails>
            </FeaturedCard>
            <FeaturedCard className="featured-card">
              <FeaturedImg>📱</FeaturedImg>
              <FeaturedDetails>
                <FeaturedTitle>Smart Accessories</FeaturedTitle>
                <FeaturedDesc>Enhance your tech setup with our collection of smart accessories. From wireless charging solutions to ergonomic peripherals, discover products that seamlessly integrate into your digital ecosystem.</FeaturedDesc>
                <AuthorInfo><AuthorAvatar /><AuthorDetails><AuthorName>Emily Zhang</AuthorName><AuthorRole>Product Manager</AuthorRole></AuthorDetails></AuthorInfo>
              </FeaturedDetails>
            </FeaturedCard>
          </FeaturedRight>
        </FeaturedContainer>
      </FeaturedWrapper>
      <Footer />
    </PageWrapper>
    </ThemeProvider>
  );
};

export default LandingPage;

// ==================== PART 2 END ====================