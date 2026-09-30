import { describe, it, expect } from 'vitest';
import { RestaurantService } from '../services/restaurant.service.js';
import { prisma } from '../config/db.js';

describe('Phase 2: Restaurant Catalog, Menu & Favorites Services', () => {
  it('should list all approved restaurants with pagination metadata', async () => {
    const result = await RestaurantService.listRestaurants({ page: 1, limit: 10 });
    expect(result.restaurants).toBeDefined();
    expect(result.restaurants.length).toBeGreaterThan(0);
    expect(result.meta.total).toBeGreaterThan(0);
    expect(result.meta.totalPages).toBeGreaterThanOrEqual(1);
  });

  it('should search restaurants by name or cuisine keyword', async () => {
    const biryaniResults = await RestaurantService.listRestaurants({ search: 'Biryani' });
    expect(biryaniResults.restaurants.length).toBeGreaterThan(0);
    const hasBiryani = biryaniResults.restaurants.some(
      (r) => r.name.includes('Biryani') || r.cuisineTypes.includes('Biryani')
    );
    expect(hasBiryani).toBe(true);
  });

  it('should filter restaurants by Pure Veg / South Indian', async () => {
    const southResults = await RestaurantService.listRestaurants({ cuisine: 'South Indian' });
    expect(southResults.restaurants.length).toBeGreaterThan(0);
    expect(southResults.restaurants[0].cuisineTypes).toContain('South Indian');
  });

  it('should fetch single restaurant by slug with full categories and menu items', async () => {
    const restaurant = await RestaurantService.getRestaurantBySlug('delhi-darbar-royal-mughlai');
    expect(restaurant).toBeDefined();
    expect(restaurant.name).toBe('Delhi Darbar & Royal Mughlai');
    expect(restaurant.categories.length).toBeGreaterThan(0);
    expect(restaurant.categories[0].menuItems.length).toBeGreaterThan(0);
  });

  it('should toggle and retrieve user favorite restaurants', async () => {
    const customer = await prisma.user.findUnique({
      where: { email: 'customer@foodle.app' },
    });
    const restaurant = await prisma.restaurant.findFirst();

    expect(customer).not.toBeNull();
    expect(restaurant).not.toBeNull();

    // Toggle Favorite ON
    const favResult = await RestaurantService.toggleFavorite(customer!.id, restaurant!.id);
    expect(favResult.isFavorited).toBe(true);

    const userFavs = await RestaurantService.getUserFavorites(customer!.id);
    expect(userFavs.some((r) => r.id === restaurant!.id)).toBe(true);

    // Toggle Favorite OFF
    const unfavResult = await RestaurantService.toggleFavorite(customer!.id, restaurant!.id);
    expect(unfavResult.isFavorited).toBe(false);
  });
});
