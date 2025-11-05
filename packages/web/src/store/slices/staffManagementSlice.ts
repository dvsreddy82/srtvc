import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { staffManagementService } from '@pet-management/shared';
import type { StaffAssignment } from '@pet-management/shared';

interface StaffManagementState {
  assignments: Record<string, StaffAssignment[]>; // kennelId -> assignments
  loading: boolean;
  error: string | null;
  saving: boolean;
}

const initialState: StaffManagementState = {
  assignments: {},
  loading: false,
  error: null,
  saving: false,
};

// Async thunks
export const loadStaffAssignments = createAsyncThunk(
  'staffManagement/loadStaffAssignments',
  async (kennelId: string, { rejectWithValue }) => {
    try {
      const assignments = await staffManagementService.getStaffAssignments(kennelId);
      return { kennelId, assignments };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveStaffAssignment = createAsyncThunk(
  'staffManagement/saveStaffAssignment',
  async (
    {
      assignment,
      userId,
    }: {
      assignment: Omit<StaffAssignment, 'id' | 'createdAt' | 'updatedAt'> | StaffAssignment;
      userId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const savedAssignment = await staffManagementService.saveStaffAssignment(assignment);
      
      // Request custom claims update via Cloud Function
      if (savedAssignment.staffId && savedAssignment.role) {
        await staffManagementService.requestCustomClaimsUpdate(
          savedAssignment.staffId,
          savedAssignment.role,
          savedAssignment.kennelId
        );
      }
      
      return { kennelId: savedAssignment.kennelId, assignment: savedAssignment };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const staffManagementSlice = createSlice({
  name: 'staffManagement',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load staff assignments
      .addCase(loadStaffAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadStaffAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments[action.payload.kennelId] = action.payload.assignments;
      })
      .addCase(loadStaffAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Save staff assignment
      .addCase(saveStaffAssignment.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveStaffAssignment.fulfilled, (state, action) => {
        state.saving = false;
        const { kennelId, assignment } = action.payload;
        if (!state.assignments[kennelId]) {
          state.assignments[kennelId] = [];
        }
        const index = state.assignments[kennelId].findIndex((a) => a.id === assignment.id);
        if (index >= 0) {
          state.assignments[kennelId][index] = assignment;
        } else {
          state.assignments[kennelId].push(assignment);
        }
      })
      .addCase(saveStaffAssignment.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = staffManagementSlice.actions;
export default staffManagementSlice.reducer;

