import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { staffService, checkInService, staffStayUpdateService, checkOutService } from '@pet-management/shared';
import type { Booking, StayUpdate } from '@pet-management/shared';

interface StaffState {
  todayCheckIns: Booking[];
  activeBookings: Booking[];
  loading: boolean;
  error: string | null;
  lastSync: number | null;
  submitting: boolean;
}

const initialState: StaffState = {
  todayCheckIns: [],
  activeBookings: [],
  loading: false,
  error: null,
  lastSync: null,
  submitting: false,
};

// Async thunks
export const loadTodayCheckIns = createAsyncThunk(
  'staff/loadTodayCheckIns',
  async (kennelId: string, { rejectWithValue }) => {
    try {
      const checkIns = await staffService.getTodayCheckIns(kennelId);
      return { checkIns, kennelId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const syncTodayCheckIns = createAsyncThunk(
  'staff/syncTodayCheckIns',
  async (kennelId: string, { rejectWithValue }) => {
    try {
      await staffService.syncTodayCheckIns(kennelId);
      const checkIns = await staffService.getTodayCheckIns(kennelId);
      return { checkIns, kennelId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkInPet = createAsyncThunk(
  'staff/checkInPet',
  async (
    {
      bookingId,
      staffId,
      condition,
      notes,
    }: {
      bookingId: string;
      staffId: string;
      condition?: string;
      notes?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await checkInService.checkInPet(bookingId, staffId, condition, notes);
      return { bookingId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const uploadStayUpdate = createAsyncThunk(
  'staff/uploadStayUpdate',
  async (
    {
      bookingId,
      staffId,
      staffName,
      type,
      content,
      photos,
    }: {
      bookingId: string;
      staffId: string;
      staffName: string;
      type: StayUpdate['type'];
      content?: string;
      photos?: File[];
    },
    { rejectWithValue }
  ) => {
    try {
      const update = await staffStayUpdateService.uploadStayUpdate(
        bookingId,
        staffId,
        staffName,
        type,
        content,
        photos
      );
      return update;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadActiveBookings = createAsyncThunk(
  'staff/loadActiveBookings',
  async (kennelId: string, { rejectWithValue }) => {
    try {
      const bookings = await staffService.getActiveBookings(kennelId);
      return { bookings, kennelId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkOutPet = createAsyncThunk(
  'staff/checkOutPet',
  async (
    {
      bookingId,
      staffId,
      notes,
    }: {
      bookingId: string;
      staffId: string;
      notes?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await checkOutService.checkOutPet(bookingId, staffId, notes);
      return { bookingId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateCheckInStatus: (state, action: PayloadAction<{ bookingId: string; status: Booking['status'] }>) => {
      const booking = state.todayCheckIns.find((b) => b.id === action.payload.bookingId);
      if (booking) {
        booking.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Load today's check-ins
      .addCase(loadTodayCheckIns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTodayCheckIns.fulfilled, (state, action) => {
        state.loading = false;
        state.todayCheckIns = action.payload.checkIns;
      })
      .addCase(loadTodayCheckIns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Sync today's check-ins
      .addCase(syncTodayCheckIns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncTodayCheckIns.fulfilled, (state, action) => {
        state.loading = false;
        state.todayCheckIns = action.payload.checkIns;
        state.lastSync = Date.now();
      })
      .addCase(syncTodayCheckIns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Check-in pet
      .addCase(checkInPet.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(checkInPet.fulfilled, (state, action) => {
        state.submitting = false;
        // Update booking status in today's check-ins
        const booking = state.todayCheckIns.find((b) => b.id === action.payload.bookingId);
        if (booking) {
          booking.status = 'checked-in';
        }
      })
      .addCase(checkInPet.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // Upload stay update
      .addCase(uploadStayUpdate.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(uploadStayUpdate.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(uploadStayUpdate.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // Load active bookings
      .addCase(loadActiveBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadActiveBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.activeBookings = action.payload.bookings;
      })
      .addCase(loadActiveBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Check-out pet
      .addCase(checkOutPet.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(checkOutPet.fulfilled, (state, action) => {
        state.submitting = false;
        // Remove from active bookings
        state.activeBookings = state.activeBookings.filter(
          (b) => b.id !== action.payload.bookingId
        );
      })
      .addCase(checkOutPet.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateCheckInStatus } = staffSlice.actions;
export default staffSlice.reducer;

