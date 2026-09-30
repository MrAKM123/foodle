import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { ENV } from '../config/env.js';
import { generateNumericOtp } from '../utils/otp.js';
import { sendOtpEmail } from './email.service.js';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Generates JWT Access & Refresh token pair
   */
  static generateTokens(payload: { userId: string; email: string; role: string }): TokenPair {
    const accessToken = jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: '7d',
    });

    const refreshToken = jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }

  /**
   * Registers a new user with optional Restaurant / Rider initial entities
   */
  static async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string | null;
    role?: 'CUSTOMER' | 'RESTAURANT' | 'RIDER' | 'ADMIN';
    restaurantName?: string;
    cuisineTypes?: string;
    address?: string;
    city?: string;
    vehicleType?: string;
    vehicleNumber?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error('An account with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const otp = generateNumericOtp(6);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const role = data.role || 'CUSTOMER';

    // Transaction to create User and associated role profile
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          name: data.name,
          phone: data.phone,
          role,
          status: role === 'ADMIN' ? 'ACTIVE' : 'ACTIVE',
          isEmailVerified: false,
          emailOtp: otp,
          emailOtpExpiresAt: otpExpiresAt,
        },
      });

      // If registering as a Restaurant Owner
      if (role === 'RESTAURANT') {
        const rawSlug = (data.restaurantName || data.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const slug = `${rawSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

        await tx.restaurant.create({
          data: {
            ownerId: newUser.id,
            name: data.restaurantName || `${data.name}'s Kitchen`,
            slug,
            phone: data.phone || '9999999999',
            email: data.email,
            address: data.address || 'Connaught Place, Central Delhi',
            city: data.city || 'New Delhi',
            lat: 28.6304,
            lng: 77.2177,
            cuisineTypes: data.cuisineTypes || 'North Indian, Mughlai, Fast Food',
            isApproved: false, // Requires admin verification
            isOpen: true,
            bannerUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
            logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
          },
        });
      }

      // If registering as a Delivery Rider
      if (role === 'RIDER') {
        await tx.riderProfile.create({
          data: {
            userId: newUser.id,
            vehicleType: data.vehicleType || 'Bike',
            vehicleNumber: data.vehicleNumber || 'DL 01 AB 1234',
            licenseNumber: 'DL-20230009876',
            documentsVerified: false, // Requires admin verification
            isOnline: false,
            currentLat: 28.6304,
            currentLng: 77.2177,
          },
        });
      }

      return newUser;
    });

    // Send OTP email (async)
    sendOtpEmail(user.email, otp, user.name).catch((err) =>
      console.error('Background OTP email sending failed:', err)
    );

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, tokens, otpSent: true };
  }

  /**
   * Log in existing user
   */
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        restaurants: { select: { id: true, name: true, isApproved: true, isOpen: true }, take: 1 },
        riderProfile: { select: { id: true, documentsVerified: true, isOnline: true } },
      },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.status === 'BANNED') {
      throw new Error('Your account has been banned. Please contact support.');
    }

    if (user.status === 'SUSPENDED') {
      throw new Error('Your account is temporarily suspended.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, tokens };
  }

  /**
   * Verify 6-digit email OTP
   */
  static async verifyOtp(email: string, otp: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      return { user, alreadyVerified: true };
    }

    if (!user.emailOtp || !user.emailOtpExpiresAt) {
      throw new Error('No OTP request found. Please request a new OTP.');
    }

    if (new Date() > user.emailOtpExpiresAt) {
      throw new Error('OTP has expired. Please request a new OTP.');
    }

    if (user.emailOtp !== otp.trim()) {
      throw new Error('Invalid verification code. Please check and try again.');
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailOtp: null,
        emailOtpExpiresAt: null,
      },
    });

    return { user: updatedUser, alreadyVerified: false };
  }

  /**
   * Resend fresh OTP
   */
  static async resendOtp(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Account not found');
    }

    const otp = generateNumericOtp(6);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailOtp: otp,
        emailOtpExpiresAt: otpExpiresAt,
      },
    });

    await sendOtpEmail(user.email, otp, user.name);

    return { success: true };
  }
}
