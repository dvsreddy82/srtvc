import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from '@pet-management/shared';
import type { Breed, VaccineType } from '@pet-management/shared';

interface AdminState {
  breeds: Breed[];
  vaccineTypes: VaccineType[];
  loading: boolean;
  error: string | null;
  saving: boolean;
}

const initialState: AdminState = {
  breeds: [],
  vaccineTypes: [],
  loading: false,
  error: null,
  saving: false,
};

// Async thunks
export const loadBreeds = createAsyncThunk(
  'admin/loadBreeds',
  async (species?: string, { rejectWithValue }) => {
    try {
      const breeds = await adminService.getBreeds(species);
      return breeds;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadVaccineTypes = createAsyncThunk(
  'admin/loadVaccineTypes',
  async (species?: string, { rejectWithValue }) => {
    try {
      const vaccineTypes = await adminService.getVaccineTypes(species);
      return vaccineTypes;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveBreed = createAsyncThunk(
  'admin/saveBreed',
  async (
    {
      breed,
      adminId,
    }: {
      breed: Omit<Breed, 'id' | 'createdAt' | 'updatedAt'> | Breed;
      adminId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const savedBreed = await adminService.saveBreed(breed, adminId);
      return savedBreed;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveVaccineType = createAsyncThunk(
  'admin/saveVaccineType',
  async (
    {
      vaccineType,
      adminId,
    }: {
      vaccineType: Omit<VaccineType, 'id' | 'createdAt' | 'updatedAt'> | VaccineType;
      adminId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const savedVaccineType = await adminService.saveVaccineType(vaccineType, adminId);
      return savedVaccineType;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load breeds
      .addCase(loadBreeds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBreeds.fulfilled, (state, action) => {
        state.loading = false;
        state.breeds = action.payload;
      })
      .addCase(loadBreeds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Load vaccine types
      .addCase(loadVaccineTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadVaccineTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.vaccineTypes = action.payload;
      })
      .addCase(loadVaccineTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Save breed
      .addCase(saveBreed.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveBreed.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.breeds.findIndex((b) => b.id === action.payload.id);
        if (index >= 0) {
          state.breeds[index] = action.payload;
        } else {
          state.breeds.push(action.payload);
        }
      })
      .addCase(saveBreed.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      // Save vaccine type
      .addCase(saveVaccineType.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveVaccineType.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.vaccineTypes.findIndex((vt) => vt.id === action.payload.id);
        if (index >= 0) {
          state.vaccineTypes[index] = action.payload;
        } else {
          state.vaccineTypes.push(action.payload);
        }
      })
      .addCase(saveVaccineType.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;

