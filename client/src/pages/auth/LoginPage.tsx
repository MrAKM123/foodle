import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { DemoSwitcher } from '../../components/common/DemoSwitcher.js';
import { Mail, Lock, ArrowRight, Sparkles, UtensilsCrossed, Bike, ShieldCheck, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'RESTAURANT') navigate('/restaurant');
      else if (user.role === 'RIDER') navigate('/rider');
      else navigate(from);
    } catch {
      // toast shown in context
    } finally {
      setLoading(false);
    }
  };

  const fillAndLogin = async (role: any, demoEmail: string, pass: string) => {
    setEmail(demoEmail);
    setPassword(pass);
    await demoLogin(role);
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'RESTAURANT') navigate('/restaurant');
    else if (role === 'RIDER') navigate('/rider');
    else navigate('/app');
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <DemoSwitcher />

      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Link to="/app" className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl">🍛</span>
            <span className="text-3xl font-black text-brand-500 font-display">Foodle.</span>
          </Link>
          <h2 className="text-2xl font-bold text-charcoal-900">Welcome Back</h2>
          <p className="mt-1 text-xs text-charcoal-800/70">
            Sign in to satisfy your cravings or manage your deliveries
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-white py-8 px-6 sm:px-10 shadow-warm rounded-2xl border border-cream-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-warm hover:shadow-warm-hover transition-all"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-charcoal-800/70">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-brand-500 hover:text-brand-600 underline">
                Create Account
              </Link>
            </div>

            {/* Quick Demo Pre-fill Cards */}
            <div className="mt-8 pt-6 border-t border-cream-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-charcoal-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-saffron-500" />
                  Demo Accounts (1-Click Auto Login):
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => fillAndLogin('CUSTOMER', 'customer@foodle.app', 'Demo@123')}
                  className="flex items-center gap-2 p-2 bg-cream-50 hover:bg-brand-50 border border-cream-300 hover:border-brand-300 rounded-lg text-left transition-all group"
                >
                  <User className="w-4 h-4 text-brand-500" />
                  <div>
                    <div className="font-bold text-charcoal-900 group-hover:text-brand-600">Customer</div>
                    <div className="text-[10px] text-gray-500 truncate">Aarav Sharma</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillAndLogin('RESTAURANT', 'partner@delhidarbar.com', 'Partner@123')}
                  className="flex items-center gap-2 p-2 bg-cream-50 hover:bg-emerald-50 border border-cream-300 hover:border-emerald-300 rounded-lg text-left transition-all group"
                >
                  <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold text-charcoal-900 group-hover:text-emerald-700">Restaurant</div>
                    <div className="text-[10px] text-gray-500 truncate">Delhi Darbar</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillAndLogin('RIDER', 'rider@foodle.app', 'Demo@123')}
                  className="flex items-center gap-2 p-2 bg-cream-50 hover:bg-sky-50 border border-cream-300 hover:border-sky-300 rounded-lg text-left transition-all group"
                >
                  <Bike className="w-4 h-4 text-sky-600" />
                  <div>
                    <div className="font-bold text-charcoal-900 group-hover:text-sky-700">Rider Hero</div>
                    <div className="text-[10px] text-gray-500 truncate">Rahul Kumar</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillAndLogin('ADMIN', 'admin@foodle.app', 'Admin@123')}
                  className="flex items-center gap-2 p-2 bg-cream-50 hover:bg-indigo-50 border border-cream-300 hover:border-indigo-300 rounded-lg text-left transition-all group"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="font-bold text-charcoal-900 group-hover:text-indigo-700">Super Admin</div>
                    <div className="text-[10px] text-gray-500 truncate">Admin Console</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
