import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingService } from '@pet-management/shared';
import type { Booking } from '@pet-management/shared';

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
};

export const loadUserBookings = createAsyncThunk(
  'bookings/loadUserBookings',
  async (userId: string, { rejectWithValue }) => {
    try {
      const bookings = await bookingService.getUserBookings(userId);
      return bookings;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(loadUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = bookingSlice.actions;
export default bookingSlice.reducer;

