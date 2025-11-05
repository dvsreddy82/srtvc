/**
 * Veterinarian Service
 * Handles veterinarian operations with consent verification
 */

import { medicalRecordRepository } from '../repositories/medicalRecordRepository';
import { petConsentRepository } from '../repositories/petConsentRepository';
import { MedicalRecord } from '../models/medicalRecord';

export class VeterinarianService {
  /**
   * Submit or update a pet's medical record (with consent verification)
   */
  async submitMedicalRecord(
    veterinarianId: string,
    clinicId: string,
    clinicName: string,
    medicalRecord: Omit<MedicalRecord, 'id' | 'petOwnerId' | 'createdAt' | 'updatedAt'>
  ): Promise<MedicalRecord> {
    // Verify consent
    const consent = await petConsentRepository.checkConsent(
      medicalRecord.petId,
      veterinarianId,
      clinicId
    );

    if (!consent) {
      throw new Error('Pet owner consent required to submit medical records');
    }

    // Create medical record with veterinarian and clinic information
    return await medicalRecordRepository.createMedicalRecord({
      ...medicalRecord,
      petOwnerId: consent.ownerId,
      veterinarianId,
      clinicId,
      clinicName,
    });
  }

  /**
   * Get medical history for a specific pet (with consent verification)
   */
  async getMedicalHistory(
    petId: string,
    veterinarianId?: string,
    clinicId?: string
  ): Promise<MedicalRecord[]> {
    // Verify consent
    const consent = await petConsentRepository.checkConsent(
      petId,
      veterinarianId,
      clinicId
    );

    if (!consent) {
      throw new Error('Pet owner consent required to view medical history');
    }

    // Get medical records
    return await medicalRecordRepository.getMedicalRecords(petId);
  }
}

// Export singleton instance
export const veterinarianService = new VeterinarianService();

