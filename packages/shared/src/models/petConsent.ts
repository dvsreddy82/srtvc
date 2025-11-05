import { z } from 'zod';

export const PetConsentSchema = z.object({
  id: z.string(),
  petId: z.string(),
  ownerId: z.string(),
  veterinarianId: z.string().optional(),
  clinicId: z.string().optional(),
  clinicName: z.string(),
  consentType: z.enum(['medical_record', 'vaccination', 'full']),
  granted: z.boolean(),
  grantedAt: z.number().optional(),
  expiresAt: z.number().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type PetConsent = z.infer<typeof PetConsentSchema>;

