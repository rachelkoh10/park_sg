import { ParkingRate, PricingRule, VehicleType } from '../../types/parking';

export interface ParkingRateProvider {
  getRate(carParkId: string): Promise<ParkingRate | null>;
  getRateSync(carParkId: string, agency?: string): ParkingRate;
}

// Database of specific well-known Singapore commercial & mall carpark rates
const KNOWN_PARKING_RATES: Record<string, ParkingRate> = {
  'SUNTEC-01': {
    carParkId: 'SUNTEC-01',
    currency: 'SGD',
    weekday: [
      {
        timeWindow: '07:00 - 17:00',
        rateDescription: '$2.40 for 1st hr, $0.60 per subsequent 15 mins ($2.40/hr)',
        firstHourRate: 2.40,
        subsequentHalfHourRate: 1.20,
        gracePeriodMinutes: 10
      },
      {
        timeWindow: '17:00 - 07:00 (Next Day)',
        rateDescription: '$3.20 per entry (Flat rate)',
        flatRate: 3.20
      }
    ],
    weekend: [
      {
        timeWindow: '07:00 - 07:00 (Next Day)',
        rateDescription: '$2.60 for 1st 4 hrs, $0.60 per subsequent 15 mins',
        firstHourRate: 2.60,
        subsequentHalfHourRate: 1.20
      }
    ],
    publicHoliday: [
      {
        timeWindow: 'All Day',
        rateDescription: '$2.60 for 1st 4 hrs, $0.60 per subsequent 15 mins',
        firstHourRate: 2.60,
        subsequentHalfHourRate: 1.20
      }
    ],
    notes: 'Grace period: 10 minutes. EV chargers available at B1.'
  },
  'MARINA-SQ-01': {
    carParkId: 'MARINA-SQ-01',
    currency: 'SGD',
    weekday: [
      {
        timeWindow: '07:00 - 17:00',
        rateDescription: '$2.20 for 1st hr, $0.60 per subsequent 15 mins',
        firstHourRate: 2.20,
        subsequentHalfHourRate: 1.20
      },
      {
        timeWindow: '17:00 - 07:00',
        rateDescription: '$3.50 per entry (Flat rate)',
        flatRate: 3.50
      }
    ],
    weekend: [
      {
        timeWindow: 'All Day',
        rateDescription: '$2.40 for 1st 2 hrs, $0.60 per subsequent 15 mins',
        firstHourRate: 2.40,
        subsequentHalfHourRate: 1.20
      }
    ],
    notes: 'Direct underground link to Suntec City and Millenia Walk.'
  },
  'MBS-01': {
    carParkId: 'MBS-01',
    currency: 'SGD',
    weekday: [
      {
        timeWindow: '07:00 - 19:00',
        rateDescription: '$14.00 for 1st hr, $2.00 per subsequent 30 mins (Capped at $32/day)',
        firstHourRate: 14.00,
        subsequentHalfHourRate: 2.00
      },
      {
        timeWindow: '19:00 - 07:00',
        rateDescription: '$8.00 per entry flat',
        flatRate: 8.00
      }
    ],
    weekend: [
      {
        timeWindow: 'All Day',
        rateDescription: '$16.00 for 1st hr, $2.50 per subsequent 30 mins',
        firstHourRate: 16.00,
        subsequentHalfHourRate: 2.50
      }
    ],
    notes: 'Complimentary parking for Sands Rewards Prestige & Elite members with min spend.'
  },
  'VIVOCITY-01': {
    carParkId: 'VIVOCITY-01',
    currency: 'SGD',
    weekday: [
      {
        timeWindow: '07:00 - 18:00',
        rateDescription: '$1.80 for 1st hr, $0.60 per subsequent 15 mins',
        firstHourRate: 1.80,
        subsequentHalfHourRate: 1.20
      },
      {
        timeWindow: '18:00 - 07:00',
        rateDescription: '$4.00 per entry (Flat rate)',
        flatRate: 4.00
      }
    ],
    weekend: [
      {
        timeWindow: 'All Day',
        rateDescription: '$2.40 for 1st hr, $0.80 per subsequent 15 mins',
        firstHourRate: 2.40,
        subsequentHalfHourRate: 1.60
      }
    ],
    notes: 'Direct bridge to Sentosa Island. B1/B2/L2 parking zones.'
  },
  'ION-ORCHARD-01': {
    carParkId: 'ION-ORCHARD-01',
    currency: 'SGD',
    weekday: [
      {
        timeWindow: '08:00 - 17:00',
        rateDescription: '$3.20 for 1st hr, $1.50 per subsequent 30 mins',
        firstHourRate: 3.20,
        subsequentHalfHourRate: 1.50
      },
      {
        timeWindow: '17:00 - 08:00',
        rateDescription: '$4.50 per entry flat rate',
        flatRate: 4.50
      }
    ],
    weekend: [
      {
        timeWindow: 'All Day',
        rateDescription: '$4.00 for 1st hr, $1.80 per subsequent 30 mins',
        firstHourRate: 4.00,
        subsequentHalfHourRate: 1.80
      }
    ]
  },
  'BUGIS-JUNC-01': {
    carParkId: 'BUGIS-JUNC-01',
    currency: 'SGD',
    weekday: [
      {
        timeWindow: '08:00 - 17:59',
        rateDescription: '$2.00 for 1st hr, $0.60 per subsequent 15 mins',
        firstHourRate: 2.00,
        subsequentHalfHourRate: 1.20
      },
      {
        timeWindow: '18:00 - 07:59',
        rateDescription: '$3.50 per entry flat rate',
        flatRate: 3.50
      }
    ],
    weekend: [
      {
        timeWindow: 'All Day',
        rateDescription: '$2.50 for 1st 2 hrs, $0.60 per subsequent 15 mins',
        firstHourRate: 2.50,
        subsequentHalfHourRate: 1.20
      }
    ]
  }
};

