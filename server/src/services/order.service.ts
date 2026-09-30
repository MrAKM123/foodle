import crypto from 'crypto';
import Razorpay from 'razorpay';
import { prisma } from '../config/db.js';
import { ENV } from '../config/env.js';
import { generateDeliveryOtp, hashOtp } from '../utils/otp.js';
import { io } from '../server.js';

const isRealRazorpayKey = (key: string) => {
  return (
    key &&
    key.length > 15 &&
    !key.includes('placeholder') &&
    (key.startsWith('rzp_test_') || key.startsWith('rzp_live_'))
  );
};

let razorpayInstance: Razorpay | null = null;
if (isRealRazorpayKey(ENV.RAZORPAY_KEY_ID) && isRealRazorpayKey(ENV.RAZORPAY_KEY_SECRET)) {
  try {
    razorpayInstance = new Razorpay({
      key_id: ENV.RAZORPAY_KEY_ID,
      key_secret: ENV.RAZORPAY_KEY_SECRET,
    });
  } catch (err) {
    console.warn('Razorpay SDK initialization skipped in local test mode');
  }
}

export class OrderService {
  /**
   * Generates a unique human-friendly order reference like "FDL-83921"
   */
  static generateOrderNumber(): string {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `FDL-${randomNum}`;
  }

