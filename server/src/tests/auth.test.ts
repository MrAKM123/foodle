import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateNumericOtp, generateDeliveryOtp, hashOtp, verifyHashedOtp } from '../utils/otp.js';
import { registerSchema, loginSchema, verifyOtpSchema } from '../validators/auth.validator.js';
import { ENV } from '../config/env.js';

describe('Phase 1: Authentication & Security Utilities', () => {
  it('should generate valid 6-digit email OTPs', () => {
    const otp = generateNumericOtp(6);
    expect(otp).toHaveLength(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });

  it('should generate valid 4-digit Delivery OTPs', () => {
    const deliveryOtp = generateDeliveryOtp();
    expect(deliveryOtp).toHaveLength(4);
    expect(/^\d{4}$/.test(deliveryOtp)).toBe(true);
  });

  it('should securely hash and verify OTPs', async () => {
    const plainOtp = '4829';
    const hashed = await hashOtp(plainOtp);
    expect(hashed).not.toBe(plainOtp);

    const isMatch = await verifyHashedOtp(plainOtp, hashed);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyHashedOtp('0000', hashed);
    expect(isWrongMatch).toBe(false);
  });

  it('should hash passwords with bcrypt and compare successfully', async () => {
    const password = 'SecurePassword@123';
    const hash = await bcrypt.hash(password, 12);
    expect(hash).not.toBe(password);

    const valid = await bcrypt.compare(password, hash);
    expect(valid).toBe(true);
  });

  it('should sign and decode JWT tokens with user roles', () => {
    const payload = {
      userId: 'user-uuid-123',
      email: 'aarav@foodle.app',
      role: 'CUSTOMER',
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe('CUSTOMER');
  });

  it('should validate registration input with Zod', async () => {
    const validData = {
      email: 'test@foodle.app',
      password: 'password123',
      name: 'Test Foodie',
      role: 'CUSTOMER',
    };

    const parsed = await registerSchema.parseAsync(validData);
    expect(parsed.email).toBe('test@foodle.app');
    expect(parsed.role).toBe('CUSTOMER');

    // Invalid short password
    await expect(
      registerSchema.parseAsync({
        ...validData,
        password: '123',
      })
    ).rejects.toThrow();

    // Invalid email
    await expect(
      registerSchema.parseAsync({
        ...validData,
        email: 'invalid-email-string',
      })
    ).rejects.toThrow();
  });
});
