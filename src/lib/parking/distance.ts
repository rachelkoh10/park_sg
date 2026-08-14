import { Coordinates } from '../../types/parking';

/**
 * Calculates the great-circle distance between two points on Earth using the Haversine formula.
 * Returns distance in meters.
 */
export function calculateHaversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371e3; // Earth radius in meters
  const lat1Rad = (coord1.latitude * Math.PI) / 180;
  const lat2Rad = (coord2.latitude * Math.PI) / 180;
  const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLng = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Estimates walking time in minutes based on ~80 meters/min (4.8 km/h).
 * Minimum 1 minute.
 */
export function estimateWalkingMinutes(distanceMeters: number): number {
  if (distanceMeters <= 50) return 1;
  return Math.max(1, Math.round(distanceMeters / 80));
}

/**
 * Estimates driving time in minutes in Singapore urban context (~30 km/h average with traffic).
 */
export function estimateDrivingMinutes(distanceMeters: number): number {
  if (distanceMeters <= 200) return 2;
  const km = distanceMeters / 1000;
  return Math.max(2, Math.round((km / 30) * 60 + 2)); // +2 mins for traffic lights/parking entrance
}

export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) {
    return `${distanceMeters} m`;
  }
  return `${(distanceMeters / 1000).toFixed(1)} km`;
}
