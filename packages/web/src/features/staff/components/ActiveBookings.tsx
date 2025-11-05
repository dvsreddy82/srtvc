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
} from '@mui/material';
import { Upload, Pets, ExitToApp } from '@mui/icons-material';
import { loadActiveBookings, clearError } from '../../../store/slices/staffSlice';
import { UploadStayUpdate } from './UploadStayUpdate';
import { CheckOutPet } from './CheckOutPet';
import type { AppDispatch, RootState } from '../../../store/store';
import { format } from 'date-fns';
import type { Booking } from '@pet-management/shared';

export const ActiveBookings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { activeBookings, loading, error } = useSelector((state: RootState) => state.staff);
  const { user } = useSelector((state: RootState) => state.auth);
  const { pets } = useSelector((state: RootState) => state.pets);
  const [kennelId, setKennelId] = useState<string>(''); // TODO: Get from staff profile
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [checkOutDialogOpen, setCheckOutDialogOpen] = useState(false);

  useEffect(() => {
    // TODO: Load staff assignment to get kennelId
    if (user) {
      const assignedKennelId = (user as any).assignedKennelId || '';
      if (assignedKennelId) {
        setKennelId(assignedKennelId);
        dispatch(loadActiveBookings(assignedKennelId));
      }
    }
  }, [dispatch, user]);

  if (!kennelId) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="info">
          No kennel assigned. Please contact your manager to assign you to a kennel.
        </Alert>
      </Box>
    );
  }

  if (loading && activeBookings.length === 0) {
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
      <Typography variant="h4" component="h1" gutterBottom>
        Active Bookings
      </Typography>

      {activeBookings.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            padding: 4,
            border: '2px dashed #ccc',
            borderRadius: 2,
          }}
        >
          <Pets sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No active bookings
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Pet Name</TableCell>
                <TableCell>Check-in Date</TableCell>
                <TableCell>Check-out Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeBookings.map((booking) => {
                const pet = pets.find((p) => p.id === booking.petId);

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
                      <Typography variant="body2">
                        {format(new Date(booking.startDate), 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={booking.status} size="small" color="info" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Upload />}
                          onClick={() => {
                            setSelectedBooking(booking);
                            setUploadDialogOpen(true);
                          }}
                        >
                          Upload Update
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          startIcon={<ExitToApp />}
                          onClick={() => {
                            setSelectedBooking(booking);
                            setCheckOutDialogOpen(true);
                          }}
                        >
                          Check-out
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Upload Stay Update Dialog */}
      {selectedBooking && (
        <>
          <UploadStayUpdate
            open={uploadDialogOpen}
            onClose={() => {
              setUploadDialogOpen(false);
              setSelectedBooking(null);
            }}
            booking={selectedBooking}
          />
          <CheckOutPet
            open={checkOutDialogOpen}
            onClose={() => {
              setCheckOutDialogOpen(false);
              setSelectedBooking(null);
            }}
            booking={selectedBooking}
          />
        </>
      )}
    </Box>
  );
};

