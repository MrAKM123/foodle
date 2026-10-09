import { prisma } from '../config/db.js';
import { isValidStatusTransition } from '../utils/stateMachine.js';
import { io } from '../server.js';
import { RiderService } from './rider.service.js';

export class RestaurantManagementService {
  /**
   * Resolve restaurant entity associated with user
   */
  static async getRestaurantForUser(userId: string) {
    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: userId },
      include: {
        categories: {
          include: { menuItems: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!restaurant) {
      throw new Error('No restaurant found for this partner account');
    }

    return restaurant;
  }

  /**
   * Get orders for restaurant partner dashboard
   */
  static async getRestaurantOrders(restaurantId: string, statusFilter?: string) {
    const where: any = { restaurantId };

    if (statusFilter === 'INCOMING') {
      where.status = { in: ['PLACED', 'PAYMENT_CONFIRMED'] };
    } else if (statusFilter === 'PREPARING') {
      where.status = { in: ['RESTAURANT_ACCEPTED', 'PREPARING'] };
    } else if (statusFilter === 'READY') {
      where.status = { in: ['READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] };
    } else if (statusFilter === 'COMPLETED') {
      where.status = { in: ['DELIVERED', 'REJECTED', 'CANCELLED'] };
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        address: true,
        customer: { select: { id: true, name: true, phone: true, email: true } },
        rider: {
          select: {
            id: true,
            vehicleType: true,
            vehicleNumber: true,
            user: { select: { name: true, phone: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return orders;
  }

  /**
   * Update order status with state machine transition enforcement
   */
  static async updateOrderStatus(
    restaurantId: string,
    orderId: string,
    newStatus: string,
    prepTimeMinutes?: number,
    rejectionReason?: string | null,
    userId?: string
  ) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, restaurantId },
    });

    if (!order) {
      throw new Error('Order not found or unauthorized');
    }

    // Enforce State Machine Transition Rules
    if (!isValidStatusTransition(order.status, newStatus)) {
      throw new Error(
        `Invalid status transition from "${order.status}" to "${newStatus}". This transition is not permitted.`
      );
    }

    const updateData: any = {
      status: newStatus,
    };

    if (newStatus === 'RESTAURANT_ACCEPTED' || newStatus === 'PREPARING') {
      if (!order.acceptedAt) updateData.acceptedAt = new Date();
      if (newStatus === 'PREPARING') updateData.preparedAt = new Date();
      if (prepTimeMinutes) {
        updateData.prepTimeMinutes = prepTimeMinutes;
        updateData.estimatedDeliveryTime = new Date(Date.now() + (prepTimeMinutes + 20) * 60 * 1000);
      }
    } else if (newStatus === 'REJECTED' || newStatus === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = rejectionReason || 'Rejected by restaurant';
    }

    const updated = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: order.id },
        data: updateData,
        include: {
          items: true,
          restaurant: true,
          address: true,
          customer: true,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: newStatus,
          changedByRole: 'RESTAURANT',
          changedById: userId,
          note: rejectionReason
            ? `Status changed to ${newStatus}. Reason: ${rejectionReason}`
            : `Status changed to ${newStatus}`,
        },
      });

      return ord;
    });

    // Real-time broadcast
    try {
      io.to(`order_${order.id}`).emit('order_status_changed', {
        orderId: updated.id,
        orderNumber: updated.orderNumber,
        fromStatus: order.status,
        toStatus: newStatus,
        updatedAt: new Date(),
      });

      io.to(`customer_${order.customerId}`).emit('customer_order_update', {
        orderId: updated.id,
        status: newStatus,
        message: `Your order from ${updated.restaurant.name} is now ${newStatus}`,
      });
    } catch {
      // silent
    }

    // Automatically trigger rider dispatch when order is ready for pickup or preparing
    if (newStatus === 'READY_FOR_PICKUP' || newStatus === 'PREPARING') {
      RiderService.findAndDispatchNearestRider(order.id).catch((err) => {
        console.error('Error auto-dispatching rider for order:', order.id, err);
      });
    }

    return updated;
  }

  /**
   * Menu Management: Add Category
   */
  static async createCategory(restaurantId: string, name: string, sortOrder = 0) {
    return prisma.menuCategory.create({
      data: {
        restaurantId,
        name,
        sortOrder,
      },
    });
  }

  /**
   * Menu Management: Add Dish
   */
  static async createMenuItem(
    restaurantId: string,
    data: {
      categoryId: string;
      name: string;
      description?: string | null;
      price: number;
      imageUrl?: string | null;
      isVeg?: boolean;
      prepTimeMinutes?: number;
      spiceLevel?: number;
    }
  ) {
    // Verify category belongs to restaurant
    const category = await prisma.menuCategory.findFirst({
      where: { id: data.categoryId, restaurantId },
    });

    if (!category) {
      throw new Error('Category does not belong to this restaurant');
    }

    return prisma.menuItem.create({
      data: {
        restaurantId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        isVeg: data.isVeg ?? true,
        isAvailable: true,
        prepTimeMinutes: data.prepTimeMinutes || 15,
        spiceLevel: data.spiceLevel || 1,
      },
    });
  }

  /**
   * Menu Management: Update Dish / Toggle In-Stock
   */
  static async updateMenuItem(restaurantId: string, menuItemId: string, data: any) {
    const item = await prisma.menuItem.findFirst({
      where: { id: menuItemId, restaurantId },
    });

    if (!item) {
      throw new Error('Dish not found or unauthorized');
    }

    return prisma.menuItem.update({
      where: { id: menuItemId },
      data,
    });
  }

  /**
   * Menu Management: Delete Dish
   */
  static async deleteMenuItem(restaurantId: string, menuItemId: string) {
    const item = await prisma.menuItem.findFirst({
      where: { id: menuItemId, restaurantId },
    });

    if (!item) {
      throw new Error('Dish not found or unauthorized');
    }

    return prisma.menuItem.delete({
      where: { id: menuItemId },
    });
  }

  /**
   * Store settings / open-close toggle
   */
  static async updateRestaurantProfile(restaurantId: string, data: any) {
    return prisma.restaurant.update({
      where: { id: restaurantId },
      data,
    });
  }

  /**
   * Restaurant Earnings & Ledger summary
   */
  static async getEarningsSummary(restaurantId: string) {
    const deliveredOrders = await prisma.order.findMany({
      where: {
        restaurantId,
        status: 'DELIVERED',
      },
      select: {
        id: true,
        orderNumber: true,
        subtotal: true,
        totalAmount: true,
        deliveredAt: true,
        isPaidOutToRestaurant: true,
      },
      orderBy: { deliveredAt: 'desc' },
    });

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { commissionRate: true },
    });

    const commissionRate = restaurant?.commissionRate || 20.0;

    let totalGrossSales = 0;
    let totalCommissionDeducted = 0;
    let totalNetPayout = 0;

    const orderRows = deliveredOrders.map((ord) => {
      totalGrossSales += ord.subtotal;
      const comm = (ord.subtotal * commissionRate) / 100;
      const net = ord.subtotal - comm;
      totalCommissionDeducted += comm;
      totalNetPayout += net;

      return {
        ...ord,
        commissionAmount: Number(comm.toFixed(2)),
        netEarning: Number(net.toFixed(2)),
      };
    });

    return {
      commissionRate,
      totalOrdersDelivered: deliveredOrders.length,
      totalGrossSales: Number(totalGrossSales.toFixed(2)),
      totalCommissionDeducted: Number(totalCommissionDeducted.toFixed(2)),
      totalNetPayout: Number(totalNetPayout.toFixed(2)),
      orders: orderRows,
    };
  }
}
