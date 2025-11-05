/**
 * Invoice Service
 * Handles invoice download and local file caching
 */

import { ref, getDownloadURL } from 'firebase/storage';
import { getStorageInstance } from '../config/firebase';
import { STORAGE_PATHS } from '../utils/constants';
import { Invoice } from '../models/invoice';

export class InvoiceService {
  /**
   * Download invoice PDF and cache locally (Web: IndexedDB, Desktop: File System)
   */
  async downloadAndCacheInvoice(invoice: Invoice): Promise<string> {
    if (!invoice.pdfURL) {
      throw new Error('Invoice PDF URL not available');
    }

    try {
      // Check if already cached
      const cachedURL = await this.getCachedInvoice(invoice.id);
      if (cachedURL) {
        return cachedURL; // Return cached version (instant, no download)
      }

      // Download from Firebase Storage
      const response = await fetch(invoice.pdfURL);
      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }

      const blob = await response.blob();

      // Cache in IndexedDB (Web)
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        await this.cacheInvoiceInIndexedDB(invoice.id, blob);
        return URL.createObjectURL(blob);
      }

      // For Electron/Desktop, would use file system
      // For now, return blob URL
      return URL.createObjectURL(blob);
    } catch (error: any) {
      throw new Error(`Failed to download invoice: ${error.message}`);
    }
  }

  /**
   * Get cached invoice from IndexedDB
   */
  private async getCachedInvoice(invoiceId: string): Promise<string | null> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return null;
    }

    try {
      const db = await this.getInvoiceDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['invoices'], 'readonly');
        const store = transaction.objectStore('invoices');
        const request = store.get(invoiceId);

        request.onsuccess = () => {
          if (request.result) {
            const blob = request.result.blob;
            resolve(URL.createObjectURL(blob));
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  /**
   * Cache invoice in IndexedDB
   */
  private async cacheInvoiceInIndexedDB(invoiceId: string, blob: Blob): Promise<void> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return;
    }

    const db = await this.getInvoiceDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['invoices'], 'readwrite');
      const store = transaction.objectStore('invoices');
      const request = store.put({ id: invoiceId, blob, cachedAt: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get or create invoice database
   */
  private async getInvoiceDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      throw new Error('IndexedDB not available');
    }
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open('invoice-cache', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('invoices')) {
          db.createObjectStore('invoices', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Get invoice download URL from Firebase Storage
   */
  async getInvoiceURL(userId: string, invoiceId: string): Promise<string> {
    const storage = getStorageInstance();
    const storageRef = ref(storage, `${STORAGE_PATHS.INVOICES}/${userId}/${invoiceId}.pdf`);
    return await getDownloadURL(storageRef);
  }
}

// Export singleton instance
export const invoiceService = new InvoiceService();

