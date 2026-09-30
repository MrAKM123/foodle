import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { DemoSwitcher } from '../components/common/DemoSwitcher.js';
import {
  Bike,
  Navigation,
  Wallet,
  CheckCircle,
  Radio,
  User,
  Power,
} from 'lucide-react';

export const RiderLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isOnline = user?.riderProfile?.isOnline ?? true;

  const navItems = [
    { label: 'Active Trips', path: '/rider', icon: Navigation },
    { label: 'Earnings Wallet', path: '/rider/wallet', icon: Wallet },
    { label: 'Trip History', path: '/rider/history', icon: CheckCircle },
    { label: 'My Profile', path: '/rider/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans pb-20 md:pb-6">
      <DemoSwitcher />

      {/* Top Rider Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 font-bold">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                {user?.name || 'Delivery Hero'}
                <span className="bg-sky-500/20 text-sky-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  ⚡ 4.9 ★
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {user?.riderProfile?.vehicleType || 'Electric EV'} • {user?.riderProfile?.vehicleNumber || 'DL 03 EV'}
              </p>
            </div>
          </div>

          {/* Online Duty Status Toggle */}
          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-sm transition-all ${
              isOnline
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 ring-2 ring-emerald-300/50'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isOnline ? 'animate-pulse' : ''}`} />
            <span>{isOnline ? 'YOU ARE ONLINE' : 'GO ONLINE'}</span>
          </button>
        </div>
      </header>

      {/* Main Rider Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4">
        <Outlet />
      </main>

      {/* Bottom Sticky Mobile Navigation for Riders */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-2 px-4 md:hidden shadow-lg">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-semibold transition-colors ${
                  isActive ? 'text-sky-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
