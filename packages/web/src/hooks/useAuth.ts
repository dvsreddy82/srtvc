import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import type { AppDispatch, RootState } from '../store/store';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, profile, loading, error, initialized } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    profile,
    loading,
    error,
    initialized,
    isAuthenticated: !!user,
    logout: handleLogout,
  };
};

