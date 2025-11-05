import { collection, setDoc, doc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { Vaccine } from '../models/vaccine';
import { COLLECTIONS } from '../utils/constants';
import { localStorageService } from '../services/localStorageService';

export class VaccineRepository {
  private firestore = getFirestoreInstance();

  /**
   * Save vaccine to local IndexedDB (primary storage)
   */
  async saveVaccineLocally(vaccine: Vaccine): Promise<void> {
    try {
      await localStorageService.init();
      const db = (localStorageService as any).db;
      if (!db) return;

      // Ensure vaccines object store exists
      if (!db.objectStoreNames.contains('vaccines')) {
        return;
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['vaccines'], 'readwrite');
        const store = transaction.objectStore('vaccines');
        const request = store.put(vaccine);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error: any) {
      console.error('Failed to save vaccine locally:', error);
      // Don't throw - local save is optional
    }
  }

  /**
   * Get vaccines from local IndexedDB (primary source)
   */
  async getVaccinesLocally(petId: string): Promise<Vaccine[]> {
    try {
      await localStorageService.init();
      const db = (localStorageService as any).db;
      if (!db) return [];

      // Check if vaccines store exists
      if (!db.objectStoreNames.contains('vaccines')) {
        return [];
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['vaccines'], 'readonly');
        const store = transaction.objectStore('vaccines');
        const request = store.getAll();

        request.onsuccess = () => {
          const allVaccines = request.result || [];
          const petVaccines = allVaccines.filter((v: Vaccine) => v.petId === petId);
          // Sort by nextDueDate (ascending)
          petVaccines.sort((a: Vaccine, b: Vaccine) => a.nextDueDate - b.nextDueDate);
          resolve(petVaccines);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get vaccines locally:', error);
      return [];
    }
  }

  /**
   * Create vaccine record (local-first: save locally first, then sync to Firestore)
   */
  async createVaccine(vaccine: Omit<Vaccine, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vaccine> {
    const now = Date.now();
    const vaccineData: Vaccine = {
      ...vaccine,
      id: `vaccine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    try {
      // 1. Save locally first (optimistic - instant UI update)
      await this.saveVaccineLocally(vaccineData);

      // 2. Sync to Firestore in background (non-blocking)
      this.syncVaccineToCloud(vaccineData).catch((error) => {
        console.error('Background sync failed:', error);
      });

      return vaccineData;
    } catch (error: any) {
      throw new Error(`Failed to create vaccine: ${error.message}`);
    }
  }

  /**
   * Get vaccines for a pet (local-first)
   */
  async getVaccines(petId: string): Promise<Vaccine[]> {
    try {
      // 1. Read from local cache (instant, no cloud read)
      const localVaccines = await this.getVaccinesLocally(petId);

      // 2. Return immediately (optimistic)
      if (localVaccines.length > 0) {
        // Trigger background sync (non-blocking, monthly check)
        const lastSync = await this.getLastSyncDate(petId);
        const now = Date.now();
        const oneMonth = 30 * 24 * 60 * 60 * 1000;

        if (!lastSync || (now - lastSync) > oneMonth) {
          this.syncVaccinesFromCloud(petId).catch(console.error);
        }
        return localVaccines;
      }

      // 3. If no local data, fetch from cloud (first time only)
      const cloudVaccines = await this.fetchVaccinesFromCloud(petId);
      // Save to local cache
      for (const vaccine of cloudVaccines) {
        await this.saveVaccineLocally(vaccine);
      }
      await this.setLastSyncDate(petId, Date.now());
      return cloudVaccines;
    } catch (error: any) {
      throw new Error(`Failed to get vaccines: ${error.message}`);
    }
  }

  /**
   * Sync vaccine to Firestore (background operation)
   */
  private async syncVaccineToCloud(vaccine: Vaccine): Promise<void> {
    try {
      const vaccineRef = doc(this.firestore, COLLECTIONS.VACCINES, vaccine.id);
      await setDoc(vaccineRef, {
        ...vaccine,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error: any) {
      throw new Error(`Sync to cloud failed: ${error.message}`);
    }
  }

  /**
   * Fetch vaccines from Firestore
   */
  private async fetchVaccinesFromCloud(petId: string): Promise<Vaccine[]> {
    const vaccinesRef = collection(this.firestore, COLLECTIONS.VACCINES);
    const q = query(
      vaccinesRef,
      where('petId', '==', petId),
      orderBy('nextDueDate', 'asc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      administeredDate: doc.data().administeredDate?.toMillis() || doc.data().administeredDate || Date.now(),
      nextDueDate: doc.data().nextDueDate?.toMillis() || doc.data().nextDueDate || Date.now(),
      createdAt: doc.data().createdAt?.toMillis() || Date.now(),
      updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
    } as Vaccine));
  }

  /**
   * Sync vaccines from Firestore to local (monthly sync)
   */
  async syncVaccinesFromCloud(petId: string): Promise<void> {
    try {
      const cloudVaccines = await this.fetchVaccinesFromCloud(petId);
      for (const vaccine of cloudVaccines) {
        await this.saveVaccineLocally(vaccine);
      }
      await this.setLastSyncDate(petId, Date.now());
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  /**
   * Get last sync date for vaccines
   */
  private async getLastSyncDate(petId: string): Promise<number | null> {
    try {
      const key = `vaccine_sync_${petId}`;
      return await localStorageService.getSetting(key);
    } catch {
      return null;
    }
  }

  /**
   * Set last sync date for vaccines
   */
  private async setLastSyncDate(petId: string, timestamp: number): Promise<void> {
    try {
      const key = `vaccine_sync_${petId}`;
      await localStorageService.saveSetting(key, timestamp);
    } catch {
      // Fail silently
    }
  }
}

// Export singleton instance
export const vaccineRepository = new VaccineRepository();

