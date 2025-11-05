/**
 * Mobile Pet Service
 * Wraps shared petRepository with mobile-specific localStorage
 */

import { petRepository } from '@pet-management/shared';
import { localStorageService } from './localStorageService';
import type { Pet } from '@pet-management/shared';

// Override localStorageService in petRepository to use mobile SQLite
// This is a workaround - in production, you'd use dependency injection
export class MobilePetService {
  /**
   * Get pets by owner ID
   */
  async getPets(ownerId: string): Promise<Pet[]> {
    try {
      // Try local first
      const localPets = await localStorageService.getPets(ownerId);
      if (localPets.length > 0) {
        // Trigger background sync
        petRepository.getPets(ownerId).catch(console.error);
        return localPets;
      }

      // Fetch from Firestore
      return await petRepository.getPets(ownerId);
    } catch (error: any) {
      throw new Error(`Failed to get pets: ${error.message}`);
    }
  }

  /**
   * Create pet
   */
  async createPet(pet: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pet> {
    try {
      const newPet = await petRepository.createPet(pet);
      
      // Save to local SQLite
      await localStorageService.savePet(newPet);
      
      return newPet;
    } catch (error: any) {
      throw new Error(`Failed to create pet: ${error.message}`);
    }
  }
}

export const mobilePetService = new MobilePetService();

