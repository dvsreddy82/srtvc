import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bookingService } from '@pet-management/shared';
import type { Booking } from '@pet-management/shared';

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  loading: boolean;
  error: string | null;
  creating: boolean;
}

const initialState: BookingState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
  creating: false,
};

// Async thunks
export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (
    data: {
      userId: string;
      petId: string;
      kennelId: string;
      runId: string;
      startDate: number;
      endDate: number;
      totalAmount: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const booking = await bookingService.createBooking(data);
      return booking;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

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

export const loadBookingById = createAsyncThunk(
  'bookings/loadBookingById',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const booking = await bookingService.getBookingById(bookingId);
      return booking;
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
    setCurrentBooking: (state, action: PayloadAction<Booking | null>) => {
      state.currentBooking = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.creating = false;
        state.bookings.unshift(action.payload);
        state.currentBooking = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })
      // Load user bookings
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
      })
      // Load booking by ID
      .addCase(loadBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(loadBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentBooking } = bookingSlice.actions;
export default bookingSlice.reducer;

