import { RawLtaCarparkRecord, ParkingAvailability, LotType, Agency } from '../../types/parking';

export interface ParseCoordinateResult {
  latitude: number;
  longitude: number;
  isValid: boolean;
}

/**
 * Parses raw Location string from LTA API (e.g., "1.29375 103.85718" or "1.29375, 103.85718")
 * Singapore bounding box roughly: Lat 1.15 to 1.48, Lng 103.60 to 104.05
 */
export function parseLtaCoordinates(locationStr?: string): ParseCoordinateResult {
  if (!locationStr || typeof locationStr !== 'string') {
    return { latitude: 0, longitude: 0, isValid: false };
  }

  const clean = locationStr.trim().replace(/,/g, ' ');
  const parts = clean.split(/\s+/).map(p => parseFloat(p)).filter(n => !isNaN(n));

  if (parts.length < 2) {
    return { latitude: 0, longitude: 0, isValid: false };
  }

  const lat = parts[0];
  const lng = parts[1];

  // Verify coordinates fall within Singapore / surrounding regional bounds
  const isValidLat = lat >= 1.15 && lat <= 1.50;
  const isValidLng = lng >= 103.50 && lng <= 104.15;

  if (isValidLat && isValidLng) {
    return { latitude: lat, longitude: lng, isValid: true };
  }

  // Sometimes coords may be inverted (e.g., lng lat)
  if (lat >= 103.50 && lat <= 104.15 && lng >= 1.15 && lng <= 1.50) {
    return { latitude: lng, longitude: lat, isValid: true };
  }

  return { latitude: lat, longitude: lng, isValid: false };
}

export function normalizeLotType(typeStr?: string): LotType {
  if (!typeStr) return 'C';
  const upper = typeStr.trim().toUpperCase();
  if (upper === 'C') return 'C'; // Cars
  if (upper === 'H') return 'H'; // Heavy
  if (upper === 'Y') return 'Y'; // Motorcycles / Motorbikes
  return 'UNKNOWN';
}

export function normalizeAgency(agencyStr?: string): Agency {
  if (!agencyStr) return 'UNKNOWN';
  const upper = agencyStr.trim().toUpperCase();
  if (upper === 'HDB') return 'HDB';
  if (upper === 'LTA') return 'LTA';
  if (upper === 'URA') return 'URA';
  return 'UNKNOWN';
}

export function normalizeLtaRecord(
  raw: RawLtaCarparkRecord,
  timestamp: string = new Date().toISOString()
): ParkingAvailability | null {
  if (!raw || !raw.CarParkID) {
    return null;
  }

  const coords = parseLtaCoordinates(raw.Location);
  if (!coords.isValid) {
    console.warn(`[LTA Normalizer] Invalid coordinates for CarParkID: ${raw.CarParkID}, Location: "${raw.Location}"`);
    return null;
  }

  const availableLots = typeof raw.AvailableLots === 'number'
    ? Math.max(0, Math.floor(raw.AvailableLots))
    : Math.max(0, parseInt(raw.AvailableLots || '0', 10) || 0);

  return {
    carParkId: String(raw.CarParkID),
    area: raw.Area ? raw.Area.trim() : null,
    development: raw.Development ? raw.Development.trim() : `Carpark ${raw.CarParkID}`,
    latitude: coords.latitude,
    longitude: coords.longitude,
    availableLots,
    lotType: normalizeLotType(raw.LotType),
    agency: normalizeAgency(raw.Agency),
    source: 'LTA',
    lastUpdated: timestamp,
    totalLotsEstimate: availableLots > 0 ? Math.max(availableLots * 2, 100) : 150
  };
}

export function normalizeLtaResponse(
  rawList: RawLtaCarparkRecord[],
  timestamp: string = new Date().toISOString()
): ParkingAvailability[] {
  if (!Array.isArray(rawList)) return [];

  const normalized: ParkingAvailability[] = [];
  for (const item of rawList) {
    const valid = normalizeLtaRecord(item, timestamp);
    if (valid) {
      normalized.push(valid);
    }
  }
  return normalized;
}
