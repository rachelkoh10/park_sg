import {
  ParkingAvailability,
  RankedCarpark,
  Coordinates,
  UserPreferences,
  AvailabilityStatus,
  ParkingPriority
} from '../../types/parking';
import { calculateHaversineDistance, estimateWalkingMinutes, estimateDrivingMinutes } from './distance';
import { estimateParkingCost } from './pricing';

export interface RankingWeights {
  availability: number; // default 0.35
  price: number;        // default 0.25
  walking: number;      // default 0.25
  driving: number;      // default 0.15
}

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  availability: 0.35,
  price: 0.25,
  walking: 0.25,
  driving: 0.15
};

export function getAvailabilityStatus(availableLots: number): AvailabilityStatus {
  if (availableLots <= 0) return 'FULL';
  if (availableLots <= 10) return 'LOW';
  if (availableLots <= 50) return 'MEDIUM';
  return 'HIGH';
}

export function rankCarparks(
  carparks: ParkingAvailability[],
  destination: Coordinates,
  userLocation: Coordinates | null,
  preferences: UserPreferences,
  weights: RankingWeights = DEFAULT_RANKING_WEIGHTS
): RankedCarpark[] {
  if (!carparks || carparks.length === 0) return [];

  // Filter by matching lot type if vehicle is motorcycle / heavy
  const targetLotType = preferences.vehicleType === 'motorcycle'
    ? 'Y'
    : preferences.vehicleType === 'heavy'
    ? 'H'
    : 'C';

  // Filter carparks that match target vehicle type or fallback to general
  const filteredByType = carparks.filter(cp => {
    if (targetLotType === 'Y') return cp.lotType === 'Y' || cp.lotType === 'C';
    if (targetLotType === 'H') return cp.lotType === 'H';
    return cp.lotType === 'C' || cp.lotType === 'UNKNOWN';
  });

  const targetList = filteredByType.length > 0 ? filteredByType : carparks;

  // Calculate distance, walking, price for each
  const evaluated = targetList.map((cp) => {
    const cpCoord: Coordinates = { latitude: cp.latitude, longitude: cp.longitude };
    const distanceMeters = calculateHaversineDistance(destination, cpCoord);
    const walkingMinutes = estimateWalkingMinutes(distanceMeters);

    // Driving distance from user location or destination
    const startCoord = userLocation || destination;
    const drivingDistanceMeters = calculateHaversineDistance(startCoord, cpCoord);
    const drivingMinutes = estimateDrivingMinutes(drivingDistanceMeters);

    const pricing = estimateParkingCost(
      cp.carParkId,
      preferences.durationHours,
      preferences.vehicleType,
      cp.agency
    );

    return {
      ...cp,
      distanceMeters,
      walkingMinutes,
      drivingMinutes,
      estimatedCost: pricing.cost,
      costBreakdown: pricing.breakdown,
      pricingRate: pricing.rateInfo,
      overallScore: 0,
      whyRecommended: ''
    };
  });

  // Filter within radius (or auto expand if few found)
  const maxDistance = preferences.searchRadiusKm * 1000;
  let withinRadius = evaluated.filter(e => e.distanceMeters <= maxDistance);
  if (withinRadius.length === 0) {
    // Auto-expand to 2.5x radius
    withinRadius = evaluated.filter(e => e.distanceMeters <= maxDistance * 2.5);
  }
  if (withinRadius.length === 0) {
    withinRadius = evaluated.slice(0, 5);
  }

  // Find min/max for normalization
  const maxLots = Math.max(...withinRadius.map(c => c.availableLots), 1);
  const maxCost = Math.max(...withinRadius.map(c => c.estimatedCost), 1);
  const minCost = Math.min(...withinRadius.map(c => c.estimatedCost));
  const maxDist = Math.max(...withinRadius.map(c => c.distanceMeters), 1);
  const minDist = Math.min(...withinRadius.map(c => c.distanceMeters));

  // Compute normalized scores (0 to 100)
  withinRadius.forEach((cp) => {
    // Availability Score: 0 if 0 lots, logarithmic/linear scale to 100
    const availScore = cp.availableLots === 0
      ? 0
      : Math.min(100, Math.round((Math.log10(cp.availableLots + 1) / Math.log10(Math.max(50, maxLots) + 1)) * 100));

    // Price Score: Lower is better (100 for cheapest, 0 for most expensive)
    const costRange = maxCost - minCost;
    const priceScore = costRange === 0 ? 90 : Math.round(100 - ((cp.estimatedCost - minCost) / costRange) * 80);

    // Walking Score: Closer distance = higher score
    const distRange = maxDist - minDist;
    const walkingScore = distRange === 0 ? 95 : Math.round(100 - ((cp.distanceMeters - minDist) / distRange) * 80);

    // Driving Score
    const drivingScore = Math.max(20, 100 - cp.drivingMinutes * 5);

    // Overall weighted score
    let overall = (
      availScore * weights.availability +
      priceScore * weights.price +
      walkingScore * weights.walking +
      drivingScore * weights.driving
    );

    // Penalty for full or nearly full carparks
    if (cp.availableLots === 0) {
      overall *= 0.15;
    } else if (cp.availableLots <= 5) {
      overall *= 0.60;
    }

    cp.overallScore = Math.round(overall);
  });

  // Sort based on chosen user priority
  const sorted = [...withinRadius].sort((a, b) => {
    if (preferences.parkingPriority === 'cheapest') {
      if (a.availableLots === 0 && b.availableLots > 0) return 1;
      if (b.availableLots === 0 && a.availableLots > 0) return -1;
      return a.estimatedCost - b.estimatedCost || b.overallScore - a.overallScore;
    }
    if (preferences.parkingPriority === 'closest') {
      if (a.availableLots === 0 && b.availableLots > 0) return 1;
      if (b.availableLots === 0 && a.availableLots > 0) return -1;
      return a.distanceMeters - b.distanceMeters || b.overallScore - a.overallScore;
    }
    if (preferences.parkingPriority === 'most_available') {
      return b.availableLots - a.availableLots || a.distanceMeters - b.distanceMeters;
    }
    // Default 'best_overall'
    return b.overallScore - a.overallScore;
  });

  // Identify distinct badge champions among non-full lots
  const availableOptions = sorted.filter(c => c.availableLots > 0);

  let bestOverallId: string | null = availableOptions.length > 0 ? availableOptions[0].carParkId : (sorted[0]?.carParkId ?? null);

  let cheapestId: string | null = null;
  let closestId: string | null = null;
  let mostAvailableId: string | null = null;

  if (availableOptions.length > 0) {
    const cheapestCandidate = [...availableOptions].sort((a, b) => a.estimatedCost - b.estimatedCost)[0];
    cheapestId = cheapestCandidate.carParkId;

    const closestCandidate = [...availableOptions].sort((a, b) => a.distanceMeters - b.distanceMeters)[0];
    closestId = closestCandidate.carParkId;

    const mostAvailCandidate = [...availableOptions].sort((a, b) => b.availableLots - a.availableLots)[0];
    mostAvailableId = mostAvailCandidate.carParkId;
  }

  // Assign Badges & Contextual "Why Recommended" Explanations
  return sorted.map((cp, idx) => {
    let rankBadge: RankedCarpark['rankBadge'] = undefined;

    if (cp.carParkId === bestOverallId) {
      rankBadge = 'BEST OVERALL';
    } else if (cp.carParkId === cheapestId && cheapestId !== bestOverallId) {
      rankBadge = 'CHEAPEST';
    } else if (cp.carParkId === closestId && closestId !== bestOverallId) {
      rankBadge = 'CLOSEST';
    } else if (cp.carParkId === mostAvailableId && mostAvailableId !== bestOverallId) {
      rankBadge = 'MOST AVAILABLE';
    }

    // Generate human-friendly reasoning
    let why = '';
    if (cp.availableLots === 0) {
      why = 'Carpark is currently reported full. Check alternative nearby options.';
    } else if (rankBadge === 'BEST OVERALL') {
      why = `Strong real-time availability (${cp.availableLots} lots), short ${cp.walkingMinutes} min walk, and reasonable estimated rate of S$${cp.estimatedCost.toFixed(2)}.`;
    } else if (rankBadge === 'CHEAPEST') {
      why = `Lowest estimated parking cost at S$${cp.estimatedCost.toFixed(2)} with ${cp.availableLots} lots available.`;
    } else if (rankBadge === 'CLOSEST') {
      why = `Closest option to destination (${cp.distanceMeters}m, ~${cp.walkingMinutes} min walk) with ${cp.availableLots} lots ready.`;
    } else if (rankBadge === 'MOST AVAILABLE') {
      why = `Maximum parking capacity with ${cp.availableLots} lots available right now.`;
    } else if (cp.availableLots > 50) {
      why = `High availability (${cp.availableLots} lots) and convenient ${cp.walkingMinutes} min walking distance.`;
    } else {
      why = `Within ${cp.distanceMeters}m of destination, estimated S$${cp.estimatedCost.toFixed(2)} for ${preferences.durationHours}h.`;
    }

    return {
      ...cp,
      rankBadge,
      whyRecommended: why
    };
  });
}
