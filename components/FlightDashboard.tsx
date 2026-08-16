"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAircraftSpec } from "@/lib/aircraft-db";
import { getFlightIdentifierAliases, normalizeCallsign } from "@/lib/airlines";
import { drawAirlineLogo } from "@/lib/airline-logos";
import {
  DEFAULT_AIRPORT,
  findAirport,
  searchAirports,
  type Airport,
} from "@/lib/airports";
import { measureTextWidth } from "@/lib/bitmap-font";
import { LEDBoard, LED_COLORS, type LedColor } from "@/lib/led-board";
import {
  fetchAirportBoard,
  fetchFlightStates,
} from "@/lib/opensky";
import {
  buildHeadingTrail,
  createRegionalBounds,
  projectLonLat,
  projectLonLatToRegion,
  projectWorldCoastlineCells,
  projectWorldCoastlineCellsInBounds,
  type GeoBounds,
  type GridRect,
  type LedPoint,
} from "@/lib/world-map";
import styles from "./FlightDashboard.module.css";

const GRID_COLUMNS = 136;
const MAIN_DIVIDER = 75;
const HEADER_BOTTOM = 9;
const FOOTER_ROWS = 18;
const AUTHENTICATED_GLOBAL_REFRESH_MS = 10_000;
const AUTHENTICATED_TARGET_REFRESH_MS = 5_000;
const AUTHENTICATED_EMERGENCY_SCAN_MS = 60_000;
const ANONYMOUS_GLOBAL_REFRESH_MS = 10_000;
const ANONYMOUS_TARGET_REFRESH_MS = 5_000;
const ANONYMOUS_EMERGENCY_SCAN_MS = 60_000;
const BOARD_REFRESH_INTERVAL_MS = 6 * 60 * 60_000;
const TRACK_STALE_AFTER_MS = 30_000;
const DETAIL_INTERVAL_MS = 3_000;
const DETAIL_PAGE_COUNT = 4;
const FOCUS_INTERVAL_MS = DETAIL_INTERVAL_MS * DETAIL_PAGE_COUNT;
const BOARD_PAGE_INTERVAL_MS = 3_000;
const BOARD_PAGE_COUNT = 3;
const BOARD_ENTRY_INTERVAL_MS = BOARD_PAGE_INTERVAL_MS * BOARD_PAGE_COUNT;
const EMERGENCY_SQUAWKS = new Set(["7500", "7600", "7700"]);
const EMERGENCY_FRESHNESS_SECONDS = 120;

interface DisplayFlight {
  icao24: string;
  callsign: string;
  originCountry: string;
  lastContact: number | null;
  longitude: number | null;
  latitude: number | null;
  altitudeFt: number | null;
  speedKts: number | null;
  heading: number | null;
  verticalRateFpm: number | null;
  onGround: boolean;
  squawk: string;
  positionSource: string;
  dataSource: "live" | "demo";
  aircraftType?: string;
}

interface DisplayBoardEntry {
  icao24: string;
  callsign: string;
  time: number | string | Date;
  airportCode: string;
}

interface DisplayBoard {
  arrivals: DisplayBoardEntry[];
  departures: DisplayBoardEntry[];
  mode: "live" | "demo";
  rateLimitRemaining?: number;
}

interface RenderSnapshot {
  airport: Airport;
  hasSelectedAirport: boolean;
  trackedAircraft: DisplayFlight | null;
  trackingQuery: string | null;
  trackedLastSeenAt: number | null;
  liveRetryAt: number | null;
  focusStartedAt: number;
  flights: DisplayFlight[];
  board: DisplayBoard;
  rateLimitRemaining?: number;
  flightRoute: [string, string] | null;
}

const EMPTY_BOARD: DisplayBoard = { arrivals: [], departures: [], mode: "demo" };

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function finite(value: unknown): number | null {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function firstFinite(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = finite(record[key]);
    if (value !== null) return value;
  }
  return null;
}

function firstText(record: Record<string, unknown>, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}

function normalizeFlight(value: unknown): DisplayFlight {
  const raw = asRecord(value);
  const altitudeFeet = firstFinite(raw, ["altitudeFt", "barometricAltitudeFt"]);
  const altitudeMeters = firstFinite(raw, ["baroAltitude", "baro_altitude", "geoAltitude"]);
  const speedKnots = firstFinite(raw, ["speedKts", "velocityKts"]);
  const speedMetersPerSecond = firstFinite(raw, ["velocity", "groundSpeed"]);
  const verticalFeet = firstFinite(raw, ["verticalRateFpm"]);
  const verticalMeters = firstFinite(raw, ["verticalRate", "vertical_rate"]);
  const sourceValue = raw.signalSource ?? raw.positionSource ?? raw.position_source ?? raw.source;
  const source =
    typeof sourceValue === "string"
      ? sourceValue
      : sourceValue === 1
        ? "ASTERIX"
        : sourceValue === 2
          ? "MLAT"
          : sourceValue === 3
            ? "FLARM"
            : "ADS-B";

  return {
    icao24: firstText(raw, ["icao24", "icao"], "------").toUpperCase(),
    callsign: normalizeCallsign(firstText(raw, ["callsign", "callSign"], "UNKNOWN")),
    originCountry: firstText(raw, ["originCountry", "origin_country", "country"], "UNKNOWN"),
    lastContact: firstFinite(raw, ["lastContact", "last_contact", "timePosition", "time_position"]),
    longitude: firstFinite(raw, ["longitude", "lon"]),
    latitude: firstFinite(raw, ["latitude", "lat"]),
    altitudeFt: altitudeFeet ?? (altitudeMeters === null ? null : altitudeMeters * 3.28084),
    speedKts: speedKnots ?? (speedMetersPerSecond === null ? null : speedMetersPerSecond * 1.94384),
    heading: firstFinite(raw, ["heading", "headingDeg", "trueTrackDeg", "trueTrack", "true_track"]),
    verticalRateFpm: verticalFeet ?? (verticalMeters === null ? null : verticalMeters * 196.8504),
    onGround: Boolean(raw.onGround ?? raw.on_ground),
    squawk: firstText(raw, ["squawk"], "----").padStart(4, "0").slice(-4),
    positionSource: source.toUpperCase(),
    dataSource: raw.dataSource === "live" ? "live" : "demo",
    aircraftType: firstText(raw, ["aircraftType", "typeCode", "icaoType"]) || undefined,
  };
}

