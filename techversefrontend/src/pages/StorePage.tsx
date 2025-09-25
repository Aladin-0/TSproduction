// src/pages/StorePage.tsx
import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  Typography, 
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Skeleton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import { useSpring, animated, useTrail } from '@react-spring/web';
import { useProductStore } from '../stores/productStore';

// Main page wrapper with exact black background
const PageWrapper = styled(Box)({
  backgroundColor: '#000000',
  color: 'white',
  fontFamily: "'Segoe UI', 'Roboto', sans-serif",
  minHeight: '100vh',
  width: '100%',
  overflow: 'hidden',
});

// Premium header with exact spacing
const Header = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '18px 42px',
  background: 'rgba(0, 0, 0, 0.95)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  position: 'relative',
  zIndex: 100,
});

const Logo = styled(Typography)({
  fontSize: '16px',
  fontWeight: 700,
  letterSpacing: '3.2px',
  color: '#ffffff',
  fontFamily: "'Arial Black', sans-serif",
});

const BlankButton = styled(Button)({
  backgroundColor: 'transparent',
  border: '1.5px solid rgba(255, 255, 255, 0.25)',
  color: 'rgba(255, 255, 255, 0.85)',
  borderRadius: '22px',
  padding: '8px 22px',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.320, 1)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 25px rgba(255, 255, 255, 0.1)',
  },
});

// Premium hero section with sophisticated gradients
const HeroSection = styled(Box)({
  background: `
    radial-gradient(ellipse 1200px 800px at 50% 20%, rgba(64, 64, 64, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse 800px 600px at 80% 60%, rgba(32, 32, 32, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, #000000 0%, #111111 50%, #000000 100%)
  `,
  padding: '0',
  position: 'relative',
  minHeight: '580px',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle 800px at 75% 30%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
      radial-gradient(circle 600px at 25% 70%, rgba(255, 255, 255, 0.02) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },
});

const HeroContent = styled(Box)({
  position: 'relative',
  zIndex: 10,
  padding: '80px 0 80px 60px',
  maxWidth: '50%',
});

const HeroTitle = styled(Typography)({
  fontSize: '64px',
  fontWeight: 300,
  lineHeight: '0.95',
  marginBottom: '8px',
  color: '#ffffff',
  fontFamily: "'Helvetica Neue', sans-serif",
  letterSpacing: '-1.5px',
});

const HeroSubtitle = styled(Typography)({
  fontSize: '64px',
  fontWeight: 300,
  lineHeight: '0.95',
  marginBottom: '12px',
  color: '#ffffff',
  fontFamily: "'Helvetica Neue', sans-serif",
  letterSpacing: '-1.5px',
});

const HeroDescription = styled(Typography)({
  fontSize: '20px',
  color: 'rgba(255, 255, 255, 0.65)',
  marginBottom: '36px',
  fontWeight: 300,
  letterSpacing: '0.3px',
});

const LearnMoreButton = styled(Button)({
  backgroundColor: 'transparent',
  border: '1.5px solid rgba(255, 255, 255, 0.25)',
  color: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '25px',
  padding: '12px 32px',
  fontSize: '13px',
  fontWeight: 500,
  letterSpacing: '0.8px',
  textTransform: 'none',
  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.320, 1)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 30px rgba(255, 255, 255, 0.15)',
  },
});

const HeadphonesContainer = styled(Box)({
  position: 'absolute',
  right: '8%',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '420px',
  height: '420px',
  background: `
    radial-gradient(circle at center, rgba(80, 80, 80, 0.4) 0%, rgba(40, 40, 40, 0.2) 40%, transparent 70%)
  `,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: `
      radial-gradient(circle at 30% 30%, rgba(120, 120, 120, 0.2) 0%, transparent 70%)
    `,
    borderRadius: '50%',
    filter: 'blur(20px)',
  },
});

// Premium search and filter section
const SearchFilterSection = styled(Box)({
  padding: '32px 60px',
  background: `
    linear-gradient(135deg, rgba(20, 20, 20, 0.8) 0%, rgba(10, 10, 10, 0.9) 100%)
  `,
  backdropFilter: 'blur(20px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
});

