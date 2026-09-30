import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { io } from '../server.js';

export class AdminController {
  /**
   * High-level platform telemetry metrics
   */
  static async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const totalUsers = await prisma.user.count();
      const totalRestaurants = await prisma.restaurant.count();
      const activeRestaurants = await prisma.restaurant.count({ where: { isApproved: true, isOpen: true } });
      const pendingRestaurants = await prisma.restaurant.count({ where: { isApproved: false } });

      const totalRiders = await prisma.riderProfile.count();
      const onlineRiders = await prisma.riderProfile.count({ where: { isOnline: true } });
      const pendingRiders = await prisma.riderProfile.count({ where: { documentsVerified: false } });

      const totalOrders = await prisma.order.count();
      const deliveredOrders = await prisma.order.count({ where: { status: 'DELIVERED' } });
      const activeOrders = await prisma.order.count({
        where: {
          status: {
            in: [
              'PLACED',
              'PAYMENT_CONFIRMED',
              'RESTAURANT_ACCEPTED',
              'PREPARING',
              'READY_FOR_PICKUP',
              'RIDER_ASSIGNED',
              'PICKED_UP',
              'OUT_FOR_DELIVERY',
            ],
          },
        },
      });

      const ordersAggregate = await prisma.order.aggregate({
        _sum: {
          totalAmount: true,
          platformFee: true,
        },
        where: { status: 'DELIVERED' },
      });

      const gmv = ordersAggregate._sum.totalAmount || 0;
      const platformFees = ordersAggregate._sum.platformFee || 0;

      // Platform commission estimate
      const commissionLedger = await prisma.ledgerTransaction.aggregate({
        _sum: { amount: true },
        where: { recipientType: 'ADMIN', transactionType: 'COMMISSION_DEDUCTION' },
      });
      const totalCommissions = commissionLedger._sum.amount || 0;

