import { getAirlineName } from "./airlines";
import { DEFAULT_AIRPORT, findAirport, type Airport } from "./airports";

const METERS_TO_FEET = 3.28084;
const MPS_TO_KNOTS = 1.94384;
const MPS_TO_FPM = 196.8504;
const DEFAULT_BASE_URL = "/api/adsb";
const EMERGENCY_CODES = new Map([
  ["7500", "hijack"],
  ["7600", "radio-failure"],
  ["7700", "general-emergency"],
] as const);

export type EmergencyType = "hijack" | "radio-failure" | "general-emergency";
export type FlightStatus = "emergency" | "ground" | "en-route";
export type DataMode = "live" | "demo";

export interface FlightState {
  readonly id: string;
  readonly icao24: string;
  readonly callsign: string;
  readonly airlineName: string;
  readonly originCountry: string;
  readonly timePosition: number | null;
  readonly lastContact: number;
  readonly longitude: number | null;
  readonly latitude: number | null;
  readonly baroAltitudeM: number | null;
  readonly geoAltitudeM: number | null;
  readonly altitudeFt: number | null;
  readonly velocityMps: number | null;
  readonly speedKts: number | null;
  readonly trueTrackDeg: number | null;
  readonly headingDeg: number | null;
  readonly verticalRateMps: number | null;
  readonly verticalRateFpm: number | null;
  readonly onGround: boolean;
  readonly squawk: string | null;
  readonly emergency: EmergencyType | null;
  readonly isEmergency: boolean;
  readonly status: FlightStatus;
  readonly statusLabel: "EMERGENCY" | "GROUND" | "EN ROUTE";
  readonly signalSource: string;
  readonly positionSource: number;
  readonly category: string;
  readonly categoryCode: number | null;
  readonly spi: boolean;
  readonly aircraftType?: string;
  readonly dataSource: DataMode;
}

export interface FlightStatesResult {
  readonly states: FlightState[];
  readonly flights: FlightState[];
  readonly time: number;
  readonly mode: DataMode;
  readonly source: string;
  readonly live: boolean;
  readonly error?: string;
  readonly accessMode?: "anonymous" | "authenticated" | "unknown";
  readonly responseStatus?: number;
  readonly retryAfterSeconds?: number;
  readonly rateLimitRemaining?: number;
}

export interface AirportBoardEntry {
  readonly id: string;
  readonly movement: "arrival" | "departure";
  readonly callsign: string;
  readonly airlineName: string;
  readonly icao24: string;
  readonly trackedAirport: string;
  readonly originAirport: string | null;
  readonly destinationAirport: string | null;
  readonly counterpartAirport: string | null;
  readonly expectedTime: number;
  readonly firstSeen: number;
  readonly lastSeen: number;
  readonly status: "expected" | "landed" | "departed" | "unknown";
  readonly dataSource: DataMode;
}

export interface AirportBoardResult {
  readonly arrivals: AirportBoardEntry[];
  readonly departures: AirportBoardEntry[];
  readonly airport: string;
  readonly time: number;
  readonly mode: DataMode;
  readonly source: string;
  readonly live: boolean;
  readonly error?: string;
  readonly accessMode?: "anonymous" | "authenticated" | "unknown";
  readonly responseStatus?: number;
  readonly retryAfterSeconds?: number;
  readonly rateLimitRemaining?: number;
}

export interface GeographicBounds {
  readonly minLatitude: number;
  readonly minLongitude: number;
  readonly maxLatitude: number;
  readonly maxLongitude: number;
}

export interface FetchFlightStatesOptions {
  readonly airport?: Airport | string;
  readonly baseUrl?: string;
  readonly bounds?: GeographicBounds;
  /** Limit the live request to one or more six-character ICAO24 addresses. */
  readonly icao24?: string | readonly string[];
  readonly callsign?: string;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly maximumStates?: number;
  readonly now?: number | Date;
}

export interface FetchAirportBoardOptions {
  readonly baseUrl?: string;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly now?: number | Date;
}

type OpenSkyVector = readonly unknown[];

