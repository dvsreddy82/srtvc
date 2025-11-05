import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { User, UserProfile } from '../models/user';
import { COLLECTIONS } from '../utils/constants';

export class UserRepository {
  private firestore = getFirestoreInstance();

  /**
   * Create user profile in Firestore after signup
   */
  async createUserProfile(userId: string, userData: Partial<UserProfile>): Promise<void> {
    try {
      const userDoc = doc(this.firestore, COLLECTIONS.USERS, userId);
      const now = Date.now();

      const profile: User = {
        id: userId,
        email: userData.email || '',
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        role: userData.role || 'petOwner',
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(userDoc, {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  }

  /**
   * Get user profile from Firestore
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = doc(this.firestore, COLLECTIONS.USERS, userId);
      const snapshot = await getDoc(userDoc);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();
      return {
        id: snapshot.id,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        role: data.role || 'petOwner',
        createdAt: data.createdAt?.toMillis() || Date.now(),
        updatedAt: data.updatedAt?.toMillis() || Date.now(),
        phoneNumber: data.phoneNumber,
        address: data.address,
        preferences: data.preferences,
      } as UserProfile;
    } catch (error: any) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  /**
   * Update user profile in Firestore
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userDoc = doc(this.firestore, COLLECTIONS.USERS, userId);
      await updateDoc(userDoc, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  /**
   * Stream user profile changes (real-time)
   */
  getUserProfileStream(userId: string, callback: (profile: UserProfile | null) => void) {
    const { onSnapshot } = require('firebase/firestore');
    const userDoc = doc(this.firestore, COLLECTIONS.USERS, userId);

    return onSnapshot(userDoc, (snapshot: any) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      const data = snapshot.data();
      callback({
        id: snapshot.id,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        role: data.role || 'petOwner',
        createdAt: data.createdAt?.toMillis() || Date.now(),
        updatedAt: data.updatedAt?.toMillis() || Date.now(),
        phoneNumber: data.phoneNumber,
        address: data.address,
        preferences: data.preferences,
      } as UserProfile);
    });
  }
}

// Export singleton instance
export const userRepository = new UserRepository();

