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
  TextField,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
} from '@mui/material';
import { Search, Edit, VpnKey } from '@mui/icons-material';
import {
  loadUsers,
  searchUsers,
  loadUser,
  updateUserRole,
  requestPasswordReset,
  clearError,
} from '../../../store/slices/userManagementSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import { format } from 'date-fns';

export const UserManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { users, currentUser, loading, error, saving } = useSelector(
    (state: RootState) => state.userManagement
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    dispatch(loadUsers(100));
  }, [dispatch]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      dispatch(searchUsers(searchTerm));
    } else {
      dispatch(loadUsers(100));
    }
  };

  const handleUpdateRole = async (userId: string, currentRole: string) => {
    setSelectedUserId(userId);
    setNewRole(currentRole);
    setRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!user) return;
    await dispatch(updateUserRole({ userId: selectedUserId, role: newRole, adminId: user.uid })).unwrap();
    setRoleDialogOpen(false);
    dispatch(loadUsers(100));
  };

  const handlePasswordReset = async (userEmail: string) => {
    if (!user) return;
    if (!window.confirm('Send password reset email to this user?')) return;
    await dispatch(requestPasswordReset({ email: userEmail, adminId: user.uid })).unwrap();
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
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
              label="Search Users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by email or name..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Button variant="contained" startIcon={<Search />} onClick={handleSearch} disabled={loading}>
              Search
            </Button>
          </Box>
        </CardContent>
      </Card>

      {loading && users.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((userItem) => (
                <TableRow key={userItem.uid}>
                  <TableCell>{userItem.email}</TableCell>
                  <TableCell>{userItem.displayName || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip label={userItem.role || 'petOwner'} size="small" />
                  </TableCell>
                  <TableCell>
                    {userItem.createdAt
                      ? format(new Date(userItem.createdAt), 'MMM dd, yyyy')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleUpdateRole(userItem.uid, userItem.role || 'petOwner')}
                        disabled={saving}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handlePasswordReset(userItem.email || '')}
                        disabled={saving}
                        color="primary"
                      >
                        <VpnKey />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Role Update Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update User Role</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select value={newRole} label="Role" onChange={(e) => setNewRole(e.target.value)}>
              <MenuItem value="petOwner">Pet Owner</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="veterinarian">Veterinarian</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <Alert severity="info" sx={{ mt: 2 }}>
            Custom claims will be updated via Cloud Function. The user may need to sign out and sign in again for changes to take effect.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSaveRole} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Update Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

