export type LotType = 'C' | 'H' | 'Y' | 'UNKNOWN';
export type Agency = 'HDB' | 'LTA' | 'URA' | 'UNKNOWN';
export type AvailabilityStatus = 'FULL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
export type ParkingPriority = 'best_overall' | 'cheapest' | 'closest' | 'most_available';
export type VehicleType = 'car' | 'motorcycle' | 'heavy';
export type DurationOption = 0.5 | 1 | 2 | 3 | 4 | 6 | 8;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RawLtaCarparkRecord {
  CarParkID: string;
  Area?: string;
  Development: string;
  Location: string; // e.g. "1.29375 103.85718"
  AvailableLots: string | number;
  LotType: string; // "C", "H", "Y"
  Agency: string; // "HDB", "LTA", "URA"
}

export interface LtaApiResponse {
  "odata.metadata"?: string;
  value?: RawLtaCarparkRecord[];
}

export interface ParkingAvailability {
  carParkId: string;
  area: string | null;
  development: string;
  latitude: number;
  longitude: number;
  availableLots: number;
  lotType: LotType;
  agency: Agency;
  source: 'LTA';
  lastUpdated: string;
  totalLotsEstimate?: number;
  address?: string;
}

export interface PricingRule {
  timeWindow: string; // e.g. "07:00 - 17:00"
  rateDescription: string; // e.g. "$1.20 per 30 mins"
  firstHourRate?: number;
  subsequentHalfHourRate?: number;
  perMinuteRate?: number;
  flatRate?: number;
  gracePeriodMinutes?: number;
}

export interface ParkingRate {
  carParkId: string;
  currency: 'SGD';
  weekday?: PricingRule[];
  weekend?: PricingRule[];
  publicHoliday?: PricingRule[];
  evening?: PricingRule[];
  notes?: string;
}

export interface RankedCarpark extends ParkingAvailability {
  distanceMeters: number;
  walkingMinutes: number;
  drivingMinutes: number;
  estimatedCost: number;
  costBreakdown: string;
  overallScore: number;
  rankBadge?: 'BEST OVERALL' | 'CHEAPEST' | 'CLOSEST' | 'MOST AVAILABLE';
  whyRecommended: string;
  pricingRate?: ParkingRate;
}

export interface Destination {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category?: 'shopping' | 'business' | 'attraction' | 'transit' | 'residential';
}

export interface SavedDestination {
  id: string;
  label: 'Home' | 'Work' | 'Office' | 'Favorite' | 'Custom';
  customName?: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface UserPreferences {
  vehicleType: VehicleType;
  parkingPriority: ParkingPriority;
  durationHours: DurationOption;
  searchRadiusKm: number;
  savedCarparkIds: string[];
  savedDestinations: SavedDestination[];
  recentSearches: Destination[];
}

export interface FoodDeal {
  id: string;
  carParkId?: string;
  latitude: number;
  longitude: number;
  name: string;
  category: string;
  distanceMeters: number;
  rating: number;
  reviewCount: number;
  openingStatus: string;
  promotionTitle: string;
  promotionDescription: string;
  isSponsored: boolean;
  image?: string;
  badge?: string;
}

export interface LtaApiStatus {
  connected: boolean;
  isMock: boolean;
  lastSuccessfulRequest: string | null;
  recordsReceived: number;
  lastError: string | null;
  accountKeyConfigured: boolean;
  latencyMs: number;
}
