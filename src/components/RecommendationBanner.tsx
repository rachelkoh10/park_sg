import React from 'react';
import { Star, Navigation, ArrowRight, Info, ShieldCheck, Footprints, DollarSign, Car } from 'lucide-react';
import { RankedCarpark } from '../types/parking';

interface RecommendationBannerProps {
  topChoice: RankedCarpark | null;
  onSelect: (carpark: RankedCarpark) => void;
  onNavigate: (carpark: RankedCarpark) => void;
}

export const RecommendationBanner: React.FC<RecommendationBannerProps> = ({
  topChoice,
  onSelect,
  onNavigate
}) => {
  if (!topChoice) return null;

  const isFull = topChoice.availableLots === 0;
  const isHigh = topChoice.availableLots > 50;

  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-emerald-950/20 border border-emerald-400/30 relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left side: Badge, Title & Key Metrics */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
              <Star className="w-3.5 h-3.5 fill-slate-950" />
              <span>Smart Recommendation</span>
            </span>
            <span className="text-xs text-emerald-100 font-medium bg-emerald-800/60 px-2.5 py-0.5 rounded-full border border-emerald-300/30">
              Agency: {topChoice.agency}
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
              {topChoice.development}
            </h2>
            {topChoice.address && (
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5 line-clamp-1">
                {topChoice.address}
              </p>
            )}
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold">
            {/* Lots */}
            <div className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs ${
              isFull ? 'bg-slate-900/80 text-rose-300' : 'bg-white text-emerald-950'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${isFull ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
              <span className="font-extrabold">{topChoice.availableLots}</span>
              <span className="font-medium text-slate-700">lots available</span>
            </div>

            {/* Walking */}
            <div className="bg-emerald-900/60 border border-emerald-300/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-white">
              <Footprints className="w-3.5 h-3.5 text-emerald-200" />
              <span>{topChoice.walkingMinutes} min walk</span>
              <span className="text-emerald-200/70 font-normal">({topChoice.distanceMeters}m)</span>
            </div>

            {/* Price */}
            <div className="bg-emerald-900/60 border border-emerald-300/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-white">
              <DollarSign className="w-3.5 h-3.5 text-emerald-200" />
              <span>Est. S${topChoice.estimatedCost.toFixed(2)}</span>
            </div>
          </div>

          {/* Why Recommended Text */}
          <div className="flex items-start gap-2 bg-emerald-950/40 border border-emerald-400/20 rounded-xl p-2.5 text-xs text-emerald-100 max-w-2xl">
            <Info className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Why recommended: </span>
              <span>{topChoice.whyRecommended}</span>
            </div>
          </div>
        </div>

        {/* Right side: Action CTAs */}
        <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-emerald-400/30">
          <button
            onClick={() => onNavigate(topChoice)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-emerald-950 font-extrabold text-sm shadow-lg shadow-emerald-950/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            <span>Navigate Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelect(topChoice)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-800/70 hover:bg-emerald-800 text-white font-semibold text-xs border border-emerald-300/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View Full Details & Rates</span>
          </button>
        </div>

      </div>
    </div>
  );
};
