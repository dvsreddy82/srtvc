import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { Invoice } from '../models/invoice';
import { COLLECTIONS } from '../utils/constants';
import { localStorageService } from '../services/localStorageService';

export class InvoiceRepository {
  private firestore = getFirestoreInstance();

  /**
   * Save invoice metadata to local IndexedDB (primary storage)
   */
  async saveInvoiceLocally(invoice: Invoice): Promise<void> {
    try {
      await localStorageService.init();
      const db = (localStorageService as any).db;
      if (!db) return;

      if (!db.objectStoreNames.contains('invoices')) {
        return;
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['invoices'], 'readwrite');
        const store = transaction.objectStore('invoices');
        const request = store.put(invoice);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error: any) {
      console.error('Failed to save invoice locally:', error);
    }
  }

  /**
   * Get invoices from local IndexedDB (primary source)
   */
  async getInvoicesLocally(userId: string): Promise<Invoice[]> {
    try {
      await localStorageService.init();
      const db = (localStorageService as any).db;
      if (!db) return [];

      if (!db.objectStoreNames.contains('invoices')) {
        return [];
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['invoices'], 'readonly');
        const store = transaction.objectStore('invoices');
        const request = store.getAll();

        request.onsuccess = () => {
          const allInvoices = request.result || [];
          const userInvoices = allInvoices
            .filter((inv: Invoice) => inv.userId === userId)
            .sort((a: Invoice, b: Invoice) => b.createdAt - a.createdAt);
          resolve(userInvoices);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get invoices locally:', error);
      return [];
    }
  }

  /**
   * Get invoices for a user (local-first: sync once on login, never re-read)
   */
  async getInvoices(userId: string): Promise<Invoice[]> {
    try {
      // 1. Always read from local cache (zero cloud reads after initial sync)
      const localInvoices = await this.getInvoicesLocally(userId);

      // 2. Check if we need initial sync (only on first login)
      const lastSync = await this.getLastSyncDate(userId);
      if (!lastSync && localInvoices.length === 0) {
        // First time - sync from Firestore
        const cloudInvoices = await this.fetchInvoicesFromCloud(userId);
        for (const invoice of cloudInvoices) {
          await this.saveInvoiceLocally(invoice);
        }
        await this.setLastSyncDate(userId, Date.now());
        return cloudInvoices;
      }

      // 3. Return local invoices (no cloud read)
      return localInvoices;
    } catch (error: any) {
      throw new Error(`Failed to get invoices: ${error.message}`);
    }
  }

  /**
   * Sync new invoices from Firestore (on-demand only)
   */
  async syncNewInvoices(userId: string): Promise<void> {
    try {
      const lastSync = await this.getLastSyncDate(userId);
      const localInvoices = await this.getInvoicesLocally(userId);
      const latestLocalDate = localInvoices.length > 0 
        ? Math.max(...localInvoices.map((inv: Invoice) => inv.createdAt))
        : 0;

      // Fetch only invoices created after last sync
      const { Timestamp } = await import('firebase/firestore');
      const invoicesRef = collection(this.firestore, COLLECTIONS.INVOICES);
      const q = query(
        invoicesRef,
        where('userId', '==', userId),
        where('createdAt', '>', Timestamp.fromMillis(latestLocalDate)),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);

      const newInvoices = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || Date.now(),
        updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
        dueDate: doc.data().dueDate?.toMillis() || doc.data().dueDate || Date.now(),
        paymentDate: doc.data().paymentDate?.toMillis() || doc.data().paymentDate,
      } as Invoice));

      // Save new invoices locally
      for (const invoice of newInvoices) {
        await this.saveInvoiceLocally(invoice);
      }
      await this.setLastSyncDate(userId, Date.now());
    } catch (error) {
      console.error('Failed to sync new invoices:', error);
    }
  }

  /**
   * Fetch invoices from Firestore (initial sync only)
   */
  private async fetchInvoicesFromCloud(userId: string): Promise<Invoice[]> {
    const invoicesRef = collection(this.firestore, COLLECTIONS.INVOICES);
    const q = query(
      invoicesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || Date.now(),
      updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
      dueDate: doc.data().dueDate?.toMillis() || doc.data().dueDate || Date.now(),
      paymentDate: doc.data().paymentDate?.toMillis() || doc.data().paymentDate,
    } as Invoice));
  }

  /**
   * Get last sync date for invoices
   */
  private async getLastSyncDate(userId: string): Promise<number | null> {
    try {
      const key = `invoice_sync_${userId}`;
      return await localStorageService.getSetting(key);
    } catch {
      return null;
    }
  }

  /**
   * Set last sync date for invoices
   */
  private async setLastSyncDate(userId: string, timestamp: number): Promise<void> {
    try {
      const key = `invoice_sync_${userId}`;
      await localStorageService.saveSetting(key, timestamp);
    } catch {
      // Fail silently
    }
  }
}

// Export singleton instance
export const invoiceRepository = new InvoiceRepository();

