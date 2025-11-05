/**
 * User Management Service
 * Handles admin operations for user management
 * Note: Password reset and role management require Cloud Functions (Admin SDK)
 */

import { collection, query, where, getDocs, doc, updateDoc, getDoc, limit } from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { COLLECTIONS } from '../utils/constants';
import { managerService } from './managerService';
import type { User } from '../models/user';

export class UserManagementService {
  private firestore = getFirestoreInstance();

  /**
   * Get all users (with pagination)
   */
  async getUsers(limitCount: number = 50): Promise<User[]> {
    try {
      const usersRef = collection(this.firestore, COLLECTIONS.USERS);
      const q = query(usersRef, limit(limitCount));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || Date.now(),
        updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
      } as User));
    } catch (error: any) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User | null> {
    try {
      const userRef = doc(this.firestore, COLLECTIONS.USERS, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      return {
        id: userDoc.id,
        ...userDoc.data(),
        createdAt: userDoc.data().createdAt?.toMillis() || Date.now(),
        updatedAt: userDoc.data().updatedAt?.toMillis() || Date.now(),
      } as User;
    } catch (error: any) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  /**
   * Update user role (triggers Cloud Function to set custom claims)
   */
  async updateUserRole(userId: string, role: string, adminId: string, kennelId?: string): Promise<void> {
    try {
      // Call Cloud Function to update custom claims
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const { getFirebaseApp } = await import('../config/firebase');
      const app = getFirebaseApp();
      const functions = getFunctions(app);
      const updateClaimsFunction = httpsCallable(functions, 'updateUserCustomClaims');

      const claims: Record<string, any> = { role };
      if (kennelId) {
        claims.kennelId = kennelId;
      }

      await updateClaimsFunction({ userId, claims });

      // Update user document in Firestore
      const userRef = doc(this.firestore, COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        role,
        updatedAt: new Date(),
      });
    } catch (error: any) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  }

  /**
   * Request password reset (triggers Cloud Function)
   */
  async requestPasswordReset(email: string, adminId: string): Promise<void> {
    try {
      // Call Cloud Function to send password reset email
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const { getFirebaseApp } = await import('../config/firebase');
      const app = getFirebaseApp();
      const functions = getFunctions(app);
      const passwordResetFunction = httpsCallable(functions, 'sendPasswordResetEmail');

      await passwordResetFunction({ email });
    } catch (error: any) {
      throw new Error(`Failed to request password reset: ${error.message}`);
    }
  }

  /**
   * Search users by email or name
   */
  async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      // Firestore doesn't support full-text search, so we'll do a simple filter
      // In production, consider using Algolia or similar for better search
      const users = await this.getUsers(1000); // Get more users for search
      
      const term = searchTerm.toLowerCase();
      return users.filter(
        (user) =>
          user.email?.toLowerCase().includes(term) ||
          user.displayName?.toLowerCase().includes(term)
      );
    } catch (error: any) {
      throw new Error(`Failed to search users: ${error.message}`);
    }
  }
}

// Export singleton instance
export const userManagementService = new UserManagementService();

