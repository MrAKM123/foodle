import { Request, Response } from 'express';
import { RiderService } from '../services/rider.service.js';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class RiderController {
  private static async getRiderProfileId(userId: string): Promise<string> {
    const rider = await prisma.riderProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!rider) {
      throw new Error('Rider profile not found for this account');
    }
    return rider.id;
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await RiderService.getRiderProfile(userId);
      sendSuccess(res, profile, 'Rider profile fetched');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch rider profile', 400);
    }
  }

  static async toggleOnline(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { isOnline, lat, lng } = req.body;
      const updated = await RiderService.toggleOnline(userId, isOnline, lat, lng);
      sendSuccess(res, updated, `You are now ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update online status', 400);
    }
  }

  static async updateLocation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { lat, lng } = req.body;
      const updated = await RiderService.updateLocation(userId, lat, lng);
      sendSuccess(res, updated, 'Location updated');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update location', 400);
    }
  }

  static async getOffers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const riderId = await RiderController.getRiderProfileId(userId);
      const offers = await RiderService.getRiderPendingOffers(riderId);
      sendSuccess(res, offers, 'Delivery offers fetched');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch offers', 400);
    }
  }

  static async acceptOffer(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const riderId = await RiderController.getRiderProfileId(userId);
      const id = req.params.id as string;
      const order = await RiderService.acceptOffer(riderId, id);
      sendSuccess(res, order, 'Delivery offer accepted! Proceed to kitchen.');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to accept offer', 400);
    }
  }

  static async rejectOffer(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const riderId = await RiderController.getRiderProfileId(userId);
      const id = req.params.id as string;
      const result = await RiderService.rejectOffer(riderId, id);
      sendSuccess(res, result, 'Offer declined');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to reject offer', 400);
    }
  }

  static async getActiveTrip(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const riderId = await RiderController.getRiderProfileId(userId);
      const trip = await RiderService.getActiveTrip(riderId);
      sendSuccess(res, trip, 'Active trip fetched');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch active trip', 400);
    }
  }

  static async advanceTripStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const riderId = await RiderController.getRiderProfileId(userId);
      const { orderId, step, deliveryOtp } = req.body;
      const order = await RiderService.advanceTripStatus(riderId, orderId, step, deliveryOtp);
      sendSuccess(res, order, `Trip status updated: ${step}`);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to advance trip status', 400);
    }
  }

  static async getWallet(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const riderId = await RiderController.getRiderProfileId(userId);
      const wallet = await RiderService.getRiderWallet(riderId);
      sendSuccess(res, wallet, 'Wallet summary fetched');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch wallet', 400);
    }
  }
}