const CATEGORY_NAMES = [
  "NO DATA",
  "NO CATEGORY",
  "LIGHT",
  "SMALL",
  "LARGE",
  "HIGH VORTEX",
  "HEAVY",
  "HIGH PERFORMANCE",
  "ROTORCRAFT",
  "GLIDER",
  "LIGHTER THAN AIR",
  "PARACHUTIST",
  "ULTRALIGHT",
  "RESERVED",
  "UAV",
  "SPACE VEHICLE",
  "SURFACE EMERGENCY",
  "SURFACE SERVICE",
  "POINT OBSTACLE",
] as const;

const POSITION_SOURCES = ["ADS-B", "ASTERIX", "MLAT", "FLARM"] as const;

function epochSeconds(value: number | Date = Date.now()): number {
  const milliseconds = value instanceof Date ? value.valueOf() : value;
  return Math.floor(milliseconds > 10_000_000_000 ? milliseconds / 1000 : milliseconds);
}

function nullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function nullableText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numericResponseHeader(response: Response, name: string): number | undefined {
  const raw = response.headers.get(name);
  if (raw === null || raw.trim() === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

function responseAccessMode(response: Response): "anonymous" | "authenticated" | "unknown" {
  const value = response.headers.get("x-aeroflight-access");
  return value === "anonymous" || value === "authenticated" ? value : "unknown";
}

function normalizeSquawk(value: unknown): string | null {
  const squawk = nullableText(value)?.replace(/\D/g, "");
  return squawk ? squawk.padStart(4, "0").slice(-4) : null;
}

function makeStatus(onGround: boolean, emergency: EmergencyType | null): {
  status: FlightStatus;
  statusLabel: FlightState["statusLabel"];
} {
  if (emergency) return { status: "emergency", statusLabel: "EMERGENCY" };
  if (onGround) return { status: "ground", statusLabel: "GROUND" };
  return { status: "en-route", statusLabel: "EN ROUTE" };
}

/** Normalize one vector from the documented OpenSky state-vector schema. */
export function normalizeStateVector(vector: OpenSkyVector, dataSource: DataMode = "live"): FlightState {
  const icao24 = (nullableText(vector[0]) ?? "------").toLowerCase();
  const callsign = (nullableText(vector[1]) ?? icao24).replace(/\s+/g, "").toUpperCase();
  const baroAltitudeM = nullableNumber(vector[7]);
  const geoAltitudeM = nullableNumber(vector[13]);
  const velocityMps = nullableNumber(vector[9]);
  const verticalRateMps = nullableNumber(vector[11]);
  const positionSource = nullableNumber(vector[16]) ?? 0;
  const categoryCode = nullableNumber(vector[17]);
  const squawk = normalizeSquawk(vector[14]);
  const emergency = squawk ? (EMERGENCY_CODES.get(squawk as "7500" | "7600" | "7700") ?? null) : null;
  const onGround = Boolean(vector[8]);
  const { status, statusLabel } = makeStatus(onGround, emergency);

  return {
    id: icao24,
    icao24,
    callsign,
    airlineName: getAirlineName(callsign),
    originCountry: nullableText(vector[2]) ?? "Unknown",
    timePosition: nullableNumber(vector[3]),
    lastContact: nullableNumber(vector[4]) ?? 0,
    longitude: nullableNumber(vector[5]),
    latitude: nullableNumber(vector[6]),
    baroAltitudeM,
    geoAltitudeM,
    altitudeFt: (baroAltitudeM ?? geoAltitudeM) === null ? null : (baroAltitudeM ?? geoAltitudeM)! * METERS_TO_FEET,
    velocityMps,
    speedKts: velocityMps === null ? null : velocityMps * MPS_TO_KNOTS,
    trueTrackDeg: nullableNumber(vector[10]),
    headingDeg: nullableNumber(vector[10]),
    verticalRateMps,
    verticalRateFpm: verticalRateMps === null ? null : verticalRateMps * MPS_TO_FPM,
    onGround,
    squawk,
    emergency,
    isEmergency: emergency !== null,
    status,
    statusLabel,
    signalSource: POSITION_SOURCES[positionSource] ?? `SOURCE ${positionSource}`,
    positionSource,
    category: categoryCode === null ? "NO DATA" : (CATEGORY_NAMES[categoryCode] ?? `CATEGORY ${categoryCode}`),
    categoryCode,
    spi: Boolean(vector[15]),
    dataSource,
  };
}

export function normalizeAdsbAircraft(raw: any, dataSource: DataMode = "live", fetchTimeMs: number): FlightState {
  const icao24 = (raw.hex ?? "------").toLowerCase();
  const callsign = (raw.flight ?? icao24).replace(/\s+/g, "").toUpperCase();
  const squawk = normalizeSquawk(raw.squawk);
  const emergency = squawk ? (EMERGENCY_CODES.get(squawk as "7500" | "7600" | "7700") ?? null) : null;
  const onGround = Boolean(raw.alt_baro === "ground");
  const altitudeFt = typeof raw.alt_baro === 'number' ? raw.alt_baro : typeof raw.alt_geom === 'number' ? raw.alt_geom : null;
  const baroAltitudeM = altitudeFt !== null ? altitudeFt / METERS_TO_FEET : null;
  const geoAltitudeM = typeof raw.alt_geom === 'number' ? raw.alt_geom / METERS_TO_FEET : null;
  const { status, statusLabel } = makeStatus(onGround, emergency);

  return {
    id: icao24,
    icao24,
    callsign,
    airlineName: getAirlineName(callsign),
    originCountry: "Unknown",
    timePosition: raw.seen_pos !== undefined ? Math.floor(fetchTimeMs / 1000 - raw.seen_pos) : null,
    lastContact: raw.seen !== undefined ? Math.floor(fetchTimeMs / 1000 - raw.seen) : Math.floor(fetchTimeMs / 1000),
    longitude: typeof raw.lon === 'number' ? raw.lon : null,
    latitude: typeof raw.lat === 'number' ? raw.lat : null,
    baroAltitudeM,
    geoAltitudeM,
    altitudeFt,
    velocityMps: typeof raw.gs === 'number' ? raw.gs / MPS_TO_KNOTS : null,
    speedKts: typeof raw.gs === 'number' ? raw.gs : null,
    trueTrackDeg: typeof raw.track === 'number' ? raw.track : null,
    headingDeg: typeof raw.track === 'number' ? raw.track : typeof raw.mag_heading === 'number' ? raw.mag_heading : null,
    verticalRateMps: typeof raw.baro_rate === 'number' ? raw.baro_rate / MPS_TO_FPM : null,
    verticalRateFpm: typeof raw.baro_rate === 'number' ? raw.baro_rate : typeof raw.geom_rate === 'number' ? raw.geom_rate : null,
    onGround,
    squawk,
    emergency,
    isEmergency: emergency !== null,
    status,
    statusLabel,
    signalSource: "ADS-B",
    positionSource: 0,
    category: raw.category ?? "NO DATA",
    categoryCode: null,
    spi: Boolean(raw.spi),
    aircraftType: raw.t,
    dataSource,
  };
}

interface DemoSeed {
  readonly icao24: string;
  readonly callsign: string;
  readonly country: string;
  readonly longitude: number;
  readonly latitude: number;
  readonly altitudeFt: number;
  readonly speedKts: number;
  readonly heading: number;
  readonly verticalFpm: number;
  readonly type: string;
}

const DEMO_SEEDS: readonly DemoSeed[] = [
  { icao24: "885102", callsign: "THA625", country: "Thailand", longitude: 101.4, latitude: 15.8, altitudeFt: 35100, speedKts: 472, heading: 202, verticalFpm: -640, type: "B77W" },
  { icao24: "76CD91", callsign: "SIA706", country: "Singapore", longitude: 103.2, latitude: 8.4, altitudeFt: 38200, speedKts: 488, heading: 348, verticalFpm: 320, type: "A359" },
  { icao24: "780A47", callsign: "CPA705", country: "Hong Kong", longitude: 109.2, latitude: 20.4, altitudeFt: 36900, speedKts: 480, heading: 231, verticalFpm: 0, type: "A333" },
  { icao24: "8964A2", callsign: "UAE372", country: "United Arab Emirates", longitude: 74.2, latitude: 24.1, altitudeFt: 40100, speedKts: 493, heading: 102, verticalFpm: 180, type: "A388" },
  { icao24: "4CA91B", callsign: "RYR84CV", country: "Ireland", longitude: 5.3, latitude: 49.6, altitudeFt: 33700, speedKts: 438, heading: 128, verticalFpm: -220, type: "B38M" },
  { icao24: "406D24", callsign: "BAW117", country: "United Kingdom", longitude: -32.1, latitude: 51.2, altitudeFt: 38900, speedKts: 497, heading: 258, verticalFpm: 0, type: "B789" },
  { icao24: "3C65A8", callsign: "DLH440", country: "Germany", longitude: -18.7, latitude: 58.2, altitudeFt: 37000, speedKts: 485, heading: 291, verticalFpm: 80, type: "A359" },
  { icao24: "A98C31", callsign: "UAL14", country: "United States", longitude: -119.4, latitude: 41.6, altitudeFt: 35900, speedKts: 468, heading: 84, verticalFpm: 0, type: "B772" },
  { icao24: "A43D12", callsign: "DAL296", country: "United States", longitude: -87.2, latitude: 37.5, altitudeFt: 33100, speedKts: 454, heading: 46, verticalFpm: 520, type: "A333" },
  { icao24: "A1F8E0", callsign: "AAL100", country: "United States", longitude: -56.9, latitude: 45.8, altitudeFt: 39000, speedKts: 502, heading: 76, verticalFpm: 0, type: "B77W" },
  { icao24: "E804A9", callsign: "LAN247", country: "Chile", longitude: -71.8, latitude: -22.5, altitudeFt: 36200, speedKts: 446, heading: 18, verticalFpm: -140, type: "B788" },
  { icao24: "E48F51", callsign: "TAM8180", country: "Brazil", longitude: -47.4, latitude: -12.1, altitudeFt: 34700, speedKts: 439, heading: 154, verticalFpm: 0, type: "A20N" },
  { icao24: "7C6B40", callsign: "QFA11", country: "Australia", longitude: 149.2, latitude: -28.1, altitudeFt: 39500, speedKts: 491, heading: 62, verticalFpm: 240, type: "A388" },
  { icao24: "C81A24", callsign: "ANZ2", country: "New Zealand", longitude: 174.1, latitude: -37.7, altitudeFt: 28600, speedKts: 436, heading: 11, verticalFpm: 1100, type: "B789" },
  { icao24: "0101D2", callsign: "MSR985", country: "Egypt", longitude: 31.8, latitude: 29.2, altitudeFt: 24200, speedKts: 405, heading: 133, verticalFpm: -760, type: "B738" },
  { icao24: "040190", callsign: "ETH608", country: "Ethiopia", longitude: 44.1, latitude: 10.3, altitudeFt: 41000, speedKts: 478, heading: 86, verticalFpm: 0, type: "B789" },
  { icao24: "00B202", callsign: "SAA204", country: "South Africa", longitude: 20.7, latitude: -27.1, altitudeFt: 34600, speedKts: 461, heading: 212, verticalFpm: -300, type: "A333" },
  { icao24: "748041", callsign: "THY64", country: "Turkey", longitude: 27.2, latitude: 42.1, altitudeFt: 31800, speedKts: 443, heading: 311, verticalFpm: 640, type: "A321" },
  { icao24: "7BB112", callsign: "AIQ353", country: "Thailand", longitude: 100.7, latitude: 13.72, altitudeFt: 0, speedKts: 9, heading: 19, verticalFpm: 0, type: "A320" },
  { icao24: "885221", callsign: "BKP127", country: "Thailand", longitude: 100.4, latitude: 13.95, altitudeFt: 11800, speedKts: 284, heading: 121, verticalFpm: -1260, type: "AT72" },
];

function seededWobble(seed: number, time: number): number {
  return Math.sin(time / 53 + seed * 1.917) * 0.72 + Math.cos(time / 91 + seed) * 0.28;
}

function greatCircleDistanceRadians(
  fromLatitude: number,
  fromLongitude: number,
  toLatitude: number,
  toLongitude: number,
): number {
  const degreesToRadians = Math.PI / 180;
  const fromLat = fromLatitude * degreesToRadians;
  const toLat = toLatitude * degreesToRadians;
  const deltaLat = (toLatitude - fromLatitude) * degreesToRadians;
  const deltaLon = (toLongitude - fromLongitude) * degreesToRadians;
  const haversine = Math.sin(deltaLat / 2) ** 2
    + Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLon / 2) ** 2;
  const clampedHaversine = Math.max(0, Math.min(1, haversine));
  return 2 * Math.atan2(Math.sqrt(clampedHaversine), Math.sqrt(1 - clampedHaversine));
}

function nearestAirborneDemoSeed(airport: Airport): DemoSeed {
  const airborne = DEMO_SEEDS.filter((seed) => seed.altitudeFt >= 100);
  return airborne.reduce((nearest, candidate) => {
    const nearestDistance = greatCircleDistanceRadians(
      airport.latitude,
      airport.longitude,
      nearest.latitude,
      nearest.longitude,
    );
    const candidateDistance = greatCircleDistanceRadians(
      airport.latitude,
      airport.longitude,
      candidate.latitude,
      candidate.longitude,
    );
    return candidateDistance < nearestDistance ? candidate : nearest;
  });
}

function localDemoIcao24(airport: Airport): string {
  let hash = 2_166_136_261;
  for (const character of airport.icao) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619);
  }
  return `D${(hash >>> 0 & 0x0f_ffff).toString(16).padStart(5, "0")}`.toUpperCase();
}