const SearchContainer = styled(Box)({
  display: 'flex',
  gap: '20px',
  alignItems: 'center',
  maxWidth: '1000px',
});

const PremiumTextField = styled(TextField)({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    color: 'white',
    height: '48px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      transform: 'translateY(-1px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
      boxShadow: '0 0 0 4px rgba(255, 255, 255, 0.1)',
    },
  },
  '& .MuiInputBase-input': {
    color: 'white',
    fontSize: '14px',
    fontWeight: 400,
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.4)',
    },
  },
});

const PremiumSelect = styled(FormControl)({
  minWidth: '180px',
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    color: 'white',
    height: '48px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
  '& .MuiSelect-select': {
    color: 'white',
    fontSize: '14px',
    fontWeight: 400,
  },
  '& .MuiSvgIcon-root': {
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

// Ultra-premium products section
const ProductsSection = styled(Box)({
  padding: '60px',
  background: `
    linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #111111 50%, #0a0a0a 75%, #000000 100%)
  `,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(ellipse 1000px 300px at 50% 0%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
      radial-gradient(ellipse 800px 200px at 50% 100%, rgba(255, 255, 255, 0.01) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },
});

const BrowseTitle = styled(Typography)({
  fontSize: '28px',
  fontWeight: 600,
  color: '#ffffff',
  marginBottom: '40px',
  letterSpacing: '0.5px',
  position: 'relative',
  zIndex: 2,
});

// Premium category tabs
const CategoryTabs = styled(Box)({
  display: 'flex',
  gap: '1px',
  marginBottom: '50px',
  borderRadius: '12px',
  overflow: 'hidden',
  background: 'rgba(255, 255, 255, 0.05)',
  padding: '4px',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  position: 'relative',
  zIndex: 2,
});

const CategoryTab = styled(Button)<{ active?: boolean }>(({ active }) => ({
  backgroundColor: active ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
  color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
  border: 'none',
  borderRadius: '8px',
  padding: '12px 24px',
  fontSize: '13px',
  fontWeight: active ? 600 : 400,
  textTransform: 'none',
  minWidth: 'auto',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
  position: 'relative',
  '&:hover': {
    backgroundColor: active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
    transform: 'translateY(-1px)',
  },
  '&::before': active ? {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #ffffff, transparent)',
  } : {},
}));

// Ultra-premium product grid
const ProductGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '32px',
  marginBottom: '60px',
  position: 'relative',
  zIndex: 2,
  '@media (max-width: 1400px)': {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  '@media (max-width: 1000px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@media (max-width: 600px)': {
    gridTemplateColumns: '1fr',
    gap: '24px',
  },
});

const AnimatedProductCard = animated(Box);

const ProductCard = styled(AnimatedProductCard)({
  background: `
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.05) 0%, 
      rgba(255, 255, 255, 0.02) 50%, 
      rgba(255, 255, 255, 0.05) 100%
    )
  `,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.320, 1)',
  cursor: 'pointer',
  position: 'relative',
  backdropFilter: 'blur(20px)',
  willChange: 'transform, box-shadow',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: `
      0 25px 50px rgba(0, 0, 0, 0.5),
      0 0 30px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      linear-gradient(135deg, 
        rgba(255, 255, 255, 0.1) 0%, 
        transparent 50%, 
        rgba(255, 255, 255, 0.05) 100%
      )
    `,
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  },
  '&:hover::before': {
    opacity: 1,
  },
});

const ProductImageArea = styled(Box)({
  width: '100%',
  height: '220px',
  background: `
    linear-gradient(135deg, 
      rgba(40, 40, 40, 0.8) 0%, 
      rgba(20, 20, 20, 0.9) 50%, 
      rgba(30, 30, 30, 0.8) 100%
    )
  `,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  '& img': {
    width: '300px',
    height: '300px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))',
    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.320, 1)',
  },
  '&:hover img': {
    transform: 'scale(1.1) rotate(2deg)',
    filter: 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.4))',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    background: `
      linear-gradient(to top, 
        rgba(0, 0, 0, 0.6) 0%, 
        transparent 100%
      )
    `,
  },
});

const ProductInfo = styled(Box)({
  padding: '24px',
  position: 'relative',
});

const ProductName = styled(Typography)({
  fontSize: '18px',
  fontWeight: 600,
  color: '#ffffff',
  marginBottom: '8px',
  letterSpacing: '0.3px',
  lineHeight: 1.3,
});

const ProductDescription = styled(Typography)({
  fontSize: '13px',
  color: 'rgba(255, 255, 255, 0.6)',
  marginBottom: '20px',
  lineHeight: 1.5,
  fontWeight: 300,
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

const AddToCartButton = styled(Button)({
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  color: '#ffffff',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '12px',
  padding: '12px 24px',
  fontSize: '13px',
  fontWeight: 500,
  textTransform: 'none',
  width: '100%',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(255, 255, 255, 0.1)',
  },
});

const LoadMoreButton = styled(Button)({
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  color: 'rgba(255, 255, 255, 0.9)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '16px',
  padding: '16px 40px',
  fontSize: '14px',
  fontWeight: 500,
  textTransform: 'none',
  display: 'block',
  margin: '0 auto',
  backdropFilter: 'blur(20px)',
  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.320, 1)',
  position: 'relative',
  zIndex: 2,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-4px)',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
  },
});

// Premium footer
const Footer = styled(Box)({
  background: `
    linear-gradient(135deg, #000000 0%, #0a0a0a 100%)
  `,
  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  padding: '40px 60px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backdropFilter: 'blur(20px)',
  '@media (max-width: 768px)': {
    flexDirection: 'column',
    gap: '24px',
    padding: '32px 40px',
  },
});

const FooterLogo = styled(Typography)({
  fontSize: '16px',
  fontWeight: 700,
  letterSpacing: '3.2px',
  color: '#ffffff',
  fontFamily: "'Arial Black', sans-serif",
});

const FooterLinks = styled(Box)({
  display: 'flex',
  gap: '40px',
  '& a': {
    color: 'rgba(255, 255, 255, 0.6)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 400,
    transition: 'all 0.3s ease',
    '&:hover': {
      color: '#ffffff',
      transform: 'translateY(-1px)',
    },
  },
});

const SocialIcons = styled(Box)({
  display: 'flex',
  gap: '20px',
  '& .MuiSvgIcon-root': {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '22px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
    '&:hover': {
      color: '#ffffff',
      transform: 'translateY(-2px) scale(1.1)',
    },
  },
});

// Loading skeleton for premium look
const ProductSkeleton = () => (
  <Box sx={{ 
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    overflow: 'hidden',
    backdropFilter: 'blur(20px)'
  }}>
    <Skeleton 
      variant="rectangular" 
      height={220} 
      sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        '&::after': {
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
        }
      }}
    />
    <Box sx={{ p: 3 }}>
      <Skeleton 
        variant="text" 
        height={24} 
        sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
          marginBottom: '8px',
          borderRadius: '4px'
        }} 
      />
      <Skeleton 
        variant="text" 
        height={60} 
        sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
          marginBottom: '20px',
          borderRadius: '4px'
        }} 
      />
      <Skeleton 
        variant="rectangular" 
        height={48} 
        sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: '12px'
        }} 
      />
    </Box>
  </Box>
);

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  image: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

export const StorePage: React.FC = () => {
  // FIXED: Use correct Zustand hook pattern
  const products = useProductStore((state) => state.products);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [activeTab, setActiveTab] = useState('All Products');
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [error, setError] = useState<string | null>(null);

  // Hero animation
  const heroAnimation = useSpring({
    from: { opacity: 0, transform: 'translateX(-60px)' },
    to: { opacity: 1, transform: 'translateX(0px)' },
    config: { tension: 200, friction: 25 },
    delay: 300,
  });

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Products' || product.category.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from backend
  const categories = ['All Products', ...Array.from(new Set(products.map(p => p.category.name)))];

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Starting to fetch products...');
        await fetchProducts();
        console.log('Products fetched successfully');
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please check your connection.');
      } finally {
        setTimeout(() => {
          setLoading(false);
          console.log('Loading state set to false');
        }, 500);
      }
    };
    loadProducts();
  }, [fetchProducts]);

  // Debug logging
  useEffect(() => {
    console.log('Products state changed:', products);
    console.log('Products length:', products.length);
  }, [products]);

  const handleBuyNow = (productSlug: string) => {
    // Connect to your Django buy-now endpoint
    window.location.href = `/buy-now/${productSlug}/`;
  };

  const loadMoreProducts = () => {
    setVisibleProducts(prev => prev + 8);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setActiveTab(category);
    setVisibleProducts(8); // Reset visible products when changing category
  };

  return (
    <PageWrapper>
      {/* Premium Header */}
      <Header>
        <Logo>TECHVERSE</Logo>
        <BlankButton>BLANK</BlankButton>
      </Header>

      {/* Premium Hero Section */}
      <HeroSection>
        <animated.div style={heroAnimation}>
          <HeroContent>
            <HeroTitle>Experience Sound.</HeroTitle>
            <HeroSubtitle>Refurblined.</HeroSubtitle>
            <HeroDescription>UltraMesh Headphones</HeroDescription>
            <LearnMoreButton>Learn More</LearnMoreButton>
          </HeroContent>
        </animated.div>
        
        <HeadphonesContainer>
          <Typography sx={{ 
            color: 'rgba(255, 255, 255, 0.3)', 
            fontSize: '16px',
            fontWeight: 300,
            textAlign: 'center'
          }}>
            Premium Headphones
            <br />
            Visualization
          </Typography>
        </HeadphonesContainer>
      </HeroSection>

      {/* Premium Search and Filter */}
      <SearchFilterSection>
        <SearchContainer>
          <PremiumTextField
            placeholder="Search premium products..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '20px' }} />
                </InputAdornment>
              ),
            }}
          />
          <PremiumSelect>
            <Select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              displayEmpty
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: 'rgba(20, 20, 20, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    '& .MuiMenuItem-root': {
                      color: 'white',
                      fontSize: '14px',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      },
                    },
                  },
                },
              }}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </PremiumSelect>
        </SearchContainer>
      </SearchFilterSection>

      {/* Ultra-Premium Products Section */}
      <ProductsSection>
        <BrowseTitle>Browse Categories</BrowseTitle>

        {/* Dynamic Category Tabs */}
        <CategoryTabs>
          {categories.slice(0, 6).map((category) => (
            <CategoryTab 
              key={category}
              active={activeTab === category}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </CategoryTab>
          ))}
        </CategoryTabs>

        {/* Ultra-Premium Product Grid */}
        <ProductGrid>
          {loading ? (
            // Premium loading skeletons
            Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))
          ) : error ? (
            // Error state
            <Box 
              sx={{ 
                gridColumn: '1 / -1',
                textAlign: 'center', 
                py: 8,
                position: 'relative',
                zIndex: 2
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 2, 
                  color: 'rgba(255, 100, 100, 0.8)',
                  fontWeight: 300,
                  fontSize: '24px'
                }}
              >
                {error}
              </Typography>
              <Typography 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '14px',
                  fontWeight: 300,
                  mb: 3
                }}
              >
                Make sure your Django server is running on http://127.0.0.1:8000
              </Typography>
              <Button
                onClick={() => window.location.reload()}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  }
                }}
              >
                Retry Loading
              </Button>
            </Box>
          ) : products.length === 0 ? (
            // No products from API
            <Box 
              sx={{ 
                gridColumn: '1 / -1',
                textAlign: 'center', 
                py: 8,
                position: 'relative',
                zIndex: 2
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 2, 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 300,
                  fontSize: '24px'
                }}
              >
                No products available
              </Typography>
              <Typography 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '14px',
                  fontWeight: 300
                }}
              >
                Add some products through the Django admin panel
              </Typography>
            </Box>
          ) : filteredProducts.length === 0 ? (
            // Products exist but filtered out
            <Box 
              sx={{ 
                gridColumn: '1 / -1',
                textAlign: 'center', 
                py: 8,
                position: 'relative',
                zIndex: 2
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 2, 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 300,
                  fontSize: '24px'
                }}
              >
                No products match your filters
              </Typography>
              <Typography 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '14px',
                  fontWeight: 300
                }}
              >
                Try adjusting your search criteria or category selection
              </Typography>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All Products');
                  setActiveTab('All Products');
                }}
                sx={{
                  mt: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  }
                }}
              >
                Clear Filters
              </Button>
            </Box>
          ) : (
            // Render products
            filteredProducts.slice(0, visibleProducts).map((product, index) => {
              return (
                <ProductCard 
                  key={`product-${product.id}-${index}`}
                  style={{
                    opacity: 1,
                    transform: 'translateY(0px) scale(1)'
                  }}
                >
                  <ProductImageArea>
                    <img 
                      src={
                        product.image 
                          ? (product.image.startsWith('http') 
                              ? product.image 
                              : `http://127.0.0.1:8000${product.image}`)
                          : `https://via.placeholder.com/140x140/333333/ffffff?text=${encodeURIComponent(product.name || 'Product')}`
                      }
                      alt={product.name || 'Product'}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // Try different image URL formats
                        if (!target.src.includes('placeholder')) {
                          if (product.image && !product.image.startsWith('/media/')) {
                            target.src = `http://127.0.0.1:8000/media/${product.image}`;
                          } else if (product.image && product.image.startsWith('/media/')) {
                            target.src = `http://127.0.0.1:8000${product.image}`;
                          } else {
                            target.src = `https://via.placeholder.com/140x140/333333/ffffff?text=${encodeURIComponent(product.name || 'Product')}`;
                          }
                        }
                      }}
                      onLoad={(e) => {
                        // Add subtle animation when image loads
                        const target = e.target as HTMLImageElement;
                        target.style.opacity = '1';
                        target.style.transform = 'scale(1)';
                      }}
                      style={{
                        width: '350px',
                        height: '350px',
                        objectFit: 'contain',
                        opacity: '0',
                        transform: 'scale(0.9)',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </ProductImageArea>
                  <ProductInfo>
                    <ProductName>
                      {product.name ? String(product.name).trim() : 'Premium Product'}
                    </ProductName>
                    <ProductDescription>
                      {product.description && String(product.description).trim() 
                        ? String(product.description).trim()
                        : 'Premium technology product with advanced features and superior build quality. Experience excellence in every detail.'
                      }
                    </ProductDescription>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 2
                    }}>
                      <Typography sx={{
                        fontSize: '20px',
                        fontWeight: 600,
                        color: '#60a5fa',
                        background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        ₹{product.price ? String(product.price) : '0.00'}
                      </Typography>
                      <Typography sx={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.4)',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        padding: '4px 8px',
                        borderRadius: '6px'
                      }}>
                        {product.category?.name ? String(product.category.name).trim() : 'General'}
                      </Typography>
                    </Box>
                    <AddToCartButton 
                      onClick={() => handleBuyNow(product.slug || product.name?.toLowerCase().replace(/\s+/g, '-') || 'product')}
                    >
                      Add to Cart
                    </AddToCartButton>
                  </ProductInfo>
                </ProductCard>
              );
            })
          )}
        </ProductGrid>

        {/* Load More Button */}
        {!loading && !error && visibleProducts < filteredProducts.length && (
          <LoadMoreButton onClick={loadMoreProducts}>
            Load More Products ({filteredProducts.length - visibleProducts} remaining)
          </LoadMoreButton>
        )}
      </ProductsSection>

      {/* Premium Footer */}
      <Footer>
        <FooterLogo>TECHVERSE</FooterLogo>
        <FooterLinks>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </FooterLinks>
        <SocialIcons>
          <FacebookIcon />
          <TwitterIcon />
          <InstagramIcon />
        </SocialIcons>
      </Footer>
    </PageWrapper>
  );
};