import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { loadBookingById, clearError } from '../../../store/slices/bookingSlice';
import { StayUpdates } from './StayUpdates';
import { CreateReview } from './CreateReview';
import { loadReviewByBooking } from '../../../store/slices/reviewSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import { format } from 'date-fns';
import type { Booking } from '@pet-management/shared';

export const BookingDetails: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentBooking, loading, error } = useSelector((state: RootState) => state.bookings);
  const { pets } = useSelector((state: RootState) => state.pets);
  const { currentReview } = useSelector((state: RootState) => state.reviews);
  const [tabValue, setTabValue] = useState(0);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (bookingId) {
      dispatch(loadBookingById(bookingId));
      dispatch(loadReviewByBooking(bookingId));
    }
    
    // Set tab from location state if provided
    if (location.state?.tab !== undefined) {
      setTabValue(location.state.tab);
    }
  }, [dispatch, bookingId, location.state]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error" onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!currentBooking) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="info">Booking not found</Alert>
      </Box>
    );
  }

  const selectedPet = pets.find((p) => p.id === currentBooking.petId);

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'checked-in':
        return 'info';
      case 'checked-out':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/bookings')}
        sx={{ mb: 2 }}
      >
        Back to Bookings
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        Booking Details
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Typography variant="h6">
              Booking #{currentBooking.id.substring(0, 8)}
            </Typography>
            <Chip
              label={currentBooking.status}
              color={getStatusColor(currentBooking.status) as any}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Pet
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {selectedPet?.name || 'Unknown Pet'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Check-in Date
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {format(new Date(currentBooking.startDate), 'MMMM dd, yyyy')}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Check-out Date
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {format(new Date(currentBooking.endDate), 'MMMM dd, yyyy')}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                ${currentBooking.totalAmount.toFixed(2)}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Payment Status
              </Typography>
              <Chip
                label={currentBooking.paymentStatus}
                size="small"
                color={currentBooking.paymentStatus === 'paid' ? 'success' : 'warning'}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Review Button for checked-out bookings */}
      {currentBooking.status === 'checked-out' && (
        <Box sx={{ mb: 2 }}>
          {currentReview ? (
            <Alert severity="info">
              You have already reviewed this booking. Thank you for your feedback!
            </Alert>
          ) : (
            <Button
              variant="contained"
              onClick={() => setReviewDialogOpen(true)}
            >
              Write a Review
            </Button>
          )}
        </Box>
      )}

      {/* Tabs for Booking Info and Stay Updates */}
      <Box>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Booking Information" />
          <Tab label="Stay Updates" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ mt: 2 }}>
            {/* Booking information is already shown above */}
          </Box>
        )}

        {tabValue === 1 && bookingId && (
          <Box sx={{ mt: 2 }}>
            <StayUpdates />
          </Box>
        )}
      </Box>

      {/* Review Dialog */}
      {currentBooking && (
        <CreateReview
          open={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          booking={currentBooking}
          kennelId={currentBooking.kennelId}
        />
      )}
    </Box>
  );
};

