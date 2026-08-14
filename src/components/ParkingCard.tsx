import React from 'react';
import { Navigation, Bookmark, Footprints, DollarSign, MapPin, Star, Sparkles, ChevronRight, Check } from 'lucide-react';
import { RankedCarpark } from '../types/parking';

interface ParkingCardProps {
  carpark: RankedCarpark;
  isSelected: boolean;
  isSaved: boolean;
  onSelect: (carpark: RankedCarpark) => void;
  onNavigate: (carpark: RankedCarpark) => void;
  onToggleSave: (carparkId: string) => void;
}

export const ParkingCard: React.FC<ParkingCardProps> = ({
  carpark,
  isSelected,
  isSaved,
  onSelect,
  onNavigate,
  onToggleSave
}) => {
  const isFull = carpark.availableLots === 0;
  const isLow = carpark.availableLots > 0 && carpark.availableLots <= 10;
  const isMedium = carpark.availableLots > 10 && carpark.availableLots <= 50;
  const isHigh = carpark.availableLots > 50;

  // Status color styling
  let statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dotClass = 'bg-emerald-500 animate-pulse';
  let statusText = `${carpark.availableLots} lots`;

  if (isFull) {
    statusBadgeClass = 'bg-slate-100 text-slate-600 border-slate-300';
    dotClass = 'bg-slate-400';
    statusText = 'FULL (0 lots)';
  } else if (isLow) {
    statusBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
    dotClass = 'bg-rose-500';
    statusText = `${carpark.availableLots} lots (Low)`;
  } else if (isMedium) {
    statusBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
    dotClass = 'bg-amber-500';
    statusText = `${carpark.availableLots} lots`;
  }

  // Badge configuration
  let badgeColor = '';
  if (carpark.rankBadge === 'BEST OVERALL') badgeColor = 'bg-emerald-600 text-white';
  else if (carpark.rankBadge === 'CHEAPEST') badgeColor = 'bg-blue-600 text-white';
  else if (carpark.rankBadge === 'CLOSEST') badgeColor = 'bg-violet-600 text-white';
  else if (carpark.rankBadge === 'MOST AVAILABLE') badgeColor = 'bg-teal-600 text-white';

  return (
    <div
      onClick={() => onSelect(carpark)}
      className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer relative group ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg bg-emerald-50/20'
          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Top Header: Badge, Agency & Save Button */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {carpark.rankBadge && (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs flex items-center gap-1 ${badgeColor}`}>
              <Star className="w-3 h-3 fill-current" />
              <span>{carpark.rankBadge}</span>
            </span>
          )}
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            {carpark.agency}
          </span>
          {carpark.area && (
            <span className="text-[10px] text-slate-500 font-medium">
              • {carpark.area}
            </span>
          )}
        </div>

        {/* Favorite bookmark toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(carpark.carParkId);
          }}
          className={`p-1.5 rounded-lg border transition-colors ${
            isSaved
              ? 'bg-amber-50 border-amber-200 text-amber-600'
              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
          title={isSaved ? 'Remove from saved' : 'Save carpark'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}`} />
        </button>
      </div>

      {/* Carpark Title & Address */}
      <div className="mb-3">
        <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
          {carpark.development}
        </h3>
        {carpark.address && (
          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
            {carpark.address}
          </p>
        )}
      </div>

      {/* Primary 3 Grid Metrics: Lots / Cost / Distance */}
      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100 mb-3 text-xs">
        
        {/* Availability Lots */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Availability</span>
          <div className="flex items-center gap-1.5 mt-0.5 font-bold text-slate-900">
            <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
            <span className={`font-extrabold ${isFull ? 'text-slate-500' : isLow ? 'text-rose-600' : 'text-slate-900'}`}>
              {carpark.availableLots}
            </span>
            <span className="text-[10px] text-slate-500 font-normal">lots</span>
          </div>
        </div>

        {/* Estimated Tariff */}
        <div className="flex flex-col border-x border-slate-200/80 px-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Est. Price</span>
          <div className="flex items-center gap-1 mt-0.5 font-extrabold text-slate-900">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600 -mr-0.5" />
            <span>{carpark.estimatedCost.toFixed(2)}</span>
          </div>
        </div>

        {/* Walking & Distance */}
        <div className="flex flex-col pl-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Walking</span>
          <div className="flex items-center gap-1 mt-0.5 font-bold text-slate-900">
            <Footprints className="w-3.5 h-3.5 text-blue-600" />
            <span>{carpark.walkingMinutes} min</span>
          </div>
        </div>

      </div>

      {/* Why Recommended Snippet */}
      {carpark.whyRecommended && (
        <p className="text-xs text-slate-600 line-clamp-1 mb-3 bg-slate-50/60 p-1.5 rounded-lg border border-slate-100 font-normal">
          <span className="font-semibold text-slate-800">Why: </span>
          {carpark.whyRecommended}
        </p>
      )}

      {/* Footer Info & Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-500">LTA Verified</span>
          <span>•</span>
          <span>{carpark.distanceMeters}m away</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(carpark);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            Details
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(carpark);
            }}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 fill-white" />
            <span>Navigate</span>
          </button>
        </div>
      </div>

    </div>
  );
};
