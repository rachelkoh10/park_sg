import React, { useState, useRef, useEffect } from 'react';
import { Search, Navigation, MapPin, Clock, Compass, Sparkles, Check, ChevronDown, Mail, Building2, Landmark, MapPinned, Loader2 } from 'lucide-react';
import { Destination, ParkingPriority, DurationOption } from '../types/parking';
import { POPULAR_SINGAPORE_DESTINATIONS } from '../data/mockCarparks';
import {
  searchDestinationsAndPostalCodes,
  resolveSingaporeLocation,
  extractPostalCode,
  SINGAPORE_POSTAL_SECTORS
} from '../lib/parking/geocode';

interface SearchHeroProps {
  currentDestination: Destination | null;
  onSelectDestination: (dest: Destination) => void;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
  priority: ParkingPriority;
  onPriorityChange: (p: ParkingPriority) => void;
  duration: DurationOption;
  onDurationChange: (d: DurationOption) => void;
  searchRadiusKm: number;
  onRadiusChange: (r: number) => void;
}

const SAMPLE_POSTAL_CODES = [
  { code: '038983', label: 'Suntec City' },
  { code: '238801', label: 'ION Orchard' },
  { code: '018956', label: 'Marina Bay Sands' },
  { code: '048616', label: 'Raffles Place (CBD)' },
  { code: '608532', label: 'Jurong Westgate' },
  { code: '528523', label: 'Tampines Hub' }
];

