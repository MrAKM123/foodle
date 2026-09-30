import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class UserController {
  /**
   * Update current user profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, phone, avatar } = req.body;

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name ?? undefined,
          phone: phone ?? undefined,
          avatar: avatar ?? undefined,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          avatar: true,
          isEmailVerified: true,
        },
      });

      sendSuccess(res, updated, 'Profile updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update profile', 400);
    }
  }

  /**
   * List customer addresses
   */
  static async getAddresses(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const addresses = await prisma.address.findMany({
        where: { userId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });

      sendSuccess(res, addresses, 'Addresses fetched successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch addresses', 500);
    }
  }

  /**
   * Add a new saved address with map coordinates
   */
  static async addAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { label, street, city, state, postalCode, landmark, lat, lng, isDefault } = req.body;

      if (!street || !city || lat === undefined || lng === undefined) {
        sendError(res, 'Street, city, and GPS coordinates are required', 400);
        return;
      }

      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const address = await prisma.address.create({
        data: {
          userId,
          label: label || 'Home',
          street,
          city,
          state: state || 'Delhi',
          postalCode: postalCode || '110001',
          landmark,
          lat: Number(lat),
          lng: Number(lng),
          isDefault: Boolean(isDefault),
        },
      });

      sendSuccess(res, address, 'Address added successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to add address', 400);
    }
  }

  /**
   * Delete saved address
   */
  static async deleteAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      const address = await prisma.address.findFirst({
        where: { id, userId },
      });

      if (!address) {
        sendError(res, 'Address not found or unauthorized', 404);
        return;
      }

      await prisma.address.delete({
        where: { id },
      });

      sendSuccess(res, null, 'Address removed');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete address', 500);
    }
  }
}
