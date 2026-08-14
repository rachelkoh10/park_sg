import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RankedCarpark, Destination, Coordinates } from '../../types/parking';
import { Layers, Maximize2, Navigation, Compass, LocateFixed, Eye } from 'lucide-react';

interface ParkingMapProps {
  carparks: RankedCarpark[];
  selectedCarpark: RankedCarpark | null;
  destination: Destination | null;
  userLocation: Coordinates | null;
  searchRadiusKm: number;
  onSelectCarpark: (cp: RankedCarpark) => void;
  onNavigate: (cp: RankedCarpark) => void;
}

type MapTileProvider = 'voyager' | 'osm' | 'dark' | 'satellite';

const TILE_URLS: Record<MapTileProvider, { url: string; attribution: string }> = {
  voyager: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  }
};

export const ParkingMap: React.FC<ParkingMapProps> = ({
  carparks,
  selectedCarpark,
  destination,
  userLocation,
  searchRadiusKm,
  onSelectCarpark,
  onNavigate
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [tileStyle, setTileStyle] = useState<MapTileProvider>('voyager');
  const [showTileMenu, setShowTileMenu] = useState(false);

  // 1. Initialize Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = destination ? destination.latitude : 1.29348;
    const initialLng = destination ? destination.longitude : 103.85765;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    // Add Tile Layer
    const tileConfig = TILE_URLS[tileStyle];
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Markers layer group
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Handle Tile Layer Change
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const tileConfig = TILE_URLS[tileStyle];
    tileLayerRef.current.setUrl(tileConfig.url);
  }, [tileStyle]);

  // 3. Render Markers & Destination Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // Destination Pin & Radius Circle
    if (destination) {
      // Circle for search radius
      if (radiusCircleRef.current) {
        radiusCircleRef.current.remove();
      }
      const radiusMeters = searchRadiusKm * 1000;
      const circle = L.circle([destination.latitude, destination.longitude], {
        radius: radiusMeters,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '4, 6'
      }).addTo(map);
      radiusCircleRef.current = circle;

      // Destination Custom HTML Marker
      const destIcon = L.divIcon({
        className: 'custom-dest-pin',
        html: `
          <div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;background:#2563eb;color:white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 6px 16px rgba(37,99,235,0.4),0 0 0 3px #ffffff;">
            <span style="transform:rotate(45deg);font-size:16px;">📍</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
      });

      const destMarker = L.marker([destination.latitude, destination.longitude], { icon: destIcon }).addTo(markersLayer);
      destMarker.bindPopup(`
        <div style="font-family:sans-serif;padding:4px;">
          <div style="font-weight:700;color:#1e293b;font-size:13px;">${destination.name}</div>
          <div style="font-size:11px;color:#64748b;">Destination Center (${searchRadiusKm}km radius)</div>
        </div>
      `);
    }

    // User Location Pin
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `
          <div style="width:20px;height:20px;background:#0ea5e9;border:3px solid #ffffff;border-radius:50%;box-shadow:0 0 0 4px rgba(14,165,233,0.35);"></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
        .addTo(markersLayer)
        .bindPopup('<b>You Are Here</b>');
    }

    // Carpark Pins
    carparks.forEach((cp) => {
      const isSelected = selectedCarpark?.carParkId === cp.carParkId;
      const lots = cp.availableLots;

      let colorClass = 'marker-high';
      if (lots === 0) colorClass = 'marker-full';
      else if (lots <= 10) colorClass = 'marker-low';
      else if (lots <= 50) colorClass = 'marker-medium';

      const selectClass = isSelected ? 'marker-selected' : '';

      const iconHtml = `
        <div class="carpark-marker-badge ${colorClass} ${selectClass}">
          <span style="margin-right:3px;">●</span>
          <span>${lots}</span>
        </div>
      `;

      const markerIcon = L.divIcon({
        className: 'custom-carpark-pin',
        html: iconHtml,
        iconSize: [60, 26],
        iconAnchor: [30, 13],
        popupAnchor: [0, -14]
      });

      const marker = L.marker([cp.latitude, cp.longitude], { icon: markerIcon }).addTo(markersLayer);

      marker.on('click', () => {
        onSelectCarpark(cp);
      });

      // Quick popup
      marker.bindPopup(`
        <div style="font-family:sans-serif;padding:6px;min-width:180px;">
          <div style="font-weight:700;font-size:13px;color:#0f172a;margin-bottom:2px;">${cp.development}</div>
          <div style="display:flex;align-items:center;gap:6px;font-size:12px;margin-bottom:4px;">
            <span style="font-weight:bold;color:${lots > 10 ? '#059669' : lots > 0 ? '#d97706' : '#dc2626'}">
              ${lots > 0 ? `${lots} lots available` : 'FULL'}
            </span>
            <span>•</span>
            <span>Est. S$${cp.estimatedCost.toFixed(2)}</span>
          </div>
          <div style="font-size:11px;color:#64748b;margin-bottom:8px;">
            🚶 ${cp.walkingMinutes} min walk (${cp.distanceMeters}m)
          </div>
        </div>
      `);
    });

    // Fit Bounds to cover destination & top carparks
    if (destination) {
      map.setView([destination.latitude, destination.longitude], 15);
    }
  }, [carparks, selectedCarpark, destination, userLocation, searchRadiusKm]);

  // Pan to selected carpark when changed
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedCarpark) return;
    mapInstanceRef.current.panTo([selectedCarpark.latitude, selectedCarpark.longitude], {
      animate: true,
      duration: 0.5
    });
  }, [selectedCarpark]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current || !destination) return;
    mapInstanceRef.current.setView([destination.latitude, destination.longitude], 15);
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  return (
    <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[580px] rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100">
      
      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Floating Controls Overlay (Top Right) */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        
        {/* Layer style switcher */}
        <div className="relative">
          <button
            onClick={() => setShowTileMenu(!showTileMenu)}
            className="p-2.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 rounded-xl shadow-md border border-slate-200/80 transition-all"
            title="Switch Map Layers"
          >
            <Layers className="w-4 h-4 text-slate-700" />
          </button>

          {showTileMenu && (
            <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20 text-xs font-semibold text-slate-700">
              <button
                onClick={() => { setTileStyle('voyager'); setShowTileMenu(false); }}
                className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 ${tileStyle === 'voyager' ? 'text-emerald-600 bg-emerald-50' : ''}`}
              >
                🗺 Standard
              </button>
              <button
                onClick={() => { setTileStyle('osm'); setShowTileMenu(false); }}
                className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 ${tileStyle === 'osm' ? 'text-emerald-600 bg-emerald-50' : ''}`}
              >
                🌐 OpenStreetMap
              </button>
              <button
                onClick={() => { setTileStyle('dark'); setShowTileMenu(false); }}
                className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 ${tileStyle === 'dark' ? 'text-emerald-600 bg-emerald-50' : ''}`}
              >
                🌙 Dark Mode
              </button>
              <button
                onClick={() => { setTileStyle('satellite'); setShowTileMenu(false); }}
                className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 ${tileStyle === 'satellite' ? 'text-emerald-600 bg-emerald-50' : ''}`}
              >
                🛰 Satellite
              </button>
            </div>
          )}
        </div>

        {/* Recenter Button */}
        <button
          onClick={handleRecenter}
          className="p-2.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 rounded-xl shadow-md border border-slate-200/80 transition-all"
          title="Recenter to destination"
        >
          <LocateFixed className="w-4 h-4 text-emerald-600" />
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col rounded-xl overflow-hidden shadow-md border border-slate-200/80 bg-white/95 backdrop-blur-md">
          <button
            onClick={handleZoomIn}
            className="px-2.5 py-1.5 font-bold text-slate-700 hover:bg-slate-100 border-b border-slate-200 text-sm"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="px-2.5 py-1.5 font-bold text-slate-700 hover:bg-slate-100 text-sm"
          >
            -
          </button>
        </div>
      </div>

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-md border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center gap-3">
        <span className="text-slate-400 font-bold uppercase text-[10px]">Lots:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>&gt;50</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>11-50</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>1-10</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
          <span>Full</span>
        </div>
      </div>

    </div>
  );
};
