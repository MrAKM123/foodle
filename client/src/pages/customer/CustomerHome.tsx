import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  Star,
  Clock,
  Sparkles,
  Percent,
  Search,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export const CustomerHome: React.FC = () => {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const categories = [
    { name: 'Dum Biryani', icon: '🍲', tag: 'BIRYANI' },
    { name: 'North Indian', icon: '🍛', tag: 'NORTH_INDIAN' },
    { name: 'Tandoori Rolls', icon: '🌯', tag: 'ROLLS' },
    { name: 'Pure Veg', icon: '🥦', tag: 'VEG' },
    { name: 'Street Chaat', icon: '🥟', tag: 'SNACKS' },
    { name: 'Mithai & Desserts', icon: '🍨', tag: 'DESSERTS' },
  ];

  const demoRestaurants = [
    {
      id: '1',
      name: 'Delhi Darbar & Royal Mughlai',
      slug: 'delhi-darbar-royal-mughlai',
      cuisine: 'Biryani, North Indian, Mughlai',
      rating: 4.8,
      ratingCount: 384,
      prepTime: '25-30 mins',
      priceForTwo: '₹450 for two',
      discount: '50% OFF up to ₹100',
      isVeg: false,
      bannerUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
      featuredDish: 'Royal Dum Hyderabadi Chicken Biryani',
    },
    {
      id: '2',
      name: 'Punjab Grill & Tandoor',
      slug: 'punjab-grill-tandoor',
      cuisine: 'North Indian, Kebabs, Tandoor',
      rating: 4.7,
      ratingCount: 512,
      prepTime: '30-35 mins',
      priceForTwo: '₹500 for two',
      discount: 'Flat ₹100 OFF',
      isVeg: false,
      bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      featuredDish: 'Dal Makhani & Butter Naan Combo',
    },
    {
      id: '3',
      name: 'Dakshin Heritage Kitchen',
      slug: 'dakshin-heritage',
      cuisine: 'South Indian, Dosas, Filter Coffee',
      rating: 4.9,
      ratingCount: 640,
      prepTime: '15-20 mins',
      priceForTwo: '₹300 for two',
      discount: 'Free Delivery above ₹199',
      isVeg: true,
      bannerUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80',
      featuredDish: 'Ghee Podi Masala Dosa',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Food Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-brand-500 to-saffron-500 text-white p-6 sm:p-10 shadow-warm">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-3">
            <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" /> Craving authentic flavours?
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display leading-tight text-white mb-3">
            Hot meals from iconic kitchens, delivered live.
          </h1>
          <p className="text-white/90 text-xs sm:text-sm font-medium mb-6 leading-relaxed">
            Order your favorite Handi Biryanis, Butter Chicken, and sizzling Tandoori rotis with 4-digit Delivery OTP security and live GPS rider tracking.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#restaurants"
              className="bg-white text-brand-600 hover:bg-cream-100 font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
            >
              Explore Restaurants 🔥
            </a>
            <div className="text-xs text-white/80 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Zero surge pricing on demo
            </div>
          </div>
        </div>

        {/* Decorative Food Vector/Emoji background */}
        <div className="absolute -right-10 -bottom-10 opacity-15 text-[220px] select-none pointer-events-none hidden lg:block">
          🍛
        </div>
      </div>

      {/* Food Categories Horizontal Bar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-charcoal-900 font-display">
            What's on your mind today?
          </h2>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedFilter(cat.tag)}
              className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border transition-all text-center group ${
                selectedFilter === cat.tag
                  ? 'bg-brand-500 text-white border-brand-500 shadow-warm'
                  : 'bg-white hover:bg-cream-50 border-cream-200 text-charcoal-800'
              }`}
            >
              <span className="text-3xl transform group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <span className="text-xs font-bold">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant List Section */}
      <div id="restaurants" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-charcoal-900 font-display">
              Top Restaurants in Connaught Place & NCR
            </h2>
            <p className="text-xs text-charcoal-800/70">
              Handpicked authentic kitchens with top food-safety ratings
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                selectedFilter === 'ALL'
                  ? 'bg-charcoal-900 text-white border-charcoal-900'
                  : 'bg-white text-charcoal-800 border-cream-300 hover:bg-cream-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter('VEG')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                selectedFilter === 'VEG'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <span className="veg-indicator"></span> Pure Veg
            </button>
            <button
              onClick={() => setSelectedFilter('RATING')}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-white text-charcoal-800 border border-cream-300 hover:bg-cream-100 transition-colors flex items-center gap-1"
            >
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> 4.5+ Rating
            </button>
          </div>
        </div>

        {/* Restaurant Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoRestaurants.map((res) => (
            <Link
              key={res.id}
              to={`/app/restaurant/${res.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-cream-200 shadow-sm hover:shadow-warm transition-all duration-300 flex flex-col"
            >
              {/* Image Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-cream-200">
                <img
                  src={res.bannerUrl}
                  alt={res.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                {/* Offer Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-brand-500 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md">
                  <Percent className="w-3 h-3" />
                  <span>{res.discount}</span>
                </div>

                {/* Veg Tag */}
                {res.isVeg && (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black text-emerald-700 flex items-center gap-1">
                    <span className="veg-indicator"></span> PURE VEG
                  </div>
                )}
              </div>

              {/* Card Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-sm text-charcoal-900 group-hover:text-brand-500 transition-colors line-clamp-1">
                      {res.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                      <span>{res.rating}</span>
                      <Star className="w-3 h-3 fill-white" />
                    </div>
                  </div>

                  <p className="text-xs text-charcoal-800/70 line-clamp-1 mb-2">
                    {res.cuisine}
                  </p>
                </div>

                <div className="pt-3 border-t border-cream-200 flex items-center justify-between text-xs font-medium text-gray-500">
                  <div className="flex items-center gap-1 text-charcoal-800">
                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                    <span>{res.prepTime}</span>
                  </div>
                  <div>{res.priceForTwo}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
