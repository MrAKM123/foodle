import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { DemoSwitcher } from '../../components/common/DemoSwitcher.js';
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  UtensilsCrossed,
  Bike,
  Sparkles,
  Store,
  MapPin,
} from 'lucide-react';
import { UserRole } from '../../types/index.js';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'CUSTOMER';

  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Role-specific fields
  const [restaurantName, setRestaurantName] = useState('');
  const [cuisineTypes, setCuisineTypes] = useState('');
  const [address, setAddress] = useState('');
  const [vehicleType, setVehicleType] = useState('Electric Scooter');
  const [vehicleNumber, setVehicleNumber] = useState('');

  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        name,
        email,
        password,
        phone,
        role,
      };

      if (role === 'RESTAURANT') {
        payload.restaurantName = restaurantName;
        payload.cuisineTypes = cuisineTypes;
        payload.address = address;
      } else if (role === 'RIDER') {
        payload.vehicleType = vehicleType;
        payload.vehicleNumber = vehicleNumber;
      }

      const { otpSent } = await register(payload);
      if (otpSent) {
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        if (role === 'RESTAURANT') navigate('/restaurant');
        else if (role === 'RIDER') navigate('/rider');
        else navigate('/app');
      }
    } catch {
      // toast in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <DemoSwitcher />

      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
          <Link to="/app" className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl">🍛</span>
            <span className="text-3xl font-black text-brand-500 font-display">Foodle.</span>
          </Link>
          <h2 className="text-2xl font-bold text-charcoal-900">Join the Foodle Network</h2>
          <p className="mt-1 text-xs text-charcoal-800/70">
            Select your account type and start in seconds
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
          {/* Role Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-cream-200/80 p-1.5 rounded-2xl mb-4 border border-cream-300">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                role === 'CUSTOMER'
                  ? 'bg-white text-brand-500 shadow-sm'
                  : 'text-charcoal-800/70 hover:text-charcoal-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('RESTAURANT')}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                role === 'RESTAURANT'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-charcoal-800/70 hover:text-charcoal-900'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Restaurant</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('RIDER')}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                role === 'RIDER'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-charcoal-800/70 hover:text-charcoal-900'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Rider</span>
            </button>
          </div>

          <div className="bg-white py-8 px-6 sm:px-10 shadow-warm rounded-2xl border border-cream-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-1.5">
                  Email Address (Used for OTP verification)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-1.5">
                  Create Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Extra fields for Restaurant Partner */}
              {role === 'RESTAURANT' && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" />
                    Kitchen Details (Will be submitted for Admin Approval)
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Restaurant Name</label>
                    <input
                      type="text"
                      required
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="e.g. Royal Punjab Dhaba"
                      className="w-full px-3 py-2 text-xs bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Cuisines (comma separated)</label>
                    <input
                      type="text"
                      value={cuisineTypes}
                      onChange={(e) => setCuisineTypes(e.target.value)}
                      placeholder="North Indian, Tandoori, Biryani"
                      className="w-full px-3 py-2 text-xs bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Location / Street Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Sector 18, Noida"
                      className="w-full px-3 py-2 text-xs bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Extra fields for Rider */}
              {role === 'RIDER' && (
                <div className="p-4 bg-sky-50/50 border border-sky-200 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5 text-sky-600" />
                    Rider Vehicle Information
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Vehicle Type</label>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="Electric Scooter">Electric Scooter</option>
                        <option value="Motorcycle / Bike">Motorcycle / Bike</option>
                        <option value="Bicycle">Bicycle</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Vehicle Plate Number</label>
                      <input
                        type="text"
                        required
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        placeholder="DL 01 AB 9988"
                        className="w-full px-3 py-2 text-xs bg-white border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-warm hover:shadow-warm-hover transition-all mt-4"
              >
                {loading ? 'Creating Account...' : 'Continue to Verification'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-charcoal-800/70">
              Already have a Foodle account?{' '}
              <Link to="/login" className="font-bold text-brand-500 hover:text-brand-600 underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
