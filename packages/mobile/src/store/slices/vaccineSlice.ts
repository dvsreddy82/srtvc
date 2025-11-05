import { createSlice } from '@reduxjs/toolkit';

const vaccineSlice = createSlice({
  name: 'vaccines',
  initialState: {
    schedules: {},
    loading: false,
    error: null,
  },
  reducers: {},
});

export default vaccineSlice.reducer;

