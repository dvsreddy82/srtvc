import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useDispatch, useSelector } from 'react-redux';
import { theme } from './shared/theme/theme';
import { initializeAuth } from './store/slices/authSlice';
import { Login } from './features/auth/components/Login';
import { Signup } from './features/auth/components/Signup';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { PetsList } from './features/petOwner/pets/components/PetsList';
import { AddPet } from './features/petOwner/pets/components/AddPet';
import { PetDetails } from './features/petOwner/pets/components/PetDetails';
import { KennelSearch } from './features/petOwner/bookings/components/KennelSearch';
import { CreateBooking } from './features/petOwner/bookings/components/CreateBooking';
import { BookingsList } from './features/petOwner/bookings/components/BookingsList';
import { BookingDetails } from './features/petOwner/bookings/components/BookingDetails';
import { InvoicesList } from './features/petOwner/bookings/components/InvoicesList';
import { InvoiceViewer } from './features/petOwner/bookings/components/InvoiceViewer';
import { Dashboard } from './features/petOwner/dashboard/Dashboard';
import type { AppDispatch, RootState } from './store/store';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, initialized } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Initialize auth state and Firestore offline persistence
    dispatch(initializeAuth());

    // Initialize FCM for stay update notifications (optional - may fail if not configured)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      import('./services/fcmService').then(({ FCMService }) => {
        FCMService.initialize().catch((error) => {
          // FCM is optional - log but don't crash the app
          console.warn('FCM initialization failed (this is optional):', error);
        });
      }).catch((error) => {
        // Module import failed - FCM may not be available
        console.warn('FCM service not available (this is optional):', error);
      });
    }

    // Listen for FCM stay update events
    const handleStayUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { bookingId } = customEvent.detail;
      if (bookingId) {
        // Refresh stay updates for this booking
        import('./store/slices/stayUpdateSlice').then(({ syncStayUpdates }) => {
          dispatch(syncStayUpdates(bookingId));
        });
      }
    };

    window.addEventListener('fcm-stay-update', handleStayUpdate);

    // Listen to auth state changes
    let unsubscribe: (() => void) | undefined;

    import('@pet-management/shared').then(({ authService, userRepository, localStorageService }) => {
      unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
        if (firebaseUser) {
          // User signed in - fetch profile
          let profile = await localStorageService.getUser(firebaseUser.uid);
          if (!profile) {
            profile = await userRepository.getUserProfile(firebaseUser.uid);
            if (profile) {
              await localStorageService.saveUser(profile);
            }
          }
          dispatch({ type: 'auth/setUser', payload: firebaseUser });
          dispatch({ type: 'auth/setProfile', payload: profile });
        } else {
          // User signed out
          dispatch({ type: 'auth/setUser', payload: null });
          dispatch({ type: 'auth/setProfile', payload: null });
        }
      });
    });

    return () => {
      window.removeEventListener('fcm-stay-update', handleStayUpdate);
      if (unsubscribe) unsubscribe();
    };
  }, [dispatch]);

  if (!initialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/dashboard" replace /> : <Signup />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pets"
            element={
              <ProtectedRoute>
                <PetsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pets/add"
            element={
              <ProtectedRoute>
                <AddPet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pets/:petId"
            element={
              <ProtectedRoute>
                <PetDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/search"
            element={
              <ProtectedRoute>
                <KennelSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/create"
            element={
              <ProtectedRoute>
                <CreateBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:bookingId"
            element={
              <ProtectedRoute>
                <BookingDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <InvoicesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices/:invoiceId"
            element={
              <ProtectedRoute>
                <InvoiceViewer />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to={user ? '/pets' : '/login'} replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
