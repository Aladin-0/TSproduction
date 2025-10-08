// src/pages/ProductDetailPage.tsx - Professionally Redesigned Version
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  Typography, 
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { useCartStore } from '../stores/cartStore';
import { useSnackbar } from 'notistack';
import apiClient from '../api';

// Main page wrapper - REMOVED paddingTop
const PageWrapper = styled(Box)({
  backgroundColor: '#000000',
  color: 'white',
  minHeight: '100vh',
  width: '100%',
});

// Content container
const ContentContainer = styled(Box)(({ theme }) => ({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '40px 20px',
  [theme.breakpoints.down('sm')]: {
    padding: '20px',
  },
}));

// Product container
const ProductContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '60px',
  marginBottom: '40px',
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: '30px',
  },
}));

// Image section with gallery and glow effect
const ImageSection = styled(Box)({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const MainImageContainer = styled(Box)({
  width: '100%',
  position: 'relative',
  marginBottom: '16px',
});

const ImageGlow = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  height: '80%',
  background: 'radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, rgba(96, 165, 250, 0) 60%)',
  filter: 'blur(40px)',
  zIndex: 0,
});

const ProductImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: 'auto',
  aspectRatio: '1 / 1',
  objectFit: 'contain',
  borderRadius: '16px',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  position: 'relative',
  zIndex: 1,
  '&:hover': {
    transform: 'scale(1.02)',
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: '12px',
  },
}));

const ThumbnailContainer = styled(Box)({
  display: 'flex',
  gap: '12px',
  overflowX: 'auto',
  paddingBottom: '8px',
  width: '100%',
  justifyContent: 'center',
  '&::-webkit-scrollbar': {
    height: '4px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '2px',
  },
});

const ThumbnailImage = styled('img')<{ isSelected?: boolean }>(({ isSelected }) => ({
  width: '80px',
  height: '80px',
  objectFit: 'cover',
  borderRadius: '8px',
  border: isSelected ? '2px solid #60a5fa' : '2px solid rgba(255, 255, 255, 0.1)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  flexShrink: 0,
  '&:hover': {
    borderColor: '#60a5fa',
    transform: 'scale(1.05)',
  },
}));

// Info section
const InfoSection = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: '20px 0',
  [theme.breakpoints.down('md')]: {
    padding: '0',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

const ProductTitle = styled(Typography)(({ theme }) => ({
  fontSize: '36px',
  fontWeight: 700,
  color: '#ffffff',
  marginBottom: '16px',
  lineHeight: 1.2,
  background: 'linear-gradient(135deg, #ffffff, #e0e0e0)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  [theme.breakpoints.down('sm')]: {
    fontSize: '28px',
  },
}));

const ProductPrice = styled(Typography)(({ theme }) => ({
  fontSize: '40px',
  fontWeight: 700,
  color: '#60a5fa',
  marginBottom: '16px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '32px',
  },
}));

const ProductDescription = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  color: 'rgba(255, 255, 255, 0.7)',
  lineHeight: 1.7,
  marginBottom: '32px',
  maxWidth: '500px',
  [theme.breakpoints.down('md')]: {
    maxWidth: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '14px',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'rgba(96, 165, 250, 0.15)',
  border: '1px solid rgba(96, 165, 250, 0.3)',
  color: '#60a5fa',
  borderRadius: '12px',
  padding: '16px 32px',
  fontSize: '16px',
  fontWeight: 600,
  textTransform: 'none',
  marginRight: '16px',
  marginBottom: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(96, 165, 250, 0.25)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(96, 165, 250, 0.2)',
  },
  '&:disabled': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.4)',
    transform: 'none',
    boxShadow: 'none',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginRight: 0,
  },
}));

