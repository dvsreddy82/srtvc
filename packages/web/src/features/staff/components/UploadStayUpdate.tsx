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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
} from '@mui/material';
import { Close, PhotoCamera } from '@mui/icons-material';
import { uploadStayUpdate } from '../../../store/slices/staffSlice';
import type { AppDispatch, RootState } from '../../../store/store';
import type { Booking, StayUpdate } from '@pet-management/shared';

interface UploadStayUpdateProps {
  open: boolean;
  onClose: () => void;
  booking: Booking;
}

export const UploadStayUpdate: React.FC<UploadStayUpdateProps> = ({ open, onClose, booking }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { submitting, error } = useSelector((state: RootState) => state.staff);
  const [type, setType] = useState<StayUpdate['type']>('note');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPhotos([...photos, ...files]);

      // Create previews
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!content.trim() && photos.length === 0) {
      return;
    }

    try {
      await dispatch(
        uploadStayUpdate({
          bookingId: booking.id,
          staffId: user.uid,
          staffName: user.displayName || user.email || 'Staff Member',
          type,
          content: content.trim() || undefined,
          photos: photos.length > 0 ? photos : undefined,
        })
      ).unwrap();

      // Reset form
      setType('note');
      setContent('');
      setPhotos([]);
      setPhotoPreviews([]);
      onClose();
    } catch (error) {
      // Error is handled by Redux
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
      setType('note');
      setContent('');
      setPhotos([]);
      setPhotoPreviews([]);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Upload Stay Update</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Update Type</InputLabel>
            <Select value={type} label="Update Type" onChange={(e) => setType(e.target.value as StayUpdate['type'])}>
              <MenuItem value="photo">Photo</MenuItem>
              <MenuItem value="note">Note</MenuItem>
              <MenuItem value="meal">Meal</MenuItem>
              <MenuItem value="activity">Activity</MenuItem>
              <MenuItem value="health">Health</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TextField
          fullWidth
          label="Update Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          margin="normal"
          multiline
          rows={4}
          disabled={submitting}
          placeholder="Describe the update..."
        />

        <Box sx={{ mt: 2, mb: 2 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="photo-upload"
            type="file"
            multiple
            onChange={handlePhotoChange}
          />
          <label htmlFor="photo-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<PhotoCamera />}
              disabled={submitting}
            >
              Add Photos
            </Button>
          </label>
        </Box>

        {photoPreviews.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Photos ({photos.length})
            </Typography>
            <Grid container spacing={2}>
              {photoPreviews.map((preview, index) => (
                <Grid item xs={6} sm={4} key={index}>
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: 150,
                        objectFit: 'cover',
                        borderRadius: 1,
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                      }}
                      onClick={() => removePhoto(index)}
                      disabled={submitting}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || (!content.trim() && photos.length === 0)}
        >
          {submitting ? <CircularProgress size={20} /> : 'Upload Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

