import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { Logout, Pets, BookOnline, Receipt } from '@mui/icons-material';
import { logout } from '../../../store/slices/authSlice';
import type { AppDispatch, RootState } from '../../../store/store';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, profile } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Pet Management
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Welcome back, {profile?.displayName || user?.email}!
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Pets sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" component="h2">
                  My Pets
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage your pets and their information
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate('/pets')}>
                  View Pets
                </Button>
                <Button size="small" onClick={() => navigate('/pets/add')}>
                  Add Pet
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <BookOnline sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" component="h2">
                  Bookings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View and manage your bookings
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate('/bookings')}>
                  View Bookings
                </Button>
                <Button size="small" onClick={() => navigate('/bookings/search')}>
                  Search Kennels
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Receipt sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" component="h2">
                  Invoices
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View your invoices and payment history
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate('/invoices')}>
                  View Invoices
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

