/**
 * Unit Tests for Singapore Smart Parking decision engine
 * Covers LTA parsing, pricing, ranking, and distance estimation
 */

import { parseLtaCoordinates, normalizeLotType, normalizeAgency } from '../lta/normalize';
import { calculateHaversineDistance, estimateWalkingMinutes, estimateDrivingMinutes } from '../parking/distance';
import { estimateParkingCost, defaultParkingRateProvider } from '../parking/pricing';
import { rankCarparks, DEFAULT_RANKING_WEIGHTS } from '../parking/ranking';
import { MOCK_SINGAPORE_CARPARKS, POPULAR_SINGAPORE_DESTINATIONS } from '../../data/mockCarparks';

export function runAllUnitTests(): { passed: number; failed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      results.push(`PASS: ${testName}`);
    } else {
      failed++;
      results.push(`FAIL: ${testName}`);
      console.error(`Test failed: ${testName}`);
    }
  }

  // 1. LTA Coordinate Parsing Tests
  const normalCoords = parseLtaCoordinates('1.29375 103.85718');
  assert(normalCoords.isValid && Math.abs(normalCoords.latitude - 1.29375) < 0.0001, 'Parse valid space-separated coordinates');

  const commaCoords = parseLtaCoordinates('1.29375, 103.85718');
  assert(commaCoords.isValid && Math.abs(commaCoords.longitude - 103.85718) < 0.0001, 'Parse comma-separated coordinates');

  const malformedCoords = parseLtaCoordinates('invalid_string');
  assert(!malformedCoords.isValid, 'Handle malformed coordinate string gracefully');

  const outOfBoundsCoords = parseLtaCoordinates('45.123 10.456'); // Outside Singapore
  assert(!outOfBoundsCoords.isValid, 'Reject out-of-bounds geographic coordinates');

  // 2. Normalization Tests
  assert(normalizeLotType('C') === 'C', 'Normalize Car lot type');
  assert(normalizeLotType('Y') === 'Y', 'Normalize Motorcycle lot type');
  assert(normalizeLotType('H') === 'H', 'Normalize Heavy lot type');
  assert(normalizeAgency('hdb') === 'HDB', 'Normalize lowercase agency name');
  assert(normalizeAgency('LTA') === 'LTA', 'Normalize LTA agency');

  // 3. Distance & Walking Time Tests
  const suntecCoord = { latitude: 1.29348, longitude: 103.85765 };
  const marinaSqCoord = { latitude: 1.29124, longitude: 103.85792 };
  const dist = calculateHaversineDistance(suntecCoord, marinaSqCoord);
  assert(dist > 200 && dist < 400, 'Haversine distance between Suntec & Marina Square is ~250m');

  const walkMin = estimateWalkingMinutes(400);
  assert(walkMin === 5, '400m walking distance translates to 5 minutes');

  // 4. Pricing Engine Tests
  const suntec1h = estimateParkingCost('SUNTEC-01', 1, 'car', 'LTA');
  assert(suntec1h.cost === 2.40, 'Suntec 1 hour parking is S$2.40');

  const suntec2h = estimateParkingCost('SUNTEC-01', 2, 'car', 'LTA');
  assert(suntec2h.cost === 4.80, 'Suntec 2 hours parking is S$4.80');

  const hdbRate = defaultParkingRateProvider.getRateSync('HDB-01', 'HDB');
  assert(hdbRate.weekday?.[0].firstHourRate === 1.20, 'HDB standard hourly rate is S$1.20/hr ($0.60 per 30m)');

  const motoCost = estimateParkingCost('SUNTEC-01', 2, 'motorcycle', 'LTA');
  assert(motoCost.cost <= 2.50, 'Motorcycle rate is capped affordably');

  // 5. Recommendation Engine Ranking Tests
  const ranked = rankCarparks(
    MOCK_SINGAPORE_CARPARKS,
    suntecCoord,
    null,
    {
      vehicleType: 'car',
      parkingPriority: 'best_overall',
      durationHours: 2,
      searchRadiusKm: 1,
      savedCarparkIds: [],
      savedDestinations: [],
      recentSearches: []
    },
    DEFAULT_RANKING_WEIGHTS
  );

  assert(ranked.length > 0, 'Recommendation engine returns ranked carparks');
  assert(ranked[0].rankBadge === 'BEST OVERALL', 'Top candidate receives BEST OVERALL badge');
  assert(ranked[0].whyRecommended.length > 10, 'Generates explanatory whyRecommended reasoning');

  return { passed, failed, results };
}
