import { createSlice } from '@reduxjs/toolkit';

const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    reports: {},
    loading: false,
    error: null,
  },
  reducers: {},
});

export default reportsSlice.reducer;

