import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client.js';
import {
  CheckCircle,
  KeyRound,
  Clock,
  MapPin,
  ArrowRight,
  Receipt,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(location.state?.order || null);
  const [deliveryOtp, setDeliveryOtp] = useState<string>(location.state?.deliveryOtp || '');
  const [loading, setLoading] = useState<boolean>(!order);

  useEffect(() => {
    if (!order && orderId) {
      apiClient
        .get(`/orders/${orderId}`)
        .then((res) => {
          if (res.data.success) {
            setOrder(res.data.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [orderId, order]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-charcoal-800">Loading order confirmation...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6 pb-20">
      {/* Celebration Header */}
      <div className="bg-white rounded-3xl p-8 text-center border border-cream-200 shadow-warm space-y-4">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm animate-in zoom-in-50 duration-300">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Order Placed Successfully
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 font-display">
            Your feast is in good hands!
          </h1>
          <p className="text-xs text-charcoal-800/70 mt-1 max-w-sm mx-auto">
            Order Reference:{' '}
            <span className="font-mono font-black text-charcoal-900 text-sm">
              {order?.orderNumber || 'FDL-CONFIRMED'}
            </span>
          </p>
        </div>

        {/* 4-digit Delivery OTP Highlight Card */}
        {deliveryOtp && (
          <div className="bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-amber-500/10 border-2 border-brand-400 p-5 rounded-2xl max-w-md mx-auto text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider">
              <KeyRound className="w-4 h-4" /> Secret Delivery OTP
            </div>
            <div className="text-3xl font-black font-mono tracking-[10px] text-charcoal-950 bg-white/90 py-2 px-4 rounded-xl border border-brand-300 shadow-inner inline-block">
              {deliveryOtp}
            </div>
            <p className="text-[11px] text-charcoal-800/80 font-medium">
              Please share this 4-digit code with your delivery rider at your doorstep to verify order receipt.
            </p>
          </div>
        )}

        {/* Order ETA and Delivery Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
          <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200">
            <div className="flex items-center gap-2 text-xs font-bold text-charcoal-900 mb-1">
              <Clock className="w-4 h-4 text-brand-500" />
              <span>Estimated Delivery</span>
            </div>
            <p className="text-sm font-black text-charcoal-900">
              {order?.prepTimeMinutes ? `${order.prepTimeMinutes + 15} - ${order.prepTimeMinutes + 25} mins` : '30-40 mins'}
            </p>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Kitchen is preparing your meal</p>
          </div>

          <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200">
            <div className="flex items-center gap-2 text-xs font-bold text-charcoal-900 mb-1">
              <MapPin className="w-4 h-4 text-brand-500" />
              <span>Delivering To</span>
            </div>
            <p className="text-xs font-bold text-charcoal-900 line-clamp-1">
              {order?.address?.label || 'Home'}
            </p>
            <p className="text-[11px] text-gray-500 line-clamp-1">
              {order?.address?.street || 'Connaught Place'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t border-cream-200">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/app/orders"
              className="w-full sm:w-1/2 py-3 bg-cream-100 hover:bg-cream-200 text-charcoal-800 font-bold text-xs rounded-xl transition-colors text-center"
            >
              View Order History
            </Link>
            <button
              onClick={() => navigate(`/app/orders/${order?.id || orderId}/track`)}
              className="w-full sm:w-1/2 py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-warm hover:shadow-warm-hover transition-all flex items-center justify-center gap-1.5"
            >
              <span>Live Order Tracker</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => window.open(`/api/orders/${order?.id || orderId}/invoice`, '_blank')}
            className="w-full py-2.5 bg-white hover:bg-cream-50 border border-charcoal-200 text-charcoal-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Receipt className="w-4 h-4 text-brand-500" />
            <span>Download Tax Invoice (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
