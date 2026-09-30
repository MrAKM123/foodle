import { z } from 'zod';

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'RESTAURANT_ACCEPTED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'REJECTED',
    'CANCELLED',
  ]),
  prepTimeMinutes: z.number().int().min(5).max(120).optional(),
  rejectionReason: z.string().max(250).optional().nullable(),
});

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').trim(),
  sortOrder: z.number().int().optional().default(0),
});

export const createMenuItemSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  name: z.string().min(2, 'Item name must be at least 2 characters').trim(),
  description: z.string().max(500).optional().nullable(),
  price: z.number().positive('Price must be greater than 0'),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  isVeg: z.boolean().default(true),
  prepTimeMinutes: z.number().int().min(1).max(120).default(15),
  spiceLevel: z.number().int().min(0).max(3).default(1),
});

export const updateMenuItemSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().max(500).optional().nullable(),
  price: z.number().positive().optional(),
  imageUrl: z.string().url().optional().nullable(),
  isVeg: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  prepTimeMinutes: z.number().int().min(1).max(120).optional(),
  spiceLevel: z.number().int().min(0).max(3).optional(),
});

export const updateRestaurantProfileSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  phone: z.string().optional(),
  isOpen: z.boolean().optional(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  minOrderAmount: z.number().nonnegative().optional(),
  avgPrepTimeMinutes: z.number().int().min(5).max(120).optional(),
  bannerUrl: z.string().url().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
});
