/**
 * Deliberately low-resolution world geometry for the LED dashboard.
 *
 * Coordinates are stored as [longitude, latitude] in decimal degrees. The
 * outlines favor silhouettes that survive projection onto a ~50 x 30 cell
 * map rather than geographic precision. No canvas primitives are used here;
 * callers can either pass the projected vertices to LEDBoard.line or use the
 * raster helpers below to get the exact cells that should be illuminated.
 */

export type LonLat = readonly [longitude: number, latitude: number];
export type GeoPolyline = readonly LonLat[];

export interface GeoPolygon {
  readonly id: string;
  readonly points: GeoPolyline;
}

/** A rectangle expressed entirely in LED-cell coordinates. */
export interface GridRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Geographic viewport bounds. A west value greater than east represents a
 * viewport that crosses the antimeridian (for example, 165 to -165).
 */
export interface GeoBounds {
  readonly west: number;
  readonly south: number;
  readonly east: number;
  readonly north: number;
}

/** Options for a local map centered on an airport or aircraft. */
export interface RegionalBoundsOptions {
  /** North/south coverage in degrees. Defaults to 24 degrees. */
  readonly latitudeSpan?: number;
  /**
   * West/east coverage in degrees. When omitted, it is derived from the
   * latitude span, viewport aspect ratio, and the center latitude.
   */
  readonly longitudeSpan?: number;
  /** Width divided by height of the target LED map. Defaults to 1.5. */
  readonly aspectRatio?: number;
}

export interface LedPoint {
  readonly x: number;
  readonly y: number;
}

export type LedPolyline = readonly LedPoint[];

export interface ProjectedPolygon {
  readonly id: string;
  readonly points: LedPolyline;
}

/**
 * Closed land outlines. Small islands are intentionally exaggerated so they
 * remain visible after quantization to the LED grid.
 */
