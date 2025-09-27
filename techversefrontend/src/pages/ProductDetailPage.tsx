// src/pages/ProductDetailPage.tsx - Simple Working Version
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
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { useCartStore } from '../stores/cartStore';
import { useSnackbar } from 'notistack';
import apiClient from '../api';

// Main page wrapper
const PageWrapper = styled(Box)({
  backgroundColor: '#000000',
  color: 'white',
  minHeight: '100vh',
  width: '100%',
  paddingTop: '80px',
});

// Header
const Header = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 60px',
  background: 'rgba(10, 10, 10, 0.8)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
});

const BackButton = styled(Button)({
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: 'rgba(255, 255, 255, 0.7)',
  borderRadius: '12px',
  padding: '12px 20px',
  fontSize: '14px',
  fontWeight: 500,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
  },
});

// Content container
const ContentContainer = styled(Box)({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '40px 20px',
});

// Product container
const ProductContainer = styled(Box)({
  display: 'flex',
  gap: '40px',
  marginBottom: '40px',
  '@media (max-width: 768px)': {
    flexDirection: 'column',
  },
});

// Image section with gallery
const ImageSection = styled(Box)({
  flex: '0 0 500px',
  '@media (max-width: 768px)': {
    flex: 'none',
  },
});

const MainImageContainer = styled(Box)({
  marginBottom: '16px',
});

const ProductImage = styled('img')({
  width: '100%',
  height: '400px',
  objectFit: 'contain',
  borderRadius: '16px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  },
});

const ThumbnailContainer = styled(Box)({
  display: 'flex',
  gap: '12px',
  overflowX: 'auto',
  paddingBottom: '8px',
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
const InfoSection = styled(Box)({
  flex: 1,
  padding: '20px 0',
});

const ProductTitle = styled(Typography)({
  fontSize: '28px',
  fontWeight: 700,
  color: '#ffffff',
  marginBottom: '16px',
  lineHeight: 1.2,
});

const ProductPrice = styled(Typography)({
  fontSize: '32px',
  fontWeight: 700,
  color: '#60a5fa',
  marginBottom: '16px',
});

const ProductDescription = styled(Typography)({
  fontSize: '16px',
  color: 'rgba(255, 255, 255, 0.7)',
  lineHeight: 1.6,
  marginBottom: '24px',
});

const ActionButton = styled(Button)({
  backgroundColor: 'rgba(96, 165, 250, 0.15)',
  border: '1px solid rgba(96, 165, 250, 0.3)',
  color: '#60a5fa',
  borderRadius: '12px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: 600,
  textTransform: 'none',
  marginRight: '12px',
  marginBottom: '12px',
  '&:hover': {
    backgroundColor: 'rgba(96, 165, 250, 0.25)',
  },
  '&:disabled': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.4)',
  },
});

