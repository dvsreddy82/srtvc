/**
 * FCM Service - Web Implementation
 * Handles Firebase Cloud Messaging for stay updates
 */

import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { getAuthInstance } from '@pet-management/shared';
import { doc, updateDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '@pet-management/shared';
import { COLLECTIONS } from '@pet-management/shared';

// VAPID key - should be set in environment variables
const VAPID_KEY = process.env.VITE_FIREBASE_VAPID_KEY || '';

let messaging: Messaging | null = null;

export class FCMService {
  /**
   * Initialize FCM and request notification permission
   */
  static async initialize(): Promise<string | null> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notifications not supported in this environment');
      return null;
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return null;
      }

      // Initialize messaging
      const { getMessaging, getToken } = await import('firebase/messaging');
      messaging = getMessaging();
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });

      if (token) {
        // Save token to user profile
        await this.saveFCMToken(token);
      }

      // Handle foreground messages
      onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        
        // Show notification
        if (payload.notification) {
          new Notification(payload.notification.title || '', {
            body: payload.notification.body,
            icon: payload.notification.icon,
            tag: payload.data?.type,
          });

          // Handle stay update notifications
          if (payload.data?.type === 'stay_update' && payload.data?.bookingId) {
            // Trigger Redux action to refresh stay updates
            const event = new CustomEvent('fcm-stay-update', {
              detail: { bookingId: payload.data.bookingId },
            });
            window.dispatchEvent(event);
          }
        }
      });

      return token;
    } catch (error) {
      console.error('Failed to initialize FCM:', error);
      return null;
    }
  }

  /**
   * Save FCM token to user profile
   */
  private static async saveFCMToken(token: string): Promise<void> {
    try {
      const auth = getAuthInstance();
      const user = auth.currentUser;
      
      if (!user) return;

      const firestore = getFirestoreInstance();
      const userRef = doc(firestore, COLLECTIONS.USERS, user.uid);
      await updateDoc(userRef, {
        fcmToken: token,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to save FCM token:', error);
    }
  }

  /**
   * Get current FCM token
   */
  static async getToken(): Promise<string | null> {
    if (!messaging) {
      return await this.initialize();
    }

    try {
      const { getToken } = await import('firebase/messaging');
      return await getToken(messaging, { vapidKey: VAPID_KEY });
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }
}