function normalizeFlightResponse(value: unknown): { flights: DisplayFlight[]; mode: "live" | "demo" } {
  const raw = asRecord(value);
  const candidates = Array.isArray(raw.states)
    ? raw.states
    : Array.isArray(raw.flights)
      ? raw.flights
      : Array.isArray(value)
        ? value
        : [];
  return {
    flights: candidates.map(normalizeFlight).filter((flight) => flight.callsign || flight.icao24),
    mode: raw.mode === "live" || raw.live === true ? "live" : "demo",
  };
}

function normalizeBoardEntry(value: unknown, direction: "arrival" | "departure"): DisplayBoardEntry {
  const raw = asRecord(value);
  const airportValue =
    direction === "arrival"
      ? firstText(raw, ["origin", "originAirport", "estDepartureAirport"], "---")
      : firstText(raw, ["destination", "destinationAirport", "estArrivalAirport"], "---");
  const timestamp =
    raw.expectedTime ??
    raw.estimatedTime ??
    raw.time ??
    (direction === "arrival" ? raw.lastSeen : raw.firstSeen) ??
    Date.now();
  return {
    icao24: firstText(raw, ["icao24", "icao"], "------").toUpperCase(),
    callsign: normalizeCallsign(firstText(raw, ["callsign", "callSign"], "------")),
    time: timestamp as number | string | Date,
    airportCode: String(airportValue).toUpperCase().slice(0, 4),
  };
}

function normalizeBoardResponse(value: unknown): DisplayBoard {
  const raw = asRecord(value);
  const arrivals = Array.isArray(raw.arrivals) ? raw.arrivals : [];
  const departures = Array.isArray(raw.departures) ? raw.departures : [];
  return {
    arrivals: arrivals.map((entry) => normalizeBoardEntry(entry, "arrival")),
    departures: departures.map((entry) => normalizeBoardEntry(entry, "departure")),
    mode: raw.mode === "live" ? "live" : "demo",
  };
}

function pad(value: number, size = 2): string {
  return Math.abs(Math.round(value)).toString().padStart(size, "0");
}

function roundOrDash(value: number | null, size: number): string {
  return value === null ? "-".repeat(size) : pad(value, size).slice(-size);
}

function truncateCells(value: string, maxCells: number, spacing = 0): string {
  let output = "";
  for (const character of value.toUpperCase()) {
    const candidate = output + character;
    if (measureTextWidth(candidate, 1, spacing) > maxCells) break;
    output = candidate;
  }
  return output;
}

function formatClock(date: Date, page: number): string {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return page === 0
    ? `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    : `${pad(date.getDate())} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatAirportCity(city: string): string {
  const concise = city.toUpperCase().replace(/\s+CITY$/, "");
  return truncateCells(concise, 65, 1);
}

function formatBoardTime(value: number | string | Date, timezone: string): string {
  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "number") {
    date = new Date(value < 10_000_000_000 ? value * 1000 : value);
  } else {
    date = new Date(value);
  }
  if (Number.isNaN(date.valueOf())) return "----";
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "--";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "--";
  return `${hour}${minute}`;
}

function flightStatus(flight: DisplayFlight): {
  label: string;
  color: LedColor;
  emergency: boolean;
} {
  const emergency = EMERGENCY_SQUAWKS.has(flight.squawk);
  if (emergency) return { label: "EMERGENCY", color: LED_COLORS.red, emergency: true };
  if (flight.onGround) return { label: "GROUND", color: LED_COLORS.blue, emergency: false };
  return { label: "EN ROUTE", color: LED_COLORS.green, emergency: false };
}

function distanceKm(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
): number {
  const radians = Math.PI / 180;
  const latitudeDelta = (latitudeB - latitudeA) * radians;
  const longitudeDelta = (longitudeB - longitudeA) * radians;
  const startLatitude = latitudeA * radians;
  const endLatitude = latitudeB * radians;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 12_742 * Math.asin(Math.sqrt(haversine));
}

function isFreshFlight(flight: DisplayFlight, now: number): boolean {
  return flight.lastContact !== null
    && now / 1_000 - flight.lastContact <= EMERGENCY_FRESHNESS_SECONDS;
}

function selectFocusedFlight(
  flights: DisplayFlight[],
  airport: Airport | null,
  board: DisplayBoard,
  elapsed: number,
  trackedAircraft: DisplayFlight | null,
  trackingPending: boolean,
): DisplayFlight | null {
  const positioned = flights.filter(
    (flight) => flight.longitude !== null && flight.latitude !== null,
  );
  const focusCycle = Math.floor(Math.max(0, elapsed) / FOCUS_INTERVAL_MS);
  const now = Date.now();
  const generalEmergencies = flights.filter((flight) =>
    flight.squawk === "7700" && isFreshFlight(flight, now),
  );
  if (generalEmergencies.length > 0) {
    return generalEmergencies[focusCycle % generalEmergencies.length];
  }

  if (trackingPending) return null;

  if (trackedAircraft) {
    return flights.find((flight) =>
      flight.icao24 === trackedAircraft.icao24
      || (flight.callsign !== "UNKNOWN" && flight.callsign === trackedAircraft.callsign),
    ) ?? trackedAircraft;
  }

  if (!airport) {
    const randomPool = positioned.length > 0 ? positioned : flights;
    if (randomPool.length === 0) return null;
    const mixedSeed = (Math.imul(focusCycle + 1, 1_664_525) + 1_013_904_223) >>> 0;
    return randomPool[mixedSeed % randomPool.length];
  }

  const boardEntries = [...board.arrivals, ...board.departures];
  const boardIcao24 = new Set(
    boardEntries
      .map((entry) => entry.icao24)
      .filter((identifier) => identifier !== "------"),
  );
  const boardCallsigns = new Set(
    boardEntries
      .map((entry) => entry.callsign)
      .filter((identifier) => identifier !== "------"),
  );
  const boardMatchedFlights = positioned.filter((flight) =>
    flight.dataSource === board.mode
    && (boardIcao24.has(flight.icao24) || boardCallsigns.has(flight.callsign)),
  );
  const ranked = boardMatchedFlights
    .map((flight) => ({
      flight,
      distance: distanceKm(
        airport.latitude,
        airport.longitude,
        flight.latitude!,
        flight.longitude!,
      ),
    }))
    .sort((left, right) => left.distance - right.distance);
  return ranked[0]?.flight ?? null;
}

