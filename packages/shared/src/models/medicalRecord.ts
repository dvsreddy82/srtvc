import { z } from 'zod';

export const MedicalRecordSchema = z.object({
  id: z.string(),
  petId: z.string(),
  petOwnerId: z.string(),
  recordType: z.enum(['vaccination', 'checkup', 'treatment', 'surgery', 'other']),
  date: z.number(),
  veterinarianId: z.string().optional(),
  clinicName: z.string().optional(),
  clinicId: z.string().optional(),
  notes: z.string().optional(),
  documents: z.array(z.string().url()).default([]),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type MedicalRecord = z.infer<typeof MedicalRecordSchema>;

export interface MedicalRecordWithDetails extends MedicalRecord {
  pet?: {
    name: string;
    species: string;
  };
  veterinarian?: {
    name: string;
    clinic: string;
  };
}