function localDemoCallsign(template: DemoSeed, airport: Airport): string {
  let hash = 2_166_136_261;
  for (const character of airport.iata) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619);
  }
  const prefix = template.callsign.match(/^[A-Z]{2,3}/)?.[0] ?? "FLT";
  return `${prefix}${100 + ((hash >>> 0) % 900)}`;
}

function createLocalDemoSeed(airport: Airport): DemoSeed {
  const template = nearestAirborneDemoSeed(airport);
  return {
    ...template,
    icao24: localDemoIcao24(airport),
    callsign: localDemoCallsign(template, airport),
    longitude: airport.longitude + 1.8,
    latitude: airport.latitude + 1.2,
  };
}

/** Deterministic animated demo traffic for offline displays and API limits. */
export function createDemoFlightStates(
  airport: Airport | string = DEFAULT_AIRPORT,
  now: number | Date = Date.now(),
): FlightState[] {
  const selectedAirport = typeof airport === "string" ? findAirport(airport) ?? DEFAULT_AIRPORT : airport;
  const current = epochSeconds(now);
  const localSeed = createLocalDemoSeed(selectedAirport);
  const trafficSeeds = [localSeed, ...DEMO_SEEDS];

  return trafficSeeds.map((seed, index) => {
    const phaseTime = current / 60;
    const onGround = seed.altitudeFt < 100;
    const longitude = Math.max(-179, Math.min(179, seed.longitude + seededWobble(index, phaseTime) * (onGround ? 0.01 : 1.25)));
    const latitude = Math.max(-82, Math.min(82, seed.latitude + seededWobble(index + 23, phaseTime) * (onGround ? 0.006 : 0.68)));
    const squawk = index % 5 === 0 ? "2000" : "1200";
    const status = makeStatus(onGround, null);
    return {
      id: seed.icao24.toLowerCase(),
      icao24: seed.icao24.toLowerCase(),
      callsign: seed.callsign,
      airlineName: getAirlineName(seed.callsign),
      originCountry: seed.country,
      timePosition: current - (index % 4),
      lastContact: current - (index % 3),
      longitude,
      latitude,
      baroAltitudeM: seed.altitudeFt / METERS_TO_FEET,
      geoAltitudeM: (seed.altitudeFt + 120) / METERS_TO_FEET,
      altitudeFt: seed.altitudeFt,
      velocityMps: seed.speedKts / MPS_TO_KNOTS,
      speedKts: seed.speedKts,
      trueTrackDeg: seed.heading,
      headingDeg: seed.heading,
      verticalRateMps: seed.verticalFpm / MPS_TO_FPM,
      verticalRateFpm: seed.verticalFpm,
      onGround,
      squawk,
      emergency: null,
      isEmergency: false,
      status: status.status,
      statusLabel: status.statusLabel,
      signalSource: index % 7 === 0 ? "MLAT" : "ADS-B",
      positionSource: index % 7 === 0 ? 2 : 0,
      category: onGround ? "SURFACE" : "LARGE",
      categoryCode: onGround ? 17 : 4,
      spi: false,
      aircraftType: seed.type,
      dataSource: "demo" as const,
    };
  });
}

