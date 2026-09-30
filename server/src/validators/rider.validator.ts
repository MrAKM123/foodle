import { z } from 'zod';

export const toggleOnlineSchema = z.object({
  isOnline: z.boolean(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const updateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const advanceTripStatusSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  step: z.enum(['REACHED_RESTAURANT', 'PICKED_UP', 'REACHED_CUSTOMER', 'DELIVERED']),
  deliveryOtp: z.string().length(4, 'Delivery OTP must be 4 digits').optional(),
});
