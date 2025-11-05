import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { stayUpdateService } from '@pet-management/shared';
import type { StayUpdate } from '@pet-management/shared';

interface StayUpdateState {
  updates: Record<string, StayUpdate[]>; // bookingId -> updates
  loading: boolean;
  error: string | null;
  syncing: Record<string, boolean>; // bookingId -> isSyncing
}

const initialState: StayUpdateState = {
  updates: {},
  loading: false,
  error: null,
  syncing: {},
};

// Async thunks
export const loadStayUpdates = createAsyncThunk(
  'stayUpdates/loadStayUpdates',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const updates = await stayUpdateService.getStayUpdates(bookingId);
      return { bookingId, updates };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const syncStayUpdates = createAsyncThunk(
  'stayUpdates/syncStayUpdates',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      await stayUpdateService.syncStayUpdates(bookingId);
      const updates = await stayUpdateService.getStayUpdates(bookingId);
      return { bookingId, updates };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const stayUpdateSlice = createSlice({
  name: 'stayUpdates',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addUpdate: (state, action: PayloadAction<{ bookingId: string; update: StayUpdate }>) => {
      const { bookingId, update } = action.payload;
      if (!state.updates[bookingId]) {
        state.updates[bookingId] = [];
      }
      state.updates[bookingId].unshift(update);
      state.updates[bookingId].sort((a, b) => b.timestamp - a.timestamp);
    },
    clearUpdates: (state, action: PayloadAction<string>) => {
      delete state.updates[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // Load stay updates
      .addCase(loadStayUpdates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadStayUpdates.fulfilled, (state, action) => {
        state.loading = false;
        state.updates[action.payload.bookingId] = action.payload.updates;
      })
      .addCase(loadStayUpdates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Sync stay updates
      .addCase(syncStayUpdates.pending, (state, action) => {
        state.syncing[action.meta.arg] = true;
      })
      .addCase(syncStayUpdates.fulfilled, (state, action) => {
        state.syncing[action.payload.bookingId] = false;
        state.updates[action.payload.bookingId] = action.payload.updates;
      })
      .addCase(syncStayUpdates.rejected, (state, action) => {
        state.syncing[action.meta.arg] = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, addUpdate, clearUpdates } = stayUpdateSlice.actions;
export default stayUpdateSlice.reducer;