function airportFromOption(value: Airport | string | undefined): Airport {
  if (!value) return DEFAULT_AIRPORT;
  return typeof value === "string" ? findAirport(value) ?? DEFAULT_AIRPORT : value;
}

function makeAbortSignal(parent: AbortSignal | undefined, timeoutMs: number): {
  signal: AbortSignal;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const abort = () => controller.abort(parent?.reason);
  if (parent) {
    if (parent.aborted) abort();
    else parent.addEventListener("abort", abort, { once: true });
  }
  const timer = setTimeout(() => controller.abort(new DOMException("Request timed out", "TimeoutError")), timeoutMs);
  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      parent?.removeEventListener("abort", abort);
    },
  };
}

export async function fetchFlightStates(options: FetchFlightStatesOptions = {}): Promise<FlightStatesResult> {
  const airport = airportFromOption(options.airport);
  const current = epochSeconds(options.now);
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const url = new URL(baseUrl, typeof window === "undefined" ? "http://localhost" : window.location.origin);
  
  const requestedIcao24 = (Array.isArray(options.icao24) ? options.icao24 : [options.icao24])
    .filter((identifier): identifier is string => typeof identifier === "string")
    .map((identifier) => identifier.trim().toLowerCase())
    .filter((identifier, index, identifiers) =>
      /^[0-9a-f]{6}$/.test(identifier) && identifiers.indexOf(identifier) === index,
    );
    
  if (requestedIcao24.length > 0) {
    url.searchParams.set("icao", requestedIcao24.join(","));
  } else if (options.callsign) {
    url.searchParams.set("callsign", options.callsign);
  } else if (airport && airport.latitude && airport.longitude) {
    url.searchParams.set("lat", String(airport.latitude));
    url.searchParams.set("lon", String(airport.longitude));
    url.searchParams.set("radius", "50");
  } else if (options.bounds) {
    const lat = (options.bounds.minLatitude + options.bounds.maxLatitude) / 2;
    const lon = (options.bounds.minLongitude + options.bounds.maxLongitude) / 2;
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));
    url.searchParams.set("radius", "250");
  } else {
    // Global feed fallback - since ADSB free aggregators don't support true global without heavy bandwidth
    // we use a default center.
    url.searchParams.set("lat", "51.5");
    url.searchParams.set("lon", "-0.1");
    url.searchParams.set("radius", "250");
  }

  const requestUrl = /^https?:\/\//i.test(baseUrl) ? url.toString() : `${url.pathname}${url.search}`;
  const abort = makeAbortSignal(options.signal, options.timeoutMs ?? 15_000);
  let accessMode: "anonymous" | "authenticated" | "unknown" = "unknown";
  let responseStatus: number | undefined;
  let retryAfterSeconds: number | undefined;
  let rateLimitRemaining: number | undefined;

  try {
    const response = await fetch(requestUrl, { signal: abort.signal, cache: "no-store" });
    accessMode = "anonymous";
    responseStatus = response.status;
    const source = response.headers.get("x-adsb-source") ?? "adsb proxy";
    if (!response.ok) throw new Error(`State feed returned ${response.status}`);
    const payload = (await response.json()) as any;
    
    let payloadStates: any[] = [];
    if (payload.ac && Array.isArray(payload.ac)) {
      payloadStates = payload.ac;
    } else if (payload.hex) {
      payloadStates = [payload];
    }
    
    const maximum = Math.max(1, Math.floor(options.maximumStates ?? 12_000));
    const states = payloadStates
      .slice(0, maximum)
      .map((state: any) => normalizeAdsbAircraft(state, "live", payload.now ?? payload.fetchTime ?? current * 1000));
      
    if (states.length === 0 && requestedIcao24.length === 0) {
      throw new Error("State feed did not contain active aircraft");
    }
    
    return {
      states,
      flights: states,
      time: payload.now ? Math.floor(payload.now / 1000) : current,
      mode: "live",
      source,
      live: true,
      accessMode,
      responseStatus,
    };
  } catch (error) {
    const states = requestedIcao24.length > 0
      ? []
      : createDemoFlightStates(airport, options.now ?? Date.now());
    return {
      states,
      flights: states,
      time: current,
      mode: "demo",
      source: "deterministic demo",
      live: false,
      error: error instanceof Error ? error.message : "Unable to reach ADS-B proxy",
      accessMode,
      ...(responseStatus === undefined ? {} : { responseStatus }),
    };
  } finally {
    abort.cleanup();
  }
}