function findAircraft(
  flights: DisplayFlight[],
  query: string,
): DisplayFlight | undefined {
  const aliases = new Set(getFlightIdentifierAliases(query));
  return flights.find((flight) =>
    aliases.has(flight.icao24.replace(/[^A-Z0-9]/g, ""))
    || aliases.has(flight.callsign.replace(/[^A-Z0-9]/g, "")),
  );
}

function mergeFlightPool(
  current: DisplayFlight[],
  updates: DisplayFlight[],
): DisplayFlight[] {
  if (updates.length === 0) return current;
  const updatedIcao24 = new Set(updates.map((flight) => flight.icao24));
  const updatedCallsigns = new Set(
    updates
      .map((flight) => flight.callsign)
      .filter((callsign) => callsign !== "UNKNOWN"),
  );
  return [
    ...current.filter((flight) =>
      !updatedIcao24.has(flight.icao24)
      && (flight.callsign === "UNKNOWN" || !updatedCallsigns.has(flight.callsign)),
    ),
    ...updates,
  ];
}

interface FeedPollMetadata {
  readonly accessMode?: "anonymous" | "authenticated" | "unknown";
  readonly responseStatus?: number;
  readonly retryAfterSeconds?: number;
}

function retryDelayMs(metadata: FeedPollMetadata): number | null {
  const seconds = metadata.retryAfterSeconds;
  return typeof seconds === "number" && Number.isFinite(seconds) && seconds > 0
    ? Math.ceil(seconds * 1_000) + 1_000
    : null;
}

function nextFlightRefreshDelay(
  metadata: FeedPollMetadata,
  targeted: boolean,
): number {
  const retryDelay = retryDelayMs(metadata);
  if (retryDelay !== null) return retryDelay;
  const normalDelay = metadata.accessMode === "authenticated"
    ? targeted ? AUTHENTICATED_TARGET_REFRESH_MS : AUTHENTICATED_GLOBAL_REFRESH_MS
    : targeted ? ANONYMOUS_TARGET_REFRESH_MS : ANONYMOUS_GLOBAL_REFRESH_MS;
  if (metadata.responseStatus === 429) {
    return Math.max(normalDelay, ANONYMOUS_TARGET_REFRESH_MS);
  }
  return typeof metadata.responseStatus === "number" && metadata.responseStatus >= 500
    ? Math.max(normalDelay, ANONYMOUS_TARGET_REFRESH_MS)
    : normalDelay;
}

function nextBoardRefreshDelay(metadata: FeedPollMetadata): number {
  return retryDelayMs(metadata) ?? BOARD_REFRESH_INTERVAL_MS;
}

function nextEmergencyScanDelay(metadata: FeedPollMetadata): number {
  const retryDelay = retryDelayMs(metadata);
  if (retryDelay !== null) return retryDelay;
  return metadata.accessMode === "authenticated"
    ? AUTHENTICATED_EMERGENCY_SCAN_MS
    : ANONYMOUS_EMERGENCY_SCAN_MS;
}

function normalizeTrackingQuery(query: string): string {
  return getFlightIdentifierAliases(query)[0] ?? "";
}

function isTrackableIdentifier(query: string): boolean {
  return /^[0-9A-F]{6}$/.test(query)
    || (/^[A-Z0-9]{3,8}$/.test(query) && /\d/.test(query));
}

function directIcao24(query: string): string | null {
  return /^[0-9A-F]{6}$/.test(query) ? query : null;
}

function boardIcao24ForQuery(board: DisplayBoard, query: string): string | null {
  if (board.mode !== "live") return null;
  const aliases = new Set(getFlightIdentifierAliases(query));
  const entry = [...board.arrivals, ...board.departures].find((candidate) =>
    /^[0-9A-F]{6}$/.test(candidate.icao24)
    && (aliases.has(candidate.icao24) || aliases.has(candidate.callsign)),
  );
  return entry?.icao24 ?? null;
}

function drawHeader(
  board: LEDBoard,
  snapshot: RenderSnapshot,
  now: number,
  emergencyCount: number,
): void {
  const airportPage = Math.floor(now / 3_000) % 3;
  board.text(formatClock(new Date(now), airportPage), 2, 1, LED_COLORS.white, {
    spacing: 1,
    maxWidth: 65,
  });
  if (emergencyCount > 0) {
    board.text(`EMG ${Math.min(9, emergencyCount)}`, 134, 1, LED_COLORS.red, {
      spacing: 1,
      maxWidth: 29,
      align: "right",
    });
    return;
  }
  if (snapshot.trackedAircraft) {
    const trackingIsStale = snapshot.trackedLastSeenAt === null
      || now - snapshot.trackedLastSeenAt > TRACK_STALE_AFTER_MS;
    const trackedLabel = trackingIsStale
      ? "TRK LOST"
      : airportPage === 0
        ? `TRK ${snapshot.trackedAircraft.callsign.slice(0, 7)}`
        : airportPage === 1 
          ? `ID ${snapshot.trackedAircraft.icao24.slice(0, 6)}`
          : snapshot.board.rateLimitRemaining !== undefined 
            ? `API ${snapshot.board.rateLimitRemaining}` 
            : `TRK ${snapshot.trackedAircraft.callsign.slice(0, 7)}`;
    board.text(trackedLabel, 102, 1, trackingIsStale ? LED_COLORS.redDim : LED_COLORS.blue, {
      spacing: 1,
      maxWidth: 65,
      align: "center",
    });
    return;
  }
  if (snapshot.trackingQuery) {
    const rateLimited = snapshot.liveRetryAt !== null && snapshot.liveRetryAt > now;
    const waitingLabel = airportPage === 0
      ? rateLimited ? "RATE LIMIT" : "TRK WAIT"
      : airportPage === 1
        ? snapshot.trackingQuery.slice(0, 8)
        : snapshot.board.rateLimitRemaining !== undefined 
          ? `API ${snapshot.board.rateLimitRemaining}`
          : snapshot.trackingQuery.slice(0, 8);
    board.text(waitingLabel, 102, 1, rateLimited ? LED_COLORS.redDim : LED_COLORS.amber, {
      spacing: 1,
      maxWidth: 65,
      align: "center",
    });
    return;
  }
  const airportLabel = !snapshot.hasSelectedAirport
    ? airportPage === 0 ? "GLOBAL" : airportPage === 1 ? "NO AIRPORT" : (snapshot.board.rateLimitRemaining !== undefined ? `API ${snapshot.board.rateLimitRemaining}` : "GLOBAL")
    : airportPage === 0
      ? `${snapshot.airport.iata}/${snapshot.airport.icao}`
      : airportPage === 1
        ? formatAirportCity(snapshot.airport.city)
        : snapshot.board.rateLimitRemaining !== undefined ? `API ${snapshot.board.rateLimitRemaining}` : `${snapshot.airport.iata}/${snapshot.airport.icao}`;
  board.text(airportLabel, 102, 1, LED_COLORS.whiteDim, {
    spacing: 1,
    maxWidth: 65,
    align: "center",
  });
}

