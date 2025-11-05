/**
 * Mobile Auth Service
 * Uses @react-native-firebase/auth
 */

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import type { User } from '@pet-management/shared';

export class MobileAuthService {
  /**
   * Sign up with email and password
   */
  async signup(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // Update profile
      await userCredential.user.updateProfile({ displayName });

      // Create user document in Firestore
      await firestore().collection('users').doc(userCredential.user.uid).set({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName,
        role: 'petOwner',
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        displayName: userCredential.user.displayName || displayName,
        role: 'petOwner',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign up');
    }
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);

      // Get user document from Firestore
      const userDoc = await firestore().collection('users').doc(userCredential.user.uid).get();

      if (!userDoc.exists) {
        throw new Error('User profile not found');
      }

      const userData = userDoc.data();

      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        displayName: userCredential.user.displayName || userData?.displayName || '',
        role: userData?.role || 'petOwner',
        createdAt: userData?.createdAt?.toMillis() || Date.now(),
        updatedAt: userData?.updatedAt?.toMillis() || Date.now(),
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to login');
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to logout');
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback: (user: FirebaseAuthTypes.User | null) => void) {
    return auth().onAuthStateChanged(callback);
  }
}

export const authService = new MobileAuthService();