export interface FlightRouteResult {
  readonly route: [string, string] | null;
  readonly mode: "live" | "demo" | "error";
  readonly error?: string;
}

export async function fetchFlightRoute(callsign: string, options: { signal?: AbortSignal; timeoutMs?: number } = {}): Promise<FlightRouteResult> {
  const abort = makeAbortSignal(options.signal, options.timeoutMs ?? 10_000);
  try {
    const response = await fetch(`/api/opensky/routes?callsign=${callsign}`, { signal: abort.signal, cache: "no-store" });
    if (!response.ok) {
      if (response.status === 404) return { route: null, mode: "live" };
      return { route: null, mode: "error", error: `HTTP ${response.status}` };
    }
    const data = await response.json();
    if (data && Array.isArray(data.route) && data.route.length >= 2) {
      return { route: [data.route[0], data.route[data.route.length - 1]], mode: "live" };
    }
    return { route: null, mode: "live" };
  } catch (error) {
    return { route: null, mode: "error", error: error instanceof Error ? error.message : "Unknown error" };
  } finally {
    abort.cleanup();
  }
}

const BOARD_AIRPORTS = ["SIN", "HKG", "DXB", "LHR", "FRA", "NRT", "SYD", "DOH"];

export function createDemoAirportBoard(
  airport: Airport | string = DEFAULT_AIRPORT,
  now: number | Date = Date.now(),
): AirportBoardResult {
  const selected = airportFromOption(airport);
  const current = epochSeconds(now);
  const offset = selected.iata.charCodeAt(0) % DEMO_SEEDS.length;
  const localFlight = createLocalDemoSeed(selected);
  const createEntry = (movement: "arrival" | "departure", index: number): AirportBoardEntry => {
    const isLocalFlight = movement === "arrival" && index === 0;
    const seedIndex = movement === "arrival"
      ? (offset + Math.max(0, index - 1)) % DEMO_SEEDS.length
      : (offset + 6 + index) % DEMO_SEEDS.length;
    const matchedFlight = isLocalFlight ? localFlight : DEMO_SEEDS[seedIndex];
    const callsign = matchedFlight.callsign;
    const counterpart = BOARD_AIRPORTS[(index + offset) % BOARD_AIRPORTS.length] === selected.iata
      ? "ICN"
      : BOARD_AIRPORTS[(index + offset) % BOARD_AIRPORTS.length];
    const expectedTime = current + (index * 11 + (movement === "arrival" ? 4 : 7)) * 60;
    return {
      id: `${movement}-${selected.icao}-${index}`,
      movement,
      callsign,
      airlineName: getAirlineName(callsign),
      icao24: matchedFlight.icao24.toLowerCase(),
      trackedAirport: selected.icao,
      originAirport: movement === "arrival" ? counterpart : selected.icao,
      destinationAirport: movement === "departure" ? counterpart : selected.icao,
      counterpartAirport: counterpart,
      expectedTime,
      firstSeen: expectedTime - 7_200,
      lastSeen: expectedTime,
      status: "expected",
      dataSource: "demo",
    };
  };
  const arrivals = Array.from({ length: 7 }, (_, index) => createEntry("arrival", index));
  const departures = Array.from({ length: 7 }, (_, index) => createEntry("departure", index));
  return {
    arrivals,
    departures,
    airport: selected.icao,
    time: current,
    mode: "demo",
    source: "deterministic demo",
    live: false,
  };
}

