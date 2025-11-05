import { collection, doc, getDoc, query, where, getDocs, orderBy, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { Kennel, KennelRun, KennelWithRuns } from '../models/kennel';
import { COLLECTIONS } from '../utils/constants';
import { localStorageService } from '../services/localStorageService';

export class KennelRepository {
  private firestore = getFirestoreInstance();

  /**
   * Save kennel to local IndexedDB (primary storage)
   */
  async saveKennelLocally(kennel: Kennel): Promise<void> {
    try {
      await localStorageService.init();
      const db = (localStorageService as any).db;
      if (!db) return;

      if (!db.objectStoreNames.contains('kennels')) {
        return;
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['kennels'], 'readwrite');
        const store = transaction.objectStore('kennels');
        const request = store.put(kennel);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error: any) {
      console.error('Failed to save kennel locally:', error);
    }
  }

  /**
   * Save kennel run to local IndexedDB
   */
  async saveKennelRunLocally(run: KennelRun): Promise<void> {
    try {
      await localStorageService.init();
      const db = (localStorageService as any).db;
      if (!db) return;

      if (!db.objectStoreNames.contains('kennel_runs')) {
        return;
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['kennel_runs'], 'readwrite');
        const store = transaction.objectStore('kennel_runs');
        const request = store.put(run);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error: any) {
      console.error('Failed to save kennel run locally:', error);
    }
  }

  /**
   * Get all kennels from local IndexedDB (primary source)
   */
  async getKennelsLocally(): Promise<Kennel[]> {
    try {
      await localStorageService.init();
      const db = (localStorageService as any).db;
      if (!db) return [];

      if (!db.objectStoreNames.contains('kennels')) {
        return [];
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['kennels'], 'readonly');
        const store = transaction.objectStore('kennels');
        const request = store.getAll();

        request.onsuccess = () => {
          const kennels = request.result || [];
          resolve(kennels.filter((k: Kennel) => k.isActive !== false));
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get kennels locally:', error);
      return [];
    }
  }

  /**
   * Get all kennel runs from local IndexedDB
   */
  async getKennelRunsLocally(kennelId?: string): Promise<KennelRun[]> {
    try {
      await localStorageService.init();
      const db = (localStorageService as any).db;
      if (!db) return [];

      if (!db.objectStoreNames.contains('kennel_runs')) {
        return [];
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['kennel_runs'], 'readonly');
        const store = transaction.objectStore('kennel_runs');
        const request = store.getAll();

        request.onsuccess = () => {
          let runs = request.result || [];
          runs = runs.filter((r: KennelRun) => r.isActive !== false);
          
          if (kennelId) {
            runs = runs.filter((r: KennelRun) => r.kennelId === kennelId);
          }
          
          resolve(runs);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get kennel runs locally:', error);
      return [];
    }
  }

  /**
   * Get kennels with runs (local-first)
   */
  async getKennelsWithRuns(): Promise<KennelWithRuns[]> {
    try {
      // 1. Read from local cache (instant, no cloud read)
      const localKennels = await this.getKennelsLocally();
      const localRuns = await this.getKennelRunsLocally();

      // 2. Return immediately (optimistic)
      if (localKennels.length > 0) {
        // Trigger background sync (weekly check)
        const lastSync = await this.getLastSyncDate();
        const now = Date.now();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;

        if (!lastSync || (now - lastSync) > oneWeek) {
          this.syncKennelsFromCloud().catch(console.error);
        }

        // Combine kennels with their runs
        return localKennels.map((kennel) => ({
          ...kennel,
          runs: localRuns.filter((run) => run.kennelId === kennel.id),
        }));
      }

      // 3. If no local data, fetch from cloud (first time only)
      const cloudKennels = await this.fetchKennelsFromCloud();
      const cloudRuns = await this.fetchKennelRunsFromCloud();

      // Save to local cache
      for (const kennel of cloudKennels) {
        await this.saveKennelLocally(kennel);
      }
      for (const run of cloudRuns) {
        await this.saveKennelRunLocally(run);
      }
      await this.setLastSyncDate(Date.now());

      return cloudKennels.map((kennel) => ({
        ...kennel,
        runs: cloudRuns.filter((run) => run.kennelId === kennel.id),
      }));
    } catch (error: any) {
      throw new Error(`Failed to get kennels: ${error.message}`);
    }
  }

  /**
   * Fetch kennels from Firestore
   */
  private async fetchKennelsFromCloud(): Promise<Kennel[]> {
    const kennelsRef = collection(this.firestore, COLLECTIONS.KENNELS);
    const q = query(kennelsRef, where('isActive', '==', true), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || Date.now(),
      updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
    } as Kennel));
  }

  /**
   * Fetch kennel runs from Firestore
   */
  private async fetchKennelRunsFromCloud(): Promise<KennelRun[]> {
    const runsRef = collection(this.firestore, COLLECTIONS.KENNEL_RUNS);
    const q = query(runsRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || Date.now(),
      updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
    } as KennelRun));
  }

  /**
   * Sync kennels from Firestore to local (weekly sync)
   */
  async syncKennelsFromCloud(): Promise<void> {
    try {
      const cloudKennels = await this.fetchKennelsFromCloud();
      const cloudRuns = await this.fetchKennelRunsFromCloud();

      for (const kennel of cloudKennels) {
        await this.saveKennelLocally(kennel);
      }
      for (const run of cloudRuns) {
        await this.saveKennelRunLocally(run);
      }
      await this.setLastSyncDate(Date.now());
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  /**
   * Get real-time availability for a kennel run (query Firestore)
   */
  async getRealTimeAvailability(runId: string): Promise<number> {
    try {
      const runRef = doc(this.firestore, COLLECTIONS.KENNEL_RUNS, runId);
      const runDoc = await getDoc(runRef);
      
      if (!runDoc.exists()) {
        return 0;
      }

      const runData = runDoc.data();
      return runData.available || 0;
    } catch (error: any) {
      throw new Error(`Failed to get availability: ${error.message}`);
    }
  }

  /**
   * Get last sync date for kennels
   */
  private async getLastSyncDate(): Promise<number | null> {
    try {
      return await localStorageService.getSetting('kennel_sync_date');
    } catch {
      return null;
    }
  }

  /**
   * Set last sync date for kennels
   */
  private async setLastSyncDate(timestamp: number): Promise<void> {
    try {
      await localStorageService.saveSetting('kennel_sync_date', timestamp);
    } catch {
      // Fail silently
    }
  }
}

// Export singleton instance
export const kennelRepository = new KennelRepository();

