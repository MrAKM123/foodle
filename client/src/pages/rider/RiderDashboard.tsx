import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Bike,
  Navigation,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Phone,
  Power,
  KeyRound,
  Radio,
  RefreshCw,
  Store,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const RiderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [pendingOffers, setPendingOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // OTP Handshake Modal
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const [profileRes, tripRes, offersRes] = await Promise.all([
        apiClient.get('/rider/profile'),
        apiClient.get('/rider/active-trip'),
        apiClient.get('/rider/offers'),
      ]);

      if (profileRes.data.success) {
        setProfile(profileRes.data.data);
        setIsOnline(profileRes.data.data.isOnline);
      }
      if (tripRes.data.success) {
        setActiveTrip(tripRes.data.data);
      } else {
        setActiveTrip(null);
      }
      if (offersRes.data.success) {
        setPendingOffers(offersRes.data.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll offers/trip every 5s
    return () => clearInterval(interval);
  }, []);

  const handleToggleOnline = async () => {
    try {
      const nextOnline = !isOnline;
      const res = await apiClient.put('/rider/toggle-online', {
        isOnline: nextOnline,
        lat: 28.6289,
        lng: 77.3621,
      });
      if (res.data.success) {
        setIsOnline(nextOnline);
        toast.success(nextOnline ? '⚡ You are now ONLINE' : 'You are now OFFLINE');
      }
    } catch {
      toast.error('Failed to update online status');
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const res = await apiClient.post(`/rider/offers/${offerId}/accept`);
      if (res.data.success) {
        toast.success('Delivery accepted! Starting GPS route to kitchen.');
        setPendingOffers([]);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to accept offer');
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      await apiClient.post(`/rider/offers/${offerId}/reject`);
      setPendingOffers((prev) => prev.filter((o) => o.id !== offerId));
      toast.success('Offer declined');
    } catch {
      // silent
    }
  };

  const handleAdvanceTrip = async (step: string) => {
    if (!activeTrip) return;
    try {
      const res = await apiClient.put('/rider/trip/advance-status', {
        orderId: activeTrip.id,
        step,
      });
      if (res.data.success) {
        toast.success(`Trip status: ${step}`);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to advance trip status');
    }
  };

  const handleCompleteDeliveryOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.length !== 4) return;
    setVerifyingOtp(true);
    try {
      const res = await apiClient.put('/rider/trip/advance-status', {
        orderId: activeTrip.id,
        step: 'DELIVERED',
        deliveryOtp: enteredOtp,
      });

      if (res.data.success) {
        toast.success('🎉 Delivery Verified & Completed! Earnings credited to wallet.');
        setShowOtpModal(false);
        setEnteredOtp('');
        setActiveTrip(null);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Incorrect Delivery OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-16">
      {/* Rider Status & Earnings Flash Bar */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-md flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Today's Completed Trips
          </div>
          <div className="text-2xl font-black text-sky-400">
            ₹{profile?.totalEarnings?.toFixed(2) || '8450.00'}
          </div>
          <div className="text-[11px] text-slate-400">
            {profile?.totalDeliveries || 0} deliveries completed • 4.9 ★
          </div>
        </div>

        {/* Online Switch */}
        <button
          onClick={handleToggleOnline}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs shadow-md transition-all ${
            isOnline
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white ring-4 ring-emerald-500/20'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Radio className={`w-4 h-4 ${isOnline ? 'animate-pulse' : ''}`} />
          <span>{isOnline ? 'ONLINE' : 'GO ONLINE'}</span>
        </button>
      </div>

      {/* 1. Pending Delivery Offers (30s Timer Queue) */}
      {pendingOffers.length > 0 && (
        <div className="space-y-3">
          {pendingOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-3xl border-2 border-sky-400 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white p-3.5 px-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping"></span>
                  <span className="font-bold text-xs uppercase tracking-wider">New Delivery Offer</span>
                </div>
                <div className="bg-sky-950/60 px-3 py-1 rounded-full text-xs font-mono font-black text-sky-200">
                  ⏱️ 30s Offer
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Guaranteed Earning
                    </span>
                    <div className="text-3xl font-black text-slate-900 font-display">
                      ₹{offer.estimatedEarning.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Total Trip Distance
                    </span>
                    <div className="text-sm font-black text-slate-800">
                      {offer.distanceKm} km (~15 mins)
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      A
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{offer.order?.restaurant?.name}</div>
                      <div className="text-[11px] text-slate-500">{offer.order?.restaurant?.address}</div>
                    </div>
                  </div>

                  <div className="border-l-2 border-dashed border-slate-300 ml-3 h-3"></div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      B
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{offer.order?.address?.label || 'Customer'}</div>
                      <div className="text-[11px] text-slate-500">{offer.order?.address?.street}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleRejectOffer(offer.id)}
                    className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleAcceptOffer(offer.id)}
                    className="w-2/3 py-3 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl shadow-lg shadow-sky-600/30 flex items-center justify-center gap-1.5"
                  >
                    <span>Accept Trip (₹{offer.estimatedEarning.toFixed(2)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Active Trip Workflow Controller */}
      {activeTrip ? (
        <div className="bg-white rounded-3xl border-2 border-emerald-400 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Active Order In Progress
              </span>
              <span className="font-mono font-black text-sm text-slate-900">
                {activeTrip.orderNumber}
              </span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase">
              {activeTrip.status}
            </span>
          </div>

          {/* Restaurant & Customer Directions */}
          <div className="space-y-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-emerald-700 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5" /> Pickup From Kitchen
                </span>
                <a
                  href={`tel:${activeTrip.restaurant?.phone || '9999999999'}`}
                  className="p-1 text-slate-600 hover:text-emerald-600"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="font-bold text-xs text-slate-900">{activeTrip.restaurant?.name}</div>
              <div className="text-[11px] text-slate-500">{activeTrip.restaurant?.address}</div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-sky-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Drop to Customer
                </span>
                <a
                  href={`tel:${activeTrip.customer?.phone || '9999999999'}`}
                  className="p-1 text-slate-600 hover:text-sky-600"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="font-bold text-xs text-slate-900">{activeTrip.customer?.name}</div>
              <div className="text-[11px] text-slate-500">{activeTrip.address?.street}</div>
            </div>
          </div>

          {/* Step Progression Buttons */}
          <div className="pt-2 border-t border-slate-100">
            {activeTrip.status === 'RIDER_ASSIGNED' && (
              <button
                onClick={() => handleAdvanceTrip('PICKED_UP')}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Order Picked Up from Kitchen</span>
              </button>
            )}

            {(activeTrip.status === 'PICKED_UP' || activeTrip.status === 'OUT_FOR_DELIVERY') && (
              <button
                onClick={() => setShowOtpModal(true)}
                className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Arrived at Customer • Enter Delivery OTP</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Idle Search State */
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Navigation className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">
            {isOnline ? 'Searching for nearby orders...' : 'You are currently Offline'}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
            {isOnline
              ? 'Stay in high-density areas (Connaught Place / Cyber City) to receive delivery dispatches.'
              : 'Switch duty status to ONLINE to start receiving delivery requests.'}
          </p>
        </div>
      )}

      {/* 4-digit Delivery OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-lg text-slate-900 font-display mb-1">
              Customer Delivery OTP
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ask customer for their 4-digit Foodle OTP shown on their screen to verify delivery.
            </p>

            <form onSubmit={handleCompleteDeliveryOtp} className="space-y-4">
              <input
                type="text"
                maxLength={4}
                required
                autoFocus
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • •"
                className="w-full text-center tracking-[16px] font-mono text-3xl font-black py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sky-600"
              />

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enteredOtp.length !== 4 || verifyingOtp}
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  {verifyingOtp ? 'Verifying...' : 'Complete Delivery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
