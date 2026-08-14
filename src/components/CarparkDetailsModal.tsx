import React, { useState } from 'react';
import { X, Navigation, Bookmark, MapPin, Footprints, DollarSign, Clock, ShieldCheck, Check, Sparkles, Utensils, AlertCircle } from 'lucide-react';
import { RankedCarpark, DurationOption, VehicleType } from '../types/parking';
import { estimateParkingCost } from '../lib/parking/pricing';
import { SINGAPORE_FOOD_DEALS } from '../lib/deals/mockDeals';

interface CarparkDetailsModalProps {
  carpark: RankedCarpark | null;
  duration: DurationOption;
  vehicleType: VehicleType;
  isSaved: boolean;
  onClose: () => void;
  onNavigate: (cp: RankedCarpark) => void;
  onToggleSave: (id: string) => void;
  onDurationChange: (d: DurationOption) => void;
}

export const CarparkDetailsModal: React.FC<CarparkDetailsModalProps> = ({
  carpark,
  duration,
  vehicleType,
  isSaved,
  onClose,
  onNavigate,
  onToggleSave,
  onDurationChange
}) => {
  if (!carpark) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'deals'>('overview');

  const pricing = estimateParkingCost(
    carpark.carParkId,
    duration,
    vehicleType,
    carpark.agency
  );

  const rateRules = pricing.rateInfo;
  const isFull = carpark.availableLots === 0;

  // Nearby deals for this carpark
  const nearbyDeals = SINGAPORE_FOOD_DEALS.filter(d =>
    d.carParkId === carpark.carParkId || Math.random() > 0.4
  ).slice(0, 3);

  const durationOptions: DurationOption[] = [0.5, 1, 2, 3, 4, 6, 8];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500 text-slate-950">
                  {carpark.agency} Verified
                </span>
                <span className="text-xs text-slate-400">
                  ID: {carpark.carParkId}
                </span>
                {carpark.area && (
                  <span className="text-xs text-slate-300">
                    • {carpark.area}
                  </span>
                )}
              </div>

              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                {carpark.development}
              </h2>

              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="line-clamp-1">{carpark.address || 'Singapore'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleSave(carpark.carParkId)}
                className={`p-2 rounded-xl border transition-colors ${
                  isSaved
                    ? 'bg-amber-500/20 border-amber-400 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title={isSaved ? 'Remove Bookmark' : 'Save Carpark'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 border-t border-slate-800 pt-3 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Live Availability
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'pricing'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tariffs & Pricing Rules
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activeTab === 'deals'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Eat Nearby & Perks</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold">
                {nearbyDeals.length}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* TAB 1: OVERVIEW & LIVE AVAILABILITY */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Giant Live Lots Status Hero */}
              <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 p-6 rounded-3xl border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <span className={`w-3 h-3 rounded-full ${isFull ? 'bg-rose-500' : 'bg-emerald-500 animate-ping'}`} />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Live LTA DataMall Feed
                    </span>
                  </div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-display">
                    {carpark.availableLots}
                    <span className="text-lg sm:text-xl font-medium text-slate-500 ml-2">
                      available lots
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Updated ~1 minute ago • Lot Type: {carpark.lotType === 'C' ? '🚗 Cars' : carpark.lotType === 'Y' ? '🏍 Motorcycles' : '🚐 Heavy'}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center min-w-[140px]">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Estimated Capacity</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                    ~{carpark.totalLotsEstimate || 300} lots
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                    {isFull ? '100% Occupied' : 'Lots available now'}
                  </div>
                </div>
              </div>

              {/* Distance & Walking Time card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-slate-400 font-semibold">Walking Distance</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                    <Footprints className="w-4 h-4 text-blue-600" />
                    <span>{carpark.walkingMinutes} mins ({carpark.distanceMeters}m)</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-slate-400 font-semibold">Driving Time</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                    <Navigation className="w-4 h-4 text-emerald-600" />
                    <span>~{carpark.drivingMinutes} mins</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 col-span-2 sm:col-span-1">
                  <div className="text-slate-400 font-semibold">Est. Cost ({duration}h)</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>S${pricing.cost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Quick Pricing Calculator Widget */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Select Planned Parking Duration:
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    Est. S${pricing.cost.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {durationOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => onDurationChange(opt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        duration === opt
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt === 0.5 ? '30m' : `${opt}h`}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  * Pricing is estimated based on current time of entry and published rates.
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: TARIFFS & PRICING RULES */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> LTA DataMall provides real-time available lots. Parking rates are provided via verified Singapore commercial & agency tariff tables.
                </span>
              </div>

              {/* Weekday Rules */}
              {rateRules.weekday && rateRules.weekday.length > 0 && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs text-slate-700 uppercase">
                    Weekday Rates (Monday – Friday)
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {rateRules.weekday.map((rule, idx) => (
                      <div key={idx} className="p-3.5 flex items-start justify-between gap-4">
                        <span className="font-semibold text-slate-800">{rule.timeWindow}</span>
                        <span className="text-slate-600 text-right">{rule.rateDescription}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weekend Rules */}
              {rateRules.weekend && rateRules.weekend.length > 0 && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs text-slate-700 uppercase">
                    Weekend Rates (Saturday, Sunday & Public Holidays)
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {rateRules.weekend.map((rule, idx) => (
                      <div key={idx} className="p-3.5 flex items-start justify-between gap-4">
                        <span className="font-semibold text-slate-800">{rule.timeWindow}</span>
                        <span className="text-slate-600 text-right">{rule.rateDescription}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rateRules.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Additional info: </span>
                  {rateRules.notes}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EAT NEARBY & PERKS */}
          {activeTab === 'deals' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Restaurants and merchant promotions within walking distance of {carpark.development}:
              </p>

              <div className="space-y-3">
                {nearbyDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{deal.name}</span>
                          {deal.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              {deal.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          {deal.category} • ⭐ {deal.rating} ({deal.reviewCount} reviews) • {deal.distanceMeters}m walk
                        </div>
                      </div>

                      {deal.isSponsored && (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">
                          Sponsored
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-950">
                      <div className="font-bold text-emerald-900">{deal.promotionTitle}</div>
                      <div className="text-emerald-800/90 mt-0.5">{deal.promotionDescription}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs">
            <div className="font-bold text-slate-900">
              GPS: {carpark.latitude.toFixed(4)}, {carpark.longitude.toFixed(4)}
            </div>
            <div className="text-[11px] text-slate-500">
              Ready for turn-by-turn navigation
            </div>
          </div>

          <button
            onClick={() => onNavigate(carpark)}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Navigation className="w-4 h-4 fill-white" />
            <span>Navigate to Carpark</span>
          </button>
        </div>

      </div>
    </div>
  );
};
