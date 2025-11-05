import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
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
  Avatar,
  IconButton,
} from '@mui/material';
import { Refresh, PhotoLibrary, Note, Restaurant, FitnessCenter, LocalHospital } from '@mui/icons-material';
import { FixedSizeList as List } from 'react-window';
import { loadStayUpdates, syncStayUpdates, clearError, addUpdate } from '../../../../store/slices/stayUpdateSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import { format, formatDistanceToNow } from 'date-fns';
import type { StayUpdate } from '@pet-management/shared';
import { stayUpdateService } from '@pet-management/shared';

export const StayUpdates: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { updates, loading, error, syncing } = useSelector((state: RootState) => state.stayUpdates);
  const bookingUpdates = bookingId ? updates[bookingId] || [] : [];
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const syncIntervalRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (bookingId) {
      // Load initial updates
      dispatch(loadStayUpdates(bookingId));

      // Start periodic sync (every 15 minutes)
      syncIntervalRef.current = stayUpdateService.startPeriodicSync(bookingId, (newUpdates) => {
        // Update Redux state with new updates
        dispatch({ type: 'stayUpdates/loadStayUpdates/fulfilled', payload: { bookingId, updates: newUpdates } });
      });
    }

    return () => {
      // Cleanup interval on unmount
      if (syncIntervalRef.current) {
        syncIntervalRef.current();
      }
    };
  }, [dispatch, bookingId]);

  const handleManualSync = () => {
    if (bookingId) {
      dispatch(syncStayUpdates(bookingId));
    }
  };

  const getUpdateIcon = (type: StayUpdate['type']) => {
    switch (type) {
      case 'photo':
        return <PhotoLibrary />;
      case 'note':
        return <Note />;
      case 'meal':
        return <Restaurant />;
      case 'activity':
        return <FitnessCenter />;
      case 'health':
        return <LocalHospital />;
      default:
        return <Note />;
    }
  };

  const getUpdateColor = (type: StayUpdate['type']) => {
    switch (type) {
      case 'photo':
        return 'primary';
      case 'note':
        return 'default';
      case 'meal':
        return 'warning';
      case 'activity':
        return 'success';
      case 'health':
        return 'error';
      default:
        return 'default';
    }
  };

  // Paginated updates
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUpdates = bookingUpdates.slice(startIndex, endIndex);
  const totalPages = Math.ceil(bookingUpdates.length / pageSize);

  if (loading && bookingUpdates.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
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

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Stay Updates</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {syncing[bookingId || ''] && (
            <CircularProgress size={20} />
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={handleManualSync}
            disabled={syncing[bookingId || '']}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {bookingUpdates.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            padding: 4,
            border: '2px dashed #ccc',
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No stay updates yet. Updates will appear here as staff shares photos and notes during your pet's stay.
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {paginatedUpdates.map((update) => (
              <Grid item xs={12} key={update.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar sx={{ bgcolor: `${getUpdateColor(update.type)}.main` }}>
                        {getUpdateIcon(update.type)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Box>
                            <Chip
                              label={update.type}
                              color={getUpdateColor(update.type) as any}
                              size="small"
                              sx={{ mb: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {format(new Date(update.timestamp), 'MMM dd, yyyy h:mm a')} •{' '}
                              {formatDistanceToNow(new Date(update.timestamp), { addSuffix: true })}
                            </Typography>
                            {update.staffName && (
                              <Typography variant="caption" color="text.secondary">
                                by {update.staffName}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {update.content && (
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {update.content}
                          </Typography>
                        )}

                        {update.photoURLs && update.photoURLs.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                            {update.photoURLs.map((url, index) => (
                              <Box
                                key={index}
                                component="img"
                                src={url}
                                alt={`Stay update photo ${index + 1}`}
                                sx={{
                                  width: 150,
                                  height: 150,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                  cursor: 'pointer',
                                  '&:hover': {
                                    opacity: 0.8,
                                  },
                                }}
                                onClick={() => window.open(url, '_blank')}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
              <Button
                variant="outlined"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                Page {page} of {totalPages}
              </Typography>
              <Button
                variant="outlined"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

