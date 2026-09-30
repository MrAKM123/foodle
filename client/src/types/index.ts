export type UserRole = 'CUSTOMER' | 'RESTAURANT' | 'RIDER' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_APPROVAL';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  role: UserRole;
  status: AccountStatus;
  isEmailVerified: boolean;
  createdAt?: string;
  restaurant?: {
    id: string;
    name: string;
    slug?: string;
    isApproved: boolean;
    isOpen: boolean;
    rating?: number;
  } | null;
  riderProfile?: {
    id: string;
    vehicleType: string;
    vehicleNumber: string;
    documentsVerified: boolean;
    isOnline: boolean;
    totalEarnings?: number;
    rating?: number;
  } | null;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  landmark?: string | null;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string | null;
  phone: string;
  email: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  cuisineTypes: string;
  isOpen: boolean;
  isApproved: boolean;
  openingTime: string;
  closingTime: string;
  commissionRate: number;
  minOrderAmount: number;
  avgPrepTimeMinutes: number;
  rating: number;
  ratingCount: number;
  categories?: MenuCategory[];
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
  menuItems: MenuItem[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isVeg: boolean;
  isAvailable: boolean;
  prepTimeMinutes: number;
  spiceLevel: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: any;
}
