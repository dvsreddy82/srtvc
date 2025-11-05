import { z } from 'zod';

export const BookingNoteSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  authorId: z.string(),
  authorRole: z.string(), // 'staff', 'manager', etc.
  content: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type BookingNote = z.infer<typeof BookingNoteSchema>;

