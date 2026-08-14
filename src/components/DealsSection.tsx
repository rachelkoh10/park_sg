import React from 'react';
import { Utensils, Tag, Star, ArrowRight, ExternalLink } from 'lucide-react';
import { SINGAPORE_FOOD_DEALS } from '../lib/deals/mockDeals';
import { FoodDeal } from '../types/parking';

interface DealsSectionProps {
  onSelectDeal?: (deal: FoodDeal) => void;
}

export const DealsSection: React.FC<DealsSectionProps> = ({ onSelectDeal }) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Eat Nearby & Parking Perks
            </h3>
            <p className="text-xs text-slate-500">
              Exclusive dining deals & carpark rebates near popular parking hubs
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SINGAPORE_FOOD_DEALS.slice(0, 3).map((deal) => (
          <div
            key={deal.id}
            className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="font-display font-bold text-sm text-slate-900">
                  {deal.name}
                </span>
                {deal.isSponsored && (
                  <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-200 px-1.5 py-0.5 rounded shrink-0">
                    Sponsored
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>{deal.category}</span>
                <span>•</span>
                <span className="text-amber-600 font-semibold">⭐ {deal.rating}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-950">
              <div className="font-bold text-amber-900">{deal.promotionTitle}</div>
              <div className="text-amber-800/80 mt-0.5 text-[11px] line-clamp-2">
                {deal.promotionDescription}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
