import { createSlice } from '@reduxjs/toolkit';

const systemMonitoringSlice = createSlice({
  name: 'systemMonitoring',
  initialState: {
    auditLogs: [],
    systemMetrics: [],
    systemHealth: null,
    loading: false,
    error: null,
  },
  reducers: {},
});

export default systemMonitoringSlice.reducer;

