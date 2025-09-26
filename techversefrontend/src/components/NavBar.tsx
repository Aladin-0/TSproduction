// src/components/NavBar.tsx - Updated with Cart Integration
import { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Badge
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HistoryIcon from '@mui/icons-material/History';
import { useUserStore } from '../stores/userStore'; 
import { useCartStore } from '../stores/cartStore';
import { ShoppingCart } from './ShoppingCart';
import logoImage from '../components/Tlogo.png';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'transparent',
  backdropFilter: 'none',
  borderBottom: 'none',
  boxShadow: 'none',
  position: 'fixed',
  top: 0, 
  zIndex: 1000,
  transition: 'all 0.3s ease-in-out',
  '&.scrolled': {
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border-color,rgb(154, 124, 124))',
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
  gap: '30px',
  alignItems: 'center',
  '@media (max-width: 900px)': {
    display: 'none',
  },
}));

const NavLink = styled(Button)(({ theme }) => ({
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

const ProfileButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'transparent',
  color: 'var(--text-color, #FAFAFA)',
  padding: '8px 16px',
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    transform: 'translateY(-1px)',
  },
}));

const CartButton = styled(IconButton)(({ theme }) => ({
  color: 'var(--text-color, #FAFAFA)',
  backgroundColor: 'transparent',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '12px',
  padding: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    transform: 'translateY(-1px)',
  },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.8), rgba(59, 130, 246, 0.9))',
  fontSize: '14px',
  fontWeight: 600,
}));

const ProfileMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '16px',
    marginTop: '8px',
    minWidth: '220px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
  },
  '& .MuiMenuItem-root': {
    color: 'rgba(255, 255, 255, 0.9)',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '8px',
    margin: '4px 8px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    '&.logout-item': {
      color: '#ef4444',
      '&:hover': {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
      },
    },
  },
}));

const UserInfo = styled(Box)(({ theme }) => ({
  padding: '16px 20px 12px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  margin: '0 8px 8px',
}));

const UserName = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.95)',
  fontSize: '16px',
  fontWeight: 600,
  marginBottom: '4px',
}));

const UserEmail = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '12px',
  fontWeight: 400,
}));

const RoleBadge = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(96, 165, 250, 0.15)',
  color: '#60a5fa',
  border: '1px solid rgba(96, 165, 250, 0.3)',
  fontSize: '10px',
  fontWeight: 600,
  height: '20px',
  marginTop: '8px',
}));

const MobileMenuButton = styled(IconButton)(({ theme }) => ({
  color: 'var(--text-color, #FAFAFA)',
  display: 'none',
  '@media (max-width: 900px)': {
    display: 'block',
  },
}));

const DrawerList = styled(List)(({ theme }) => ({
  width: 280,
  backgroundColor: 'var(--background-color)',
  height: '100%',
  padding: '20px',
}));

const DrawerItem = styled(ListItem)(({ theme }) => ({
  padding: '15px 0',
  borderBottom: '1px solid var(--border-color)',
  '& a, & button': {
    color: 'var(--text-color)',
    textDecoration: 'none',
    fontSize: '1.1rem',
    fontWeight: 500,
    display: 'block',
    width: '100%',
    textAlign: 'left',
    backgroundColor: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
  },
}));

const MobileUserInfo = styled(Box)(({ theme }) => ({
  padding: '20px 0',
  borderBottom: '1px solid var(--border-color)',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
}));

