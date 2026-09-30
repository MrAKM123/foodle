import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  createOrderSchema,
  verifyRazorpayPaymentSchema,
} from '../validators/order.validator.js';

const router = Router();

router.use(authenticate);

// Order creation & payment verification
router.post('/create', validateBody(createOrderSchema), OrderController.createOrder);
router.post(
  '/razorpay/verify',
  validateBody(verifyRazorpayPaymentSchema),
  OrderController.verifyRazorpayPayment
);

// Order histories and detail
router.get('/my-orders', OrderController.getMyOrders);
router.get('/:id', OrderController.getOrderDetails);

export default router;
