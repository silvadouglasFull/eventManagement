import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string({ error: 'Email is required.' }).email({ message: 'Invalid email address.' }),
    password: z.string({ error: 'Password is required.' }),
});