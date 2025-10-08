// src/components/RatingModal.tsx - Star rating popup modal
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Rating,
  Avatar,
  Chip,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import PersonIcon from '@mui/icons-material/Person';
import { useSnackbar } from 'notistack';
import { useRating } from '../hooks/useRating';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.98) 0%, rgba(10, 10, 10, 0.99) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '20px',
    color: 'white',
    width: 'calc(100% - 32px)',
    maxWidth: '500px',
    margin: '16px',
  }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.95)',
  fontSize: '20px',
  fontWeight: 600,
  textAlign: 'center',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  padding: '16px 24px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '18px',
    padding: '16px',
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: '24px',
  [theme.breakpoints.down('sm')]: {
    padding: '16px',
  },
}));

const StyledRating = styled(Rating)(({ theme }) => ({
  fontSize: '3rem',
  color: '#fbbf24',
  '& .MuiRating-iconEmpty': {
    color: 'rgba(255, 255, 255, 0.2)',
  },
  '& .MuiRating-iconFilled': {
    color: '#fbbf24',
  },
  '& .MuiRating-iconHover': {
    color: '#f59e0b',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '2.5rem',
  },
}));

const TechnicianCard = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    textAlign: 'center',
    gap: '16px',
  },
}));

const SubmitButton = styled(Button)({
  backgroundColor: 'rgba(34, 197, 94, 0.15)',
  border: '1px solid rgba(34, 197, 94, 0.3)',
  color: '#22c55e',
  borderRadius: '12px',
  padding: '10px 24px',
  fontSize: '14px',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  '&:disabled': {
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
    borderColor: 'rgba(156, 163, 175, 0.3)',
    color: 'rgba(156, 163, 175, 0.6)',
  },
});

const CancelButton = styled(Button)({
  color: 'rgba(255, 255, 255, 0.7)',
  borderRadius: '12px',
  padding: '10px 24px',
  fontSize: '14px',
  fontWeight: 500,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '8px',
    color: 'white',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: '#22c55e',
    },
    '& fieldset': {
      border: 'none',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.6)',
    '&.Mui-focused': {
      color: '#22c55e',
    },
  },
  '& .MuiOutlinedInput-input': {
    color: 'white',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.4)',
    },
  },
});

const ratingLabels: { [index: string]: string } = {
  1: 'Poor',
  2: 'Fair', 
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

interface RatingModalProps {
  open: boolean;
  onClose: () => void;
  order?: {
    id: number;
    technician_name?: string;
    technician_phone?: string;
  };
  serviceRequest?: {
    id: number;
    technician?: {
      name: string;
      phone?: string;
    };
  };
  onRatingSubmitted?: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  open,
  onClose,
  order,
  serviceRequest,
  onRatingSubmitted
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const { submitRating, loading: submitting, error } = useRating();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async () => {
    if (!rating) {
      enqueueSnackbar('Please select a rating', { variant: 'error' });
      return;
    }

    const payload = {
      rating,
      comment: comment.trim(),
      ...(order && { order_id: order.id }),
      ...(serviceRequest && { service_request_id: serviceRequest.id }),
    };

    const success = await submitRating(payload);

    if (success) {
      setRating(null);
      setComment('');
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
      onClose();
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setRating(null);
      setComment('');
      onClose();
    }
  };

  const getTechnicianInfo = () => {
    if (order) {
      return {
        name: order.technician_name || 'Technician',
        phone: order.technician_phone || 'N/A'
      };
    }
    if (serviceRequest?.technician) {
      return {
        name: serviceRequest.technician.name || 'Technician',
        phone: serviceRequest.technician.phone || 'N/A'
      };
    }
    return { name: 'Technician', phone: 'N/A' };
  };

  const technicianInfo = getTechnicianInfo();
  const isOrder = !!order;
  const serviceType = isOrder ? 'delivery/installation' : 'service';

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <StyledDialogTitle>
        Rate Your Experience
      </StyledDialogTitle>

      <StyledDialogContent>
        {/* Technician Info */}
        <TechnicianCard>
          <Avatar sx={{ 
            width: 50, 
            height: 50, 
            background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
            fontSize: '20px',
            fontWeight: 600
          }}>
            {technicianInfo.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>
              {technicianInfo.name}
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
              Technician • {technicianInfo.phone}
            </Typography>
          </Box>
          <Chip 
            label={isOrder ? 'Order' : 'Service'}
            size="small"
            sx={{
              backgroundColor: isOrder ? 'rgba(59, 130, 246, 0.15)' : 'rgba(139, 92, 246, 0.15)',
              color: isOrder ? '#3b82f6' : '#8b5cf6',
              border: `1px solid ${isOrder ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
              fontWeight: 600,
            }}
          />
        </TechnicianCard>

        {/* Rating Section */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2, fontSize: '16px' }}>
            How would you rate the {serviceType} experience?
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <StyledRating
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
              icon={<StarIcon fontSize="inherit" />}
              emptyIcon={<StarBorderIcon fontSize="inherit" />}
              size="large"
            />
          </Box>

          {rating && (
            <Typography sx={{ 
              color: '#fbbf24', 
              fontWeight: 600, 
              fontSize: '18px',
              mb: 1 
            }}>
              {ratingLabels[rating]} ({rating}/5)
            </Typography>
          )}
        </Box>

        {/* Comment Section */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            mb: 2, 
            fontSize: '14px' 
          }}>
            Share your feedback (optional)
          </Typography>
          <StyledTextField
            fullWidth
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience..."
            variant="outlined"
            disabled={submitting}
          />
        </Box>

        {/* Error Display */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              '& .MuiAlert-icon': {
                color: '#ef4444',
              },
            }}
          >
            {error}
          </Alert>
        )}
      </StyledDialogContent>

      <DialogActions sx={{ p: { xs: 2, sm: 3 }, gap: 2 }}>
        <CancelButton onClick={handleClose} disabled={submitting}>
          Cancel
        </CancelButton>
        <SubmitButton 
          onClick={handleSubmit} 
          disabled={!rating || submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Rating'}
        </SubmitButton>
      </DialogActions>
    </StyledDialog>
  );
};