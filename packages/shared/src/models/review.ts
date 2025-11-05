import { z } from 'zod';

export const ReviewSchema = z.object({
  id: z.string(),
  userId: z.string(),
  bookingId: z.string(),
  kennelId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Review = z.infer<typeof ReviewSchema>;

export interface ReviewWithDetails extends Review {
  user?: {
    displayName: string;
    email: string;
  };
  booking?: {
    petName: string;
    startDate: number;
    endDate: number;
  };
  kennel?: {
    name: string;
  };
}

