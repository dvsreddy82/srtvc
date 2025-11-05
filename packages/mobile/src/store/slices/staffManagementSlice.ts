import { createSlice } from '@reduxjs/toolkit';

const staffManagementSlice = createSlice({
  name: 'staffManagement',
  initialState: {
    assignments: [],
    loading: false,
    error: null,
  },
  reducers: {},
});

export default staffManagementSlice.reducer;