export class MockParkingRateProvider implements ParkingRateProvider {
  async getRate(carParkId: string): Promise<ParkingRate | null> {
    return this.getRateSync(carParkId);
  }

  getRateSync(carParkId: string, agency: string = 'LTA'): ParkingRate {
    if (KNOWN_PARKING_RATES[carParkId]) {
      return KNOWN_PARKING_RATES[carParkId];
    }

    // Default rate rule based on Singapore Agency (HDB vs URA vs Commercial)
    if (agency === 'HDB') {
      return {
        carParkId,
        currency: 'SGD',
        weekday: [
          {
            timeWindow: '07:00 - 22:30',
            rateDescription: '$0.60 per 30 mins (Standard HDB Rate)',
            firstHourRate: 1.20,
            subsequentHalfHourRate: 0.60
          },
          {
            timeWindow: '22:30 - 07:00',
            rateDescription: '$0.60 per 30 mins (Max $5.00 night parking cap)',
            firstHourRate: 1.20,
            subsequentHalfHourRate: 0.60,
            flatRate: 5.00
          }
        ],
        weekend: [
          {
            timeWindow: 'All Day (Sunday Free Parking where signposted)',
            rateDescription: '$0.60 per 30 mins',
            firstHourRate: 1.20,
            subsequentHalfHourRate: 0.60
          }
        ],
        notes: 'HDB Electronic Parking System (EPS). Standard coupon/cashcard rate.'
      };
    }

    if (agency === 'URA') {
      return {
        carParkId,
        currency: 'SGD',
        weekday: [
          {
            timeWindow: '08:30 - 17:00',
            rateDescription: '$1.20 per 30 mins (Central Area URA rate)',
            firstHourRate: 2.40,
            subsequentHalfHourRate: 1.20
          },
          {
            timeWindow: '17:00 - 22:30',
            rateDescription: '$0.60 per 30 mins',
            firstHourRate: 1.20,
            subsequentHalfHourRate: 0.60
          }
        ],
        weekend: [
          {
            timeWindow: 'All Day',
            rateDescription: '$0.60 per 30 mins',
            firstHourRate: 1.20,
            subsequentHalfHourRate: 0.60
          }
        ],
        notes: 'URA Off-Street Parking.'
      };
    }

    // Default commercial mall rate
    return {
      carParkId,
      currency: 'SGD',
      weekday: [
        {
          timeWindow: '07:00 - 18:00',
          rateDescription: '$2.00 1st hr, $1.00 per subsequent 30 mins',
          firstHourRate: 2.00,
          subsequentHalfHourRate: 1.00
        },
        {
          timeWindow: '18:00 - 07:00',
          rateDescription: '$3.50 per entry flat',
          flatRate: 3.50
        }
      ],
      weekend: [
        {
          timeWindow: 'All Day',
          rateDescription: '$2.50 1st hr, $1.20 per subsequent 30 mins',
          firstHourRate: 2.50,
          subsequentHalfHourRate: 1.20
        }
      ],
      notes: 'Estimated commercial standard tariff.'
    };
  }
}

