import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client.js';
import { Restaurant } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { Heart, Star, Clock, ArrowLeft, Utensils } from 'lucide-react';
import toast from 'react-hot-toast';

export const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get('/restaurants/user/favorites');
      if (res.data.success) {
        setFavorites(res.data.data);
      }
    } catch {
      // toast or silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const removeFavorite = async (restaurantId: string) => {
    try {
      await apiClient.post(`/restaurants/${restaurantId}/favorite`);
      setFavorites((prev) => prev.filter((r) => r.id !== restaurantId));
      toast.success('Removed from favorites');
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-cream-200 max-w-md mx-auto shadow-sm my-12">
        <Heart className="w-16 h-16 text-brand-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-charcoal-900 mb-2">Sign in to view favorites</h2>
        <p className="text-xs text-charcoal-800/70 mb-6">
          Save your most loved restaurants for rapid reordering and exclusive offers.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-full shadow-warm"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-800 hover:text-brand-500 transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Link>
          <h1 className="text-2xl font-black text-charcoal-900 font-display flex items-center gap-2">
            <Heart className="w-6 h-6 text-brand-500 fill-brand-500" /> Your Favorite Kitchens
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-56 bg-cream-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 max-w-md mx-auto shadow-sm my-6">
          <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-charcoal-900 mb-1">No favorite kitchens yet</h3>
          <p className="text-xs text-charcoal-800/70 mb-6">
            Tap the heart icon on any restaurant card to bookmark your preferred dining spots.
          </p>
          <Link
            to="/app"
            className="px-5 py-2.5 bg-brand-500 text-white font-bold text-xs rounded-full shadow-warm"
          >
            Explore Restaurants
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((res) => (
            <Link
              key={res.id}
              to={`/app/restaurant/${res.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-cream-200 shadow-sm hover:shadow-warm transition-all flex flex-col relative"
            >
              <div className="relative h-44 w-full overflow-hidden bg-cream-200">
                <img
                  src={
                    res.bannerUrl ||
                    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={res.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFavorite(res.id);
                  }}
                  title="Remove favorite"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-brand-500 shadow-md"
                >
                  <Heart className="w-4 h-4 fill-brand-500" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-sm text-charcoal-900 group-hover:text-brand-500 transition-colors line-clamp-1">
                      {res.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                      <span>{res.rating?.toFixed(1)}</span>
                      <Star className="w-3 h-3 fill-white" />
                    </div>
                  </div>
                  <p className="text-xs text-charcoal-800/70 line-clamp-1 mb-2">
                    {res.cuisineTypes}
                  </p>
                </div>

                <div className="pt-2 border-t border-cream-200 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1 text-charcoal-800 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                    <span>{res.avgPrepTimeMinutes} mins</span>
                  </div>
                  <div>Min ₹{res.minOrderAmount}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
