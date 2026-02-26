import { z } from 'zod';

export const loginSchema = z.object({
  email: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().email('Please enter a valid email address'),
  ),
  password: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().min(1, 'Password is required'),
  ),
});

export const registerSchema = z
  .object({
    name: z.preprocess(
      (val) => (typeof val === 'string' ? val.trim() : val),
      z.string().min(2, 'Name must be at least 2 characters'),
    ),
    email: z.preprocess(
      (val) => (typeof val === 'string' ? val.trim() : val),
      z.string().email('Please enter a valid email address'),
    ),
    password: z.preprocess(
      (val) => (typeof val === 'string' ? val.trim() : val),
      z.string().min(6, 'Password must be at least 6 characters'),
    ),
    confirmPassword: z.preprocess(
      (val) => (typeof val === 'string' ? val.trim() : val),
      z.string().min(1, 'Please confirm your password'),
    ),
    avatarUrl: z.preprocess(
      (val) => (typeof val === 'string' ? val.trim() : val),
      z
        .string()
        .url('Please enter a valid image URL')
        .or(z.literal(''))
        .optional(),
    ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
