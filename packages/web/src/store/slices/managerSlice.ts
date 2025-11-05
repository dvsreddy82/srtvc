import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { managerService } from '@pet-management/shared';
import type { KennelRun } from '@pet-management/shared';

interface ManagerState {
  kennelRuns: Record<string, KennelRun[]>; // kennelId -> runs
  loading: boolean;
  error: string | null;
  saving: boolean;
}

const initialState: ManagerState = {
  kennelRuns: {},
  loading: false,
  error: null,
  saving: false,
};

// Async thunks
export const loadKennelRuns = createAsyncThunk(
  'manager/loadKennelRuns',
  async (kennelId: string, { rejectWithValue }) => {
    try {
      const runs = await managerService.getKennelRuns(kennelId);
      return { kennelId, runs };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveKennelRun = createAsyncThunk(
  'manager/saveKennelRun',
  async (
    {
      kennelId,
      run,
      userId,
    }: {
      kennelId: string;
      run: Omit<KennelRun, 'id' | 'createdAt' | 'updatedAt'> | KennelRun;
      userId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const savedRun = await managerService.saveKennelRun(kennelId, run);
      
      // Log audit entry
      await managerService.logAuditEntry(
        userId,
        'id' in run && run.id ? 'update' : 'create',
        'kennel_run',
        savedRun.id,
        { kennelId, runName: savedRun.name }
      );
      
      return { kennelId, run: savedRun };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteKennelRun = createAsyncThunk(
  'manager/deleteKennelRun',
  async (
    {
      runId,
      kennelId,
      userId,
    }: {
      runId: string;
      kennelId: string;
      userId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await managerService.deleteKennelRun(runId);
      
      // Log audit entry
      await managerService.logAuditEntry(
        userId,
        'delete',
        'kennel_run',
        runId,
        { kennelId }
      );
      
      return { runId, kennelId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const managerSlice = createSlice({
  name: 'manager',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load kennel runs
      .addCase(loadKennelRuns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadKennelRuns.fulfilled, (state, action) => {
        state.loading = false;
        state.kennelRuns[action.payload.kennelId] = action.payload.runs;
      })
      .addCase(loadKennelRuns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Save kennel run
      .addCase(saveKennelRun.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveKennelRun.fulfilled, (state, action) => {
        state.saving = false;
        const { kennelId, run } = action.payload;
        if (!state.kennelRuns[kennelId]) {
          state.kennelRuns[kennelId] = [];
        }
        const index = state.kennelRuns[kennelId].findIndex((r) => r.id === run.id);
        if (index >= 0) {
          state.kennelRuns[kennelId][index] = run;
        } else {
          state.kennelRuns[kennelId].push(run);
        }
      })
      .addCase(saveKennelRun.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      // Delete kennel run
      .addCase(deleteKennelRun.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteKennelRun.fulfilled, (state, action) => {
        state.saving = false;
        const { runId, kennelId } = action.payload;
        if (state.kennelRuns[kennelId]) {
          state.kennelRuns[kennelId] = state.kennelRuns[kennelId].filter((r) => r.id !== runId);
        }
      })
      .addCase(deleteKennelRun.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = managerSlice.actions;
export default managerSlice.reducer;

