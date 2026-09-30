import { Request, Response } from 'express';
import { RestaurantService } from '../services/restaurant.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class RestaurantController {
  /**
   * List restaurants with search and filters
   */
  static async listRestaurants(req: Request, res: Response): Promise<void> {
    try {
      const result = await RestaurantService.listRestaurants(req.query as any);
      sendSuccess(res, result.restaurants, 'Restaurants retrieved successfully', 200, result.meta);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch restaurants', 500);
    }
  }

  /**
   * Get single restaurant details and menu
   */
  static async getRestaurantDetails(req: Request, res: Response): Promise<void> {
    try {
      const slug = req.params.slug as string;
      const restaurant = await RestaurantService.getRestaurantBySlug(slug);
      sendSuccess(res, restaurant, 'Restaurant details fetched');
    } catch (error: any) {
      sendError(res, error.message || 'Restaurant not found', 404);
    }
  }

  /**
   * Get popular cuisines list
   */
  static async getCuisines(req: Request, res: Response): Promise<void> {
    try {
      const cuisines = await RestaurantService.getPopularCuisines();
      sendSuccess(res, cuisines, 'Cuisines retrieved');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch cuisines', 500);
    }
  }

  /**
   * Toggle favorite
   */
  static async toggleFavorite(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const result = await RestaurantService.toggleFavorite(userId, id);
      sendSuccess(
        res,
        result,
        result.isFavorited ? 'Added to favorites' : 'Removed from favorites'
      );
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update favorite', 400);
    }
  }

  /**
   * Get user favorites
   */
  static async getUserFavorites(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const favorites = await RestaurantService.getUserFavorites(userId);
      sendSuccess(res, favorites, 'Favorites retrieved');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch favorites', 500);
    }
  }
}
