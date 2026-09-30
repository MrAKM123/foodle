import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  phone: z.string().optional().nullable(),
  role: z.enum(['CUSTOMER', 'RESTAURANT', 'RIDER', 'ADMIN']).default('CUSTOMER'),
  
  // Optional initial details for Restaurant / Rider
  restaurantName: z.string().optional(),
  cuisineTypes: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  vehicleType: z.string().optional(),
  vehicleNumber: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

export const resendOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional().nullable(),
  avatar: z.string().url('Invalid avatar URL').optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});
