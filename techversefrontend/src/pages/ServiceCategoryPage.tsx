// src/pages/ServiceCategoryPage.tsx - Updated to show only service names
import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Skeleton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BuildIcon from '@mui/icons-material/Build';
import ComputerIcon from '@mui/icons-material/Computer';
import PrintIcon from '@mui/icons-material/Print';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import TvIcon from '@mui/icons-material/Tv';
import RouterIcon from '@mui/icons-material/Router';
import { useSpring, animated } from '@react-spring/web';
import { useServiceStore } from '../stores/serviceStore';

// Main page wrapper
const PageWrapper = styled(Box)({
  backgroundColor: '#000000',
  color: 'white',
  fontFamily: "'Segoe UI', 'Roboto', sans-serif",
  minHeight: '100vh',
  width: '100%',
  paddingTop: '80px',
});

// Premium hero section for services
const ServiceHero = styled(Box)({
  background: `
    radial-gradient(ellipse 1200px 800px at 50% 20%, rgba(64, 64, 64, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse 800px 600px at 20% 80%, rgba(32, 32, 32, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, #000000 0%, #111111 50%, #000000 100%)
  `,
  padding: '80px 60px 60px',
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
});

const ServiceTitle = styled(Typography)({
  fontSize: '56px',
  fontWeight: 300,
  letterSpacing: '-1px',
  marginBottom: '16px',
  color: '#ffffff',
  background: 'linear-gradient(135deg, #ffffff, #e0e0e0)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontFamily: "'Helvetica Neue', sans-serif",
  '@media (max-width:900px)': {
    fontSize: '42px',
  },
});

const ServiceSubtitle = styled(Typography)({
  fontSize: '20px',
  color: 'rgba(255, 255, 255, 0.65)',
  fontWeight: 300,
  marginBottom: '40px',
  maxWidth: '700px',
  margin: '0 auto 40px',
  lineHeight: 1.6,
  '@media (max-width:900px)': {
    fontSize: '18px',
  },
});

// Premium search section
const SearchSection = styled(Box)({
  padding: '40px 60px',
  background: `
    linear-gradient(135deg, rgba(20, 20, 20, 0.8) 0%, rgba(10, 10, 10, 0.9) 100%)
  `,
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
});

const SearchContainer = styled(Box)({
  maxWidth: '800px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'center',
});

const PremiumSearchField = styled(TextField)({
  width: '100%',
  maxWidth: '500px',
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '16px',
    color: 'white',
    height: '56px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
      boxShadow: '0 0 0 4px rgba(255, 255, 255, 0.1)',
    },
  },
  '& .MuiInputBase-input': {
    color: 'white',
    fontSize: '16px',
    fontWeight: 400,
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.4)',
    },
  },
});

// Categories section
const CategoriesSection = styled(Box)({
  padding: '80px 60px 100px',
  background: `
    linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #111111 50%, #0a0a0a 75%, #000000 100%)
  `,
  position: 'relative',
});

const CategoriesContainer = styled(Box)({
  maxWidth: '1200px',
  margin: '0 auto',
  position: 'relative',
  zIndex: 2,
});

const SectionHeader = styled(Box)({
  textAlign: 'center',
  marginBottom: '60px',
});

const SectionTitle = styled(Typography)({
  fontSize: '36px',
  fontWeight: 600,
  color: 'rgba(255, 255, 255, 0.95)',
  marginBottom: '16px',
  background: 'linear-gradient(135deg, #ffffff, #e0e0e0)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '0.5px',
  '@media (max-width:900px)': {
    fontSize: '32px',
  },
});

const SectionDescription = styled(Typography)({
  fontSize: '16px',
  color: 'rgba(255, 255, 255, 0.6)',
  maxWidth: '600px',
  margin: '0 auto',
  lineHeight: 1.6,
});

// Premium category grid
const CategoryGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '32px',
  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr',
    gap: '24px',
  },
});

const AnimatedCategoryCard = animated(Card);

const CategoryCard = styled(AnimatedCategoryCard)({
  background: `
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.05) 0%, 
      rgba(255, 255, 255, 0.02) 50%, 
      rgba(255, 255, 255, 0.05) 100%
    )
  `,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '24px',
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
});

const CategoryHeader = styled(Box)({
  padding: '40px 32px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '20px',
});

const CategoryIcon = styled(Box)({
  width: '80px',
  height: '80px',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
  borderRadius: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease',
  '.category-card:hover &': {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'scale(1.1)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '40px',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

const CategoryName = styled(Typography)({
  fontSize: '24px',
  fontWeight: 600,
  color: 'rgba(255, 255, 255, 0.95)',
  letterSpacing: '0.3px',
  textAlign: 'center',
});

const CategoryCount = styled(Typography)({
  fontSize: '14px',
  color: 'rgba(255, 255, 255, 0.5)',
  fontWeight: 400,
  textAlign: 'center',
});

const RequestServiceButton = styled(Button)({
  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '16px',
  padding: '16px',
  fontSize: '14px',
  fontWeight: 600,
  textTransform: 'none',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
  marginTop: '20px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(255, 255, 255, 0.1)',
  },
});

// Loading skeleton for categories
const CategorySkeleton = () => (
  <Card sx={{ 
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    overflow: 'hidden',
    backdropFilter: 'blur(20px)'
  }}>
    <Box sx={{ p: 5, textAlign: 'center' }}>
      <Skeleton 
        variant="rectangular" 
        width={80} 
        height={80} 
        sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          margin: '0 auto 20px'
        }}
      />
      <Skeleton 
        variant="text" 
        width={150} 
        height={32} 
        sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          margin: '0 auto 10px'
        }}
      />
      <Skeleton 
        variant="text" 
        width={100} 
        height={20} 
        sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          margin: '0 auto 20px'
        }}
      />
      <Skeleton 
        variant="rectangular" 
        height={56} 
        sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px'
        }}
      />
    </Box>
  </Card>
);

