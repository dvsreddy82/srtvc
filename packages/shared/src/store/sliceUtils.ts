/**
 * Redux Slice Utilities
 * Helper functions to reduce duplication in Redux slices
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import type { LoadingState } from './types';

/**
 * Creates a standard async thunk with error handling
 */
export function createAsyncThunkWithError<TArg, TReturn>(
  typePrefix: string,
  asyncFn: (arg: TArg, thunkAPI: any) => Promise<TReturn>
) {
  return createAsyncThunk(typePrefix, async (arg: TArg, { rejectWithValue }) => {
    try {
      return await asyncFn(arg, { rejectWithValue });
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  });
}

/**
 * Creates standard pending/fulfilled/rejected handlers for async thunks
 */
export function createAsyncHandlers<TState extends LoadingState, TPayload>(
  thunk: ReturnType<typeof createAsyncThunkWithError<any, TPayload>>,
  options?: {
    onFulfilled?: (state: TState, action: { payload: TPayload }) => void;
    onRejected?: (state: TState, action: { payload: string }) => void;
  }
) {
  return {
    [thunk.pending.type]: (state: TState) => {
      state.loading = true;
      state.error = null;
    },
    [thunk.fulfilled.type]: (state: TState, action: { payload: TPayload }) => {
      state.loading = false;
      state.error = null;
      options?.onFulfilled?.(state, action);
    },
    [thunk.rejected.type]: (state: TState, action: { payload: string }) => {
      state.loading = false;
      state.error = action.payload || 'An error occurred';
      options?.onRejected?.(state, action);
    },
  };
}

/**
 * Creates a standard clearError reducer
 */
export function createClearErrorReducer<TState extends LoadingState>() {
  return {
    clearError: (state: TState) => {
      state.error = null;
    },
  };
}

/**
 * Creates standard loading state initial state
 */
export function createLoadingInitialState<T extends Record<string, any>>(
  additionalState: T
): LoadingState & T {
  return {
    loading: false,
    error: null,
    ...additionalState,
  };
}

/**
 * Creates handlers for list operations (load, create, update, delete)
 */
export function createListHandlers<
  TState extends LoadingState & { items: any[] },
  TItem
>(thunk: ReturnType<typeof createAsyncThunkWithError<any, TItem[]>>) {
  return {
    [thunk.pending.type]: (state: TState) => {
      state.loading = true;
      state.error = null;
    },
    [thunk.fulfilled.type]: (state: TState, action: { payload: TItem[] }) => {
      state.loading = false;
      state.items = action.payload;
    },
    [thunk.rejected.type]: (state: TState, action: { payload: string }) => {
      state.loading = false;
      state.error = action.payload || 'An error occurred';
    },
  };
}

/**
 * Creates handlers for create operations
 */
export function createCreateHandlers<
  TState extends LoadingState & { items: any[] },
  TItem
>(thunk: ReturnType<typeof createAsyncThunkWithError<any, TItem>>) {
  return {
    [thunk.pending.type]: (state: TState) => {
      state.loading = true;
      state.error = null;
    },
    [thunk.fulfilled.type]: (state: TState, action: { payload: TItem }) => {
      state.loading = false;
      state.items.push(action.payload);
    },
    [thunk.rejected.type]: (state: TState, action: { payload: string }) => {
      state.loading = false;
      state.error = action.payload || 'An error occurred';
    },
  };
}

/**
 * Creates handlers for update operations
 */
export function createUpdateHandlers<
  TState extends LoadingState & { items: any[] },
  TItem extends { id: string }
>(thunk: ReturnType<typeof createAsyncThunkWithError<any, { id: string; updates: Partial<TItem> }>>) {
  return {
    [thunk.pending.type]: (state: TState) => {
      state.loading = true;
      state.error = null;
    },
    [thunk.fulfilled.type]: (state: TState, action: { payload: { id: string; updates: Partial<TItem> } }) => {
      state.loading = false;
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload.updates };
      }
    },
    [thunk.rejected.type]: (state: TState, action: { payload: string }) => {
      state.loading = false;
      state.error = action.payload || 'An error occurred';
    },
  };
}

/**
 * Creates handlers for delete operations
 */
export function createDeleteHandlers<
  TState extends LoadingState & { items: any[] }
>(thunk: ReturnType<typeof createAsyncThunkWithError<string, void>>) {
  return {
    [thunk.pending.type]: (state: TState) => {
      state.loading = true;
      state.error = null;
    },
    [thunk.fulfilled.type]: (state: TState, action: { meta: { arg: string } }) => {
      state.loading = false;
      state.items = state.items.filter((item) => item.id !== action.meta.arg);
    },
    [thunk.rejected.type]: (state: TState, action: { payload: string }) => {
      state.loading = false;
      state.error = action.payload || 'An error occurred';
    },
  };
}

