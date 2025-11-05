import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import petReducer from './slices/petSlice';
import medicalRecordReducer from './slices/medicalRecordSlice';
import vaccineReducer from './slices/vaccineSlice';
import kennelReducer from './slices/kennelSlice';
import bookingReducer from './slices/bookingSlice';
import stayUpdateReducer from './slices/stayUpdateSlice';
import invoiceReducer from './slices/invoiceSlice';
import reviewReducer from './slices/reviewSlice';
import staffReducer from './slices/staffSlice';
import managerReducer from './slices/managerSlice';
import reportsReducer from './slices/reportsSlice';
import staffManagementReducer from './slices/staffManagementSlice';
import veterinarianReducer from './slices/veterinarianSlice';
import adminReducer from './slices/adminSlice';
import systemMonitoringReducer from './slices/systemMonitoringSlice';
import userManagementReducer from './slices/userManagementSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pets: petReducer,
    medicalRecords: medicalRecordReducer,
    vaccines: vaccineReducer,
    kennels: kennelReducer,
    bookings: bookingReducer,
    stayUpdates: stayUpdateReducer,
    invoices: invoiceReducer,
    reviews: reviewReducer,
    staff: staffReducer,
    manager: managerReducer,
    reports: reportsReducer,
    staffManagement: staffManagementReducer,
    veterinarian: veterinarianReducer,
    admin: adminReducer,
    systemMonitoring: systemMonitoringReducer,
    userManagement: userManagementReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Firebase User objects in auth actions (Firebase User is not serializable)
        ignoredActions: [
          'auth/setUser',
          'auth/signup/fulfilled',
          'auth/login/fulfilled',
          'auth/initialize/fulfilled',
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.user', 'meta.arg'],
        // Ignore Firebase User object in the state
        ignoredPaths: ['auth.user'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
