import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types/index.js';
import { ShieldCheck, UtensilsCrossed, Bike, User, Zap, LogOut } from 'lucide-react';

export const DemoSwitcher: React.FC = () => {
  const { user, demoLogin, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSwitch = async (role: UserRole) => {
    try {
      await demoLogin(role);
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'RESTAURANT') navigate('/restaurant');
      else if (role === 'RIDER') navigate('/rider');
      else navigate('/app');
    } catch {
      // Error handled by AuthContext toast
    }
  };

  return (
    <div className="bg-charcoal-900 text-white border-b border-charcoal-800 text-xs py-1.5 px-4 shadow-sm select-none relative z-30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-saffron-500 tracking-wide uppercase text-[11px]">
            <Zap className="w-3.5 h-3.5 text-saffron-500 fill-saffron-500 animate-pulse" /> Demo Switcher:
          </span>
          <span className="hidden md:inline text-charcoal-400">1-click login for testing all 4 roles:</span>
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          <button
            onClick={() => handleSwitch('CUSTOMER')}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all font-medium ${
              user?.role === 'CUSTOMER'
                ? 'bg-brand-500 text-white shadow-sm ring-2 ring-brand-300'
                : 'bg-charcoal-800 hover:bg-charcoal-700 text-gray-200'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Customer</span>
          </button>

          <button
            onClick={() => handleSwitch('RESTAURANT')}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all font-medium ${
              user?.role === 'RESTAURANT'
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                : 'bg-charcoal-800 hover:bg-charcoal-700 text-gray-200'
            }`}
          >
            <UtensilsCrossed className="w-3 h-3" />
            <span>Restaurant Partner</span>
          </button>

          <button
            onClick={() => handleSwitch('RIDER')}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all font-medium ${
              user?.role === 'RIDER'
                ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-300'
                : 'bg-charcoal-800 hover:bg-charcoal-700 text-gray-200'
            }`}
          >
            <Bike className="w-3 h-3" />
            <span>Rider</span>
          </button>

          <button
            onClick={() => handleSwitch('ADMIN')}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all font-medium ${
              user?.role === 'ADMIN'
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                : 'bg-charcoal-800 hover:bg-charcoal-700 text-gray-200'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Admin</span>
          </button>

          {user && (
            <button
              onClick={logout}
              title="Log out"
              className="ml-2 flex items-center gap-1 text-gray-400 hover:text-red-400 px-2 py-1 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
