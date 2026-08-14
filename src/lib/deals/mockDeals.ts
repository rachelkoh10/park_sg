import { FoodDeal } from '../../types/parking';

export const SINGAPORE_FOOD_DEALS: FoodDeal[] = [
  {
    id: 'deal-din-tai-fung-suntec',
    carParkId: 'SUNTEC-01',
    latitude: 1.2936,
    longitude: 103.8575,
    name: 'Din Tai Fung (Suntec City #02-302)',
    category: 'Taiwanese / Dim Sum',
    distanceMeters: 80,
    rating: 4.7,
    reviewCount: 1420,
    openingStatus: 'Open until 9:30 PM',
    promotionTitle: 'Weekday Tea Time Xiao Long Bao Set',
    promotionDescription: 'Get 6 pcs Steamed Dumplings + Hot Brewed Tea for $11.80 (2pm - 5pm).',
    isSponsored: false,
    badge: 'Popular Choice'
  },
  {
    id: 'deal-cedele-suntec',
    carParkId: 'SUNTEC-01',
    latitude: 1.2939,
    longitude: 103.8570,
    name: 'Cedele Bakery Cafe',
    category: 'Bakery & Healthy Cafe',
    distanceMeters: 120,
    rating: 4.4,
    reviewCount: 380,
    openingStatus: 'Open until 8:00 PM',
    promotionTitle: 'Free Parking Rebate ($3 OFF)',
    promotionDescription: 'Receive a $3 Suntec parking coupon with min. $35 spend.',
    isSponsored: true,
    badge: 'Parking Rebate'
  },
  {
    id: 'deal-shake-shack-suntec',
    carParkId: 'SUNTEC-01',
    latitude: 1.2941,
    longitude: 103.8580,
    name: 'Shake Shack Suntec City',
    category: 'Burgers & Shakes',
    distanceMeters: 140,
    rating: 4.5,
    reviewCount: 890,
    openingStatus: 'Open until 10:00 PM',
    promotionTitle: '10% Off Lunch Combo',
    promotionDescription: '10% off ShackBurger + Crinkle Cut Fries on mobile order.',
    isSponsored: false,
    badge: 'Lunch Deal'
  },
  {
    id: 'deal-black-knight-mbs',
    carParkId: 'MBS-01',
    latitude: 1.2839,
    longitude: 103.8595,
    name: 'Black Knight Hotpot MBS',
    category: 'Hotpot / Fine Dining',
    distanceMeters: 160,
    rating: 4.6,
    reviewCount: 520,
    openingStatus: 'Open until 11:00 PM',
    promotionTitle: 'Complimentary Valet / Parking Voucher',
    promotionDescription: '$10 MBS carpark credit with dining reservation above $120.',
    isSponsored: true,
    badge: 'Perk Included'
  },
  {
    id: 'deal-march-vivocity',
    carParkId: 'VIVOCITY-01',
    latitude: 1.2643,
    longitude: 103.8225,
    name: 'Marché Mövenpick VivoCity',
    category: 'Swiss / European Market',
    distanceMeters: 90,
    rating: 4.5,
    reviewCount: 2310,
    openingStatus: 'Open until 10:00 PM',
    promotionTitle: '50% Off Selected Mains (After 8 PM)',
    promotionDescription: 'Daily bakery and freshly prepared dinner rosti deals.',
    isSponsored: false,
    badge: 'Evening Special'
  },
  {
    id: 'deal-ps-cafe-orchard',
    carParkId: 'ION-ORCHARD-01',
    latitude: 1.3041,
    longitude: 103.8320,
    name: 'PS.Cafe @ ION Orchard (L4)',
    category: 'Modern Australian Cafe',
    distanceMeters: 50,
    rating: 4.6,
    reviewCount: 1650,
    openingStatus: 'Open until 10:00 PM',
    promotionTitle: 'Truffle Fries & Wine Pairing',
    promotionDescription: 'Special weekday glass of prosecco + Truffle fries bundle.',
    isSponsored: false,
    badge: 'Trending'
  },
  {
    id: 'deal-genki-sushi-bugis',
    carParkId: 'BUGIS-JUNC-01',
    latitude: 1.2996,
    longitude: 103.8552,
    name: 'Genki Sushi Bugis Junction',
    category: 'Japanese Express Sushi',
    distanceMeters: 60,
    rating: 4.4,
    reviewCount: 940,
    openingStatus: 'Open until 9:45 PM',
    promotionTitle: '1-for-1 Salmon Mentai Nigiri',
    promotionDescription: 'Exclusive app voucher on orders over $25.',
    isSponsored: false,
    badge: '1-for-1 Deal'
  }
];

export function getNearbyDeals(carParkId?: string, maxResults = 3): FoodDeal[] {
  if (carParkId) {
    const matched = SINGAPORE_FOOD_DEALS.filter(d => d.carParkId === carParkId);
    if (matched.length > 0) return matched.slice(0, maxResults);
  }
  return SINGAPORE_FOOD_DEALS.slice(0, maxResults);
}
