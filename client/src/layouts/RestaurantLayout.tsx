import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { DemoSwitcher } from '../components/common/DemoSwitcher.js';
import {
  UtensilsCrossed,
  ShoppingBag,
  BookOpen,
  DollarSign,
  Star,
  Settings,
  Bell,
  Power,
  Volume2,
  ExternalLink,
} from 'lucide-react';

export const RestaurantLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { label: 'Live Orders', path: '/restaurant', icon: ShoppingBag, badge: 'Live' },
    { label: 'Menu Catalog', path: '/restaurant/menu', icon: BookOpen },
    { label: 'Earnings & Payouts', path: '/restaurant/earnings', icon: DollarSign },
    { label: 'Customer Reviews', path: '/restaurant/reviews', icon: Star },
    { label: 'Store Settings', path: '/restaurant/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <DemoSwitcher />

      {/* Restaurant Operational Header */}
      <header className="sticky top-[33px] z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/restaurant" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-base leading-tight block">
                  {user?.restaurant?.name || 'Partner Kitchen'}
                </span>
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Restaurant Partner Portal
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Audio Alert Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-full font-medium">
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
              <span>Audio Order Alerts: Active</span>
            </div>

            {/* Store Status Toggle */}
            <button className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors shadow-sm">
              <Power className="w-3.5 h-3.5" />
              <span>Store is OPEN</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 sm:gap-6 overflow-x-auto py-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 py-3 px-2 border-b-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};
