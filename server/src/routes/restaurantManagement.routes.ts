import { Router } from 'express';
import { RestaurantManagementController } from '../controllers/restaurantManagement.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  updateOrderStatusSchema,
  createCategorySchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  updateRestaurantProfileSchema,
} from '../validators/restaurantManagement.validator.js';

const router = Router();

// Strictly enforce Restaurant Owner or Admin access
router.use(authenticate, requireRole(['RESTAURANT', 'ADMIN']));

// Restaurant Profile & Store Settings
router.get('/profile', RestaurantManagementController.getProfile);
router.put(
  '/profile',
  validateBody(updateRestaurantProfileSchema),
  RestaurantManagementController.updateProfile
);

// Live Orders & Status Pipeline
router.get('/orders', RestaurantManagementController.getOrders);
router.put(
  '/orders/:id/status',
  validateBody(updateOrderStatusSchema),
  RestaurantManagementController.updateOrderStatus
);

// Menu Catalog Management
router.get('/menu', RestaurantManagementController.getMenu);
router.post(
  '/menu/categories',
  validateBody(createCategorySchema),
  RestaurantManagementController.createCategory
);
router.post(
  '/menu/items',
  validateBody(createMenuItemSchema),
  RestaurantManagementController.createMenuItem
);
router.put(
  '/menu/items/:id',
  validateBody(updateMenuItemSchema),
  RestaurantManagementController.updateMenuItem
);
router.delete('/menu/items/:id', RestaurantManagementController.deleteMenuItem);

// Earnings & Commission Breakdown
router.get('/earnings', RestaurantManagementController.getEarnings);

export default router;
