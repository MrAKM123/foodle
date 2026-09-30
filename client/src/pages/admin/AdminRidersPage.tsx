import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import {
  Bike,
  Search,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Star,
  RefreshCw,
  Phone,
  Mail,
  FileCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminRidersPage: React.FC = () => {
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/riders');
      if (res.data.success) {
        setRiders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load riders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (id: string, currentStatus: boolean, name: string) => {
    try {
      const newStatus = !currentStatus;
      await apiClient.put(`/admin/riders/${id}/verify`, { documentsVerified: newStatus });
      toast.success(`Rider ${name} documents ${newStatus ? 'Verified' : 'Suspended'}`);
      setRiders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, documentsVerified: newStatus } : r))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update rider KYC');
    }
  };

  const filtered = riders.filter((r) => {
    const matchesSearch =
      r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.phone?.includes(searchTerm);
    if (filterStatus === 'VERIFIED') return matchesSearch && r.documentsVerified;
    if (filterStatus === 'PENDING') return matchesSearch && !r.documentsVerified;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Bike className="w-7 h-7 text-amber-400" /> Delivery Fleet & KYC Moderation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review delivery partner driving licenses, vehicle registrations, and active dispatch statuses
          </p>
        </div>

        <button
          onClick={fetchRiders}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search riders by name, vehicle plate, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-2">
          {['ALL', 'VERIFIED', 'PENDING'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Riders Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-xs uppercase font-semibold text-slate-400">
              <tr>
                <th className="px-5 py-4">Rider Partner</th>
                <th className="px-5 py-4">Vehicle & License</th>
                <th className="px-5 py-4">Live Duty</th>
                <th className="px-5 py-4">Rating & Trips</th>
                <th className="px-5 py-4">KYC Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((rider) => (
                <tr key={rider.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-white text-sm">{rider.user?.name || 'Partner'}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      {rider.user?.email}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <div className="text-slate-300 font-mono font-bold">{rider.vehicleNumber}</div>
                    <div className="text-slate-500">DL: {rider.licenseNumber}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        rider.isOnline
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${rider.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                      {rider.isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-300">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {rider.rating?.toFixed(1) || '5.0'}
                    </div>
                    <div className="text-slate-500">{rider.totalDeliveries || 0} Deliveries</div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        rider.documentsVerified
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {rider.documentsVerified ? 'Verified KYC' : 'Pending Review'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() =>
                        handleToggleVerification(
                          rider.id,
                          rider.documentsVerified,
                          rider.user?.name || 'Rider'
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                        rider.documentsVerified
                          ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {rider.documentsVerified ? 'Suspend' : 'Verify KYC'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
