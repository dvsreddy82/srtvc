import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import { ArrowBack, CheckCircle, Payment } from '@mui/icons-material';
import { createBooking, clearError } from '../../../../store/slices/bookingSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import { format } from 'date-fns';
import { loadPets } from '../../../../store/slices/petSlice';

export const CreateBooking: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { creating, error } = useSelector((state: RootState) => state.bookings);
  const { pets } = useSelector((state: RootState) => state.pets);
  const { user } = useSelector((state: RootState) => state.auth);

  // Get booking data from navigation state
  const bookingData = location.state as {
    kennelId: string;
    runId: string;
    petId: string;
    startDate: number;
    endDate: number;
  };

  const [kennelName, setKennelName] = useState('');
  const [runName, setRunName] = useState('');
  const [pricePerDay, setPricePerDay] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (!bookingData) {
      navigate('/bookings/search');
      return;
    }

    // Load pets if not loaded
    if (pets.length === 0 && user) {
      dispatch(loadPets(user.uid));
    }

    // Calculate days and total
    const days = Math.ceil(
      (bookingData.endDate - bookingData.startDate) / (24 * 60 * 60 * 1000)
    );
    setTotalDays(days);

    // TODO: Fetch kennel and run details to get name and price
    // For now, use placeholder values
    setKennelName('Kennel Name');
    setRunName('Run Name');
    setPricePerDay(50); // Default price
    setTotalAmount(days * 50);
  }, [bookingData, dispatch, navigate, pets.length, user]);

  const handleCreateBooking = async () => {
    if (!user || !bookingData) return;

    dispatch(clearError());

    try {
      await dispatch(
        createBooking({
          userId: user.uid,
          petId: bookingData.petId,
          kennelId: bookingData.kennelId,
          runId: bookingData.runId,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          totalAmount,
        })
      ).unwrap();

      navigate('/bookings', { state: { bookingCreated: true } });
    } catch (err) {
      // Error handled by Redux state
    }
  };

  if (!bookingData) {
    return null;
  }

  const selectedPet = pets.find((p) => p.id === bookingData.petId);

  return (
    <Box sx={{ padding: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/bookings/search')}
        sx={{ mb: 2 }}
      >
        Back to Search
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        Confirm Booking
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Booking Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

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
                    Kennel
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {kennelName}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Run
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {runName}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Check-in Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {format(new Date(bookingData.startDate), 'MMMM dd, yyyy')}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Check-out Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {format(new Date(bookingData.endDate), 'MMMM dd, yyyy')}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {totalDays} {totalDays === 1 ? 'day' : 'days'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ padding: 2, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Booking Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Price per day</Typography>
                <Typography variant="body2">${pricePerDay.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Days</Typography>
                <Typography variant="body2">{totalDays}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">
                  ${totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={<Payment />}
              label="Payment will be processed after confirmation"
              color="info"
              sx={{ mb: 2, width: '100%' }}
            />

            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={creating ? <CircularProgress size={20} /> : <CheckCircle />}
              onClick={handleCreateBooking}
              disabled={creating}
            >
              {creating ? 'Creating Booking...' : 'Confirm Booking'}
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              By confirming, you agree to the kennel's terms and conditions. Payment will be
              processed after the booking is confirmed by the kennel staff.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

