import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { reviewService } from '@pet-management/shared';
import type { Review } from '@pet-management/shared';

interface ReviewState {
  reviews: Record<string, Review[]>; // kennelId -> reviews
  userReviews: Review[];
  currentReview: Review | null;
  kennelRatings: Record<string, { average: number; count: number }>; // kennelId -> rating
  loading: boolean;
  error: string | null;
  submitting: boolean;
}

const initialState: ReviewState = {
  reviews: {},
  userReviews: [],
  currentReview: null,
  kennelRatings: {},
  loading: false,
  error: null,
  submitting: false,
};

// Async thunks
export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (
    {
      userId,
      bookingId,
      kennelId,
      rating,
      title,
      comment,
    }: {
      userId: string;
      bookingId: string;
      kennelId: string;
      rating: number;
      title?: string;
      comment?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const review = await reviewService.createReview(
        userId,
        bookingId,
        kennelId,
        rating,
        title,
        comment
      );
      return review;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadKennelReviews = createAsyncThunk(
  'reviews/loadKennelReviews',
  async (
    { kennelId, rating }: { kennelId: string; rating?: number },
    { rejectWithValue }
  ) => {
    try {
      const { reviews } = await reviewService.getKennelReviews(kennelId, { rating });
      return { kennelId, reviews };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadKennelRating = createAsyncThunk(
  'reviews/loadKennelRating',
  async (kennelId: string, { rejectWithValue }) => {
    try {
      const rating = await reviewService.getKennelAverageRating(kennelId);
      return { kennelId, rating };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadReviewByBooking = createAsyncThunk(
  'reviews/loadReviewByBooking',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const review = await reviewService.getReviewByBookingId(bookingId);
      return review;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentReview: (state, action: PayloadAction<Review | null>) => {
      state.currentReview = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create review
      .addCase(createReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentReview = action.payload;
        // Add to kennel reviews
        if (!state.reviews[action.payload.kennelId]) {
          state.reviews[action.payload.kennelId] = [];
        }
        state.reviews[action.payload.kennelId].unshift(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // Load kennel reviews
      .addCase(loadKennelReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadKennelReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews[action.payload.kennelId] = action.payload.reviews;
      })
      .addCase(loadKennelReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Load kennel rating
      .addCase(loadKennelRating.fulfilled, (state, action) => {
        state.kennelRatings[action.payload.kennelId] = action.payload.rating;
      })
      // Load review by booking
      .addCase(loadReviewByBooking.fulfilled, (state, action) => {
        state.currentReview = action.payload;
      });
  },
});

export const { clearError, setCurrentReview } = reviewSlice.actions;
export default reviewSlice.reducer;

