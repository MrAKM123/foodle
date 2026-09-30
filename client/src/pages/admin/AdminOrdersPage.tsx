import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import {
  ShoppingBag,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Navigation,
  FileText,
  AlertTriangle,
  Receipt,
  RefreshCw,
  Ban,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [cancelModalOrder, setCancelModalOrder] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url =
        selectedStatus === 'ALL'
          ? '/admin/orders?limit=50'
          : `/admin/orders?status=${selectedStatus}&limit=50`;
      const res = await apiClient.get(url);
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForceCancel = async () => {
    if (!cancelModalOrder) return;
    try {
      await apiClient.post(`/admin/orders/${cancelModalOrder.id}/cancel`, {
        reason: cancelReason || 'Administrative cancellation',
      });
      toast.success(`Order ${cancelModalOrder.orderNumber} cancelled and refunded`);
      setCancelModalOrder(null);
      setCancelReason('');
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">Delivered</span>;
      case 'CANCELLED':
      case 'REFUNDED':
        return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">{status}</span>;
      case 'OUT_FOR_DELIVERY':
      case 'PICKED_UP':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">On the Way 🛵</span>;
      case 'PREPARING':
      case 'READY_FOR_PICKUP':
        return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">In Kitchen 🍳</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-indigo-400" /> Platform Order Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global order overview, state machine audit logs, and administrative force cancellations
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          'ALL',
          'PLACED',
          'PREPARING',
          'READY_FOR_PICKUP',
          'OUT_FOR_DELIVERY',
          'DELIVERED',
          'CANCELLED',
        ].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              selectedStatus === st
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-xs uppercase font-semibold text-slate-400">
              <tr>
                <th className="px-5 py-4">Order Ref</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Restaurant</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Rider</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-mono font-bold text-white text-sm">{ord.orderNumber}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <div className="text-slate-200 font-bold">{ord.customer?.name}</div>
                    <div className="text-slate-500">{ord.customer?.phone || ord.customer?.email}</div>
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <div className="text-slate-200 font-bold">{ord.restaurant?.name}</div>
                    <div className="text-slate-500">{ord.restaurant?.city}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-emerald-400 text-sm">₹{ord.totalAmount?.toFixed(2)}</div>
                    <div className="text-[11px] text-slate-500">{ord.paymentMethod}</div>
                  </td>
                  <td className="px-5 py-4">{getStatusBadge(ord.status)}</td>
                  <td className="px-5 py-4 text-xs">
                    {ord.rider ? (
                      <div className="text-amber-300 font-medium">{ord.rider.user?.name}</div>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => window.open(`/api/orders/${ord.id}/invoice`, '_blank')}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        title="Download Tax Invoice PDF"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>

                      {ord.status !== 'DELIVERED' && ord.status !== 'CANCELLED' && (
                        <button
                          onClick={() => setCancelModalOrder(ord)}
                          className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Force Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Force Cancel Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-white text-lg">Force Cancel & Refund Order</h3>
            </div>
            <p className="text-xs text-slate-400">
              You are about to cancel order <span className="font-mono font-bold text-white">{cancelModalOrder.orderNumber}</span>. This will notify the customer, kitchen, and rider partner immediately.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cancellation Reason:
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Kitchen outage, Address unserviceable..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-rose-500"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleForceCancel}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
