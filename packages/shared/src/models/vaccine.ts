import { z } from 'zod';

export const VaccineSchema = z.object({
  id: z.string(),
  petId: z.string(),
  type: z.string(), // e.g., "Rabies", "DHPP", "Bordetella"
  administeredDate: z.number(), // Timestamp
  nextDueDate: z.number(), // Timestamp
  veterinarianId: z.string().optional(),
  clinicName: z.string().optional(),
  batchNumber: z.string().optional(),
  documentURL: z.string().url().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Vaccine = z.infer<typeof VaccineSchema>;

export interface VaccineScheduleItem {
  vaccineType: string;
  lastAdministeredDate: number | null;
  nextDueDate: number | null;
  daysUntilDue: number | null;
  isOverdue: boolean;
  isDueSoon: boolean; // Due in next 7 days
}

export interface VaccineSchedule {
  petId: string;
  petName: string;
  vaccines: VaccineScheduleItem[];
  lastSyncDate: number;
}

// Vaccine type configurations (standard intervals)
export const VACCINE_INTERVALS: Record<string, number> = {
  // Dogs
  'Rabies': 365, // 1 year
  'DHPP': 365, // 1 year (Distemper, Hepatitis, Parvovirus, Parainfluenza)
  'Bordetella': 365, // 1 year (Kennel Cough)
  'Lyme': 365, // 1 year
  'Leptospirosis': 365, // 1 year
  'Canine Influenza': 365, // 1 year
  
  // Cats
  'FVRCP': 365, // 1 year (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)
  'FeLV': 365, // 1 year (Feline Leukemia)
  'Rabies (Cat)': 365, // 1 year
  
  // Puppy/Kitten initial series
  'DHPP (Puppy)': 21, // 3 weeks for initial series
  'FVRCP (Kitten)': 21, // 3 weeks for initial series
};

// Default vaccine schedule based on species
export const DEFAULT_VACCINE_SCHEDULES: Record<string, string[]> = {
  dog: ['Rabies', 'DHPP', 'Bordetella'],
  cat: ['FVRCP', 'Rabies (Cat)', 'FeLV'],
  bird: [],
  rabbit: [],
  other: [],
};

