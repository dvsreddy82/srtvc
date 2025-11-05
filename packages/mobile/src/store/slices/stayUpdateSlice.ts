import { createSlice } from '@reduxjs/toolkit';

const stayUpdateSlice = createSlice({
  name: 'stayUpdates',
  initialState: {
    updates: {},
    loading: false,
    error: null,
  },
  reducers: {},
});

export default stayUpdateSlice.reducer;

