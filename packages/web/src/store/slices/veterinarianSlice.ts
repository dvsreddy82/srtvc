import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { veterinarianService } from '@pet-management/shared';
import type { MedicalRecord } from '@pet-management/shared';

interface VeterinarianState {
  medicalHistory: Record<string, MedicalRecord[]>; // petId -> records
  loading: boolean;
  error: string | null;
  submitting: boolean;
}

const initialState: VeterinarianState = {
  medicalHistory: {},
  loading: false,
  error: null,
  submitting: false,
};

// Async thunks
export const getMedicalHistory = createAsyncThunk(
  'veterinarian/getMedicalHistory',
  async (
    {
      petId,
      veterinarianId,
      clinicId,
    }: {
      petId: string;
      veterinarianId?: string;
      clinicId?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const records = await veterinarianService.getMedicalHistory(petId, veterinarianId, clinicId);
      return { petId, records };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitMedicalRecord = createAsyncThunk(
  'veterinarian/submitMedicalRecord',
  async (
    {
      veterinarianId,
      clinicId,
      clinicName,
      medicalRecord,
    }: {
      veterinarianId: string;
      clinicId: string;
      clinicName: string;
      medicalRecord: Omit<MedicalRecord, 'id' | 'petOwnerId' | 'createdAt' | 'updatedAt'>;
    },
    { rejectWithValue }
  ) => {
    try {
      const record = await veterinarianService.submitMedicalRecord(
        veterinarianId,
        clinicId,
        clinicName,
        medicalRecord
      );
      return record;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const veterinarianSlice = createSlice({
  name: 'veterinarian',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get medical history
      .addCase(getMedicalHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMedicalHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.medicalHistory[action.payload.petId] = action.payload.records;
      })
      .addCase(getMedicalHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Submit medical record
      .addCase(submitMedicalRecord.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitMedicalRecord.fulfilled, (state, action) => {
        state.submitting = false;
        const petId = action.payload.petId;
        if (!state.medicalHistory[petId]) {
          state.medicalHistory[petId] = [];
        }
        state.medicalHistory[petId].unshift(action.payload);
        state.medicalHistory[petId].sort((a, b) => b.date - a.date);
      })
      .addCase(submitMedicalRecord.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = veterinarianSlice.actions;
export default veterinarianSlice.reducer;

