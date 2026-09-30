import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import restaurantRoutes from './restaurant.routes.js';
import orderRoutes from './order.routes.js';
import restaurantManagementRoutes from './restaurantManagement.routes.js';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Foodle API Server',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount modular sub-routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/restaurants', restaurantRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/restaurant', restaurantManagementRoutes);

export default apiRouter;
