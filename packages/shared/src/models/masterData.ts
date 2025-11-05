import { z } from 'zod';

export const BreedSchema = z.object({
  id: z.string(),
  species: z.string(),
  name: z.string(),
  isActive: z.boolean().default(true),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Breed = z.infer<typeof BreedSchema>;

export const VaccineTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  species: z.array(z.string()), // e.g., ['dog', 'cat']
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type VaccineType = z.infer<typeof VaccineTypeSchema>;

export interface MasterData {
  breeds: Breed[];
  vaccineTypes: VaccineType[];
}

