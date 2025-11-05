import { doc, setDoc, getDoc, query, where, getDocs, collection, serverTimestamp, orderBy } from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { MedicalRecord } from '../models/medicalRecord';
import { COLLECTIONS } from '../utils/constants';
import { localStorageService } from '../services/localStorageService';

export class MedicalRecordRepository {
  private firestore = getFirestoreInstance();

  /**
   * Save medical record to local IndexedDB (primary storage)
   */
  async saveRecordLocally(record: MedicalRecord): Promise<void> {
    try {
      await localStorageService.init();
      const db = (localStorageService as any).db;
      if (!db) return;

      // Ensure medical_records object store exists
      if (!db.objectStoreNames.contains('medical_records')) {
        // Would need to handle upgrade
        return;
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['medical_records'], 'readwrite');
        const store = transaction.objectStore('medical_records');
        const request = store.put(record);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error: any) {
      console.error('Failed to save medical record locally:', error);
      // Don't throw - local save is optional
    }
  }

  /**
   * Get medical records from local IndexedDB (primary source)
   */
  async getRecordsLocally(petId: string): Promise<MedicalRecord[]> {
    try {
      await localStorageService.init();
      const db = (localStorageService as any).db;
      if (!db) return [];

      // Check if medical_records store exists
      if (!db.objectStoreNames.contains('medical_records')) {
        return [];
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['medical_records'], 'readonly');
        const store = transaction.objectStore('medical_records');
        const request = store.getAll();

        request.onsuccess = () => {
          const allRecords = request.result || [];
          const petRecords = allRecords.filter((r: MedicalRecord) => r.petId === petId);
          resolve(petRecords);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get medical records locally:', error);
      return [];
    }
  }

  /**
   * Create medical record (local-first: save locally first, then sync to Firestore)
   */
  async createMedicalRecord(
    record: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<MedicalRecord> {
    const now = Date.now();
    const recordData: MedicalRecord = {
      ...record,
      id: `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    try {
      // 1. Save locally first (optimistic - instant UI update)
      await this.saveRecordLocally(recordData);

      // 2. Sync to Firestore in background (non-blocking)
      this.syncRecordToCloud(recordData).catch((error) => {
        console.error('Background sync failed:', error);
        // Record is still saved locally, sync will retry later
      });

      return recordData;
    } catch (error: any) {
      throw new Error(`Failed to create medical record: ${error.message}`);
    }
  }

  /**
   * Get medical records for a pet (local-first)
   */
  async getMedicalRecords(petId: string): Promise<MedicalRecord[]> {
    try {
      // 1. Read from local cache (instant, no cloud read)
      const localRecords = await this.getRecordsLocally(petId);

      // 2. Return immediately (optimistic)
      if (localRecords.length > 0) {
        // Trigger background sync (non-blocking)
        this.syncRecordsFromCloud(petId).catch(console.error);
        return localRecords;
      }

      // 3. If no local data, fetch from cloud (first time only)
      const cloudRecords = await this.fetchRecordsFromCloud(petId);
      // Save to local cache
      for (const record of cloudRecords) {
        await this.saveRecordLocally(record);
      }
      return cloudRecords;
    } catch (error: any) {
      throw new Error(`Failed to get medical records: ${error.message}`);
    }
  }

  /**
   * Sync record to Firestore (background operation)
   */
  private async syncRecordToCloud(record: MedicalRecord): Promise<void> {
    try {
      const recordRef = doc(this.firestore, COLLECTIONS.MEDICAL_RECORDS, record.id);
      await setDoc(recordRef, {
        ...record,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error: any) {
      throw new Error(`Sync to cloud failed: ${error.message}`);
    }
  }

  /**
   * Fetch medical records from Firestore
   */
  private async fetchRecordsFromCloud(petId: string): Promise<MedicalRecord[]> {
    const recordsRef = collection(this.firestore, COLLECTIONS.MEDICAL_RECORDS);
    const q = query(
      recordsRef,
      where('petId', '==', petId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toMillis() || doc.data().date || Date.now(),
      createdAt: doc.data().createdAt?.toMillis() || Date.now(),
      updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
    } as MedicalRecord));
  }

  /**
   * Sync records from Firestore to local (background sync)
   */
  async syncRecordsFromCloud(petId: string): Promise<void> {
    try {
      const cloudRecords = await this.fetchRecordsFromCloud(petId);
      for (const record of cloudRecords) {
        await this.saveRecordLocally(record);
      }
    } catch (error) {
      console.error('Background sync failed:', error);
      // Fail silently - local data is still available
    }
  }
}

// Export singleton instance
export const medicalRecordRepository = new MedicalRecordRepository();

