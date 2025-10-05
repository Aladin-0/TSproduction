// src/components/JobSheetView.tsx - Job Sheet View and Approval for Customers

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Divider,
  Grid,
  Chip,
  TextField,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BuildIcon from '@mui/icons-material/Build';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useJobSheetStore } from '../stores/jobSheetStore';
import type { JobSheet } from '../stores/jobSheetStore';
import { useSnackbar } from 'notistack';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '20px',
    color: 'white',
    maxWidth: '1000px',
    width: '100%',
  },
}));

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#60a5fa',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: '#60a5fa',
    },
  },
});

const PremiumButton = styled(Button)({
  backgroundColor: 'rgba(96, 165, 250, 0.15)',
  border: '1px solid rgba(96, 165, 250, 0.3)',
  color: '#60a5fa',
  borderRadius: '12px',
  padding: '10px 24px',
  fontSize: '14px',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(96, 165, 250, 0.25)',
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  '&.success': {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    color: '#22c55e',
    '&:hover': {
      backgroundColor: 'rgba(34, 197, 94, 0.25)',
    },
  },
  '&.danger': {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    '&:hover': {
      backgroundColor: 'rgba(239, 68, 68, 0.25)',
    },
  },
  '&:disabled': {
    opacity: 0.5,
  },
});

const InfoCard = styled(Box)({
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px',
});

const StatusChip = styled(Chip)<{ status: string }>(({ status }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' };
      case 'approved':
        return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' };
      case 'declined':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      default:
        return { bg: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af', border: 'rgba(156, 163, 175, 0.3)' };
    }
  };
  
  const colors = getStatusColor();
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    border: `1px solid ${colors.border}`,
    fontWeight: 600,
    fontSize: '12px',
  };
});

interface JobSheetViewProps {
  open: boolean;
  onClose: () => void;
  jobSheet: JobSheet | null;
  onUpdate?: () => void;
}

export const JobSheetView: React.FC<JobSheetViewProps> = ({
  open,
  onClose,
  jobSheet,
  onUpdate,
}) => {
  const { approveJobSheet, declineJobSheet, loading } = useJobSheetStore();
  const { enqueueSnackbar } = useSnackbar();
  
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  if (!jobSheet) return null;

  const handleApprove = async () => {
    try {
      await approveJobSheet(jobSheet.id);
      enqueueSnackbar('Job sheet approved successfully!', { variant: 'success' });
      if (onUpdate) onUpdate();
      onClose();
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Failed to approve job sheet', { variant: 'error' });
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      enqueueSnackbar('Please provide a reason for declining', { variant: 'error' });
      return;
    }

    try {
      await declineJobSheet(jobSheet.id, declineReason);
      enqueueSnackbar('Job sheet declined', { variant: 'info' });
      if (onUpdate) onUpdate();
      onClose();
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Failed to decline job sheet', { variant: 'error' });
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (duration: string) => {
    if (!duration) return '';
    const parts = duration.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    return `${hours}h ${minutes}m`;
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Job Sheet #{jobSheet.id}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 0.5 }}>
              Service Request #{jobSheet.service_request_id} - {jobSheet.service_category_name}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <StatusChip label={jobSheet.approval_status} status={jobSheet.approval_status} />
            <IconButton onClick={onClose} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        {/* Customer Information */}
        <Typography variant="h6" sx={{ mb: 2, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon /> Customer Information
        </Typography>
        <InfoCard>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5 }}>
                Name
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {jobSheet.customer_name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5 }}>
                Contact
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <PhoneIcon sx={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)' }} />
                <Typography variant="body1" fontWeight={500}>
                  {jobSheet.customer_contact}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5 }}>
                Technician
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {jobSheet.technician_name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                {jobSheet.technician_phone}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: '14px', mr: 0.5 }} />
                Service Location
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {jobSheet.service_address}
              </Typography>
            </Grid>
          </Grid>
        </InfoCard>

        <Divider sx={{ my: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Equipment Details */}
        <Typography variant="h6" sx={{ mb: 2, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 1 }}>
          <BuildIcon /> Equipment Details
        </Typography>
        <InfoCard>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5 }}>
                Equipment Type
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {jobSheet.equipment_type}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5 }}>
                Serial Number
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {jobSheet.serial_number || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5 }}>
                Brand/Make
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {jobSheet.equipment_brand || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5 }}>
                Model
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {jobSheet.equipment_model || 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </InfoCard>

        <Divider sx={{ my: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Problem & Work */}
        <Typography variant="h6" sx={{ mb: 2, color: '#60a5fa' }}>
          Problem & Work Performed
        </Typography>
        <InfoCard>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
            Problem Description
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
            {jobSheet.problem_description}
          </Typography>

          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
            Work Performed
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {jobSheet.work_performed}
          </Typography>
        </InfoCard>

        <Divider sx={{ my: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Time Record */}
        <Typography variant="h6" sx={{ mb: 2, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon /> Time Record
        </Typography>
        <InfoCard>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5 }}>
                Date
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {new Date(jobSheet.date_of_service).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5 }}>
                Start Time
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatTime(jobSheet.start_time)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5 }}>
                Finish Time
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatTime(jobSheet.finish_time)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5 }}>
                Total Time
              </Typography>
              <Typography variant="body1" fontWeight={500} sx={{ color: '#60a5fa' }}>
                {formatDuration(jobSheet.total_time_taken)}
              </Typography>
            </Grid>
          </Grid>
        </InfoCard>

        <Divider sx={{ my: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Materials Used */}
        <Typography variant="h6" sx={{ mb: 2, color: '#60a5fa' }}>
          Materials Used
        </Typography>
        {jobSheet.materials.length === 0 ? (
          <Alert
            severity="info"
            sx={{
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#3b82f6',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            No materials were used in this job.
          </Alert>
        ) : (
          <>
            <TableContainer
              sx={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600, border: 'none' }}>
                      Date
                    </TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600, border: 'none' }}>
                      Item Description
                    </TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600, border: 'none' }} align="right">
                      Qty
                    </TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600, border: 'none' }} align="right">
                      Cost
                    </TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600, border: 'none' }} align="right">
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
<TableBody>
  {jobSheet.materials.map((material) => (
    <TableRow key={material.id}>
      <TableCell sx={{ color: 'white', border: 'none' }}>
        {new Date(material.date_used).toLocaleDateString()}
      </TableCell>
      <TableCell sx={{ color: 'white', border: 'none' }}>
        {material.item_description}
      </TableCell>
      <TableCell sx={{ color: 'white', border: 'none' }} align="right">
        {material.quantity}
      </TableCell>
      <TableCell sx={{ color: 'white', border: 'none' }} align="right">
        ₹{Number(material.unit_cost).toFixed(2)}
      </TableCell>
      <TableCell sx={{ color: 'white', border: 'none' }} align="right">
        ₹{Number(material.total_cost).toFixed(2)}
      </TableCell>
    </TableRow>
  ))}
  <TableRow>
    <TableCell colSpan={4} sx={{ color: '#60a5fa', fontWeight: 700, border: 'none' }} align="right">
      Total Material Cost:
    </TableCell>
    <TableCell sx={{ color: '#22c55e', fontWeight: 700, fontSize: '16px', border: 'none' }} align="right">
      ₹{Number(jobSheet.total_material_cost).toFixed(2)}
    </TableCell>
  </TableRow>
</TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Decline Form */}
        {showDeclineForm && jobSheet.approval_status === 'PENDING' && (
          <Box sx={{ mt: 3 }}>
            <Alert
              severity="warning"
              sx={{
                mb: 2,
                backgroundColor: 'rgba(251, 191, 36, 0.15)',
                color: '#fbbf24',
                border: '1px solid rgba(251, 191, 36, 0.3)',
              }}
            >
              Please provide a reason for declining this job sheet
            </Alert>
            <StyledTextField
              fullWidth
              label="Reason for Declining"
              multiline
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Please explain why you're declining this job sheet..."
            />
          </Box>
        )}

        {/* Declined Reason Display */}
        {jobSheet.approval_status === 'DECLINED' && jobSheet.declined_reason && (
          <Box sx={{ mt: 3 }}>
            <Alert
              severity="error"
              sx={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Decline Reason:
              </Typography>
              <Typography variant="body2">{jobSheet.declined_reason}</Typography>
            </Alert>
          </Box>
        )}

        {/* Approval Info */}
        {jobSheet.approval_status === 'APPROVED' && jobSheet.approved_at && (
          <Box sx={{ mt: 3 }}>
            <Alert
              severity="success"
              sx={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <Typography variant="body2">
                Approved on {new Date(jobSheet.approved_at).toLocaleString()}
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
          }}
        >
          Close
        </Button>

        {jobSheet.approval_status === 'PENDING' && (
          <>
            {!showDeclineForm ? (
              <>
                <PremiumButton
                  className="danger"
                  onClick={() => setShowDeclineForm(true)}
                  disabled={loading}
                >
                  <CancelIcon sx={{ mr: 1 }} />
                  Decline
                </PremiumButton>
                <PremiumButton
                  className="success"
                  onClick={handleApprove}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : <CheckCircleIcon sx={{ mr: 1 }} />}
                  Approve Job Sheet
                </PremiumButton>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setShowDeclineForm(false);
                    setDeclineReason('');
                  }}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                  }}
                >
                  Cancel Decline
                </Button>
                <PremiumButton
                  className="danger"
                  onClick={handleDecline}
                  disabled={loading || !declineReason.trim()}
                >
                  {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : <CancelIcon sx={{ mr: 1 }} />}
                  Confirm Decline
                </PremiumButton>
              </>
            )}
          </>
        )}
      </DialogActions>
    </StyledDialog>
  );
};