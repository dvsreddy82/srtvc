import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
  role: z.enum(['petOwner', 'staff', 'manager', 'veterinarian', 'admin']).default('petOwner'),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type User = z.infer<typeof UserSchema>;

export interface UserProfile extends User {
  phoneNumber?: string;
  address?: string;
  preferences?: {
    notifications: boolean;
    emailNotifications: boolean;
  };
}

