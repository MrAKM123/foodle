import { Request, Response } from 'express';
import { LedgerService } from '../services/ledger.service.js';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class LedgerController {
  /**
   * Restaurant Partner ledger
   */
  static async getRestaurantLedger(req: Request, res: Response): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId as string;
      const user = req.user!;

      // If user is RESTAURANT role, ensure they own this restaurant
      if (user.role === 'RESTAURANT') {
        const ownsRestaurant = await prisma.restaurant.findFirst({
          where: { id: restaurantId, ownerId: user.id },
        });
        if (!ownsRestaurant) {
          sendError(res, 'Access denied: You do not own this restaurant', 403);
          return;
        }
      }

      const ledger = await LedgerService.getRestaurantLedger(restaurantId);
      sendSuccess(res, ledger, 'Restaurant ledger fetched successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch restaurant ledger', 400);
    }
  }

  /**
   * Rider Partner ledger
   */
  static async getRiderLedger(req: Request, res: Response): Promise<void> {
    try {
      const riderId = req.params.riderId as string;
      const user = req.user!;

      // If user is RIDER role, ensure they own this profile
      if (user.role === 'RIDER') {
        const ownsProfile = await prisma.riderProfile.findFirst({
          where: { id: riderId, userId: user.id },
        });
        if (!ownsProfile) {
          sendError(res, 'Access denied: You do not own this rider profile', 403);
          return;
        }
      }

      const ledger = await LedgerService.getRiderLedger(riderId);
      sendSuccess(res, ledger, 'Rider ledger fetched successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch rider ledger', 400);
    }
  }

  /**
   * Admin platform financial journal
   */
  static async getPlatformFinancialJournal(req: Request, res: Response): Promise<void> {
    try {
      const journal = await LedgerService.getPlatformFinancialJournal();
      sendSuccess(res, journal, 'Platform financial journal fetched successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch platform journal', 400);
    }
  }

  /**
   * Admin mark payouts settled
   */
  static async settlePayouts(req: Request, res: Response): Promise<void> {
    try {
      const { transactionIds } = req.body;
      if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
        sendError(res, 'Please provide an array of transactionIds', 400);
        return;
      }

      const result = await LedgerService.settlePayouts(transactionIds);
      sendSuccess(res, result, `${result.count} payouts marked as SETTLED`);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to settle payouts', 400);
    }
  }
}
