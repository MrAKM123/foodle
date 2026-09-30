import React from 'react';
import { Star, MessageSquare, ThumbsUp, ShieldCheck } from 'lucide-react';

export const RestaurantReviewsPage: React.FC = () => {
  const reviews = [
    {
      id: '1',
      customer: 'Aarav S.',
      rating: 5,
      date: 'Yesterday',
      dish: 'Royal Dum Hyderabadi Chicken Biryani',
      comment:
        'Outstanding aroma and succulent chicken pieces! The delivery arrived piping hot with great packaging and generous portion of salan & raita.',
    },
    {
      id: '2',
      customer: 'Priya M.',
      rating: 5,
      date: '3 days ago',
      dish: 'Old Delhi Butter Chicken & Garlic Naan',
      comment:
        'Authentic rich buttery gravy just like Old Delhi dhabas. Highly recommended for family dinners.',
    },
    {
      id: '3',
      customer: 'Rohan K.',
      rating: 4,
      date: 'Last week',
      dish: 'Dal Makhani Bukhara',
      comment: 'Slow-cooked perfection! Very creamy and balanced spices.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      <div>
        <h1 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Customer Ratings & Reviews
        </h1>
        <p className="text-xs text-slate-500">
          Verified customer feedback and culinary ratings for your restaurant
        </p>
      </div>

      {/* Ratings summary */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex flex-col items-center justify-center font-black">
            <span className="text-2xl leading-none">4.8</span>
            <div className="flex items-center text-amber-500 text-[10px] mt-0.5">
              {'★★★★★'}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Top Rated Partner Kitchen</h3>
            <p className="text-xs text-slate-500">Based on 384 verified reviews across Foodle app</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Verified Customer Feedback
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.map((rev) => (
          <div key={rev.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                  {rev.customer.charAt(0)}
                </span>
                <div>
                  <span className="font-bold text-xs text-slate-900">{rev.customer}</span>
                  <span className="text-[10px] text-slate-400 ml-2">{rev.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                <span>{rev.rating}</span>
                <Star className="w-3 h-3 fill-white" />
              </div>
            </div>

            <div className="text-[11px] text-emerald-700 font-semibold bg-slate-50 px-2 py-1 rounded inline-block">
              Ordered: {rev.dish}
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
