import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Clock,
  ShoppingBag,
  Store,
  MapPin,
  ChevronRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export const OrdersHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get('/orders/my-orders');
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
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
            Delivered
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="bg-brand-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">
            Out for Delivery 🛵
          </span>
        );
      case 'PREPARING':
        return (
          <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
            Preparing in Kitchen 🍳
          </span>
        );
      case 'PAYMENT_CONFIRMED':
      case 'RESTAURANT_ACCEPTED':
        return (
          <span className="bg-sky-100 text-sky-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-sky-200">
            Order Accepted
          </span>
        );
      default:
        return (
          <span className="bg-cream-200 text-charcoal-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-cream-200 max-w-md mx-auto shadow-sm my-12">
        <Clock className="w-16 h-16 text-brand-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-charcoal-900 mb-2">Sign in to view orders</h2>
        <p className="text-xs text-charcoal-800/70 mb-6">
          Track active food orders and view receipts from your past dining experiences.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-full shadow-warm"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-800 hover:text-brand-500 transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Link>
          <h1 className="text-2xl font-black text-charcoal-900 font-display flex items-center gap-2">
            <Clock className="w-6 h-6 text-brand-500" /> Your Order History
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-40 bg-white rounded-2xl border border-cream-200 animate-pulse p-4"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 max-w-md mx-auto shadow-sm my-6">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-charcoal-900 mb-1">No orders placed yet</h3>
          <p className="text-xs text-charcoal-800/70 mb-6">
            Your delicious meal is just a few clicks away!
          </p>
          <Link
            to="/app"
            className="px-5 py-2.5 bg-brand-500 text-white font-bold text-xs rounded-full shadow-warm"
          >
            Browse Menus
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-cream-200 p-5 shadow-sm hover:shadow-warm transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cream-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg">
                    🍛
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-charcoal-900">
                      {order.restaurant?.name || 'Partner Kitchen'}
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      {order.orderNumber} • {new Date(order.placedAt || order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(order.placedAt || order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Items summary */}
              <div className="text-xs text-charcoal-800 space-y-1">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-gray-700">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-semibold">₹{item.itemTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-cream-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold block">
                      Total Bill
                    </span>
                    <span className="font-black text-sm text-charcoal-900">
                      ₹{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    <span className="text-[10px] uppercase text-gray-400 font-bold block">
                      Payment
                    </span>
                    <span className="font-bold text-charcoal-800">
                      {order.paymentMethod} ({order.paymentStatus})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/app/restaurant/${order.restaurant?.slug}`}
                    className="px-3.5 py-1.5 bg-cream-100 hover:bg-cream-200 text-charcoal-800 font-bold rounded-lg transition-colors"
                  >
                    Reorder Dishes
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
