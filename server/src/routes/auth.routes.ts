import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
} from '../validators/auth.validator.js';

const router = Router();

// Public Authentication endpoints (rate-limited)
router.post('/register', authLimiter, validateBody(registerSchema), AuthController.register);
router.post('/login', authLimiter, validateBody(loginSchema), AuthController.login);
router.post('/verify-otp', authLimiter, validateBody(verifyOtpSchema), AuthController.verifyOtp);
router.post('/resend-otp', authLimiter, validateBody(resendOtpSchema), AuthController.resendOtp);

// 1-Click Quick Demo Login for testing and recruiters
router.post('/demo/:role', AuthController.demoLogin);

// Protected endpoints
router.get('/me', authenticate, AuthController.getCurrentUser);
router.post('/logout', authenticate, AuthController.logout);

export default router;
