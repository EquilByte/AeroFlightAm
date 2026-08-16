export type AircraftCategory =
  | "narrow-body"
  | "wide-body"
  | "regional-jet"
  | "turboprop"
  | "cargo"
  | "business-jet"
  | "general-aviation"
  | "helicopter";

export type EngineType = "turbofan" | "turboprop" | "piston" | "turboshaft" | "electric";

export interface AircraftEngines {
  readonly count: number;
  readonly type: EngineType;
  /** Common family; individual airframes may use another certified option. */
  readonly family?: string;
}

export interface AircraftSpec {
  /** ICAO aircraft type designator, e.g. A20N or B77W. */
  readonly icaoType: string;
  readonly manufacturer: string;
  readonly model: string;
  readonly category: AircraftCategory;
  /** Typical airline seating, not the regulatory maximum. */
  readonly capacity: number;
  readonly engines: AircraftEngines;
  readonly rangeKm: number;
  readonly cruiseSpeedKts: number;
  readonly ceilingFt: number;
  readonly lengthM: number;
  readonly wingspanM: number;
}

/**
 * Common types encountered in worldwide ADS-B traffic. Values are intentionally
 * rounded: operators, cabin layouts, engine options, and weight variants differ.
 */
export const AIRCRAFT_DATABASE = [
  { icaoType: "A318", manufacturer: "Airbus", model: "A318-100", category: "narrow-body", capacity: 117, engines: { count: 2, type: "turbofan", family: "CFM56 / PW6000" }, rangeKm: 5750, cruiseSpeedKts: 447, ceilingFt: 39000, lengthM: 31.44, wingspanM: 34.1 },
  { icaoType: "A319", manufacturer: "Airbus", model: "A319-100", category: "narrow-body", capacity: 140, engines: { count: 2, type: "turbofan", family: "CFM56 / IAE V2500" }, rangeKm: 6950, cruiseSpeedKts: 447, ceilingFt: 39000, lengthM: 33.84, wingspanM: 35.8 },
  { icaoType: "A320", manufacturer: "Airbus", model: "A320-200", category: "narrow-body", capacity: 180, engines: { count: 2, type: "turbofan", family: "CFM56 / IAE V2500" }, rangeKm: 6200, cruiseSpeedKts: 447, ceilingFt: 39800, lengthM: 37.57, wingspanM: 35.8 },
  { icaoType: "A20N", manufacturer: "Airbus", model: "A320neo", category: "narrow-body", capacity: 186, engines: { count: 2, type: "turbofan", family: "LEAP-1A / PW1100G" }, rangeKm: 6300, cruiseSpeedKts: 450, ceilingFt: 39800, lengthM: 37.57, wingspanM: 35.8 },
  { icaoType: "A321", manufacturer: "Airbus", model: "A321-200", category: "narrow-body", capacity: 220, engines: { count: 2, type: "turbofan", family: "CFM56 / IAE V2500" }, rangeKm: 5950, cruiseSpeedKts: 447, ceilingFt: 39800, lengthM: 44.51, wingspanM: 35.8 },
  { icaoType: "A21N", manufacturer: "Airbus", model: "A321neo", category: "narrow-body", capacity: 230, engines: { count: 2, type: "turbofan", family: "LEAP-1A / PW1100G" }, rangeKm: 7400, cruiseSpeedKts: 450, ceilingFt: 39800, lengthM: 44.51, wingspanM: 35.8 },
  { icaoType: "A332", manufacturer: "Airbus", model: "A330-200", category: "wide-body", capacity: 247, engines: { count: 2, type: "turbofan", family: "Trent 700 / CF6 / PW4000" }, rangeKm: 13450, cruiseSpeedKts: 470, ceilingFt: 41450, lengthM: 58.82, wingspanM: 60.3 },
  { icaoType: "A333", manufacturer: "Airbus", model: "A330-300", category: "wide-body", capacity: 300, engines: { count: 2, type: "turbofan", family: "Trent 700 / CF6 / PW4000" }, rangeKm: 11750, cruiseSpeedKts: 470, ceilingFt: 41450, lengthM: 63.66, wingspanM: 60.3 },
  { icaoType: "A339", manufacturer: "Airbus", model: "A330-900neo", category: "wide-body", capacity: 287, engines: { count: 2, type: "turbofan", family: "Trent 7000" }, rangeKm: 13330, cruiseSpeedKts: 470, ceilingFt: 41450, lengthM: 63.66, wingspanM: 64.0 },
  { icaoType: "A343", manufacturer: "Airbus", model: "A340-300", category: "wide-body", capacity: 295, engines: { count: 4, type: "turbofan", family: "CFM56" }, rangeKm: 13500, cruiseSpeedKts: 473, ceilingFt: 41000, lengthM: 63.69, wingspanM: 60.3 },
  { icaoType: "A346", manufacturer: "Airbus", model: "A340-600", category: "wide-body", capacity: 380, engines: { count: 4, type: "turbofan", family: "Trent 500" }, rangeKm: 14450, cruiseSpeedKts: 475, ceilingFt: 41000, lengthM: 75.36, wingspanM: 63.45 },
  { icaoType: "A359", manufacturer: "Airbus", model: "A350-900", category: "wide-body", capacity: 325, engines: { count: 2, type: "turbofan", family: "Trent XWB" }, rangeKm: 15370, cruiseSpeedKts: 488, ceilingFt: 43100, lengthM: 66.8, wingspanM: 64.75 },
  { icaoType: "A35K", manufacturer: "Airbus", model: "A350-1000", category: "wide-body", capacity: 369, engines: { count: 2, type: "turbofan", family: "Trent XWB" }, rangeKm: 16100, cruiseSpeedKts: 488, ceilingFt: 43100, lengthM: 73.79, wingspanM: 64.75 },
  { icaoType: "A388", manufacturer: "Airbus", model: "A380-800", category: "wide-body", capacity: 555, engines: { count: 4, type: "turbofan", family: "Trent 900 / GP7200" }, rangeKm: 14800, cruiseSpeedKts: 488, ceilingFt: 43000, lengthM: 72.72, wingspanM: 79.75 },

  { icaoType: "B712", manufacturer: "Boeing", model: "717-200", category: "narrow-body", capacity: 117, engines: { count: 2, type: "turbofan", family: "BR715" }, rangeKm: 3820, cruiseSpeedKts: 438, ceilingFt: 37000, lengthM: 37.81, wingspanM: 28.45 },
  { icaoType: "B737", manufacturer: "Boeing", model: "737-700", category: "narrow-body", capacity: 149, engines: { count: 2, type: "turbofan", family: "CFM56" }, rangeKm: 6370, cruiseSpeedKts: 453, ceilingFt: 41000, lengthM: 33.63, wingspanM: 35.8 },
  { icaoType: "B738", manufacturer: "Boeing", model: "737-800", category: "narrow-body", capacity: 189, engines: { count: 2, type: "turbofan", family: "CFM56" }, rangeKm: 5436, cruiseSpeedKts: 453, ceilingFt: 41000, lengthM: 39.47, wingspanM: 35.8 },
  { icaoType: "B739", manufacturer: "Boeing", model: "737-900ER", category: "narrow-body", capacity: 220, engines: { count: 2, type: "turbofan", family: "CFM56" }, rangeKm: 5925, cruiseSpeedKts: 453, ceilingFt: 41000, lengthM: 42.11, wingspanM: 35.8 },
  { icaoType: "B38M", manufacturer: "Boeing", model: "737 MAX 8", category: "narrow-body", capacity: 189, engines: { count: 2, type: "turbofan", family: "LEAP-1B" }, rangeKm: 6570, cruiseSpeedKts: 453, ceilingFt: 41000, lengthM: 39.52, wingspanM: 35.92 },
  { icaoType: "B39M", manufacturer: "Boeing", model: "737 MAX 9", category: "narrow-body", capacity: 220, engines: { count: 2, type: "turbofan", family: "LEAP-1B" }, rangeKm: 6570, cruiseSpeedKts: 453, ceilingFt: 41000, lengthM: 42.16, wingspanM: 35.92 },
  { icaoType: "B744", manufacturer: "Boeing", model: "747-400", category: "wide-body", capacity: 416, engines: { count: 4, type: "turbofan", family: "CF6 / PW4000 / RB211" }, rangeKm: 13450, cruiseSpeedKts: 493, ceilingFt: 45100, lengthM: 70.67, wingspanM: 64.44 },
  { icaoType: "B748", manufacturer: "Boeing", model: "747-8", category: "wide-body", capacity: 467, engines: { count: 4, type: "turbofan", family: "GEnx-2B" }, rangeKm: 14320, cruiseSpeedKts: 493, ceilingFt: 43100, lengthM: 76.25, wingspanM: 68.45 },
  { icaoType: "B752", manufacturer: "Boeing", model: "757-200", category: "narrow-body", capacity: 200, engines: { count: 2, type: "turbofan", family: "RB211 / PW2000" }, rangeKm: 7222, cruiseSpeedKts: 459, ceilingFt: 42000, lengthM: 47.32, wingspanM: 38.05 },
  { icaoType: "B763", manufacturer: "Boeing", model: "767-300ER", category: "wide-body", capacity: 269, engines: { count: 2, type: "turbofan", family: "CF6 / PW4000 / RB211" }, rangeKm: 11070, cruiseSpeedKts: 459, ceilingFt: 43100, lengthM: 54.94, wingspanM: 47.57 },
  { icaoType: "B772", manufacturer: "Boeing", model: "777-200ER", category: "wide-body", capacity: 314, engines: { count: 2, type: "turbofan", family: "GE90 / Trent 800 / PW4000" }, rangeKm: 13080, cruiseSpeedKts: 490, ceilingFt: 43100, lengthM: 63.73, wingspanM: 60.93 },
  { icaoType: "B77L", manufacturer: "Boeing", model: "777-200LR", category: "wide-body", capacity: 317, engines: { count: 2, type: "turbofan", family: "GE90" }, rangeKm: 15840, cruiseSpeedKts: 490, ceilingFt: 43100, lengthM: 63.73, wingspanM: 64.8 },
  { icaoType: "B773", manufacturer: "Boeing", model: "777-300", category: "wide-body", capacity: 368, engines: { count: 2, type: "turbofan", family: "GE90 / Trent 800 / PW4000" }, rangeKm: 11165, cruiseSpeedKts: 490, ceilingFt: 43100, lengthM: 73.86, wingspanM: 60.93 },
  { icaoType: "B77W", manufacturer: "Boeing", model: "777-300ER", category: "wide-body", capacity: 396, engines: { count: 2, type: "turbofan", family: "GE90" }, rangeKm: 13650, cruiseSpeedKts: 490, ceilingFt: 43100, lengthM: 73.86, wingspanM: 64.8 },
  { icaoType: "B788", manufacturer: "Boeing", model: "787-8 Dreamliner", category: "wide-body", capacity: 248, engines: { count: 2, type: "turbofan", family: "GEnx / Trent 1000" }, rangeKm: 13530, cruiseSpeedKts: 488, ceilingFt: 43100, lengthM: 56.72, wingspanM: 60.12 },
  { icaoType: "B789", manufacturer: "Boeing", model: "787-9 Dreamliner", category: "wide-body", capacity: 296, engines: { count: 2, type: "turbofan", family: "GEnx / Trent 1000" }, rangeKm: 14010, cruiseSpeedKts: 488, ceilingFt: 43100, lengthM: 62.81, wingspanM: 60.12 },
  { icaoType: "B78X", manufacturer: "Boeing", model: "787-10 Dreamliner", category: "wide-body", capacity: 336, engines: { count: 2, type: "turbofan", family: "GEnx / Trent 1000" }, rangeKm: 11730, cruiseSpeedKts: 488, ceilingFt: 41100, lengthM: 68.28, wingspanM: 60.12 },

  { icaoType: "E170", manufacturer: "Embraer", model: "E170", category: "regional-jet", capacity: 76, engines: { count: 2, type: "turbofan", family: "CF34" }, rangeKm: 3982, cruiseSpeedKts: 447, ceilingFt: 41000, lengthM: 29.9, wingspanM: 26.0 },
  { icaoType: "E75L", manufacturer: "Embraer", model: "E175", category: "regional-jet", capacity: 88, engines: { count: 2, type: "turbofan", family: "CF34" }, rangeKm: 4074, cruiseSpeedKts: 447, ceilingFt: 41000, lengthM: 31.68, wingspanM: 28.65 },
  { icaoType: "E190", manufacturer: "Embraer", model: "E190", category: "regional-jet", capacity: 114, engines: { count: 2, type: "turbofan", family: "CF34" }, rangeKm: 4537, cruiseSpeedKts: 447, ceilingFt: 41000, lengthM: 36.24, wingspanM: 28.72 },
  { icaoType: "E195", manufacturer: "Embraer", model: "E195", category: "regional-jet", capacity: 124, engines: { count: 2, type: "turbofan", family: "CF34" }, rangeKm: 4260, cruiseSpeedKts: 447, ceilingFt: 41000, lengthM: 38.65, wingspanM: 28.72 },
  { icaoType: "E290", manufacturer: "Embraer", model: "E190-E2", category: "regional-jet", capacity: 114, engines: { count: 2, type: "turbofan", family: "PW1900G" }, rangeKm: 5278, cruiseSpeedKts: 447, ceilingFt: 41000, lengthM: 36.24, wingspanM: 33.72 },
  { icaoType: "E295", manufacturer: "Embraer", model: "E195-E2", category: "regional-jet", capacity: 146, engines: { count: 2, type: "turbofan", family: "PW1900G" }, rangeKm: 4815, cruiseSpeedKts: 447, ceilingFt: 41000, lengthM: 41.5, wingspanM: 33.72 },
  { icaoType: "CRJ2", manufacturer: "Bombardier", model: "CRJ200", category: "regional-jet", capacity: 50, engines: { count: 2, type: "turbofan", family: "CF34" }, rangeKm: 3056, cruiseSpeedKts: 424, ceilingFt: 41000, lengthM: 26.77, wingspanM: 21.21 },
  { icaoType: "CRJ7", manufacturer: "Bombardier", model: "CRJ700", category: "regional-jet", capacity: 78, engines: { count: 2, type: "turbofan", family: "CF34" }, rangeKm: 2553, cruiseSpeedKts: 447, ceilingFt: 41000, lengthM: 32.51, wingspanM: 23.24 },
  { icaoType: "CRJ9", manufacturer: "Bombardier", model: "CRJ900", category: "regional-jet", capacity: 90, engines: { count: 2, type: "turbofan", family: "CF34" }, rangeKm: 2956, cruiseSpeedKts: 447, ceilingFt: 41000, lengthM: 36.37, wingspanM: 24.85 },
  { icaoType: "CRJX", manufacturer: "Bombardier", model: "CRJ1000", category: "regional-jet", capacity: 104, engines: { count: 2, type: "turbofan", family: "CF34" }, rangeKm: 3004, cruiseSpeedKts: 447, ceilingFt: 41000, lengthM: 39.13, wingspanM: 26.18 },

  { icaoType: "AT72", manufacturer: "ATR", model: "ATR 72-600", category: "turboprop", capacity: 72, engines: { count: 2, type: "turboprop", family: "PW127" }, rangeKm: 1528, cruiseSpeedKts: 275, ceilingFt: 25000, lengthM: 27.17, wingspanM: 27.05 },
  { icaoType: "AT76", manufacturer: "ATR", model: "ATR 72-600", category: "turboprop", capacity: 72, engines: { count: 2, type: "turboprop", family: "PW127M" }, rangeKm: 1528, cruiseSpeedKts: 275, ceilingFt: 25000, lengthM: 27.17, wingspanM: 27.05 },
  { icaoType: "DH8D", manufacturer: "De Havilland Canada", model: "Dash 8-400", category: "turboprop", capacity: 78, engines: { count: 2, type: "turboprop", family: "PW150A" }, rangeKm: 2040, cruiseSpeedKts: 360, ceilingFt: 25000, lengthM: 32.84, wingspanM: 28.42 },
  { icaoType: "SF34", manufacturer: "Saab", model: "340", category: "turboprop", capacity: 34, engines: { count: 2, type: "turboprop", family: "CT7" }, rangeKm: 1730, cruiseSpeedKts: 283, ceilingFt: 25000, lengthM: 19.73, wingspanM: 21.44 },

  { icaoType: "MD11", manufacturer: "McDonnell Douglas", model: "MD-11F", category: "cargo", capacity: 0, engines: { count: 3, type: "turbofan", family: "CF6 / PW4000" }, rangeKm: 12455, cruiseSpeedKts: 490, ceilingFt: 43100, lengthM: 61.21, wingspanM: 51.66 },
  { icaoType: "BLCF", manufacturer: "Boeing", model: "747-400 Dreamlifter", category: "cargo", capacity: 0, engines: { count: 4, type: "turbofan", family: "PW4000" }, rangeKm: 7800, cruiseSpeedKts: 474, ceilingFt: 41000, lengthM: 71.68, wingspanM: 64.44 },
  { icaoType: "A3ST", manufacturer: "Airbus", model: "A300-600ST Beluga", category: "cargo", capacity: 0, engines: { count: 2, type: "turbofan", family: "GE CF6" }, rangeKm: 2779, cruiseSpeedKts: 405, ceilingFt: 35000, lengthM: 56.15, wingspanM: 44.84 },

  { icaoType: "GLF6", manufacturer: "Gulfstream", model: "G650", category: "business-jet", capacity: 18, engines: { count: 2, type: "turbofan", family: "Rolls-Royce BR725" }, rangeKm: 12964, cruiseSpeedKts: 516, ceilingFt: 51000, lengthM: 30.41, wingspanM: 30.36 },
  { icaoType: "GLEX", manufacturer: "Bombardier", model: "Global Express", category: "business-jet", capacity: 19, engines: { count: 2, type: "turbofan", family: "Rolls-Royce BR710" }, rangeKm: 11390, cruiseSpeedKts: 488, ceilingFt: 51000, lengthM: 30.3, wingspanM: 28.7 },
  { icaoType: "C56X", manufacturer: "Cessna", model: "Citation Excel", category: "business-jet", capacity: 9, engines: { count: 2, type: "turbofan", family: "PW545" }, rangeKm: 3889, cruiseSpeedKts: 441, ceilingFt: 45000, lengthM: 16.0, wingspanM: 17.17 },
  { icaoType: "PC12", manufacturer: "Pilatus", model: "PC-12", category: "general-aviation", capacity: 9, engines: { count: 1, type: "turboprop", family: "PT6A" }, rangeKm: 3417, cruiseSpeedKts: 290, ceilingFt: 30000, lengthM: 14.4, wingspanM: 16.28 },
  { icaoType: "C208", manufacturer: "Cessna", model: "208 Caravan", category: "general-aviation", capacity: 14, engines: { count: 1, type: "turboprop", family: "PT6A" }, rangeKm: 1982, cruiseSpeedKts: 186, ceilingFt: 25000, lengthM: 12.67, wingspanM: 15.88 },
  { icaoType: "C172", manufacturer: "Cessna", model: "172 Skyhawk", category: "general-aviation", capacity: 4, engines: { count: 1, type: "piston", family: "Lycoming IO-360" }, rangeKm: 1185, cruiseSpeedKts: 124, ceilingFt: 14000, lengthM: 8.28, wingspanM: 11.0 },
  { icaoType: "EC35", manufacturer: "Airbus Helicopters", model: "H135", category: "helicopter", capacity: 7, engines: { count: 2, type: "turboshaft", family: "Arrius 2B / PW206B" }, rangeKm: 635, cruiseSpeedKts: 137, ceilingFt: 20000, lengthM: 12.26, wingspanM: 10.4 },
] as const satisfies readonly AircraftSpec[];

