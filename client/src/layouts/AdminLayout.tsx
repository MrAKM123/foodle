import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { DemoSwitcher } from '../components/common/DemoSwitcher.js';
import {
  ShieldCheck,
  LayoutDashboard,
  UtensilsCrossed,
  Bike,
  ShoppingBag,
  DollarSign,
  Ticket,
  Headphones,
  FileText,
  Users,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { label: 'Overview & Telemetry', path: '/admin', icon: LayoutDashboard },
    { label: 'Manage Restaurants', path: '/admin/restaurants', icon: UtensilsCrossed, badge: '1 Pending' },
    { label: 'Manage Riders', path: '/admin/riders', icon: Bike },
    { label: 'Live Orders Monitor', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Commission & Ledger', path: '/admin/commissions', icon: DollarSign },
    { label: 'Promotions & Coupons', path: '/admin/coupons', icon: Ticket },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Support & Disputes', path: '/admin/support', icon: Headphones },
    { label: 'Security Audit Logs', path: '/admin/audit', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
      <DemoSwitcher />

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-black shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-white">Foodle Admin</h2>
                <p className="text-[11px] text-slate-400">Platform Command Center</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
            Logged in as <span className="text-slate-300 font-medium">{user?.email}</span>
            <div className="mt-1 text-emerald-400 font-mono">Status: Connected (SSL/TLS)</div>
          </div>
        </aside>

        {/* Admin Main Canvas */}
        <main className="flex-1 bg-slate-900 p-4 sm:p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
