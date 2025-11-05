import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import { loadKennelReviews, clearError } from '../../../../store/slices/reviewSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import { format } from 'date-fns';
import type { Review } from '@pet-management/shared';

interface ReviewsListProps {
  kennelId: string;
  ratingFilter?: number;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ kennelId, ratingFilter }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { reviews, loading, error } = useSelector((state: RootState) => state.reviews);
  const kennelReviews = reviews[kennelId] || [];
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    dispatch(loadKennelReviews({ kennelId, rating: ratingFilter }));
  }, [dispatch, kennelId, ratingFilter]);

  // Paginated reviews
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedReviews = kennelReviews.slice(startIndex, endIndex);
  const totalPages = Math.ceil(kennelReviews.length / pageSize);

  if (loading && kennelReviews.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" onClose={() => dispatch(clearError())}>
        {error}
      </Alert>
    );
  }

  if (kennelReviews.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          padding: 3,
          border: '2px dashed #ccc',
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No reviews yet. Be the first to review!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Reviews ({kennelReviews.length})
      </Typography>

      {paginatedReviews.map((review, index) => (
        <React.Fragment key={review.id}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                <Box>
                  <Rating value={review.rating} readOnly size="small" />
                  {review.title && (
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                      {review.title}
                    </Typography>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                </Typography>
              </Box>

              {review.comment && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {review.comment}
                </Typography>
              )}
            </CardContent>
          </Card>
          {index < paginatedReviews.length - 1 && <Divider sx={{ mb: 2 }} />}
        </React.Fragment>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
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
    </Box>
  );
};

