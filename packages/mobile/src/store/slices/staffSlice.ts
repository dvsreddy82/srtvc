import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { staffService } from '@pet-management/shared';
import type { Booking } from '@pet-management/shared';

interface StaffState {
  todayCheckIns: Booking[];
  activeBookings: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: StaffState = {
  todayCheckIns: [],
  activeBookings: [],
  loading: false,
  error: null,
};

export const loadTodayCheckIns = createAsyncThunk(
  'staff/loadTodayCheckIns',
  async (kennelId: string, { rejectWithValue }) => {
    try {
      const checkIns = await staffService.getTodayCheckIns(kennelId);
      return checkIns;
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
      return bookings;
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTodayCheckIns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTodayCheckIns.fulfilled, (state, action) => {
        state.loading = false;
        state.todayCheckIns = action.payload;
      })
      .addCase(loadTodayCheckIns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loadActiveBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadActiveBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.activeBookings = action.payload;
      })
      .addCase(loadActiveBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = staffSlice.actions;
export default staffSlice.reducer;

