import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../api/client.js';
import { Restaurant, MenuItem, MenuCategory } from '../../types/index.js';
import { useCart } from '../../context/CartContext.js';
import {
  Star,
  Clock,
  MapPin,
  Search,
  Plus,
  Minus,
  Check,
  Flame,
  ArrowLeft,
  Store,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const RestaurantPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { items, addItem, updateQuantity, restaurant: cartRestaurant } = useCart();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [menuSearch, setMenuSearch] = useState<string>('');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('');

  // Selected item for customization modal
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);

  const fetchRestaurant = async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/restaurants/${slug}`);
      if (res.data.success) {
        setRestaurant(res.data.data);
        if (res.data.data.categories?.length > 0) {
          setActiveCategory(res.data.data.categories[0].id);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load restaurant');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, [slug]);

  // Find quantity of an item in cart
  const getItemQuantityInCart = (menuItemId: string) => {
    const cartItem = items.find((i) => i.menuItemId === menuItemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const getCartItemId = (menuItemId: string) => {
    const cartItem = items.find((i) => i.menuItemId === menuItemId);
    return cartItem ? cartItem.id : null;
  };

  const handleAddItemClick = (item: MenuItem) => {
    if (!restaurant) return;

    // If item has variants or addons, open customization modal
    if (
      (item as any).variants?.length > 0 ||
      (item as any).addons?.length > 0
    ) {
      setCustomizingItem(item);
      setSelectedVariant((item as any).variants?.[0] || null);
      setSelectedAddons([]);
      return;
    }

    // Direct add
    addItem(item, {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
    });
  };

  const handleConfirmCustomization = () => {
    if (!restaurant || !customizingItem) return;

    const variants = selectedVariant ? [selectedVariant] : [];
    addItem(
      customizingItem,
      {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
      },
      1,
      variants,
      selectedAddons
    );

    setCustomizingItem(null);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-cream-200 rounded-3xl w-full"></div>
        <div className="h-8 bg-cream-200 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 bg-cream-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 max-w-lg mx-auto shadow-sm my-12">
        <Store className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-charcoal-900 font-display mb-2">
          Restaurant Unavailable
        </h3>
        <p className="text-xs text-charcoal-800/70 mb-6">
          {error || "We couldn't find the restaurant you are looking for."}
        </p>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-full shadow-warm transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Back button */}
      <Link
        to="/app"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-800 hover:text-brand-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Restaurants
      </Link>

      {/* Restaurant Header Banner Card */}
      <div className="bg-white rounded-3xl overflow-hidden border border-cream-200 shadow-warm">
        <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-charcoal-900">
          <img
            src={
              restaurant.bannerUrl ||
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
            }
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/90 via-charcoal-950/40 to-transparent"></div>

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {restaurant.isOpen ? (
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> Open Now
              </span>
            ) : (
              <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                Closed for Orders
              </span>
            )}
          </div>

          {/* Restaurant details over banner */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold font-display leading-tight text-white mb-1">
                  {restaurant.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-200 font-medium line-clamp-1 mb-2">
                  {restaurant.cuisineTypes}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-400" />
                    {restaurant.address}, {restaurant.city}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-2xl text-center">
                  <div className="flex items-center justify-center gap-1 text-emerald-400 font-extrabold text-sm sm:text-base">
                    <span>{restaurant.rating.toFixed(1)}</span>
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div className="text-[10px] text-gray-300 font-medium">
                    {restaurant.ratingCount}+ reviews
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-2xl text-center">
                  <div className="flex items-center justify-center gap-1 text-saffron-300 font-extrabold text-sm sm:text-base">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{restaurant.avgPrepTimeMinutes} mins</span>
                  </div>
                  <div className="text-[10px] text-gray-300 font-medium">
                    Min ₹{restaurant.minOrderAmount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Search and Veg Filter Toolbar */}
        <div className="p-4 sm:p-5 border-t border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-cream-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder="Search in this menu (e.g. Biryani, Naan)..."
              className="w-full pl-10 pr-4 py-2 text-xs md:text-sm bg-white border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                vegOnly
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <span className="veg-indicator"></span>
              <span>Veg Only Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Category Quick Jump Bar */}
      {restaurant.categories && restaurant.categories.length > 0 && (
        <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md py-2.5 px-4 rounded-2xl border border-cream-200 shadow-sm overflow-x-auto">
          <div className="flex items-center gap-2">
            {restaurant.categories.map((cat) => (
              <a
                key={cat.id}
                href={`#cat-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-cream-100 hover:bg-cream-200 text-charcoal-800'
                }`}
              >
                {cat.name} ({cat.menuItems?.length || 0})
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Categorized Menu Section */}
      <div className="space-y-8">
        {restaurant.categories?.map((cat) => {
          // Filter items based on veg tag and search term
          const filteredItems = (cat.menuItems || []).filter((item) => {
            if (vegOnly && !item.isVeg) return false;
            if (menuSearch.trim()) {
              const query = menuSearch.toLowerCase().trim();
              return (
                item.name.toLowerCase().includes(query) ||
                (item.description && item.description.toLowerCase().includes(query))
              );
            }
            return true;
          });

          if (filteredItems.length === 0) return null;

          return (
            <div key={cat.id} id={`cat-${cat.id}`} className="space-y-4 scroll-mt-36">
              <div className="flex items-center justify-between border-b border-cream-200 pb-2">
                <h2 className="text-lg sm:text-xl font-bold text-charcoal-900 font-display flex items-center gap-2">
                  <span>{cat.name}</span>
                  <span className="text-xs text-charcoal-400 font-normal">
                    ({filteredItems.length})
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => {
                  const qty = getItemQuantityInCart(item.id);
                  const cartItemId = getCartItemId(item.id);

                  return (
                    <div
                      key={item.id}
                      className="bg-white p-4 rounded-2xl border border-cream-200 shadow-sm hover:shadow-warm transition-all flex justify-between gap-4"
                    >
                      {/* Left: Dish Information */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            {item.isVeg ? (
                              <span className="veg-indicator" title="Pure Veg"></span>
                            ) : (
                              <span className="nonveg-indicator" title="Non-Veg"></span>
                            )}

                            {item.spiceLevel > 1 && (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                <Flame className="w-2.5 h-2.5 fill-current" /> Spicy
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-sm text-charcoal-900 leading-snug">
                            {item.name}
                          </h3>

                          <div className="text-sm font-extrabold text-charcoal-900 mt-1 mb-2">
                            ₹{item.price.toFixed(2)}
                          </div>

                          {item.description && (
                            <p className="text-xs text-charcoal-800/70 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Customization label */}
                        {((item as any).variants?.length > 0 || (item as any).addons?.length > 0) && (
                          <span className="text-[11px] text-brand-600 font-semibold mt-2 flex items-center gap-1">
                            <Info className="w-3 h-3" /> Customizable
                          </span>
                        )}
                      </div>

                      {/* Right: Image & Action Button */}
                      <div className="relative flex flex-col items-center shrink-0 w-28 sm:w-32">
                        {item.imageUrl ? (
                          <div className="w-28 h-24 sm:w-32 sm:h-24 rounded-xl overflow-hidden bg-cream-100">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-28 h-24 sm:w-32 sm:h-24 rounded-xl bg-cream-100 flex items-center justify-center text-3xl">
                            🍛
                          </div>
                        )}

                        {/* Add / Stepper Button */}
                        <div className="mt-[-16px] z-10">
                          {qty > 0 ? (
                            <div className="flex items-center gap-2 bg-brand-500 text-white rounded-lg shadow-md px-2 py-1">
                              <button
                                onClick={() => cartItemId && updateQuantity(cartItemId, -1)}
                                className="hover:bg-brand-600 p-0.5 rounded transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-black text-xs min-w-[16px] text-center">
                                {qty}
                              </span>
                              <button
                                onClick={() => handleAddItemClick(item)}
                                className="hover:bg-brand-600 p-0.5 rounded transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddItemClick(item)}
                              className="bg-white hover:bg-brand-50 text-brand-600 font-extrabold text-xs px-5 py-1.5 rounded-lg border-2 border-brand-500 shadow-md transition-all hover:scale-105 active:scale-95 uppercase tracking-wider"
                            >
                              ADD
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Customization Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-charcoal-900 font-display">
                  Customize "{customizingItem.name}"
                </h3>
                <p className="text-xs text-charcoal-800/70">
                  Select your preferred portion and add-ons
                </p>
              </div>
              <div className="text-sm font-black text-brand-600">
                ₹{customizingItem.price.toFixed(2)}
              </div>
            </div>

            {/* Variants */}
            {(customizingItem as any).variants?.length > 0 && (
              <div className="mb-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-800">
                  Portion Size
                </span>
                <div className="space-y-1.5">
                  {(customizingItem as any).variants.map((v: any) => (
                    <label
                      key={v.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-cream-300 hover:bg-cream-50 cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="portion"
                          checked={selectedVariant?.id === v.id}
                          onChange={() => setSelectedVariant(v)}
                          className="text-brand-500 focus:ring-brand-500"
                        />
                        <span className="font-bold text-charcoal-900">{v.name}</span>
                      </div>
                      <span className="text-gray-600 font-medium">+₹{v.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Addons */}
            {(customizingItem as any).addons?.length > 0 && (
              <div className="mb-6 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-800">
                  Add-ons & Extras
                </span>
                <div className="space-y-1.5">
                  {(customizingItem as any).addons.map((a: any) => {
                    const isSelected = selectedAddons.some((item) => item.id === a.id);
                    return (
                      <label
                        key={a.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-cream-300 hover:bg-cream-50 cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAddons([...selectedAddons, a]);
                              } else {
                                setSelectedAddons(selectedAddons.filter((item) => item.id !== a.id));
                              }
                            }}
                            className="text-brand-500 rounded focus:ring-brand-500"
                          />
                          <span className="font-bold text-charcoal-900">{a.name}</span>
                        </div>
                        <span className="text-gray-600 font-medium">+₹{a.price}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCustomizingItem(null)}
                className="flex-1 py-3 px-4 bg-cream-100 hover:bg-cream-200 text-charcoal-800 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCustomization}
                className="flex-1 py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-warm"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
