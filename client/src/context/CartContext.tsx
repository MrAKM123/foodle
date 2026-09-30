import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem } from '../types/index.js';
import toast from 'react-hot-toast';

export interface CartItem {
  id: string; // Unique combination of menuItem.id + selected variants/addons
  menuItemId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  isVeg: boolean;
  quantity: number;
  selectedVariants?: { id: string; name: string; price: number }[];
  selectedAddons?: { id: string; name: string; price: number }[];
  itemTotal: number;
}

export interface CartRestaurant {
  id: string;
  name: string;
  slug: string;
}

interface ReplaceCartModalState {
  isOpen: boolean;
  newItem?: MenuItem;
  newRestaurant?: CartRestaurant;
  quantity?: number;
  variants?: any[];
  addons?: any[];
}

interface CartContextType {
  items: CartItem[];
  restaurant: CartRestaurant | null;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  totalAmount: number;
  itemCount: number;
  replaceModalState: ReplaceCartModalState;
  addItem: (
    item: MenuItem,
    restaurant: CartRestaurant,
    quantity?: number,
    variants?: any[],
    addons?: any[]
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  confirmReplaceCart: () => void;
  cancelReplaceCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'foodle_cart_v1';
const RESTAURANT_STORAGE_KEY = 'foodle_cart_restaurant_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [restaurant, setRestaurant] = useState<CartRestaurant | null>(() => {
    try {
      const saved = localStorage.getItem(RESTAURANT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [replaceModalState, setReplaceModalState] = useState<ReplaceCartModalState>({
    isOpen: false,
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    if (restaurant && items.length > 0) {
      localStorage.setItem(RESTAURANT_STORAGE_KEY, JSON.stringify(restaurant));
    } else {
      localStorage.removeItem(RESTAURANT_STORAGE_KEY);
    }
  }, [items, restaurant]);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = subtotal > 0 ? (subtotal > 499 ? 0 : 35.0) : 0; // Free delivery above ₹499
  const platformFee = subtotal > 0 ? 5.0 : 0;
  const tax = Number((subtotal * 0.05).toFixed(2)); // 5% GST
  const totalAmount = Number((subtotal + deliveryFee + platformFee + tax).toFixed(2));

  /**
   * Add Item with Single Restaurant Check
   */
  const addItem = (
    item: MenuItem,
    targetRestaurant: CartRestaurant,
    quantity = 1,
    variants: any[] = [],
    addons: any[] = []
  ) => {
    // If cart has items from another restaurant, prompt user to replace
    if (restaurant && restaurant.id !== targetRestaurant.id && items.length > 0) {
      setReplaceModalState({
        isOpen: true,
        newItem: item,
        newRestaurant: targetRestaurant,
        quantity,
        variants,
        addons,
      });
      return;
    }

    // Set restaurant
    if (!restaurant || items.length === 0) {
      setRestaurant(targetRestaurant);
    }

    const cartItemId = `${item.id}-${variants.map((v) => v.id).join('_')}-${addons.map((a) => a.id).join('_')}`;
    const variantExtra = variants.reduce((sum, v) => sum + v.price, 0);
    const addonExtra = addons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = item.price + variantExtra + addonExtra;

    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === cartItemId);
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          itemTotal: unitPrice * newQty,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            menuItemId: item.id,
            name: item.name,
            price: unitPrice,
            imageUrl: item.imageUrl,
            isVeg: item.isVeg,
            quantity,
            selectedVariants: variants,
            selectedAddons: addons,
            itemTotal: unitPrice * quantity,
          },
        ];
      }
    });

    toast.success(`Added "${item.name}" to cart`);
  };

  /**
   * Confirm replacement of cart when switching restaurant
   */
  const confirmReplaceCart = () => {
    if (!replaceModalState.newItem || !replaceModalState.newRestaurant) return;

    const { newItem, newRestaurant, quantity = 1, variants = [], addons = [] } = replaceModalState;

    setRestaurant(newRestaurant);
    const cartItemId = `${newItem.id}-${variants.map((v: any) => v.id).join('_')}-${addons.map((a: any) => a.id).join('_')}`;
    const variantExtra = variants.reduce((sum: number, v: any) => sum + v.price, 0);
    const addonExtra = addons.reduce((sum: number, a: any) => sum + a.price, 0);
    const unitPrice = newItem.price + variantExtra + addonExtra;

    setItems([
      {
        id: cartItemId,
        menuItemId: newItem.id,
        name: newItem.name,
        price: unitPrice,
        imageUrl: newItem.imageUrl,
        isVeg: newItem.isVeg,
        quantity,
        selectedVariants: variants,
        selectedAddons: addons,
        itemTotal: unitPrice * quantity,
      },
    ]);

    setReplaceModalState({ isOpen: false });
    toast.success(`Cart updated with items from ${newRestaurant.name}`);
  };

  const cancelReplaceCart = () => {
    setReplaceModalState({ isOpen: false });
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== cartItemId);
      if (next.length === 0) setRestaurant(null);
      return next;
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              itemTotal: item.price * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setItems([]);
    setRestaurant(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        restaurant,
        subtotal,
        deliveryFee,
        platformFee,
        tax,
        totalAmount,
        itemCount,
        replaceModalState,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        confirmReplaceCart,
        cancelReplaceCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
