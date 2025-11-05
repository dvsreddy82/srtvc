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
import { Add, Edit } from '@mui/icons-material';
import { loadStaffAssignments, saveStaffAssignment, clearError } from '../../../store/slices/staffManagementSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import type { StaffAssignment } from '@pet-management/shared';

export const StaffManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { kennels } = useSelector((state: RootState) => state.kennels);
  const { assignments, loading, error, saving } = useSelector((state: RootState) => state.staffManagement);
  const [selectedKennelId, setSelectedKennelId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<StaffAssignment | null>(null);
  const [formData, setFormData] = useState({
    staffId: '',
    role: 'staff' as 'staff' | 'manager',
  });

  useEffect(() => {
    if (selectedKennelId) {
      dispatch(loadStaffAssignments(selectedKennelId));
    }
  }, [dispatch, selectedKennelId]);

  const handleOpenDialog = (assignment?: StaffAssignment) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        staffId: assignment.staffId,
        role: assignment.role,
      });
    } else {
      setEditingAssignment(null);
      setFormData({
        staffId: '',
        role: 'staff',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAssignment(null);
  };

  const handleSubmit = async () => {
    if (!user || !selectedKennelId) return;

    const assignmentData = editingAssignment
      ? { ...editingAssignment, ...formData }
      : { ...formData, kennelId: selectedKennelId };

    await dispatch(
      saveStaffAssignment({
        assignment: assignmentData,
        userId: user.uid,
      })
    ).unwrap();

    handleCloseDialog();
  };

  const kennelAssignments = selectedKennelId ? assignments[selectedKennelId] || [] : [];

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Staff Management
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
            <Typography variant="h6">Staff Assignments</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Assign Staff
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
                    <TableCell>Staff ID</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {kennelAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No staff assigned. Click "Assign Staff" to add.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    kennelAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>{assignment.staffId}</TableCell>
                        <TableCell>
                          <Chip label={assignment.role} size="small" color={assignment.role === 'manager' ? 'primary' : 'default'} />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(assignment)}
                            disabled={saving}
                          >
                            <Edit />
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
        <DialogTitle>{editingAssignment ? 'Edit Assignment' : 'Assign Staff'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Staff User ID"
            value={formData.staffId}
            onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
            margin="normal"
            required
            helperText="Enter the user ID of the staff member"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'staff' | 'manager' })}
            >
              <MenuItem value="staff">Staff</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={saving || !formData.staffId}
          >
            {saving ? <CircularProgress size={20} /> : editingAssignment ? 'Update' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

