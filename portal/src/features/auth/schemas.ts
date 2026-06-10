/**
 * Zod schemas for the auth forms (login, register, forgot/reset password).
 *
 * These replace the hand-rolled `if (!field)` checks the pages used before.
 * Password length rules intentionally match the previous behaviour:
 * register requires 6+, reset requires 8+.
 */
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
})
export type LoginValues = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
})
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export const registerSchema = z
  .object({
    role: z.enum(['jobseeker', 'employer']),
    fullName: z.string().trim().min(1, 'Full name is required'),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
    phone: z.string().trim().min(1, 'Phone number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    experienceLevel: z.string().optional(),
    companyName: z.string().optional(),
    companyDescription: z.string().optional(),
    companyWebsite: z.string().optional(),
    companySize: z.string().optional(),
    industry: z.string().optional(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })
  .refine((v) => v.role !== 'employer' || !!v.companyName?.trim(), {
    path: ['companyName'],
    message: 'Company name is required for employer accounts',
  })
export type RegisterValues = z.infer<typeof registerSchema>
