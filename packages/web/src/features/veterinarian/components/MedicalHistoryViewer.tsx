import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Search, Visibility } from '@mui/icons-material';
import { getMedicalHistory, clearError } from '../../../store/slices/veterinarianSlice';
import { SubmitMedicalRecord } from './SubmitMedicalRecord';
import type { AppDispatch, RootState } from '../../../../store/store';
import { format } from 'date-fns';
import type { MedicalRecord } from '@pet-management/shared';

export const MedicalHistoryViewer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { medicalHistory, loading, error } = useSelector((state: RootState) => state.veterinarian);
  const [petId, setPetId] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  // TODO: Get from veterinarian profile
  const veterinarianId = user?.uid || '';
  const clinicId = ''; // TODO: Get from veterinarian profile
  const clinicName = ''; // TODO: Get from veterinarian profile

  const handleSearch = () => {
    if (petId) {
      dispatch(getMedicalHistory({ petId, veterinarianId, clinicId }));
    }
  };

  const records = petId ? medicalHistory[petId] || [] : [];

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Medical History Viewer
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Pet ID"
              value={petId}
              onChange={(e) => setPetId(e.target.value)}
              placeholder="Enter pet ID to view medical history"
            />
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleSearch}
              disabled={loading || !petId}
            >
              {loading ? <CircularProgress size={20} /> : 'Search'}
            </Button>
            {petId && (
              <Button
                variant="outlined"
                onClick={() => setSubmitDialogOpen(true)}
              >
                Submit New Record
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {loading && records.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
          <CircularProgress />
        </Box>
      ) : records.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Clinic</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Documents</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {format(new Date(record.date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Chip label={record.recordType} size="small" />
                  </TableCell>
                  <TableCell>{record.clinicName || 'N/A'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {record.notes || 'No notes'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {record.documents && record.documents.length > 0 ? (
                      <Typography variant="body2" color="primary">
                        {record.documents.length} document(s)
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No documents
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => {
                        setSelectedRecord(record);
                        setRecordDialogOpen(true);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : petId ? (
        <Alert severity="info">
          No medical records found for this pet. Make sure you have consent from the pet owner.
        </Alert>
      ) : null}

      {/* Record Detail Dialog */}
      {selectedRecord && (
        <Dialog open={recordDialogOpen} onClose={() => setRecordDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Medical Record Details</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Date
              </Typography>
              <Typography variant="body1">
                {format(new Date(selectedRecord.date), 'MMMM dd, yyyy')}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Type
              </Typography>
              <Chip label={selectedRecord.recordType} size="small" />
            </Box>
            {selectedRecord.clinicName && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Clinic
                </Typography>
                <Typography variant="body1">{selectedRecord.clinicName}</Typography>
              </Box>
            )}
            {selectedRecord.notes && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Notes
                </Typography>
                <Typography variant="body1">{selectedRecord.notes}</Typography>
              </Box>
            )}
            {selectedRecord.documents && selectedRecord.documents.length > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Documents
                </Typography>
                {selectedRecord.documents.map((url, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    size="small"
                    onClick={() => window.open(url, '_blank')}
                    sx={{ mr: 1, mb: 1 }}
                  >
                    Document {index + 1}
                  </Button>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRecordDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Submit Record Dialog */}
      {petId && (
        <SubmitMedicalRecord
          open={submitDialogOpen}
          onClose={() => setSubmitDialogOpen(false)}
          petId={petId}
          veterinarianId={veterinarianId}
          clinicId={clinicId}
          clinicName={clinicName}
        />
      )}
    </Box>
  );
};

