import { createSlice } from '@reduxjs/toolkit';

const managerSlice = createSlice({
  name: 'manager',
  initialState: {
    kennelRuns: [],
    loading: false,
    error: null,
  },
  reducers: {},
});

export default managerSlice.reducer;

