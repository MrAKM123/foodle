import { Router } from 'express';
import { RiderController } from '../controllers/rider.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  toggleOnlineSchema,
  updateLocationSchema,
  advanceTripStatusSchema,
} from '../validators/rider.validator.js';

const router = Router();

router.use(authenticate, requireRole(['RIDER', 'ADMIN']));

// Rider profile & duty status
router.get('/profile', RiderController.getProfile);
router.put('/toggle-online', validateBody(toggleOnlineSchema), RiderController.toggleOnline);
router.put('/location', validateBody(updateLocationSchema), RiderController.updateLocation);

// Offers & Dispatches
router.get('/offers', RiderController.getOffers);
router.post('/offers/:id/accept', RiderController.acceptOffer);
router.post('/offers/:id/reject', RiderController.rejectOffer);

// Active trip & OTP verification
router.get('/active-trip', RiderController.getActiveTrip);
router.put(
  '/trip/advance-status',
  validateBody(advanceTripStatusSchema),
  RiderController.advanceTripStatus
);

// Wallet & Payout history
router.get('/wallet', RiderController.getWallet);

export default router;
