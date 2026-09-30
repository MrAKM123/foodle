import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Store,
  Bike,
  ShoppingBag,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const pendingApprovals = [
    {
      id: 'res-991',
      name: 'Spice Route Express',
      owner: 'Karan Mehra (karan@spiceroute.in)',
      city: 'Gurugram, DLF Phase 3',
      cuisines: 'Street Food, Chaat, Rolls',
      appliedAt: 'Today, 10:15 AM',
      status: 'PENDING_APPROVAL',
    },
    {
      id: 'rider-554',
      name: 'Vikas Deep (EV Scooter)',
      owner: 'vikas.deep@gmail.com',
      city: 'Noida Sector 18',
      cuisines: 'Documents: License & Aadhaar Uploaded',
      appliedAt: 'Yesterday',
      status: 'PENDING_APPROVAL',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" /> Platform Telemetry & Command Center
          </h1>
          <p className="text-xs text-slate-400">
            Real-time multi-tenant monitoring across customers, kitchens, and rider fleets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-3 py-1.5 rounded-full font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            PostgreSQL & Socket.io Online
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Merchandise Value</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">₹1,42,850.00</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% this week
          </div>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Commission (20%)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">₹28,570.00</div>
          <div className="text-[11px] text-slate-400 mt-1">Recorded in Immutable Ledger</div>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Partner Restaurants</span>
            <Store className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">42 Active</div>
          <div className="text-[11px] text-amber-400 font-semibold mt-1">1 kitchen pending review</div>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Rider Fleet</span>
            <Bike className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white">18 Online</div>
          <div className="text-[11px] text-sky-400 font-semibold mt-1">Avg delivery time: 24 mins</div>
        </div>
      </div>

      {/* Pending Approvals Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Verification & Approval Queue
            </h2>
            <p className="text-xs text-slate-400">
              New restaurants and delivery partners requiring KYC validation before going live
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-800">
          {pendingApprovals.map((item) => (
            <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/50 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{item.name}</span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    Needs Approval
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{item.owner} • {item.city}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{item.cuisines}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Rejected ${item.name}`)}
                  className="px-3 py-1.5 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
                <button
                  onClick={() => alert(`Approved ${item.name}! They can now go online.`)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Verify & Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