export const defaultParkingRateProvider = new MockParkingRateProvider();

/**
 * Calculates estimated parking cost for a given duration, vehicle type, and target time.
 */
export function estimateParkingCost(
  carParkId: string,
  durationHours: number,
  vehicleType: VehicleType = 'car',
  agency: string = 'LTA',
  targetDate: Date = new Date()
): { cost: number; breakdown: string; rateInfo: ParkingRate } {
  // Motorcycle rates are standard flat or heavily discounted in SG
  if (vehicleType === 'motorcycle') {
    if (agency === 'HDB' || agency === 'URA') {
      const motoRate = 0.65; // HDB standard per session
      return {
        cost: motoRate,
        breakdown: 'S$0.65 per session (HDB/URA standard motorcycle rate)',
        rateInfo: defaultParkingRateProvider.getRateSync(carParkId, agency)
      };
    }
    const cost = Math.min(2.50, 1.20 + (durationHours > 2 ? 1.00 : 0));
    return {
      cost,
      breakdown: `S$${cost.toFixed(2)} (Motorcycle concession tariff)`,
      rateInfo: defaultParkingRateProvider.getRateSync(carParkId, agency)
    };
  }

  // Heavy vehicle rates
  if (vehicleType === 'heavy') {
    const hourly = 4.00;
    const cost = Math.round(durationHours * hourly * 100) / 100;
    return {
      cost,
      breakdown: `S$${cost.toFixed(2)} (~S$4.00/hr Heavy vehicle rate)`,
      rateInfo: defaultParkingRateProvider.getRateSync(carParkId, agency)
    };
  }

  const rateInfo = defaultParkingRateProvider.getRateSync(carParkId, agency);
  const day = targetDate.getDay();
  const isWeekend = day === 0 || day === 6; // Sunday or Saturday
  const hour = targetDate.getHours();
  const isEvening = hour >= 18 || hour < 7;

  let rule: PricingRule | undefined;

  if (isWeekend && rateInfo.weekend && rateInfo.weekend.length > 0) {
    rule = rateInfo.weekend[0];
  } else if (isEvening && rateInfo.evening && rateInfo.evening.length > 0) {
    rule = rateInfo.evening[0];
  } else if (rateInfo.weekday && rateInfo.weekday.length > 0) {
    // Check if evening rule exists in weekday
    if (isEvening && rateInfo.weekday.length > 1) {
      rule = rateInfo.weekday[1];
    } else {
      rule = rateInfo.weekday[0];
    }
  }

  if (!rule) {
    // Fallback baseline calculation ($2/hr)
    const cost = Math.max(1.20, Math.round(durationHours * 2.00 * 10) / 10);
    return {
      cost,
      breakdown: `S$${cost.toFixed(2)} (Estimated ~S$2.00/hr)`,
      rateInfo
    };
  }

  // If flat rate applies (e.g. evening per-entry)
  if (rule.flatRate && (isEvening || durationHours >= 3)) {
    return {
      cost: rule.flatRate,
      breakdown: `S$${rule.flatRate.toFixed(2)} (Flat per-entry rate)`,
      rateInfo
    };
  }

  // Calculated hourly / sub-hourly
  const firstHr = rule.firstHourRate ?? 2.00;
  const subHalfHr = rule.subsequentHalfHourRate ?? 1.00;

  let total = 0;
  if (durationHours <= 0.5) {
    total = firstHr * 0.6; // half hr discount
  } else if (durationHours <= 1.0) {
    total = firstHr;
  } else {
    const remainingHours = durationHours - 1.0;
    const additionalHalfHours = Math.ceil(remainingHours * 2);
    total = firstHr + additionalHalfHours * subHalfHr;
  }

  const cost = Math.round(total * 100) / 100;
  return {
    cost,
    breakdown: `S$${cost.toFixed(2)} (${durationHours}h @ ${rule.rateDescription})`,
    rateInfo
  };
}
