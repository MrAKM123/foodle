import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import {
  Wallet,
  IndianRupee,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminSettlementsPage: React.FC = () => {
  const [journal, setJournal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    fetchJournal();
  }, []);

  const fetchJournal = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/ledger/platform');
      if (res.data.success) {
        setJournal(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load ledger journal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettleAllPending = async () => {
    if (!journal?.recentLedgerEntries) return;
    const pendingIds = journal.recentLedgerEntries
      .filter((e: any) => e.status === 'PENDING')
      .map((e: any) => e.id);

    if (pendingIds.length === 0) {
      toast.success('All current ledger transactions are already SETTLED!');
      return;
    }

    try {
      setSettling(true);
      const res = await apiClient.post('/ledger/payouts/settle', { transactionIds: pendingIds });
      toast.success(res.data.message || 'Settlements processed!');
      fetchJournal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to settle payouts');
    } finally {
      setSettling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Wallet className="w-7 h-7 text-emerald-400" /> Platform Financial Reconciliation Journal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Double-entry ledger journal, restaurant commission deductions, and rider payouts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchJournal}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleSettleAllPending}
            disabled={settling}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            {settling ? 'Settling...' : '1-Click Batch Payout Settlement'}
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Total GMV Transacted</span>
          <div className="text-2xl font-black text-white mt-2">
            ₹{journal?.overview?.totalGrossMerchandiseValue?.toLocaleString('en-IN') || '0.00'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Customer gross payments</p>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Commissions Earned</span>
          <div className="text-2xl font-black text-indigo-400 mt-2">
            ₹{journal?.overview?.totalCommissionsEarned?.toLocaleString('en-IN') || '0.00'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">From restaurant sales (20%)</p>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Rider Disbursements</span>
          <div className="text-2xl font-black text-amber-400 mt-2">
            ₹{journal?.overview?.totalRiderPayoutsDisbursed?.toLocaleString('en-IN') || '0.00'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Base + Distance payouts</p>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Net Platform Margin</span>
          <div className="text-2xl font-black text-emerald-400 mt-2">
            ₹{journal?.overview?.netPlatformMargin?.toLocaleString('en-IN') || '0.00'}
          </div>
          <p className="text-[11px] text-emerald-500/80 mt-1">Commissions + Platform fees</p>
        </div>
      </div>

      {/* Ledger Journal Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-white text-sm">Recent Double-Entry Ledger Transactions</h2>
          <span className="text-xs text-slate-500">
            {journal?.recentLedgerEntries?.length || 0} Transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-xs uppercase font-semibold text-slate-400">
              <tr>
                <th className="px-5 py-4">Tx ID / Order</th>
                <th className="px-5 py-4">Recipient</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Notes</th>
                <th className="px-5 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {journal?.recentLedgerEntries?.map((entry: any) => (
                <tr key={entry.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-mono text-xs text-indigo-400 font-bold">
                      {entry.orderNumber}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                      {entry.id}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {entry.recipientType}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-mono text-slate-300">
                    {entry.transactionType}
                  </td>
                  <td className="px-5 py-4 font-bold text-white">
                    ₹{entry.amount?.toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        entry.status === 'SETTLED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400 truncate max-w-xs">
                    {entry.notes || '-'}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500 text-right">
                    {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
