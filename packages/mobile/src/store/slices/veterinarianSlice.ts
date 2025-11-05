import { createSlice } from '@reduxjs/toolkit';

const veterinarianSlice = createSlice({
  name: 'veterinarian',
  initialState: {
    medicalHistory: {},
    loading: false,
    error: null,
  },
  reducers: {},
});

export default veterinarianSlice.reducer;

