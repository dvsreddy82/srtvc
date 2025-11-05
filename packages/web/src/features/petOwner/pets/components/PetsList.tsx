import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { FixedSizeList as List } from 'react-window';
import { loadPets, clearError } from '../../../store/slices/petSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import type { Pet } from '@pet-management/shared';

export const PetsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { pets, loading, error } = useSelector((state: RootState) => state.pets);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(loadPets(user.uid));
    }
  }, [dispatch, user]);

  if (loading && pets.length === 0) {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Pets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/pets/add')}
        >
          Add Pet
        </Button>
      </Box>

      {pets.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            padding: 4,
            border: '2px dashed #ccc',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No pets yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/pets/add')}
            sx={{ mt: 2 }}
          >
            Add Your First Pet
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {pets.map((pet) => (
            <Grid item xs={12} sm={6} md={4} key={pet.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
                onClick={() => navigate(`/pets/${pet.id}`)}
              >
                {pet.photoURL ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={pet.photoURL}
                    alt={pet.name}
                    sx={{ objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.200',
                    }}
                  >
                    <Avatar sx={{ width: 100, height: 100 }}>
                      {pet.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </Box>
                )}
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {pet.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
                    {pet.breed && ` • ${pet.breed}`}
                  </Typography>
                  {pet.weight && (
                    <Typography variant="body2" color="text.secondary">
                      {pet.weight} kg
                    </Typography>
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

