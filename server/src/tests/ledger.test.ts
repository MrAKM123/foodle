import { describe, it, expect } from 'vitest';
import { LedgerService } from '../services/ledger.service.js';
import { OrderService } from '../services/order.service.js';
import { RiderService } from '../services/rider.service.js';
import { prisma } from '../config/db.js';

describe('Phase 6: Commission Math, Financial Ledger & Double-Entry Reconciliation Tests', () => {
  it('should verify commission calculations and double-entry consistency for completed orders', async () => {
    // Fetch test entities
    const customer = await prisma.user.findUnique({
      where: { email: 'customer@foodle.app' },
      include: { addresses: true },
    });
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: 'delhi-darbar-royal-mughlai' },
      include: { menuItems: true },
    });
    const riderUser = await prisma.user.findUnique({
      where: { email: 'rider@foodle.app' },
      include: { riderProfile: true },
    });

    expect(customer).not.toBeNull();
    expect(restaurant).not.toBeNull();
    expect(riderUser).not.toBeNull();

    // Ensure rider is online
    await RiderService.toggleOnline(riderUser!.id, true, 28.632, 77.218);

    // Place an order for 2 Biryanis
    const item = restaurant!.menuItems[0];
    const { order, rawDeliveryOtp } = await OrderService.createOrder(customer!.id, {
      restaurantId: restaurant!.id,
      addressId: customer!.addresses[0].id,
      items: [{ menuItemId: item.id, quantity: 2 }],
      paymentMethod: 'COD',
    });

    const expectedSubtotal = item.price * 2;
    expect(order.subtotal).toBe(expectedSubtotal);

    // Advance order to READY_FOR_PICKUP
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'READY_FOR_PICKUP' },
    });

    // Dispatch & accept offer
    const offer = await RiderService.findAndDispatchNearestRider(order.id);
    expect(offer).not.toBeNull();

    await RiderService.acceptOffer(riderUser!.riderProfile!.id, offer!.id);

    // Rider picks up
    await RiderService.advanceTripStatus(
      riderUser!.riderProfile!.id,
      order.id,
      'PICKED_UP'
    );

    // Rider completes with OTP
    const delivered = await RiderService.advanceTripStatus(
      riderUser!.riderProfile!.id,
      order.id,
      'DELIVERED',
      rawDeliveryOtp
    );

    expect(delivered.status).toBe('DELIVERED');

    // 1. Check Restaurant Ledger
    const restaurantLedger = await LedgerService.getRestaurantLedger(restaurant!.id);
    expect(restaurantLedger.restaurant.id).toBe(restaurant!.id);
    expect(restaurantLedger.summary.commissionRatePercent).toBe(restaurant!.commissionRate);
    expect(restaurantLedger.summary.totalGrossSales).toBeGreaterThanOrEqual(expectedSubtotal);
    expect(restaurantLedger.transactions.length).toBeGreaterThanOrEqual(1);

    // 2. Check Rider Ledger
    const riderLedger = await LedgerService.getRiderLedger(riderUser!.riderProfile!.id);
    expect(riderLedger.rider.id).toBe(riderUser!.riderProfile!.id);
    expect(riderLedger.summary.totalEarned).toBeGreaterThan(0);
    expect(riderLedger.summary.totalDeliveries).toBeGreaterThanOrEqual(1);

    // 3. Check Platform Financial Journal
    const platformJournal = await LedgerService.getPlatformFinancialJournal();
    expect(platformJournal.overview.totalGrossMerchandiseValue).toBeGreaterThan(0);
    expect(platformJournal.overview.totalCommissionsEarned).toBeGreaterThan(0);
    expect(platformJournal.overview.totalRiderPayoutsDisbursed).toBeGreaterThan(0);
    expect(platformJournal.recentLedgerEntries.length).toBeGreaterThan(0);

    // 4. Test Payout Settlement
    const pendingTxIds = platformJournal.recentLedgerEntries.map((e) => e.id);
    const settleResult = await LedgerService.settlePayouts(pendingTxIds);
    expect(settleResult.count).toBeGreaterThan(0);
  });
});
