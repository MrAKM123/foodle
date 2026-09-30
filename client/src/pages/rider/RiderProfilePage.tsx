import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  User,
  Bike,
  ShieldCheck,
  Star,
  Award,
  Phone,
  Mail,
  FileCheck,
  Power,
  Clock,
} from 'lucide-react';

interface RiderProfile {
  id: string;
  vehicleType: string;
  vehicleNumber: string;
  drivingLicenseNumber?: string;
  isOnline: boolean;
  isAvailable: boolean;
  isVerified: boolean;
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  user: {
    name: string;
    email: string;
    phone: string;
    avatarUrl?: string;
  };
}

export const RiderProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/rider/profile');
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch rider profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnline = async () => {
    if (!profile) return;
    try {
      setToggling(true);
      const newStatus = !profile.isOnline;
      const res = await apiClient.put('/rider/toggle-online', {
        isOnline: newStatus,
        lat: 12.9716,
        lng: 77.5946,
      });
      if (res.data.success) {
        setProfile((prev) => (prev ? { ...prev, isOnline: newStatus } : null));
      }
    } catch (err) {
      console.error('Failed to toggle duty:', err);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-amber-100 rounded-lg w-48" />
        <div className="h-48 bg-amber-50 rounded-2xl" />
        <div className="h-36 bg-amber-50 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-charcoal-900 flex items-center gap-2">
          <User className="w-7 h-7 text-amber-500" />
          Rider Profile & Vehicle
        </h1>
        <p className="text-charcoal-600 text-sm mt-1">
          Manage your duty availability, vehicle registration, and partner verification status.
        </p>
      </div>

      {/* Hero Badge Card */}
      <div className="bg-white border border-charcoal-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-2xl border-4 border-amber-200">
            {profile?.user?.name?.[0] || 'R'}
          </div>
          {profile?.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-sm" title="Verified Partner">
              <ShieldCheck className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-charcoal-900">
              {profile?.user?.name || user?.name || 'Delivery Partner'}
            </h2>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Partner
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-charcoal-600">
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4 text-charcoal-400" />
              {profile?.user?.email || user?.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4 text-charcoal-400" />
              {profile?.user?.phone || '+91 98765 43210'}
            </span>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-4 pt-2">
            <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{profile?.rating?.toFixed(1) || '5.0'} / 5.0</span>
            </div>
            <div className="text-xs text-charcoal-400">
              {profile?.totalDeliveries || 0} Total Deliveries
            </div>
          </div>
        </div>

        {/* Duty Status Switch */}
        <div className="text-center">
          <button
            onClick={handleToggleOnline}
            disabled={toggling}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95 ${
              profile?.isOnline
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-charcoal-200 hover:bg-charcoal-300 text-charcoal-700'
            }`}
          >
            <Power className="w-4 h-4" />
            {profile?.isOnline ? 'ON DUTY (LIVE)' : 'OFF DUTY'}
          </button>
          <p className="text-[11px] text-charcoal-400 mt-1">
            {profile?.isOnline ? 'Receiving delivery offers' : 'Offline - no offers'}
          </p>
        </div>
      </div>

      {/* Vehicle & Verification Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicle Information */}
        <div className="bg-white border border-charcoal-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-charcoal-900 flex items-center gap-2">
            <Bike className="w-5 h-5 text-amber-500" />
            Registered Vehicle
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-charcoal-100">
              <span className="text-charcoal-500">Vehicle Type</span>
              <span className="font-semibold text-charcoal-900 capitalize">
                {profile?.vehicleType || 'Motorcycle / Scooter'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-charcoal-100">
              <span className="text-charcoal-500">Registration Number</span>
              <span className="font-mono font-bold text-charcoal-900">
                {profile?.vehicleNumber || 'KA-01-EF-2024'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-charcoal-100">
              <span className="text-charcoal-500">Driving License</span>
              <span className="font-mono font-bold text-charcoal-900">
                {profile?.drivingLicenseNumber || 'DL-0420190012345'}
              </span>
            </div>
          </div>
        </div>

        {/* Performance & Rewards */}
        <div className="bg-white border border-charcoal-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-charcoal-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Partner Highlights
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-charcoal-100">
              <span className="text-charcoal-500">KYC Status</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <FileCheck className="w-4 h-4" />
                Verified & Approved
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-charcoal-100">
              <span className="text-charcoal-500">Dispatch Tier</span>
              <span className="font-semibold text-amber-600">Gold Priority</span>
            </div>
            <div className="flex justify-between py-2 border-b border-charcoal-100">
              <span className="text-charcoal-500">Average ETA</span>
              <span className="font-semibold text-charcoal-900 flex items-center gap-1">
                <Clock className="w-4 h-4 text-charcoal-400" />
                18 mins / delivery
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
