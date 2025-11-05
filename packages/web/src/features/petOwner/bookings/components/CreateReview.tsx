import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { createReview, clearError, loadReviewByBooking } from '../../../../store/slices/reviewSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import type { Booking } from '@pet-management/shared';

interface CreateReviewProps {
  open: boolean;
  onClose: () => void;
  booking: Booking;
  kennelId: string;
}

export const CreateReview: React.FC<CreateReviewProps> = ({
  open,
  onClose,
  booking,
  kennelId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { submitting, error, currentReview } = useSelector((state: RootState) => state.reviews);
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (booking.id) {
      // Check if review already exists
      dispatch(loadReviewByBooking(booking.id));
    }
  }, [dispatch, booking.id]);

  useEffect(() => {
    if (currentReview) {
      // Review already exists, populate form
      setRating(currentReview.rating);
      setTitle(currentReview.title || '');
      setComment(currentReview.comment || '');
    }
  }, [currentReview]);

  const handleSubmit = async () => {
    if (!user) return;

    if (rating < 1 || rating > 5) {
      return;
    }

    try {
      await dispatch(
        createReview({
          userId: user.uid,
          bookingId: booking.id,
          kennelId,
          rating,
          title: title.trim() || undefined,
          comment: comment.trim() || undefined,
        })
      ).unwrap();
      onClose();
      // Reset form
      setRating(5);
      setTitle('');
      setComment('');
    } catch (error) {
      // Error is handled by Redux
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
      dispatch(clearError());
    }
  };

  if (currentReview) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Review Already Submitted</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            You have already submitted a review for this booking.
          </Alert>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Rating
            </Typography>
            <Rating value={currentReview.rating} readOnly />
          </Box>
          {currentReview.title && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Title
              </Typography>
              <Typography variant="body1">{currentReview.title}</Typography>
            </Box>
          )}
          {currentReview.comment && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Comment
              </Typography>
              <Typography variant="body1">{currentReview.comment}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Rate Your Stay</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3, mt: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            How would you rate your experience?
          </Typography>
          <Rating
            value={rating}
            onChange={(_, newValue) => {
              if (newValue !== null) {
                setRating(newValue);
              }
            }}
            size="large"
          />
        </Box>

        <TextField
          fullWidth
          label="Title (Optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          disabled={submitting}
        />

        <TextField
          fullWidth
          label="Your Review (Optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          margin="normal"
          multiline
          rows={4}
          disabled={submitting}
          placeholder="Share your experience..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || rating < 1}
        >
          {submitting ? <CircularProgress size={20} /> : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

