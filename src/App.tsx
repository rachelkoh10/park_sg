import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchHero } from './components/SearchHero';
import { RecommendationBanner } from './components/RecommendationBanner';
import { ParkingMap } from './components/map/ParkingMap';
import { CarparkList } from './components/CarparkList';
import { CarparkDetailsModal } from './components/CarparkDetailsModal';
import { NavigationModal } from './components/NavigationModal';
import { SavedDrawer } from './components/SavedDrawer';
import { AdminApiStatusModal } from './components/AdminApiStatusModal';
import { DealsSection } from './components/DealsSection';

import {
  ParkingAvailability,
  RankedCarpark,
  Destination,
  SavedDestination,
  ParkingPriority,
  VehicleType,
  DurationOption,
  LtaApiStatus,
  Coordinates
} from './types/parking';

import { rankCarparks } from './lib/parking/ranking';
import { POPULAR_SINGAPORE_DESTINATIONS, MOCK_SINGAPORE_CARPARKS } from './data/mockCarparks';
import { trackEvent } from './lib/analytics/tracker';
import { AlertCircle, Compass, RefreshCw } from 'lucide-react';

const DEFAULT_DESTINATION = POPULAR_SINGAPORE_DESTINATIONS[0]; // Suntec City

const DEFAULT_SAVED_DESTINATIONS: SavedDestination[] = [
  { id: 'dest-home', label: 'Home', address: 'Bishan Street 22, Singapore', latitude: 1.3590, longitude: 103.8480 },
  { id: 'dest-work', label: 'Work', address: '1 Raffles Place, Singapore', latitude: 1.2843, longitude: 103.8510 },
  { id: 'dest-orchard', label: 'Favorite', customName: 'Orchard Mall', address: 'ION Orchard, Singapore', latitude: 1.3040, longitude: 103.8318 }
];

