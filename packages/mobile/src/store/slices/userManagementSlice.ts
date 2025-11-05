import { createSlice } from '@reduxjs/toolkit';

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState: {
    users: [],
    currentUser: null,
    loading: false,
    error: null,
  },
  reducers: {},
});

export default userManagementSlice.reducer;

