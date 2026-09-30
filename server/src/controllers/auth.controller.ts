import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ENV } from '../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: ENV.NODE_ENV === 'production',
  sameSite: (ENV.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { user, tokens, otpSent } = await AuthService.register(req.body);

      res.cookie('accessToken', tokens.accessToken, COOKIE_OPTIONS);
      res.cookie('refreshToken', tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            status: user.status,
          },
          accessToken: tokens.accessToken,
          otpSent,
        },
        'Registration successful! Please check your email for the verification OTP.',
        201
      );
    } catch (error: any) {
      sendError(res, error.message || 'Registration failed', 400);
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, tokens } = await AuthService.login(email, password);

      res.cookie('accessToken', tokens.accessToken, COOKIE_OPTIONS);
      res.cookie('refreshToken', tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            status: user.status,
            restaurant: user.restaurants[0] || null,
            riderProfile: user.riderProfile || null,
          },
          accessToken: tokens.accessToken,
        },
        'Logged in successfully'
      );
    } catch (error: any) {
      sendError(res, error.message || 'Invalid login credentials', 401);
    }
  }

  static async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      const { user, alreadyVerified } = await AuthService.verifyOtp(email, otp);

      sendSuccess(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            isEmailVerified: user.isEmailVerified,
          },
          alreadyVerified,
        },
        alreadyVerified ? 'Email was already verified' : 'Email successfully verified!'
      );
    } catch (error: any) {
      sendError(res, error.message || 'OTP verification failed', 400);
    }
  }

  static async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      await AuthService.resendOtp(email);
      sendSuccess(res, null, 'A new 6-digit OTP has been sent to your email.');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to resend OTP', 400);
    }
  }

  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          status: true,
          avatar: true,
          isEmailVerified: true,
          createdAt: true,
          restaurants: {
            select: {
              id: true,
              name: true,
              slug: true,
              isApproved: true,
              isOpen: true,
              commissionRate: true,
              rating: true,
            },
            take: 1,
          },
          riderProfile: {
            select: {
              id: true,
              vehicleType: true,
              vehicleNumber: true,
              documentsVerified: true,
              isOnline: true,
              totalEarnings: true,
              rating: true,
            },
          },
          addresses: {
            orderBy: { isDefault: 'desc' },
          },
        },
      });

      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      sendSuccess(res, {
        ...user,
        restaurant: user.restaurants[0] || null,
        riderProfile: user.riderProfile || null,
      });
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch user profile', 500);
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    sendSuccess(res, null, 'Logged out successfully');
  }

  /**
   * Quick 1-Click Demo Login for Recruiters & Testers
   */
  static async demoLogin(req: Request, res: Response): Promise<void> {
    try {
      const roleParam = (req.params.role as string) || 'customer';
      const role = roleParam.toUpperCase();
      const validRoles = ['CUSTOMER', 'RESTAURANT', 'RIDER', 'ADMIN'];

      if (!validRoles.includes(role)) {
        sendError(res, `Invalid demo role: ${role}`, 400);
        return;
      }

      let user = await prisma.user.findFirst({
        where: { role: role as any, status: 'ACTIVE' },
        include: {
          restaurants: { take: 1 },
          riderProfile: true,
        },
      });

      if (!user) {
        sendError(res, `No demo ${role} account found. Please run seed script.`, 404);
        return;
      }

      const tokens = AuthService.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.cookie('accessToken', tokens.accessToken, COOKIE_OPTIONS);
      res.cookie('refreshToken', tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            status: user.status,
            restaurant: user.restaurants[0] || null,
            riderProfile: user.riderProfile || null,
          },
          accessToken: tokens.accessToken,
        },
        `Switched to Demo ${role} account (${user.name})`
      );
    } catch (error: any) {
      sendError(res, error.message || 'Demo login failed', 500);
    }
  }
}
