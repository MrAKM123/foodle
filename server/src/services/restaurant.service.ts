import { prisma } from '../config/db.js';

export interface RestaurantFilters {
  search?: string;
  cuisine?: string;
  isVeg?: boolean;
  minRating?: number;
  isOpen?: boolean;
  sortBy?: 'rating_desc' | 'prep_time_asc' | 'min_order_asc' | 'name_asc';
  page?: number;
  limit?: number;
}

export class RestaurantService {
  /**
   * List approved restaurants with search, filters, sorting, and pagination
   */
  static async listRestaurants(filters: RestaurantFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;

    const where: any = {
      isApproved: true, // Only show admin-approved restaurants to customers
    };

    if (filters.isOpen !== undefined) {
      where.isOpen = filters.isOpen;
    }

    if (filters.minRating) {
      where.rating = { gte: filters.minRating };
    }

    if (filters.search) {
      const searchTerm = filters.search.trim();
      where.OR = [
        { name: { contains: searchTerm } },
        { cuisineTypes: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { city: { contains: searchTerm } },
        {
          menuItems: {
            some: {
              name: { contains: searchTerm },
              isAvailable: true,
            },
          },
        },
      ];
    }

    if (filters.cuisine) {
      where.cuisineTypes = { contains: filters.cuisine.trim() };
    }

    if (filters.isVeg) {
      // If pure veg filter is applied, look for restaurants with "Pure Veg" cuisine or having exclusively veg items
      where.OR = [
        { cuisineTypes: { contains: 'Pure Veg' } },
        {
          menuItems: {
            some: { isVeg: true },
          },
        },
      ];
    }

    // Determine sorting order
    let orderBy: any = [{ rating: 'desc' }, { ratingCount: 'desc' }];
    if (filters.sortBy === 'prep_time_asc') {
      orderBy = { avgPrepTimeMinutes: 'asc' };
    } else if (filters.sortBy === 'min_order_asc') {
      orderBy = { minOrderAmount: 'asc' };
    } else if (filters.sortBy === 'name_asc') {
      orderBy = { name: 'asc' };
    }

    const [total, restaurants] = await Promise.all([
      prisma.restaurant.count({ where }),
      prisma.restaurant.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          phone: true,
          email: true,
          address: true,
          city: true,
          lat: true,
          lng: true,
          bannerUrl: true,
          logoUrl: true,
          cuisineTypes: true,
          isOpen: true,
          isApproved: true,
          openingTime: true,
          closingTime: true,
          minOrderAmount: true,
          avgPrepTimeMinutes: true,
          rating: true,
          ratingCount: true,
          _count: {
            select: { menuItems: true },
          },
        },
      }),
    ]);

    return {
      restaurants,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single restaurant details by slug or id with categorized menu items
   */
  static async getRestaurantBySlug(slugOrId: string) {
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
      },
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            menuItems: {
              where: { isAvailable: true },
              include: {
                variants: true,
                addons: true,
              },
            },
          },
        },
      },
    });

    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    return restaurant;
  }

  /**
   * Get popular cuisine types and tags
   */
  static async getPopularCuisines() {
    const restaurants = await prisma.restaurant.findMany({
      where: { isApproved: true },
      select: { cuisineTypes: true },
    });

    const cuisineSet = new Set<string>();
    restaurants.forEach((r) => {
      r.cuisineTypes.split(',').forEach((c) => {
        const trimmed = c.trim();
        if (trimmed) cuisineSet.add(trimmed);
      });
    });

    return Array.from(cuisineSet);
  }

  /**
   * Toggle user favorite for a restaurant
   */
  static async toggleFavorite(userId: string, restaurantId: string) {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_restaurantId: {
          userId,
          restaurantId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return { isFavorited: false };
    } else {
      await prisma.favorite.create({
        data: {
          userId,
          restaurantId,
        },
      });
      return { isFavorited: true };
    }
  }

  /**
   * Get list of restaurants favorited by the current user
   */
  static async getUserFavorites(userId: string) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            cuisineTypes: true,
            rating: true,
            ratingCount: true,
            bannerUrl: true,
            isOpen: true,
            avgPrepTimeMinutes: true,
            minOrderAmount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((f) => f.restaurant);
  }
}