export default function App() {
  // 1. Core State
  const [rawCarparks, setRawCarparks] = useState<ParkingAvailability[]>(MOCK_SINGAPORE_CARPARKS);
  const [rankedCarparks, setRankedCarparks] = useState<RankedCarpark[]>([]);
  const [selectedCarpark, setSelectedCarpark] = useState<RankedCarpark | null>(null);
  const [navigatingCarpark, setNavigatingCarpark] = useState<RankedCarpark | null>(null);

  // 2. Destination & Location State
  const [currentDestination, setCurrentDestination] = useState<Destination>(DEFAULT_DESTINATION);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // 3. User Preferences State
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [priority, setPriority] = useState<ParkingPriority>('best_overall');
  const [duration, setDuration] = useState<DurationOption>(2);
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(1);

  // 4. Persistence (Saved Carparks & Destinations, Recents)
  const [savedCarparkIds, setSavedCarparkIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('parksg_saved_carparks');
      return saved ? JSON.parse(saved) : ['SUNTEC-01', 'MARINA-SQ-01'];
    } catch {
      return ['SUNTEC-01'];
    }
  });

  const [savedDestinations, setSavedDestinations] = useState<SavedDestination[]>(() => {
    try {
      const saved = localStorage.getItem('parksg_saved_destinations');
      return saved ? JSON.parse(saved) : DEFAULT_SAVED_DESTINATIONS;
    } catch {
      return DEFAULT_SAVED_DESTINATIONS;
    }
  });

  const [recentSearches, setRecentSearches] = useState<Destination[]>(() => {
    try {
      const saved = localStorage.getItem('parksg_recent_searches');
      return saved ? JSON.parse(saved) : POPULAR_SINGAPORE_DESTINATIONS.slice(0, 4);
    } catch {
      return POPULAR_SINGAPORE_DESTINATIONS.slice(0, 4);
    }
  });

  // 5. API & Refresh State
  const [apiStatus, setApiStatus] = useState<LtaApiStatus | null>(null);
  const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState<number>(Date.now());
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [apiErrorNotice, setApiErrorNotice] = useState<string | null>(null);

  // 6. UI Modals
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showNavModal, setShowNavModal] = useState<boolean>(false);
  const [showSavedDrawer, setShowSavedDrawer] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('parksg_saved_carparks', JSON.stringify(savedCarparkIds));
    } catch {}
  }, [savedCarparkIds]);

  useEffect(() => {
    try {
      localStorage.setItem('parksg_recent_searches', JSON.stringify(recentSearches));
    } catch {}
  }, [recentSearches]);

  // Fetch Carpark Availability from Server API
  const fetchAvailability = useCallback(async (isManualRefresh: boolean = false) => {
    setIsRefreshing(true);
    setApiErrorNotice(null);

    try {
      const url = isManualRefresh ? '/api/parking/availability?fresh=true' : '/api/parking/availability';
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.carparks && data.carparks.length > 0) {
        setRawCarparks(data.carparks);
        setLastUpdatedTimestamp(Date.now());
        setSecondsAgo(0);
      }

      if (data.statusInfo) {
        setApiStatus(data.statusInfo);
      } else {
        setApiStatus({
          connected: data.success,
          isMock: data.isMock ?? false,
          lastSuccessfulRequest: data.lastUpdated,
          recordsReceived: data.count,
          lastError: data.error || null,
          accountKeyConfigured: !data.isMock,
          latencyMs: 20
        });
      }

      if (data.error) {
        setApiErrorNotice(data.error);
      }
    } catch (err: any) {
      console.warn('Could not reach LTA API endpoint, fallback to offline mock:', err);
      setApiErrorNotice('Live parking data temporarily unavailable. Displaying cached parking data.');
      setApiStatus(prev => ({
        connected: false,
        isMock: true,
        lastSuccessfulRequest: prev?.lastSuccessfulRequest || null,
        recordsReceived: rawCarparks.length,
        lastError: err?.message || 'Network error',
        accountKeyConfigured: false,
        latencyMs: 0
      }));
    } finally {
      setIsRefreshing(false);
    }
  }, [rawCarparks.length]);

  // Initial load
  useEffect(() => {
    fetchAvailability(false);
    trackEvent('parking_search', { initial: true, destination: DEFAULT_DESTINATION.name });
  }, [fetchAvailability]);

  // Auto-refresh interval (every 60 seconds as specified in prompt)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAvailability(false);
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchAvailability]);

  // "Updated X seconds ago" ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdatedTimestamp) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdatedTimestamp]);

  // Recalculate Ranking whenever Destination, Preferences or Raw Data change
  useEffect(() => {
    if (!rawCarparks || rawCarparks.length === 0) return;

    const ranked = rankCarparks(
      rawCarparks,
      { latitude: currentDestination.latitude, longitude: currentDestination.longitude },
      userLocation,
      {
        vehicleType,
        parkingPriority: priority,
        durationHours: duration,
        searchRadiusKm,
        savedCarparkIds,
        savedDestinations,
        recentSearches
      }
    );

    setRankedCarparks(ranked);

    // Auto select top choice if no active selection or if selection not in new list
    if (ranked.length > 0) {
      if (!selectedCarpark || !ranked.some(r => r.carParkId === selectedCarpark.carParkId)) {
        setSelectedCarpark(ranked[0]);
      }
    }
  }, [
    rawCarparks,
    currentDestination,
    userLocation,
    vehicleType,
    priority,
    duration,
    searchRadiusKm
  ]);

  // Handle Destination Change
  const handleSelectDestination = (dest: Destination) => {
    setCurrentDestination(dest);
    trackEvent('destination_search', { name: dest.name, address: dest.address });

    // Update Recents
    setRecentSearches(prev => {
      const filtered = prev.filter(p => p.id !== dest.id);
      return [dest, ...filtered].slice(0, 8);
    });
  };

  // Handle "Use My Location"
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const userCoord: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setUserLocation(userCoord);

        // Set as current destination center
        const userDest: Destination = {
          id: 'user-current-loc',
          name: 'My Current Location',
          address: 'Detected GPS Location, Singapore',
          latitude: userCoord.latitude,
          longitude: userCoord.longitude
        };

        setCurrentDestination(userDest);
        trackEvent('location_permission_granted', userCoord);
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);
        // Fallback to Singapore CBD center
        handleSelectDestination(POPULAR_SINGAPORE_DESTINATIONS[0]);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Handle Save Toggle
  const handleToggleSave = (carParkId: string) => {
    setSavedCarparkIds(prev => {
      const exists = prev.includes(carParkId);
      const updated = exists ? prev.filter(id => id !== carParkId) : [...prev, carParkId];
      trackEvent('carpark_saved', { carParkId, isSaved: !exists });
      return updated;
    });
  };

  // Handle Direct Navigation
  const handleOpenNavigate = (cp: RankedCarpark) => {
    setNavigatingCarpark(cp);
    setShowNavModal(true);
    trackEvent('navigation_clicked', {
      carParkId: cp.carParkId,
      development: cp.development,
      availableLots: cp.availableLots
    });
  };

  // Handle View Details Modal
  const handleOpenDetails = (cp: RankedCarpark) => {
    setSelectedCarpark(cp);
    setShowDetailsModal(true);
    trackEvent('parking_card_clicked', { carParkId: cp.carParkId, development: cp.development });
  };

  // Expand Radius helper
  const handleExpandRadius = () => {
    setSearchRadiusKm(prev => Math.min(3, prev + 1));
    trackEvent('radius_changed', { newRadius: searchRadiusKm + 1 });
  };

  const topChoice = rankedCarparks.length > 0 ? rankedCarparks[0] : null;
  const lastUpdatedText = secondsAgo < 5 ? 'Updated just now' : `Updated ${secondsAgo}s ago`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900">
      
      {/* 1. Header */}
      <Header
        apiStatus={apiStatus}
        lastUpdatedText={lastUpdatedText}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchAvailability(true)}
        onOpenSaved={() => setShowSavedDrawer(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
        vehicleType={vehicleType}
        onVehicleChange={(type) => {
          setVehicleType(type);
          trackEvent('priority_changed', { vehicleType: type });
        }}
        savedCount={savedCarparkIds.length}
      />

      {/* API Notice Banner if offline / stale */}
      {apiErrorNotice && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 border-b border-amber-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{apiErrorNotice}</span>
          <button
            onClick={() => fetchAvailability(true)}
            className="underline hover:text-white ml-2 cursor-pointer font-extrabold"
          >
            Retry LTA Feed
          </button>
        </div>
      )}

      {/* 2. Hero Search & Controls */}
      <SearchHero
        currentDestination={currentDestination}
        onSelectDestination={handleSelectDestination}
        onUseCurrentLocation={handleUseCurrentLocation}
        isLocating={isLocating}
        priority={priority}
        onPriorityChange={(p) => {
          setPriority(p);
          trackEvent('priority_changed', { priority: p });
        }}
        duration={duration}
        onDurationChange={(d) => {
          setDuration(d);
          trackEvent('duration_changed', { duration: d });
        }}
        searchRadiusKm={searchRadiusKm}
        onRadiusChange={(r) => {
          setSearchRadiusKm(r);
          trackEvent('radius_changed', { radius: r });
        }}
      />

      {/* 3. Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Highlighted Top Recommendation Banner */}
        {topChoice && (
          <RecommendationBanner
            topChoice={topChoice}
            onSelect={handleOpenDetails}
            onNavigate={handleOpenNavigate}
          />
        )}

        {/* Responsive Grid: Map + List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Interactive Map (5 cols on lg) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Live Interactive Map
              </span>
              <span className="text-xs text-slate-500">
                Radius: {searchRadiusKm} km
              </span>
            </div>

            <ParkingMap
              carparks={rankedCarparks}
              selectedCarpark={selectedCarpark}
              destination={currentDestination}
              userLocation={userLocation}
              searchRadiusKm={searchRadiusKm}
              onSelectCarpark={(cp) => {
                setSelectedCarpark(cp);
                trackEvent('parking_card_clicked', { carParkId: cp.carParkId });
              }}
              onNavigate={handleOpenNavigate}
            />
          </div>

          {/* Right Column: Ranked Carpark List (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            <CarparkList
              carparks={rankedCarparks}
              selectedCarpark={selectedCarpark}
              savedCarparkIds={savedCarparkIds}
              searchRadiusKm={searchRadiusKm}
              priority={priority}
              onSelectCarpark={handleOpenDetails}
              onNavigate={handleOpenNavigate}
              onToggleSave={handleToggleSave}
              onExpandRadius={handleExpandRadius}
            />
          </div>

        </div>

        {/* Eat Nearby & Parking Perks */}
        <div className="pt-4">
          <DealsSection />
        </div>

      </main>

      {/* 4. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 border-t border-slate-800 text-xs mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
              P
            </div>
            <span className="font-display font-bold text-white text-sm">
              ParkSG — Singapore Smart Parking Engine
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 flex-wrap justify-center">
            <span>Powered by LTA DataMall CarParkAvailabilityv2</span>
            <span>•</span>
            <button
              onClick={() => setShowAdminModal(true)}
              className="hover:text-emerald-400 underline"
            >
              System API Diagnostics
            </button>
          </div>
        </div>
      </footer>

      {/* 5. Modals & Drawers */}
      {showDetailsModal && (
        <CarparkDetailsModal
          carpark={selectedCarpark}
          duration={duration}
          vehicleType={vehicleType}
          isSaved={selectedCarpark ? savedCarparkIds.includes(selectedCarpark.carParkId) : false}
          onClose={() => setShowDetailsModal(false)}
          onNavigate={(cp) => {
            setShowDetailsModal(false);
            handleOpenNavigate(cp);
          }}
          onToggleSave={handleToggleSave}
          onDurationChange={setDuration}
        />
      )}

      {showNavModal && (
        <NavigationModal
          carpark={navigatingCarpark}
          onClose={() => setShowNavModal(false)}
        />
      )}

      <SavedDrawer
        isOpen={showSavedDrawer}
        onClose={() => setShowSavedDrawer(false)}
        savedCarparkIds={savedCarparkIds}
        allCarparks={rankedCarparks}
        savedDestinations={savedDestinations}
        recentSearches={recentSearches}
        onSelectDestination={handleSelectDestination}
        onSelectCarpark={handleOpenDetails}
        onRemoveCarpark={handleToggleSave}
        onClearRecents={() => setRecentSearches([])}
      />

      {showAdminModal && (
        <AdminApiStatusModal
          apiStatus={apiStatus}
          onClose={() => setShowAdminModal(false)}
          onRefresh={() => fetchAvailability(true)}
          sampleData={rankedCarparks}
        />
      )}

    </div>
  );
}
