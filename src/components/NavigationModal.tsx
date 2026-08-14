import React from 'react';
import { X, Navigation, ExternalLink, MapPin, Footprints, DollarSign, ArrowRight } from 'lucide-react';
import { RankedCarpark } from '../types/parking';

interface NavigationModalProps {
  carpark: RankedCarpark | null;
  onClose: () => void;
}

export const NavigationModal: React.FC<NavigationModalProps> = ({
  carpark,
  onClose
}) => {
  if (!carpark) return null;

  const lat = carpark.latitude;
  const lng = carpark.longitude;
  const encodedName = encodeURIComponent(carpark.development);

  // Deep links for navigation
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodedName}`;
  const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  const appleMapsUrl = `https://maps.apple.com/?daddr=${lat},${lng}&q=${encodedName}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
              <Navigation className="w-3 h-3 fill-white" />
              <span>Direct Navigation</span>
            </div>
            <h3 className="font-display font-extrabold text-xl leading-tight">
              {carpark.development}
            </h3>
            <p className="text-xs text-emerald-100 line-clamp-1">
              {carpark.address || `${carpark.latitude.toFixed(4)}, ${carpark.longitude.toFixed(4)}`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Summary Pill Bar */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50 border-b border-slate-100 py-3 text-center text-xs">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Available</div>
            <div className="font-extrabold text-emerald-700 mt-0.5">{carpark.availableLots} lots</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Walking</div>
            <div className="font-extrabold text-slate-900 mt-0.5">{carpark.walkingMinutes} mins</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Estimated</div>
            <div className="font-extrabold text-slate-900 mt-0.5">S${carpark.estimatedCost.toFixed(2)}</div>
          </div>
        </div>

        {/* Choose Navigation App Options */}
        <div className="p-5 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Choose navigation app
          </div>

          {/* Google Maps */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-base shadow-xs">
                G
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                  Google Maps
                </div>
                <div className="text-xs text-slate-500">
                  Turn-by-turn driving directions & live traffic
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
          </a>

          {/* Waze */}
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-black text-base shadow-xs">
                W
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                  Waze
                </div>
                <div className="text-xs text-slate-500">
                  Real-time alerts, ERP reminders & fastest route
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
          </a>

          {/* Apple Maps */}
          <a
            href={appleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-base shadow-xs">
                🍎
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                  Apple Maps
                </div>
                <div className="text-xs text-slate-500">
                  Open in Apple Maps on iOS devices
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
          </a>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