function normalizeBoardFlight(
  value: unknown,
  movement: "arrival" | "departure",
  airport: string,
): AirportBoardEntry | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const icao24 = nullableText(raw.icao24) ?? "------";
  const callsign = (nullableText(raw.callsign) ?? icao24).replace(/\s+/g, "").toUpperCase();
  const firstSeen = nullableNumber(raw.firstSeen) ?? 0;
  const lastSeen = nullableNumber(raw.lastSeen) ?? firstSeen;
  const originAirport = nullableText(raw.estDepartureAirport)?.toUpperCase() ?? null;
  const destinationAirport = nullableText(raw.estArrivalAirport)?.toUpperCase() ?? null;
  return {
    id: `${movement}-${icao24}-${firstSeen}`,
    movement,
    callsign,
    airlineName: getAirlineName(callsign),
    icao24,
    trackedAirport: airport,
    originAirport,
    destinationAirport,
    counterpartAirport: movement === "arrival" ? originAirport : destinationAirport,
    expectedTime: movement === "arrival" ? lastSeen : firstSeen,
    firstSeen,
    lastSeen,
    status: movement === "arrival" ? "landed" : "departed",
    dataSource: "live",
  };
}

export async function fetchAirportBoard(
  airportCode: string,
  options: FetchAirportBoardOptions = {},
): Promise<AirportBoardResult> {
  const airport = findAirport(airportCode) ?? DEFAULT_AIRPORT;
  const trackedCode = airport.icao;
  const current = epochSeconds(options.now);
  const begin = current - 7_200;
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const abort = makeAbortSignal(options.signal, options.timeoutMs ?? 10_000);
  let accessMode: "anonymous" | "authenticated" | "unknown" = "unknown";
  let responseStatus: number | undefined;
  let retryAfterSeconds: number | undefined;
  let rateLimitRemaining: number | undefined;

  try {
    const makeUrl = (movement: "arrivals" | "departures") => {
      const url = new URL(`/api/opensky/${movement}`, typeof window === "undefined" ? "http://localhost" : window.location.origin);
      url.searchParams.set("airport", trackedCode);
      url.searchParams.set("begin", String(begin));
      url.searchParams.set("end", String(current));
      return url.toString();
    };
    const [arrivalResponse, departureResponse] = await Promise.all([
      fetch(makeUrl("arrivals"), { signal: abort.signal, cache: "no-store" }),
      fetch(makeUrl("departures"), { signal: abort.signal, cache: "no-store" }),
    ]);
    const responses = [arrivalResponse, departureResponse];
    const accessModes = responses.map(responseAccessMode);
    accessMode = accessModes.includes("authenticated")
      ? "authenticated"
      : accessModes.includes("anonymous")
        ? "anonymous"
        : "unknown";
    responseStatus = responses.find((response) => !response.ok)?.status ?? 200;
    const retryValues = responses
      .map((response) => numericResponseHeader(response, "x-rate-limit-retry-after-seconds")
        ?? numericResponseHeader(response, "retry-after"))
      .filter((value): value is number => value !== undefined);
    retryAfterSeconds = retryValues.length > 0 ? Math.max(...retryValues) : undefined;
    const remainingValues = responses
      .map((response) => numericResponseHeader(response, "x-rate-limit-remaining"))
      .filter((value): value is number => value !== undefined);
    rateLimitRemaining = remainingValues.length > 0 ? Math.min(...remainingValues) : undefined;
    if (!arrivalResponse.ok || !departureResponse.ok) {
      throw new Error(`Airport feed returned ${arrivalResponse.status}/${departureResponse.status}`);
    }
    const [arrivalPayload, departurePayload] = (await Promise.all([
      arrivalResponse.json(),
      departureResponse.json(),
    ])) as [unknown, unknown];
    if (!Array.isArray(arrivalPayload) || !Array.isArray(departurePayload)) {
      throw new Error("Airport feed returned an invalid payload");
    }
    const arrivals = arrivalPayload
      .map((entry) => normalizeBoardFlight(entry, "arrival", trackedCode))
      .filter((entry): entry is AirportBoardEntry => entry !== null)
      .sort((a, b) => b.expectedTime - a.expectedTime)
      .slice(0, 12);
    const departures = departurePayload
      .map((entry) => normalizeBoardFlight(entry, "departure", trackedCode))
      .filter((entry): entry is AirportBoardEntry => entry !== null)
      .sort((a, b) => b.expectedTime - a.expectedTime)
      .slice(0, 12);
    return {
      arrivals,
      departures,
      airport: trackedCode,
      time: current,
      mode: "live",
      source: "OpenSky Network",
      live: true,
      accessMode,
      responseStatus,
      ...(rateLimitRemaining === undefined ? {} : { rateLimitRemaining }),
    };
  } catch (error) {
    const demo = createDemoAirportBoard(airport, options.now ?? Date.now());
    return {
      ...demo,
      error: error instanceof Error ? error.message : "Unable to reach airport feed",
      accessMode,
      ...(responseStatus === undefined ? {} : { responseStatus }),
      ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }),
      ...(rateLimitRemaining === undefined ? {} : { rateLimitRemaining }),
    };
  } finally {
    abort.cleanup();
  }
}