function drawFieldRow(
  board: LEDBoard,
  label: string,
  value: string,
  y: number,
  valueColor: LedColor = LED_COLORS.white,
): void {
  board.text(label, 3, y, LED_COLORS.amberLow, {
    spacing: 1,
    maxWidth: 43,
  });
  board.text(value, 73, y, valueColor, {
    spacing: 1,
    maxWidth: 42,
    align: "right",
  });
}

function drawMainFlight(
  board: LEDBoard,
  flight: DisplayFlight | null,
  elapsed: number,
  awaitingBoardMatch = false,
  trackingQuery: string | null = null,
  rateLimited = false,
): void {
  if (!flight) {
    const title = trackingQuery
      ? rateLimited ? "RATE LIMIT" : "TRACK WAIT"
      : awaitingBoardMatch ? "NO MATCH" : "NO SIGNAL";
    const detail = trackingQuery ? trackingQuery.slice(0, 8) : awaitingBoardMatch ? "ARR DEP" : "RETRYING";
    board.text(title, 37, 22, LED_COLORS.white, {
      spacing: 1,
      maxWidth: 53,
      align: "center",
    });
    board.text(detail, 37, 43, trackingQuery
      ? rateLimited ? LED_COLORS.redDim : LED_COLORS.amber
      : LED_COLORS.ghost, {
      spacing: 1,
      maxWidth: 47,
      align: "center",
    });
    return;
  }

  const status = flightStatus(flight);
  drawAirlineLogo(board, flight.callsign, 3, 11);
  board.text(status.label, 72, 11, status.color, {
    spacing: 1,
    maxWidth: 53,
    align: "right",
  });

  const callsign = (flight.callsign || flight.icao24).toUpperCase().slice(0, 8);
  const scale = measureTextWidth(callsign, 2, 1) <= 71 ? 2 : 1;
  const spacing = scale === 2 ? 1 : 2;
  const callsignWidth = measureTextWidth(callsign, scale, spacing);
  board.text(callsign, 2 + Math.max(0, Math.floor((71 - callsignWidth) / 2)), scale === 2 ? 21 : 24, LED_COLORS.white, {
    scale,
    spacing,
    maxWidth: 71,
  });
  board.horizontal(3, 72, 37, status.emergency ? LED_COLORS.redDim : LED_COLORS.border, 2);

  const page = Math.floor(Math.max(0, elapsed) / DETAIL_INTERVAL_MS) % DETAIL_PAGE_COUNT;
  if (page === 0) {
    const altitude = flight.altitudeFt === null ? "-----" : `${Math.max(0, Math.round(flight.altitudeFt))}FT`;
    const speed = flight.speedKts === null ? "---" : `${Math.round(flight.speedKts)}KT`;
    drawFieldRow(board, "ALT", altitude, 40, LED_COLORS.white);
    drawFieldRow(board, "SPEED", speed, 50, LED_COLORS.white);
  } else if (page === 1) {
    const heading = flight.heading === null ? "---" : pad(flight.heading, 3);
    const vertical = flight.verticalRateFpm === null
      ? "----"
      : `${flight.verticalRateFpm >= 0 ? "+" : "-"}${Math.min(9999, Math.abs(Math.round(flight.verticalRateFpm)))}`;
    drawFieldRow(board, "HEADING", heading, 40, LED_COLORS.white);
    drawFieldRow(board, "V RATE", vertical, 50, LED_COLORS.white);
  } else if (page === 2) {
    drawFieldRow(
      board,
      "SQUAWK",
      flight.squawk,
      40,
      status.emergency ? LED_COLORS.red : LED_COLORS.white,
    );
    drawFieldRow(board, "ICAO", flight.icao24.toUpperCase().slice(0, 6), 50, LED_COLORS.white);
  } else {
    const rawSource = flight.positionSource.replace(/[^A-Z0-9]/g, "");
    const source = rawSource === "ASTERIX"
      ? "ASTRX"
      : rawSource === "UNKNOWN"
        ? "UNK"
        : rawSource.slice(0, 5) || "UNK";
    const spec = getAircraftSpec(flight.aircraftType);
    drawFieldRow(board, "SOURCE", source, 40, LED_COLORS.white);
    drawFieldRow(board, "TYPE", spec?.icaoType ?? flight.aircraftType ?? "UNKNOWN", 50, LED_COLORS.white);
  }
}

