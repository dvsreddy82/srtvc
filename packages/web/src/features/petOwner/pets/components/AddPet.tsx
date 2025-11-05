import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  Avatar,
} from '@mui/material';
import { createPet, clearError } from '../../../store/slices/petSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import type { Pet } from '@pet-management/shared';

export const AddPet: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.pets);
  const { user } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<'dog' | 'cat' | 'bird' | 'rabbit' | 'other'>('dog');
  const [breed, setBreed] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [weight, setWeight] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    dispatch(clearError());

    try {
      const petData: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'> = {
        ownerId: user.uid,
        name,
        species,
        breed: breed || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).getTime() : undefined,
        weight: weight ? parseFloat(weight) : undefined,
      };

      await dispatch(
        createPet({
          pet: petData,
          photoFile: photoFile || undefined,
        })
      ).unwrap();

      navigate('/pets');
    } catch (err) {
      // Error handled by Redux state
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        maxWidth: 600,
        margin: '0 auto',
        padding: 3,
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Add New Pet
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Photo Upload */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        {photoPreview ? (
          <Avatar
            src={photoPreview}
            sx={{ width: 150, height: 150 }}
          />
        ) : (
          <Avatar sx={{ width: 150, height: 150 }}>Pet Photo</Avatar>
        )}
        <Button variant="outlined" component="label">
          {photoFile ? 'Change Photo' : 'Upload Photo'}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handlePhotoChange}
          />
        </Button>
        {photoFile && (
          <Typography variant="caption" color="text.secondary">
            {photoFile.name} ({(photoFile.size / 1024).toFixed(2)} KB)
          </Typography>
        )}
      </Box>

      <TextField
        label="Pet Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        fullWidth
      />

      <FormControl fullWidth required>
        <InputLabel>Species</InputLabel>
        <Select
          value={species}
          label="Species"
          onChange={(e) => setSpecies(e.target.value as Pet['species'])}
        >
          <MenuItem value="dog">Dog</MenuItem>
          <MenuItem value="cat">Cat</MenuItem>
          <MenuItem value="bird">Bird</MenuItem>
          <MenuItem value="rabbit">Rabbit</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Breed"
        value={breed}
        onChange={(e) => setBreed(e.target.value)}
        fullWidth
      />

      <TextField
        label="Date of Birth"
        type="date"
        value={dateOfBirth}
        onChange={(e) => setDateOfBirth(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />

      <TextField
        label="Weight (kg)"
        type="number"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        inputProps={{ step: 0.1, min: 0 }}
        fullWidth
      />

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          type="button"
          variant="outlined"
          fullWidth
          onClick={() => navigate('/pets')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading || !name}
        >
          {loading ? <CircularProgress size={24} /> : 'Add Pet'}
        </Button>
      </Box>
    </Box>
  );
};

