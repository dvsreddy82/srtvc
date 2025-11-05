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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { submitMedicalRecord } from '../../../store/slices/veterinarianSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import type { MedicalRecord } from '@pet-management/shared';

interface SubmitMedicalRecordProps {
  open: boolean;
  onClose: () => void;
  petId: string;
  veterinarianId: string;
  clinicId: string;
  clinicName: string;
}

export const SubmitMedicalRecord: React.FC<SubmitMedicalRecordProps> = ({
  open,
  onClose,
  petId,
  veterinarianId,
  clinicId,
  clinicName,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { submitting, error } = useSelector((state: RootState) => state.veterinarian);
  const [formData, setFormData] = useState({
    recordType: 'checkup' as MedicalRecord['recordType'],
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);

  const handleSubmit = async () => {
    try {
      await dispatch(
        submitMedicalRecord({
          veterinarianId,
          clinicId,
          clinicName,
          medicalRecord: {
            petId,
            recordType: formData.recordType,
            date: new Date(formData.date).getTime(),
            notes: formData.notes.trim() || undefined,
            documents: [], // Documents would be uploaded separately
          },
        })
      ).unwrap();

      // Reset form
      setFormData({
        recordType: 'checkup',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setDocumentFiles([]);
      onClose();
    } catch (error) {
      // Error is handled by Redux
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Submit Medical Record</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Clinic: {clinicName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pet ID: {petId}
          </Typography>
        </Box>

        <FormControl fullWidth margin="normal">
          <InputLabel>Record Type</InputLabel>
          <Select
            value={formData.recordType}
            label="Record Type"
            onChange={(e) => setFormData({ ...formData, recordType: e.target.value as MedicalRecord['recordType'] })}
          >
            <MenuItem value="vaccination">Vaccination</MenuItem>
            <MenuItem value="checkup">Checkup</MenuItem>
            <MenuItem value="treatment">Treatment</MenuItem>
            <MenuItem value="surgery">Surgery</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />

        <TextField
          fullWidth
          label="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          margin="normal"
          multiline
          rows={4}
          disabled={submitting}
          placeholder="Enter medical record details..."
        />

        <Alert severity="info" sx={{ mt: 2 }}>
          Note: Pet owner consent is required. Documents can be uploaded after record creation.
        </Alert>
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
          {submitting ? <CircularProgress size={20} /> : 'Submit Record'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