export const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  
  // Cart store hooks
  const { openCart, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();
  
  const navigate = useNavigate();

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

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleProfileMenuClose();
  };

  const handleOrdersClick = () => {
    navigate('/my-orders');
    handleProfileMenuClose();
  };

  const handleCartClick = () => {
    openCart();
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const drawer = (
    <DrawerList>
      <DrawerItem>
        <LogoContainer>
          <LogoImg src={logoImage} alt="TechVerse Logo" />
          <Logo>TechVerse</Logo>
        </LogoContainer>
      </DrawerItem>

      {/* Mobile User Info */}
      {isAuthenticated && user && (
        <MobileUserInfo>
          <UserAvatar>
            {getUserInitials(user.name || 'User')}
          </UserAvatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ 
              color: 'var(--text-color)', 
              fontSize: '16px', 
              fontWeight: 600,
              marginBottom: '4px'
            }}>
              {user.name}
            </Typography>
            <Typography sx={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              fontSize: '12px' 
            }}>
              {user.email}
            </Typography>
            <RoleBadge label={user.role} size="small" />
          </Box>
        </MobileUserInfo>
      )}

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

      {/* Mobile Cart */}
      <DrawerItem>
        <button onClick={() => { handleCartClick(); handleDrawerToggle(); }}>
          Cart ({totalItems})
        </button>
      </DrawerItem>

      {isAuthenticated ? (
        <>
          <DrawerItem>
            <RouterLink to="/profile" onClick={handleDrawerToggle}>My Profile</RouterLink>
          </DrawerItem>
          <DrawerItem>
            <RouterLink to="/my-orders" onClick={handleDrawerToggle}>My Orders</RouterLink>
          </DrawerItem>
          <DrawerItem>
            <button onClick={() => { handleLogout(); handleDrawerToggle(); }}>
              Logout
            </button>
          </DrawerItem>
        </>
      ) : (
        <DrawerItem>
          <RouterLink to="/login" onClick={handleDrawerToggle}>Login</RouterLink>
        </DrawerItem>
      )}
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

              {/* Cart Button */}
              <CartButton onClick={handleCartClick}>
                <Badge
                  badgeContent={totalItems}
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#60a5fa',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 600,
                    },
                  }}
                >
                  <ShoppingCartIcon />
                </Badge>
              </CartButton>

              {isAuthenticated ? (
                <ProfileButton onClick={handleProfileMenuOpen}>
                  <UserAvatar>
                    {getUserInitials(user?.name || 'User')}
                  </UserAvatar>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography sx={{ 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      lineHeight: 1,
                      color: 'inherit'
                    }}>
                      {user?.name || 'User'}
                    </Typography>
                    <Typography sx={{ 
                      fontSize: '11px', 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      lineHeight: 1 
                    }}>
                      {user?.role}
                    </Typography>
                  </Box>
                </ProfileButton>
              ) : (
                <LoginButton component={RouterLink} to="/login">
                  Login
                </LoginButton>
              )}
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

      {/* Profile Menu */}
      <ProfileMenu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <UserInfo>
          <UserName>{user?.name || 'User'}</UserName>
          <UserEmail>{user?.email}</UserEmail>
          <RoleBadge label={user?.role || 'CUSTOMER'} size="small" />
        </UserInfo>
        
        <MenuItem onClick={handleProfileClick}>
          <PersonIcon sx={{ mr: 2, fontSize: '18px' }} />
          My Profile
        </MenuItem>
        
        <MenuItem onClick={handleOrdersClick}>
          <HistoryIcon sx={{ mr: 2, fontSize: '18px' }} />
          Order History
        </MenuItem>
        
        <MenuItem onClick={handleCartClick}>
          <ShoppingCartIcon sx={{ mr: 2, fontSize: '18px' }} />
          My Cart ({totalItems})
        </MenuItem>
        
        <MenuItem>
          <SettingsIcon sx={{ mr: 2, fontSize: '18px' }} />
          Settings
        </MenuItem>
        
        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '8px' }} />
        
        <MenuItem onClick={handleLogout} className="logout-item">
          <LogoutIcon sx={{ mr: 2, fontSize: '18px' }} />
          Logout
        </MenuItem>
      </ProfileMenu>
      
      <Box component="nav">
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
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
      
      {/* Shopping Cart Component */}
      <ShoppingCart />
      
      <Toolbar sx={{ mb: 2 }} />
    </>
  );
};