# AeroFlight AM

A fullscreen, real-time flight tracker and airport departure/arrival information display rendered as a physical **136-column LED matrix board**.

Styled after classic digital airport concourse flight boards and air traffic displays, every visible UI element—including telemetry cards, flight boards, regional coastline maps, and airline logos—is drawn as discrete canvas cells using a bundled 5×7 bitmap font engine.

---

## Features

- **Airport Timetable & Movement Board**
  - Search any airport worldwide by IATA or ICAO code (e.g. `JFK`, `LHR`, `DXB`, `HND`, `CGK`).
  - Rotating arrivals and departures with scheduled/actual times, flight status, and counterpart airports.
  - Header alternates between airport code/city and local time/date every 3 seconds.

- **Global & Aircraft-Specific Live Tracking**
  - **Global Mode**: When no airport is selected (or set to `GLOBAL`), displays worldwide flights with continuous auto-rotation.
  - **Target Tracking**: Follow individual flights by callsign (e.g. `AAL100`, `BAW11`), airline flight number (translated to ATC callsign), or 6-character ICAO24 hex address.
  - **4-Phase Telemetry Rotation**: Displays flight metrics across 4 rotating pages (Altitude, Ground Speed, Vertical Speed, Heading, Aircraft Specifications, Cruise Ceiling, and Passenger Capacity).

- **Squawk Emergency Takeover**
  - High-priority display takeover when an aircraft broadcasts emergency squawks (`7700` general emergency, `7600` radio failure, `7500` hijack).
  - Automatically identifies and prioritizes live emergency traffic nearest to the active airport or in the global feed.

- **Canvas-Based LED Matrix & Map Rendering**
  - **Discrete Grid Engine**: Simulates individual physical LED pixels with authentic amber, amber-bright, white, green, blue, and red color profiles, glow effects, and ghosting.
  - **Dynamic Vector Map**: Renders continental coastlines, regional zoom around selected airports, heading trails, and real-time aircraft positions.
  - **Pixel Airline Logos**: Built-in 5×7 matrix logos for major international airlines.

- **Live ADS-B Feeds with Demo Fallback**
  - Seamlessly pulls live flight states from the OpenSky Network API and ADSB endpoints (`api.adsb.lol` / `api.adsb.fi`).
  - Features a deterministic, animated synthetic traffic dataset that automatically takes over if live feeds are unavailable or rate limited, ensuring an unattended display never goes blank.

---

## Interactive Controls & Search Commands

| Command / Key | Description |
| :--- | :--- |
| **`[IATA / ICAO]`** (e.g. `LAX`, `EGLL`) | Focus on that airport's departure/arrival board and regional map |
| **`GLOBAL`** | Clear airport focus and return to worldwide traffic mode |
| **`[Callsign]`** or **`TRACK [Callsign/ICAO24]`** | Focus and follow a single aircraft (e.g. `TRACK AAL100`) |
| **`UNTRACK`** | Return to airport or global rotation mode |
| **`/`** | Focus the search input field |
| **`F`** or **Double Click** | Toggle fullscreen mode |

---

## Getting Started

### Prerequisites

- Node.js 18.17+ or newer
- npm / yarn / pnpm

### Installation & Local Run

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## OpenSky Authentication (Optional)

Anonymous OpenSky access uses a small shared daily quota. To use a dedicated OpenSky account quota, configure an OAuth2 client in `.env.local`:

```dotenv
OPENSKY_CLIENT_ID=your_client_id
OPENSKY_CLIENT_SECRET=your_client_secret
```

> **Note:** Both variables are server-only (do not prefix with `NEXT_PUBLIC_`). When either variable is omitted, the proxy automatically falls back to anonymous access.

### Polling & Rate Adaptation

- **Anonymous**: Global snapshots refresh every 20 minutes; single-aircraft tracking refreshes every 5 minutes. Global emergency scans run every 60 minutes.
- **Authenticated**: Global snapshots refresh every 2 minutes; single-aircraft tracking refreshes every 30 seconds. Global emergency scans run every 6 minutes.
- OpenSky `Retry-After` headers override polling intervals automatically.
- Airport movement boards refresh every 6 hours to align with OpenSky's historical batch publication schedule.

---

## Project Structure

```
AeroFlightAm/
├── app/
│   ├── api/
│   │   ├── adsb/route.ts             # Proxy for ADSB (adsb.lol / adsb.fi) with fallback
│   │   └── opensky/
│   │       ├── auth.ts               # OpenSky OAuth2 token management & credential caching
│   │       ├── movement-proxy.ts     # Proxy for airport arrivals/departures
│   │       ├── routes/route.ts       # Proxy for flight route lookups
│   │       └── states/route.ts       # Proxy for live global/regional aircraft states
│   ├── globals.css                   # Fullscreen root layout styling
│   ├── layout.tsx                    # Next.js root layout
│   └── page.tsx                      # Main page mounting FlightDashboard
├── components/
│   ├── FlightDashboard.tsx           # Main flight tracking state machine & canvas draw loop
│   └── FlightDashboard.module.css    # Overlay styling for search bar & fullscreen container
└── lib/
    ├── aircraft-db.ts                # Database of aircraft specs (A320, B777, A350, etc.)
    ├── airline-logos.ts              # 5x7/matrix pixel logos for major international airlines
    ├── airlines.ts                   # IATA/ICAO airline translation and callsign normalization
    ├── airports.ts                   # Global airport database (IATA/ICAO coordinates, names, cities)
    ├── bitmap-font.ts                # 5x7 bitmap font definitions & text measurement utilities
    ├── led-board.ts                  # LED matrix rendering engine on HTML5 Canvas
    ├── opensky.ts                    # OpenSky & ADSB client fetchers, parsers, and demo generators
    └── world-map.ts                  # Coastline geometries, Mercator/regional projection & map trails
```

---

## Verification & Build

```bash
# Run TypeScript typecheck
npm run typecheck

# Build production bundle
npm run build
```
