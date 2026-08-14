import { Destination } from '../../types/parking';
import { POPULAR_SINGAPORE_DESTINATIONS } from '../../data/mockCarparks';

/**
 * Singapore Postal Sector Map (First 2 digits of 6-digit postal code)
 * Coordinates represent geographical centroid for each postal sector.
 */
export const SINGAPORE_POSTAL_SECTORS: Record<string, { district: string; area: string; lat: number; lng: number }> = {
  '01': { district: 'D01', area: 'Raffles Place / Marina Bay', lat: 1.2843, lng: 103.8510 },
  '02': { district: 'D01', area: 'Cecil / Marina South', lat: 1.2785, lng: 103.8525 },
  '03': { district: 'D01', area: 'Suntec / Marina Centre', lat: 1.2935, lng: 103.8577 },
  '04': { district: 'D01', area: 'Raffles Place / Financial District', lat: 1.2830, lng: 103.8505 },
  '05': { district: 'D01', area: 'Chinatown / People\'s Park', lat: 1.2848, lng: 103.8438 },
  '06': { district: 'D01', area: 'Shenton Way / Robinson Rd', lat: 1.2778, lng: 103.8495 },
  '07': { district: 'D02', area: 'Anson / Tanjong Pagar', lat: 1.2755, lng: 103.8440 },
  '08': { district: 'D02', area: 'Tanjong Pagar / Chinatown', lat: 1.2790, lng: 103.8420 },
  '09': { district: 'D04', area: 'Telok Blangah / Harbourfront', lat: 1.2650, lng: 103.8210 },
  '10': { district: 'D04', area: 'Keppel / Sentosa Gateway', lat: 1.2642, lng: 103.8223 },
  '11': { district: 'D05', area: 'Pasir Panjang / Alexandra', lat: 1.2780, lng: 103.7950 },
  '12': { district: 'D05', area: 'Clementi / West Coast', lat: 1.3150, lng: 103.7650 },
  '13': { district: 'D05', area: 'Buona Vista / Dover', lat: 1.3060, lng: 103.7900 },
  '14': { district: 'D03', area: 'Queenstown / Commonwealth', lat: 1.2942, lng: 103.8060 },
  '15': { district: 'D03', area: 'Redhill / Alexandra', lat: 1.2890, lng: 103.8170 },
  '16': { district: 'D03', area: 'Tiong Bahru / Havelock', lat: 1.2865, lng: 103.8280 },
  '17': { district: 'D06', area: 'City Hall / High Street / Clarke Quay', lat: 1.2910, lng: 103.8500 },
  '18': { district: 'D07', area: 'Bugis / Middle Road / Bras Basah', lat: 1.2995, lng: 103.8553 },
  '19': { district: 'D07', area: 'Beach Road / Golden Mile / Kampong Glam', lat: 1.3020, lng: 103.8610 },
  '20': { district: 'D08', area: 'Little India / Jalan Besar', lat: 1.3080, lng: 103.8540 },
  '21': { district: 'D08', area: 'Farrer Park / Serangoon Road', lat: 1.3120, lng: 103.8530 },
  '22': { district: 'D09', area: 'Orchard / Somerset / Cairnhill', lat: 1.3020, lng: 103.8360 },
  '23': { district: 'D09', area: 'ION Orchard / River Valley / Killiney', lat: 1.3040, lng: 103.8318 },
  '24': { district: 'D10', area: 'Tanglin / Napier Road', lat: 1.3060, lng: 103.8200 },
  '25': { district: 'D10', area: 'Bukit Timah / Botanic Gardens', lat: 1.3180, lng: 103.8160 },
  '26': { district: 'D10', area: 'Holland Road / Coronation', lat: 1.3120, lng: 103.8010 },
  '27': { district: 'D10', area: 'Holland Village / Sixth Avenue', lat: 1.3110, lng: 103.7930 },
  '28': { district: 'D11', area: 'Watten Estate / Dunearn Rd', lat: 1.3260, lng: 103.8090 },
  '29': { district: 'D11', area: 'Novena / Chancery / Mount Rosie', lat: 1.3180, lng: 103.8380 },
  '30': { district: 'D11', area: 'Novena / Thomson Road', lat: 1.3204, lng: 103.8438 },
  '31': { district: 'D12', area: 'Toa Payoh Central / Lorong 1-8', lat: 1.3340, lng: 103.8500 },
  '32': { district: 'D12', area: 'Balestier / Whampoa', lat: 1.3240, lng: 103.8520 },
  '33': { district: 'D12', area: 'Kallang Bahru / Boon Keng', lat: 1.3160, lng: 103.8650 },
  '34': { district: 'D13', area: 'MacPherson / Circuit Road', lat: 1.3260, lng: 103.8820 },
  '35': { district: 'D13', area: 'Potong Pasir / Bidadari', lat: 1.3320, lng: 103.8690 },
  '36': { district: 'D13', area: 'Joo Seng / Upper Paya Lebar', lat: 1.3360, lng: 103.8810 },
  '37': { district: 'D13', area: 'Aljunied / Mattar', lat: 1.3220, lng: 103.8830 },
  '38': { district: 'D14', area: 'Geylang / Guillemard', lat: 1.3140, lng: 103.8860 },
  '39': { district: 'D14', area: 'Paya Lebar / Eunos', lat: 1.3190, lng: 103.8980 },
  '40': { district: 'D14', area: 'Paya Lebar Quarter / Ubi', lat: 1.3175, lng: 103.8924 },
  '41': { district: 'D14', area: 'Kaki Bukit / Bedok Reservoir Rd', lat: 1.3350, lng: 103.9080 },
  '42': { district: 'D15', area: 'Katong / Tanjong Katong', lat: 1.3050, lng: 103.8990 },
  '43': { district: 'D15', area: 'Marine Parade / Parkway Parade', lat: 1.3020, lng: 103.9050 },
  '44': { district: 'D15', area: 'Siglap / East Coast Road', lat: 1.3110, lng: 103.9240 },
  '45': { district: 'D15', area: 'Telok Kurau / Frankel', lat: 1.3160, lng: 103.9130 },
  '46': { district: 'D16', area: 'Bedok Central / Chai Chee', lat: 1.3240, lng: 103.9300 },
  '47': { district: 'D16', area: 'Bedok South / Bayshore', lat: 1.3180, lng: 103.9400 },
  '48': { district: 'D16', area: 'Upper East Coast / Sungei Bedok', lat: 1.3190, lng: 103.9550 },
  '49': { district: 'D17', area: 'Loyang / Changi Village', lat: 1.3650, lng: 103.9750 },
  '50': { district: 'D17', area: 'Flora / Upper Changi', lat: 1.3550, lng: 103.9650 },
  '51': { district: 'D18', area: 'Pasir Ris Central / Downtown East', lat: 1.3720, lng: 103.9490 },
  '52': { district: 'D18', area: 'Tampines Central / Our Tampines Hub', lat: 1.3532, lng: 103.9405 },
  '53': { district: 'D19', area: 'Serangoon / Hougang South', lat: 1.3510, lng: 103.8740 },
  '54': { district: 'D19', area: 'Sengkang Central / Compass One', lat: 1.3910, lng: 103.8950 },
  '55': { district: 'D19', area: 'Serangoon Gardens / NEX Mall', lat: 1.3505, lng: 103.8725 },
  '56': { district: 'D20', area: 'Ang Mo Kio / AMK Hub', lat: 1.3690, lng: 103.8485 },
  '57': { district: 'D20', area: 'Bishan / Junction 8', lat: 1.3510, lng: 103.8485 },
  '58': { district: 'D21', area: 'Upper Bukit Timah / Beauty World', lat: 1.3410, lng: 103.7760 },
  '59': { district: 'D21', area: 'Clementi Park / Ulu Pandan', lat: 1.3320, lng: 103.7710 },
  '60': { district: 'D22', area: 'Jurong Gateway / JEM / Westgate', lat: 1.3344, lng: 103.7431 },
  '61': { district: 'D22', area: 'Jurong West / Boon Lay / Jurong Point', lat: 1.3400, lng: 103.7060 },
  '62': { district: 'D22', area: 'Pioneer / Tuas Commercial', lat: 1.3280, lng: 103.6870 },
  '63': { district: 'D22', area: 'Tuas Industrial Estate', lat: 1.3180, lng: 103.6450 },
  '64': { district: 'D22', area: 'Jurong Island / Western Water', lat: 1.2750, lng: 103.7120 },
  '65': { district: 'D23', area: 'Hillview / Bukit Batok Central', lat: 1.3590, lng: 103.7640 },
  '66': { district: 'D23', area: 'Bukit Gombak / Guilin', lat: 1.3580, lng: 103.7520 },
  '67': { district: 'D23', area: 'Bukit Panjang / Hillion Mall', lat: 1.3780, lng: 103.7620 },
  '68': { district: 'D23', area: 'Choa Chu Kang / Lot One', lat: 1.3850, lng: 103.7440 },
  '69': { district: 'D24', area: 'Tengah New Town / Plantation', lat: 1.3650, lng: 103.7280 },
  '70': { district: 'D24', area: 'Lim Chu Kang / Sungei Buloh', lat: 1.4150, lng: 103.7150 },
  '71': { district: 'D24', area: 'Western Catchment / Murai', lat: 1.3850, lng: 103.6900 },
  '72': { district: 'D25', area: 'Kranji / Turf Club Area', lat: 1.4250, lng: 103.7620 },
  '73': { district: 'D25', area: 'Woodlands Central / Causeway Point', lat: 1.4360, lng: 103.7860 },
  '75': { district: 'D27', area: 'Sembawang / Sun Plaza', lat: 1.4480, lng: 103.8200 },
  '76': { district: 'D27', area: 'Yishun / Northpoint City', lat: 1.4290, lng: 103.8360 },
  '77': { district: 'D26', area: 'Upper Thomson / Springleaf', lat: 1.3980, lng: 103.8180 },
  '78': { district: 'D26', area: 'Mandai / Singapore Zoo', lat: 1.4040, lng: 103.7930 },
  '79': { district: 'D28', area: 'Seletar Aerospace Park / The Oval', lat: 1.4160, lng: 103.8680 },
  '80': { district: 'D28', area: 'Yio Chu Kang / Seletar Hills', lat: 1.3880, lng: 103.8720 },
  '81': { district: 'D17', area: 'Jewel Changi / Singapore Changi Airport', lat: 1.3602, lng: 103.9897 },
  '82': { district: 'D19', area: 'Punggol / Waterway Point', lat: 1.4060, lng: 103.9020 }
};