// Icon mapping for different service categories
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('computer') || name.includes('laptop') || name.includes('pc')) {
    return <ComputerIcon />;
  } else if (name.includes('printer')) {
    return <PrintIcon />;
  } else if (name.includes('camera') || name.includes('cctv')) {
    return <CameraAltIcon />;
  } else if (name.includes('headphone') || name.includes('audio')) {
    return <HeadphonesIcon />;
  } else if (name.includes('phone') || name.includes('mobile')) {
    return <PhoneAndroidIcon />;
  } else if (name.includes('tv') || name.includes('monitor')) {
    return <TvIcon />;
  } else if (name.includes('network') || name.includes('router')) {
    return <RouterIcon />;
  } else {
    return <BuildIcon />;
  }
};

interface ServiceIssue {
  id: number;
  description: string;
  price: string;
}

interface ServiceCategory {
  id: number;
  name: string;
  issues: ServiceIssue[];
}

export const ServiceCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const categories = useServiceStore((state) => state.categories);
  const fetchCategories = useServiceStore((state) => state.fetchCategories);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Hero animation
  const heroAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(40px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 60 },
    delay: 200,
  });

  // Filter categories based on search
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchCategories();
      } catch (err) {
        console.error('Error fetching service categories:', err);
        setError('Failed to load service categories. Please check your connection.');
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    loadCategories();
  }, [fetchCategories]);

  const handleCategorySelect = (categoryId: number) => {
    navigate(`/services/request/${categoryId}`);
  };

  return (
    <PageWrapper>
      {/* Premium Service Hero */}
      <ServiceHero>
        <animated.div style={heroAnimation}>
          <ServiceTitle>Repair Services</ServiceTitle>
          <ServiceSubtitle>
            Professional repair services for all your technology needs. Expert technicians, 
            quality parts, and reliable solutions to keep your devices running perfectly.
          </ServiceSubtitle>
        </animated.div>
      </ServiceHero>

      {/* Premium Search Section */}
      <SearchSection>
        <SearchContainer>
          <PremiumSearchField
            placeholder="Search services..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '24px' }} />
                </InputAdornment>
              ),
            }}
          />
        </SearchContainer>
      </SearchSection>

      {/* Categories Section */}
      <CategoriesSection>
        <CategoriesContainer>
          <SectionHeader>
            <SectionTitle>Service Categories</SectionTitle>
            <SectionDescription>
              Choose from our comprehensive range of repair services. Select a category 
              to see available repair options.
            </SectionDescription>
          </SectionHeader>

          <CategoryGrid>
            {loading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <CategorySkeleton key={index} />
              ))
            ) : error ? (
              // Error state
              <Box sx={{ 
                gridColumn: '1 / -1',
                textAlign: 'center', 
                py: 8 
              }}>
                <Typography variant="h5" sx={{ 
                  mb: 2, 
                  color: 'rgba(255, 100, 100, 0.8)',
                  fontWeight: 300
                }}>
                  {error}
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
            ) : filteredCategories.length === 0 ? (
              // No categories found
              <Box sx={{ 
                gridColumn: '1 / -1',
                textAlign: 'center', 
                py: 8 
              }}>
                <Typography variant="h5" sx={{ 
                  mb: 2, 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 300
                }}>
                  {categories.length === 0 ? 'No service categories available' : 'No services found'}
                </Typography>
                <Typography sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '14px'
                }}>
                  {categories.length === 0 
                    ? 'Please add service categories through the admin panel'
                    : 'Try adjusting your search criteria'
                  }
                </Typography>
              </Box>
            ) : (
              // Display categories
              filteredCategories.map((category, index) => (
                <CategoryCard 
                  key={category.id}
                  className="category-card"
                  onClick={() => handleCategorySelect(category.id)}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <CategoryHeader>
                    <CategoryIcon>
                      {getCategoryIcon(category.name)}
                    </CategoryIcon>
                    <Box>
                      <CategoryName>{category.name}</CategoryName>
                      <CategoryCount>
                        {category.issues.length} repair option{category.issues.length !== 1 ? 's' : ''} available
                      </CategoryCount>
                    </Box>
                    <RequestServiceButton>
                      View Repair Options
                    </RequestServiceButton>
                  </CategoryHeader>
                </CategoryCard>
              ))
            )}
          </CategoryGrid>
        </CategoriesContainer>
      </CategoriesSection>
    </PageWrapper>
  );
};