import { z } from 'zod';

export const listRestaurantsQuerySchema = z.object({
  search: z.string().optional(),
  cuisine: z.string().optional(),
  isVeg: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  minRating: z.preprocess((val) => (val ? Number(val) : undefined), z.number().min(0).max(5).optional()),
  isOpen: z.preprocess((val) => (val !== undefined ? val === 'true' || val === true : undefined), z.boolean().optional()),
  sortBy: z.enum(['rating_desc', 'prep_time_asc', 'min_order_asc', 'name_asc']).optional().default('rating_desc'),
  page: z.preprocess((val) => (val ? Math.max(1, Number(val)) : 1), z.number().optional().default(1)),
  limit: z.preprocess((val) => (val ? Math.max(1, Number(val)) : 12), z.number().optional().default(12)),
});
