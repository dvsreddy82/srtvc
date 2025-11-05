import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService, userRepository, localStorageService } from '@pet-management/shared';
import type { UserProfile } from '@pet-management/shared';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthState {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  loading: false,
  error: null,
  initialized: false,
};

// Async thunks
export const signup = createAsyncThunk(
  'auth/signup',
  async (data: { email: string; password: string; displayName?: string }, { rejectWithValue }) => {
    try {
      // Initialize Firestore offline persistence
      const { firestoreService } = await import('@pet-management/shared');
      await firestoreService.initialize();

      // Create user account
      const user = await authService.signup(data);

      // Create user profile in Firestore
      await userRepository.createUserProfile(user.uid, {
        email: data.email,
        displayName: data.displayName,
        role: 'petOwner',
      });

      // Fetch and cache user profile locally
      const profile = await userRepository.getUserProfile(user.uid);
      if (profile) {
        await localStorageService.saveUser(profile);
      }

      return { user, profile };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Initialize Firestore offline persistence
      const { firestoreService } = await import('@pet-management/shared');
      await firestoreService.initialize();

      // Sign in user
      const user = await authService.login(data);

      // Try to get profile from local cache first
      let profile = await localStorageService.getUser(user.uid);

      // If not in cache, fetch from Firestore
      if (!profile) {
        profile = await userRepository.getUserProfile(user.uid);
        if (profile) {
          await localStorageService.saveUser(profile);
        }
      }

      return { user, profile };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      // Clear local cache
      const user = authService.getCurrentUser();
      if (user) {
        await localStorageService.deleteUser(user.uid);
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // Initialize Firestore offline persistence
      const { firestoreService } = await import('@pet-management/shared');
      await firestoreService.initialize();

      // Check for cached user
      const currentUser = authService.getCurrentUser();

      if (currentUser) {
        // Try local cache first
        let profile = await localStorageService.getUser(currentUser.uid);

        // If not in cache, fetch from Firestore
        if (!profile) {
          profile = await userRepository.getUserProfile(currentUser.uid);
          if (profile) {
            await localStorageService.saveUser(profile);
          }
        }

        return { user: currentUser, profile };
      }

      return { user: null, profile: null };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<FirebaseUser | null>) => {
      state.user = action.payload;
    },
    setProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.profile = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Initialize
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setProfile, clearError } = authSlice.actions;
export default authSlice.reducer;

