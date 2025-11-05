import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { CloudUpload, Close } from '@mui/icons-material';
import { uploadVaccineDocument, clearError } from '../../../../store/slices/medicalRecordSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import type { MedicalRecord } from '@pet-management/shared';

interface UploadVaccineDocumentProps {
  open: boolean;
  onClose: () => void;
  petId: string;
}

export const UploadVaccineDocument: React.FC<UploadVaccineDocumentProps> = ({
  open,
  onClose,
  petId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { uploading, error } = useSelector((state: RootState) => state.medicalRecords);
  const { user } = useSelector((state: RootState) => state.auth);

  const [recordType, setRecordType] = useState<MedicalRecord['recordType']>('vaccination');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clinicName, setClinicName] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    dispatch(clearError());

    try {
      await dispatch(
        uploadVaccineDocument({
          petId,
          petOwnerId: user.uid,
          file,
          recordType,
          date: new Date(date).getTime(),
          clinicName: clinicName || undefined,
          notes: notes || undefined,
        })
      ).unwrap();

      // Reset form and close dialog
      setFile(null);
      setFileName('');
      setRecordType('vaccination');
      setDate(new Date().toISOString().split('T')[0]);
      setClinicName('');
      setNotes('');
      onClose();
    } catch (err) {
      // Error handled by Redux state
    }
  };

  const handleClose = () => {
    dispatch(clearError());
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Upload Vaccine Document</Typography>
          <Button onClick={handleClose} size="small">
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>Record Type</InputLabel>
            <Select
              value={recordType}
              label="Record Type"
              onChange={(e) => setRecordType(e.target.value as MedicalRecord['recordType'])}
            >
              <MenuItem value="vaccination">Vaccination</MenuItem>
              <MenuItem value="checkup">Checkup</MenuItem>
              <MenuItem value="treatment">Treatment</MenuItem>
              <MenuItem value="surgery">Surgery</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
            sx={{ mb: 2 }}
          />

          <TextField
            label="Clinic Name"
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ py: 2 }}
            >
              {fileName || 'Select Document (PDF or Image)'}
              <input
                type="file"
                hidden
                accept=".pdf,image/*"
                onChange={handleFileChange}
                required
              />
            </Button>
            {fileName && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {fileName} ({((file?.size || 0) / 1024).toFixed(2)} KB)
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={uploading || !file}
            startIcon={uploading ? <CircularProgress size={16} /> : <CloudUpload />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

