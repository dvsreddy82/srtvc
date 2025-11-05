/**
 * Mobile Firebase Configuration
 * Uses @react-native-firebase instead of web Firebase SDK
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';

// Export Firebase instances for mobile
export const firebaseAuth = auth();
export const firebaseFirestore = firestore();
export const firebaseStorage = storage();
export const firebaseMessaging = messaging();

// Initialize Firebase (already done via native code)
// Just export the instances

// For compatibility with shared package
export function getFirestoreInstance() {
  return firebaseFirestore;
}

export function getAuthInstance() {
  return firebaseAuth;
}

export function getStorageInstance() {
  return firebaseStorage;
}

export function getFirebaseApp() {
  // React Native Firebase doesn't use app instances the same way
  return {
    auth: () => firebaseAuth,
    firestore: () => firebaseFirestore,
    storage: () => firebaseStorage,
  };
}

