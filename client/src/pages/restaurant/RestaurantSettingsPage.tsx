import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import {
  Settings,
  Power,
  Clock,
  MapPin,
  Phone,
  DollarSign,
  Save,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const RestaurantSettingsPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [openingTime, setOpeningTime] = useState<string>('11:00');
  const [closingTime, setClosingTime] = useState<string>('23:30');
  const [minOrder, setMinOrder] = useState<string>('149');
  const [avgPrepTime, setAvgPrepTime] = useState<string>('25');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    apiClient
      .get('/restaurant/profile')
      .then((res) => {
        if (res.data.success) {
          const p = res.data.data;
          setProfile(p);
          setIsOpen(p.isOpen);
          setOpeningTime(p.openingTime || '11:00');
          setClosingTime(p.closingTime || '23:30');
          setMinOrder(p.minOrderAmount?.toString() || '149');
          setAvgPrepTime(p.avgPrepTimeMinutes?.toString() || '25');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiClient.put('/restaurant/profile', {
        isOpen,
        openingTime,
        closingTime,
        minOrderAmount: parseFloat(minOrder) || 99,
        avgPrepTimeMinutes: parseInt(avgPrepTime, 10) || 20,
      });

      if (res.data.success) {
        toast.success('Store operating settings saved successfully!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading store settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl pb-16">
      <div>
        <h1 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" /> Store Profile & Operating Hours
        </h1>
        <p className="text-xs text-slate-500">
          Configure real-time store availability, daily hours, and minimum order values
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Open / Closed status */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
          <div>
            <span className="font-bold text-xs text-slate-900 block">
              Store Order Availability Status
            </span>
            <p className="text-[11px] text-slate-500">
              When switched OFF, your kitchen will show as "Closed for Orders" on the customer app.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isOpen
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                : 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isOpen ? 'Store is OPEN' : 'Store is CLOSED'}</span>
          </button>
        </div>

        {/* Operating Hours */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Operating Schedule
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Daily Opening Time
              </label>
              <input
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Daily Closing Time
              </label>
              <input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Min order & prep time */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Order Configurations
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Minimum Order Amount (₹)
              </label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Average Prep Time (Minutes)
              </label>
              <input
                type="number"
                value={avgPrepTime}
                onChange={(e) => setAvgPrepTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Settings...' : 'Save Store Configurations'}</span>
        </button>
      </form>
    </div>
  );
};
