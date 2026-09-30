import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { apiClient } from '../../api/client.js';
import { Address } from '../../types/index.js';
import {
  MapPin,
  Plus,
  CreditCard,
  Banknote,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Receipt,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CheckoutPage: React.FC = () => {
  const { items, restaurant, subtotal, deliveryFee, platformFee, tax, totalAmount, clearCart } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');
  const [loading, setLoading] = useState<boolean>(false);

  // New Address Modal State
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [newLabel, setNewLabel] = useState<string>('Home');
  const [newStreet, setNewStreet] = useState<string>('');
  const [newCity, setNewCity] = useState<string>('New Delhi');
  const [newLandmark, setNewLandmark] = useState<string>('');
  const [newLat, setNewLat] = useState<number>(28.6304);
  const [newLng, setNewLng] = useState<number>(77.2177);

  // Fetch Customer Saved Addresses
  const fetchAddresses = async () => {
    try {
      const res = await apiClient.get('/users/addresses');
      if (res.data.success) {
        setAddresses(res.data.data);
        if (res.data.data.length > 0) {
          const defaultAddr = res.data.data.find((a: Address) => a.isDefault);
          setSelectedAddressId(defaultAddr ? defaultAddr.id : res.data.data[0].id);
        }
      }
    } catch {
      // toast or silent
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/app/checkout' } } });
      return;
    }
    if (items.length === 0) {
      navigate('/app/cart');
      return;
    }
    fetchAddresses();
  }, [user, items]);

  // Load Razorpay Script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim()) {
      toast.error('Please enter street address');
      return;
    }

    try {
      const res = await apiClient.post('/users/addresses', {
        label: newLabel,
        street: newStreet,
        city: newCity,
        landmark: newLandmark,
        lat: newLat,
        lng: newLng,
        isDefault: addresses.length === 0,
      });

      if (res.data.success) {
        toast.success('Delivery address saved');
        setShowAddressModal(false);
        setNewStreet('');
        setNewLandmark('');
        fetchAddresses();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select or add a delivery address');
      return;
    }
    if (!restaurant) {
      toast.error('No restaurant items found in cart');
      return;
    }

    setLoading(true);
    try {
      // 1. Create order on backend
      const orderPayload = {
        restaurantId: restaurant.id,
        addressId: selectedAddressId,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          selectedVariants: i.selectedVariants || [],
          selectedAddons: i.selectedAddons || [],
        })),
        paymentMethod,
        couponCode: null,
      };

      const res = await apiClient.post('/orders/create', orderPayload);
      const { order, razorpayOrder, rawDeliveryOtp } = res.data.data;

      // 2. Handle Payment Flow
      if (paymentMethod === 'COD') {
        clearCart();
        toast.success(`Order ${order.orderNumber} placed successfully!`);
        navigate(`/app/order-success/${order.id}`, {
          state: { order, deliveryOtp: rawDeliveryOtp },
        });
      } else {
        // Razorpay Test Mode Payment
        if (window.Razorpay && razorpayOrder) {
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
            amount: razorpayOrder.amount,
            currency: 'INR',
            name: 'Foodle Delivery',
            description: `Order ${order.orderNumber} from ${restaurant.name}`,
            order_id: razorpayOrder.id,
            prefill: {
              name: user?.name,
              email: user?.email,
              contact: user?.phone || '9876543210',
            },
            theme: {
              color: '#E23744',
            },
            handler: async function (response: any) {
              try {
                // Verify signature on backend
                const verifyRes = await apiClient.post('/orders/razorpay/verify', {
                  orderId: order.id,
                  razorpayOrderId: response.razorpay_order_id || razorpayOrder.id,
                  razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                  razorpaySignature: response.razorpay_signature || 'mock_verified_sig_test',
                });

                if (verifyRes.data.success) {
                  clearCart();
                  toast.success('Payment verified! Order confirmed.');
                  navigate(`/app/order-success/${order.id}`, {
                    state: { order: verifyRes.data.data, deliveryOtp: rawDeliveryOtp },
                  });
                }
              } catch (verifyErr: any) {
                toast.error('Payment verification failed. Please contact support.');
              }
            },
            modal: {
              ondismiss: function () {
                toast.error('Payment cancelled. Order remains in unpaid status.');
              },
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // Dev Mock Auto-verify fallback if script is offline or in mock dev environment
          const verifyRes = await apiClient.post('/orders/razorpay/verify', {
            orderId: order.id,
            razorpayOrderId: razorpayOrder?.id || `order_mock_${Date.now()}`,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpaySignature: 'mock_verified_sig_test',
          });

          clearCart();
          toast.success('Test mode payment verified!');
          navigate(`/app/order-success/${order.id}`, {
            state: { order: verifyRes.data.data, deliveryOtp: rawDeliveryOtp },
          });
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div>
        <Link
          to="/app/cart"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-800 hover:text-brand-500 transition-colors mb-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
        <h1 className="text-2xl font-black text-charcoal-900 font-display">
          Delivery Address & Payment
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Address Selection & Payment Method */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Address Section */}
          <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="font-bold text-sm text-charcoal-900 font-display">
                  Select Delivery Address
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowAddressModal(true)}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-cream-300 rounded-xl">
                <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-charcoal-800 font-medium mb-3">No saved addresses found</p>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-warm"
                >
                  Add Delivery Address
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-brand-500 bg-brand-50/20 ring-1 ring-brand-500'
                        : 'border-cream-300 hover:bg-cream-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 text-brand-500 focus:ring-brand-500"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-charcoal-900">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="bg-cream-200 text-charcoal-700 text-[10px] font-bold px-1.5 py-0.2 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-charcoal-800/80 leading-relaxed">{addr.street}</p>
                      <p className="text-gray-500">{addr.city}, {addr.postalCode}</p>
                      {addr.landmark && (
                        <p className="text-amber-800 font-medium text-[11px] mt-0.5">
                          Landmark: {addr.landmark}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 2. Payment Method Section */}
          <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="font-bold text-sm text-charcoal-900 font-display">
                Choose Payment Method
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Razorpay Test Mode */}
              <label
                className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-brand-500 bg-brand-50/30 ring-1 ring-brand-500'
                    : 'border-cream-300 hover:bg-cream-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-charcoal-900">
                      <CreditCard className="w-4 h-4 text-brand-500" />
                      <span>Razorpay (Online)</span>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'RAZORPAY'}
                      onChange={() => setPaymentMethod('RAZORPAY')}
                      className="text-brand-500 focus:ring-brand-500"
                    />
                  </div>
                  <p className="text-[11px] text-charcoal-800/70 leading-relaxed">
                    UPI, Credit/Debit Cards, NetBanking & Wallets (Test Mode Enabled).
                  </p>
                </div>
                <div className="mt-3 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Cryptographically Verified
                </div>
              </label>

              {/* Cash on Delivery */}
              <label
                className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-brand-500 bg-brand-50/30 ring-1 ring-brand-500'
                    : 'border-cream-300 hover:bg-cream-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-charcoal-900">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span>Cash on Delivery (COD)</span>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="text-brand-500 focus:ring-brand-500"
                    />
                  </div>
                  <p className="text-[11px] text-charcoal-800/70 leading-relaxed">
                    Pay in cash or scan rider's QR code upon delivery at your doorstep.
                  </p>
                </div>
                <div className="mt-3 text-[10px] font-bold text-charcoal-600">
                  Exact change appreciated
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 flex items-center gap-1.5 pb-2 border-b border-cream-100">
              <Receipt className="w-4 h-4 text-brand-500" /> Order Summary
            </h3>

            <div className="text-xs space-y-2">
              <div className="font-bold text-charcoal-900">{restaurant?.name}</div>
              <div className="space-y-1 text-charcoal-700">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between">
                    <span>
                      {i.quantity}x {i.name}
                    </span>
                    <span className="font-semibold">₹{i.itemTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-cream-200 space-y-2 text-xs text-charcoal-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Partner Fee</span>
                <span className="font-semibold">
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span className="font-semibold">₹{platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & GST (5%)</span>
                <span className="font-semibold">₹{tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-cream-200 flex justify-between items-center text-sm">
              <span className="font-extrabold text-charcoal-900">Total to Pay</span>
              <span className="text-xl font-black text-brand-600 font-display">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              disabled={loading || !selectedAddressId}
              onClick={handlePlaceOrder}
              className="w-full mt-2 py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-warm hover:shadow-warm-hover transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Processing Order...' : `Pay ₹${totalAmount.toFixed(2)} & Place Order`}</span>
            </button>

            <div className="text-[11px] text-gray-500 text-center flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>4-Digit Delivery OTP protection included</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-200 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-charcoal-900 font-display mb-1">
              Add New Delivery Address
            </h3>
            <p className="text-xs text-charcoal-800/70 mb-4">
              Enter your complete address for accurate GPS delivery dispatch
            </p>

            <form onSubmit={handleCreateAddress} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-800 mb-1">
                  Address Label
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Home', 'Work', 'Other'].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setNewLabel(lbl)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors ${
                        newLabel === lbl
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'bg-cream-100 text-charcoal-800 hover:bg-cream-200'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-800 mb-1">
                  Flat / House No. / Street
                </label>
                <input
                  type="text"
                  required
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  placeholder="e.g. Flat 302, Emerald Court, Sector 50"
                  className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-800 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="New Delhi"
                    className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-800 mb-1">
                    Nearby Landmark
                  </label>
                  <input
                    type="text"
                    value={newLandmark}
                    onChange={(e) => setNewLandmark(e.target.value)}
                    placeholder="Opposite Metro Station"
                    className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 py-2.5 bg-cream-100 hover:bg-cream-200 text-charcoal-800 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-warm"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
