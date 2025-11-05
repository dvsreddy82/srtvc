/**
 * Medical Record Service
 * Handles medical record document uploads and management
 */

import { imageService } from './imageService';
import { medicalRecordRepository } from '../repositories/medicalRecordRepository';
import type { MedicalRecord } from '../models/medicalRecord';

export interface UploadVaccineDocumentData {
  petId: string;
  petOwnerId: string;
  file: File;
  recordType: MedicalRecord['recordType'];
  date: number;
  veterinarianId?: string;
  clinicName?: string;
  notes?: string;
}

export class MedicalRecordService {
  /**
   * Upload vaccine document and create medical record
   */
  async uploadVaccineDocument(data: UploadVaccineDocumentData): Promise<MedicalRecord> {
    try {
      // 1. Upload document to Firebase Storage
      const documentURL = await imageService.uploadVaccineDocument(
        data.file,
        data.petOwnerId,
        data.petId,
        data.file.name.replace(/\.[^/.]+$/, '') // Remove extension for document name
      );

      // 2. Create medical record with document URL
      const record: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        petId: data.petId,
        petOwnerId: data.petOwnerId,
        recordType: data.recordType,
        date: data.date,
        veterinarianId: data.veterinarianId,
        clinicName: data.clinicName,
        notes: data.notes,
        documents: [documentURL],
      };

      // 3. Save record (local-first, then sync to Firestore)
      const medicalRecord = await medicalRecordRepository.createMedicalRecord(record);

      return medicalRecord;
    } catch (error: any) {
      throw new Error(`Failed to upload vaccine document: ${error.message}`);
    }
  }

  /**
   * Get all medical records for a pet
   */
  async getMedicalRecords(petId: string): Promise<MedicalRecord[]> {
    return await medicalRecordRepository.getMedicalRecords(petId);
  }

  /**
   * Get medical record by ID
   */
  async getMedicalRecordById(recordId: string, petId: string): Promise<MedicalRecord | null> {
    const records = await medicalRecordRepository.getMedicalRecords(petId);
    return records.find((r) => r.id === recordId) || null;
  }
}

// Export singleton instance
export const medicalRecordService = new MedicalRecordService();

