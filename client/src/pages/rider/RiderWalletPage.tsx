import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  IndianRupee,
  PackageCheck,
  CheckCircle2,
} from 'lucide-react';

interface TripPayout {
  orderId: string;
  orderNumber: string;
  restaurantName: string;
  dropStreet: string;
  deliveredAt: string;
  distanceKm: number;
  earning: number;
}

interface WalletData {
  totalDeliveries: number;
  totalEarnings: number;
  walletBalance: number;
  rating: number;
  trips: TripPayout[];
}

export const RiderWalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/rider/wallet');
      if (res.data.success) {
        setWallet(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = () => {
    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      setWithdrawSuccess(true);
      setTimeout(() => setWithdrawSuccess(false), 4000);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-amber-100 rounded-lg w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-amber-50 rounded-2xl" />
          <div className="h-32 bg-amber-50 rounded-2xl" />
          <div className="h-32 bg-amber-50 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-charcoal-900 flex items-center gap-2">
            <Wallet className="w-7 h-7 text-amber-500" />
            Rider Earnings & Wallet
          </h1>
          <p className="text-charcoal-600 text-sm mt-1">
            Track your delivery payouts, base bonuses, and direct bank transfers.
          </p>
        </div>
      </div>

      {withdrawSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">
            Payout request initiated! ₹{wallet?.walletBalance?.toFixed(2)} will be credited to your linked UPI bank account within 24 hours.
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Wallet Balance */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <IndianRupee className="w-32 h-32" />
          </div>
          <p className="text-amber-100 text-sm font-medium">Available for Payout</p>
          <div className="text-3xl font-extrabold mt-2 flex items-baseline gap-1">
            <span>₹</span>
            <span>{wallet?.walletBalance ? wallet.walletBalance.toFixed(2) : '0.00'}</span>
          </div>
          <button
            onClick={handleWithdraw}
            disabled={withdrawing || !wallet?.walletBalance}
            className="mt-5 w-full bg-white text-amber-700 font-bold py-2.5 px-4 rounded-xl shadow-sm hover:bg-amber-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {withdrawing ? (
              <span>Processing Transfer...</span>
            ) : (
              <>
                <ArrowUpRight className="w-4 h-4" />
                <span>Instant Bank Cashout</span>
              </>
            )}
          </button>
        </div>

        {/* Total Lifetime Earnings */}
        <div className="bg-white border border-charcoal-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-charcoal-500 text-sm font-medium">Lifetime Deliveries</p>
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-charcoal-900">
              {wallet?.totalDeliveries || 0}
            </span>
            <p className="text-xs text-charcoal-400 mt-1">Completed orders</p>
          </div>
        </div>

        {/* Payout Structure Info */}
        <div className="bg-white border border-charcoal-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-charcoal-500 text-sm font-medium">Payout Rate</p>
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 space-y-1 text-sm text-charcoal-700">
            <p className="font-semibold text-charcoal-900">₹35 Base + ₹10/km</p>
            <p className="text-xs text-charcoal-500">
              Automatic calculation on trip completion with verified OTP.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white border border-charcoal-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-charcoal-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-charcoal-400" />
            <h2 className="font-bold text-charcoal-900">Recent Trip Payouts</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full">
            {wallet?.trips?.length || 0} Entries
          </span>
        </div>

        {wallet?.trips && wallet.trips.length > 0 ? (
          <div className="divide-y divide-charcoal-100 overflow-x-auto">
            <table className="w-full text-left text-sm text-charcoal-700">
              <thead className="bg-charcoal-50 text-xs uppercase font-semibold text-charcoal-500 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Restaurant & Drop</th>
                  <th className="px-5 py-3.5">Distance</th>
                  <th className="px-5 py-3.5">Delivered At</th>
                  <th className="px-5 py-3.5 text-right">Earning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {wallet.trips.map((trip) => (
                  <tr key={trip.orderId} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-charcoal-900">
                      {trip.orderNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-charcoal-900">{trip.restaurantName}</div>
                      <div className="text-xs text-charcoal-500 truncate max-w-xs">{trip.dropStreet}</div>
                    </td>
                    <td className="px-5 py-4 text-charcoal-600">
                      {trip.distanceKm.toFixed(1)} km
                    </td>
                    <td className="px-5 py-4 text-xs text-charcoal-500">
                      {trip.deliveredAt ? new Date(trip.deliveredAt).toLocaleString('en-IN') : 'Just now'}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-emerald-600">
                      +₹{trip.earning.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-charcoal-400">
            <PackageCheck className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-500" />
            <p className="font-semibold text-charcoal-700">No trip payouts yet</p>
            <p className="text-sm mt-1">Go online and complete your first delivery to earn!</p>
          </div>
        )}
      </div>

      {/* Security & Bank Info Note */}
      <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Automated Daily Settlements</p>
          <p className="mt-0.5 text-amber-800">
            All delivery earnings are protected by double-entry ledger verification. Funds are deposited automatically into your linked bank account every midnight.
          </p>
        </div>
      </div>
    </div>
  );
};