  /**
   * Create a new order with atomic price re-calculation and DB transactions
   */
  static async createOrder(
    customerId: string,
    data: {
      restaurantId: string;
      addressId: string;
      items: Array<{
        menuItemId: string;
        quantity: number;
        selectedVariants?: any[];
        selectedAddons?: any[];
      }>;
      paymentMethod: 'RAZORPAY' | 'COD';
      couponCode?: string | null;
      restaurantNotes?: string | null;
    }
  ) {
    // 1. Verify Address
    const address = await prisma.address.findFirst({
      where: { id: data.addressId, userId: customerId },
    });
    if (!address) {
      throw new Error('Selected delivery address not found');
    }

    // 2. Verify Restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
    });
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }
    if (!restaurant.isApproved) {
      throw new Error('This restaurant is not currently approved on Foodle');
    }
    if (!restaurant.isOpen) {
      throw new Error(`${restaurant.name} is currently closed for orders`);
    }

    // 3. Fetch Menu Items from Database & Re-verify Pricing Server-Side
    const menuItemIds = data.items.map((i) => i.menuItemId);
    const dbMenuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        restaurantId: restaurant.id,
        isAvailable: true,
      },
    });

    if (dbMenuItems.length !== data.items.length) {
      throw new Error('One or more items in your cart are no longer available');
    }

    const itemMap = new Map(dbMenuItems.map((item) => [item.id, item]));

    let calculatedSubtotal = 0;
    const validatedOrderItems: Array<{
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
      selectedVariants?: string;
      selectedAddons?: string;
      itemTotal: number;
    }> = [];

    for (const item of data.items) {
      const dbItem = itemMap.get(item.menuItemId)!;
      let unitPrice = dbItem.price;

      // Add variant pricing if selected
      if (item.selectedVariants && item.selectedVariants.length > 0) {
        for (const v of item.selectedVariants) {
          if (v.price) unitPrice += Number(v.price);
        }
      }

      // Add addon pricing if selected
      if (item.selectedAddons && item.selectedAddons.length > 0) {
        for (const a of item.selectedAddons) {
          if (a.price) unitPrice += Number(a.price);
        }
      }

      const itemTotal = unitPrice * item.quantity;
      calculatedSubtotal += itemTotal;

      validatedOrderItems.push({
        menuItemId: dbItem.id,
        name: dbItem.name,
        price: unitPrice,
        quantity: item.quantity,
        selectedVariants: item.selectedVariants ? JSON.stringify(item.selectedVariants) : undefined,
        selectedAddons: item.selectedAddons ? JSON.stringify(item.selectedAddons) : undefined,
        itemTotal,
      });
    }

    // 4. Validate Minimum Order Amount
    if (calculatedSubtotal < restaurant.minOrderAmount) {
      throw new Error(
        `Minimum order amount for ${restaurant.name} is ₹${restaurant.minOrderAmount}. Current subtotal is ₹${calculatedSubtotal.toFixed(2)}.`
      );
    }

    // 5. Validate and Apply Coupon if provided
    let discount = 0;
    let appliedCouponCode: string | null = null;

    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.trim().toUpperCase() },
      });

      if (coupon && coupon.isActive && new Date() <= coupon.validTill) {
        if (calculatedSubtotal >= coupon.minOrderValue) {
          if (coupon.discountType === 'PERCENTAGE') {
            const rawDiscount = (calculatedSubtotal * coupon.discountValue) / 100;
            discount = coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
          } else {
            discount = coupon.discountValue;
          }
          appliedCouponCode = coupon.code;

          // Increment coupon usage count
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usageCount: { increment: 1 } },
          });
        }
      }
    }

    // 6. Compute Taxes and Fees
    const deliveryFee = calculatedSubtotal >= 499.0 ? 0.0 : 35.0; // Free delivery above ₹499
    const platformFee = 5.0;
    const tax = Number((calculatedSubtotal * 0.05).toFixed(2)); // 5% GST
    const totalAmount = Number(
      Math.max(0, calculatedSubtotal + deliveryFee + platformFee + tax - discount).toFixed(2)
    );

    // 7. Generate 4-digit Delivery OTP (Server-side generated & hashed)
    const rawDeliveryOtp = generateDeliveryOtp();
    const deliveryOtpHash = await hashOtp(rawDeliveryOtp);
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    // Estimated Delivery Time
    const estimatedDeliveryTime = new Date(
      Date.now() + (restaurant.avgPrepTimeMinutes + 20) * 60 * 1000
    );

    const orderNumber = this.generateOrderNumber();

    // 8. Create Order in Database via Atomic Transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          restaurantId: restaurant.id,
          addressId: address.id,
          status: 'PLACED',
          subtotal: calculatedSubtotal,
          tax,
          deliveryFee,
          platformFee,
          discount,
          totalAmount,
          couponCode: appliedCouponCode,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
          deliveryOtpHash,
          otpAttempts: 0,
          otpExpiresAt,
          prepTimeMinutes: restaurant.avgPrepTimeMinutes,
          estimatedDeliveryTime,
          restaurantNotes: data.restaurantNotes,
          items: {
            create: validatedOrderItems,
          },
          statusHistory: {
            create: {
              toStatus: 'PLACED',
              changedByRole: 'CUSTOMER',
              changedById: customerId,
              note: `Order placed with ${data.paymentMethod} payment`,
            },
          },
        },
        include: {
          items: true,
          restaurant: { select: { id: true, name: true, phone: true, address: true } },
          address: true,
        },
      });

      return order;
    });

    // 9. Generate Razorpay Test Order if RAZORPAY is selected
    let razorpayOrderData: any = null;
    if (data.paymentMethod === 'RAZORPAY') {
      try {
        if (razorpayInstance) {
          const rzpOrder = await razorpayInstance.orders.create({
            amount: Math.round(totalAmount * 100), // in paise
            currency: 'INR',
            receipt: newOrder.orderNumber,
            notes: {
              orderId: newOrder.id,
              customerId,
            },
          });

          await prisma.order.update({
            where: { id: newOrder.id },
            data: { razorpayOrderId: rzpOrder.id },
          });

          razorpayOrderData = rzpOrder;
        } else {
          // Dev Mock Razorpay Order for Test Mode
          const mockRzpOrderId = `order_mock_${Date.now()}`;
          await prisma.order.update({
            where: { id: newOrder.id },
            data: { razorpayOrderId: mockRzpOrderId },
          });

          razorpayOrderData = {
            id: mockRzpOrderId,
            amount: Math.round(totalAmount * 100),
            currency: 'INR',
            receipt: newOrder.orderNumber,
          };
        }
      } catch (err) {
        console.error('Razorpay order creation fallback:', err);
      }
    }

    // 10. Emit Real-time Alert to Restaurant Room
    try {
      io.to(`restaurant_${restaurant.id}`).emit('new_order', {
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        customerName: address.label,
        totalAmount: newOrder.totalAmount,
        itemCount: validatedOrderItems.length,
        items: validatedOrderItems,
        placedAt: newOrder.placedAt,
      });
    } catch {
      // silent
    }

    return {
      order: newOrder,
      razorpayOrder: razorpayOrderData,
      rawDeliveryOtp,
    };
  }

  /**
   * Verify Razorpay cryptographic HMAC signature
   */
  static async verifyRazorpayPayment(data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Verify signature cryptographically
    const keySecret = ENV.RAZORPAY_KEY_SECRET;
    let isValidSignature = false;

    if (isRealRazorpayKey(keySecret)) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
        .digest('hex');

      isValidSignature = generatedSignature === data.razorpaySignature;
    } else {
      // In development test mock mode, accept valid string signatures
      isValidSignature = Boolean(data.razorpaySignature);
    }

    if (!isValidSignature) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'FAILED' },
      });
      throw new Error('Payment signature verification failed');
    }

    // Atomic update to PAYMENT_CONFIRMED
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'PAYMENT_CONFIRMED',
          razorpayPaymentId: data.razorpayPaymentId,
          razorpaySignature: data.razorpaySignature,
        },
        include: {
          items: true,
          restaurant: true,
          address: true,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: 'PAYMENT_CONFIRMED',
          changedByRole: 'CUSTOMER',
          note: `Payment confirmed via Razorpay (${data.razorpayPaymentId})`,
        },
      });

      return updated;
    });

    // Notify Restaurant
    try {
      io.to(`restaurant_${order.restaurantId}`).emit('order_payment_confirmed', {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: 'PAYMENT_CONFIRMED',
      });
    } catch {
      // silent
    }

    return updatedOrder;
  }

  /**
   * Get orders for customer
   */
  static async getCustomerOrders(customerId: string) {
    const orders = await prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            address: true,
            bannerUrl: true,
          },
        },
        address: true,
        rider: {
          select: {
            id: true,
            vehicleType: true,
            vehicleNumber: true,
            rating: true,
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
   * Get single order by ID with ownership verification
   */
  static async getOrderById(orderId: string, userId: string, userRole: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        items: {
          include: { menuItem: true },
        },
        restaurant: true,
        address: true,
        rider: {
          include: { user: { select: { name: true, phone: true, avatar: true } } },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Role-based resource ownership check
    if (userRole === 'CUSTOMER' && order.customerId !== userId) {
      throw new Error('Unauthorized access to this order');
    }

    if (userRole === 'RESTAURANT') {
      const userRestaurant = await prisma.restaurant.findFirst({
        where: { ownerId: userId },
      });
      if (userRestaurant?.id !== order.restaurantId) {
        throw new Error('Unauthorized access to this restaurant order');
      }
    }

    return order;
  }
}
