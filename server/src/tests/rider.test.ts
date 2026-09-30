import { describe, it, expect } from 'vitest';
import { RiderService } from '../services/rider.service.js';
import { OrderService } from '../services/order.service.js';
import { calculateHaversineDistanceKm, calculateRiderEarning, calculateEstimatedDeliveryTimeMinutes } from '../utils/haversine.js';
import { prisma } from '../config/db.js';

describe('Phase 5: Rider Dispatch, Proximity, Trip Lifecycle & Delivery OTP Tests', () => {
  it('should accurately calculate Haversine distance and rider payouts', () => {
    // Distance between Delhi Connaught Place (28.6315, 77.2167) and India Gate (28.6129, 77.2295) approx 2.4 km
    const dist = calculateHaversineDistanceKm(28.6315, 77.2167, 28.6129, 77.2295);
    expect(dist).toBeGreaterThan(1.8);
    expect(dist).toBeLessThan(3.0);

    // Rider earnings: base ₹35 + (2.4 * ₹10) = ~₹59
    const earning = calculateRiderEarning(dist);
    expect(earning).toBeGreaterThanOrEqual(50);
    expect(earning).toBeLessThanOrEqual(70);

    // ETA calculation: ~15 mins prep + ~8 mins travel = ~23 mins
    const eta = calculateEstimatedDeliveryTimeMinutes(dist, 15);
    expect(eta).toBeGreaterThan(18);
    expect(eta).toBeLessThan(30);
  });

  it('should find nearby online riders and dispatch offers', async () => {
    // Retrieve demo rider
    const riderUser = await prisma.user.findUnique({
      where: { email: 'rider@foodle.app' },
      include: { riderProfile: true },
    });

    expect(riderUser).not.toBeNull();
    expect(riderUser?.riderProfile).not.toBeNull();

    // Ensure rider is online and available
    await RiderService.toggleOnline(riderUser!.id, true, 28.632, 77.218);

    const profile = await RiderService.getRiderProfile(riderUser!.id);
    expect(profile?.isOnline).toBe(true);
    expect(profile?.documentsVerified).toBe(true);

    // Create a test order
    const customer = await prisma.user.findUnique({
      where: { email: 'customer@foodle.app' },
      include: { addresses: true },
    });
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: 'delhi-darbar-royal-mughlai' },
      include: { menuItems: true },
    });

    const { order, rawDeliveryOtp } = await OrderService.createOrder(customer!.id, {
      restaurantId: restaurant!.id,
      addressId: customer!.addresses[0].id,
      items: [{ menuItemId: restaurant!.menuItems[0].id, quantity: 1 }],
      paymentMethod: 'COD',
    });

    // Advance order to READY_FOR_PICKUP
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'READY_FOR_PICKUP' },
    });

    // Dispatch offers
    const offer = await RiderService.findAndDispatchNearestRider(order.id);
    expect(offer).not.toBeNull();

    const riderOffers = await RiderService.getRiderPendingOffers(riderUser!.riderProfile!.id);
    expect(riderOffers.length).toBeGreaterThan(0);

    const myOffer = riderOffers.find((o) => o.orderId === order.id);
    expect(myOffer).toBeDefined();

    // Accept offer
    const assignedOrder = await RiderService.acceptOffer(riderUser!.riderProfile!.id, myOffer!.id);
    expect(assignedOrder.status).toBe('RIDER_ASSIGNED');
    expect(assignedOrder.riderId).toBe(riderUser!.riderProfile!.id);

    // Advance to PICKED_UP
    const pickedUpOrder = await RiderService.advanceTripStatus(
      riderUser!.riderProfile!.id,
      order.id,
      'PICKED_UP'
    );
    expect(pickedUpOrder.status).toBe('OUT_FOR_DELIVERY');

    // Test invalid Delivery OTP failure
    await expect(
      RiderService.advanceTripStatus(
        riderUser!.riderProfile!.id,
        order.id,
        'DELIVERED',
        '0000' // wrong OTP
      )
    ).rejects.toThrow(/Incorrect 4-digit OTP/);

    // Check attempt counter incremented
    const orderAfterFail = await prisma.order.findUnique({ where: { id: order.id } });
    expect(orderAfterFail?.otpAttempts).toBe(1);

    // Test valid Delivery OTP completion
    const deliveredOrder = await RiderService.advanceTripStatus(
      riderUser!.riderProfile!.id,
      order.id,
      'DELIVERED',
      rawDeliveryOtp
    );
    expect(deliveredOrder.status).toBe('DELIVERED');
    expect(deliveredOrder.deliveredAt).not.toBeNull();

    // Verify double-entry ledger records were created
    const ledger = await prisma.ledgerTransaction.findMany({
      where: { orderId: order.id },
    });
    expect(ledger.length).toBe(3); // RESTAURANT_EARNING, RIDER_PAYOUT, COMMISSION_DEDUCTION
    expect(ledger.some((l) => l.recipientType === 'RIDER' && l.status === 'SETTLED')).toBe(true);
  });
});
