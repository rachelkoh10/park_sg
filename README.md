# ParkSG — Singapore Smart Parking & LTA DataMall Decision Engine

A production-quality Singapore Smart Parking web application powered by the **Singapore Land Transport Authority (LTA) DataMall CarParkAvailabilityv2 API**, pricing estimation tariffs, and a multi-variable recommendation engine.

---

## 🚗 Key Features

- **Real-Time LTA DataMall Integration**: Connects to `https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2` to fetch live available lots across HDB, LTA, and URA carparks in Singapore.
- **Smart Parking Decision Engine**: Evaluates available lots (35%), estimated pricing (25%), walking convenience (25%), and driving distance (15%) to recommend the optimal carpark.
- **Four Distinct Recommendation Badges**:
  - ⭐ **BEST OVERALL**: Optimal balance of availability, price, and distance.
  - 💰 **CHEAPEST**: Lowest estimated parking tariff for selected duration.
  - 📍 **CLOSEST**: Minimum walking time to target destination.
  - 🟢 **MOST AVAILABLE**: Maximum lot capacity.
- **Interactive Singapore Map**: Real-time Leaflet map displaying colored lot pins (🟢 >50, 🟡 11-50, 🔴 1-10, ⚫ Full), radius circle overlays, destination markers, and user GPS tracking.
- **Pricing Estimation Engine**: Calculates exact parking costs across cars, motorcycles, and vans for 30m, 1h, 2h, 3h, 4h, 6h, and 8h based on Singapore published tariffs.
- **Turn-by-Turn Navigation**: 1-tap launcher for **Google Maps** and **Waze** with precise GPS coordinates.
- **F&B & Parking Perks**: Curated dining deals, afternoon tea specials, and carpark spend rebates within walking distance.
- **Offline / Mock Mode Graceful Fallback**: Automatically switches to realistic Singapore mock data if `LTA_ACCOUNT_KEY` is not provided or offline.
- **API Diagnostics Console**: Built-in `/admin/api-status` modal displaying connection health, latency, received record counts, and raw payload inspect.

---

## 🔐 Environment Variables & Security

The LTA Account Key is **kept strictly server-side** in the Express / Vercel API layer and is never exposed to the client.

Create a `.env` or `.env.local` file:

```env
# Singapore LTA DataMall API Account Key
# Register at: https://datamall.lta.gov.sg/content/datamall/en/request-api.html
LTA_ACCOUNT_KEY="your_lta_account_key_here"

# Optional Mock Data override for offline testing (true | false)
MOCK_LTA_DATA="false"

# Optional Maps Configuration
NEXT_PUBLIC_MAPS_PROVIDER="leaflet"
```

---

## 🛠 Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure API Key**:
   Obtain an Account Key from [LTA DataMall](https://datamall.lta.gov.sg/content/datamall/en/request-api.html) and add `LTA_ACCOUNT_KEY` to your environment.

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the App**:
   Open `http://localhost:3000` in your browser.

---

## 📐 Architecture & Endpoints

```text
USER (Browser) 
  ↓ (calls /api/parking/availability)
Express API Server / Vercel Serverless Function
  ↓ (attaches LTA_ACCOUNT_KEY header)
LTA DataMall CarParkAvailabilityv2
  ↓ (returns JSON payload)
Data Normalizer (coordinates & agency mapping)
  ↓
Smart Recommendation & Pricing Engine
  ↓
Frontend Interactive Map & Cards
```

- `GET /api/parking/availability` — Real-time normalized LTA carpark availability.
- `GET /api/parking/details/:id` — Carpark details, pricing rules, and lot breakdown.
- `GET /api/parking/search` — Destination geocoding & autocomplete.
- `GET /api/deals/nearby` — Dining perks & parking rebate promotions.
- `GET /api/admin/status` — API latency, health, and connection status.
