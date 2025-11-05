import { z } from 'zod';

export const PetSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  name: z.string(),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other']),
  breed: z.string().optional(),
  dateOfBirth: z.number().optional(), // Timestamp
  weight: z.number().optional(), // in kg
  photoURL: z.string().url().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Pet = z.infer<typeof PetSchema>;

// Note: MedicalRecord, Vaccine, and Booking are defined in their own model files
// This interface is kept for type compatibility
export interface PetWithDetails extends Pet {
  medicalRecords?: import('./medicalRecord').MedicalRecord[];
  vaccines?: import('./vaccine').Vaccine[];
  bookings?: import('./booking').Booking[];
}

