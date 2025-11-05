import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Divider,
} from '@mui/material';
import { checkOutPet } from '../../../store/slices/staffSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import { format } from 'date-fns';
import type { Booking } from '@pet-management/shared';

interface CheckOutPetProps {
  open: boolean;
  onClose: () => void;
  booking: Booking;
}

export const CheckOutPet: React.FC<CheckOutPetProps> = ({ open, onClose, booking }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { pets } = useSelector((state: RootState) => state.pets);
  const { submitting, error } = useSelector((state: RootState) => state.staff);
  const [notes, setNotes] = useState('');

  const pet = pets.find((p) => p.id === booking.petId);
  const stayDuration = Math.ceil(
    (booking.endDate - booking.startDate) / (24 * 60 * 60 * 1000)
  );

  const handleSubmit = async () => {
    if (!user) return;

    try {
      await dispatch(
        checkOutPet({
          bookingId: booking.id,
          staffId: user.uid,
          notes: notes.trim() || undefined,
        })
      ).unwrap();

      // Reset form
      setNotes('');
      onClose();
    } catch (error) {
      // Error is handled by Redux
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
      setNotes('');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Check-out Pet</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Booking Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Pet Name
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {pet?.name || 'Unknown Pet'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Stay Duration
              </Typography>
              <Typography variant="body1">
                {stayDuration} {stayDuration === 1 ? 'day' : 'days'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Check-in Date
              </Typography>
              <Typography variant="body1">
                {format(new Date(booking.startDate), 'MMM dd, yyyy')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Check-out Date
              </Typography>
              <Typography variant="body1">
                {format(new Date(booking.endDate), 'MMM dd, yyyy')}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
              <Typography variant="h6" color="primary">
                ${booking.totalAmount.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          An invoice will be generated automatically and sent to the pet owner via email and push notification.
        </Alert>

        <TextField
          fullWidth
          label="Check-out Notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          margin="normal"
          multiline
          rows={4}
          disabled={submitting}
          placeholder="Any notes about the check-out..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
          color="primary"
        >
          {submitting ? <CircularProgress size={20} /> : 'Check-out Pet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

