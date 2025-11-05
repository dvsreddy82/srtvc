import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userManagementService } from '@pet-management/shared';
import type { User } from '@pet-management/shared';

interface UserManagementState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
}

const initialState: UserManagementState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  saving: false,
};

// Async thunks
export const loadUsers = createAsyncThunk(
  'userManagement/loadUsers',
  async (limit: number = 50, { rejectWithValue }) => {
    try {
      const users = await userManagementService.getUsers(limit);
      return users;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchUsers = createAsyncThunk(
  'userManagement/searchUsers',
  async (searchTerm: string, { rejectWithValue }) => {
    try {
      const users = await userManagementService.searchUsers(searchTerm);
      return users;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadUser = createAsyncThunk(
  'userManagement/loadUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const user = await userManagementService.getUser(userId);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'userManagement/updateUserRole',
  async (
    {
      userId,
      role,
      adminId,
    }: {
      userId: string;
      role: string;
      adminId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await userManagementService.updateUserRole(userId, role, adminId);
      return { userId, role };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  'userManagement/requestPasswordReset',
  async (
    {
      email,
      adminId,
    }: {
      email: string;
      adminId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await userManagementService.requestPasswordReset(email, adminId);
      return { email };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load users
      .addCase(loadUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(loadUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Load user
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update user role
      .addCase(updateUserRole.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.saving = false;
        const user = state.users.find((u) => u.uid === action.payload.userId);
        if (user) {
          user.role = action.payload.role;
        }
        if (state.currentUser && state.currentUser.uid === action.payload.userId) {
          state.currentUser.role = action.payload.role;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      // Request password reset
      .addCase(requestPasswordReset.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentUser } = userManagementSlice.actions;
export default userManagementSlice.reducer;

