import { z } from 'zod';

export const InvoiceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  bookingId: z.string(),
  invoiceNumber: z.string(),
  amount: z.number(),
  tax: z.number().optional(),
  totalAmount: z.number(),
  status: z.enum(['pending', 'paid', 'overdue', 'cancelled']),
  dueDate: z.number(),
  paymentDate: z.number().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    total: z.number(),
  })),
  pdfURL: z.string().url().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;

export interface InvoiceWithDetails extends Invoice {
  booking?: {
    petName: string;
    startDate: number;
    endDate: number;
    kennelName: string;
  };
}

