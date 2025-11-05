import { createSlice } from '@reduxjs/toolkit';

const medicalRecordSlice = createSlice({
  name: 'medicalRecords',
  initialState: {
    records: [],
    loading: false,
    error: null,
  },
  reducers: {},
});

export default medicalRecordSlice.reducer;

