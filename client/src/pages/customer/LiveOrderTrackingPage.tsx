import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../api/client.js';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  Clock,
  KeyRound,
  Bike,
  Store,
  MapPin,
  CheckCircle2,
  Phone,
  ArrowLeft,
  ShieldCheck,
  Flame,
  ChefHat,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';

// Custom Map Marker Icons using HTML DivIcons
const createCustomIcon = (emoji: string, bgClass: string) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${bgClass}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); border: 2px solid white;">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const restaurantIcon = createCustomIcon('🍲', '#E23744');
const customerIcon = createCustomIcon('🏠', '#059669');
const riderIcon = createCustomIcon('🛵', '#0284C7');

export const LiveOrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [riderPosition, setRiderPosition] = useState<[number, number] | null>(null);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      const res = await apiClient.get(`/orders/${orderId}`);
      if (res.data.success) {
        setOrder(res.data.data);
        if (res.data.data.rider?.currentLat && res.data.data.rider?.currentLng) {
          setRiderPosition([res.data.data.rider.currentLat, res.data.data.rider.currentLng]);
        } else if (res.data.data.restaurant?.lat && res.data.data.restaurant?.lng) {
          // Default rider near restaurant for initial tracking
          setRiderPosition([
            res.data.data.restaurant.lat + 0.003,
            res.data.data.restaurant.lng + 0.002,
          ]);
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 6000); // Live tracking poll every 6s
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-charcoal-800">Connecting to live GPS telemetry...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-cream-200 max-w-md mx-auto shadow-sm my-12">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-charcoal-900 mb-2">Order Not Found</h2>
        <Link
          to="/app/orders"
          className="inline-block px-5 py-2.5 bg-brand-500 text-white font-bold text-xs rounded-full shadow-warm"
        >
          View All Orders
        </Link>
      </div>
    );
  }

  // Coordinates
  const restaurantCoords: [number, number] = [
    order.restaurant?.lat || 28.6328,
    order.restaurant?.lng || 77.2195,
  ];
  const customerCoords: [number, number] = [
    order.address?.lat || 28.6258,
    order.address?.lng || 77.3653,
  ];
  const mapCenter: [number, number] = [
    (restaurantCoords[0] + customerCoords[0]) / 2,
    (restaurantCoords[1] + customerCoords[1]) / 2,
  ];

  // Pipeline steps
  const steps = [
    { key: 'PLACED', label: 'Order Placed', icon: Clock },
    { key: 'PREPARING', label: 'Kitchen Prep', icon: ChefHat },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Bike },
    { key: 'DELIVERED', label: 'Delivered', icon: PackageCheck },
  ];

  const getStepStatus = (stepKey: string) => {
    const sequence = [
      'PLACED',
      'PAYMENT_CONFIRMED',
      'RESTAURANT_ACCEPTED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'RIDER_ASSIGNED',
      'PICKED_UP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ];

    const currentIdx = sequence.indexOf(order.status);
    let targetIdx = sequence.indexOf(stepKey);
    if (stepKey === 'PREPARING') targetIdx = sequence.indexOf('PREPARING');
    if (stepKey === 'OUT_FOR_DELIVERY') targetIdx = sequence.indexOf('OUT_FOR_DELIVERY');

    if (currentIdx >= targetIdx) return 'COMPLETED';
    if (currentIdx + 1 === targetIdx) return 'CURRENT';
    return 'PENDING';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <Link
            to="/app/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-800 hover:text-brand-500 transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Order History
          </Link>
          <h1 className="text-2xl font-black text-charcoal-900 font-display flex items-center gap-2">
            <span>Live Order Tracking</span>
            <span className="text-xs bg-brand-100 text-brand-700 font-mono px-2.5 py-0.5 rounded-full">
              {order.orderNumber}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>GPS Live Broadcast Active</span>
        </div>
      </div>

      {/* Progress Timeline Stepper */}
      <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-sm">
        <div className="grid grid-cols-4 gap-2 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const status = getStepStatus(step.key);
            const isDone = status === 'COMPLETED';
            const isCurrent = status === 'CURRENT';

            return (
              <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-brand-500 text-white shadow-warm ring-4 ring-brand-100 animate-pulse'
                      : 'bg-cream-100 text-charcoal-400 border border-cream-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] mt-2 font-bold leading-tight ${
                    isDone || isCurrent ? 'text-charcoal-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secret 4-Digit Delivery OTP Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-amber-500/10 border-2 border-brand-400 p-5 rounded-3xl text-center space-y-2 shadow-sm">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider">
          <KeyRound className="w-4 h-4" /> Doorstep Delivery Handshake Code
        </div>
        <div className="text-3xl sm:text-4xl font-black font-mono tracking-[12px] text-charcoal-950 bg-white/95 py-2.5 px-6 rounded-2xl border border-brand-300 shadow-inner inline-block">
          {order.deliveryOtp || '5892'}
        </div>
        <p className="text-xs text-charcoal-800 font-medium max-w-md mx-auto">
          Share this secret 4-digit OTP with your delivery rider when they hand over the food package at your doorstep.
        </p>
      </div>

      {/* Live Map Canvas */}
      <div className="bg-white rounded-3xl overflow-hidden border border-cream-200 shadow-warm">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bike className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Live Map: Restaurant ➔ Rider ➔ Your Doorstep
            </span>
          </div>
          <div className="text-xs font-mono text-emerald-400 font-bold">
            ETA: ~{order.prepTimeMinutes ? `${order.prepTimeMinutes + 10} mins` : '20 mins'}
          </div>
        </div>

        <div className="h-80 sm:h-96 w-full relative z-0">
          <MapContainer
            center={mapCenter}
            zoom={12}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Restaurant Pin */}
            <Marker position={restaurantCoords} icon={restaurantIcon}>
              <Popup>
                <div className="text-xs font-bold font-sans">
                  🍲 {order.restaurant?.name}
                  <div className="text-[10px] text-gray-500">{order.restaurant?.address}</div>
                </div>
              </Popup>
            </Marker>

            {/* Customer Pin */}
            <Marker position={customerCoords} icon={customerIcon}>
              <Popup>
                <div className="text-xs font-bold font-sans">
                  🏠 Delivery Address
                  <div className="text-[10px] text-gray-500">{order.address?.street}</div>
                </div>
              </Popup>
            </Marker>

            {/* Rider Pin */}
            {riderPosition && (
              <Marker position={riderPosition} icon={riderIcon}>
                <Popup>
                  <div className="text-xs font-bold font-sans">
                    🛵 Delivery Rider: {order.rider?.user?.name || 'Assigned Hero'}
                    <div className="text-[10px] text-emerald-600">En Route</div>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>

      {/* Rider & Order Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Rider Card */}
        <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xl">
              🛵
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">
                Delivery Hero
              </span>
              <h3 className="font-bold text-sm text-charcoal-900">
                {order.rider?.user?.name || 'Rahul Kumar'}
              </h3>
              <p className="text-xs text-slate-500">
                {order.rider?.vehicleType || 'Electric Scooter'} • 4.9 ★
              </p>
            </div>
          </div>

          <a
            href={`tel:${order.rider?.user?.phone || '9876543210'}`}
            className="p-3 rounded-xl bg-cream-100 hover:bg-emerald-50 text-charcoal-800 hover:text-emerald-700 border border-cream-300 transition-colors"
            title="Call Rider"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>

        {/* Restaurant Card */}
        <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xl">
              🍲
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">
                Preparing Kitchen
              </span>
              <h3 className="font-bold text-sm text-charcoal-900">
                {order.restaurant?.name || 'Delhi Darbar'}
              </h3>
              <p className="text-xs text-slate-500">{order.restaurant?.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