const SpecCard = styled(Card)({
  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)`,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
  marginTop: '32px',
  backdropFilter: 'blur(20px)',
});

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  image: string;
  stock: number;
  brand?: string;
  model_number?: string;
  warranty_period?: string;
  category: {
    name: string;
  };
  additional_images?: Array<{
    id: number;
    image: string;
    alt_text: string;
    is_primary: boolean;
    order: number;
  }>;
  all_images?: string[];
}

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      
      try {
        const response = await apiClient.get(`/api/products/${slug}/`);
        setProduct(response.data);
      } catch (err: any) {
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      category: { name: product.category.name },
    };
    
    addToCart(cartProduct, 1);
    enqueueSnackbar(`${product.name} added to cart!`, { variant: 'success' });
  };

  const handleBuyNow = () => {
    if (!product) return;
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <PageWrapper>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress sx={{ color: '#60a5fa' }} />
        </Box>
      </PageWrapper>
    );
  }

  if (error || !product) {
    return (
      <PageWrapper>
        <ContentContainer>
          <Button 
            onClick={() => navigate('/store')}
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Back
          </Button>
          <Alert severity="error" sx={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}>
            Product not found
          </Alert>
        </ContentContainer>
      </PageWrapper>
    );
  }

  const inStock = product.stock > 0;
  
  const getAllImages = () => product.all_images?.length ? product.all_images : (product.image ? [product.image] : []);
  
  const displayImages = getAllImages();
  const currentImage = displayImages[selectedImageIndex];
  
  const formatImageUrl = (imageUrl: string) => {
    if (!imageUrl) return `https://via.placeholder.com/500x500/1a1a1a/ffffff?text=${encodeURIComponent(product.name)}`;
    return imageUrl.startsWith('http') ? imageUrl : `http://127.0.0.1:8000${imageUrl}`;
  };

  return (
    <PageWrapper>
      <ContentContainer>
        <Button 
          onClick={() => navigate('/store')}
          startIcon={<ArrowBackIcon />}
          sx={{ 
            mb: { xs: 2, md: 4 }, 
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
          }}
        >
          Back
        </Button>
        <ProductContainer>
          {/* Product Image Gallery */}
          <ImageSection>
            <MainImageContainer>
              <ImageGlow />
              <ProductImage
                src={formatImageUrl(currentImage)}
                alt={product.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://via.placeholder.com/500x500/1a1a1a/ffffff?text=${encodeURIComponent(product.name)}`;
                }}
              />
            </MainImageContainer>
            
            {displayImages.length > 1 && (
              <ThumbnailContainer>
                {displayImages.map((img, index) => (
                  <ThumbnailImage
                    key={index}
                    src={formatImageUrl(img)}
                    alt={`${product.name} ${index + 1}`}
                    isSelected={selectedImageIndex === index}
                    onClick={() => setSelectedImageIndex(index)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/80x80/333333/ffffff?text=${index + 1}`;
                    }}
                  />
                ))}
              </ThumbnailContainer>
            )}
          </ImageSection>

          {/* Product Info */}
          <InfoSection>
            <Chip 
              label={product.category.name}
              sx={{
                backgroundColor: 'rgba(96, 165, 250, 0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                marginBottom: '16px',
              }}
            />

            <ProductTitle>{product.name}</ProductTitle>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <ProductPrice>₹{product.price}</ProductPrice>
              <Chip 
                label={inStock ? `${product.stock} in stock` : 'Out of stock'}
                size="small"
                sx={{
                  backgroundColor: inStock ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: inStock ? '#22c55e' : '#ef4444',
                  border: `1px solid ${inStock ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                }}
              />
            </Box>

            <ProductDescription>
              {product.description}
            </ProductDescription>

            {/* Action Buttons */}
            <Box sx={{ mb: 3 }}>
              <ActionButton 
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <ShoppingCartIcon sx={{ fontSize: '20px', mr: 1 }} />
                Add to Cart
              </ActionButton>
              
              <ActionButton 
                onClick={handleBuyNow}
                disabled={!inStock}
                sx={{
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  borderColor: 'rgba(34, 197, 94, 0.3)',
                  color: '#22c55e',
                  '&:hover': {
                    backgroundColor: 'rgba(34, 197, 94, 0.25)',
                    boxShadow: '0 8px 20px rgba(34, 197, 94, 0.2)',
                  },
                }}
              >
                <FlashOnIcon sx={{ fontSize: '20px', mr: 1 }} />
                Buy Now
              </ActionButton>
            </Box>
          </InfoSection>
        </ProductContainer>

        {/* Specifications Card */}
        <SpecCard>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
              Product Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Category</Typography>
                <Typography sx={{ color: 'white', fontWeight: 500 }}>{product.category.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Stock</Typography>
                <Typography sx={{ color: 'white', fontWeight: 500 }}>{product.stock} units</Typography>
              </Grid>
              {product.brand && (
                <Grid item xs={12} sm={6} md={3}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Brand</Typography>
                  <Typography sx={{ color: 'white', fontWeight: 500 }}>{product.brand}</Typography>
                </Grid>
              )}
              {product.model_number && (
                <Grid item xs={12} sm={6} md={3}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Model</Typography>
                  <Typography sx={{ color: 'white', fontWeight: 500 }}>{product.model_number}</Typography>
                </Grid>
              )}
              {product.warranty_period && (
                <Grid item xs={12} sm={6} md={3}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Warranty</Typography>
                  <Typography sx={{ color: 'white', fontWeight: 500 }}>{product.warranty_period}</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </SpecCard>
      </ContentContainer>
    </PageWrapper>
  );
};