# Pet Management Mobile App

React Native mobile application for iOS and Android, built with React Native Paper and Firebase.

## Architecture

- **Framework**: React Native 0.73+
- **UI Library**: React Native Paper (Material Design)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: Redux Toolkit
- **Backend**: Firebase (React Native Firebase)
- **Local Storage**: SQLite (react-native-sqlite-storage)
- **Shared Code**: Uses `@pet-management/shared` package

## Features Implemented

### ✅ Authentication
- Login screen with email/password
- Signup screen with profile creation
- Firebase Authentication integration
- Auth state management with Redux

### ✅ Pet Owner Features
- **Pets Management**:
  - Pets list screen with cards
  - Add pet screen with form and photo upload
  - Pet details screen
  - Image compression and upload to Firebase Storage
  
- **Bookings**:
  - Bookings list screen
  - Booking details screen
  - Kennel search screen
  
### ✅ Staff Features
- Today's check-ins screen
- Active bookings screen
- Check-in/check-out functionality (ready)

### ✅ Manager Features
- Reports dashboard screen
- Kennel runs management screen

### ✅ Veterinarian Features
- Medical history viewer screen

### ✅ Admin Features
- User management screen
- System health screen

## Navigation Structure

### Pet Owner (Default)
- **Bottom Tabs**:
  - Pets tab
  - Bookings tab
  - Search tab
- **Stack Screens**:
  - Add Pet
  - Pet Details
  - Booking Details

### Staff
- **Bottom Tabs**:
  - Check-ins tab
  - Active tab

### Manager/Veterinarian/Admin
- Stack navigators with role-specific screens

## Local Storage (SQLite)

The mobile app uses SQLite for local-first storage:

- **Tables**: users, pets, bookings, medical_records, vaccines, kennels, kennel_runs, stay_updates, invoices, settings
- **Service**: `src/services/localStorageService.ts`
- **Strategy**: Local-first with background sync to Firestore

## Mobile-Specific Services

### Image Service
- Uses `react-native-image-resizer` for compression
- Uploads to Firebase Storage
- Handles ImagePicker assets

### Auth Service
- Uses `@react-native-firebase/auth`
- Creates user profiles in Firestore
- Handles auth state

### Pet Service
- Wraps shared petRepository
- Integrates with mobile SQLite storage
- Background sync to Firestore

## Setup

1. **Install Dependencies**
   ```bash
   cd packages/mobile
   npm install
   # or
   pnpm install
   ```

2. **iOS Setup**
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Configure Firebase**
   - Add `GoogleService-Info.plist` to `ios/` directory
   - Add `google-services.json` to `android/app/` directory

4. **Run**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## Project Structure

```
src/
├── features/
│   ├── auth/
│   │   └── screens/
│   │       ├── LoginScreen.tsx
│   │       └── SignupScreen.tsx
│   ├── petOwner/
│   │   ├── pets/
│   │   │   └── screens/
│   │   └── bookings/
│   │       └── screens/
│   ├── staff/
│   │   └── screens/
│   ├── manager/
│   │   └── screens/
│   ├── veterinarian/
│   │   └── screens/
│   └── admin/
│       └── screens/
├── navigation/
│   └── AppNavigator.tsx
├── services/
│   ├── authService.ts
│   ├── imageService.ts
│   ├── localStorageService.ts (SQLite)
│   └── petService.ts
├── store/
│   ├── slices/ (All Redux slices)
│   └── store.ts
├── config/
│   └── firebase.ts
└── shared/
    └── theme.ts
```

## Dependencies

- `@react-native-firebase/*` - Firebase SDK for React Native
- `react-native-paper` - Material Design components
- `react-native-sqlite-storage` - SQLite database
- `react-native-image-resizer` - Image compression
- `react-native-image-picker` - Image selection
- `@react-navigation/*` - Navigation
- `@reduxjs/toolkit` - State management
- `@pet-management/shared` - Shared business logic

## Notes

- The app uses role-based navigation (different UI for Pet Owner, Staff, Manager, etc.)
- Local storage is SQLite-based (different from web's IndexedDB)
- Image compression happens client-side before upload
- All screens use React Native Paper components for consistent UI
- Firebase integration uses React Native Firebase (not web SDK)

## Next Steps

1. Complete remaining feature screens (full implementation)
2. Add FCM push notifications setup
3. Implement offline queue for sync
4. Add error boundaries and better error handling
5. Add unit and integration tests