const SpecCard = styled(Card)({
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  marginTop: '32px',
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
  // Add support for multiple images
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
        console.log('Fetching product with slug:', slug);
        const response = await apiClient.get(`/api/products/${slug}/`);
        console.log('Product data received:', response.data);
        setProduct(response.data);
      } catch (err: any) {
        console.error('Error fetching product:', err);
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
      category: {
        name: product.category.name,
      },
    };
    
    addToCart(cartProduct, 1);
    enqueueSnackbar(`${product.name} added to cart!`, { 
      variant: 'success' 
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <PageWrapper>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh' 
        }}>
          <CircularProgress sx={{ color: '#60a5fa' }} />
        </Box>
      </PageWrapper>
    );
  }

  if (error || !product) {
    return (
      <PageWrapper>
        <Header>
          <BackButton onClick={() => navigate('/store')}>
            <ArrowBackIcon sx={{ fontSize: '16px', mr: 1 }} />
            Back to Store
          </BackButton>
        </Header>
        <ContentContainer>
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
  
  // Get all available images (fixed to avoid duplicates)
  const getAllImages = () => {
    // Use the all_images property from backend which already handles duplicates
    if (product.all_images && product.all_images.length > 0) {
      return product.all_images;
    }
    
    // Fallback to main image if no all_images
    if (product.image) {
      return [product.image];
    }
    
    // Return empty array if no images
    return [];
  };
  
  const displayImages = getAllImages();
  const currentImage = displayImages[selectedImageIndex];
  
  const formatImageUrl = (imageUrl: string) => {
    if (!imageUrl) return `https://via.placeholder.com/400x400/333333/ffffff?text=${encodeURIComponent(product.name)}`;
    return imageUrl.startsWith('http') ? imageUrl : `http://127.0.0.1:8000${imageUrl}`;
  };

  return (
    <PageWrapper>
      {/* Header */}
      <Header>
        <BackButton onClick={() => navigate('/store')}>
          <ArrowBackIcon sx={{ fontSize: '16px', mr: 1 }} />
          Back to Store
        </BackButton>
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
          Store / {product.category.name} / {product.name}
        </Typography>
      </Header>

      {/* Content */}
      <ContentContainer>
        <ProductContainer>
          {/* Product Image Gallery */}
          <ImageSection>
            {/* Main Image */}
            <MainImageContainer>
              <ProductImage
                src={formatImageUrl(currentImage)}
                alt={product.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://via.placeholder.com/400x400/333333/ffffff?text=${encodeURIComponent(product.name)}`;
                }}
              />
            </MainImageContainer>
            
            {/* Thumbnail Images */}
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
            
            {/* Image Counter */}
            {displayImages.length > 1 && (
              <Box sx={{ 
                textAlign: 'center', 
                mt: 2,
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '14px'
              }}>
                {selectedImageIndex + 1} of {displayImages.length}
              </Box>
            )}
          </ImageSection>

          {/* Product Info */}
          <InfoSection>
            {/* Category Chip */}
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
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
                <ShoppingCartIcon sx={{ fontSize: '18px', mr: 1 }} />
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
                  },
                }}
              >
                <FlashOnIcon sx={{ fontSize: '18px', mr: 1 }} />
                Buy Now
              </ActionButton>
            </Box>

            {/* Basic Info */}
            <Box>
              {product.brand && (
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                  <strong>Brand:</strong> {product.brand}
                </Typography>
              )}
              {product.model_number && (
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                  <strong>Model:</strong> {product.model_number}
                </Typography>
              )}
              {product.warranty_period && (
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                  <strong>Warranty:</strong> {product.warranty_period}
                </Typography>
              )}
            </Box>
          </InfoSection>
        </ProductContainer>

        {/* Specifications Card */}
        <SpecCard>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Product Details
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Box>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Category</Typography>
                <Typography sx={{ color: 'white', fontWeight: 500 }}>{product.category.name}</Typography>
              </Box>
              <Box>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Stock</Typography>
                <Typography sx={{ color: 'white', fontWeight: 500 }}>{product.stock} units</Typography>
              </Box>
              {product.brand && (
                <Box>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Brand</Typography>
                  <Typography sx={{ color: 'white', fontWeight: 500 }}>{product.brand}</Typography>
                </Box>
              )}
              {product.warranty_period && (
                <Box>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Warranty</Typography>
                  <Typography sx={{ color: 'white', fontWeight: 500 }}>{product.warranty_period}</Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </SpecCard>

        {/* Debug Info - Remove this after testing */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: 'rgba(255, 255, 255, 0.05)', 
            borderRadius: '8px',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
              Debug Info:
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              Main Image: {product.image ? 'Yes' : 'No'}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              Additional Images: {product.additional_images?.length || 0}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              All Images Array: {product.all_images?.length || 0}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              Total Display Images: {displayImages.length}
            </Typography>
            {displayImages.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ display: 'block' }}>Images:</Typography>
                {displayImages.map((img, i) => (
                  <Typography key={i} variant="caption" sx={{ display: 'block', fontSize: '10px' }}>
                    {i + 1}: {img?.substring(0, 50)}...
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Stock Warning */}
        {!inStock && (
          <Alert 
            severity="warning" 
            sx={{ 
              mt: 3,
              backgroundColor: 'rgba(251, 191, 36, 0.15)',
              color: '#fbbf24',
              border: '1px solid rgba(251, 191, 36, 0.3)',
            }}
          >
            This product is currently out of stock.
          </Alert>
        )}
      </ContentContainer>
    </PageWrapper>
  );
};