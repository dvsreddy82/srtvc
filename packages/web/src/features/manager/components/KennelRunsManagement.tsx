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
import { Add, Edit, Delete } from '@mui/icons-material';
import { loadKennelRuns, saveKennelRun, deleteKennelRun, clearError } from '../../../store/slices/managerSlice';
import type { AppDispatch, RootState } from '../../../store/store';
import type { KennelRun } from '@pet-management/shared';

export const KennelRunsManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { kennels } = useSelector((state: RootState) => state.kennels);
  const { kennelRuns, loading, error, saving } = useSelector((state: RootState) => state.manager);
  const [selectedKennelId, setSelectedKennelId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRun, setEditingRun] = useState<KennelRun | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    size: 'small' as KennelRun['size'],
    capacity: 1,
    pricePerNight: 0,
  });

  useEffect(() => {
    if (selectedKennelId) {
      dispatch(loadKennelRuns(selectedKennelId));
    }
  }, [dispatch, selectedKennelId]);

  const handleOpenDialog = (run?: KennelRun) => {
    if (run) {
      setEditingRun(run);
      setFormData({
        name: run.name,
        size: run.size,
        capacity: run.capacity,
        pricePerNight: run.pricePerNight,
      });
    } else {
      setEditingRun(null);
      setFormData({
        name: '',
        size: 'small',
        capacity: 1,
        pricePerNight: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRun(null);
  };

  const handleSubmit = async () => {
    if (!user || !selectedKennelId) return;

    const runData = editingRun
      ? { ...editingRun, ...formData }
      : { ...formData, kennelId: selectedKennelId };

    await dispatch(
      saveKennelRun({
        kennelId: selectedKennelId,
        run: runData,
        userId: user.uid,
      })
    ).unwrap();

    handleCloseDialog();
  };

  const handleDelete = async (runId: string) => {
    if (!user || !selectedKennelId) return;
    if (!window.confirm('Are you sure you want to delete this run?')) return;

    await dispatch(
      deleteKennelRun({
        runId,
        kennelId: selectedKennelId,
        userId: user.uid,
      })
    ).unwrap();
  };

  const runs = selectedKennelId ? kennelRuns[selectedKennelId] || [] : [];

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Manage Kennel Runs
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel>Select Kennel</InputLabel>
            <Select
              value={selectedKennelId}
              label="Select Kennel"
              onChange={(e) => setSelectedKennelId(e.target.value)}
            >
              {kennels.map((kennel) => (
                <MenuItem key={kennel.id} value={kennel.id}>
                  {kennel.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {selectedKennelId && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Runs for Selected Kennel</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Run
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Capacity</TableCell>
                    <TableCell>Price per Night</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {runs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No runs configured. Click "Add Run" to create one.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    runs.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell>{run.name}</TableCell>
                        <TableCell>
                          <Chip label={run.size} size="small" />
                        </TableCell>
                        <TableCell>{run.capacity}</TableCell>
                        <TableCell>${run.pricePerNight.toFixed(2)}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(run)}
                            disabled={saving}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(run.id)}
                            disabled={saving}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRun ? 'Edit Run' : 'Add New Run'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Run Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Size</InputLabel>
            <Select
              value={formData.size}
              label="Size"
              onChange={(e) => setFormData({ ...formData, size: e.target.value as KennelRun['size'] })}
            >
              <MenuItem value="small">Small</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="large">Large</MenuItem>
              <MenuItem value="giant">Giant</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
            margin="normal"
            required
            inputProps={{ min: 1 }}
          />
          <TextField
            fullWidth
            label="Price per Night ($)"
            type="number"
            value={formData.pricePerNight}
            onChange={(e) => setFormData({ ...formData, pricePerNight: parseFloat(e.target.value) || 0 })}
            margin="normal"
            required
            inputProps={{ min: 0, step: 0.01 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={saving || !formData.name || formData.capacity < 1}
          >
            {saving ? <CircularProgress size={20} /> : editingRun ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