export const WORLD_LAND_POLYGONS: readonly GeoPolygon[] = [
  {
    id: "north-america",
    points: [
      [-168, 72],
      [-155, 72],
      [-144, 70],
      [-134, 69],
      [-124, 72],
      [-110, 73],
      [-96, 75],
      [-82, 73],
      [-70, 68],
      [-62, 61],
      [-58, 53],
      [-64, 48],
      [-70, 45],
      [-74, 41],
      [-76, 36],
      [-81, 31],
      [-82, 25],
      [-87, 22],
      [-92, 19],
      [-97, 20],
      [-105, 25],
      [-112, 29],
      [-117, 33],
      [-122, 39],
      [-125, 48],
      [-130, 54],
      [-138, 58],
      [-147, 60],
      [-154, 58],
      [-162, 60],
      [-168, 66],
      [-168, 72],
    ],
  },
  {
    id: "central-america",
    points: [
      [-93, 20],
      [-88, 18],
      [-86, 15],
      [-83, 11],
      [-79, 9],
      [-77, 9],
      [-81, 12],
      [-85, 16],
      [-90, 20],
      [-93, 20],
    ],
  },
  {
    id: "south-america",
    points: [
      [-80, 10],
      [-73, 12],
      [-64, 10],
      [-55, 6],
      [-50, 1],
      [-46, -7],
      [-41, -15],
      [-40, -23],
      [-47, -29],
      [-52, -34],
      [-58, -39],
      [-64, -48],
      [-70, -55],
      [-74, -48],
      [-73, -39],
      [-70, -30],
      [-72, -20],
      [-76, -12],
      [-80, -3],
      [-80, 10],
    ],
  },
  {
    id: "greenland",
    points: [
      [-73, 77],
      [-58, 83],
      [-38, 82],
      [-22, 76],
      [-28, 68],
      [-42, 60],
      [-54, 60],
      [-62, 67],
      [-73, 77],
    ],
  },
  {
    id: "eurasia",
    points: [
      [-10, 36],
      [-10, 44],
      [-6, 50],
      [-5, 56],
      [4, 59],
      [9, 64],
      [19, 70],
      [31, 72],
      [43, 68],
      [58, 72],
      [78, 74],
      [99, 77],
      [119, 73],
      [140, 72],
      [160, 67],
      [179, 66],
      [179, 52],
      [166, 55],
      [157, 51],
      [146, 45],
      [141, 39],
      [132, 35],
      [126, 29],
      [122, 22],
      [116, 20],
      [109, 14],
      [105, 8],
      [101, 2],
      [96, 6],
      [91, 21],
      [84, 22],
      [80, 9],
      [76, 7],
      [72, 20],
      [63, 25],
      [57, 20],
      [51, 15],
      [44, 13],
      [41, 20],
      [35, 30],
      [29, 35],
      [25, 39],
      [20, 40],
      [15, 44],
      [10, 44],
      [5, 43],
      [0, 43],
      [-5, 40],
      [-10, 36],
    ],
  },
  {
    id: "africa",
    points: [
      [-17, 36],
      [-5, 36],
      [10, 37],
      [25, 33],
      [34, 31],
      [40, 20],
      [49, 12],
      [51, 4],
      [45, -12],
      [40, -21],
      [32, -30],
      [20, -35],
      [10, -34],
      [2, -29],
      [-5, -18],
      [-10, -5],
      [-15, 8],
      [-17, 20],
      [-17, 36],
    ],
  },
  {
    id: "great-britain",
    points: [
      [-6, 50],
      [0, 51],
      [1, 55],
      [-4, 59],
      [-7, 57],
      [-6, 50],
    ],
  },
  {
    id: "iceland",
    points: [
      [-24, 64],
      [-14, 65],
      [-13, 67],
      [-21, 67],
      [-24, 64],
    ],
  },
  {
    id: "cuba",
    points: [
      [-85, 23],
      [-75, 20],
      [-74, 22],
      [-82, 24],
      [-85, 23],
    ],
  },
  {
    id: "madagascar",
    points: [
      [48, -13],
      [51, -18],
      [47, -26],
      [44, -23],
      [45, -16],
      [48, -13],
    ],
  },
  {
    id: "japan",
    points: [
      [130, 31],
      [135, 34],
      [141, 41],
      [145, 44],
      [143, 38],
      [137, 34],
      [130, 31],
    ],
  },
  {
    id: "sumatra-java",
    points: [
      [95, 6],
      [103, 1],
      [115, -8],
      [106, -8],
      [99, -3],
      [95, 6],
    ],
  },
  {
    id: "borneo",
    points: [
      [109, 7],
      [118, 6],
      [119, -3],
      [113, -5],
      [108, 0],
      [109, 7],
    ],
  },
  {
    id: "sulawesi",
    points: [
      [119, 2],
      [124, 1],
      [125, -5],
      [120, -4],
      [119, 2],
    ],
  },
  {
    id: "philippines",
    points: [
      [119, 19],
      [124, 18],
      [126, 8],
      [122, 6],
      [119, 12],
      [119, 19],
    ],
  },
  {
    id: "new-guinea",
    points: [
      [131, -2],
      [142, -3],
      [151, -6],
      [147, -10],
      [137, -8],
      [131, -2],
    ],
  },
  {
    id: "australia",
    points: [
      [113, -22],
      [114, -13],
      [124, -11],
      [135, -12],
      [146, -19],
      [153, -28],
      [149, -37],
      [137, -39],
      [126, -34],
      [116, -35],
      [113, -22],
    ],
  },
  {
    id: "tasmania",
    points: [
      [145, -40],
      [149, -42],
      [147, -44],
      [144, -43],
      [145, -40],
    ],
  },
  {
    id: "new-zealand",
    points: [
      [173, -35],
      [177, -39],
      [174, -42],
      [168, -47],
      [166, -45],
      [171, -40],
      [173, -35],
    ],
  },
  {
    id: "antarctica",
    points: [
      [-179, -72],
      [-150, -70],
      [-120, -73],
      [-90, -72],
      [-62, -66],
      [-35, -69],
      [0, -70],
      [30, -69],
      [60, -67],
      [90, -66],
      [120, -64],
      [150, -70],
      [179, -72],
      [179, -85],
      [-179, -85],
      [-179, -72],
    ],
  },
] as const;

/** Coastline-only view for renderers that do not need landmass identifiers. */
export const WORLD_COASTLINES: readonly GeoPolyline[] = Object.freeze(
  WORLD_LAND_POLYGONS.map((polygon) => polygon.points),
);

/** A few high-value interior water marks that stay legible on larger boards. */
export const WORLD_INLAND_WATERLINES: readonly GeoPolyline[] = [
  [
    [-92, 48],
    [-88, 46],
    [-84, 46],
    [-82, 43],
    [-78, 44],
  ],
  [
    [-87, 42],
    [-82, 42],
    [-79, 44],
  ],
  [
    [47, 47],
    [52, 45],
    [54, 39],
    [49, 37],
    [47, 42],
    [47, 47],
  ],
] as const;

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const EPSILON = 1e-10;

