import { z } from 'zod';

export const createOrderSchema = z.object({
  restaurantId: z.string().uuid('Invalid restaurant ID'),
  addressId: z.string().uuid('Invalid address ID'),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid('Invalid menu item ID'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        selectedVariants: z.array(z.any()).optional().default([]),
        selectedAddons: z.array(z.any()).optional().default([]),
      })
    )
    .min(1, 'Order must contain at least one item'),
  paymentMethod: z.enum(['RAZORPAY', 'COD']).default('RAZORPAY'),
  couponCode: z.string().optional().nullable(),
  restaurantNotes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
});

export const verifyRazorpayPaymentSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required'),
});
