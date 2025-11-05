import { z } from 'zod';

export const KennelRunSchema = z.object({
  id: z.string(),
  kennelId: z.string(),
  name: z.string(),
  sizeCategory: z.enum(['small', 'medium', 'large', 'extra-large']), // Based on pet size
  capacity: z.number(), // Total capacity
  available: z.number(), // Current available slots
  pricePerDay: z.number(),
  amenities: z.array(z.string()).optional(), // e.g., ["indoor", "outdoor", "heated"]
  isActive: z.boolean().default(true),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type KennelRun = z.infer<typeof KennelRunSchema>;

export const KennelSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default('US'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  description: z.string().optional(),
  rating: z.number().optional(), // Average rating
  reviewCount: z.number().optional(), // Number of reviews
  photoURL: z.string().url().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Kennel = z.infer<typeof KennelSchema>;

export interface KennelWithRuns extends Kennel {
  runs: KennelRun[];
}

export interface KennelSearchFilters {
  startDate: number; // Timestamp
  endDate: number; // Timestamp
  sizeCategory?: 'small' | 'medium' | 'large' | 'extra-large';
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  city?: string;
  state?: string;
}

export interface KennelSearchResult {
  kennel: Kennel;
  runs: KennelRun[];
  availableRuns: KennelRun[];
  totalPrice: number;
}

