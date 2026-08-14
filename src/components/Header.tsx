import React from 'react';
import { RefreshCw, Bookmark, SlidersHorizontal, ShieldAlert, Car, MapPin, Sparkles } from 'lucide-react';
import { LtaApiStatus, VehicleType } from '../types/parking';

interface HeaderProps {
  apiStatus: LtaApiStatus | null;
  lastUpdatedText: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenSaved: () => void;
  onOpenAdmin: () => void;
  vehicleType: VehicleType;
  onVehicleChange: (type: VehicleType) => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  apiStatus,
  lastUpdatedText,
  isRefreshing,
  onRefresh,
  onOpenSaved,
  onOpenAdmin,
  vehicleType,
  onVehicleChange,
  savedCount
}) => {
  const isLive = apiStatus?.connected && !apiStatus?.isMock;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 ring-1 ring-black/5">
              <span className="font-display font-extrabold text-lg tracking-tight">P</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg text-slate-900 tracking-tight">
                  Park<span className="text-emerald-600">SG</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-600 border border-slate-200">
                  LTA DataMall
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Singapore Real-Time Smart Parking Engine
              </p>
            </div>
          </div>

          {/* Center: Live / Demo status & Time ago */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={onOpenAdmin}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                isLive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
              title="Click to view API diagnostics"
            >
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{isLive ? 'Live LTA Data' : 'Demo Parking Data'}</span>
            </button>

            <span className="text-xs text-slate-400 font-medium">
              {lastUpdatedText}
            </span>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50"
              title="Refresh live carpark availability"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Vehicle Switcher Pill */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium text-slate-600">
              <button
                onClick={() => onVehicleChange('car')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  vehicleType === 'car' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
                }`}
                title="Car parking rates & lots"
              >
                <span>🚗</span>
                <span className="hidden sm:inline">Car</span>
              </button>
              <button
                onClick={() => onVehicleChange('motorcycle')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  vehicleType === 'motorcycle' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
                }`}
                title="Motorcycle parking rates & lots"
              >
                <span>🏍</span>
                <span className="hidden sm:inline">Bike</span>
              </button>
            </div>

            {/* Saved Locations */}
            <button
              onClick={onOpenSaved}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Saved</span>
              {savedCount > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px] font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Admin / Diagnostic status */}
            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-600 transition-colors"
              title="API Diagnostics & System Health"
            >
              <ShieldAlert className="w-4 h-4 text-slate-600" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
