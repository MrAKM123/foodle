import React, { useState } from 'react';
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
} from 'lucide-react';

export const RiderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [hasOffer, setHasOffer] = useState(true);
  const [offerCountdown, setOfferCountdown] = useState(26);

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Earnings Flash Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Today's Earnings</div>
          <div className="text-2xl font-black text-sky-400">₹680.00</div>
          <div className="text-[11px] text-slate-400">6 deliveries completed</div>
        </div>

        <div className="text-right">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Wallet Balance</div>
          <div className="text-xl font-bold text-white">₹2,450.00</div>
          <button className="text-[11px] text-sky-400 font-semibold underline mt-0.5">Withdraw</button>
        </div>
      </div>

      {/* Simulated Live Order Offer Popup (30s countdown) */}
      {hasOffer ? (
        <div className="bg-white rounded-2xl border-2 border-sky-400 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white p-3 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-bold text-xs uppercase tracking-wider">New Delivery Offer</span>
            </div>
            <div className="bg-sky-900/60 px-2.5 py-1 rounded-full text-xs font-mono font-bold text-sky-200">
              ⏱️ {offerCountdown}s remaining
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Guaranteed Earning</span>
                <div className="text-2xl font-black text-slate-900">₹75.00</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Distance</span>
                <div className="text-sm font-bold text-slate-800">3.4 km (~14 mins)</div>
              </div>
            </div>

            {/* Route Timeline */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mt-0.5 shrink-0">
                  A
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Delhi Darbar & Royal Mughlai</div>
                  <div className="text-[11px] text-slate-500">Outer Circle, Connaught Place (1.1 km away)</div>
                </div>
              </div>

              <div className="border-l-2 border-dashed border-slate-300 ml-3 h-4"></div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs mt-0.5 shrink-0">
                  B
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Aarav Sharma (Customer)</div>
                  <div className="text-[11px] text-slate-500">Flat 402, Royale Palms, Sector 62 (2.3 km drop)</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setHasOffer(false)}
                className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => {
                  alert('Delivery Accepted! Starting GPS navigation to restaurant.');
                  setHasOffer(false);
                }}
                className="w-2/3 py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Accept Trip (₹75)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Navigation className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">Searching for nearby orders...</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
            Stay in high-density restaurant areas (Connaught Place / Cyber City) to receive higher-value delivery requests.
          </p>
          <button
            onClick={() => setHasOffer(true)}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-200"
          >
            ⚡ Simulate New Delivery Request
          </button>
        </div>
      )}

      {/* Safety & 4-digit Delivery OTP Note */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-900">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Customer 4-Digit Delivery OTP Required</span>
          Before handing over the order package at doorstep, ask the customer for their secret 4-digit Foodle OTP shown on their app screen.
        </div>
      </div>
    </div>
  );
};
