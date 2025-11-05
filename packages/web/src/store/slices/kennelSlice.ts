import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { kennelSearchService } from '@pet-management/shared';
import type { KennelSearchFilters, KennelSearchResult } from '@pet-management/shared';

interface KennelState {
  searchResults: KennelSearchResult[];
  currentPage: number;
  pageSize: number;
  totalResults: number;
  loading: boolean;
  error: string | null;
  filters: KennelSearchFilters | null;
}

const initialState: KennelState = {
  searchResults: [],
  currentPage: 1,
  pageSize: 20,
  totalResults: 0,
  loading: false,
  error: null,
  filters: null,
};

// Async thunks
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
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearResults: (state) => {
      state.searchResults = [];
      state.totalResults = 0;
      state.currentPage = 1;
      state.filters = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search kennels
      .addCase(searchKennels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchKennels.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.results;
        state.totalResults = action.payload.results.length;
        state.filters = action.payload.filters;
        state.currentPage = 1;
      })
      .addCase(searchKennels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setPage, clearResults } = kennelSlice.actions;
export default kennelSlice.reducer;

