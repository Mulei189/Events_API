import { email, z } from 'zod';

// Sign-up validation schema
export const signUpSchema = z.object({
    name: z.string().min(2).max(255).trim(),
    email: email().max(255).trim().toLowerCase(),
    password: z.string().min(6).max(255),
    role: z.enum(['attendee', 'organizer']).default('attendee'),
});

// Sign-in validation schema
export const signInSchema = z.object({
    email: email().max(255).trim().toLowerCase(),
    password: z.string().min(6).max(255),
})