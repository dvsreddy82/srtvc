import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { medicalRecordService } from '@pet-management/shared';
import type { MedicalRecord } from '@pet-management/shared';

interface MedicalRecordState {
  records: MedicalRecord[];
  currentRecord: MedicalRecord | null;
  loading: boolean;
  error: string | null;
  uploading: boolean;
}

const initialState: MedicalRecordState = {
  records: [],
  currentRecord: null,
  loading: false,
  error: null,
  uploading: false,
};

// Async thunks
export const loadMedicalRecords = createAsyncThunk(
  'medicalRecords/loadMedicalRecords',
  async (petId: string, { rejectWithValue }) => {
    try {
      const records = await medicalRecordService.getMedicalRecords(petId);
      return records;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const uploadVaccineDocument = createAsyncThunk(
  'medicalRecords/uploadVaccineDocument',
  async (
    data: {
      petId: string;
      petOwnerId: string;
      file: File;
      recordType: MedicalRecord['recordType'];
      date: number;
      veterinarianId?: string;
      clinicName?: string;
      notes?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const record = await medicalRecordService.uploadVaccineDocument(data);
      return record;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const medicalRecordSlice = createSlice({
  name: 'medicalRecords',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRecord: (state, action: PayloadAction<MedicalRecord | null>) => {
      state.currentRecord = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load medical records
      .addCase(loadMedicalRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMedicalRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(loadMedicalRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Upload vaccine document
      .addCase(uploadVaccineDocument.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadVaccineDocument.fulfilled, (state, action) => {
        state.uploading = false;
        state.records.unshift(action.payload); // Add to beginning
      })
      .addCase(uploadVaccineDocument.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentRecord } = medicalRecordSlice.actions;
export default medicalRecordSlice.reducer;

