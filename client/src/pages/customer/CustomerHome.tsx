import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client.js';
import { Restaurant } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Star,
  Clock,
  Search,
  Flame,
  CheckCircle2,
  Heart,
  Store,
  Filter,
  ArrowUpDown,
  Utensils,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CustomerHome: React.FC = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('ALL');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('rating_desc');
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = [
    { name: 'All Cuisines', icon: '🍽️', tag: 'ALL' },
    { name: 'Dum Biryani', icon: '🍲', tag: 'Biryani' },
    { name: 'North Indian', icon: '🍛', tag: 'North Indian' },
    { name: 'Mughlai & Kebabs', icon: '🍢', tag: 'Mughlai' },
    { name: 'South Indian', icon: '🥞', tag: 'South Indian' },
    { name: 'Pure Veg', icon: '🥦', tag: 'VEG' },
    { name: 'Dhaba Specials', icon: '🥘', tag: 'Punjabi' },
  ];

  // Fetch Restaurants
  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params: any = {
        sortBy,
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCuisine !== 'ALL' && selectedCuisine !== 'VEG') params.cuisine = selectedCuisine;
      if (vegOnly || selectedCuisine === 'VEG') params.isVeg = true;
      if (minRating) params.minRating = minRating;

      const res = await apiClient.get('/restaurants', { params });
      if (res.data.success) {
        setRestaurants(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Favorites if logged in
  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const res = await apiClient.get('/restaurants/user/favorites');
      if (res.data.success && Array.isArray(res.data.data)) {
        setFavorites(res.data.data.map((r: any) => r.id));
      }
    } catch {
      // Ignore if unauthenticated
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [selectedCuisine, vegOnly, minRating, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRestaurants();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (e: React.MouseEvent, restaurantId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please sign in to save favorite restaurants');
      return;
    }

    try {
      const res = await apiClient.post(`/restaurants/${restaurantId}/favorite`);
      if (res.data.success) {
        if (res.data.data.isFavorited) {
          setFavorites((prev) => [...prev, restaurantId]);
          toast.success('Added to favorites');
        } else {
          setFavorites((prev) => prev.filter((id) => id !== restaurantId));
          toast.success('Removed from favorites');
        }
      }
    } catch {
      toast.error('Could not update favorite');
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Food Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-brand-500 to-saffron-500 text-white p-6 sm:p-10 shadow-warm">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-3">
            <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" /> Hot & Fresh Delivery
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display leading-tight text-white mb-3">
            Authentic culinary treasures at your doorstep.
          </h1>
          <p className="text-white/90 text-xs sm:text-sm font-medium mb-6 leading-relaxed">
            Order your favorite Dum Biryanis, Butter Chicken, and sizzling Tandoori rotis with 4-digit Delivery OTP verification and live GPS rider tracking.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#restaurants-section"
              className="bg-white text-brand-600 hover:bg-cream-100 font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
            >
              Explore Restaurants 🔥
            </a>
            <div className="text-xs text-white/90 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Free delivery on orders over ₹499
            </div>
          </div>
        </div>

        <div className="absolute -right-10 -bottom-10 opacity-15 text-[220px] select-none pointer-events-none hidden lg:block">
          🍛
        </div>
      </div>

      {/* Category Pills */}
      <div>
        <h2 className="text-lg font-bold text-charcoal-900 font-display mb-4">
          What are you craving today?
        </h2>
        <div className="flex sm:grid sm:grid-cols-4 lg:grid-cols-7 gap-3 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                if (cat.tag === 'VEG') {
                  setVegOnly(!vegOnly);
                  setSelectedCuisine('ALL');
                } else {
                  setSelectedCuisine(cat.tag);
                  setVegOnly(false);
                }
              }}
              className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border transition-all text-center group shrink-0 sm:shrink min-w-[105px] sm:min-w-0 ${
                (cat.tag === 'VEG' && vegOnly) || selectedCuisine === cat.tag
                  ? 'bg-brand-500 text-white border-brand-500 shadow-warm'
                  : 'bg-white hover:bg-cream-50 border-cream-200 text-charcoal-800'
              }`}
            >
              <span className="text-2xl transform group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <span className="text-xs font-bold whitespace-nowrap">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant Catalog Section */}
      <div id="restaurants-section" className="space-y-4 pt-2">
        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by restaurant name, dish, or cuisine..."
              className="w-full pl-10 pr-4 py-2 text-xs md:text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Filters & Sort */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                vegOnly
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-cream-50 text-emerald-800 border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <span className="veg-indicator"></span>
              <span>Pure Veg</span>
            </button>

            <button
              onClick={() => setMinRating(minRating === 4.5 ? undefined : 4.5)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                minRating === 4.5
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : 'bg-cream-50 text-charcoal-800 border-cream-300 hover:bg-cream-100'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>4.5+ Rating</span>
            </button>

            {/* Sort selector */}
            <div className="flex items-center gap-1.5 bg-cream-50 border border-cream-300 px-3 py-1.5 rounded-xl text-xs font-bold text-charcoal-800">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer text-xs font-bold text-charcoal-800"
              >
                <option value="rating_desc">Highest Rated</option>
                <option value="prep_time_asc">Fastest Prep</option>
                <option value="min_order_asc">Lowest Min Order</option>
                <option value="name_asc">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-cream-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-cream-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-cream-200 rounded w-3/4"></div>
                  <div className="h-3 bg-cream-200 rounded w-1/2"></div>
                  <div className="pt-2 border-t border-cream-200 flex justify-between">
                    <div className="h-3 bg-cream-200 rounded w-1/4"></div>
                    <div className="h-3 bg-cream-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 max-w-lg mx-auto shadow-sm my-6">
            <div className="w-16 h-16 bg-cream-100 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-charcoal-900 font-display mb-1">
              No matching kitchens found
            </h3>
            <p className="text-xs text-charcoal-800/70 mb-6">
              We couldn't find any restaurants matching your current filters. Try resetting your search or filter tags.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCuisine('ALL');
                setVegOnly(false);
                setMinRating(undefined);
              }}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-full shadow-warm transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Restaurant Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((res) => {
              const isFav = favorites.includes(res.id);
              return (
                <Link
                  key={res.id}
                  to={`/app/restaurant/${res.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-cream-200 shadow-sm hover:shadow-warm transition-all duration-300 flex flex-col relative"
                >
                  {/* Banner Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-cream-200">
                    <img
                      src={
                        res.bannerUrl ||
                        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={res.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                    {/* Favorite Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(e, res.id)}
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-charcoal-800 hover:text-brand-500 shadow-md transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFav ? 'text-brand-500 fill-brand-500' : 'text-gray-600'
                        }`}
                      />
                    </button>

                    {/* Open / Closed tag */}
                    {!res.isOpen && (
                      <div className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">
                        Closed for Orders
                      </div>
                    )}

                    {/* Cuisine pill */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                      <Store className="w-3.5 h-3.5 text-saffron-400" />
                      <span className="truncate max-w-[200px]">{res.city}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-sm text-charcoal-900 group-hover:text-brand-500 transition-colors line-clamp-1">
                          {res.name}
                        </h3>
                        <div className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                          <span>{res.rating.toFixed(1)}</span>
                          <Star className="w-3 h-3 fill-white" />
                        </div>
                      </div>

                      <p className="text-xs text-charcoal-800/70 line-clamp-1 mb-3 font-medium">
                        {res.cuisineTypes}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-cream-200 flex items-center justify-between text-xs font-medium text-gray-500">
                      <div className="flex items-center gap-1 text-charcoal-800 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-brand-500" />
                        <span>{res.avgPrepTimeMinutes} mins</span>
                      </div>
                      <div className="text-charcoal-700">Min Order ₹{res.minOrderAmount}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
