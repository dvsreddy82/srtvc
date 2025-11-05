import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportsService } from '@pet-management/shared';
import type { ReportFilters, BookingReport, OccupancyReport } from '@pet-management/shared';

interface ReportsState {
  bookingReport: BookingReport | null;
  occupancyReport: OccupancyReport[];
  loading: boolean;
  error: string | null;
  lastGenerated: number | null;
}

const initialState: ReportsState = {
  bookingReport: null,
  occupancyReport: [],
  loading: false,
  error: null,
  lastGenerated: null,
};

// Async thunks
export const generateBookingReport = createAsyncThunk(
  'reports/generateBookingReport',
  async (filters: ReportFilters, { rejectWithValue }) => {
    try {
      const report = await reportsService.getBookingReport(filters);
      return report;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateOccupancyReport = createAsyncThunk(
  'reports/generateOccupancyReport',
  async (filters: ReportFilters, { rejectWithValue }) => {
    try {
      const report = await reportsService.getOccupancyReport(filters);
      return report;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReports: (state) => {
      state.bookingReport = null;
      state.occupancyReport = [];
      state.lastGenerated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate booking report
      .addCase(generateBookingReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateBookingReport.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingReport = action.payload;
        state.lastGenerated = Date.now();
      })
      .addCase(generateBookingReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Generate occupancy report
      .addCase(generateOccupancyReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateOccupancyReport.fulfilled, (state, action) => {
        state.loading = false;
        state.occupancyReport = action.payload;
        state.lastGenerated = Date.now();
      })
      .addCase(generateOccupancyReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearReports } = reportsSlice.actions;
export default reportsSlice.reducer;

