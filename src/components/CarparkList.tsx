import React, { useState } from 'react';
import { RankedCarpark, ParkingPriority, AvailabilityStatus } from '../types/parking';
import { ParkingCard } from './ParkingCard';
import { LayoutGrid, List, ArrowUpDown, Filter, AlertCircle, Compass } from 'lucide-react';

interface CarparkListProps {
  carparks: RankedCarpark[];
  selectedCarpark: RankedCarpark | null;
  savedCarparkIds: string[];
  searchRadiusKm: number;
  priority: ParkingPriority;
  onSelectCarpark: (cp: RankedCarpark) => void;
  onNavigate: (cp: RankedCarpark) => void;
  onToggleSave: (id: string) => void;
  onExpandRadius: () => void;
}

export const CarparkList: React.FC<CarparkListProps> = ({
  carparks,
  selectedCarpark,
  savedCarparkIds,
  searchRadiusKm,
  priority,
  onSelectCarpark,
  onNavigate,
  onToggleSave,
  onExpandRadius
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [filterAgency, setFilterAgency] = useState<string>('ALL');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  // Agency filter
  let filtered = carparks.filter(cp => {
    if (filterAgency !== 'ALL' && cp.agency !== filterAgency) return false;
    if (onlyAvailable && cp.availableLots <= 0) return false;
    return true;
  });

  const availableCount = carparks.filter(c => c.availableLots > 0).length;

  return (
    <div className="space-y-4">
      {/* Top Section Header with View Mode & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-lg text-slate-900">
              Nearby Parking Options
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {filtered.length} found
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {availableCount} with live available lots within {searchRadiusKm} km radius
          </p>
        </div>

        {/* Filters & View Toggle */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Agency Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold text-slate-600">
            {['ALL', 'LTA', 'HDB', 'URA'].map((agency) => (
              <button
                key={agency}
                onClick={() => setFilterAgency(agency)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterAgency === agency
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {agency}
              </button>
            ))}
          </div>

          {/* Available Only Toggle */}
          <button
            onClick={() => setOnlyAvailable(!onlyAvailable)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              onlyAvailable
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Available Only
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State / Radius Expansion Prompt */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-900">
            No carparks matching filter within {searchRadiusKm} km
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Expand your search radius to 2 km or 3 km to discover additional carparks in neighboring areas.
          </p>
          <button
            onClick={onExpandRadius}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            Expand Search Radius
          </button>
        </div>
      )}

      {/* Cards Render */}
      <div className={`grid gap-4 ${
        viewMode === 'grid'
          ? 'grid-cols-1 md:grid-cols-2'
          : 'grid-cols-1'
      }`}>
        {filtered.map((cp) => (
          <ParkingCard
            key={cp.carParkId}
            carpark={cp}
            isSelected={selectedCarpark?.carParkId === cp.carParkId}
            isSaved={savedCarparkIds.includes(cp.carParkId)}
            onSelect={onSelectCarpark}
            onNavigate={onNavigate}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>
    </div>
  );
};
