import { LED_COLORS, type LEDBoard, type LedColor } from "./led-board";
import { normalizeCallsign } from "./airlines";

export const AIRLINE_LOGO_WIDTH = 16 as const;
export const AIRLINE_LOGO_HEIGHT = 7 as const;

/** Single-character color keys used by the cell-native logo bitmaps below. */
export const AIRLINE_LOGO_COLORS = Object.freeze({
  W: "#fff7e8",
  R: LED_COLORS.red,
  B: "#238cff",
  N: "#1757d7",
  G: LED_COLORS.amberBright,
  P: "#bd65ff",
  E: "#39d98a",
  T: "#35e1d0",
} satisfies Readonly<Record<string, LedColor>>);

export type AirlineLogoColorKey = keyof typeof AIRLINE_LOGO_COLORS;
export type AirlineLogoRows = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

/**
 * A transparent, cell-aligned airline mark. A dot is an unlit/transparent
 * cell; every other character resolves through AIRLINE_LOGO_COLORS.
 */
export interface AirlineLogoDefinition {
  readonly icao: string;
  readonly name: string;
  readonly width: typeof AIRLINE_LOGO_WIDTH;
  readonly height: typeof AIRLINE_LOGO_HEIGHT;
  readonly rows: AirlineLogoRows;
}

function defineLogo(
  icao: string,
  name: string,
  rows: AirlineLogoRows,
): AirlineLogoDefinition {
  for (const row of rows) {
    if (row.length !== AIRLINE_LOGO_WIDTH) {
      throw new Error(`${icao} airline logo rows must be ${AIRLINE_LOGO_WIDTH} cells wide.`);
    }

    for (const cell of row) {
      if (cell !== "." && !(cell in AIRLINE_LOGO_COLORS)) {
        throw new Error(`${icao} airline logo uses unknown color key "${cell}".`);
      }
    }
  }

  return Object.freeze({
    icao,
    name,
    width: AIRLINE_LOGO_WIDTH,
    height: AIRLINE_LOGO_HEIGHT,
    rows,
  });
}

/**
 * Compact logo marks for the most common/demo airline callsign prefixes.
 * They are deliberately symbols rather than tiny wordmarks: each remains
 * identifiable at the board's native 16 x 7-cell resolution.
 */
