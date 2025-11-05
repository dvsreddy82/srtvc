# Common Code Analysis Report

## Overview
This document identifies common code patterns across web, mobile, and desktop packages that can be moved to the shared package.

## 1. Redux Store Configuration ⚠️ **IDENTICAL**

### Files:
- `packages/web/src/store/store.ts`
- `packages/mobile/src/store/store.ts`

### Analysis:
- **100% identical** - Same reducer configuration, same types
- Can be moved to `packages/shared/src/store/store.ts`

### Recommendation:
✅ **HIGH PRIORITY** - Move to shared package

---

## 2. Redux Slice Patterns ⚠️ **HIGHLY SIMILAR**

### Common Patterns Found:
All slices follow similar structure:
- `loading`, `error` states
- `clearError` reducer
- Async thunks with `pending`, `fulfilled`, `rejected` cases
- Similar state management patterns

### Examples:
- `authSlice.ts` - Web: 214 lines, Mobile: 104 lines (similar structure)
- `petSlice.ts` - Web: 191 lines, Mobile: 103 lines (similar structure)
- `bookingSlice.ts` - Similar patterns
- All 17 slices have similar patterns

### Recommendation:
✅ **HIGH PRIORITY** - Create shared slice utilities:
- `createAsyncSlice` helper function
- Common state types (LoadingState, ErrorState)
- Common reducers (clearError, setLoading, etc.)

---

## 3. Auth Service Interfaces ⚠️ **SIMILAR LOGIC**

### Files:
- `packages/mobile/src/services/authService.ts` (100 lines)
- `packages/desktop/src/services/authService.ts` (12 lines - placeholder)
- `packages/shared/src/services/authService.ts` (exists but web-specific)

### Analysis:
- Mobile uses React Native Firebase
- Desktop uses Web Firebase (via renderer)
- Both have similar methods: `signup`, `login`, `logout`

### Recommendation:
✅ **MEDIUM PRIORITY** - Create shared auth service interface:
- Abstract auth interface
- Platform-specific implementations
- Shared auth state management

---

## 4. Local Storage Service ⚠️ **MULTIPLE IMPLEMENTATIONS**

### Files:
- `packages/shared/src/services/localStorageService.ts` (IndexedDB - Web)
- `packages/mobile/src/services/localStorageService.ts` (SQLite - React Native)
- `packages/desktop/src/services/localStorageService.ts` (SQLite - Electron)

### Analysis:
- Same interface but different storage backends
- All implement same methods: `saveUser`, `getUser`, `savePet`, `getPets`, etc.

### Recommendation:
✅ **MEDIUM PRIORITY** - Already abstracted interface, but could:
- Create unified interface in shared
- Keep platform-specific implementations
- Add adapter pattern

---

## 5. Image Service ⚠️ **PLATFORM-SPECIFIC**

### Files:
- `packages/shared/src/services/imageService.ts` (Web - browser-image-compression)
- `packages/mobile/src/services/imageService.ts` (React Native - image-resizer)
- `packages/desktop/src/services/imageService.ts` (Electron - Sharp)

### Analysis:
- Same interface: `compressImage`, `uploadPetPhoto`, `uploadVaccineDocument`
- Different implementations based on platform

### Recommendation:
✅ **LOW PRIORITY** - Already well abstracted, keep platform-specific implementations

---

## 6. Store Configuration Helper ⚠️ **IDENTICAL**

### Files:
- `packages/web/src/store/store.ts`
- `packages/mobile/src/store/store.ts`

### Identical Code:
```typescript
export const store = configureStore({
  reducer: {
    auth: authReducer,
    pets: petReducer,
    // ... 17 reducers
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Recommendation:
✅ **HIGH PRIORITY** - Move to `packages/shared/src/store/store.ts`

---

## 7. Common Redux Patterns ⚠️ **REPEATED CODE**

### Pattern 1: Loading/Error States
Every slice has:
```typescript
interface State {
  loading: boolean;
  error: string | null;
  // ... other fields
}

const initialState = {
  loading: false,
  error: null,
  // ...
};
```

### Pattern 2: clearError Reducer
Most slices have:
```typescript
reducers: {
  clearError: (state) => {
    state.error = null;
  },
}
```

### Pattern 3: Async Thunk Handlers
All slices follow pattern:
```typescript
.addCase(loadX.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(loadX.fulfilled, (state, action) => {
  state.loading = false;
  state.items = action.payload;
})
.addCase(loadX.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload as string;
})
```

### Recommendation:
✅ **HIGH PRIORITY** - Create shared utilities:
- `createAsyncSlice` helper
- `createLoadingState` helper
- `createErrorHandlers` helper

---

## 8. useAuth Hook ⚠️ **WEB ONLY**

### Files:
- `packages/web/src/hooks/useAuth.ts` (24 lines)

### Analysis:
- Only exists in web package
- Could be useful for mobile if adapted

### Recommendation:
✅ **LOW PRIORITY** - Could be shared if hooks are supported in React Native

---

## 9. Type Definitions ⚠️ **ALREADY SHARED**

### Status:
✅ Most types already in `@pet-management/shared`
- User, Pet, Booking, etc.
- Well organized

---

## 10. Constants ⚠️ **ALREADY SHARED**

### Status:
✅ Constants already in `packages/shared/src/utils/constants.ts`
- COLLECTIONS
- STORAGE_PATHS
- BOOKING_STATUS
- USER_ROLES
- IMAGE_CONFIG

---

## Recommendations Summary

### High Priority (Immediate Action):
1. ✅ **Move Redux store configuration to shared** (100% identical)
2. ✅ **Create Redux slice utilities** (reduce duplication across 17 slices)
3. ✅ **Create common state types** (LoadingState, ErrorState)

### Medium Priority:
4. ✅ **Abstract auth service interface** (similar patterns)
5. ✅ **Standardize localStorage service interface** (already abstracted, improve)

### Low Priority:
6. ⚠️ **Image services** (already well abstracted)
7. ⚠️ **Hooks** (platform-specific needs)

---

## Implementation Plan

### Phase 1: Redux Store (High Priority)
1. Move `store.ts` to `packages/shared/src/store/store.ts`
2. Update web and mobile to import from shared
3. Test both platforms

### Phase 2: Redux Utilities (High Priority)
1. Create `packages/shared/src/store/sliceUtils.ts`
2. Add helpers:
   - `createAsyncSlice`
   - `createLoadingState`
   - `createErrorHandlers`
3. Refactor existing slices to use utilities

### Phase 3: Common State Types (High Priority)
1. Create `packages/shared/src/store/types.ts`
2. Define common interfaces:
   - `LoadingState`
   - `ErrorState`
   - `AsyncState<T>`

### Phase 4: Auth Service Interface (Medium Priority)
1. Create `packages/shared/src/services/authServiceInterface.ts`
2. Define abstract interface
3. Keep platform-specific implementations

---

## Estimated Impact

### Code Reduction:
- **Store configuration**: ~44 lines (2 files → 1 shared)
- **Slice utilities**: ~500+ lines saved (if helpers created)
- **Total potential**: ~600+ lines of duplicate code

### Maintenance Benefits:
- Single source of truth for store configuration
- Consistent patterns across platforms
- Easier to add new features
- Reduced bugs from inconsistencies

