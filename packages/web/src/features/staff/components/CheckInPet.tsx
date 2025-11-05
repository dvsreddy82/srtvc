import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { checkInPet } from '../../../store/slices/staffSlice';
import type { AppDispatch, RootState } from '../../../store/store';
import type { Booking } from '@pet-management/shared';

interface CheckInPetProps {
  open: boolean;
  onClose: () => void;
  booking: Booking;
}

export const CheckInPet: React.FC<CheckInPetProps> = ({ open, onClose, booking }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { pets } = useSelector((state: RootState) => state.pets);
  const { submitting, error } = useSelector((state: RootState) => state.staff);
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');

  const pet = pets.find((p) => p.id === booking.petId);

  const handleSubmit = async () => {
    if (!user) return;

    try {
      await dispatch(
        checkInPet({
          bookingId: booking.id,
          staffId: user.uid,
          condition: condition.trim() || undefined,
          notes: notes.trim() || undefined,
        })
      ).unwrap();

      // Update local state optimistically
      dispatch(updateCheckInStatus({ bookingId: booking.id, status: 'checked-in' }));

      // Reset form
      setCondition('');
      setNotes('');
      onClose();
    } catch (error) {
      // Error is handled by Redux
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
      setCondition('');
      setNotes('');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Check-in Pet</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Pet Information
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
                Species
              </Typography>
              <Typography variant="body1">
                {pet?.species || 'Unknown'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Booking ID
              </Typography>
              <Typography variant="body1" fontFamily="monospace">
                {booking.id.substring(0, 8)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <TextField
          fullWidth
          label="Pet Condition (Optional)"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          margin="normal"
          multiline
          rows={3}
          disabled={submitting}
          placeholder="Describe the pet's condition upon arrival..."
          helperText="Note any health concerns, injuries, or special observations"
        />

        <TextField
          fullWidth
          label="Additional Notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          margin="normal"
          multiline
          rows={4}
          disabled={submitting}
          placeholder="Any additional notes about the check-in..."
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
        >
          {submitting ? <CircularProgress size={20} /> : 'Check-in Pet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

