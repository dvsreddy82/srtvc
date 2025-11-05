import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getFirebaseApp } from '../config/firebase';

/**
 * Firestore Service
 * Handles Firestore initialization with offline persistence
 */
export class FirestoreService {
  private initialized: boolean = false;

  /**
   * Initialize Firestore with offline persistence (Web)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const app = getFirebaseApp();
      const firestore = getFirestore(app);

      // Enable offline persistence for Web
      await enableIndexedDbPersistence(firestore).catch((err) => {
        if (err.code === 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled in one tab
          console.warn('Firestore persistence already enabled in another tab');
        } else if (err.code === 'unimplemented') {
          // Browser doesn't support IndexedDB
          console.warn('Browser does not support IndexedDB persistence');
        } else {
          console.error('Failed to enable Firestore persistence:', err);
        }
      });

      this.initialized = true;
      console.log('Firestore initialized with offline persistence');
    } catch (error) {
      console.error('Failed to initialize Firestore:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const firestoreService = new FirestoreService();