/**
 * Known landmark database with explicit 6-digit postal codes
 */
export const EXTENDED_POSTAL_LANDMARKS: Destination[] = [
  ...POPULAR_SINGAPORE_DESTINATIONS,
  {
    id: 'orchard-takashimaya',
    name: 'Takashimaya / Ngee Ann City',
    address: '391 Orchard Rd, Singapore 238873',
    postalCode: '238873',
    latitude: 1.3025,
    longitude: 103.8347,
    category: 'shopping'
  },
  {
    id: 'orchard-somerset-313',
    name: '313@somerset',
    address: '313 Orchard Rd, Singapore 238895',
    postalCode: '238895',
    latitude: 1.3010,
    longitude: 103.8385,
    category: 'shopping'
  },
  {
    id: 'suntec-city-038983',
    name: 'Suntec City Mall',
    address: '3 Temasek Blvd, Singapore 038983',
    postalCode: '038983',
    latitude: 1.29348,
    longitude: 103.85765,
    category: 'shopping'
  },
  {
    id: 'marina-square-039594',
    name: 'Marina Square',
    address: '6 Raffles Blvd, Singapore 039594',
    postalCode: '039594',
    latitude: 1.29124,
    longitude: 103.85792,
    category: 'shopping'
  },
  {
    id: 'marina-bay-sands-018956',
    name: 'Marina Bay Sands',
    address: '10 Bayfront Ave, Singapore 018956',
    postalCode: '018956',
    latitude: 1.2838,
    longitude: 103.8591,
    category: 'attraction'
  },
  {
    id: 'gardens-by-the-bay-018953',
    name: 'Gardens by the Bay',
    address: '18 Marina Gardens Dr, Singapore 018953',
    postalCode: '018953',
    latitude: 1.2815,
    longitude: 103.8636,
    category: 'attraction'
  },
  {
    id: 'vivocity-098585',
    name: 'VivoCity & Harbourfront',
    address: '1 HarbourFront Walk, Singapore 098585',
    postalCode: '098585',
    latitude: 1.2642,
    longitude: 103.8223,
    category: 'shopping'
  },
  {
    id: 'bugis-junction-188021',
    name: 'Bugis Junction',
    address: '200 Victoria St, Singapore 188021',
    postalCode: '188021',
    latitude: 1.2995,
    longitude: 103.8553,
    category: 'shopping'
  },
  {
    id: 'bugis-plus-188067',
    name: 'Bugis+',
    address: '201 Victoria St, Singapore 188067',
    postalCode: '188067',
    latitude: 1.3005,
    longitude: 103.8546,
    category: 'shopping'
  },
  {
    id: 'raffles-place-048616',
    name: 'One Raffles Place',
    address: '1 Raffles Place, Singapore 048616',
    postalCode: '048616',
    latitude: 1.2843,
    longitude: 103.8510,
    category: 'business'
  },
  {
    id: 'guoco-tower-078881',
    name: 'Guoco Tower / Tanjong Pagar Centre',
    address: '1 Wallich St, Singapore 078881',
    postalCode: '078881',
    latitude: 1.2772,
    longitude: 103.8458,
    category: 'business'
  },
  {
    id: 'chinatown-point-059413',
    name: 'Chinatown Point',
    address: '133 New Bridge Rd, Singapore 059413',
    postalCode: '059413',
    latitude: 1.2848,
    longitude: 103.8441,
    category: 'shopping'
  },
  {
    id: 'clarke-quay-central-059817',
    name: 'Clarke Quay Central',
    address: '6 Eu Tong Sen St, Singapore 059817',
    postalCode: '059817',
    latitude: 1.2889,
    longitude: 103.8467,
    category: 'shopping'
  },
  {
    id: 'nex-serangoon-556083',
    name: 'NEX Shopping Mall',
    address: '23 Serangoon Central, Singapore 556083',
    postalCode: '556083',
    latitude: 1.3505,
    longitude: 103.8725,
    category: 'shopping'
  },
  {
    id: 'junction-8-bishan-579837',
    name: 'Junction 8 Shopping Centre',
    address: '9 Bishan Place, Singapore 579837',
    postalCode: '579837',
    latitude: 1.3508,
    longitude: 103.8485,
    category: 'shopping'
  },
  {
    id: 'amk-hub-569933',
    name: 'AMK Hub (Ang Mo Kio)',
    address: '53 Ang Mo Kio Ave 3, Singapore 569933',
    postalCode: '569933',
    latitude: 1.3692,
    longitude: 103.8485,
    category: 'shopping'
  },
  {
    id: 'waterway-point-828761',
    name: 'Waterway Point (Punggol)',
    address: '83 Punggol Central, Singapore 828761',
    postalCode: '828761',
    latitude: 1.4064,
    longitude: 103.9021,
    category: 'shopping'
  },
  {
    id: 'compass-one-545078',
    name: 'Compass One (Sengkang)',
    address: '1 Sengkang Square, Singapore 545078',
    postalCode: '545078',
    latitude: 1.3922,
    longitude: 103.8948,
    category: 'shopping'
  },
  {
    id: 'tampines-mall-529510',
    name: 'Tampines Mall',
    address: '4 Tampines Central 5, Singapore 529510',
    postalCode: '529510',
    latitude: 1.3526,
    longitude: 103.9452,
    category: 'shopping'
  },
  {
    id: 'our-tampines-hub-528523',
    name: 'Our Tampines Hub (OTH)',
    address: '1 Tampines Walk, Singapore 528523',
    postalCode: '528523',
    latitude: 1.3532,
    longitude: 103.9405,
    category: 'shopping'
  },
  {
    id: 'westgate-608532',
    name: 'Westgate (Jurong Gateway)',
    address: '3 Gateway Dr, Singapore 608532',
    postalCode: '608532',
    latitude: 1.3344,
    longitude: 103.7431,
    category: 'shopping'
  },
  {
    id: 'jem-jurong-608549',
    name: 'JEM Shopping Mall',
    address: '50 Jurong Gateway Rd, Singapore 608549',
    postalCode: '608549',
    latitude: 1.3331,
    longitude: 103.7434,
    category: 'shopping'
  },
  {
    id: 'jurong-point-648886',
    name: 'Jurong Point (Boon Lay)',
    address: '1 Jurong West Central 2, Singapore 648886',
    postalCode: '648886',
    latitude: 1.3400,
    longitude: 103.7060,
    category: 'shopping'
  },
  {
    id: 'plq-mall-409057',
    name: 'Paya Lebar Quarter (PLQ Mall)',
    address: '10 Paya Lebar Rd, Singapore 409057',
    postalCode: '409057',
    latitude: 1.3175,
    longitude: 103.8924,
    category: 'shopping'
  },
  {
    id: 'northpoint-city-769098',
    name: 'Northpoint City (Yishun)',
    address: '930 Yishun Ave 2, Singapore 769098',
    postalCode: '769098',
    latitude: 1.4295,
    longitude: 103.8362,
    category: 'shopping'
  },
  {
    id: 'causeway-point-738099',
    name: 'Causeway Point (Woodlands)',
    address: '1 Woodlands Square, Singapore 738099',
    postalCode: '738099',
    latitude: 1.4361,
    longitude: 103.7863,
    category: 'shopping'
  },
  {
    id: 'jewel-changi-819666',
    name: 'Jewel Changi Airport',
    address: '78 Airport Blvd., Singapore 819666',
    postalCode: '819666',
    latitude: 1.3602,
    longitude: 103.9897,
    category: 'attraction'
  },
  {
    id: 'parkway-parade-449269',
    name: 'Parkway Parade (Marine Parade)',
    address: '80 Marine Parade Rd, Singapore 449269',
    postalCode: '449269',
    latitude: 1.3015,
    longitude: 103.9052,
    category: 'shopping'
  },
  {
    id: 'velocity-novena-307683',
    name: 'Velocity @ Novena Square',
    address: '238 Thomson Rd, Singapore 307683',
    postalCode: '307683',
    latitude: 1.3204,
    longitude: 103.8438,
    category: 'shopping'
  },
  {
    id: 'tiong-bahru-plaza-168732',
    name: 'Tiong Bahru Plaza',
    address: '302 Tiong Bahru Rd, Singapore 168732',
    postalCode: '168732',
    latitude: 1.2865,
    longitude: 103.8273,
    category: 'shopping'
  },
  {
    id: 'clementi-mall-129588',
    name: 'The Clementi Mall',
    address: '3155 Commonwealth Ave W, Singapore 129588',
    postalCode: '129588',
    latitude: 1.3152,
    longitude: 103.7651,
    category: 'shopping'
  },
  {
    id: 'hillion-mall-678278',
    name: 'Hillion Mall (Bukit Panjang)',
    address: '17 Petir Rd, Singapore 678278',
    postalCode: '678278',
    latitude: 1.3785,
    longitude: 103.7629,
    category: 'shopping'
  },
  {
    id: 'lot-one-689812',
    name: 'Lot One Shoppers\' Mall (CCK)',
    address: '21 Choa Chu Kang Ave 4, Singapore 689812',
    postalCode: '689812',
    latitude: 1.3853,
    longitude: 103.7445,
    category: 'shopping'
  }
];

