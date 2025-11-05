import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import { Refresh, Pets, Schedule } from '@mui/icons-material';
import { loadTodayCheckIns, syncTodayCheckIns, clearError } from '../../../store/slices/staffSlice';
import { CheckInPet } from './CheckInPet';
import type { AppDispatch, RootState } from '../../../store/store';
import { format } from 'date-fns';
import type { Booking } from '@pet-management/shared';

export const TodayCheckIns: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { todayCheckIns, loading, error, lastSync } = useSelector((state: RootState) => state.staff);
  const { user } = useSelector((state: RootState) => state.auth);
  const { pets } = useSelector((state: RootState) => state.pets);
  const [kennelId, setKennelId] = useState<string>(''); // TODO: Get from staff profile
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);

  // Get kennel ID from user profile or staff assignment
  useEffect(() => {
    // TODO: Load staff assignment to get kennelId
    // For now, we'll need to get it from somewhere
    if (user) {
      // This should come from staff profile/assignment
      // For demo, we'll use a placeholder
      const assignedKennelId = (user as any).assignedKennelId || '';
      if (assignedKennelId) {
        setKennelId(assignedKennelId);
        dispatch(loadTodayCheckIns(assignedKennelId));
      }
    }
  }, [dispatch, user]);

  useEffect(() => {
    // Auto-sync once in the morning (check if last sync was today)
    if (kennelId && lastSync) {
      const lastSyncDate = new Date(lastSync);
      const today = new Date();
      if (
        lastSyncDate.getDate() !== today.getDate() ||
        lastSyncDate.getMonth() !== today.getMonth() ||
        lastSyncDate.getFullYear() !== today.getFullYear()
      ) {
        // Not synced today, sync now
        dispatch(syncTodayCheckIns(kennelId));
      }
    } else if (kennelId && !lastSync) {
      // First time, sync now
      dispatch(syncTodayCheckIns(kennelId));
    }
  }, [dispatch, kennelId, lastSync]);

  const handleRefresh = () => {
    if (kennelId) {
      dispatch(syncTodayCheckIns(kennelId));
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'checked-in':
        return 'info';
      default:
        return 'default';
    }
  };

  if (!kennelId) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="info">
          No kennel assigned. Please contact your manager to assign you to a kennel.
        </Alert>
      </Box>
    );
  }

  if (loading && todayCheckIns.length === 0) {
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

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Today's Check-ins
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {format(new Date(), 'EEEE, MMMM dd, yyyy')}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {todayCheckIns.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            padding: 4,
            border: '2px dashed #ccc',
            borderRadius: 2,
          }}
        >
          <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No check-ins scheduled for today
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Pet Name</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Check-in Time</TableCell>
                <TableCell>Stay Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {todayCheckIns.map((booking) => {
                const pet = pets.find((p) => p.id === booking.petId);
                const checkInTime = format(new Date(booking.startDate), 'h:mm a');
                const duration = Math.ceil(
                  (booking.endDate - booking.startDate) / (24 * 60 * 60 * 1000)
                );

                return (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Pets fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight="medium">
                          {pet?.name || 'Unknown Pet'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {/* TODO: Load owner name from user profile */}
                        Owner
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{checkInTime}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {duration} {duration === 1 ? 'day' : 'days'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status}
                        color={getStatusColor(booking.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {booking.status === 'confirmed' || booking.status === 'pending' ? (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setCheckInDialogOpen(true);
                          }}
                        >
                          Check-in
                        </Button>
                      ) : (
                        <Button variant="outlined" size="small" disabled>
                          Checked In
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {lastSync && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Last synced: {format(new Date(lastSync), 'h:mm a')}
        </Typography>
      )}

      {/* Check-in Dialog */}
      {selectedBooking && (
        <CheckInPet
          open={checkInDialogOpen}
          onClose={() => {
            setCheckInDialogOpen(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
        />
      )}
    </Box>
  );
};

