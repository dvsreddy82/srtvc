import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mobilePetService } from '../../services/petService';
import type { Pet } from '@pet-management/shared';

interface PetState {
  pets: Pet[];
  currentPet: Pet | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
}

const initialState: PetState = {
  pets: [],
  currentPet: null,
  loading: false,
  error: null,
  saving: false,
};

export const loadPets = createAsyncThunk(
  'pets/loadPets',
  async (userId: string, { rejectWithValue }) => {
    try {
      const pets = await mobilePetService.getPets(userId);
      return pets;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPet = createAsyncThunk(
  'pets/createPet',
  async (
    {
      pet,
      photoFile,
      userId,
    }: {
      pet: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>;
      photoFile?: any; // ImagePicker asset
      userId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // Photo should already be uploaded before calling this
      const newPet = await mobilePetService.createPet({
        ...pet,
        ownerId: userId,
      });

      return newPet;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const petSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPet: (state, action) => {
      state.currentPet = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPets.fulfilled, (state, action) => {
        state.loading = false;
        state.pets = action.payload;
      })
      .addCase(loadPets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPet.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createPet.fulfilled, (state, action) => {
        state.saving = false;
        state.pets.push(action.payload);
      })
      .addCase(createPet.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentPet } = petSlice.actions;
export default petSlice.reducer;
