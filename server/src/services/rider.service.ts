import { prisma } from '../config/db.js';
import { calculateHaversineDistanceKm, calculateRiderEarning } from '../utils/haversine.js';
import { verifyHashedOtp } from '../utils/otp.js';
import { io } from '../server.js';

export class RiderService {
  /**
   * Fetch rider profile with stats
   */
  static async getRiderProfile(userId: string) {
    const profile = await prisma.riderProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
      },
    });

    if (!profile) {
      throw new Error('Rider profile not found');
    }

    return profile;
  }

  /**
   * Toggle Online / Offline status
   */
  static async toggleOnline(userId: string, isOnline: boolean, lat?: number, lng?: number) {
    const profile = await prisma.riderProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error('Rider profile not found');
    }

    return prisma.riderProfile.update({
      where: { id: profile.id },
      data: {
        isOnline,
        currentLat: lat ?? profile.currentLat,
        currentLng: lng ?? profile.currentLng,
        lastLocationUpdate: new Date(),
      },
    });
  }

  /**
   * Live GPS coordinate ping
   */
  static async updateLocation(userId: string, lat: number, lng: number) {
    const profile = await prisma.riderProfile.findUnique({
      where: { userId },
    });

    if (!profile) return null;

    const updated = await prisma.riderProfile.update({
      where: { id: profile.id },
      data: {
        currentLat: lat,
        currentLng: lng,
        lastLocationUpdate: new Date(),
      },
    });

    // Broadcast position to any active delivering orders
    const activeOrder = await prisma.order.findFirst({
      where: {
        riderId: profile.id,
        status: { in: ['RIDER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] },
      },
      select: { id: true },
    });

    if (activeOrder) {
      try {
        io.to(`order_${activeOrder.id}`).emit('rider_location_update', {
          orderId: activeOrder.id,
          lat,
          lng,
          timestamp: new Date(),
        });
      } catch {
        // silent
      }
    }

    return updated;
  }

  /**
   * Dispatch engine: Finds nearest online free rider using Haversine formula and generates 30s offer
   */
  static async findAndDispatchNearestRider(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: true,
        address: true,
      },
    });

    if (!order) return null;

    // Get previous rejected or timed out offers for this order
    const pastOffers = await prisma.riderOffer.findMany({
      where: { orderId },
      select: { riderId: true },
    });
    const excludedRiderIds = pastOffers.map((o) => o.riderId);

    // Find online verified riders
    const onlineRiders = await prisma.riderProfile.findMany({
      where: {
        isOnline: true,
        documentsVerified: true,
        id: { notIn: excludedRiderIds },
      },
    });

    if (onlineRiders.length === 0) {
      return null;
    }

    // Calculate distances using Haversine formula
    const riderDistances = onlineRiders.map((rider) => {
      const rLat = rider.currentLat || order.restaurant.lat;
      const rLng = rider.currentLng || order.restaurant.lng;
      const distance = calculateHaversineDistanceKm(
        order.restaurant.lat,
        order.restaurant.lng,
        rLat,
        rLng
      );
      return { rider, distance };
    });

    // Sort by proximity
    riderDistances.sort((a, b) => a.distance - b.distance);

    const nearest = riderDistances[0];
    if (!nearest) return null;

    const deliveryDistanceKm = calculateHaversineDistanceKm(
      order.restaurant.lat,
      order.restaurant.lng,
      order.address.lat,
      order.address.lng
    );

    const estimatedEarning = calculateRiderEarning(deliveryDistanceKm);
    const expiresAt = new Date(Date.now() + 30 * 1000); // 30-second offer timer

    const offer = await prisma.riderOffer.create({
      data: {
        orderId: order.id,
        riderId: nearest.rider.id,
        status: 'OFFERED',
        distanceKm: deliveryDistanceKm,
        estimatedEarning,
        expiresAt,
      },
      include: {
        order: {
          include: {
            restaurant: true,
            address: true,
          },
        },
      },
    });

    // Real-time offer popup dispatch
    try {
      io.to(`rider_${nearest.rider.userId}`).emit('new_delivery_offer', {
        offerId: offer.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        restaurantName: order.restaurant.name,
        restaurantAddress: order.restaurant.address,
        dropAddress: order.address.street,
        distanceKm: deliveryDistanceKm,
        estimatedEarning,
        expiresAt,
      });
    } catch {
      // silent
    }

    return offer;
  }

  /**
   * Fetch active offers for a rider
   */
  static async getRiderPendingOffers(riderProfileId: string) {
    const now = new Date();
    const offers = await prisma.riderOffer.findMany({
      where: {
        riderId: riderProfileId,
        status: 'OFFERED',
        expiresAt: { gt: now },
      },
      include: {
        order: {
          include: {
            restaurant: true,
            address: true,
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return offers;
  }

  /**
   * Accept an order delivery offer
   */
  static async acceptOffer(riderProfileId: string, offerId: string) {
    const offer = await prisma.riderOffer.findFirst({
      where: { id: offerId, riderId: riderProfileId },
      include: { order: true },
    });

    if (!offer) {
      throw new Error('Delivery offer not found');
    }

    if (offer.status !== 'OFFERED') {
      throw new Error('This offer is no longer available');
    }

    if (new Date() > offer.expiresAt) {
      await prisma.riderOffer.update({
        where: { id: offer.id },
        data: { status: 'TIMEOUT' },
      });
      throw new Error('This delivery offer has expired');
    }

    // Atomic update to assign rider to Order
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Mark offer accepted
      await tx.riderOffer.update({
        where: { id: offer.id },
        data: { status: 'ACCEPTED' },
      });

      // Assign to Order
      const ord = await tx.order.update({
        where: { id: offer.orderId },
        data: {
          riderId: riderProfileId,
          status: 'RIDER_ASSIGNED',
        },
        include: {
          restaurant: true,
          address: true,
          customer: true,
          items: true,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: ord.id,
          fromStatus: 'READY_FOR_PICKUP',
          toStatus: 'RIDER_ASSIGNED',
          changedByRole: 'RIDER',
          note: 'Rider accepted the delivery assignment',
        },
      });

      return ord;
    });

    // Real-time broadcasts
    try {
      io.to(`order_${updatedOrder.id}`).emit('order_status_changed', {
        orderId: updatedOrder.id,
        status: 'RIDER_ASSIGNED',
      });
      io.to(`customer_${updatedOrder.customerId}`).emit('customer_order_update', {
        orderId: updatedOrder.id,
        status: 'RIDER_ASSIGNED',
        message: 'A delivery rider has been assigned to pick up your order!',
      });
    } catch {
      // silent
    }

    return updatedOrder;
  }

  /**
   * Reject an offer and cascade to next nearest rider
   */
  static async rejectOffer(riderProfileId: string, offerId: string) {
    const offer = await prisma.riderOffer.findFirst({
      where: { id: offerId, riderId: riderProfileId },
    });

    if (offer) {
      await prisma.riderOffer.update({
        where: { id: offer.id },
        data: { status: 'REJECTED' },
      });

      // Cascade dispatch to next nearest available rider
      this.findAndDispatchNearestRider(offer.orderId).catch(() => {});
    }

    return { success: true };
  }

  /**
   * Fetch current active trip
   */
  static async getActiveTrip(riderProfileId: string) {
    const trip = await prisma.order.findFirst({
      where: {
        riderId: riderProfileId,
        status: { in: ['RIDER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] },
      },
      include: {
        restaurant: true,
        address: true,
        customer: { select: { name: true, phone: true } },
        items: true,
      },
    });

    return trip;
  }

  /**
   * Step-by-step trip progression and Delivery OTP verification
   */
  static async advanceTripStatus(
    riderProfileId: string,
    orderId: string,
    step: 'REACHED_RESTAURANT' | 'PICKED_UP' | 'REACHED_CUSTOMER' | 'DELIVERED',
    deliveryOtp?: string
  ) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, riderId: riderProfileId },
      include: { restaurant: true, address: true, customer: true },
    });

    if (!order) {
      throw new Error('Active trip not found');
    }

    if (step === 'PICKED_UP') {
      const updated = await prisma.$transaction(async (tx) => {
        const ord = await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'OUT_FOR_DELIVERY',
            pickedUpAt: new Date(),
          },
          include: { restaurant: true, address: true, customer: true, items: true },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: order.status,
            toStatus: 'OUT_FOR_DELIVERY',
            changedByRole: 'RIDER',
            note: 'Order picked up from restaurant and out for delivery',
          },
        });

        return ord;
      });

      try {
        io.to(`order_${order.id}`).emit('order_status_changed', {
          orderId: order.id,
          status: 'OUT_FOR_DELIVERY',
        });
        io.to(`customer_${order.customerId}`).emit('customer_order_update', {
          orderId: order.id,
          status: 'OUT_FOR_DELIVERY',
          message: 'Your food has been picked up and is out for delivery! 🛵',
        });
      } catch {}

      return updated;
    }

    if (step === 'DELIVERED') {
      if (!deliveryOtp) {
        throw new Error('Please enter the customer 4-digit Delivery OTP');
      }

      if (order.otpAttempts >= 3) {
        throw new Error('Maximum OTP attempts reached (3/3). Please contact support.');
      }

      if (!order.deliveryOtpHash) {
        throw new Error('No delivery OTP found for this order');
      }

      // Verify OTP cryptographically
      const isOtpValid = await verifyHashedOtp(deliveryOtp.trim(), order.deliveryOtpHash);

      if (!isOtpValid) {
        await prisma.order.update({
          where: { id: order.id },
          data: { otpAttempts: { increment: 1 } },
        });
        throw new Error(`Incorrect 4-digit OTP. Attempts remaining: ${2 - order.otpAttempts}`);
      }

      const riderDistance = calculateHaversineDistanceKm(
        order.restaurant.lat,
        order.restaurant.lng,
        order.address.lat,
        order.address.lng
      );
      const riderEarning = calculateRiderEarning(riderDistance);

      // Financial Ledger and Completion Transaction
      const completedOrder = await prisma.$transaction(async (tx) => {
        // 1. Mark Order Delivered
        const ord = await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'DELIVERED',
            deliveredAt: new Date(),
            paymentStatus: 'COMPLETED',
          },
          include: { restaurant: true, address: true, customer: true, items: true },
        });

        // 2. Increment Rider Deliveries & Wallet
        await tx.riderProfile.update({
          where: { id: riderProfileId },
          data: {
            totalDeliveries: { increment: 1 },
            totalEarnings: { increment: riderEarning },
          },
        });

        // 3. Record Double-Entry Financial Ledger
        const restaurantEarning = Number(
          (ord.subtotal * (1 - ord.restaurant.commissionRate / 100)).toFixed(2)
        );
        const platformCommission = Number(
          (ord.subtotal * (ord.restaurant.commissionRate / 100)).toFixed(2)
        );

        // Restaurant ledger credit
        await tx.ledgerTransaction.create({
          data: {
            orderId: ord.id,
            recipientType: 'RESTAURANT',
            recipientId: ord.restaurantId,
            transactionType: 'RESTAURANT_EARNING',
            status: 'SETTLED',
            amount: restaurantEarning,
            notes: `Earning for order ${ord.orderNumber} (Subtotal: ₹${ord.subtotal} - ${ord.restaurant.commissionRate}% comm)`,
          },
        });

        // Rider ledger payout
        await tx.ledgerTransaction.create({
          data: {
            orderId: ord.id,
            recipientType: 'RIDER',
            recipientId: riderProfileId,
            transactionType: 'RIDER_PAYOUT',
            status: 'SETTLED',
            amount: riderEarning,
            notes: `Delivery payout for order ${ord.orderNumber} (${riderDistance} km)`,
          },
        });

        // Platform commission credit
        await tx.ledgerTransaction.create({
          data: {
            orderId: ord.id,
            recipientType: 'ADMIN',
            recipientId: 'PLATFORM',
            transactionType: 'COMMISSION_DEDUCTION',
            status: 'SETTLED',
            amount: platformCommission,
            notes: `Platform commission on order ${ord.orderNumber}`,
          },
        });

        // Status History
        await tx.orderStatusHistory.create({
          data: {
            orderId: ord.id,
            fromStatus: order.status,
            toStatus: 'DELIVERED',
            changedByRole: 'RIDER',
            note: 'Order successfully verified via 4-digit Delivery OTP and handed to customer',
          },
        });

        return ord;
      });

      // Broadcast completion
      try {
        io.to(`order_${order.id}`).emit('order_status_changed', {
          orderId: order.id,
          status: 'DELIVERED',
        });
        io.to(`customer_${order.customerId}`).emit('customer_order_update', {
          orderId: order.id,
          status: 'DELIVERED',
          message: 'Your order has been delivered! Enjoy your meal 🍛',
        });
      } catch {}

      return completedOrder;
    }

    return order;
  }

  /**
   * Rider Wallet & Payout statement
   */
  static async getRiderWallet(riderProfileId: string) {
    const profile = await prisma.riderProfile.findUnique({
      where: { id: riderProfileId },
    });

    const deliveredOrders = await prisma.order.findMany({
      where: {
        riderId: riderProfileId,
        status: 'DELIVERED',
      },
      include: {
        restaurant: { select: { name: true } },
        address: { select: { street: true } },
      },
      orderBy: { deliveredAt: 'desc' },
    });

    const trips = deliveredOrders.map((ord) => {
      const dist = 3.2; // approx avg trip km
      const earning = calculateRiderEarning(dist);
      return {
        orderId: ord.id,
        orderNumber: ord.orderNumber,
        restaurantName: ord.restaurant.name,
        dropStreet: ord.address.street,
        deliveredAt: ord.deliveredAt,
        distanceKm: dist,
        earning,
      };
    });

    return {
      totalDeliveries: profile?.totalDeliveries || 0,
      totalEarnings: profile?.totalEarnings || 0.0,
      walletBalance: profile?.totalEarnings || 0.0,
      rating: profile?.rating || 5.0,
      trips,
    };
  }
}
