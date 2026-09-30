import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import {
  ShieldCheck,
  TrendingUp,
  Store,
  Bike,
  ShoppingBag,
  IndianRupee,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Clock,
  Sparkles,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [pendingRestaurants, setPendingRestaurants] = useState<any[]>([]);
  const [pendingRiders, setPendingRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [metricsRes, resRes, riderRes] = await Promise.all([
        apiClient.get('/admin/metrics'),
        apiClient.get('/admin/restaurants?isApproved=false'),
        apiClient.get('/admin/riders?verified=false'),
      ]);

      if (metricsRes.data.success) setMetrics(metricsRes.data.data);
      if (resRes.data.success) setPendingRestaurants(resRes.data.data);
      if (riderRes.data.success) setPendingRiders(riderRes.data.data);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRestaurant = async (id: string, name: string) => {
    try {
      await apiClient.put(`/admin/restaurants/${id}/verify`, { isApproved: true });
      toast.success(`${name} approved successfully!`);
      setPendingRestaurants((prev) => prev.filter((r) => r.id !== id));
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve restaurant');
    }
  };

  const handleApproveRider = async (id: string, name: string) => {
    try {
      await apiClient.put(`/admin/riders/${id}/verify`, { documentsVerified: true });
      toast.success(`Rider ${name} documents verified!`);
      setPendingRiders((prev) => prev.filter((r) => r.id !== id));
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to verify rider');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-400" /> Platform Telemetry & Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-tenant monitoring across customers, kitchens, and rider fleets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-3 py-1.5 rounded-full font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            PostgreSQL & Socket.io Live
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GMV */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total GMV</span>
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <IndianRupee className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            ₹{metrics?.financials?.gmv?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> Gross sales volume
          </div>
        </div>

        {/* Platform Net Revenue */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Platform Revenue</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">
            ₹{metrics?.financials?.totalRevenue?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            20% Commission + Platform Fees
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Order Volume</span>
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {metrics?.orders?.total || 0}
          </div>
          <div className="text-[11px] text-amber-400 flex items-center gap-1 mt-1 font-semibold">
            <span>{metrics?.orders?.active || 0} active in-flight</span>
          </div>
        </div>

        {/* Fleet & Kitchens */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Network</span>
            <span className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
              <Bike className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-white mt-2 flex items-baseline gap-2">
            <span>{metrics?.restaurants?.active || 0} <span className="text-xs font-normal text-slate-400">Kitchens</span></span>
            <span className="text-slate-600">|</span>
            <span>{metrics?.riders?.online || 0} <span className="text-xs font-normal text-slate-400">Riders</span></span>
          </div>
          <div className="text-[11px] text-sky-400 mt-1 font-medium">
            {metrics?.users?.total || 0} registered foodies
          </div>
        </div>
      </div>

      {/* Moderation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Restaurant Approvals */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-tomato-400" />
              <h2 className="font-bold text-white text-sm">Pending Restaurant Approvals</h2>
            </div>
            <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {pendingRestaurants.length} Pending
            </span>
          </div>

          {pendingRestaurants.length > 0 ? (
            <div className="space-y-3">
              {pendingRestaurants.map((res) => (
                <div
                  key={res.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-sm">{res.name}</h3>
                    <p className="text-xs text-slate-400">{res.city} • Owner: {res.owner?.name} ({res.owner?.email})</p>
                    <p className="text-[11px] text-slate-500">Cuisines: {res.cuisines}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveRestaurant(res.id, res.name)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
              All restaurant partner registrations are reviewed and up to date!
            </div>
          )}
        </div>

        {/* Pending Rider KYC */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bike className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-white text-sm">Pending Rider KYC Verification</h2>
            </div>
            <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {pendingRiders.length} Pending
            </span>
          </div>

          {pendingRiders.length > 0 ? (
            <div className="space-y-3">
              {pendingRiders.map((rider) => (
                <div
                  key={rider.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-sm">{rider.user?.name || 'Rider Partner'}</h3>
                    <p className="text-xs text-slate-400">Vehicle: {rider.vehicleType} ({rider.vehicleNumber})</p>
                    <p className="text-[11px] text-slate-500">Driving License: {rider.licenseNumber}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveRider(rider.id, rider.user?.name || 'Rider')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verify KYC
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
              All delivery rider KYC records are verified!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
