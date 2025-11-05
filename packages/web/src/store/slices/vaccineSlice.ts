import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { vaccineScheduleService, vaccineRepository } from '@pet-management/shared';
import type { Vaccine, VaccineSchedule } from '@pet-management/shared';
import type { Pet } from '@pet-management/shared';

interface VaccineState {
  schedules: Record<string, VaccineSchedule>; // petId -> schedule
  loading: boolean;
  error: string | null;
}

const initialState: VaccineState = {
  schedules: {},
  loading: false,
  error: null,
};

// Async thunks
export const loadVaccineSchedule = createAsyncThunk(
  'vaccines/loadVaccineSchedule',
  async (pet: Pet, { rejectWithValue }) => {
    try {
      const schedule = await vaccineScheduleService.getVaccineSchedule(pet);
      return schedule;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const recordVaccine = createAsyncThunk(
  'vaccines/recordVaccine',
  async (
    data: {
      petId: string;
      type: string;
      administeredDate: number;
      nextDueDate: number;
      veterinarianId?: string;
      clinicName?: string;
      documentURL?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const vaccine = await vaccineRepository.createVaccine(data);
      return vaccine;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const vaccineSlice = createSlice({
  name: 'vaccines',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load vaccine schedule
      .addCase(loadVaccineSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadVaccineSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules[action.payload.petId] = action.payload;
      })
      .addCase(loadVaccineSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Record vaccine
      .addCase(recordVaccine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordVaccine.fulfilled, (state) => {
        state.loading = false;
        // Schedule will be reloaded when component refreshes
      })
      .addCase(recordVaccine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = vaccineSlice.actions;
export default vaccineSlice.reducer;

