import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import {
  History,
  CheckCircle2,
  Calendar,
  Store,
  MapPin,
  Clock,
  Sparkles,
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

export const RiderHistoryPage: React.FC = () => {
  const [trips, setTrips] = useState<TripPayout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/rider/wallet');
      if (res.data.success && res.data.data.trips) {
        setTrips(res.data.data.trips);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-amber-100 rounded-lg w-48" />
        <div className="h-28 bg-amber-50 rounded-2xl" />
        <div className="h-28 bg-amber-50 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-charcoal-900 flex items-center gap-2">
          <History className="w-7 h-7 text-amber-500" />
          Completed Delivery Trips
        </h1>
        <p className="text-charcoal-600 text-sm mt-1">
          Review your past order deliveries and verified drop locations.
        </p>
      </div>

      {trips.length > 0 ? (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div
              key={trip.orderId}
              className="bg-white border border-charcoal-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-charcoal-900 bg-charcoal-100 px-2.5 py-0.5 rounded-lg text-sm">
                    {trip.orderNumber}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Delivered
                  </span>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-charcoal-800 font-medium">
                    <Store className="w-4 h-4 text-tomato-500 shrink-0" />
                    <span>{trip.restaurantName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-charcoal-600">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate max-w-md">{trip.dropStreet}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-charcoal-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {trip.distanceKm} km trip
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {trip.deliveredAt ? new Date(trip.deliveredAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }) : 'Recent'}
                  </span>
                </div>
              </div>

              <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-charcoal-100">
                <span className="text-xs text-charcoal-400">Trip Earnings</span>
                <span className="text-xl font-extrabold text-emerald-600">
                  ₹{trip.earning.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-charcoal-100 rounded-2xl p-12 text-center text-charcoal-400">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-amber-400 opacity-60" />
          <h3 className="font-bold text-charcoal-700 text-lg">No delivery history yet</h3>
          <p className="text-sm mt-1">Accept dispatch offers from the dashboard to start completing orders!</p>
        </div>
      )}
    </div>
  );
};