export const AIRLINE_LOGOS = Object.freeze({
  // American's diagonal Flight Symbol: blue wing, white divide, red wing.
  AAL: defineLogo("AAL", "American Airlines", [
    "..BBBBBB........",
    "...BBBBBBW......",
    "....BBBBWWW.....",
    "......WWWW......",
    ".....WWWRRRR....",
    "....WWRRRRRR....",
    "...RRRRRR.......",
  ]),

  // Thai's purple-and-gold orchid.
  THA: defineLogo("THA", "Thai Airways", [
    "......P.........",
    "...P.PPP.P......",
    "..PPPGGGPPP.....",
    "...PPGGGPP......",
    "....PGGGP.......",
    ".....PGP........",
    "......G.........",
  ]),

  // Singapore's gold bird in flight.
  SIA: defineLogo("SIA", "Singapore Airlines", [
    "........G.......",
    "..G...GGG.......",
    "...GGGGGGGG.....",
    ".....GGGGGGG....",
    ".......GGGGGG...",
    ".....GGG.GGG....",
    "...GGG.....GG...",
  ]),

  // Emirates' red tail sweep with UAE flag accents.
  UAE: defineLogo("UAE", "Emirates", [
    "RRR.............",
    ".RRR....G.......",
    "..RRR..GG.......",
    "...RRR.GG.W.....",
    "....RRGG.WW.....",
    ".....RGG.WWW....",
    "......GG.WWWW...",
  ]),

  // Cathay Pacific's green brushwing.
  CPA: defineLogo("CPA", "Cathay Pacific", [
    "....E...........",
    "...EEE..........",
    "..EEEEEE........",
    ".EEE..EEEE......",
    "...E....EEEE....",
    ".........EEEE...",
    "...........EE...",
  ]),

  // British Airways' blue-and-red Speedmarque ribbon.
  BAW: defineLogo("BAW", "British Airways", [
    "..BBBBBBBBBB....",
    ".....BBBBBBBB...",
    "........BBBBB...",
    "...WWWWWW.......",
    ".....WWWWRRRR...",
    "........RRRRRR..",
    "..........RRRR..",
  ]),

  // Lufthansa's gold crane badge on blue.
  DLH: defineLogo("DLH", "Lufthansa", [
    "....NNNNNNNN....",
    "....NNGGGGNN....",
    "....NG..G.NN....",
    "....NG.GG.NN....",
    "....NGG...NN....",
    "....NNGGGGNN....",
    "....NNNNNNNN....",
  ]),

  // KLM's blue crown.
  KLM: defineLogo("KLM", "KLM", [
    "....B..B..B.....",
    "....BBBBBBB.....",
    ".....B.B.B......",
    "...BBBBBBBBB....",
    "....BBBBBBB.....",
    "....BBBBBBB.....",
    "................",
  ]),

  // Qantas' red tail with a white kangaroo silhouette.
  QFA: defineLogo("QFA", "Qantas", [
    ".....RRR........",
    "....RRRRR.......",
    "...RRWWRRR......",
    "..RR.WWRRRR.....",
    ".RR.W.WRRRRR....",
    "RR...WWRRRRRR...",
    "RRRRRRRRRRRRR...",
  ]),

  // Air New Zealand's teal koru spiral.
  ANZ: defineLogo("ANZ", "Air New Zealand", [
    "....TTTT........",
    "..TT....TT......",
    ".TT..TT..TT.....",
    ".T..TTTT..T.....",
    ".T..T..T..T.....",
    "..TT.TT.TT......",
    "....TTTT........",
  ]),

  // Ryanair's gold harp on its deep-blue field.
  RYR: defineLogo("RYR", "Ryanair", [
    "....NNNNNNNN....",
    "....NNG...NN....",
    "....NGGG..NN....",
    "....NNGGG.NN....",
    "....N.GGGGNN....",
    "....NN.GGGNN....",
    "....NNNNNNNN....",
  ]),

  // Delta's red widget with blue lower facet.
  DAL: defineLogo("DAL", "Delta Air Lines", [
    ".......R........",
    "......RRR.......",
    ".....RRRRR......",
    "....RRRWRRR.....",
    "...RRRWWWRRR....",
    ".....NNNNN......",
    ".......N........",
  ]),

  // United's blue globe with white latitude/longitude bands.
  UAL: defineLogo("UAL", "United Airlines", [
    ".....BBBBBB.....",
    "...BBBWWBBBB....",
    "..BBWBBBBWBBB...",
    "..BWWWWWWWWB....",
    "..BBWBBBBWBBB...",
    "...BBBBWWBBB....",
    ".....BBBBBB.....",
  ]),
} as const satisfies Readonly<Record<string, AirlineLogoDefinition>>);

export type AirlineLogoPrefix = keyof typeof AIRLINE_LOGOS;

/** Neutral top-down aircraft mark for private or unrecognised callsigns. */
export const GENERIC_AIRLINE_LOGO = defineLogo("GEN", "Other aircraft", [
  ".......W........",
  ".......W........",
  "..WWWWWWWWWWW...",
  "....WWWWWWW.....",
  "......WWW.......",
  ".......W........",
  "......W.W.......",
]);

export function getAirlineLogo(
  callsign: string | null | undefined,
): AirlineLogoDefinition {
  const prefix = normalizeCallsign(callsign).slice(0, 3) as AirlineLogoPrefix;
  return AIRLINE_LOGOS[prefix] ?? GENERIC_AIRLINE_LOGO;
}

/**
 * Draw a logo using horizontal LED-cell runs only. There are no freeform
 * canvas paths, images, DOM elements, or font glyphs in this renderer.
 */
export function drawAirlineLogo(
  board: LEDBoard,
  callsign: string | null | undefined,
  x: number,
  y: number,
): AirlineLogoDefinition {
  const logo = getAirlineLogo(callsign);
  const originX = Math.round(x);
  const originY = Math.round(y);

  for (let rowIndex = 0; rowIndex < logo.height; rowIndex += 1) {
    const row = logo.rows[rowIndex];
    let col = 0;

    while (col < logo.width) {
      const key = row[col];
      if (key === ".") {
        col += 1;
        continue;
      }

      let runEnd = col + 1;
      while (runEnd < logo.width && row[runEnd] === key) runEnd += 1;

      board.fill(
        originX + col,
        originY + rowIndex,
        runEnd - col,
        1,
        AIRLINE_LOGO_COLORS[key as AirlineLogoColorKey],
      );
      col = runEnd;
    }
  }

  return logo;
}
