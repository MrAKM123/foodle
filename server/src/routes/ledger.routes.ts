import { Router } from 'express';
import { LedgerController } from '../controllers/ledger.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Restaurant partner or admin access to restaurant ledger
router.get(
  '/restaurant/:restaurantId',
  authenticate,
  requireRole(['RESTAURANT', 'ADMIN']),
  LedgerController.getRestaurantLedger
);

// Rider partner or admin access to rider ledger
router.get(
  '/rider/:riderId',
  authenticate,
  requireRole(['RIDER', 'ADMIN']),
  LedgerController.getRiderLedger
);

// Super admin exclusive financial journal & settlement
router.get(
  '/platform',
  authenticate,
  requireRole(['ADMIN']),
  LedgerController.getPlatformFinancialJournal
);

router.post(
  '/payouts/settle',
  authenticate,
  requireRole(['ADMIN']),
  LedgerController.settlePayouts
);

export default router;
