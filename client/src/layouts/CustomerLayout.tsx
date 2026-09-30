import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { DemoSwitcher } from '../components/common/DemoSwitcher.js';
import {
  Search,
  ShoppingBag,
  MapPin,
  User,
  Heart,
  Clock,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const CustomerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 font-sans">
      <DemoSwitcher />

      {/* Main Header */}
      <header className="sticky top-[33px] z-40 bg-white/95 backdrop-blur-md border-b border-cream-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Location */}
          <div className="flex items-center gap-6">
            <Link to="/app" className="flex items-center gap-2 group">
              <span className="text-2xl transform group-hover:scale-110 transition-transform">🍛</span>
              <span className="text-2xl font-black tracking-tight text-brand-500 font-display">
                Foodle<span className="text-saffron-500">.</span>
              </span>
            </Link>

            {/* Address Selector */}
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-charcoal-800 bg-cream-100 hover:bg-cream-200 px-3 py-1.5 rounded-full cursor-pointer transition-colors border border-cream-300">
              <MapPin className="w-3.5 h-3.5 text-brand-500" />
              <span className="truncate max-w-[180px]">Connaught Place, New Delhi</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for biryani, butter chicken, pizza..."
                className="w-full pl-10 pr-4 py-2 text-xs md:text-sm bg-cream-50 border border-cream-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* User Nav */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/app/orders"
              className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-800 hover:text-brand-500 transition-colors p-2"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden lg:inline">Orders</span>
            </Link>

            <Link
              to="/app/favorites"
              className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-800 hover:text-brand-500 transition-colors p-2"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden lg:inline">Favorites</span>
            </Link>

            {/* Cart Button */}
            <Link
              to="/app/cart"
              className="relative flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-3.5 py-2 rounded-full font-bold text-xs shadow-warm hover:shadow-warm-hover transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-white text-brand-500 text-[11px] font-black rounded-full px-1.5 py-0.2">
                0
              </span>
            </Link>

            {/* User Profile */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-cream-300">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="text-gray-400 hover:text-brand-500 transition-colors p-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-bold text-brand-500 hover:text-brand-600 px-3 py-1.5 border border-brand-500 rounded-full"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Human-designed Warm Footer */}
      <footer className="bg-white border-t border-cream-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🍛</span>
                <span className="text-xl font-black text-brand-500 font-display">Foodle</span>
              </div>
              <p className="text-xs text-charcoal-800/70 leading-relaxed">
                Handcrafted meals from the finest local kitchens, delivered straight to your door with real-time GPS tracking and live status updates.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-3">For Foodies</h4>
              <ul className="space-y-2 text-xs text-charcoal-800/70">
                <li><Link to="/app" className="hover:text-brand-500">Explore Restaurants</Link></li>
                <li><Link to="/app/orders" className="hover:text-brand-500">Order History</Link></li>
                <li><Link to="/app/offers" className="hover:text-brand-500">Deals & Coupons</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-3">Partnerships</h4>
              <ul className="space-y-2 text-xs text-charcoal-800/70">
                <li><Link to="/register?role=RESTAURANT" className="hover:text-brand-500">Partner with Foodle</Link></li>
                <li><Link to="/register?role=RIDER" className="hover:text-brand-500">Ride with Us</Link></li>
                <li><Link to="/restaurant" className="hover:text-brand-500">Partner Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-3">Security & Trust</h4>
              <p className="text-xs text-charcoal-800/70 leading-relaxed mb-2">
                Protected by 4-digit Delivery OTP verification, server-verified Razorpay payments, and live GPS telemetry.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> 100% Verified Kitchens
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-cream-200 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
            <p>© {new Date().getFullYear()} Foodle Technologies. Built for food lovers.</p>
            <p className="flex items-center gap-1 font-medium">
              Made with 🌶️ & ❤️ for authentic dining experiences
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
