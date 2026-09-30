import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import {
  Store,
  Search,
  CheckCircle,
  XCircle,
  Percent,
  MapPin,
  Utensils,
  Phone,
  Mail,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminRestaurantsPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/restaurants');
      if (res.data.success) {
        setRestaurants(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (id: string, currentStatus: boolean, name: string) => {
    try {
      const newStatus = !currentStatus;
      await apiClient.put(`/admin/restaurants/${id}/verify`, { isApproved: newStatus });
      toast.success(`${name} ${newStatus ? 'Approved' : 'Suspended'}`);
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isApproved: newStatus } : r))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update restaurant');
    }
  };

  const handleUpdateCommission = async (id: string, newRate: number, name: string) => {
    try {
      await apiClient.put(`/admin/restaurants/${id}/verify`, { commissionRate: newRate });
      toast.success(`${name} commission set to ${newRate}%`);
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, commissionRate: newRate } : r))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update commission');
    }
  };

  const filtered = restaurants.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.city.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === 'APPROVED') return matchesSearch && r.isApproved;
    if (filterStatus === 'PENDING') return matchesSearch && !r.isApproved;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Store className="w-7 h-7 text-tomato-400" /> Restaurant Partners & Commission Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage partner onboarding, commission tier rates (default 20%), and live operating statuses
          </p>
        </div>

        <button
          onClick={fetchRestaurants}
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
            placeholder="Search kitchens by name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-2">
          {['ALL', 'APPROVED', 'PENDING'].map((status) => (
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

      {/* Restaurants Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-xs uppercase font-semibold text-slate-400">
              <tr>
                <th className="px-5 py-4">Kitchen Details</th>
                <th className="px-5 py-4">Owner Contact</th>
                <th className="px-5 py-4">Commission %</th>
                <th className="px-5 py-4">Catalog & Orders</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((res) => (
                <tr key={res.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-white text-sm">{res.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {res.city} • {res.address}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <div className="text-slate-300 font-medium">{res.owner?.name}</div>
                    <div className="text-slate-500">{res.owner?.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        defaultValue={res.commissionRate}
                        onBlur={(e) =>
                          handleUpdateCommission(res.id, Number(e.target.value), res.name)
                        }
                        className="w-16 bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded-lg px-2 py-1 text-center"
                      />
                      <span className="text-xs text-slate-400">%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400">
                    <div>{res._count?.menuItems || 0} Menu Items</div>
                    <div>{res._count?.orders || 0} Total Orders</div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        res.isApproved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {res.isApproved ? 'Approved' : 'Pending Review'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleToggleApproval(res.id, res.isApproved, res.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                        res.isApproved
                          ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {res.isApproved ? 'Suspend' : 'Approve'}
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
