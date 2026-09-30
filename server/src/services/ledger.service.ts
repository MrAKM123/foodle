import { prisma } from '../config/db.js';

export class LedgerService {
  /**
   * Fetch Restaurant Financial Ledger & Settlement History
   */
  static async getRestaurantLedger(restaurantId: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    // Fetch all ledger transactions for this restaurant
    const transactions = await prisma.ledgerTransaction.findMany({
      where: {
        recipientType: 'RESTAURANT',
        recipientId: restaurantId,
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
            deliveredAt: true,
            status: true,
            subtotal: true,
            paymentMethod: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate aggregated totals
    let totalGrossSales = 0;
    let totalCommissionDeducted = 0;
    let totalNetPayable = 0;
    let settledAmount = 0;
    let pendingSettlement = 0;

    for (const tx of transactions) {
      if (tx.transactionType === 'RESTAURANT_PAYOUT') {
        totalNetPayable += tx.amount;
        if (tx.status === 'SETTLED') {
          settledAmount += tx.amount;
        } else {
          pendingSettlement += tx.amount;
        }
      }
    }

    // Orders delivered for this restaurant
    const deliveredOrders = await prisma.order.findMany({
      where: {
        restaurantId,
        status: 'DELIVERED',
      },
      select: {
        subtotal: true,
      },
    });

    totalGrossSales = deliveredOrders.reduce((sum, o) => sum + o.subtotal, 0);
    totalCommissionDeducted = Number((totalGrossSales * (restaurant.commissionRate / 100)).toFixed(2));

    return {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        commissionRate: restaurant.commissionRate,
      },
      summary: {
        totalGrossSales: Number(totalGrossSales.toFixed(2)),
        commissionRatePercent: restaurant.commissionRate,
        totalCommissionDeducted: Number(totalCommissionDeducted.toFixed(2)),
        totalNetPayable: Number(totalNetPayable.toFixed(2)),
        settledAmount: Number(settledAmount.toFixed(2)),
        pendingSettlement: Number(pendingSettlement.toFixed(2)),
      },
      transactions: transactions.map((t) => ({
        id: t.id,
        orderId: t.orderId,
        orderNumber: t.order?.orderNumber || 'N/A',
        amount: t.amount,
        type: t.transactionType,
        status: t.status,
        notes: t.notes,
        createdAt: t.createdAt,
        deliveredAt: t.order?.deliveredAt,
      })),
    };
  }

  /**
   * Fetch Rider Financial Ledger & Trip Payout Statements
   */
  static async getRiderLedger(riderProfileId: string) {
    const rider = await prisma.riderProfile.findUnique({
      where: { id: riderProfileId },
      include: { user: { select: { name: true, phone: true } } },
    });

    if (!rider) {
      throw new Error('Rider profile not found');
    }

    const transactions = await prisma.ledgerTransaction.findMany({
      where: {
        recipientType: 'RIDER',
        recipientId: riderProfileId,
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            deliveredAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalEarned = 0;
    let settledAmount = 0;
    let pendingSettlement = 0;

    for (const tx of transactions) {
      totalEarned += tx.amount;
      if (tx.status === 'SETTLED') {
        settledAmount += tx.amount;
      } else {
        pendingSettlement += tx.amount;
      }
    }

    return {
      rider: {
        id: rider.id,
        name: rider.user.name,
        vehicleNumber: rider.vehicleNumber,
      },
      summary: {
        totalEarned: Number(totalEarned.toFixed(2)),
        settledAmount: Number(settledAmount.toFixed(2)),
        pendingSettlement: Number(pendingSettlement.toFixed(2)),
        totalDeliveries: transactions.length,
      },
      transactions: transactions.map((t) => ({
        id: t.id,
        orderId: t.orderId,
        orderNumber: t.order?.orderNumber || 'N/A',
        amount: t.amount,
        status: t.status,
        notes: t.notes,
        createdAt: t.createdAt,
        deliveredAt: t.order?.deliveredAt,
      })),
    };
  }

  /**
   * Fetch Super Admin Platform Financial Reconciliation Journal
   */
  static async getPlatformFinancialJournal() {
    const allLedgerEntries = await prisma.ledgerTransaction.findMany({
      include: {
        order: {
          select: {
            orderNumber: true,
            status: true,
            totalAmount: true,
            subtotal: true,
            deliveryFee: true,
            platformFee: true,
            tax: true,
            discount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const deliveredOrders = await prisma.order.findMany({
      where: { status: 'DELIVERED' },
    });

    let gmv = 0; // Gross Merchandise Value (total customer spend)
    let totalPlatformFees = 0;
    let totalDeliveryFeesCollected = 0;
    let totalCommissionsEarned = 0;
    let totalRiderPayoutsDisbursed = 0;
    let totalRestaurantPayoutsDisbursed = 0;

    for (const ord of deliveredOrders) {
      gmv += ord.totalAmount;
      totalPlatformFees += ord.platformFee;
      totalDeliveryFeesCollected += ord.deliveryFee;
    }

    for (const tx of allLedgerEntries) {
      if (tx.recipientType === 'ADMIN' && tx.transactionType === 'COMMISSION_DEDUCTION') {
        totalCommissionsEarned += tx.amount;
      } else if (tx.recipientType === 'RIDER' && tx.transactionType === 'RIDER_PAYOUT') {
        totalRiderPayoutsDisbursed += tx.amount;
      } else if (tx.recipientType === 'RESTAURANT' && tx.transactionType === 'RESTAURANT_PAYOUT') {
        totalRestaurantPayoutsDisbursed += tx.amount;
      }
    }

    const netPlatformMargin = Number(
      (totalCommissionsEarned + totalPlatformFees + totalDeliveryFeesCollected - totalRiderPayoutsDisbursed).toFixed(2)
    );

    return {
      overview: {
        totalGrossMerchandiseValue: Number(gmv.toFixed(2)),
        totalCommissionsEarned: Number(totalCommissionsEarned.toFixed(2)),
        totalPlatformFeesCollected: Number(totalPlatformFees.toFixed(2)),
        totalDeliveryFeesCollected: Number(totalDeliveryFeesCollected.toFixed(2)),
        totalRiderPayoutsDisbursed: Number(totalRiderPayoutsDisbursed.toFixed(2)),
        totalRestaurantPayoutsDisbursed: Number(totalRestaurantPayoutsDisbursed.toFixed(2)),
        netPlatformMargin,
      },
      recentLedgerEntries: allLedgerEntries.slice(0, 50).map((tx) => ({
        id: tx.id,
        orderId: tx.orderId,
        orderNumber: tx.order?.orderNumber || 'N/A',
        recipientType: tx.recipientType,
        recipientId: tx.recipientId,
        transactionType: tx.transactionType,
        amount: tx.amount,
        status: tx.status,
        notes: tx.notes,
        createdAt: tx.createdAt,
      })),
    };
  }

  /**
   * Settle pending payouts (Mark status as SETTLED)
   */
  static async settlePayouts(transactionIds: string[]) {
    return prisma.ledgerTransaction.updateMany({
      where: {
        id: { in: transactionIds },
      },
      data: {
        status: 'SETTLED',
      },
    });
  }
}
