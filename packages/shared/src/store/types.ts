/**
 * Common Redux State Types
 * Shared types for Redux slices across all platforms
 */

/**
 * Base loading state interface
 */
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

/**
 * Async state with loading and error handling
 */
export interface AsyncState<T = any> extends LoadingState {
  data: T | null;
}

/**
 * List state with items
 */
export interface ListState<T> extends LoadingState {
  items: T[];
  currentItem: T | null;
}

/**
 * Pagination state
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

/**
 * Combined list state with pagination
 */
export interface PaginatedListState<T> extends ListState<T>, PaginationState {}

