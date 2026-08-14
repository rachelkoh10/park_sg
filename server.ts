import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { getCarparkAvailability, getApiDiagnosticStatus } from './src/lib/lta/client';
import { defaultParkingRateProvider } from './src/lib/parking/pricing';
import { SINGAPORE_FOOD_DEALS } from './src/lib/deals/mockDeals';
import { POPULAR_SINGAPORE_DESTINATIONS, MOCK_SINGAPORE_CARPARKS } from './src/data/mockCarparks';

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

  // 3. Search / Geocode Destination Helper for Singapore
  app.get('/api/parking/search', (req, res) => {
    const query = ((req.query.q as string) || '').toLowerCase().trim();
    if (!query) {
      return res.json({ destinations: POPULAR_SINGAPORE_DESTINATIONS });
    }

    const matches = POPULAR_SINGAPORE_DESTINATIONS.filter(
      d => d.name.toLowerCase().includes(query) || d.address.toLowerCase().includes(query)
    );

    res.json({ destinations: matches });
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
