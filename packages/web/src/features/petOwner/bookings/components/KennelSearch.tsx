import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Rating,
  Paper,
} from '@mui/material';
import { Search, LocationOn, AttachMoney, Pets } from '@mui/icons-material';
import { searchKennels, clearError, clearResults } from '../../../../store/slices/kennelSlice';
import { loadKennelRating } from '../../../../store/slices/reviewSlice';
import { ReviewsList } from './ReviewsList';
import type { AppDispatch, RootState } from '../../../../store/store';
import type { KennelSearchFilters } from '@pet-management/shared';
import { format } from 'date-fns';

export const KennelSearch: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { searchResults, loading, error, filters } = useSelector((state: RootState) => state.kennels);
  const { pets } = useSelector((state: RootState) => state.pets);
  const { kennelRatings } = useSelector((state: RootState) => state.reviews);
  const [selectedKennelId, setSelectedKennelId] = useState<string | null>(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [petId, setPetId] = useState('');
  const [sizeCategory, setSizeCategory] = useState<string>('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      dispatch({ type: 'kennels/setError', payload: 'Please select check-in and check-out dates' });
      return;
    }

    const searchFilters: KennelSearchFilters = {
      startDate: new Date(startDate).getTime(),
      endDate: new Date(endDate).getTime(),
      sizeCategory: sizeCategory as any,
      city: city || undefined,
      state: state || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    };

    dispatch(searchKennels(searchFilters));
  };

  // Load ratings for search results
  useEffect(() => {
    searchResults.forEach((result) => {
      if (!kennelRatings[result.kennel.id]) {
        dispatch(loadKennelRating(result.kennel.id));
      }
    });
  }, [dispatch, searchResults, kennelRatings]);

  const handleSelectRun = (kennelId: string, runId: string) => {
    if (!startDate || !endDate || !petId) {
      dispatch({ type: 'kennels/setError', payload: 'Please select dates and pet' });
      return;
    }

    navigate(`/bookings/create`, {
      state: {
        kennelId,
        runId,
        petId,
        startDate: new Date(startDate).getTime(),
        endDate: new Date(endDate).getTime(),
      },
    });
  };

  // Get selected pet to determine size category
  const selectedPet = pets.find((p) => p.id === petId);
  const suggestedSizeCategory = selectedPet?.species === 'dog' 
    ? (selectedPet.weight && selectedPet.weight > 25 ? 'large' : selectedPet.weight && selectedPet.weight > 10 ? 'medium' : 'small')
    : selectedPet?.species === 'cat' ? 'small' : undefined;

  // Pagination
  const pageSize = 20;
  const startIndex = 0;
  const endIndex = startIndex + pageSize;
  const paginatedResults = searchResults.slice(startIndex, endIndex);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Search Available Kennels
      </Typography>

      {/* Search Form */}
      <Paper sx={{ padding: 3, mb: 3 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Check-in Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Check-out Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Select Pet</InputLabel>
                <Select
                  value={petId}
                  label="Select Pet"
                  onChange={(e) => {
                    setPetId(e.target.value);
                    if (suggestedSizeCategory) {
                      setSizeCategory(suggestedSizeCategory);
                    }
                  }}
                >
                  {pets.map((pet) => (
                    <MenuItem key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Size Category</InputLabel>
                <Select
                  value={sizeCategory}
                  label="Size Category"
                  onChange={(e) => setSizeCategory(e.target.value)}
                >
                  <MenuItem value="">All Sizes</MenuItem>
                  <MenuItem value="small">Small</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="large">Large</MenuItem>
                  <MenuItem value="extra-large">Extra Large</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Min Price (per day)"
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Max Price (per day)"
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search Kennels'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {searchResults.length} Kennel(s) Found
          </Typography>

          {paginatedResults.map((result) => (
            <Card key={result.kennel.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {result.kennel.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {result.kennel.address}, {result.kennel.city}
                        {result.kennel.state && `, ${result.kennel.state}`}
                      </Typography>
                    </Box>
                    {(() => {
                      const rating = kennelRatings[result.kennel.id];
                      if (rating && rating.count > 0) {
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating value={rating.average} readOnly size="small" />
                            <Typography variant="body2" color="text.secondary">
                              {rating.average.toFixed(1)} ({rating.count} {rating.count === 1 ? 'review' : 'reviews'})
                            </Typography>
                          </Box>
                        );
                      }
                      return null;
                    })()}
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" color="primary">
                      ${result.totalPrice.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total for{' '}
                      {filters &&
                        Math.ceil(
                          (filters.endDate - filters.startDate) / (24 * 60 * 60 * 1000)
                        )}{' '}
                      days
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {result.kennel.description}
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  Available Runs ({result.availableRuns.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {result.availableRuns.map((run) => (
                    <Card
                      key={run.id}
                      variant="outlined"
                      sx={{
                        p: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => handleSelectRun(result.kennel.id, run.id)}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        {run.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {run.sizeCategory} • ${run.pricePerDay}/day
                      </Typography>
                      <Typography variant="caption" color="success.main" display="block">
                        {run.available} available
                      </Typography>
                    </Card>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (result.availableRuns.length > 0) {
                        handleSelectRun(result.kennel.id, result.availableRuns[0].id);
                      }
                    }}
                    disabled={result.availableRuns.length === 0}
                  >
                    Book Now
                  </Button>
                  {kennelRatings[result.kennel.id]?.count > 0 && (
                    <Button
                      variant="outlined"
                      onClick={() => setSelectedKennelId(
                        selectedKennelId === result.kennel.id ? null : result.kennel.id
                      )}
                    >
                      {selectedKennelId === result.kennel.id ? 'Hide Reviews' : 'View Reviews'}
                    </Button>
                  )}
                </Box>
                {selectedKennelId === result.kennel.id && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                    <ReviewsList kennelId={result.kennel.id} />
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {searchResults.length === 0 && !loading && filters && (
        <Alert severity="info">No kennels found matching your criteria. Try adjusting your search filters.</Alert>
      )}
    </Box>
  );
};

