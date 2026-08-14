import React from 'react';
import { X, Bookmark, MapPin, Trash2, ArrowRight, History, Home, Briefcase, Building } from 'lucide-react';
import { Destination, RankedCarpark, SavedDestination } from '../types/parking';

interface SavedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedCarparkIds: string[];
  allCarparks: RankedCarpark[];
  savedDestinations: SavedDestination[];
  recentSearches: Destination[];
  onSelectDestination: (dest: Destination) => void;
  onSelectCarpark: (cp: RankedCarpark) => void;
  onRemoveCarpark: (id: string) => void;
  onClearRecents: () => void;
}

export const SavedDrawer: React.FC<SavedDrawerProps> = ({
  isOpen,
  onClose,
  savedCarparkIds,
  allCarparks,
  savedDestinations,
  recentSearches,
  onSelectDestination,
  onSelectCarpark,
  onRemoveCarpark,
  onClearRecents
}) => {
  if (!isOpen) return null;

  const savedCarparks = allCarparks.filter(c => savedCarparkIds.includes(c.carParkId));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-bold text-lg">Saved & Recents</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          
          {/* Section 1: Saved Carparks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider text-xs">
                Saved Carparks ({savedCarparks.length})
              </h4>
            </div>

            {savedCarparks.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                No saved carparks yet. Tap the bookmark icon on any carpark card to save it.
              </div>
            ) : (
              <div className="space-y-2">
                {savedCarparks.map((cp) => (
                  <div
                    key={cp.carParkId}
                    onClick={() => {
                      onSelectCarpark(cp);
                      onClose();
                    }}
                    className="p-3 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                        {cp.development}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        🟢 {cp.availableLots} lots • Est. S${cp.estimatedCost.toFixed(2)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveCarpark(cp.carParkId);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Quick Saved Destinations */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider text-xs">
              Saved Destinations
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {savedDestinations.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => {
                    onSelectDestination({
                      id: dest.id,
                      name: dest.customName || dest.label,
                      address: dest.address,
                      latitude: dest.latitude,
                      longitude: dest.longitude
                    });
                    onClose();
                  }}
                  className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    {dest.label === 'Home' && <Home className="w-3.5 h-3.5" />}
                    {dest.label === 'Work' && <Briefcase className="w-3.5 h-3.5" />}
                    {dest.label === 'Office' && <Building className="w-3.5 h-3.5" />}
                    <span>{dest.customName || dest.label}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {dest.address}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Recent Searches */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider text-xs">
                Recent Searches
              </h4>
              {recentSearches.length > 0 && (
                <button
                  onClick={onClearRecents}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                >
                  Clear All
                </button>
              )}
            </div>

            {recentSearches.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                Your search history will appear here.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                {recentSearches.map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => {
                      onSelectDestination(dest);
                      onClose();
                    }}
                    className="w-full p-3 text-left hover:bg-emerald-50 transition-colors flex items-center justify-between gap-2 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <History className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                      <div>
                        <div className="font-semibold text-xs text-slate-900 group-hover:text-emerald-700">
                          {dest.name}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">
                          {dest.address}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600" />
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
