import { Request, Response } from 'express';
import { OrderService } from '../services/order.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { generatePdfInvoice } from '../utils/pdfInvoice.js';

export class OrderController {
  /**
   * Create a new customer order
   */
  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const customerId = req.user!.id;
      const result = await OrderService.createOrder(customerId, req.body);
      sendSuccess(res, result, 'Order placed successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to place order', 400);
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  static async verifyRazorpayPayment(req: Request, res: Response): Promise<void> {
    try {
      const result = await OrderService.verifyRazorpayPayment(req.body);
      sendSuccess(res, result, 'Payment verified successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Payment verification failed', 400);
    }
  }

  /**
   * List customer's own orders
   */
  static async getMyOrders(req: Request, res: Response): Promise<void> {
    try {
      const customerId = req.user!.id;
      const orders = await OrderService.getCustomerOrders(customerId);
      sendSuccess(res, orders, 'Orders fetched successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch orders', 500);
    }
  }

  /**
   * Get single order by ID
   */
  static async getOrderDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const order = await OrderService.getOrderById(id, userId, userRole);
      sendSuccess(res, order, 'Order details fetched');
    } catch (error: any) {
      sendError(res, error.message || 'Order not found', 404);
    }
  }

  /**
   * Download or stream PDF tax invoice
   */
  static async downloadInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const order = await OrderService.getOrderById(id, userId, userRole);
      if (!order) {
        sendError(res, 'Order not found', 404);
        return;
      }

      generatePdfInvoice(
        {
          orderNumber: order.orderNumber,
          createdAt: order.createdAt,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          razorpayPaymentId: order.razorpayPaymentId,
          subtotal: order.subtotal,
          taxAmount: order.tax,
          deliveryFee: order.deliveryFee,
          platformFee: order.platformFee,
          discountAmount: order.discount,
          totalAmount: order.totalAmount,
          customer: {
            name: order.customer.name,
            email: order.customer.email,
            phone: order.customer.phone,
          },
          restaurant: {
            name: order.restaurant.name,
            address: order.restaurant.address,
            phone: order.restaurant.phone,
            fssaiLicense: order.restaurant.fssaiLicense,
          },
          address: {
            label: order.address.label,
            street: order.address.street,
            city: order.address.city,
            pincode: order.address.pincode,
          },
          items: order.items.map((it: any) => ({
            name: it.menuItem?.name || 'Item',
            quantity: it.quantity,
            price: it.price,
            totalPrice: it.totalPrice,
            isVeg: it.menuItem?.isVeg ?? true,
            variantName: it.variantName,
            addons: it.addons,
          })),
        },
        res
      );
    } catch (error: any) {
      sendError(res, error.message || 'Failed to generate invoice', 500);
    }
  }
}
