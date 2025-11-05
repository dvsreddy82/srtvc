import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';
import { Add as AddIcon, Search, Receipt } from '@mui/icons-material';
import { loadUserBookings, clearError } from '../../../../store/slices/bookingSlice';
import { loadInvoices } from '../../../../store/slices/invoiceSlice';
import { InvoicesList } from './InvoicesList';
import type { AppDispatch, RootState } from '../../../../store/store';
import { format } from 'date-fns';
import type { Booking } from '@pet-management/shared';

export const BookingsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { bookings, loading, error } = useSelector((state: RootState) => state.bookings);
  const { user } = useSelector((state: RootState) => state.auth);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(loadUserBookings(user.uid));
      dispatch(loadInvoices(user.uid));
    }
  }, [dispatch, user]);

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

  if (loading && bookings.length === 0) {
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

  const now = Date.now();
  const activeBookings = bookings.filter(
    (b) => b.status !== 'checked-out' && b.status !== 'cancelled' && b.endDate >= now
  );
  const pastBookings = bookings.filter(
    (b) => b.status === 'checked-out' || b.endDate < now
  );

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Bookings
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Receipt />}
            onClick={() => navigate('/invoices')}
          >
            View Invoices
          </Button>
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={() => navigate('/bookings/search')}
          >
            Search Kennels
          </Button>
        </Box>
      </Box>

      <Tabs value={showPast ? 1 : 0} onChange={(_, newValue) => setShowPast(newValue === 1)} sx={{ mb: 3 }}>
        <Tab label={`Active Bookings (${activeBookings.length})`} />
        <Tab label={`Past Bookings (${pastBookings.length})`} />
      </Tabs>

      {showPast ? (
        <>
          {pastBookings.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                padding: 4,
                border: '2px dashed #ccc',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No past bookings
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {pastBookings.map((booking) => (
                <Grid item xs={12} key={booking.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Booking #{booking.id.substring(0, 8)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {format(new Date(booking.startDate), 'MMM dd, yyyy')} -{' '}
                            {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                        <Chip
                          label={booking.status}
                          color={getStatusColor(booking.status) as any}
                          size="small"
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Amount: <strong>${booking.totalAmount.toFixed(2)}</strong>
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(`/bookings/${booking.id}`)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      ) : activeBookings.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            padding: 4,
            border: '2px dashed #ccc',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bookings yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={() => navigate('/bookings/search')}
            sx={{ mt: 2 }}
          >
            Search for Kennels
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {activeBookings.map((booking) => (
            <Grid item xs={12} key={booking.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Booking #{booking.id.substring(0, 8)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(booking.startDate), 'MMM dd, yyyy')} -{' '}
                        {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                    <Chip
                      label={booking.status}
                      color={getStatusColor(booking.status) as any}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Amount: <strong>${booking.totalAmount.toFixed(2)}</strong>
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/bookings/${booking.id}`)}
                    >
                      View Details
                    </Button>
                    {booking.status === 'checked-in' && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/bookings/${booking.id}`, { state: { tab: 1 } })}
                        sx={{ ml: 1 }}
                      >
                        View Updates
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

