import { z } from 'zod';

export const BookingSchema = z.object({
  id: z.string(),
  userId: z.string(),
  petId: z.string(),
  kennelId: z.string(),
  runId: z.string(),
  startDate: z.number(),
  endDate: z.number(),
  status: z.enum(['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled']),
  totalAmount: z.number(),
  paymentStatus: z.enum(['pending', 'paid', 'refunded']).default('pending'),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Booking = z.infer<typeof BookingSchema>;

export interface BookingDetails extends Booking {
  pet?: {
    name: string;
    species: string;
    photoURL?: string;
  };
  kennel?: {
    name: string;
    address: string;
  };
  notes?: import('./bookingNote').BookingNote[];
  stayUpdates?: import('./stayUpdate').StayUpdate[];
}

