/**
 * Admin Service
 * Handles admin operations like managing master data and users
 */

import { masterDataRepository } from '../repositories/masterDataRepository';
import { managerService } from './managerService';
import type { Breed, VaccineType } from '../models/masterData';

export class AdminService {
  /**
   * Get all breeds
   */
  async getBreeds(species?: string): Promise<Breed[]> {
    return await masterDataRepository.getBreeds(species);
  }

  /**
   * Save breed (create or update)
   */
  async saveBreed(
    breed: Omit<Breed, 'id' | 'createdAt' | 'updatedAt'> | Breed,
    adminId: string
  ): Promise<Breed> {
    const savedBreed = await masterDataRepository.saveBreed(breed);
    
    // Log audit entry
    await managerService.logAuditEntry(
      adminId,
      'id' in breed && breed.id ? 'update' : 'create',
      'breed',
      savedBreed.id,
      { species: savedBreed.species, name: savedBreed.name }
    );

    return savedBreed;
  }

  /**
   * Get all vaccine types
   */
  async getVaccineTypes(species?: string): Promise<VaccineType[]> {
    return await masterDataRepository.getVaccineTypes(species);
  }

  /**
   * Save vaccine type (create or update)
   */
  async saveVaccineType(
    vaccineType: Omit<VaccineType, 'id' | 'createdAt' | 'updatedAt'> | VaccineType,
    adminId: string
  ): Promise<VaccineType> {
    const savedVaccineType = await masterDataRepository.saveVaccineType(vaccineType);
    
    // Log audit entry
    await managerService.logAuditEntry(
      adminId,
      'id' in vaccineType && vaccineType.id ? 'update' : 'create',
      'vaccine_type',
      savedVaccineType.id,
      { name: savedVaccineType.name }
    );

    return savedVaccineType;
  }
}

// Export singleton instance
export const adminService = new AdminService();