function interpolatePosition(
  longitude: number,
  latitude: number,
  speedKts: number | null,
  headingDeg: number | null,
  lastContact: number | null,
  now: number
): [number, number] {
  if (speedKts === null || headingDeg === null || lastContact === null) return [longitude, latitude];
  
  const elapsedSeconds = Math.max(0, (now / 1000) - lastContact);
  if (elapsedSeconds > 60 || elapsedSeconds < 0) return [longitude, latitude];
  
  const distanceKm = speedKts * 1.852 * (elapsedSeconds / 3600);
  const radiusEarthKm = 6371.01;
  const angularDistance = distanceKm / radiusEarthKm;
  const headingRad = headingDeg * (Math.PI / 180);
  const latRad = latitude * (Math.PI / 180);
  const lonRad = longitude * (Math.PI / 180);

  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(angularDistance) +
    Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(headingRad)
  );

  const newLonRad = lonRad + Math.atan2(
    Math.sin(headingRad) * Math.sin(angularDistance) * Math.cos(latRad),
    Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(newLatRad)
  );

  return [
    ((newLonRad * (180 / Math.PI) + 540) % 360) - 180,
    newLatRad * (180 / Math.PI)
  ];
}

function drawMap(
  board: LEDBoard,
  snapshot: RenderSnapshot,
  focused: DisplayFlight | null,
  footerTop: number,
  now: number,
  coastCache: React.MutableRefObject<{ key: string; cells: LedPoint[] } | null>,
): void {
  const rect: GridRect = {
    x: 79,
    y: 20,
    width: 54,
    height: Math.max(15, footerTop - 22),
  };

  const focusedHasPosition = focused !== null
    && focused.longitude !== null
    && focused.latitude !== null;
  const trackedHasPosition = snapshot.trackedAircraft !== null
    && snapshot.trackedAircraft.longitude !== null
    && snapshot.trackedAircraft.latitude !== null;
    
  const getInterpolatedPoint = (flight: DisplayFlight, nowMs: number) => {
    if (flight.longitude === null || flight.latitude === null) return null;
    if (flight.dataSource !== "live") return [flight.longitude, flight.latitude] as const;
    return interpolatePosition(
      flight.longitude,
      flight.latitude,
      flight.speedKts,
      flight.heading,
      flight.lastContact,
      nowMs
    );
  };
  
  const focusedInterp = focused ? getInterpolatedPoint(focused, now) : null;
  const trackedInterp = snapshot.trackedAircraft ? getInterpolatedPoint(snapshot.trackedAircraft, now) : null;

  const followFocused = Boolean(
    focusedHasPosition
    && (snapshot.trackedAircraft || focused?.squawk === "7700"),
  );
  const regionalCenter = followFocused && focusedInterp
    ? focusedInterp
    : trackedHasPosition && trackedInterp
      ? trackedInterp
    : snapshot.hasSelectedAirport
      ? [snapshot.airport.longitude, snapshot.airport.latitude] as const
      : null;
  const regionalBounds: GeoBounds | null = regionalCenter
    ? createRegionalBounds(regionalCenter, {
        latitudeSpan: snapshot.trackedAircraft ? 12 : 16,
        aspectRatio: rect.width / rect.height,
      })
    : null;
  const cacheKey = regionalBounds
    ? `${rect.x}:${rect.y}:${rect.width}:${rect.height}:${regionalBounds.west.toFixed(3)}:${regionalBounds.south.toFixed(3)}:${regionalBounds.east.toFixed(3)}:${regionalBounds.north.toFixed(3)}`
    : `${rect.x}:${rect.y}:${rect.width}:${rect.height}:world`;
  if (!coastCache.current || coastCache.current.key !== cacheKey) {
    coastCache.current = {
      key: cacheKey,
      cells: regionalBounds
        ? projectWorldCoastlineCellsInBounds(rect, regionalBounds)
        : projectWorldCoastlineCells(rect),
    };
  }

  const projectMapPoint = (longitude: number, latitude: number): LedPoint | null =>
    regionalBounds
      ? projectLonLatToRegion([longitude, latitude], rect, regionalBounds)
      : projectLonLat([longitude, latitude], rect);

  if (!regionalBounds) {
    const equatorY = projectLonLat([0, 0], rect).y;
    board.horizontal(rect.x, rect.x + rect.width - 1, equatorY, LED_COLORS.off, 2);
  }
  for (const cell of coastCache.current.cells) board.set(cell.x, cell.y, LED_COLORS.border);

  for (const flight of snapshot.flights) {
    const pos = getInterpolatedPoint(flight, now);
    if (!pos) continue;
    const point = projectMapPoint(pos[0], pos[1]);
    if (!point) continue;
    board.set(point.x, point.y, LED_COLORS.amberLow);
  }

  if (snapshot.hasSelectedAirport) {
    const airportPoint = projectMapPoint(snapshot.airport.longitude, snapshot.airport.latitude);
    if (airportPoint) {
      board.set(airportPoint.x, airportPoint.y, LED_COLORS.whiteDim);
      board.set(airportPoint.x - 1, airportPoint.y, LED_COLORS.amberLow);
      board.set(airportPoint.x + 1, airportPoint.y, LED_COLORS.amberLow);
      board.set(airportPoint.x, airportPoint.y - 1, LED_COLORS.amberLow);
      board.set(airportPoint.x, airportPoint.y + 1, LED_COLORS.amberLow);
    }
  }

  if (!focused || !focusedInterp) return;
  const status = flightStatus(focused);
  const trail = buildHeadingTrail(
    focusedInterp,
    focused.heading ?? 0,
    regionalBounds ? 4 : 22,
    9,
  );
  trail.forEach((position, index) => {
    const point = projectMapPoint(position[0], position[1]);
    if (!point) return;
    const pulse = (index + Math.floor(now / 180)) % trail.length;
    const color = status.emergency
      ? index > 5 || pulse === trail.length - 1
        ? LED_COLORS.red
        : LED_COLORS.redDim
      : index > 6 || pulse === trail.length - 1
        ? LED_COLORS.amber
        : index > 3
          ? LED_COLORS.amberLow
          : LED_COLORS.ghost;
    board.set(point.x, point.y, color);
  });

  const focusPoint = projectMapPoint(focusedInterp[0], focusedInterp[1]);
  if (!focusPoint) return;
  const trackedPositionIsStale = snapshot.trackedAircraft !== null
    && snapshot.trackedLastSeenAt !== null
    && now - snapshot.trackedLastSeenAt > TRACK_STALE_AFTER_MS;
  const focusColor = status.emergency
    ? LED_COLORS.red
    : trackedPositionIsStale
      ? LED_COLORS.amber
      : LED_COLORS.white;
  board.set(focusPoint.x, focusPoint.y, focusColor);
  board.set(focusPoint.x - 2, focusPoint.y, focusColor);
  board.set(focusPoint.x + 2, focusPoint.y, focusColor);
  board.set(focusPoint.x, focusPoint.y - 2, focusColor);
  board.set(focusPoint.x, focusPoint.y + 2, focusColor);
}