/**
 * Extracts 6-digit postal code from any query string
 * Examples: "038983", "S038983", "Singapore 038983", "postal code 608532"
 */
export function extractPostalCode(query: string): string | null {
  if (!query) return null;
  const cleaned = query.trim().toUpperCase();

  // Match 6 consecutive digits
  const match = cleaned.match(/\b(\d{6})\b/);
  if (match) return match[1];

  // Match S(123456) or SG123456 or #123456
  const prefixMatch = cleaned.match(/(?:S|SG|#|\b)\s*(\d{6})\b/);
  if (prefixMatch) return prefixMatch[1];

  // If query is pure 6 digits without boundary
  if (/^\d{6}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

/**
 * Resolves a Singapore Postal Code or address query to a Destination coordinate.
 * Priority order:
 * 1. Exact postal code match in known landmark database
 * 2. Singapore Postal Sector centroid database (First 2 digits 01-82)
 * 3. Text search match across name, address, or postal code
 */
export function resolveSingaporeLocation(query: string): Destination {
  const trimmed = query.trim();
  const postal = extractPostalCode(trimmed);

  if (postal) {
    // 1. Check known database for exact 6-digit postal code
    const exactMatch = EXTENDED_POSTAL_LANDMARKS.find(
      l => l.postalCode === postal || l.address.includes(postal)
    );
    if (exactMatch) {
      return {
        ...exactMatch,
        name: exactMatch.name.includes(postal) ? exactMatch.name : `${exactMatch.name} (${postal})`
      };
    }

    // 2. Check 2-digit postal sector
    const sector = postal.substring(0, 2);
    const sectorInfo = SINGAPORE_POSTAL_SECTORS[sector];
    if (sectorInfo) {
      return {
        id: `postal-${postal}`,
        name: `Postal Code ${postal}`,
        address: `${sectorInfo.area}, Singapore ${postal} (${sectorInfo.district})`,
        postalCode: postal,
        latitude: sectorInfo.lat,
        longitude: sectorInfo.lng,
        category: 'other'
      };
    }
  }

  // 3. Match text in landmark database
  const queryLower = trimmed.toLowerCase();
  const textMatch = EXTENDED_POSTAL_LANDMARKS.find(
    l => l.name.toLowerCase().includes(queryLower) ||
         l.address.toLowerCase().includes(queryLower) ||
         (l.postalCode && l.postalCode.includes(queryLower))
  );

  if (textMatch) {
    return textMatch;
  }

  // 4. Fallback: Central Singapore default coordinate
  return {
    id: `custom-${Date.now()}`,
    name: trimmed,
    address: `${trimmed}, Singapore`,
    postalCode: postal || undefined,
    latitude: 1.2930,
    longitude: 103.8500,
    category: 'other'
  };
}

/**
 * Filter suggestions for autocomplete based on query (supports postal code, name, or street)
 */
export function searchDestinationsAndPostalCodes(query: string): Destination[] {
  if (!query || !query.trim()) {
    return EXTENDED_POSTAL_LANDMARKS.slice(0, 10);
  }

  const q = query.trim().toLowerCase();
  const extracted = extractPostalCode(query);

  // If user typed 6-digit postal code
  if (extracted) {
    const directPostal = resolveSingaporeLocation(extracted);
    const otherMatches = EXTENDED_POSTAL_LANDMARKS.filter(
      l => l.postalCode?.includes(extracted) || l.address.includes(extracted)
    );

    const results: Destination[] = [];
    if (!otherMatches.some(m => m.id === directPostal.id)) {
      results.push(directPostal);
    }
    results.push(...otherMatches);
    return results;
  }

  // If user typed 2-5 digits, check postal sector & prefix matches
  if (/^\d{2,5}$/.test(q)) {
    const sector = q.substring(0, 2);
    const sectorInfo = SINGAPORE_POSTAL_SECTORS[sector];
    const results: Destination[] = [];

    if (sectorInfo && q.length >= 2) {
      results.push({
        id: `sector-${q}`,
        name: `Postal Sector ${q} (${sectorInfo.area})`,
        address: `${sectorInfo.area}, Singapore ${sectorInfo.district}`,
        postalCode: q,
        latitude: sectorInfo.lat,
        longitude: sectorInfo.lng,
        category: 'other'
      });
    }

    const matches = EXTENDED_POSTAL_LANDMARKS.filter(
      l => l.postalCode?.startsWith(q) || l.address.includes(q)
    );
    results.push(...matches);
    return results.slice(0, 8);
  }

  // General text search
  return EXTENDED_POSTAL_LANDMARKS.filter(
    d => d.name.toLowerCase().includes(q) ||
         d.address.toLowerCase().includes(q) ||
         (d.postalCode && d.postalCode.includes(q))
  ).slice(0, 8);
}
