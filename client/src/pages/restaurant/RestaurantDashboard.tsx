import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  Volume2,
  ChefHat,
  ArrowRight,
} from 'lucide-react';

export const RestaurantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'INCOMING' | 'PREPARING' | 'READY'>('INCOMING');

  const incomingOrders = [
    {
      id: 'FDL-92811',
      customer: 'Aarav Sharma',
      items: [
        { name: 'Royal Dum Hyderabadi Chicken Biryani', quantity: 2, price: 349.0 },
        { name: 'Garlic Butter Naan', quantity: 2, price: 99.0 },
      ],
      total: 897.0,
      paymentMethod: 'RAZORPAY (Paid)',
      status: 'PLACED',
      timeAgo: '2 mins ago',
      notes: 'Please add extra green chutney and spicy raita.',
    },
    {
      id: 'FDL-92812',
      customer: 'Priya Singh',
      items: [
        { name: 'Old Delhi Butter Chicken', quantity: 1, price: 389.0 },
        { name: 'Dal Makhani Bukhara', quantity: 1, price: 269.0 },
      ],
      total: 658.0,
      paymentMethod: 'COD',
      status: 'PLACED',
      timeAgo: '5 mins ago',
      notes: 'Ring the doorbell on arrival.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Restaurant Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              {user?.restaurant?.name || 'Delhi Darbar & Royal Mughlai'}
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Admin Approved Kitchen
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Connected to Kitchen Audio Alert • Auto-dispatch enabled
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Accepting Orders
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Orders</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">18</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +12% from yesterday</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">₹8,420.00</div>
          <div className="text-[11px] text-slate-500 mt-1">Platform comm. ~20% deducted</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Prep Time</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">22 mins</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Fast kitchen badge active</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Kitchen Rating</span>
            <ChefHat className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">4.8 ★</div>
          <div className="text-[11px] text-slate-500 mt-1">Based on 384 reviews</div>
        </div>
      </div>

      {/* Live Order Management Board */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-emerald-600" /> Live Kitchen Orders
            </h2>
            <p className="text-xs text-slate-500">Real-time incoming orders needing your action</p>
          </div>

          {/* Pipeline tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('INCOMING')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'INCOMING' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              New Orders (2)
            </button>
            <button
              onClick={() => setActiveTab('PREPARING')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'PREPARING' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              In Prep (1)
            </button>
            <button
              onClick={() => setActiveTab('READY')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'READY' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              Ready (0)
            </button>
          </div>
        </div>

        {/* Incoming Orders List */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {incomingOrders.map((order) => (
            <div
              key={order.id}
              className="border-2 border-emerald-100 bg-emerald-50/20 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">
                    {order.id}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {order.timeAgo}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-800 mb-2">
                  Customer: <span className="font-normal text-slate-600">{order.customer}</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 mb-3 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-700">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-semibold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  {order.notes && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-amber-800 font-medium italic">
                      Note: "{order.notes}"
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Bill Amount</div>
                  <div className="text-sm font-black text-slate-900">₹{order.total.toFixed(2)}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200">
                    Reject
                  </button>
                  <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1">
                    <span>Accept & Prep</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
