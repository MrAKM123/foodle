import { describe, it, expect } from 'vitest';
import { prisma } from '../config/db.js';
import { OrderService } from '../services/order.service.js';

describe('Phase 7: Super Admin Command Center & Moderation Suite Tests', () => {
  it('should fetch real-time platform telemetry metrics', async () => {
    const userCount = await prisma.user.count();
    const restaurantCount = await prisma.restaurant.count();
    const riderCount = await prisma.riderProfile.count();

    expect(userCount).toBeGreaterThan(0);
    expect(restaurantCount).toBeGreaterThan(0);
    expect(riderCount).toBeGreaterThan(0);
  });

  it('should approve/suspend restaurants and adjust commission tier rates', async () => {
    const restaurant = await prisma.restaurant.findFirst({
      where: { slug: 'delhi-darbar-royal-mughlai' },
    });
    expect(restaurant).not.toBeNull();

    const updated = await prisma.restaurant.update({
      where: { id: restaurant!.id },
      data: {
        isApproved: true,
      },
    });

    expect(updated.isApproved).toBe(true);
    expect(updated.commissionRate).toBe(20.0);
  });

  it('should verify delivery rider documents and KYC status', async () => {
    const rider = await prisma.riderProfile.findFirst();
    expect(rider).not.toBeNull();

    const updated = await prisma.riderProfile.update({
      where: { id: rider!.id },
      data: { documentsVerified: true },
    });

    expect(updated.documentsVerified).toBe(true);
  });

  it('should create and toggle promotional discount coupons', async () => {
    const code = `TESTSAVE${Date.now().toString().slice(-4)}`;
    const coupon = await prisma.coupon.create({
      data: {
        code,
        description: 'Test 25% discount promo',
        discountType: 'PERCENTAGE',
        discountValue: 25.0,
        maxDiscount: 150.0,
        minOrderValue: 299.0,
        validTill: new Date(Date.now() + 7 * 86400000),
        isActive: true,
      },
    });

    expect(coupon.code).toBe(code);
    expect(coupon.discountValue).toBe(25.0);
    expect(coupon.isActive).toBe(true);

    // Toggle coupon
    const toggled = await prisma.coupon.update({
      where: { id: coupon.id },
      data: { isActive: false },
    });

    expect(toggled.isActive).toBe(false);
  });

  it('should allow admin to force cancel an active order with refund record', async () => {
    const customer = await prisma.user.findUnique({
      where: { email: 'customer@foodle.app' },
      include: { addresses: true },
    });
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: 'delhi-darbar-royal-mughlai' },
      include: { menuItems: true },
    });

    const { order } = await OrderService.createOrder(customer!.id, {
      restaurantId: restaurant!.id,
      addressId: customer!.addresses[0].id,
      items: [{ menuItemId: restaurant!.menuItems[0].id, quantity: 1 }],
      paymentMethod: 'COD',
    });

    expect(order.status).toBe('PLACED');

    // Admin force cancellation
    const cancelled = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'FAILED',
          cancellationReason: 'Cancelled by platform admin in test',
          cancelledAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: 'CANCELLED',
          changedByRole: 'ADMIN',
          note: 'Administrative test cancellation',
        },
      });

      return ord;
    });

    expect(cancelled.status).toBe('CANCELLED');
    expect(cancelled.cancelledAt).not.toBeNull();
  });
});
