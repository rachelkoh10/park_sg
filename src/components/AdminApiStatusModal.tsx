import React, { useState } from 'react';
import { X, ShieldCheck, ShieldAlert, RefreshCw, CheckCircle2, XCircle, Code, Cpu, Terminal, Key, Clock, Server } from 'lucide-react';
import { LtaApiStatus, RankedCarpark } from '../types/parking';

interface AdminApiStatusModalProps {
  apiStatus: LtaApiStatus | null;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  sampleData: RankedCarpark[];
}

export const AdminApiStatusModal: React.FC<AdminApiStatusModalProps> = ({
  apiStatus,
  onClose,
  onRefresh,
  sampleData
}) => {
  const [testing, setTesting] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    await onRefresh();
    setTesting(false);
  };

  const isLive = apiStatus?.connected && !apiStatus?.isMock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg">
                LTA DataMall Diagnostic Console
              </h3>
              <p className="text-xs text-slate-400">
                Server-side API status & CarParkAvailabilityv2 health
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* Main Status Badge Hero */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            isLive
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-center gap-3">
              {isLive ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
              )}
              <div>
                <div className="font-extrabold text-sm">
                  {isLive ? 'LTA DataMall API Connected' : 'Running in Simulated Mock Data Mode'}
                </div>
                <div className="text-[11px] opacity-90 mt-0.5">
                  {isLive
                    ? 'Receiving dynamic real-time lot availability from Singapore LTA DataMall.'
                    : 'LTA_ACCOUNT_KEY not configured or offline. Serving verified Singapore parking mocks.'}
                </div>
              </div>
            </div>

            <button
              onClick={handleTest}
              disabled={testing}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold hover:bg-slate-50 transition-all shadow-xs shrink-0 flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Test API</span>
            </button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-slate-400 font-bold uppercase text-[10px]">API Endpoint</div>
              <div className="font-bold text-slate-900 mt-1 truncate" title="CarParkAvailabilityv2">
                CarParkAvailabilityv2
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Account Key</div>
              <div className="font-bold text-slate-900 mt-1 flex items-center gap-1">
                <Key className="w-3 h-3 text-slate-400" />
                <span>{apiStatus?.accountKeyConfigured ? 'Configured (Secret)' : 'Missing (.env)'}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Mock Mode</div>
              <div className="font-bold mt-1 text-slate-900">
                {apiStatus?.isMock ? '🟡 Active' : '🟢 Inactive'}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Carparks Loaded</div>
              <div className="font-bold text-emerald-700 text-sm mt-1">
                {apiStatus?.recordsReceived || sampleData.length} records
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-slate-400 font-bold uppercase text-[10px]">API Latency</div>
              <div className="font-bold text-slate-900 text-sm mt-1">
                {apiStatus?.latencyMs ? `${apiStatus.latencyMs} ms` : '~15 ms'}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Last Fetch</div>
              <div className="font-bold text-slate-900 mt-1 truncate">
                {apiStatus?.lastSuccessfulRequest
                  ? new Date(apiStatus.lastSuccessfulRequest).toLocaleTimeString()
                  : 'Just now'}
              </div>
            </div>

          </div>

          {/* Last Error Message if any */}
          {apiStatus?.lastError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800">
              <div className="font-bold text-[11px] uppercase tracking-wide">Last Recorded Issue:</div>
              <div className="mt-0.5">{apiStatus.lastError}</div>
            </div>
          )}

          {/* Raw JSON Inspector Toggle */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <button
              onClick={() => setShowJson(!showJson)}
              className="flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800"
            >
              <Code className="w-4 h-4" />
              <span>{showJson ? 'Hide Normalized Sample JSON' : 'Inspect Normalized Sample Payload'}</span>
            </button>

            {showJson && (
              <div className="bg-slate-950 text-emerald-400 p-3.5 rounded-2xl font-mono text-[11px] max-h-48 overflow-y-auto">
                <pre>{JSON.stringify(sampleData.slice(0, 2), null, 2)}</pre>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
          >
            Close Diagnostics
          </button>
        </div>

      </div>
    </div>
  );
};
