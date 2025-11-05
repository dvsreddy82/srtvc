import { collection, addDoc, updateDoc, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { Pet } from '../models/pet';
import { COLLECTIONS } from '../utils/constants';
import { localStorageService } from '../services/localStorageService';

export class PetRepository {
  private firestore = getFirestoreInstance();

  /**
   * Save pet to local IndexedDB (primary storage)
   */
  async savePetLocally(pet: Pet): Promise<void> {
    try {
      await localStorageService.savePet(pet);
    } catch (error: any) {
      console.error('Failed to save pet locally:', error);
      // Don't throw - local save is optional
    }
  }

  /**
   * Get pets from local IndexedDB (primary source)
   */
  async getPetsLocally(ownerId: string): Promise<Pet[]> {
    try {
      return await localStorageService.getPets(ownerId);
    } catch (error) {
      console.error('Failed to get pets locally:', error);
      return [];
    }
  }

  /**
   * Create pet (local-first: save locally first, then sync to Firestore)
   */
  async createPet(pet: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pet> {
    const now = Date.now();
    const petData: Pet = {
      ...pet,
      id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    try {
      // 1. Save locally first (optimistic - instant UI update)
      await this.savePetLocally(petData);

      // 2. Sync to Firestore in background (non-blocking)
      this.syncPetToCloud(petData).catch((error) => {
        console.error('Background sync failed:', error);
        // Pet is still saved locally, sync will retry later
      });

      return petData;
    } catch (error: any) {
      throw new Error(`Failed to create pet: ${error.message}`);
    }
  }

  /**
   * Update pet (local-first)
   */
  async updatePet(petId: string, updates: Partial<Pet>): Promise<void> {
    try {
      // Get current pet from local storage
      const localPets = await this.getPetsLocally(updates.ownerId || '');
      const pet = localPets.find((p) => p.id === petId);

      if (!pet) {
        throw new Error('Pet not found');
      }

      const updatedPet: Pet = {
        ...pet,
        ...updates,
        updatedAt: Date.now(),
      };

      // 1. Update locally first
      await this.savePetLocally(updatedPet);

      // 2. Sync to Firestore in background
      this.syncPetToCloud(updatedPet).catch((error) => {
        console.error('Background sync failed:', error);
      });
    } catch (error: any) {
      throw new Error(`Failed to update pet: ${error.message}`);
    }
  }

  /**
   * Get pet by ID (local-first)
   */
  async getPetById(petId: string, ownerId: string): Promise<Pet | null> {
    try {
      // Try local first
      const localPets = await this.getPetsLocally(ownerId);
      const pet = localPets.find((p) => p.id === petId);

      if (pet) {
        // Trigger background sync (non-blocking)
        this.syncPetsFromCloud(ownerId).catch(console.error);
        return pet;
      }

      // If not in local, fetch from Firestore (first time only)
      return await this.fetchPetFromCloud(petId);
    } catch (error: any) {
      throw new Error(`Failed to get pet: ${error.message}`);
    }
  }

  /**
   * Get all pets for owner (local-first)
   */
  async getPets(ownerId: string): Promise<Pet[]> {
    try {
      // 1. Read from local cache (instant, no cloud read)
      const localPets = await this.getPetsLocally(ownerId);

      // 2. Return immediately (optimistic)
      if (localPets.length > 0) {
        // Trigger background sync (non-blocking)
        this.syncPetsFromCloud(ownerId).catch(console.error);
        return localPets;
      }

      // 3. If no local data, fetch from cloud (first time only)
      const cloudPets = await this.fetchPetsFromCloud(ownerId);
      // Save to local cache
      for (const pet of cloudPets) {
        await this.savePetLocally(pet);
      }
      return cloudPets;
    } catch (error: any) {
      throw new Error(`Failed to get pets: ${error.message}`);
    }
  }

  /**
   * Sync pet to Firestore (background operation)
   */
  private async syncPetToCloud(pet: Pet): Promise<void> {
    try {
      const petRef = doc(this.firestore, COLLECTIONS.PETS, pet.id);
      await setDoc(petRef, {
        ...pet,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error: any) {
      throw new Error(`Sync to cloud failed: ${error.message}`);
    }
  }

  /**
   * Fetch pets from Firestore
   */
  private async fetchPetsFromCloud(ownerId: string): Promise<Pet[]> {
    const { query, where, getDocs } = await import('firebase/firestore');
    const petsRef = collection(this.firestore, COLLECTIONS.PETS);
    const q = query(petsRef, where('ownerId', '==', ownerId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || Date.now(),
      updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
    } as Pet));
  }

  /**
   * Fetch single pet from Firestore
   */
  private async fetchPetFromCloud(petId: string): Promise<Pet | null> {
    const petRef = doc(this.firestore, COLLECTIONS.PETS, petId);
    const snapshot = await getDoc(petRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt?.toMillis() || Date.now(),
      updatedAt: data.updatedAt?.toMillis() || Date.now(),
    } as Pet;
  }

  /**
   * Sync pets from Firestore to local (background sync)
   */
  async syncPetsFromCloud(ownerId: string): Promise<void> {
    try {
      const cloudPets = await this.fetchPetsFromCloud(ownerId);
      for (const pet of cloudPets) {
        await this.savePetLocally(pet);
      }
    } catch (error) {
      console.error('Background sync failed:', error);
      // Fail silently - local data is still available
    }
  }
}

// Export singleton instance
export const petRepository = new PetRepository();

