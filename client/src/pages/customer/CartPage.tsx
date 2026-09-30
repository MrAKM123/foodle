import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  ArrowLeft,
  Receipt,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CartPage: React.FC = () => {
  const {
    items,
    restaurant,
    subtotal,
    deliveryFee,
    platformFee,
    tax,
    totalAmount,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [instructions, setInstructions] = useState('');

  // Handle coupon application
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();

    if (code === 'WELCOME50') {
      if (subtotal < 199) {
        toast.error('Minimum order of ₹199 required for WELCOME50');
        return;
      }
      const disc = Math.min(subtotal * 0.5, 100);
      setAppliedCoupon({ code: 'WELCOME50', discount: disc });
      toast.success('🎉 WELCOME50 applied! Saved ₹' + disc.toFixed(2));
    } else if (code === 'FEAST100') {
      if (subtotal < 399) {
        toast.error('Minimum order of ₹399 required for FEAST100');
        return;
      }
      setAppliedCoupon({ code: 'FEAST100', discount: 100 });
      toast.success('🎉 FEAST100 applied! Saved ₹100.00');
    } else {
      toast.error('Invalid coupon code. Try WELCOME50 or FEAST100');
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalPayable = Math.max(0, totalAmount - discountAmount);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 sm:p-16 text-center border border-cream-200 max-w-lg mx-auto shadow-sm my-12">
        <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-charcoal-900 font-display mb-2">
          Your cart is empty
        </h2>
        <p className="text-xs text-charcoal-800/70 mb-8 max-w-xs mx-auto">
          Explore top-rated authentic kitchens and satisfy your food cravings today!
        </p>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm rounded-full shadow-warm transition-transform hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" /> Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header with restaurant breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={restaurant ? `/app/restaurant/${restaurant.slug}` : '/app'}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-800 hover:text-brand-500 transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Add More Dishes
          </Link>
          <h1 className="text-2xl font-black text-charcoal-900 font-display">
            Order Review & Bill Details
          </h1>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Clear all items from your cart?')) clearCart();
          }}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 p-2"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Items List & Instructions */}
        <div className="lg:col-span-7 space-y-4">
          {/* Restaurant Banner Card */}
          <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center text-xl font-bold">
                🍛
              </div>
              <div>
                <h3 className="font-bold text-sm text-charcoal-900">
                  {restaurant?.name || 'Partner Kitchen'}
                </h3>
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 100% Prepared Fresh on Order
                </p>
              </div>
            </div>

            <Link
              to={restaurant ? `/app/restaurant/${restaurant.slug}` : '/app'}
              className="text-xs font-bold text-brand-500 hover:underline"
            >
              Change
            </Link>
          </div>

          {/* Cart Items List */}
          <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden divide-y divide-cream-100">
            {items.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {item.isVeg ? (
                      <span className="veg-indicator" title="Pure Veg"></span>
                    ) : (
                      <span className="nonveg-indicator" title="Non-Veg"></span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-charcoal-900 leading-snug">
                      {item.name}
                    </h4>
                    <div className="text-xs font-semibold text-charcoal-700 mt-0.5">
                      ₹{item.price.toFixed(2)} each
                    </div>

                    {/* Customizations tags */}
                    {((item.selectedVariants && item.selectedVariants.length > 0) ||
                      (item.selectedAddons && item.selectedAddons.length > 0)) && (
                      <div className="text-[10px] text-gray-500 mt-1 space-x-1">
                        {item.selectedVariants?.map((v) => (
                          <span key={v.id} className="bg-cream-100 px-1.5 py-0.5 rounded">
                            {v.name}
                          </span>
                        ))}
                        {item.selectedAddons?.map((a) => (
                          <span key={a.id} className="bg-cream-100 px-1.5 py-0.5 rounded">
                            +{a.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Item Total */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-cream-100 border border-cream-300 text-charcoal-900 rounded-lg px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="text-gray-600 hover:text-brand-600 p-0.5"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-xs min-w-[14px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="text-gray-600 hover:text-brand-600 p-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[60px]">
                    <span className="font-bold text-xs text-charcoal-900">
                      ₹{item.itemTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery / Cooking Instructions */}
          <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-charcoal-900">
              <FileText className="w-4 h-4 text-brand-500" />
              <span>Special Cooking or Delivery Instructions</span>
            </div>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Please add extra mint chutney, keep food spicy, ring bell on arrival..."
              className="w-full p-3 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 placeholder:text-gray-400"
            ></textarea>
          </div>
        </div>

        {/* Right Column: Coupon & Bill Summary */}
        <div className="lg:col-span-5 space-y-4">
          {/* Apply Coupon Box */}
          <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-charcoal-900 mb-2">
              <Tag className="w-4 h-4 text-saffron-500" />
              <span>Coupons & Offers</span>
            </div>

            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Enter WELCOME50 or FEAST100"
                className="flex-1 px-3 py-2 text-xs uppercase bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono font-bold"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-warm"
              >
                Apply
              </button>
            </form>

            {appliedCoupon && (
              <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center justify-between bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <span>✓ "{appliedCoupon.code}" applied (-₹{appliedCoupon.discount.toFixed(2)})</span>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(null)}
                  className="text-gray-400 hover:text-rose-600 text-[10px]"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Detailed Bill Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 flex items-center gap-1.5 pb-2 border-b border-cream-100">
              <Receipt className="w-4 h-4 text-brand-500" /> Bill Summary
            </h3>

            <div className="space-y-2 text-xs text-charcoal-800">
              <div className="flex justify-between">
                <span>Item Subtotal</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Delivery Partner Fee</span>
                {deliveryFee === 0 ? (
                  <span className="text-emerald-600 font-bold uppercase text-[11px]">
                    FREE (Orders &gt; ₹499)
                  </span>
                ) : (
                  <span className="font-semibold">₹{deliveryFee.toFixed(2)}</span>
                )}
              </div>

              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span className="font-semibold">₹{platformFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>GST & Restaurant Charges (5%)</span>
                <span className="font-semibold">₹{tax.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-cream-200 flex justify-between items-center text-sm">
              <span className="font-extrabold text-charcoal-900">Total Payable</span>
              <span className="text-lg font-black text-brand-600 font-display">
                ₹{finalPayable.toFixed(2)}
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                if (!user) {
                  navigate('/login', { state: { from: { pathname: '/app/checkout' } } });
                } else {
                  navigate('/app/checkout');
                }
              }}
              className="w-full mt-4 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm rounded-xl shadow-warm hover:shadow-warm-hover transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Razorpay Test & COD Supported</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
