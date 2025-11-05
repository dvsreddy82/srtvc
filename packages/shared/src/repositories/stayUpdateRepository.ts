import { collection, query, where, getDocs, orderBy, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { StayUpdate } from '../models/stayUpdate';
import { COLLECTIONS } from '../utils/constants';
import { localStorageService } from '../services/localStorageService';

export class StayUpdateRepository {
  private firestore = getFirestoreInstance();

  /**
   * Save stay update to local IndexedDB (primary storage)
   */
  async saveStayUpdateLocally(update: StayUpdate): Promise<void> {
    try {
      await localStorageService.init();
      const db = (localStorageService as any).db;
      if (!db) return;

      if (!db.objectStoreNames.contains('stay_updates')) {
        return;
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['stay_updates'], 'readwrite');
        const store = transaction.objectStore('stay_updates');
        const request = store.put(update);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error: any) {
      console.error('Failed to save stay update locally:', error);
    }
  }

  /**
   * Get stay updates from local IndexedDB (primary source)
   */
  async getStayUpdatesLocally(bookingId: string): Promise<StayUpdate[]> {
    try {
      await localStorageService.init();
      const db = (localStorageService as any).db;
      if (!db) return [];

      if (!db.objectStoreNames.contains('stay_updates')) {
        return [];
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['stay_updates'], 'readonly');
        const store = transaction.objectStore('stay_updates');
        const request = store.getAll();

        request.onsuccess = () => {
          const allUpdates = request.result || [];
          const bookingUpdates = allUpdates
            .filter((u: StayUpdate) => u.bookingId === bookingId)
            .sort((a: StayUpdate, b: StayUpdate) => b.timestamp - a.timestamp);
          resolve(bookingUpdates);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get stay updates locally:', error);
      return [];
    }
  }

  /**
   * Get stay updates for a booking (local-first)
   */
  async getStayUpdates(bookingId: string): Promise<StayUpdate[]> {
    try {
      // 1. Read from local cache (instant, no cloud read)
      const localUpdates = await this.getStayUpdatesLocally(bookingId);

      // 2. Return immediately (optimistic)
      if (localUpdates.length > 0) {
        // Trigger background sync (every 15 minutes)
        const lastSync = await this.getLastSyncDate(bookingId);
        const now = Date.now();
        const fifteenMinutes = 15 * 60 * 1000;

        if (!lastSync || (now - lastSync) > fifteenMinutes) {
          this.syncStayUpdatesFromCloud(bookingId).catch(console.error);
        }
        return localUpdates;
      }

      // 3. If no local data, fetch from cloud (first time only)
      const cloudUpdates = await this.fetchStayUpdatesFromCloud(bookingId);
      for (const update of cloudUpdates) {
        await this.saveStayUpdateLocally(update);
      }
      await this.setLastSyncDate(bookingId, Date.now());
      return cloudUpdates;
    } catch (error: any) {
      throw new Error(`Failed to get stay updates: ${error.message}`);
    }
  }

  /**
   * Fetch stay updates from Firestore
   */
  private async fetchStayUpdatesFromCloud(bookingId: string): Promise<StayUpdate[]> {
    const updatesRef = collection(this.firestore, COLLECTIONS.STAY_UPDATES);
    const q = query(
      updatesRef,
      where('bookingId', '==', bookingId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toMillis() || doc.data().timestamp || Date.now(),
      createdAt: doc.data().createdAt?.toMillis() || Date.now(),
      updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
    } as StayUpdate));
  }

  /**
   * Sync stay updates from Firestore to local (batch sync every 15 min)
   */
  async syncStayUpdatesFromCloud(bookingId: string): Promise<void> {
    try {
      const cloudUpdates = await this.fetchStayUpdatesFromCloud(bookingId);
      
      // Get existing local updates to merge
      const localUpdates = await this.getStayUpdatesLocally(bookingId);
      const localUpdateIds = new Set(localUpdates.map((u) => u.id));

      // Save new updates
      for (const update of cloudUpdates) {
        if (!localUpdateIds.has(update.id)) {
          await this.saveStayUpdateLocally(update);
        } else {
          // Update existing
          await this.saveStayUpdateLocally(update);
        }
      }
      
      await this.setLastSyncDate(bookingId, Date.now());
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  /**
   * Get last sync date for stay updates
   */
  private async getLastSyncDate(bookingId: string): Promise<number | null> {
    try {
      const key = `stay_update_sync_${bookingId}`;
      return await localStorageService.getSetting(key);
    } catch {
      return null;
    }
  }

  /**
   * Set last sync date for stay updates
   */
  private async setLastSyncDate(bookingId: string, timestamp: number): Promise<void> {
    try {
      const key = `stay_update_sync_${bookingId}`;
      await localStorageService.saveSetting(key, timestamp);
    } catch {
      // Fail silently
    }
  }
}

// Export singleton instance
export const stayUpdateRepository = new StayUpdateRepository();

