import { describe, it, expect } from 'vitest';
import { isValidStatusTransition } from '../utils/stateMachine.js';
import { RestaurantManagementService } from '../services/restaurantManagement.service.js';
import { prisma } from '../config/db.js';

describe('Phase 4: Order State Machine & Restaurant Operations Tests', () => {
  describe('Order State Machine Transition Engine', () => {
    it('should allow valid sequential transitions', () => {
      expect(isValidStatusTransition('PLACED', 'PAYMENT_CONFIRMED')).toBe(true);
      expect(isValidStatusTransition('PLACED', 'RESTAURANT_ACCEPTED')).toBe(true);
      expect(isValidStatusTransition('PAYMENT_CONFIRMED', 'RESTAURANT_ACCEPTED')).toBe(true);
      expect(isValidStatusTransition('RESTAURANT_ACCEPTED', 'PREPARING')).toBe(true);
      expect(isValidStatusTransition('PREPARING', 'READY_FOR_PICKUP')).toBe(true);
      expect(isValidStatusTransition('READY_FOR_PICKUP', 'RIDER_ASSIGNED')).toBe(true);
      expect(isValidStatusTransition('RIDER_ASSIGNED', 'PICKED_UP')).toBe(true);
      expect(isValidStatusTransition('PICKED_UP', 'OUT_FOR_DELIVERY')).toBe(true);
      expect(isValidStatusTransition('OUT_FOR_DELIVERY', 'DELIVERED')).toBe(true);
    });

    it('should reject invalid skip transitions and backward transitions', () => {
      // Cannot jump straight from PLACED to DELIVERED without kitchen prep and delivery
      expect(isValidStatusTransition('PLACED', 'DELIVERED')).toBe(false);
      expect(isValidStatusTransition('PLACED', 'PICKED_UP')).toBe(false);

      // Cannot regress backwards from DELIVERED back to PLACED
      expect(isValidStatusTransition('DELIVERED', 'PLACED')).toBe(false);
      expect(isValidStatusTransition('DELIVERED', 'PREPARING')).toBe(false);
    });
  });

  describe('Restaurant Menu & Earnings Services', () => {
    it('should create menu category, add dishes, and toggle stock availability', async () => {
      const restaurant = await prisma.restaurant.findUnique({
        where: { slug: 'delhi-darbar-royal-mughlai' },
      });
      expect(restaurant).not.toBeNull();

      // Create Category
      const cat = await RestaurantManagementService.createCategory(
        restaurant!.id,
        'Chef Special Platters',
        99
      );
      expect(cat.id).toBeDefined();
      expect(cat.name).toBe('Chef Special Platters');

      // Create Dish
      const dish = await RestaurantManagementService.createMenuItem(restaurant!.id, {
        categoryId: cat.id,
        name: 'Royal Kebab Tasting Platter',
        description: 'Assortment of Seekh, Reshmi and Malai Tikka',
        price: 499.0,
        isVeg: false,
        prepTimeMinutes: 20,
        spiceLevel: 2,
      });
      expect(dish.id).toBeDefined();
      expect(dish.price).toBe(499.0);
      expect(dish.isAvailable).toBe(true);

      // Toggle Out of Stock
      const updatedDish = await RestaurantManagementService.updateMenuItem(
        restaurant!.id,
        dish.id,
        { isAvailable: false }
      );
      expect(updatedDish.isAvailable).toBe(false);

      // Clean up
      await RestaurantManagementService.deleteMenuItem(restaurant!.id, dish.id);
    });

    it('should compute gross sales and exact 20% platform commission deduction', async () => {
      const restaurant = await prisma.restaurant.findUnique({
        where: { slug: 'delhi-darbar-royal-mughlai' },
      });
      expect(restaurant).not.toBeNull();

      const earnings = await RestaurantManagementService.getEarningsSummary(restaurant!.id);
      expect(earnings.commissionRate).toBe(20.0);
      expect(earnings.totalGrossSales).toBeDefined();
      expect(earnings.totalCommissionDeducted).toBeDefined();
      expect(earnings.totalNetPayout).toBeDefined();

      // Verification: Gross - Commission = Net
      const expectedNet = Number((earnings.totalGrossSales - earnings.totalCommissionDeducted).toFixed(2));
      expect(earnings.totalNetPayout).toBeCloseTo(expectedNet, 1);
    });
  });
});
