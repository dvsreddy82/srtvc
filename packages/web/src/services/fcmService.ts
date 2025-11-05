/**
 * FCM Service - Web Implementation
 * Handles Firebase Cloud Messaging for stay updates
 * 
 * NOTE: This service is optional and may not be available if:
 * - Firebase messaging is not configured
 * - Service worker is not set up
 * - VAPID key is not configured
 */

import { getAuthInstance } from '@pet-management/shared';
import { doc, updateDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '@pet-management/shared';
import { COLLECTIONS } from '@pet-management/shared';

// VAPID key - should be set in environment variables
const VAPID_KEY = (typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string> }).env?.VITE_FIREBASE_VAPID_KEY) || '';

// Type for messaging - dynamically imported
type Messaging = any;

let messaging: Messaging | null = null;
let messagingModulePromise: Promise<any> | null = null;

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

      // Initialize messaging (dynamic import to avoid issues in non-browser environments)
      // Firebase messaging requires service worker setup and may not be available
      // Load messaging module lazily with error handling
      // Use string concatenation to prevent Vite from statically analyzing the import
      if (!messagingModulePromise) {
        messagingModulePromise = (async () => {
          try {
            // Construct module path dynamically to prevent static analysis
            const firebasePkg = 'firebase';
            const messagingPkg = 'messaging';
            const modulePath = `${firebasePkg}/${messagingPkg}`;
            
            // @ts-ignore - Dynamic import for optional Firebase messaging
            return await import(modulePath);
          } catch (error: any) {
            messagingModulePromise = null; // Reset on failure
            throw error;
          }
        })();
      }

      let messagingModule;
      try {
        messagingModule = await messagingModulePromise;
      } catch (importError: any) {
        // If module resolution fails, it might not be available or configured
        if (importError?.message?.includes('Failed to resolve') || 
            importError?.message?.includes('module specifier') ||
            importError?.code === 'ERR_MODULE_NOT_FOUND') {
          console.warn('Firebase Cloud Messaging is not available. This feature requires:');
          console.warn('1. Firebase messaging package installed');
          console.warn('2. Service worker configured');
          console.warn('3. VAPID key configured');
          console.warn('FCM will be disabled for this session.');
          return null; // Return null instead of throwing - FCM is optional
        }
        throw importError;
      }
      
      const { getMessaging, getToken, onMessage } = messagingModule;
      
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
      // Use the same lazy loading pattern
      if (!messagingModulePromise) {
        messagingModulePromise = (async () => {
          try {
            // Construct module path dynamically
            const firebasePkg = 'firebase';
            const messagingPkg = 'messaging';
            const modulePath = `${firebasePkg}/${messagingPkg}`;
            // @ts-ignore - Dynamic import for optional Firebase messaging
            return await import(modulePath);
          } catch (error: any) {
            messagingModulePromise = null;
            return null;
          }
        })();
      }
      
      const messagingModule = await messagingModulePromise;
      if (!messagingModule) {
        return null;
      }
      
      const { getToken } = messagingModule;
      return await getToken(messaging, { vapidKey: VAPID_KEY });
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }
}