function drawBoardEntry(
  board: LEDBoard,
  entry: DisplayBoardEntry | undefined,
  centerX: number,
  y: number,
  timezone: string,
  direction: "arrival" | "departure",
  page: number,
): void {
  if (!entry) {
    board.text("NO FLIGHTS", centerX, y, LED_COLORS.ghost, {
      spacing: 1,
      maxWidth: 59,
      align: "center",
    });
    return;
  }
  if (page === 0) {
    board.text(entry.callsign.slice(0, 6), centerX, y, LED_COLORS.white, {
      spacing: 1,
      maxWidth: 35,
      align: "center",
    });
  } else if (page === 1) {
    drawCenteredPair(board, "TIME", formatBoardTime(entry.time, timezone), centerX, y);
  } else {
    drawCenteredPair(
      board,
      direction === "arrival" ? "FROM" : "TO",
      entry.airportCode.slice(0, 3),
      centerX,
      y,
    );
  }
}

function drawCenteredPair(
  board: LEDBoard,
  label: string,
  value: string,
  centerX: number,
  y: number,
): void {
  const gap = 4;
  const labelWidth = measureTextWidth(label, 1, 1);
  const valueWidth = measureTextWidth(value, 1, 1);
  const startX = Math.round(centerX - (labelWidth + gap + valueWidth) / 2);
  board.text(label, startX, y, LED_COLORS.amberLow, { spacing: 1 });
  board.text(value, startX + labelWidth + gap, y, LED_COLORS.white, { spacing: 1 });
}

function drawFooter(board: LEDBoard, snapshot: RenderSnapshot, footerTop: number, now: number): void {
  if (snapshot.flightRoute) {
    board.vertical(68, footerTop, board.rows - 1, LED_COLORS.border);
    board.text("DEP", 34, footerTop + 2, LED_COLORS.blue, {
      spacing: 1,
      maxWidth: 17,
      align: "center",
    });
    board.text("ARR", 102, footerTop + 2, LED_COLORS.green, {
      spacing: 1,
      maxWidth: 17,
      align: "center",
    });
    drawCenteredPair(board, "FROM", snapshot.flightRoute[0], 34, footerTop + 10);
    drawCenteredPair(board, "TO", snapshot.flightRoute[1], 102, footerTop + 10);
    return;
  }

  if (!snapshot.hasSelectedAirport) {
    const trackingIsStale = snapshot.trackedAircraft !== null
      && (snapshot.trackedLastSeenAt === null
        || now - snapshot.trackedLastSeenAt > TRACK_STALE_AFTER_MS);
    const globalFooterLabel = snapshot.trackedAircraft
      ? trackingIsStale
        ? "TRACK LOST"
        : `TRACKING ${snapshot.trackedAircraft.callsign.slice(0, 6)}`
      : snapshot.trackingQuery
        ? `${snapshot.liveRetryAt !== null && snapshot.liveRetryAt > now ? "LIMIT" : "WAIT"} ${snapshot.trackingQuery.slice(0, 8)}`
        : "SELECT AIRPORT";
    
    board.text(globalFooterLabel, 68, footerTop + 6, LED_COLORS.whiteDim, {
      spacing: 1,
      maxWidth: 95,
      align: "center",
    });
    return;
  }
  board.vertical(68, footerTop, board.rows - 1, LED_COLORS.border);
  board.text("ARR", 34, footerTop + 2, LED_COLORS.green, {
    spacing: 1,
    maxWidth: 17,
    align: "center",
  });
  board.text("DEP", 102, footerTop + 2, LED_COLORS.blue, {
    spacing: 1,
    maxWidth: 17,
    align: "center",
  });
  const boardElapsed = Math.max(0, now - snapshot.focusStartedAt);
  const page = Math.floor(boardElapsed / BOARD_PAGE_INTERVAL_MS) % BOARD_PAGE_COUNT;
  const arrivalIndex = snapshot.board.arrivals.length
    ? Math.floor(boardElapsed / BOARD_ENTRY_INTERVAL_MS) % snapshot.board.arrivals.length
    : 0;
  const departureIndex = snapshot.board.departures.length
    ? Math.floor(boardElapsed / BOARD_ENTRY_INTERVAL_MS) % snapshot.board.departures.length
    : 0;
  drawBoardEntry(board, snapshot.board.arrivals[arrivalIndex], 34, footerTop + 10, snapshot.airport.timezone, "arrival", page);
  drawBoardEntry(board, snapshot.board.departures[departureIndex], 102, footerTop + 10, snapshot.airport.timezone, "departure", page);
}

function drawFrame(
  board: LEDBoard,
  snapshot: RenderSnapshot,
  now: number,
  coastCache: React.MutableRefObject<{ key: string; cells: LedPoint[] } | null>,
): void {
  board.clear();
  const footerTop = Math.max(48, board.rows - FOOTER_ROWS);
  const focusElapsed = Math.max(0, now - snapshot.focusStartedAt);
  const emergencyCount = snapshot.flights.filter((flight) =>
    EMERGENCY_SQUAWKS.has(flight.squawk) && isFreshFlight(flight, now),
  ).length;
  const focused = selectFocusedFlight(
    snapshot.flights,
    snapshot.hasSelectedAirport ? snapshot.airport : null,
    snapshot.board,
    focusElapsed,
    snapshot.trackedAircraft,
    snapshot.trackingQuery !== null && snapshot.trackedAircraft === null,
  );

  board.horizontal(0, GRID_COLUMNS - 1, HEADER_BOTTOM, LED_COLORS.border);
  board.horizontal(0, GRID_COLUMNS - 1, footerTop, LED_COLORS.border);
  board.vertical(MAIN_DIVIDER, HEADER_BOTTOM, footerTop, LED_COLORS.border);
  drawHeader(board, snapshot, now, emergencyCount);
  drawMainFlight(
    board,
    focused,
    focusElapsed,
    snapshot.hasSelectedAirport
      && snapshot.trackedAircraft === null
      && snapshot.trackingQuery === null,
    snapshot.trackedAircraft === null ? snapshot.trackingQuery : null,
    snapshot.liveRetryAt !== null && snapshot.liveRetryAt > now,
  );
  drawMap(board, snapshot, focused, footerTop, now, coastCache);
  drawFooter(board, snapshot, footerTop, now);
  board.render();
}

