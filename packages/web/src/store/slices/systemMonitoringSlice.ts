import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { systemMonitoringService } from '@pet-management/shared';
import type { AuditLog, SystemHealth, SystemMetric } from '@pet-management/shared';

interface SystemMonitoringState {
  auditLogs: AuditLog[];
  systemMetrics: SystemMetric[];
  systemHealth: SystemHealth | null;
  loading: boolean;
  error: string | null;
}

const initialState: SystemMonitoringState = {
  auditLogs: [],
  systemMetrics: [],
  systemHealth: null,
  loading: false,
  error: null,
};

// Async thunks
export const loadAuditLogs = createAsyncThunk(
  'systemMonitoring/loadAuditLogs',
  async (limit: number = 100, { rejectWithValue }) => {
    try {
      const logs = await systemMonitoringService.getRecentAuditLogs(limit);
      return logs;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadSystemMetrics = createAsyncThunk(
  'systemMonitoring/loadSystemMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const metrics = await systemMonitoringService.getSystemMetrics();
      return metrics;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadSystemHealth = createAsyncThunk(
  'systemMonitoring/loadSystemHealth',
  async (_, { rejectWithValue }) => {
    try {
      const health = await systemMonitoringService.getSystemHealth();
      return health;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const systemMonitoringSlice = createSlice({
  name: 'systemMonitoring',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load audit logs
      .addCase(loadAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.auditLogs = action.payload;
      })
      .addCase(loadAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Load system metrics
      .addCase(loadSystemMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSystemMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.systemMetrics = action.payload;
      })
      .addCase(loadSystemMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Load system health
      .addCase(loadSystemHealth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSystemHealth.fulfilled, (state, action) => {
        state.loading = false;
        state.systemHealth = action.payload;
      })
      .addCase(loadSystemHealth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = systemMonitoringSlice.actions;
export default systemMonitoringSlice.reducer;

