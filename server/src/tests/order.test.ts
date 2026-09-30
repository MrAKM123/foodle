import { describe, it, expect } from 'vitest';
import { OrderService } from '../services/order.service.js';
import { prisma } from '../config/db.js';

describe('Phase 3: Order Placement, Pricing Math & Razorpay Verification Tests', () => {
  it('should create an atomic COD order with server-calculated totals and hashed Delivery OTP', async () => {
    const customer = await prisma.user.findUnique({
      where: { email: 'customer@foodle.app' },
      include: { addresses: true },
    });
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: 'delhi-darbar-royal-mughlai' },
      include: { menuItems: true },
    });

    expect(customer).not.toBeNull();
    expect(customer?.addresses.length).toBeGreaterThan(0);
    expect(restaurant).not.toBeNull();
    expect(restaurant?.menuItems.length).toBeGreaterThan(0);

    const address = customer!.addresses[0];
    const item1 = restaurant!.menuItems[0]; // e.g. Biryani ₹349

    const result = await OrderService.createOrder(customer!.id, {
      restaurantId: restaurant!.id,
      addressId: address.id,
      items: [
        {
          menuItemId: item1.id,
          quantity: 2,
        },
      ],
      paymentMethod: 'COD',
      couponCode: null,
      restaurantNotes: 'Extra spicy please',
    });

    expect(result.order).toBeDefined();
    expect(result.order.orderNumber).toMatch(/^FDL-\d{5}$/);
    expect(result.order.subtotal).toBe(item1.price * 2);
    expect(result.order.platformFee).toBe(5.0);
    expect(result.order.status).toBe('PLACED');
    expect(result.order.paymentMethod).toBe('COD');
    expect(result.order.deliveryOtpHash).toBeDefined();
    expect(result.rawDeliveryOtp).toHaveLength(4);

    // Verify initial status history entry
    const history = await prisma.orderStatusHistory.findMany({
      where: { orderId: result.order.id },
    });
    expect(history.length).toBe(1);
    expect(history[0].toStatus).toBe('PLACED');
  });

  it('should enforce minimum order amount constraint', async () => {
    const customer = await prisma.user.findUnique({
      where: { email: 'customer@foodle.app' },
      include: { addresses: true },
    });
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: 'delhi-darbar-royal-mughlai' },
      include: { menuItems: true },
    });

    const address = customer!.addresses[0];
    // Find garlic naan ₹99 (below ₹149 min order)
    const cheapItem = restaurant!.menuItems.find((i) => i.price < restaurant!.minOrderAmount);

    if (cheapItem) {
      await expect(
        OrderService.createOrder(customer!.id, {
          restaurantId: restaurant!.id,
          addressId: address.id,
          items: [{ menuItemId: cheapItem.id, quantity: 1 }],
          paymentMethod: 'COD',
        })
      ).rejects.toThrow(/Minimum order amount/);
    }
  });

  it('should apply valid coupon discount (WELCOME50)', async () => {
    const customer = await prisma.user.findUnique({
      where: { email: 'customer@foodle.app' },
      include: { addresses: true },
    });
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: 'delhi-darbar-royal-mughlai' },
      include: { menuItems: true },
    });

    const address = customer!.addresses[0];
    const item = restaurant!.menuItems[0]; // ₹349

    const result = await OrderService.createOrder(customer!.id, {
      restaurantId: restaurant!.id,
      addressId: address.id,
      items: [{ menuItemId: item.id, quantity: 1 }],
      paymentMethod: 'COD',
      couponCode: 'WELCOME50',
    });

    expect(result.order.couponCode).toBe('WELCOME50');
    expect(result.order.discount).toBeGreaterThan(0);
    expect(result.order.totalAmount).toBeLessThan(
      result.order.subtotal + result.order.deliveryFee + result.order.platformFee + result.order.tax
    );
  });

  it('should verify Razorpay payment and advance status to PAYMENT_CONFIRMED', async () => {
    const customer = await prisma.user.findUnique({
      where: { email: 'customer@foodle.app' },
      include: { addresses: true },
    });
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: 'delhi-darbar-royal-mughlai' },
      include: { menuItems: true },
    });

    const address = customer!.addresses[0];
    const item = restaurant!.menuItems[0];

    const { order } = await OrderService.createOrder(customer!.id, {
      restaurantId: restaurant!.id,
      addressId: address.id,
      items: [{ menuItemId: item.id, quantity: 1 }],
      paymentMethod: 'RAZORPAY',
    });

    expect(order.status).toBe('PLACED');
    expect(order.paymentStatus).toBe('PENDING');

    // Verify Payment
    const updated = await OrderService.verifyRazorpayPayment({
      orderId: order.id,
      razorpayOrderId: order.razorpayOrderId || 'order_mock_123',
      razorpayPaymentId: 'pay_mock_test_456',
      razorpaySignature: 'mock_verified_sig_test',
    });

    expect(updated.status).toBe('PAYMENT_CONFIRMED');
    expect(updated.paymentStatus).toBe('COMPLETED');
    expect(updated.razorpayPaymentId).toBe('pay_mock_test_456');

    // Check status history entry
    const history = await prisma.orderStatusHistory.findMany({
      where: { orderId: order.id },
      orderBy: { createdAt: 'asc' },
    });
    expect(history.length).toBe(2);
    expect(history[1].toStatus).toBe('PAYMENT_CONFIRMED');
  });
});
