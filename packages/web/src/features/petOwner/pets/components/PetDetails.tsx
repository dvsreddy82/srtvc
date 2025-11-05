import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import { ArrowBack, Edit } from '@mui/icons-material';
import { loadPetById, clearError } from '../../../../store/slices/petSlice';
import { MedicalRecordsList } from './MedicalRecordsList';
import { UploadVaccineDocument } from './UploadVaccineDocument';
import { VaccineSchedule } from './VaccineSchedule';
import type { AppDispatch, RootState } from '../../../../store/store';
import { format } from 'date-fns';

export const PetDetails: React.FC = () => {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentPet, loading, error } = useSelector((state: RootState) => state.pets);
  const { user } = useSelector((state: RootState) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    if (petId && user) {
      dispatch(loadPetById({ petId, ownerId: user.uid }));
    }
  }, [dispatch, petId, user]);

  if (loading) {
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

  if (!currentPet) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="info">Pet not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/pets')}
        >
          Back
        </Button>
        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={() => navigate(`/pets/${petId}/edit`)}
        >
          Edit
        </Button>
      </Box>

      <Card>
        <Box sx={{ position: 'relative', height: 300, bgcolor: 'grey.200' }}>
          {currentPet.photoURL ? (
            <Box
              component="img"
              src={currentPet.photoURL}
              alt={currentPet.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Avatar sx={{ width: 150, height: 150 }}>
                {currentPet.name.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
          )}
        </Box>

        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            {currentPet.name}
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Species
              </Typography>
              <Chip
                label={currentPet.species.charAt(0).toUpperCase() + currentPet.species.slice(1)}
                sx={{ mt: 0.5 }}
              />
            </Grid>

            {currentPet.breed && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Breed
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {currentPet.breed}
                </Typography>
              </Grid>
            )}

            {currentPet.dateOfBirth && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Date of Birth
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {format(new Date(currentPet.dateOfBirth), 'MMMM dd, yyyy')}
                </Typography>
              </Grid>
            )}

            {currentPet.weight && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Weight
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {currentPet.weight} kg
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs for Pet Info, Vaccine Schedule, and Medical Records */}
      <Box sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Pet Information" />
          <Tab label="Vaccine Schedule" />
          <Tab label="Medical Records" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ mt: 2 }}>
            {/* Pet information is already shown above */}
          </Box>
        )}

        {tabValue === 1 && currentPet && (
          <Box sx={{ mt: 2 }}>
            <VaccineSchedule pet={currentPet} />
          </Box>
        )}

        {tabValue === 2 && petId && (
          <Box sx={{ mt: 2 }}>
            <MedicalRecordsList
              petId={petId}
              onUploadClick={() => setUploadDialogOpen(true)}
            />
          </Box>
        )}
      </Box>

      {/* Upload Document Dialog */}
      {petId && (
        <UploadVaccineDocument
          open={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          petId={petId}
        />
      )}
    </Box>
  );
};

