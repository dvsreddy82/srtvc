import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

// Auth Screens
import LoginScreen from '../features/auth/screens/LoginScreen';
import SignupScreen from '../features/auth/screens/SignupScreen';

// Pet Owner Screens
import PetsListScreen from '../features/petOwner/pets/screens/PetsListScreen';
import AddPetScreen from '../features/petOwner/pets/screens/AddPetScreen';
import PetDetailsScreen from '../features/petOwner/pets/screens/PetDetailsScreen';
import KennelSearchScreen from '../features/petOwner/bookings/screens/KennelSearchScreen';
import BookingsListScreen from '../features/petOwner/bookings/screens/BookingsListScreen';
import BookingDetailsScreen from '../features/petOwner/bookings/screens/BookingDetailsScreen';

// Staff Screens
import TodayCheckInsScreen from '../features/staff/screens/TodayCheckInsScreen';
import ActiveBookingsScreen from '../features/staff/screens/ActiveBookingsScreen';

// Manager Screens
import ReportsDashboardScreen from '../features/manager/screens/ReportsDashboardScreen';
import KennelRunsManagementScreen from '../features/manager/screens/KennelRunsManagementScreen';

// Veterinarian Screens
import MedicalHistoryViewerScreen from '../features/veterinarian/screens/MedicalHistoryViewerScreen';

// Admin Screens
import UserManagementScreen from '../features/admin/screens/UserManagementScreen';
import SystemHealthScreen from '../features/admin/screens/SystemHealthScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Pet Owner Tab Navigator
const PetOwnerTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#6200ee',
    }}
  >
    <Tab.Screen
      name="Pets"
      component={PetsListScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="paw" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Bookings"
      component={BookingsListScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="calendar" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Search"
      component={KennelSearchScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="magnify" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Staff Tab Navigator
const StaffTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#6200ee',
    }}
  >
    <Tab.Screen
      name="CheckIns"
      component={TodayCheckInsScreen}
      options={{
        tabBarLabel: 'Check-ins',
        tabBarIcon: ({ color, size }) => (
          <Icon name="login" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Active"
      component={ActiveBookingsScreen}
      options={{
        tabBarLabel: 'Active',
        tabBarIcon: ({ color, size }) => (
          <Icon name="clipboard-list" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Main App Navigator
export const AppNavigator: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || !user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    );
  }

  const userRole = user.role || 'petOwner';

  // Render based on user role
  if (userRole === 'staff') {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Main" component={StaffTabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  if (userRole === 'manager') {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Reports" component={ReportsDashboardScreen} />
        <Stack.Screen name="KennelRuns" component={KennelRunsManagementScreen} />
      </Stack.Navigator>
    );
  }

  if (userRole === 'veterinarian') {
    return (
      <Stack.Navigator>
        <Stack.Screen name="MedicalHistory" component={MedicalHistoryViewerScreen} />
      </Stack.Navigator>
    );
  }

  if (userRole === 'admin') {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Users" component={UserManagementScreen} />
        <Stack.Screen name="SystemHealth" component={SystemHealthScreen} />
      </Stack.Navigator>
    );
  }

  // Default: Pet Owner
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={PetOwnerTabs} options={{ headerShown: false }} />
      <Stack.Screen name="AddPet" component={AddPetScreen} options={{ title: 'Add Pet' }} />
      <Stack.Screen name="PetDetails" component={PetDetailsScreen} options={{ title: 'Pet Details' }} />
      <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} options={{ title: 'Booking Details' }} />
    </Stack.Navigator>
  );
};

