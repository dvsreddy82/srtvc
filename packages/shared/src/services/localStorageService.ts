/**
 * Local Storage Service
 * Provides platform-agnostic interface for local storage
 * Web: IndexedDB, Mobile: SQLite/AsyncStorage, Desktop: SQLite/Electron Store
 */

// Web: IndexedDB implementation
export class LocalStorageService {
  private dbName: string;
  private dbVersion: number = 1;
  private db: IDBDatabase | null = null;

  constructor(dbName: string = 'pet-management') {
    this.dbName = dbName;
  }

  /**
   * Initialize IndexedDB (Web)
   */
  async init(): Promise<void> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      throw new Error('IndexedDB not available');
    }
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('pets')) {
          db.createObjectStore('pets', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('bookings')) {
          db.createObjectStore('bookings', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('medical_records')) {
          db.createObjectStore('medical_records', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('vaccines')) {
          db.createObjectStore('vaccines', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('kennels')) {
          db.createObjectStore('kennels', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('kennel_runs')) {
          db.createObjectStore('kennel_runs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('stay_updates')) {
          db.createObjectStore('stay_updates', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('invoices')) {
          db.createObjectStore('invoices', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Save user profile to local storage
   */
  async saveUser(user: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.put(user);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save pet to local storage
   */
  async savePet(pet: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pets'], 'readwrite');
      const store = transaction.objectStore('pets');
      const request = store.put(pet);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get pet from local storage
   */
  async getPet(petId: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pets'], 'readonly');
      const store = transaction.objectStore('pets');
      const request = store.get(petId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all pets for owner from local storage
   */
  async getPets(ownerId: string): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pets'], 'readonly');
      const store = transaction.objectStore('pets');
      const request = store.getAll();

      request.onsuccess = () => {
        const allPets = request.result || [];
        const ownerPets = allPets.filter((p: any) => p.ownerId === ownerId);
        resolve(ownerPets);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get user profile from local storage
   */
  async getUser(userId: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(userId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete user from local storage
   */
  async deleteUser(userId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.delete(userId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save setting
   */
  async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get setting
   */
  async getSetting(key: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result?.value || null);
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();

