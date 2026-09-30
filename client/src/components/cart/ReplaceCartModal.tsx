import React from 'react';
import { useCart } from '../../context/CartContext.js';
import { AlertCircle, Trash2, ArrowRight } from 'lucide-react';

export const ReplaceCartModal: React.FC = () => {
  const { replaceModalState, restaurant, confirmReplaceCart, cancelReplaceCart } = useCart();

  if (!replaceModalState.isOpen || !replaceModalState.newRestaurant) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-200 animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-charcoal-900 font-display mb-2">
          Replace cart items?
        </h3>

        <p className="text-xs text-charcoal-800/80 leading-relaxed mb-6">
          Your cart already contains dishes from{' '}
          <span className="font-bold text-charcoal-900">{restaurant?.name || 'another restaurant'}</span>.
          Foodle delivers from one restaurant at a time to ensure fresh and hot food delivery.
          <br /><br />
          Do you want to discard your existing cart and start a new order from{' '}
          <span className="font-bold text-brand-600">{replaceModalState.newRestaurant.name}</span>?
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={cancelReplaceCart}
            className="flex-1 py-3 px-4 bg-cream-100 hover:bg-cream-200 text-charcoal-800 font-bold text-xs rounded-xl transition-colors"
          >
            Keep Current Cart
          </button>
          <button
            onClick={confirmReplaceCart}
            className="flex-1 py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-warm hover:shadow-warm-hover transition-all flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Discard & Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
