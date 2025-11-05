import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { kennelSearchService } from '@pet-management/shared';
import type { KennelSearchFilters, KennelSearchResult } from '@pet-management/shared';

interface KennelState {
  searchResults: KennelSearchResult[];
  filters: KennelSearchFilters | null;
  loading: boolean;
  error: string | null;
}

const initialState: KennelState = {
  searchResults: [],
  filters: null,
  loading: false,
  error: null,
};

export const searchKennels = createAsyncThunk(
  'kennels/searchKennels',
  async (filters: KennelSearchFilters, { rejectWithValue }) => {
    try {
      const results = await kennelSearchService.searchKennels(filters);
      return { results, filters };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const kennelSlice = createSlice({
  name: 'kennels',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearResults: (state) => {
      state.searchResults = [];
      state.filters = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchKennels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchKennels.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.results;
        state.filters = action.payload.filters;
      })
      .addCase(searchKennels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearResults } = kennelSlice.actions;
export default kennelSlice.reducer;

