import { Request, Response } from 'express';
import { RestaurantManagementService } from '../services/restaurantManagement.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class RestaurantManagementController {
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const restaurant = await RestaurantManagementService.getRestaurantForUser(userId);
      sendSuccess(res, restaurant, 'Restaurant profile fetched');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch restaurant profile', 400);
    }
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const restaurant = await RestaurantManagementService.getRestaurantForUser(userId);
      const updated = await RestaurantManagementService.updateRestaurantProfile(
        restaurant.id,
        req.body
      );
      sendSuccess(res, updated, 'Store settings updated');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update store settings', 400);
    }
  }

  static async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const restaurant = await RestaurantManagementService.getRestaurantForUser(userId);
      const { tab } = req.query;
      const orders = await RestaurantManagementService.getRestaurantOrders(
        restaurant.id,
        tab as string
      );
      sendSuccess(res, orders, 'Orders fetched successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch orders', 400);
    }
  }

  static async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const restaurant = await RestaurantManagementService.getRestaurantForUser(userId);
      const { id } = req.params;
      const { status, prepTimeMinutes, rejectionReason } = req.body;

      const updated = await RestaurantManagementService.updateOrderStatus(
        restaurant.id,
        id,
        status,
        prepTimeMinutes,
        rejectionReason,
        userId
      );

      sendSuccess(res, updated, `Order status updated to ${status}`);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update order status', 400);
    }
  }

  static async getMenu(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const restaurant = await RestaurantManagementService.getRestaurantForUser(userId);
      sendSuccess(res, restaurant.categories, 'Menu fetched');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch menu', 400);
    }
  }

  static async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const restaurant = await RestaurantManagementService.getRestaurantForUser(userId);
      const category = await RestaurantManagementService.createCategory(
        restaurant.id,
        req.body.name,
        req.body.sortOrder
      );
      sendSuccess(res, category, 'Category created', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create category', 400);
    }
  }

  static async createMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const restaurant = await RestaurantManagementService.getRestaurantForUser(userId);
      const item = await RestaurantManagementService.createMenuItem(restaurant.id, req.body);
      sendSuccess(res, item, 'Dish added successfully to menu', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to add dish', 400);
    }
  }

  static async updateMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const restaurant = await RestaurantManagementService.getRestaurantForUser(userId);
      const { id } = req.params;
      const updated = await RestaurantManagementService.updateMenuItem(
        restaurant.id,
        id,
        req.body
      );
      sendSuccess(res, updated, 'Dish updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update dish', 400);
    }
  }

  static async deleteMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const restaurant = await RestaurantManagementService.getRestaurantForUser(userId);
      const { id } = req.params;
      await RestaurantManagementService.deleteMenuItem(restaurant.id, id);
      sendSuccess(res, null, 'Dish removed from menu');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to remove dish', 400);
    }
  }

  static async getEarnings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const restaurant = await RestaurantManagementService.getRestaurantForUser(userId);
      const earnings = await RestaurantManagementService.getEarningsSummary(restaurant.id);
      sendSuccess(res, earnings, 'Earnings fetched successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch earnings', 400);
    }
  }
}
