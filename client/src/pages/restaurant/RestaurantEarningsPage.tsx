import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import {
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  Calendar,
  Receipt,
  Download,
} from 'lucide-react';

export const RestaurantEarningsPage: React.FC = () => {
  const [earningsData, setEarningsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    apiClient
      .get('/restaurant/earnings')
      .then((res) => {
        if (res.data.success) {
          setEarningsData(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-white rounded-2xl border border-slate-200"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" /> Earnings & Commission Breakdown
        </h1>
        <p className="text-xs text-slate-500">
          Financial ledger tracking order subtotals, platform commission deductions, and net partner payouts
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Food Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{earningsData?.totalGrossSales?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {earningsData?.totalOrdersDelivered || 0} delivered orders
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Platform Commission ({earningsData?.commissionRate || 20}%)
            </span>
            <Percent className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            -₹{earningsData?.totalCommissionDeducted?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Platform service fee</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Net Partner Payout</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            ₹{earningsData?.totalNetPayout?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Settled weekly to linked bank account
          </div>
        </div>
      </div>

      {/* Per-Order Settlement Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" /> Delivered Orders Settlement Ledger
          </h2>
        </div>

        {earningsData?.orders?.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No completed orders recorded yet. Payouts update in real-time as orders are marked DELIVERED.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3 pl-5">Order Reference</th>
                  <th className="p-3">Delivered Date</th>
                  <th className="p-3 text-right">Gross Subtotal</th>
                  <th className="p-3 text-right">Commission (20%)</th>
                  <th className="p-3 text-right">Net Earning</th>
                  <th className="p-3 pr-5 text-center">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {earningsData?.orders?.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 pl-5 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                    <td className="p-3 text-slate-600">
                      {new Date(ord.deliveredAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      ₹{ord.subtotal.toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-amber-700 font-semibold">
                      -₹{ord.commissionAmount.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-black text-emerald-600">
                      ₹{ord.netEarning.toFixed(2)}
                    </td>
                    <td className="p-3 pr-5 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Settled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
