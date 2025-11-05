import React, { useEffect } from 'react';
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
  Link,
} from '@mui/material';
import { Add as AddIcon, CloudDownload } from '@mui/icons-material';
import { loadMedicalRecords, clearError } from '../../../store/slices/medicalRecordSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import { format } from 'date-fns';
import type { MedicalRecord } from '@pet-management/shared';

interface MedicalRecordsListProps {
  petId: string;
  onUploadClick: () => void;
}

export const MedicalRecordsList: React.FC<MedicalRecordsListProps> = ({
  petId,
  onUploadClick,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { records, loading, error } = useSelector(
    (state: RootState) => state.medicalRecords
  );

  useEffect(() => {
    if (petId) {
      dispatch(loadMedicalRecords(petId));
    }
  }, [dispatch, petId]);

  if (loading && records.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 2 }}>
        <Alert severity="error" onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      </Box>
    );
  }

  const getRecordTypeColor = (type: MedicalRecord['recordType']) => {
    switch (type) {
      case 'vaccination':
        return 'success';
      case 'checkup':
        return 'info';
      case 'treatment':
        return 'warning';
      case 'surgery':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Medical Records</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={onUploadClick}
        >
          Upload Document
        </Button>
      </Box>

      {records.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            padding: 3,
            border: '2px dashed #ccc',
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            No medical records yet
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={onUploadClick}
            sx={{ mt: 1 }}
          >
            Upload First Document
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {records.map((record) => (
            <Grid item xs={12} key={record.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {record.recordType.charAt(0).toUpperCase() + record.recordType.slice(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(record.date), 'MMMM dd, yyyy')}
                      </Typography>
                    </Box>
                    <Chip
                      label={record.recordType}
                      color={getRecordTypeColor(record.recordType) as any}
                      size="small"
                    />
                  </Box>

                  {record.clinicName && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Clinic: {record.clinicName}
                    </Typography>
                  )}

                  {record.notes && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {record.notes}
                    </Typography>
                  )}

                  {record.documents && record.documents.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      {record.documents.map((docUrl, index) => (
                        <Button
                          key={index}
                          variant="outlined"
                          size="small"
                          startIcon={<CloudDownload />}
                          component={Link}
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ mr: 1, mb: 1 }}
                        >
                          View Document {index + 1}
                        </Button>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