      sendSuccess(
        res,
        {
          users: { total: totalUsers },
          restaurants: { total: totalRestaurants, active: activeRestaurants, pending: pendingRestaurants },
          riders: { total: totalRiders, online: onlineRiders, pending: pendingRiders },
          orders: { total: totalOrders, active: activeOrders, delivered: deliveredOrders },
          financials: {
            gmv: Number(gmv.toFixed(2)),
            commissionsEarned: Number(totalCommissions.toFixed(2)),
            platformFeesCollected: Number(platformFees.toFixed(2)),
            totalRevenue: Number((totalCommissions + platformFees).toFixed(2)),
          },
        },
        'Platform metrics fetched'
      );
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch platform metrics', 500);
    }
  }

  /**
   * List all restaurants with moderation filters
   */
  static async getRestaurants(req: Request, res: Response): Promise<void> {
    try {
      const { isApproved, search } = req.query;

      const where: any = {};
      if (isApproved !== undefined) {
        where.isApproved = isApproved === 'true';
      }
      if (search) {
        where.OR = [
          { name: { contains: String(search) } },
          { city: { contains: String(search) } },
        ];
      }

      const restaurants = await prisma.restaurant.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true, phone: true } },
          _count: { select: { menuItems: true, orders: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, restaurants, 'Restaurants fetched');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch restaurants', 500);
    }
  }

  /**
   * Approve or reject restaurant and adjust commission rate %
   */
  static async verifyRestaurant(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { isApproved, commissionRate } = req.body;

      const updated = await prisma.restaurant.update({
        where: { id },
        data: {
          isApproved: isApproved !== undefined ? Boolean(isApproved) : undefined,
          commissionRate: commissionRate !== undefined ? Number(commissionRate) : undefined,
        },
      });

      sendSuccess(
        res,
        updated,
        `Restaurant ${updated.name} ${updated.isApproved ? 'APPROVED' : 'REJECTED/SUSPENDED'}`
      );
    } catch (error: any) {
      sendError(res, error.message || 'Failed to verify restaurant', 400);
    }
  }

  /**
   * List all riders with KYC status
   */
  static async getRiders(req: Request, res: Response): Promise<void> {
    try {
      const { verified } = req.query;
      const where: any = {};
      if (verified !== undefined) {
        where.documentsVerified = verified === 'true';
      }

      const riders = await prisma.riderProfile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, riders, 'Riders fetched');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch riders', 500);
    }
  }

  /**
   * Verify or suspend rider KYC
   */
  static async verifyRider(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { documentsVerified } = req.body;

      const updated = await prisma.riderProfile.update({
        where: { id },
        data: { documentsVerified: Boolean(documentsVerified) },
        include: { user: { select: { name: true } } },
      });

      sendSuccess(
        res,
        updated,
        `Rider partner ${updated.user.name} documents ${updated.documentsVerified ? 'VERIFIED' : 'UNVERIFIED'}`
      );
    } catch (error: any) {
      sendError(res, error.message || 'Failed to verify rider', 400);
    }
  }

  /**
   * List all orders platform-wide
   */
  static async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const { status, limit = 50 } = req.query;
      const where: any = {};
      if (status && typeof status === 'string' && status !== 'ALL') {
        where.status = status;
      }

      const orders = await prisma.order.findMany({
        where,
        include: {
          customer: { select: { name: true, email: true, phone: true } },
          restaurant: { select: { name: true, city: true } },
          rider: { include: { user: { select: { name: true, phone: true } } } },
          address: true,
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
      });

      sendSuccess(res, orders, 'Orders fetched');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch orders', 500);
    }
  }

  /**
   * Admin Force Cancel & Refund Order
   */
  static async forceCancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { reason } = req.body;

      const order = await prisma.order.findUnique({
        where: { id },
      });

      if (!order) {
        sendError(res, 'Order not found', 404);
        return;
      }

      const updated = await prisma.$transaction(async (tx) => {
        const ord = await tx.order.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            paymentStatus: order.paymentStatus === 'COMPLETED' ? 'REFUNDED' : 'FAILED',
            cancellationReason: reason || 'Cancelled by Platform Administrator',
            cancelledAt: new Date(),
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            fromStatus: order.status,
            toStatus: 'CANCELLED',
            changedByRole: 'ADMIN',
            note: reason || 'Administrative force cancellation and refund',
          },
        });

        return ord;
      });

      try {
        io.to(`order_${id}`).emit('order_status_changed', {
          orderId: id,
          status: 'CANCELLED',
          message: 'Order was cancelled by platform administrator',
        });
      } catch {}

      sendSuccess(res, updated, 'Order cancelled and refund logged');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to force cancel order', 400);
    }
  }

  /**
   * Coupons & Offers Management
   */
  static async getCoupons(req: Request, res: Response): Promise<void> {
    try {
      const coupons = await prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
      });
      sendSuccess(res, coupons, 'Coupons fetched');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch coupons', 500);
    }
  }

  static async createCoupon(req: Request, res: Response): Promise<void> {
    try {
      const { code, description, discountType, discountValue, maxDiscount, minOrderAmount, minOrderValue, validUntil, validTill } = req.body;

      const coupon = await prisma.coupon.create({
        data: {
          code: code.toUpperCase().trim(),
          description: description || `${discountValue}${discountType === 'PERCENTAGE' ? '% OFF' : ' INR OFF'} on your delicious food orders`,
          discountType: discountType || 'PERCENTAGE',
          discountValue: Number(discountValue),
          maxDiscount: maxDiscount ? Number(maxDiscount) : null,
          minOrderValue: Number(minOrderValue || minOrderAmount || 0),
          validTill: validTill || validUntil ? new Date(validTill || validUntil) : new Date(Date.now() + 30 * 86400000),
          isActive: true,
        },
      });

      sendSuccess(res, coupon, `Coupon ${coupon.code} created successfully`, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create coupon', 400);
    }
  }

  static async toggleCoupon(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const existing = await prisma.coupon.findUnique({ where: { id } });
      if (!existing) {
        sendError(res, 'Coupon not found', 404);
        return;
      }

      const updated = await prisma.coupon.update({
        where: { id },
        data: { isActive: !existing.isActive },
      });

      sendSuccess(res, updated, `Coupon ${updated.code} is now ${updated.isActive ? 'ACTIVE' : 'INACTIVE'}`);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to toggle coupon', 400);
    }
  }
}
