import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext.js';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const FloatingCartBar: React.FC = () => {
  const { itemCount, subtotal, restaurant } = useCart();
  const location = useLocation();

  // Hide floating bar if already on cart or checkout page or if cart is empty
  if (itemCount === 0 || location.pathname === '/app/cart' || location.pathname.startsWith('/app/checkout')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none">
      <div className="max-w-xl mx-auto pointer-events-auto">
        <Link
          to="/app/cart"
          className="flex items-center justify-between bg-charcoal-900 hover:bg-black text-white p-3.5 px-5 rounded-2xl shadow-2xl border border-charcoal-800 transition-all transform hover:-translate-y-0.5 active:translate-y-0 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-sm shadow-warm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                <span className="text-saffron-400 font-extrabold text-sm">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="text-[11px] text-gray-400 truncate max-w-[180px] sm:max-w-[260px]">
                From {restaurant?.name || 'Kitchen'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-black text-brand-400 group-hover:text-white transition-colors">
            <span>View Cart</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
};
