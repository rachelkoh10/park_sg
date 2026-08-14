import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { getCarparkAvailability, getApiDiagnosticStatus } from './src/lib/lta/client';
import { defaultParkingRateProvider } from './src/lib/parking/pricing';
import { SINGAPORE_FOOD_DEALS } from './src/lib/deals/mockDeals';
import { POPULAR_SINGAPORE_DESTINATIONS, MOCK_SINGAPORE_CARPARKS } from './src/data/mockCarparks';

import { searchDestinationsAndPostalCodes, resolveSingaporeLocation, extractPostalCode } from './src/lib/parking/geocode';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 1. Primary LTA DataMall Carpark Availability Endpoint
  app.get('/api/parking/availability', async (req, res) => {
    try {
      const forceFresh = req.query.fresh === 'true';
      const result = await getCarparkAvailability(forceFresh);
      res.json(result);
    } catch (err: any) {
      console.error('Error fetching parking availability:', err);
      res.status(500).json({
        success: false,
        source: 'MOCK',
        isMock: true,
        lastUpdated: new Date().toISOString(),
        count: MOCK_SINGAPORE_CARPARKS.length,
        carparks: MOCK_SINGAPORE_CARPARKS,
        error: err.message || 'Internal server error while fetching carpark availability'
      });
    }
  });

  // 2. Specific Carpark Details & Pricing Rules
  app.get('/api/parking/details/:id', async (req, res) => {
    const { id } = req.params;
    const agency = (req.query.agency as string) || 'LTA';

    const rate = defaultParkingRateProvider.getRateSync(id, agency);
    const mockMatch = MOCK_SINGAPORE_CARPARKS.find(c => c.carParkId.toLowerCase() === id.toLowerCase());

    res.json({
      success: true,
      carParkId: id,
      development: mockMatch?.development || `Carpark ${id}`,
      agency: mockMatch?.agency || agency,
      rates: rate,
      address: mockMatch?.address || 'Singapore',
      totalLotsEstimate: mockMatch?.totalLotsEstimate || 200
    });
  });

  // 3. Search / Geocode Destination & Postal Code Helper for Singapore
  app.get('/api/parking/search', async (req, res) => {
    const query = ((req.query.q as string) || '').trim();
    if (!query) {
      return res.json({ destinations: POPULAR_SINGAPORE_DESTINATIONS });
    }

    // Check if postal code or general query
    const postal = extractPostalCode(query);

    // Try OneMap live query for real-time precise building & block geocoding if query or postal code
    try {
      const searchTarget = postal || query;
      const oneMapUrl = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(searchTarget)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout
      
      const response = await fetch(oneMapUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const oneMapDestinations = data.results.slice(0, 8).map((r: any, idx: number) => {
            const bldgName = r.BUILDING && r.BUILDING !== 'NIL' ? r.BUILDING : r.SEARCHVAL || 'Singapore Location';
            const road = r.ROAD_NAME && r.ROAD_NAME !== 'NIL' ? r.ROAD_NAME : '';
            const blk = r.BLK_NO && r.BLK_NO !== 'NIL' ? `Blk ${r.BLK_NO} ` : '';
            const postCode = r.POSTAL && r.POSTAL !== 'NIL' ? r.POSTAL : postal || '';
            const fullAddress = `${blk}${road}${postCode ? `, Singapore ${postCode}` : ', Singapore'}`;

            return {
              id: `onemap-${r.POSTAL || idx}-${Date.now()}`,
              name: postCode ? `${bldgName} (${postCode})` : bldgName,
              address: fullAddress,
              postalCode: postCode || undefined,
              latitude: parseFloat(r.LATITUDE),
              longitude: parseFloat(r.LONGITUDE),
              category: 'other' as const
            };
          });

          return res.json({
            destinations: oneMapDestinations,
            source: 'OneMap'
          });
        }
      }
    } catch (e) {
      // Gracefully continue to internal postal sector & database lookup
    }

    // Internal postal code database & sector centroids fallback
    const matches = searchDestinationsAndPostalCodes(query);
    res.json({
      destinations: matches,
      source: 'Internal'
    });
  });

  // 4. Nearby Food & Merchant Deals
  app.get('/api/deals/nearby', (req, res) => {
    const carParkId = req.query.carParkId as string;
    if (carParkId) {
      const filtered = SINGAPORE_FOOD_DEALS.filter(d => d.carParkId === carParkId);
      if (filtered.length > 0) return res.json({ deals: filtered });
    }
    res.json({ deals: SINGAPORE_FOOD_DEALS });
  });

  // 5. Admin / Diagnostic Status Endpoint (/admin/api-status)
  app.get('/api/admin/status', (req, res) => {
    const status = getApiDiagnosticStatus();
    res.json({
      success: true,
      ...status,
      timestamp: new Date().toISOString()
    });
  });

  // 6. Analytics Logging
  app.post('/api/analytics/track', (req, res) => {
    // Log telemetry event
    res.json({ recorded: true });
  });

  // ==========================================
  // VITE & STATIC ASSETS
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ParkSG Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
