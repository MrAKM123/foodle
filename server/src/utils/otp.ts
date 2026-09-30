import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generate a cryptographically secure 6-digit numeric OTP for email verification
 */
export function generateNumericOtp(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % 10];
  }
  return otp;
}

/**
 * Generate a 4-digit Delivery OTP for rider verification
 */
export function generateDeliveryOtp(): string {
  return generateNumericOtp(4);
}

/**
 * Hash an OTP using bcrypt for safe storage
 */
export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

/**
 * Compare plain OTP with hashed OTP
 */
export async function verifyHashedOtp(plainOtp: string, hashedOtp: string): Promise<boolean> {
  return bcrypt.compare(plainOtp, hashedOtp);
}
