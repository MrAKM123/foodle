import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Utensils } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-3xl flex items-center justify-center mb-4 shadow-sm">
        <Utensils className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-extrabold text-charcoal-900 font-display mb-2">404 - Table Not Found</h1>
      <p className="text-sm text-charcoal-800/70 max-w-md mb-6">
        Oops! Looks like the dish or page you are looking for has been removed from the menu.
      </p>
      <Link
        to="/app"
        className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-6 py-3 rounded-full shadow-warm transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Foodle Home
      </Link>
    </div>
  );
};