export default function FlightDashboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const coastCache = useRef<{ key: string; cells: LedPoint[] } | null>(null);
  const [airport, setAirport] = useState<Airport>(DEFAULT_AIRPORT);
  const [hasSelectedAirport, setHasSelectedAirport] = useState(false);
  const [hasLoadedPreference, setHasLoadedPreference] = useState(false);
  const [focusStartedAt, setFocusStartedAt] = useState(() => Date.now());
  const [flights, setFlights] = useState<DisplayFlight[]>([]);
  const [trackedAircraft, setTrackedAircraft] = useState<DisplayFlight | null>(null);
  const [trackingQuery, setTrackingQuery] = useState<string | null>(null);
  const [trackedLastSeenAt, setTrackedLastSeenAt] = useState<number | null>(null);
  const [liveRetryAt, setLiveRetryAt] = useState<number | null>(null);
  const [flightBoard, setFlightBoard] = useState<DisplayBoard>(EMPTY_BOARD);
  const [flightRoute, setFlightRoute] = useState<[string, string] | null>(null);
  const [query, setQuery] = useState("");
  const [invalidSearch, setInvalidSearch] = useState(false);

  const snapshot = useMemo<RenderSnapshot>(
    () => ({
      airport,
      hasSelectedAirport,
      trackedAircraft,
      trackingQuery,
      trackedLastSeenAt,
      liveRetryAt,
      focusStartedAt,
      flights,
      board: flightBoard,
      flightRoute,
    }),
    [
      airport,
      hasSelectedAirport,
      trackedAircraft,
      trackingQuery,
      trackedLastSeenAt,
      liveRetryAt,
      focusStartedAt,
      flights,
      flightBoard,
      flightRoute,
    ],
  );
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;
  const boardResolvedTrackingIcao24 = useMemo(
    () => trackingQuery ? boardIcao24ForQuery(flightBoard, trackingQuery) : null,
    [flightBoard, trackingQuery],
  );
  const targetedTrackingIcao24 = useMemo(
    () => trackingQuery
      ? trackedAircraft?.icao24 ?? directIcao24(trackingQuery) ?? boardResolvedTrackingIcao24
      : null,
    [boardResolvedTrackingIcao24, trackedAircraft?.icao24, trackingQuery],
  );

  useEffect(() => {
    const savedCode = window.localStorage.getItem("aeroflight-airport");
    const savedAirport = findAirport(savedCode);
    if (savedAirport) {
      setAirport(savedAirport);
      setHasSelectedAirport(true);
    }
    setHasLoadedPreference(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedPreference) return;
    if (hasSelectedAirport) window.localStorage.setItem("aeroflight-airport", airport.iata);
    else window.localStorage.removeItem("aeroflight-airport");
    setFocusStartedAt(Date.now());
  }, [airport, hasLoadedPreference, hasSelectedAirport]);

  useEffect(() => {
    if (!hasLoadedPreference) return;
    if (!hasSelectedAirport) {
      setFlightBoard(EMPTY_BOARD);
      return;
    }

    let cancelled = false;
    let timer: number | undefined;

    const refreshBoard = async () => {
      const boardResult = await fetchAirportBoard(airport.icao);
      if (cancelled) return;
      setFlightBoard(normalizeBoardResponse(boardResult));
      timer = window.setTimeout(
        () => void refreshBoard(),
        nextBoardRefreshDelay(boardResult),
      );
    };

    void refreshBoard();
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [airport, hasLoadedPreference, hasSelectedAirport]);

  useEffect(() => {
    if (!hasLoadedPreference) return;
    let cancelled = false;
    let timer: number | undefined;

    const refreshFlights = async () => {
      const currentSnapshot = snapshotRef.current;
      const currentTrackingQuery = currentSnapshot.trackingQuery;
      const knownTrackedIcao24 = currentSnapshot.trackedAircraft?.icao24
        ?? (currentTrackingQuery
          ? directIcao24(currentTrackingQuery) ?? boardResolvedTrackingIcao24
          : null);
      const knownTrackedCallsign = !knownTrackedIcao24 && currentTrackingQuery && isTrackableIdentifier(currentTrackingQuery)
        ? currentTrackingQuery
        : null;

      const flightResult = await (knownTrackedIcao24
        ? fetchFlightStates({ airport, icao24: knownTrackedIcao24, maximumStates: 1 })
        : knownTrackedCallsign
          ? fetchFlightStates({ airport, callsign: knownTrackedCallsign, maximumStates: 1 })
          : hasSelectedAirport
            ? fetchFlightStates({ airport, maximumStates: 50_000 })
            : fetchFlightStates({ maximumStates: 50_000 }));
      if (cancelled) return;
      if (flightResult.responseStatus === 429) {
        setLiveRetryAt(
          Date.now() + (flightResult.retryAfterSeconds ?? ANONYMOUS_TARGET_REFRESH_MS / 1_000) * 1_000,
        );
      } else if (flightResult.live) {
        setLiveRetryAt(null);
      }
      const nextFlights = normalizeFlightResponse(flightResult);
      if (knownTrackedIcao24) {
        if (nextFlights.mode === "live" && nextFlights.flights.length > 0) {
          setFlights((current) => mergeFlightPool(current, nextFlights.flights));
        }
      } else {
        setFlights(nextFlights.flights);
      }
      let resolvedTarget = false;
      if (currentTrackingQuery) {
        const refreshedTrackedAircraft = findAircraft(nextFlights.flights, knownTrackedIcao24 ?? currentTrackingQuery)
          ?? (currentSnapshot.trackedAircraft
            ? findAircraft(nextFlights.flights, currentSnapshot.trackedAircraft.callsign)
            : undefined);
        if (refreshedTrackedAircraft?.dataSource === "live") {
          setTrackedAircraft(refreshedTrackedAircraft);
          setTrackedLastSeenAt(Date.now());
          resolvedTarget = true;
        }
      }
      setFocusStartedAt(Date.now());
      timer = window.setTimeout(
        () => void refreshFlights(),
        nextFlightRefreshDelay(flightResult, Boolean(knownTrackedIcao24) || resolvedTarget),
      );
      if (!cancelled) {
        if (flightResult.rateLimitRemaining !== undefined) {
          setFlightBoard((board) => ({ ...board, rateLimitRemaining: flightResult.rateLimitRemaining }));
        }
      }
    };

    void refreshFlights();
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [
    airport,
    boardResolvedTrackingIcao24,
    hasLoadedPreference,
    hasSelectedAirport,
    trackingQuery,
  ]);

  useEffect(() => {
    if (!trackedAircraft || trackedAircraft.callsign === "UNKNOWN") {
      setFlightRoute(null);
      return;
    }

    setFlightRoute(null);

    let cancelled = false;
    const fetchRoute = async () => {
      const { fetchFlightRoute } = await import("@/lib/opensky");
      const result = await fetchFlightRoute(trackedAircraft.callsign);
      if (!cancelled) {
        setFlightRoute(result.route ?? ["N/A", "N/A"]);
      }
    };

    fetchRoute();
    return () => {
      cancelled = true;
    };
  }, [trackedAircraft?.callsign]);

  useEffect(() => {
    if (!hasLoadedPreference || !trackingQuery || !targetedTrackingIcao24) return;
    let cancelled = false;
    let timer: number | undefined;

    const scanForEmergencies = async () => {
      const globalResult = await fetchFlightStates({ maximumStates: 50_000 });
      if (cancelled) return;
      const nextGlobalFlights = normalizeFlightResponse(globalResult);
      if (nextGlobalFlights.mode === "live") {
        const currentTarget = snapshotRef.current.trackedAircraft;
        setFlights(currentTarget
          ? mergeFlightPool(nextGlobalFlights.flights, [currentTarget])
          : nextGlobalFlights.flights);
      }
      timer = window.setTimeout(
        () => void scanForEmergencies(),
        nextEmergencyScanDelay(globalResult),
      );
    };

    void scanForEmergencies();
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [hasLoadedPreference, targetedTrackingIcao24, trackingQuery]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const board = new LEDBoard(canvas, GRID_COLUMNS);
    let frameId = 0;
    let lastFrame = 0;

    const render = (now: number) => {
      if (now - lastFrame >= 1000 / 2) {
        board.resize(window.innerWidth, window.innerHeight);
        drawFrame(board, snapshotRef.current, Date.now(), coastCache);
        lastFrame = now;
      }
      frameId = window.requestAnimationFrame(render);
    };

    frameId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // Browsers may deny fullscreen without a direct gesture; the board remains usable.
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement !== searchRef.current) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key.toLowerCase() === "f" && document.activeElement !== searchRef.current) {
        void toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleFullscreen]);

  const submitSearch = () => {
    const requested = query.trim().toUpperCase();
    if (!requested) return;
    setInvalidSearch(false);
    if (["GLOBAL", "WORLD", "NONE"].includes(requested)) {
      setHasSelectedAirport(false);
      setTrackedAircraft(null);
      setTrackingQuery(null);
      setTrackedLastSeenAt(null);
      setQuery("");
      setInvalidSearch(false);
      searchRef.current?.blur();
      return;
    }
    if (["UNTRACK", "CLEAR", "TRACK OFF", "CLEAR TRACK"].includes(requested)) {
      setTrackedAircraft(null);
      setTrackingQuery(null);
      setTrackedLastSeenAt(null);
      setFocusStartedAt(Date.now());
      setQuery("");
      setInvalidSearch(false);
      searchRef.current?.blur();
      return;
    }

    const airportMatch = findAirport(requested) ?? searchAirports(requested, 1)[0];
    if (airportMatch) {
      setAirport(airportMatch);
      setHasSelectedAirport(true);
      setTrackedAircraft(null);
      setTrackingQuery(null);
      setTrackedLastSeenAt(null);
      setQuery("");
      setInvalidSearch(false);
      searchRef.current?.blur();
      return;
    }

    const normalizedTrackingQuery = normalizeTrackingQuery(requested);
    if (!isTrackableIdentifier(normalizedTrackingQuery)) {
      setInvalidSearch(true);
      window.setTimeout(() => setInvalidSearch(false), 650);
      return;
    }

    const aircraftMatch = findAircraft(
      flights.filter((flight) => flight.dataSource === "live"),
      normalizedTrackingQuery,
    );
    setTrackingQuery(normalizedTrackingQuery);
    setTrackedAircraft(aircraftMatch ?? null);
    setTrackedLastSeenAt(aircraftMatch ? Date.now() : null);
    setFocusStartedAt(Date.now());
    setQuery("");
    setInvalidSearch(false);
    searchRef.current?.blur();
  };

  return (
    <main className={styles.shell} onDoubleClick={() => void toggleFullscreen()}>
      <canvas
        ref={canvasRef}
        className={styles.board}
        role="img"
        aria-label={hasSelectedAirport
          ? `LED flight board tracking ${airport.name}`
          : "Global LED flight board"}
      />
      <input
        ref={searchRef}
        className={`${styles.search} ${invalidSearch ? styles.searchInvalid : ""}`}
        value={query}
        aria-label="Search airport or track aircraft by callsign or ICAO24"
        autoComplete="off"
        autoCapitalize="characters"
        maxLength={32}
        placeholder={trackedAircraft
          ? `TRACK ${trackedAircraft.callsign}`
          : trackingQuery
            ? `WAIT ${trackingQuery}`
            : "APT / FLIGHT"}
        spellCheck={false}
        onDoubleClick={(event) => event.stopPropagation()}
        onChange={(event) => setQuery(event.target.value.toUpperCase())}
        onKeyDown={(event) => {
          if (event.key === "Enter") void submitSearch();
          if (event.key === "Escape") {
            setQuery("");
            searchRef.current?.blur();
          }
        }}
      />
    </main>
  );
}
