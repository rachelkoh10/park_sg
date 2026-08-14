import { ParkingAvailability, LtaApiStatus, LtaApiResponse } from '../../types/parking';
import { normalizeLtaResponse } from './normalize';
import { MOCK_SINGAPORE_CARPARKS } from '../../data/mockCarparks';

const LTA_CARPARK_API_URL = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

// In-memory caching to avoid pounding LTA if multiple users query concurrently
interface CachedData {
  timestamp: number;
  carparks: ParkingAvailability[];
  status: LtaApiStatus;
}

let cachedState: CachedData | null = null;
const CACHE_TTL_MS = 25 * 1000; // 25 seconds cache

let apiDiagnosticStatus: LtaApiStatus = {
  connected: false,
  isMock: false,
  lastSuccessfulRequest: null,
  recordsReceived: 0,
  lastError: null,
  accountKeyConfigured: false,
  latencyMs: 0
};

export function getApiDiagnosticStatus(): LtaApiStatus {
  const accountKey = process.env.LTA_ACCOUNT_KEY?.trim();
  const hasValidKey = !!accountKey && accountKey !== 'replace_with_lta_account_key' && accountKey.length > 5;
  return {
    ...apiDiagnosticStatus,
    accountKeyConfigured: hasValidKey,
    isMock: !hasValidKey || process.env.MOCK_LTA_DATA === 'true'
  };
}

export async function getCarparkAvailability(forceFresh: boolean = false): Promise<{
  success: boolean;
  source: 'LTA' | 'MOCK';
  isMock: boolean;
  lastUpdated: string;
  count: number;
  carparks: ParkingAvailability[];
  error?: string;
  statusInfo: LtaApiStatus;
}> {
  const now = Date.now();
  const accountKey = process.env.LTA_ACCOUNT_KEY?.trim();
  const hasValidKey = !!accountKey && accountKey !== 'replace_with_lta_account_key' && accountKey.length > 5;
  const forceMock = process.env.MOCK_LTA_DATA === 'true' || !hasValidKey;

  // Return cached result if available and fresh
  if (!forceFresh && cachedState && (now - cachedState.timestamp) < CACHE_TTL_MS) {
    return {
      success: true,
      source: cachedState.status.isMock ? 'MOCK' : 'LTA',
      isMock: cachedState.status.isMock,
      lastUpdated: new Date(cachedState.timestamp).toISOString(),
      count: cachedState.carparks.length,
      carparks: cachedState.carparks,
      statusInfo: cachedState.status
    };
  }

  // Fallback to Mock Data if no key configured or Mock mode requested
  if (forceMock) {
    const timestamp = new Date().toISOString();
    // Dynamically jitter mock numbers slightly so refresh feels responsive
    const jitteredMock = MOCK_SINGAPORE_CARPARKS.map(cp => ({
      ...cp,
      availableLots: Math.max(0, cp.availableLots + Math.floor(Math.random() * 5) - 2),
      lastUpdated: timestamp
    }));

    apiDiagnosticStatus = {
      connected: true,
      isMock: true,
      lastSuccessfulRequest: timestamp,
      recordsReceived: jitteredMock.length,
      lastError: hasValidKey ? null : 'LTA_ACCOUNT_KEY not configured. Running in Mock Data mode.',
      accountKeyConfigured: hasValidKey,
      latencyMs: 12
    };

    cachedState = {
      timestamp: now,
      carparks: jitteredMock,
      status: apiDiagnosticStatus
    };

    return {
      success: true,
      source: 'MOCK',
      isMock: true,
      lastUpdated: timestamp,
      count: jitteredMock.length,
      carparks: jitteredMock,
      statusInfo: apiDiagnosticStatus
    };
  }

  // Call real LTA API with timeout & error handling
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(LTA_CARPARK_API_URL, {
      method: 'GET',
      headers: {
        'AccountKey': accountKey!,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    if (!response.ok) {
      let friendlyError = 'LTA parking data is temporarily unavailable.';
      if (response.status === 401 || response.status === 403) {
        friendlyError = 'Parking data authentication is unavailable. Please check the LTA API configuration.';
      } else if (response.status === 429) {
        friendlyError = 'Too many requests. Please try again shortly.';
      } else if (response.status >= 500) {
        friendlyError = 'LTA parking data service is temporarily unavailable (Status: ' + response.status + ').';
      }

      apiDiagnosticStatus = {
        connected: false,
        isMock: false,
        lastSuccessfulRequest: apiDiagnosticStatus.lastSuccessfulRequest,
        recordsReceived: 0,
        lastError: friendlyError,
        accountKeyConfigured: true,
        latencyMs: latency
      };

      // If we have stale cache, return it with warning
      if (cachedState) {
        return {
          success: true,
          source: 'LTA',
          isMock: false,
          lastUpdated: new Date(cachedState.timestamp).toISOString(),
          count: cachedState.carparks.length,
          carparks: cachedState.carparks,
          error: `${friendlyError} Serving previously cached data.`,
          statusInfo: apiDiagnosticStatus
        };
      }

      // Fallback to mock if first load fails
      return {
        success: false,
        source: 'MOCK',
        isMock: true,
        lastUpdated: new Date().toISOString(),
        count: MOCK_SINGAPORE_CARPARKS.length,
        carparks: MOCK_SINGAPORE_CARPARKS,
        error: friendlyError,
        statusInfo: apiDiagnosticStatus
      };
    }

    const data: LtaApiResponse = await response.json();
    const rawList = data.value || [];
    const timestamp = new Date().toISOString();
    const normalized = normalizeLtaResponse(rawList, timestamp);

    apiDiagnosticStatus = {
      connected: true,
      isMock: false,
      lastSuccessfulRequest: timestamp,
      recordsReceived: normalized.length,
      lastError: null,
      accountKeyConfigured: true,
      latencyMs: latency
    };

    cachedState = {
      timestamp: now,
      carparks: normalized,
      status: apiDiagnosticStatus
    };

    return {
      success: true,
      source: 'LTA',
      isMock: false,
      lastUpdated: timestamp,
      count: normalized.length,
      carparks: normalized,
      statusInfo: apiDiagnosticStatus
    };

  } catch (err: any) {
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    const isTimeout = err.name === 'AbortError';
    const errorMsg = isTimeout
      ? 'LTA API request timed out after 8s.'
      : (err?.message || 'Network error communicating with LTA DataMall.');

    apiDiagnosticStatus = {
      connected: false,
      isMock: false,
      lastSuccessfulRequest: apiDiagnosticStatus.lastSuccessfulRequest,
      recordsReceived: 0,
      lastError: errorMsg,
      accountKeyConfigured: true,
      latencyMs: latency
    };

    if (cachedState) {
      return {
        success: true,
        source: 'LTA',
        isMock: false,
        lastUpdated: new Date(cachedState.timestamp).toISOString(),
        count: cachedState.carparks.length,
        carparks: cachedState.carparks,
        error: `${errorMsg} Showing cached data.`,
        statusInfo: apiDiagnosticStatus
      };
    }

    return {
      success: false,
      source: 'MOCK',
      isMock: true,
      lastUpdated: new Date().toISOString(),
      count: MOCK_SINGAPORE_CARPARKS.length,
      carparks: MOCK_SINGAPORE_CARPARKS,
      error: errorMsg,
      statusInfo: apiDiagnosticStatus
    };
  }
}
