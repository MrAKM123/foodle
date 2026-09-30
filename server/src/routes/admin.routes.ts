import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Strictly locked to ADMIN role
router.use(authenticate, requireRole(['ADMIN']));

// 1. Platform Telemetry
router.get('/metrics', AdminController.getMetrics);

// 2. Restaurant Moderation & Onboarding
router.get('/restaurants', AdminController.getRestaurants);
router.put('/restaurants/:id/verify', AdminController.verifyRestaurant);

// 3. Rider Fleet & KYC Verification
router.get('/riders', AdminController.getRiders);
router.put('/riders/:id/verify', AdminController.verifyRider);

// 4. Order Management & Force Actions
router.get('/orders', AdminController.getOrders);
router.post('/orders/:id/cancel', AdminController.forceCancelOrder);

// 5. Coupons & Promotions
router.get('/coupons', AdminController.getCoupons);
router.post('/coupons', AdminController.createCoupon);
router.put('/coupons/:id/toggle', AdminController.toggleCoupon);

export default router;