export const SearchHero: React.FC<SearchHeroProps> = ({
  currentDestination,
  onSelectDestination,
  onUseCurrentLocation,
  isLocating,
  priority,
  onPriorityChange,
  duration,
  onDurationChange,
  searchRadiusKm,
  onRadiusChange
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState<Destination[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Local instant suggestions
  const localSuggestions = searchDestinationsAndPostalCodes(query);

  // Debounced API search for live OneMap / Server geocoding
  useEffect(() => {
    if (!query.trim()) {
      setApiSuggestions([]);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsSearchingApi(true);
      try {
        const res = await fetch(`/api/parking/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.destinations && data.destinations.length > 0) {
            setApiSuggestions(data.destinations);
          }
        }
      } catch (err) {
        // Fallback already provided by localSuggestions
      } finally {
        setIsSearchingApi(false);
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Merge suggestions, avoiding duplicates by id or coordinate
  const mergedSuggestions = React.useMemo(() => {
    const combined = [...apiSuggestions, ...localSuggestions];
    const seen = new Set<string>();
    return combined.filter(item => {
      const key = `${item.latitude.toFixed(4)}_${item.longitude.toFixed(4)}`;
      if (seen.has(key) || seen.has(item.id)) return false;
      seen.add(key);
      seen.add(item.id);
      return true;
    }).slice(0, 8);
  }, [apiSuggestions, localSuggestions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (dest: Destination) => {
    setQuery(dest.name);
    onSelectDestination(dest);
    setIsOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Check if user submitted a postal code or specific text
    const postal = extractPostalCode(query);
    if (postal) {
      const resolved = resolveSingaporeLocation(query);
      handleSelect(resolved);
      return;
    }

    if (mergedSuggestions.length > 0) {
      handleSelect(mergedSuggestions[0]);
    } else {
      const customDest = resolveSingaporeLocation(query);
      handleSelect(customDest);
    }
  };

  const detectedPostal = extractPostalCode(query);

  const priorities: { id: ParkingPriority; label: string; icon: string }[] = [
    { id: 'best_overall', label: 'Best Overall', icon: '⭐' },
    { id: 'cheapest', label: 'Cheapest', icon: '💰' },
    { id: 'closest', label: 'Closest', icon: '📍' },
    { id: 'most_available', label: 'Most Available', icon: '🟢' }
  ];

  const durationOptions: DurationOption[] = [0.5, 1, 2, 3, 4, 6, 8];
  const radiusOptions = [1, 2, 3];

  return (
    <div className="bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 text-white pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Main Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Search by 6-digit Singapore Postal Code, Mall, or Landmark</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display">
            Where are you going?
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Find the optimal Singapore carpark based on live lots, tariffs, walking convenience, and exact postal address.
          </p>
        </div>

        {/* Search Input Box */}
        <div ref={searchContainerRef} className="relative max-w-2xl mx-auto">
          <form onSubmit={handleCustomSubmit} className="relative flex items-center">
            <div className="absolute left-4 text-slate-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Enter 6-digit postal code (e.g. 038983) or destination..."
              className="w-full pl-12 pr-32 sm:pr-40 py-3.5 sm:py-4 bg-white/10 hover:bg-white/15 focus:bg-slate-900 border border-white/20 focus:border-emerald-400 rounded-2xl text-white placeholder-slate-400 text-sm sm:text-base backdrop-blur-md outline-none transition-all shadow-xl shadow-black/20"
            />

            <div className="absolute right-2 sm:right-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={onUseCurrentLocation}
                disabled={isLocating}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all"
                title="Detect my current location"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locating...' : 'Near Me'}</span>
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Find Parking
              </button>
            </div>
          </form>

          {/* Real-time postal detection hint pill */}
          {detectedPostal && (
            <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300">
              <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                Detected Singapore Postal Code: <strong>{detectedPostal}</strong>
                {SINGAPORE_POSTAL_SECTORS[detectedPostal.substring(0, 2)] && (
                  <span className="text-emerald-200/80 ml-1">
                    ({SINGAPORE_POSTAL_SECTORS[detectedPostal.substring(0, 2)].area})
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Autocomplete Dropdown */}
          {isOpen && (
            <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 flex items-center justify-between">
                <span>
                  {query ? (detectedPostal ? 'Postal Code Matches' : 'Matching Destinations') : 'Popular Destinations & Postal Codes'}
                </span>
                {isSearchingApi && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 lowercase font-normal">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>searching...</span>
                  </span>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto">
                {mergedSuggestions.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No exact match found. Press <strong>Find Parking</strong> to search coordinates.
                  </div>
                ) : (
                  mergedSuggestions.map((dest) => {
                    const isPostal = Boolean(dest.postalCode || extractPostalCode(dest.address));
                    return (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => handleSelect(dest)}
                        className="w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-emerald-500/10 transition-colors group cursor-pointer"
                      >
                        <div className={`p-1.5 rounded-lg transition-colors mt-0.5 ${
                          isPostal
                            ? 'bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950'
                            : 'bg-slate-800 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950'
                        }`}>
                          {isPostal ? <Mail className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white group-hover:text-emerald-300 truncate">
                              {dest.name}
                            </span>
                            {dest.postalCode && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                S({dest.postalCode})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 truncate mt-0.5">
                            {dest.address}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Postal Code Chips */}
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-300">
          <span className="text-slate-400 font-medium hidden sm:inline">Try Postal Code:</span>
          {SAMPLE_POSTAL_CODES.map((item) => (
            <button
              key={item.code}
              onClick={() => {
                const resolved = resolveSingaporeLocation(item.code);
                handleSelect(resolved);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 hover:text-emerald-300 text-slate-300 border border-slate-700 hover:border-emerald-500/50 transition-all flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <span className="font-mono font-bold text-amber-300">{item.code}</span>
              <span className="text-[11px] text-slate-400">({item.label})</span>
            </button>
          ))}
        </div>

        {/* Controls Bar: Priority Tabs & Duration & Radius */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Priority Strategy Selection */}
          <div className="w-full md:w-auto flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
            {priorities.map((item) => {
              const active = priority === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onPriorityChange(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Duration & Radius Controls */}
          <div className="w-full md:w-auto flex items-center justify-between sm:justify-end gap-3 text-xs">
            
            {/* Duration Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-medium">Duration:</span>
              <select
                value={duration}
                onChange={(e) => onDurationChange(parseFloat(e.target.value) as DurationOption)}
                className="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer"
              >
                {durationOptions.map(opt => (
                  <option key={opt} value={opt} className="bg-slate-900 text-white">
                    {opt === 0.5 ? '30 mins' : `${opt} ${opt === 1 ? 'hour' : 'hours'}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Radius Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-medium">Radius:</span>
              <div className="flex items-center gap-1">
                {radiusOptions.map(r => (
                  <button
                    key={r}
                    onClick={() => onRadiusChange(r)}
                    className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${
                      searchRadiusKm === r
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}km
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