function finiteNumber(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${label} must be a finite number.`);
  }
  return value;
}

function normalizedRect(rect: GridRect): GridRect {
  const width = Math.floor(finiteNumber(rect.width, "Grid width"));
  const height = Math.floor(finiteNumber(rect.height, "Grid height"));
  if (width < 1 || height < 1) {
    throw new RangeError("Grid width and height must each be at least one cell.");
  }
  return {
    x: Math.round(finiteNumber(rect.x, "Grid x")),
    y: Math.round(finiteNumber(rect.y, "Grid y")),
    width,
    height,
  };
}

interface NormalizedGeoBounds {
  readonly west: number;
  readonly east: number;
  readonly south: number;
  readonly north: number;
  readonly longitudeSpan: number;
  readonly latitudeSpan: number;
  readonly centerLongitude: number;
  readonly fullLongitude: boolean;
}

function normalizeGeoBounds(bounds: GeoBounds): NormalizedGeoBounds {
  const rawWest = finiteNumber(bounds.west, "West longitude");
  const rawEast = finiteNumber(bounds.east, "East longitude");
  const south = Math.max(-90, finiteNumber(bounds.south, "South latitude"));
  const north = Math.min(90, finiteNumber(bounds.north, "North latitude"));

  if (north - south < EPSILON) {
    throw new RangeError("North latitude must be greater than south latitude.");
  }

  const rawLongitudeSpan = Math.abs(rawEast - rawWest);
  if (rawLongitudeSpan >= 360 - EPSILON) {
    return {
      west: -180,
      east: 180,
      south,
      north,
      longitudeSpan: 360,
      latitudeSpan: north - south,
      centerLongitude: 0,
      fullLongitude: true,
    };
  }

  const west = normalizeLongitude(rawWest);
  const normalizedEast = normalizeLongitude(rawEast);
  const longitudeSpan =
    ((normalizedEast - west) % 360 + 360) % 360;
  if (longitudeSpan < EPSILON) {
    throw new RangeError("East and west longitude must define a non-empty span.");
  }

  return {
    west,
    east: west + longitudeSpan,
    south,
    north,
    longitudeSpan,
    latitudeSpan: north - south,
    centerLongitude: west + longitudeSpan / 2,
    fullLongitude: false,
  };
}

function unwrapLongitudeNear(longitude: number, reference: number): number {
  const normalized = normalizeLongitude(longitude);
  return normalized + 360 * Math.round((reference - normalized) / 360);
}

function projectUnwrappedPoint(
  longitude: number,
  latitude: number,
  bounds: NormalizedGeoBounds,
  rect: GridRect,
): LedPoint {
  const xProgress = Math.max(
    0,
    Math.min(1, (longitude - bounds.west) / bounds.longitudeSpan),
  );
  const yProgress = Math.max(
    0,
    Math.min(1, (bounds.north - latitude) / bounds.latitudeSpan),
  );
  return {
    x: rect.x + Math.round(xProgress * (rect.width - 1)),
    y: rect.y + Math.round(yProgress * (rect.height - 1)),
  };
}

/**
 * Create a regional viewport around an airport or aircraft.
 *
 * The derived longitude span compensates for latitude so a view near the
 * poles does not cover an artificially narrow physical area. Returned
 * longitudes stay in [-180, 180), except a full-world view which uses
 * [-180, 180]. A west value greater than east means the view crosses the
 * antimeridian.
 */
export function createRegionalBounds(
  center: LonLat,
  options: RegionalBoundsOptions = {},
): GeoBounds {
  const centerLongitude = normalizeLongitude(center[0]);
  const centerLatitude = Math.max(
    -90,
    Math.min(90, finiteNumber(center[1], "Center latitude")),
  );
  const latitudeSpan = Math.max(
    0.25,
    Math.min(180, finiteNumber(options.latitudeSpan ?? 24, "Latitude span")),
  );
  const aspectRatio = Math.max(
    0.25,
    Math.min(8, finiteNumber(options.aspectRatio ?? 1.5, "Aspect ratio")),
  );
  const latitudeScale = Math.max(
    0.25,
    Math.cos(centerLatitude * DEG_TO_RAD),
  );
  const longitudeSpan = Math.max(
    0.25,
    Math.min(
      360,
      finiteNumber(
        options.longitudeSpan ?? (latitudeSpan * aspectRatio) / latitudeScale,
        "Longitude span",
      ),
    ),
  );

  let south = centerLatitude - latitudeSpan / 2;
  let north = centerLatitude + latitudeSpan / 2;
  if (south < -90) {
    north += -90 - south;
    south = -90;
  }
  if (north > 90) {
    south -= north - 90;
    north = 90;
  }

  if (longitudeSpan >= 360 - EPSILON) {
    return { west: -180, south, east: 180, north };
  }

  return {
    west: normalizeLongitude(centerLongitude - longitudeSpan / 2),
    south,
    east: normalizeLongitude(centerLongitude + longitudeSpan / 2),
    north,
  };
}

function sameLedPoint(left: LedPoint, right: LedPoint): boolean {
  return left.x === right.x && left.y === right.y;
}

/** Normalize a longitude to the half-open interval [-180, 180). */
export function normalizeLongitude(longitude: number): number {
  const value = finiteNumber(longitude, "Longitude");
  return ((((value + 180) % 360) + 360) % 360) - 180;
}

/**
 * Equirectangular projection into an inclusive integer LED-cell rectangle.
 * Longitudes in the normal -180..180 range keep +180 on the right edge.
 */
export function projectLonLat(point: LonLat, rect: GridRect): LedPoint {
  const target = normalizedRect(rect);
  const rawLongitude = finiteNumber(point[0], "Longitude");
  const longitude =
    rawLongitude >= -180 && rawLongitude <= 180
      ? rawLongitude
      : normalizeLongitude(rawLongitude);
  const latitude = Math.max(-90, Math.min(90, finiteNumber(point[1], "Latitude")));

  return {
    x: target.x + Math.round(((longitude + 180) / 360) * (target.width - 1)),
    y: target.y + Math.round(((90 - latitude) / 180) * (target.height - 1)),
  };
}

/** Convenience form for live aircraft fields that arrive as separate values. */
export function projectToGrid(
  longitude: number,
  latitude: number,
  rect: GridRect,
): LedPoint {
  return projectLonLat([longitude, latitude], rect);
}

/** Return whether a coordinate is visible inside a regional viewport. */
export function isLonLatInBounds(point: LonLat, bounds: GeoBounds): boolean {
  const region = normalizeGeoBounds(bounds);
  const latitude = finiteNumber(point[1], "Latitude");
  if (latitude < region.south - EPSILON || latitude > region.north + EPSILON) {
    return false;
  }
  if (region.fullLongitude) return true;

  const longitude = unwrapLongitudeNear(point[0], region.centerLongitude);
  return longitude >= region.west - EPSILON && longitude <= region.east + EPSILON;
}

/**
 * Project a coordinate into a regional LED viewport. Coordinates outside the
 * viewport return null so callers can omit off-screen aircraft and markers.
 */
export function projectLonLatToRegion(
  point: LonLat,
  rect: GridRect,
  bounds: GeoBounds,
): LedPoint | null {
  const target = normalizedRect(rect);
  const region = normalizeGeoBounds(bounds);
  const latitude = finiteNumber(point[1], "Latitude");
  if (latitude < region.south - EPSILON || latitude > region.north + EPSILON) {
    return null;
  }

  const rawLongitude = finiteNumber(point[0], "Longitude");
  const longitude = region.fullLongitude
    ? rawLongitude >= -180 && rawLongitude <= 180
      ? rawLongitude
      : normalizeLongitude(rawLongitude)
    : unwrapLongitudeNear(rawLongitude, region.centerLongitude);
  if (longitude < region.west - EPSILON || longitude > region.east + EPSILON) {
    return null;
  }

  return projectUnwrappedPoint(longitude, latitude, region, target);
}

function sameLonLat(left: LonLat, right: LonLat): boolean {
  return (
    Math.abs(left[0] - right[0]) < EPSILON &&
    Math.abs(left[1] - right[1]) < EPSILON
  );
}

function clipLineToBounds(
  start: LonLat,
  end: LonLat,
  bounds: NormalizedGeoBounds,
): readonly [LonLat, LonLat] | null {
  let startLongitude = unwrapLongitudeNear(start[0], bounds.centerLongitude);
  let endLongitude = unwrapLongitudeNear(end[0], startLongitude);
  const longitudeShift =
    360 *
    Math.round(
      (bounds.centerLongitude - (startLongitude + endLongitude) / 2) / 360,
    );
  startLongitude += longitudeShift;
  endLongitude += longitudeShift;

  const startLatitude = finiteNumber(start[1], "Latitude");
  const endLatitude = finiteNumber(end[1], "Latitude");
  const deltaLongitude = endLongitude - startLongitude;
  const deltaLatitude = endLatitude - startLatitude;
  const coefficients = [
    [-deltaLongitude, startLongitude - bounds.west],
    [deltaLongitude, bounds.east - startLongitude],
    [-deltaLatitude, startLatitude - bounds.south],
    [deltaLatitude, bounds.north - startLatitude],
  ] as const;
  let entry = 0;
  let exit = 1;

  for (const [direction, distance] of coefficients) {
    if (Math.abs(direction) < EPSILON) {
      if (distance < 0) return null;
      continue;
    }

    const ratio = distance / direction;
    if (direction < 0) entry = Math.max(entry, ratio);
    else exit = Math.min(exit, ratio);
    if (entry - exit > EPSILON) return null;
  }

  return [
    [
      startLongitude + deltaLongitude * entry,
      startLatitude + deltaLatitude * entry,
    ],
    [
      startLongitude + deltaLongitude * exit,
      startLatitude + deltaLatitude * exit,
    ],
  ];
}

/**
 * Clip a geographic polyline to regional bounds. Longitudes in returned
 * segments may be outside [-180, 180] when that keeps an antimeridian-crossing
 * view continuous.
 */
export function clipPolylineToBounds(
  polyline: GeoPolyline,
  bounds: GeoBounds,
): GeoPolyline[] {
  if (polyline.length < 2) return [];
  const region = normalizeGeoBounds(bounds);
  const segments: LonLat[][] = [];
  let activeSegment: LonLat[] | undefined;

  for (let index = 1; index < polyline.length; index += 1) {
    const clipped = clipLineToBounds(polyline[index - 1], polyline[index], region);
    if (!clipped) {
      activeSegment = undefined;
      continue;
    }

    const [start, end] = clipped;
    const previous = activeSegment?.[activeSegment.length - 1];
    if (!activeSegment || !previous || !sameLonLat(previous, start)) {
      activeSegment = [start];
      segments.push(activeSegment);
    }
    if (!sameLonLat(activeSegment[activeSegment.length - 1], end)) {
      activeSegment.push(end);
    }
  }

  return segments;
}

/** Project vertices and discard consecutive duplicates created by quantizing. */
export function projectPolyline(
  polyline: GeoPolyline,
  rect: GridRect,
): LedPoint[] {
  const projected: LedPoint[] = [];
  for (const point of polyline) {
    const next = projectLonLat(point, rect);
    const previous = projected[projected.length - 1];
    if (!previous || !sameLedPoint(previous, next)) projected.push(next);
  }
  return projected;
}

export function projectPolygons(
  polygons: readonly GeoPolygon[],
  rect: GridRect,
): ProjectedPolygon[] {
  return polygons.map((polygon) => ({
    id: polygon.id,
    points: projectPolyline(polygon.points, rect),
  }));
}

/**
 * Split a geographic line at the date line. This prevents a Pacific-crossing
 * flight trail from becoming a bright horizontal line across the whole map.
 */
export function splitAtAntimeridian(polyline: GeoPolyline): GeoPolyline[] {
  if (polyline.length === 0) return [];

  const segments: LonLat[][] = [[polyline[0]]];
  for (let index = 1; index < polyline.length; index += 1) {
    const previous = polyline[index - 1];
    const current = polyline[index];
    const longitudeDelta = current[0] - previous[0];

    if (Math.abs(longitudeDelta) <= 180) {
      segments[segments.length - 1].push(current);
      continue;
    }

    const adjustedCurrentLongitude =
      longitudeDelta > 180 ? current[0] - 360 : current[0] + 360;
    const boundary = adjustedCurrentLongitude > 180 ? 180 : -180;
    const interpolation =
      (boundary - previous[0]) / (adjustedCurrentLongitude - previous[0]);
    const boundaryLatitude =
      previous[1] + (current[1] - previous[1]) * interpolation;

    segments[segments.length - 1].push([boundary, boundaryLatitude]);
    segments.push([[-boundary, boundaryLatitude], current]);
  }

  return segments;
}

/** Antimeridian-safe geographic-to-grid projection. */
export function projectPolylineSegments(
  polyline: GeoPolyline,
  rect: GridRect,
): LedPoint[][] {
  return splitAtAntimeridian(polyline)
    .map((segment) => projectPolyline(segment, rect))
    .filter((segment) => segment.length > 0);
}

/** Bresenham rasterization: every returned point is one integer LED cell. */
export function rasterizeGridLine(start: LedPoint, end: LedPoint): LedPoint[] {
  let x = Math.round(start.x);
  let y = Math.round(start.y);
  const endX = Math.round(end.x);
  const endY = Math.round(end.y);
  const deltaX = Math.abs(endX - x);
  const stepX = x < endX ? 1 : -1;
  const deltaY = -Math.abs(endY - y);
  const stepY = y < endY ? 1 : -1;
  let error = deltaX + deltaY;
  const cells: LedPoint[] = [];

  while (true) {
    cells.push({ x, y });
    if (x === endX && y === endY) break;
    const doubled = error * 2;
    if (doubled >= deltaY) {
      error += deltaY;
      x += stepX;
    }
    if (doubled <= deltaX) {
      error += deltaX;
      y += stepY;
    }
  }

  return cells;
}

/** Turn a projected outline into unique LED cells, ready for color batching. */
export function rasterizeGridPolyline(
  polyline: LedPolyline,
  close = false,
): LedPoint[] {
  if (polyline.length === 0) return [];
  if (polyline.length === 1) {
    return [{ x: Math.round(polyline[0].x), y: Math.round(polyline[0].y) }];
  }

  const unique = new Map<string, LedPoint>();
  const segmentCount = polyline.length - 1 + (close ? 1 : 0);
  for (let index = 0; index < segmentCount; index += 1) {
    const start = polyline[index % polyline.length];
    const end = polyline[(index + 1) % polyline.length];
    for (const point of rasterizeGridLine(start, end)) {
      unique.set(`${point.x},${point.y}`, point);
    }
  }
  return [...unique.values()];
}

/** Project and rasterize a date-line-safe world-space line. */
export function projectPolylineToCells(
  polyline: GeoPolyline,
  rect: GridRect,
): LedPoint[] {
  const unique = new Map<string, LedPoint>();
  for (const segment of projectPolylineSegments(polyline, rect)) {
    for (const point of rasterizeGridPolyline(segment)) {
      unique.set(`${point.x},${point.y}`, point);
    }
  }
  return [...unique.values()];
}

/**
 * Clip, project, and rasterize a line inside a regional viewport. Every
 * returned coordinate is an integer cell contained by rect.
 */
export function projectPolylineToRegionalCells(
  polyline: GeoPolyline,
  rect: GridRect,
  bounds: GeoBounds,
): LedPoint[] {
  const target = normalizedRect(rect);
  const region = normalizeGeoBounds(bounds);
  const unique = new Map<string, LedPoint>();

  for (const segment of clipPolylineToBounds(polyline, bounds)) {
    const projected = segment.map((point) =>
      projectUnwrappedPoint(point[0], point[1], region, target),
    );
    for (const point of rasterizeGridPolyline(projected)) {
      if (
        point.x >= target.x &&
        point.x < target.x + target.width &&
        point.y >= target.y &&
        point.y < target.y + target.height
      ) {
        unique.set(`${point.x},${point.y}`, point);
      }
    }
  }

  return [...unique.values()];
}

/** Project all bundled coastlines into one de-duplicated batch of LED cells. */
export function projectWorldCoastlineCells(rect: GridRect): LedPoint[] {
  const unique = new Map<string, LedPoint>();
  for (const coastline of WORLD_COASTLINES) {
    for (const point of projectPolylineToCells(coastline, rect)) {
      unique.set(`${point.x},${point.y}`, point);
    }
  }
  return [...unique.values()];
}

/** Project only the coastline portions visible inside regional bounds. */
export function projectWorldCoastlineCellsInBounds(
  rect: GridRect,
  bounds: GeoBounds,
): LedPoint[] {
  const unique = new Map<string, LedPoint>();
  for (const coastline of WORLD_COASTLINES) {
    for (const point of projectPolylineToRegionalCells(coastline, rect, bounds)) {
      unique.set(`${point.x},${point.y}`, point);
    }
  }
  return [...unique.values()];
}

/**
 * Sample the shortest great-circle route. The result includes both endpoints
 * and may cross the date line; use projectPolylineSegments when rendering it.
 */
export function greatCirclePoints(
  start: LonLat,
  end: LonLat,
  segmentCount = 12,
): LonLat[] {
  const count = Math.max(1, Math.min(256, Math.round(segmentCount)));
  const startLongitude = finiteNumber(start[0], "Start longitude") * DEG_TO_RAD;
  const startLatitude = finiteNumber(start[1], "Start latitude") * DEG_TO_RAD;
  const endLongitude = finiteNumber(end[0], "End longitude") * DEG_TO_RAD;
  const endLatitude = finiteNumber(end[1], "End latitude") * DEG_TO_RAD;

  const startVector = [
    Math.cos(startLatitude) * Math.cos(startLongitude),
    Math.cos(startLatitude) * Math.sin(startLongitude),
    Math.sin(startLatitude),
  ] as const;
  const endVector = [
    Math.cos(endLatitude) * Math.cos(endLongitude),
    Math.cos(endLatitude) * Math.sin(endLongitude),
    Math.sin(endLatitude),
  ] as const;
  const dot = Math.max(
    -1,
    Math.min(
      1,
      startVector[0] * endVector[0] +
        startVector[1] * endVector[1] +
        startVector[2] * endVector[2],
    ),
  );
  const angle = Math.acos(dot);
  const angleSine = Math.sin(angle);
  const longitudeDelta = normalizeLongitude(end[0] - start[0]);
  const points: LonLat[] = [];

  for (let index = 0; index <= count; index += 1) {
    const progress = index / count;
    if (Math.abs(angleSine) < EPSILON) {
      points.push([
        normalizeLongitude(start[0] + longitudeDelta * progress),
        start[1] + (end[1] - start[1]) * progress,
      ]);
      continue;
    }

    const startWeight = Math.sin((1 - progress) * angle) / angleSine;
    const endWeight = Math.sin(progress * angle) / angleSine;
    const x = startWeight * startVector[0] + endWeight * endVector[0];
    const y = startWeight * startVector[1] + endWeight * endVector[1];
    const z = startWeight * startVector[2] + endWeight * endVector[2];
    points.push([
      normalizeLongitude(Math.atan2(y, x) * RAD_TO_DEG),
      Math.atan2(z, Math.hypot(x, y)) * RAD_TO_DEG,
    ]);
  }

  return points;
}

/**
 * Build a short trail behind an aircraft. Points run from the faded tail to
 * the current aircraft position, making index-based intensity straightforward.
 */
export function buildHeadingTrail(
  origin: LonLat,
  headingDegrees: number,
  angularLengthDegrees = 12,
  pointCount = 7,
): LonLat[] {
  const count = Math.max(2, Math.min(64, Math.round(pointCount)));
  const distance = Math.max(
    0,
    Math.min(180, Math.abs(finiteNumber(angularLengthDegrees, "Trail length"))),
  );
  const reverseBearing =
    normalizeLongitude(finiteNumber(headingDegrees, "Heading") + 180) * DEG_TO_RAD;
  const originLongitude = finiteNumber(origin[0], "Origin longitude") * DEG_TO_RAD;
  const originLatitude = finiteNumber(origin[1], "Origin latitude") * DEG_TO_RAD;
  const points: LonLat[] = [];

  for (let index = count - 1; index >= 0; index -= 1) {
    const angularDistance =
      (distance * (index / (count - 1))) * DEG_TO_RAD;
    const latitude = Math.asin(
      Math.sin(originLatitude) * Math.cos(angularDistance) +
        Math.cos(originLatitude) * Math.sin(angularDistance) * Math.cos(reverseBearing),
    );
    const longitude =
      originLongitude +
      Math.atan2(
        Math.sin(reverseBearing) * Math.sin(angularDistance) * Math.cos(originLatitude),
        Math.cos(angularDistance) - Math.sin(originLatitude) * Math.sin(latitude),
      );
    points.push([
      normalizeLongitude(longitude * RAD_TO_DEG),
      latitude * RAD_TO_DEG,
    ]);
  }

  return points;
}
