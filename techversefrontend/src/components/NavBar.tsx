// src/components/NavBar.tsx
import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Drawer, List, ListItem, Avatar } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
// Import logo image
import logoImage from '../components/Tlogo.png';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'transparent', // Start with transparent background
  backdropFilter: 'none', // No blur initially
  borderBottom: 'none', // No border initially
  boxShadow: 'none',
  position: 'fixed',
  top: 0, 
  zIndex: 1000,
  transition: 'all 0.3s ease-in-out',
  '&.scrolled': {
    // backgroundColor: 'rgba(243, 231, 231, 0.74)', // Becomes opaque on scroll
    backdropFilter: 'blur(12px)', // Add blur on scroll
    borderBottom: '1px solid var(--border-color,rgb(154, 124, 124))', // Add border on scroll
  }
}));

const NavContainer = styled(Container)(({ theme }) => ({
  width: '90%',
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}));

const LogoImg = styled('img')(({ theme }) => ({
  width: '40px',
  height: '40px',
  objectFit: 'contain',
}));

const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.5rem',
  letterSpacing: '-0.025em',
  color: 'var(--text-color, #FAFAFA)',
}));

const NavLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '30px', // Increased gap for more breathing room
  alignItems: 'center',
  '@media (max-width: 900px)': {
    display: 'none',
  },
}));

const NavLink = styled(Button)(({ theme }) => ({
  // Updated to a subtle text link for a more elegant look
  color: 'var(--secondary-text-color, #A3A3A3)',
  backgroundColor: 'transparent',
  fontSize: '1rem',
  fontWeight: 500,
  textTransform: 'none',
  padding: '8px 0',
  position: 'relative',
  transition: 'color 0.3s ease',
  '&:hover': {
    color: 'var(--text-color, #FAFAFA)',
    backgroundColor: 'transparent',
  },
  // The elegant underline hover effect
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '0%',
    height: '2px',
    backgroundColor: 'var(--text-color, #FAFAFA)',
    transition: 'width 0.3s ease',
  },
  '&:hover::after': {
    width: '100%',
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  // Updated to an outlined button for consistency and a premium feel
  backgroundColor: 'transparent',
  color: 'var(--text-color, #FAFAFA)',
  padding: '8px 24px',
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  transition: 'background-color 0.3s ease, color 0.3s ease',
  border: '1px solid var(--border-color, #262626)',
  '&:hover': {
    backgroundColor: 'var(--text-color, #FAFAFA)',
    color: 'var(--background-color, #000000)',
    borderColor: 'var(--text-color, #FAFAFA)',
  },
}));

const MobileMenuButton = styled(IconButton)(({ theme }) => ({
  color: 'var(--text-color, #FAFAFA)',
  display: 'none',
  '@media (max-width: 900px)': {
    display: 'block',
  },
}));

const DrawerList = styled(List)(({ theme }) => ({
  width: 250,
  backgroundColor: 'var(--background-color)',
  height: '100%',
  padding: '20px',
}));

const DrawerItem = styled(ListItem)(({ theme }) => ({
  padding: '15px 0',
  borderBottom: '1px solid var(--border-color)',
  '& a': {
    color: 'var(--text-color)',
    textDecoration: 'none',
    fontSize: '1.1rem',
    fontWeight: 500,
    display: 'block',
    width: '100%',
  },
}));

export const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <DrawerList>
               <DrawerItem>
                 <LogoContainer>
                   <LogoImg src={logoImage} alt="TechVerse Logo" />
                   <Logo>TechVerse</Logo>
                 </LogoContainer>
               </DrawerItem>
      <DrawerItem>
        <RouterLink to="/" onClick={handleDrawerToggle}>Home</RouterLink>
      </DrawerItem>
      <DrawerItem>
        <RouterLink to="/store" onClick={handleDrawerToggle}>Store</RouterLink>
      </DrawerItem>
      <DrawerItem>
        <RouterLink to="/services" onClick={handleDrawerToggle}>Services</RouterLink>
      </DrawerItem>
      <DrawerItem>
        <RouterLink to="/about" onClick={handleDrawerToggle}>About</RouterLink>
      </DrawerItem>
      <DrawerItem>
        <RouterLink to="/contact" onClick={handleDrawerToggle}>Contact</RouterLink>
      </DrawerItem>
      <DrawerItem>
        <RouterLink to="/login" onClick={handleDrawerToggle}>Login</RouterLink>
      </DrawerItem>
    </DrawerList>
  );

  return (
    <>
      <StyledAppBar className={scrolled ? 'scrolled' : ''}>
        <Toolbar sx={{ py: 1.5 }}>
          <NavContainer>
            <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <LogoContainer>
                  <LogoImg src={logoImage} alt="TechVerse Logo" />
                  <Logo>TechVerse</Logo>
                </LogoContainer>
              </RouterLink>
            
            <NavLinks>
              <NavLink component={RouterLink} to="/store">Store</NavLink>
              <NavLink component={RouterLink} to="/services">Services</NavLink>
              <NavLink component={RouterLink} to="/about">About</NavLink>
              <NavLink component={RouterLink} to="/contact">Contact</NavLink>
              <LoginButton 
                component={RouterLink} 
                to="/login"
              >
                Login
              </LoginButton>
            </NavLinks>
            
            <MobileMenuButton
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </MobileMenuButton>
          </NavContainer>
        </Toolbar>
      </StyledAppBar>
      
      <Box component="nav">
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box',
              backgroundColor: 'var(--background-color)',
              borderLeft: '1px solid var(--border-color)',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Toolbar placeholder to prevent content from hiding behind the fixed AppBar */}
      <Toolbar sx={{ mb: 2 }} />
    </>
  );
};