export type AircraftMetadata = AircraftSpec;

export const AIRCRAFT_BY_ICAO_TYPE: ReadonlyMap<string, AircraftSpec> = new Map(
  AIRCRAFT_DATABASE.map((aircraft) => [aircraft.icaoType, aircraft]),
);

const TYPE_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  A320200: "A320",
  A320NEO: "A20N",
  A321200: "A321",
  A321NEO: "A21N",
  A330200: "A332",
  A330300: "A333",
  A350900: "A359",
  A3501000: "A35K",
  A380800: "A388",
  B737700: "B737",
  B737800: "B738",
  B737900: "B739",
  B737MAX8: "B38M",
  B737MAX9: "B39M",
  B747400: "B744",
  B7478: "B748",
  B757200: "B752",
  B767300: "B763",
  B777200: "B772",
  B777300ER: "B77W",
  B7878: "B788",
  B7879: "B789",
  B78710: "B78X",
  E175: "E75L",
  ATR72: "AT72",
  Q400: "DH8D",
});

function normalizeType(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Look up an ICAO designator or a familiar model spelling. */
export function getAircraftSpec(type: string | null | undefined): AircraftSpec | undefined {
  if (!type) return undefined;
  const normalized = normalizeType(type);
  return AIRCRAFT_BY_ICAO_TYPE.get(TYPE_ALIASES[normalized] ?? normalized);
}

export const findAircraftSpec = getAircraftSpec;

/** Compact copy suitable for a narrow LED field. */
export function formatEngineSummary(spec: AircraftSpec): string {
  const kind = spec.engines.type === "turbofan" ? "JET" : spec.engines.type.toUpperCase();
  return `${spec.engines.count}X ${kind}`;
}

