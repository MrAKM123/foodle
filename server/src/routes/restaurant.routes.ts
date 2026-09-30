import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurant.controller.js';
import { validateQuery } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { listRestaurantsQuerySchema } from '../validators/restaurant.validator.js';

const router = Router();

// Public catalog routes
router.get('/', validateQuery(listRestaurantsQuerySchema), RestaurantController.listRestaurants);
router.get('/cuisines', RestaurantController.getCuisines);
router.get('/:slug', RestaurantController.getRestaurantDetails);

// Protected favorite routes
router.get('/user/favorites', authenticate, RestaurantController.getUserFavorites);
router.post('/:id/favorite', authenticate, RestaurantController.toggleFavorite);

export default router;
