import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  ChefHat,
  Flame,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Volume2,
  VolumeX,
  RefreshCw,
  Phone,
  MapPin,
  Timer,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const RestaurantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'INCOMING' | 'PREPARING' | 'READY' | 'COMPLETED'>('INCOMING');
  const [loading, setLoading] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Reject modal
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Kitchen at maximum capacity');

  // Prep time selection modal for acceptance
  const [selectedPrepTime, setSelectedPrepTime] = useState<number>(25);

  // Web Audio alert chime
  const playAlertChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch {
      // audio context blocked until user interaction
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/restaurant/orders', {
        params: { tab: activeTab },
      });
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Polling fallback every 10s
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleUpdateStatus = async (orderId: string, newStatus: string, prepTime?: number) => {
    try {
      const payload: any = { status: newStatus };
      if (prepTime) payload.prepTimeMinutes = prepTime;

      const res = await apiClient.put(`/restaurant/orders/${orderId}/status`, payload);
      if (res.data.success) {
        toast.success(`Order moved to ${newStatus}`);
        fetchOrders();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectOrderId) return;
    try {
      const res = await apiClient.put(`/restaurant/orders/${rejectOrderId}/status`, {
        status: 'REJECTED',
        rejectionReason: rejectReason,
      });
      if (res.data.success) {
        toast.success('Order rejected');
        setRejectOrderId(null);
        fetchOrders();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject order');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-display">
              {user?.restaurant?.name || 'Partner Kitchen'}
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Verified Kitchen
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time kitchen order management & preparation dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sound alert toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playAlertChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span>Audio Alert: {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={fetchOrders}
            className="p-2 text-slate-600 hover:text-emerald-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Refresh order queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Pipeline Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('INCOMING')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'INCOMING'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>New Incoming</span>
          </button>

          <button
            onClick={() => setActiveTab('PREPARING')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'PREPARING'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>In Kitchen Prep</span>
          </button>

          <button
            onClick={() => setActiveTab('READY')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'READY'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Ready / Dispatched</span>
          </button>

          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'COMPLETED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Completed History</span>
          </button>
        </div>
      </div>

      {/* Orders Grid / List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto shadow-sm my-8">
          <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base mb-1">
            No orders in {activeTab.toLowerCase()} queue
          </h3>
          <p className="text-xs text-slate-500">
            {activeTab === 'INCOMING'
              ? 'New orders placed by customers will chime and pop up here automatically.'
              : 'Orders moved to this stage will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Card Top Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {new Date(order.placedAt || order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      order.status === 'PLACED'
                        ? 'bg-amber-100 text-amber-800'
                        : order.status === 'PAYMENT_CONFIRMED'
                        ? 'bg-sky-100 text-sky-800'
                        : order.status === 'RESTAURANT_ACCEPTED' || order.status === 'PREPARING'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'READY_FOR_PICKUP'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Customer info */}
                <div className="flex items-center justify-between text-xs text-slate-700 mb-3 bg-slate-50 p-2.5 rounded-xl">
                  <div>
                    <span className="font-bold text-slate-900">{order.customer?.name || 'Customer'}</span>
                    <span className="text-slate-500 block text-[11px]">{order.address?.street}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">{order.paymentMethod}</span>
                    <span className="text-[11px] text-emerald-600 font-bold">
                      {order.paymentStatus === 'COMPLETED' ? 'PAID ✓' : 'COLLECT CASH'}
                    </span>
                  </div>
                </div>

                {/* Item list */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5 mb-3 text-xs">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-emerald-700 bg-emerald-50 w-5 h-5 rounded flex items-center justify-center text-[11px]">
                          {item.quantity}x
                        </span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold">₹{item.itemTotal.toFixed(2)}</span>
                    </div>
                  ))}

                  {order.restaurantNotes && (
                    <div className="pt-2 mt-2 border-t border-slate-100 text-[11px] text-amber-800 font-medium italic">
                      Special Note: "{order.restaurantNotes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions based on state */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Order Total
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    ₹{order.totalAmount.toFixed(2)}
                  </span>
                </div>

                {/* Stage 1: Incoming Orders (Accept or Reject) */}
                {(order.status === 'PLACED' || order.status === 'PAYMENT_CONFIRMED') && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRejectOrderId(order.id)}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'RESTAURANT_ACCEPTED', selectedPrepTime)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <span>Accept ({selectedPrepTime}m)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Stage 2: Accepted / In Kitchen Prep */}
                {order.status === 'RESTAURANT_ACCEPTED' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    <ChefHat className="w-4 h-4" />
                    <span>Start Cooking</span>
                  </button>
                )}

                {order.status === 'PREPARING' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'READY_FOR_PICKUP')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ready for Pickup</span>
                  </button>
                )}

                {/* Stage 3: Ready for pickup or on the way */}
                {order.status === 'READY_FOR_PICKUP' && (
                  <span className="text-xs text-purple-700 font-bold bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 animate-spin" /> Awaiting Rider Dispatch
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Order Reason Modal */}
      {rejectOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <h3 className="font-bold text-lg text-slate-900 font-display mb-1">
              Reject Order
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Please specify the reason for rejecting this customer order. The customer will be refunded if paid online.
            </p>

            <div className="space-y-3 mb-6">
              {[
                'Kitchen at maximum capacity',
                'Ingredients out of stock',
                'Kitchen closing for the day',
                'Delivery address outside delivery range',
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs"
                >
                  <input
                    type="radio"
                    name="rejection_reason"
                    checked={rejectReason === reason}
                    onChange={() => setRejectReason(reason)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-semibold text-slate-800">{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRejectOrderId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectOrder}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
