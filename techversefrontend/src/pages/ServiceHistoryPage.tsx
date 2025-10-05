// src/pages/ServiceHistoryPage.tsx - Updated with Job Sheet Integration

import { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Container, Typography, Card, CardContent, Chip, Stack, Button, Divider } from '@mui/material';
import dayjs from 'dayjs';
import apiClient from '../api';
import { RatingModal } from '../components/RatingModal';
import { JobSheetView } from '../components/JobSheetView';
import { useJobSheetStore } from '../stores/jobSheetStore';
import type { JobSheet } from '../stores/jobSheetStore';
import DescriptionIcon from '@mui/icons-material/Description';

type Address = {
  street_address: string;
  city: string;
  state: string;
  pincode: string;
};

type ServiceRequestHistory = {
  id: number;
  service_category_name: string;
  issue_description: string | null;
  issue_price: string | null;
  custom_description: string | null;
  service_location: Address | null;
  request_date: string;
  status: string;
  technician_name: string | null;
  can_rate: boolean;
};

const statusColor = (status: string) => {
  switch (status) {
    case 'SUBMITTED':
      return 'info';
    case 'ASSIGNED':
      return 'warning';
    case 'IN_PROGRESS':
      return 'primary';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

export const ServiceHistoryPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<ServiceRequestHistory[]>([]);

  const [ratingOpen, setRatingOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestHistory | null>(null);

  // Job Sheet states - NEW
  const [jobSheets, setJobSheets] = useState<JobSheet[]>([]);
  const [selectedJobSheet, setSelectedJobSheet] = useState<JobSheet | null>(null);
  const [jobSheetViewOpen, setJobSheetViewOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Fetch both service requests and job sheets
        const [servicesRes, jobSheetsRes] = await Promise.all([
          apiClient.get('/services/api/requests/history/'),
          apiClient.get('/services/api/job-sheets/')
        ]);
        
        if (!mounted) return;
        setRequests(servicesRes.data);
        setJobSheets(jobSheetsRes.data);
      } catch (e: any) {
        setError(e?.response?.data?.detail || e?.message || 'Failed to load service history');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const hasItems = useMemo(() => requests && requests.length > 0, [requests]);

  // Find job sheet for a service request - NEW
  const getJobSheetForService = (serviceRequestId: number) => {
    return jobSheets.find(js => js.service_request_id === serviceRequestId);
  };

  const handleOpenRating = (req: ServiceRequestHistory) => {
    setSelectedRequest(req);
    setRatingOpen(true);
  };

  const handleRatingSubmitted = () => {
    setRatingOpen(false);
    setSelectedRequest(null);
    // Optimistically refresh to reflect rating changes
    setLoading(true);
    apiClient
      .get('/services/api/requests/history/')
      .then((res) => setRequests(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // Refresh job sheets after approval/decline - NEW
  const handleJobSheetUpdate = async () => {
    try {
      const res = await apiClient.get('/services/api/job-sheets/');
      setJobSheets(res.data);
    } catch (error) {
      console.error('Error refreshing job sheets:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" color="error" sx={{ mt: 3 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Service History
      </Typography>
      {!hasItems && (
        <Typography color="text.secondary">No service requests yet.</Typography>
      )}
      <Stack spacing={2}>
        {requests.map((req) => {
          const address = req.service_location
            ? `${req.service_location.street_address}, ${req.service_location.city}, ${req.service_location.state} - ${req.service_location.pincode}`
            : 'N/A';
          
          const jobSheet = getJobSheetForService(req.id); // Get job sheet for this service - NEW
          
          return (
            <Card key={req.id} variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <Box>
                    <Typography variant="h6">{req.service_category_name}</Typography>
                    <Typography color="text.secondary" variant="body2">
                      {req.issue_description || req.custom_description || 'Custom issue'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Location: {address}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Requested on: {dayjs(req.request_date).format('MMM D, YYYY h:mm A')}
                    </Typography>
                    {req.technician_name && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Technician: {req.technician_name}
                      </Typography>
                    )}
                  </Box>
                  <Stack alignItems="flex-end" spacing={1}>
                    <Chip label={req.status.replace('_', ' ')} color={statusColor(req.status) as any} />
                    {req.issue_price && (
                      <Typography variant="subtitle2">₹ {req.issue_price}</Typography>
                    )}
                    
                    {/* VIEW JOB SHEET BUTTON - NEW */}
                    {jobSheet && (
                      <Button 
                        variant="outlined" 
                        size="small" 
                        startIcon={<DescriptionIcon />}
                        onClick={() => {
                          setSelectedJobSheet(jobSheet);
                          setJobSheetViewOpen(true);
                        }}
                        sx={{ mt: 1 }}
                      >
                        View Job Sheet
                        {jobSheet.approval_status === 'PENDING' && (
                          <Chip 
                            label="Pending" 
                            size="small" 
                            sx={{ ml: 1, height: '20px' }}
                            color="warning"
                          />
                        )}
                      </Button>
                    )}
                    
                    {req.can_rate && (
                      <Button variant="contained" size="small" onClick={() => handleOpenRating(req)}>
                        Rate Service
                      </Button>
                    )}
                  </Stack>
                </Stack>
                <Divider sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* Rating Modal */}
      <RatingModal
        open={ratingOpen}
        onClose={() => setRatingOpen(false)}
        onRatingSubmitted={handleRatingSubmitted}
        serviceRequest={
          selectedRequest
            ? {
                id: selectedRequest.id,
                technician: selectedRequest.technician_name
                  ? { name: selectedRequest.technician_name }
                  : undefined,
              }
            : undefined
        }
      />

      {/* Job Sheet View Modal - NEW */}
      <JobSheetView
        open={jobSheetViewOpen}
        onClose={() => {
          setJobSheetViewOpen(false);
          setSelectedJobSheet(null);
        }}
        jobSheet={selectedJobSheet}
        onUpdate={handleJobSheetUpdate}
      />
    </Container>
  );
};