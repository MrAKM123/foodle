import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { ENV } from '../config/env.js';
import { sendError } from '../utils/response.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'RESTAURANT' | 'RIDER' | 'ADMIN';
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: 'CUSTOMER' | 'RESTAURANT' | 'RIDER' | 'ADMIN';
        status: string;
        isEmailVerified: boolean;
        restaurantId?: string;
        riderId?: string;
      };
    }
  }
}

/**
 * Authentication middleware: Verifies JWT from cookie or Bearer header
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      sendError(res, 'Authentication required. Please log in.', 401);
      return;
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        restaurants: { select: { id: true, isApproved: true, isOpen: true }, take: 1 },
        riderProfile: { select: { id: true, documentsVerified: true, isOnline: true } },
      },
    });

    if (!user) {
      sendError(res, 'Account not found. Please log in again.', 401);
      return;
    }

    if (user.status === 'BANNED') {
      sendError(res, 'This account has been banned. Please contact support.', 403);
      return;
    }

    if (user.status === 'SUSPENDED') {
      sendError(res, 'This account is temporarily suspended.', 403);
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      restaurantId: user.restaurants[0]?.id,
      riderId: user.riderProfile?.id,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      sendError(res, 'Session expired. Please log in again.', 401);
      return;
    }
    sendError(res, 'Invalid authentication token.', 401);
  }
};

/**
 * Role-Based Access Control (RBAC) middleware: Enforces permitted roles
 */
export const requireRole = (allowedRoles: Array<'CUSTOMER' | 'RESTAURANT' | 'RIDER' | 'ADMIN'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Unauthorized access', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, `Forbidden: Requires one of [${allowedRoles.join(', ')}] role`, 403);
      return;
    }

    next();
  };
};

/**
 * Middleware ensuring email verification is completed for sensitive actions
 */
export const requireEmailVerified = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  if (!req.user.isEmailVerified && req.user.role !== 'ADMIN') {
    sendError(res, 'Please verify your email address to perform this action.', 403, {
      requiresEmailVerification: true,
      email: req.user.email,
    });
    return;
  }

  next();
};
