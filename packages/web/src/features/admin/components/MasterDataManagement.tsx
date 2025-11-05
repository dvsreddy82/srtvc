import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { loadBreeds, loadVaccineTypes, saveBreed, saveVaccineType, clearError } from '../../../store/slices/adminSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import type { Breed, VaccineType } from '@pet-management/shared';

export const MasterDataManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { breeds, vaccineTypes, loading, error, saving } = useSelector((state: RootState) => state.admin);
  const [tabValue, setTabValue] = useState(0);
  const [breedDialogOpen, setBreedDialogOpen] = useState(false);
  const [vaccineTypeDialogOpen, setVaccineTypeDialogOpen] = useState(false);
  const [editingBreed, setEditingBreed] = useState<Breed | null>(null);
  const [editingVaccineType, setEditingVaccineType] = useState<VaccineType | null>(null);
  const [breedForm, setBreedForm] = useState({ species: 'dog', name: '' });
  const [vaccineTypeForm, setVaccineTypeForm] = useState({ name: '', species: [] as string[], description: '' });

  useEffect(() => {
    dispatch(loadBreeds());
    dispatch(loadVaccineTypes());
  }, [dispatch]);

  const handleSaveBreed = async () => {
    if (!user) return;

    const breedData = editingBreed
      ? { ...editingBreed, ...breedForm }
      : { ...breedForm, isActive: true };

    await dispatch(saveBreed({ breed: breedData, adminId: user.uid })).unwrap();
    setBreedDialogOpen(false);
    setEditingBreed(null);
    setBreedForm({ species: 'dog', name: '' });
    dispatch(loadBreeds());
  };

  const handleSaveVaccineType = async () => {
    if (!user) return;

    const vaccineTypeData = editingVaccineType
      ? { ...editingVaccineType, ...vaccineTypeForm, species: vaccineTypeForm.species }
      : { ...vaccineTypeForm, isActive: true };

    await dispatch(saveVaccineType({ vaccineType: vaccineTypeData, adminId: user.uid })).unwrap();
    setVaccineTypeDialogOpen(false);
    setEditingVaccineType(null);
    setVaccineTypeForm({ name: '', species: [], description: '' });
    dispatch(loadVaccineTypes());
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Master Data Management
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label={`Breeds (${breeds.length})`} />
        <Tab label={`Vaccine Types (${vaccineTypes.length})`} />
      </Tabs>

      {tabValue === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Breeds</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditingBreed(null);
                setBreedForm({ species: 'dog', name: '' });
                setBreedDialogOpen(true);
              }}
            >
              Add Breed
            </Button>
          </Box>

          {loading ? (
            <CircularProgress />
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Species</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {breeds.map((breed) => (
                    <TableRow key={breed.id}>
                      <TableCell>{breed.species}</TableCell>
                      <TableCell>{breed.name}</TableCell>
                      <TableCell>
                        <Chip label={breed.isActive ? 'Active' : 'Inactive'} size="small" color={breed.isActive ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingBreed(breed);
                            setBreedForm({ species: breed.species, name: breed.name });
                            setBreedDialogOpen(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Vaccine Types</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditingVaccineType(null);
                setVaccineTypeForm({ name: '', species: [], description: '' });
                setVaccineTypeDialogOpen(true);
              }}
            >
              Add Vaccine Type
            </Button>
          </Box>

          {loading ? (
            <CircularProgress />
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Species</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vaccineTypes.map((vt) => (
                    <TableRow key={vt.id}>
                      <TableCell>{vt.name}</TableCell>
                      <TableCell>{vt.species.join(', ')}</TableCell>
                      <TableCell>{vt.description || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip label={vt.isActive ? 'Active' : 'Inactive'} size="small" color={vt.isActive ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingVaccineType(vt);
                            setVaccineTypeForm({ name: vt.name, species: vt.species, description: vt.description || '' });
                            setVaccineTypeDialogOpen(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Breed Dialog */}
      <Dialog open={breedDialogOpen} onClose={() => setBreedDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBreed ? 'Edit Breed' : 'Add Breed'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Species</InputLabel>
            <Select
              value={breedForm.species}
              label="Species"
              onChange={(e) => setBreedForm({ ...breedForm, species: e.target.value })}
            >
              <MenuItem value="dog">Dog</MenuItem>
              <MenuItem value="cat">Cat</MenuItem>
              <MenuItem value="bird">Bird</MenuItem>
              <MenuItem value="rabbit">Rabbit</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Breed Name"
            value={breedForm.name}
            onChange={(e) => setBreedForm({ ...breedForm, name: e.target.value })}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBreedDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSaveBreed} variant="contained" disabled={saving || !breedForm.name}>
            {saving ? <CircularProgress size={20} /> : editingBreed ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Vaccine Type Dialog */}
      <Dialog open={vaccineTypeDialogOpen} onClose={() => setVaccineTypeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingVaccineType ? 'Edit Vaccine Type' : 'Add Vaccine Type'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Vaccine Name"
            value={vaccineTypeForm.name}
            onChange={(e) => setVaccineTypeForm({ ...vaccineTypeForm, name: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Species</InputLabel>
            <Select
              multiple
              value={vaccineTypeForm.species}
              label="Species"
              onChange={(e) => setVaccineTypeForm({ ...vaccineTypeForm, species: e.target.value as string[] })}
            >
              <MenuItem value="dog">Dog</MenuItem>
              <MenuItem value="cat">Cat</MenuItem>
              <MenuItem value="bird">Bird</MenuItem>
              <MenuItem value="rabbit">Rabbit</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Description"
            value={vaccineTypeForm.description}
            onChange={(e) => setVaccineTypeForm({ ...vaccineTypeForm, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVaccineTypeDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveVaccineType}
            variant="contained"
            disabled={saving || !vaccineTypeForm.name || vaccineTypeForm.species.length === 0}
          >
            {saving ? <CircularProgress size={20} /> : editingVaccineType ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

