import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { petRepository, imageService } from '@pet-management/shared';
import type { Pet } from '@pet-management/shared';

interface PetState {
  pets: Pet[];
  currentPet: Pet | null;
  loading: boolean;
  error: string | null;
  uploadingPhoto: boolean;
}

const initialState: PetState = {
  pets: [],
  currentPet: null,
  loading: false,
  error: null,
  uploadingPhoto: false,
};

// Async thunks
export const loadPets = createAsyncThunk(
  'pets/loadPets',
  async (ownerId: string, { rejectWithValue }) => {
    try {
      const pets = await petRepository.getPets(ownerId);
      return pets;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPet = createAsyncThunk(
  'pets/createPet',
  async (
    data: {
      pet: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>;
      photoFile?: File;
    },
    { rejectWithValue }
  ) => {
    try {
      let photoURL: string | undefined;

      // Upload photo if provided
      if (data.photoFile && data.pet.ownerId) {
        // Create pet first to get ID
        const tempPet = await petRepository.createPet(data.pet);
        
        // Upload photo
        photoURL = await imageService.uploadPetPhoto(
          data.photoFile,
          data.pet.ownerId,
          tempPet.id
        );

        // Update pet with photo URL
        await petRepository.updatePet(tempPet.id, { photoURL });
        return { ...tempPet, photoURL };
      } else {
        // Create pet without photo
        return await petRepository.createPet(data.pet);
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePet = createAsyncThunk(
  'pets/updatePet',
  async (
    data: {
      petId: string;
      updates: Partial<Pet>;
      photoFile?: File;
    },
    { rejectWithValue }
  ) => {
    try {
      let photoURL: string | undefined;

      // Upload new photo if provided
      if (data.photoFile && data.updates.ownerId) {
        photoURL = await imageService.uploadPetPhoto(
          data.photoFile,
          data.updates.ownerId,
          data.petId
        );
        data.updates.photoURL = photoURL;
      }

      await petRepository.updatePet(data.petId, data.updates);
      return { petId: data.petId, updates: { ...data.updates, photoURL } };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadPetById = createAsyncThunk(
  'pets/loadPetById',
  async (data: { petId: string; ownerId: string }, { rejectWithValue }) => {
    try {
      const pet = await petRepository.getPetById(data.petId, data.ownerId);
      return pet;
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
    setCurrentPet: (state, action: PayloadAction<Pet | null>) => {
      state.currentPet = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load pets
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
      // Create pet
      .addCase(createPet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPet.fulfilled, (state, action) => {
        state.loading = false;
        state.pets.push(action.payload);
      })
      .addCase(createPet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update pet
      .addCase(updatePet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePet.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pets.findIndex((p) => p.id === action.payload.petId);
        if (index !== -1) {
          state.pets[index] = { ...state.pets[index], ...action.payload.updates };
        }
        if (state.currentPet?.id === action.payload.petId) {
          state.currentPet = { ...state.currentPet, ...action.payload.updates };
        }
      })
      .addCase(updatePet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Load pet by ID
      .addCase(loadPetById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPetById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPet = action.payload;
      })
      .addCase(loadPetById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentPet } = petSlice.actions;
export default petSlice.reducer;

