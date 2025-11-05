/**
 * Shared Redux Store Configuration
 * Common store setup for web and mobile platforms
 */

import { configureStore } from '@reduxjs/toolkit';
import type { Reducer, AnyAction } from '@reduxjs/toolkit';

/**
 * Redux store configuration
 * Platforms can import this and add their reducers
 */
export function createStore(reducers: Record<string, Reducer<any, AnyAction>>) {
  return configureStore({
    reducer: reducers,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
  });
}

/**
 * Type helper for RootState
 * Usage: type RootState = RootStateOf<typeof store>
 */
export type RootStateOf<TStore extends ReturnType<typeof configureStore>> =
  ReturnType<TStore['getState']>;

/**
 * Type helper for AppDispatch
 * Usage: type AppDispatch = AppDispatchOf<typeof store>
 */
export type AppDispatchOf<TStore extends ReturnType<typeof configureStore>> =
  TStore['dispatch'];

