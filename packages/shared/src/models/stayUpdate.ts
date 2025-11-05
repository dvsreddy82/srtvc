import { z } from 'zod';

export const StayUpdateSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  type: z.enum(['photo', 'note', 'meal', 'activity', 'health']),
  content: z.string().optional(),
  photoURLs: z.array(z.string().url()).default([]),
  timestamp: z.number(),
  staffId: z.string(),
  staffName: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type StayUpdate = z.infer<typeof StayUpdateSchema>;

export interface StayUpdateWithDetails extends StayUpdate {
  booking?: {
    petName: string;
    petPhotoURL?: string;
    startDate: number;
    endDate: number;
  };
}

