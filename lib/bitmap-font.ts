/**
 * A compact 5x7 bitmap font for the LED board.
 *
 * Each number stores one five-bit row. The most-significant used bit is the
 * left-most pixel, so `0b10000` lights column 0 and `0b00001` lights column 4.
 * Keeping glyphs as bit masks makes checking pixels in the canvas render loop
 * inexpensive and avoids allocating string or DOM based text.
 */

export const GLYPH_WIDTH = 5;
export const GLYPH_HEIGHT = 7;
export const DEFAULT_LETTER_SPACING = 1;
export const DEFAULT_LINE_SPACING = 1;

export type BitmapGlyph = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export interface GlyphPixel {
  readonly x: number;
  readonly y: number;
}

export interface BitmapTextMetrics {
  /** Width of the longest line, in destination LED cells. */
  readonly width: number;
  /** Total height, including inter-line spacing, in destination LED cells. */
  readonly height: number;
  /** Height of one rendered glyph, in destination LED cells. */
  readonly lineHeight: number;
  readonly lineCount: number;
}

function glyph(...rows: string[]): BitmapGlyph {
  if (rows.length !== GLYPH_HEIGHT) {
    throw new Error(`A 5x7 glyph must contain ${GLYPH_HEIGHT} rows.`);
  }

  const encoded = rows.map((row) => {
    if (!/^[01]{5}$/.test(row)) {
      throw new Error(`Invalid 5x7 glyph row: ${row}`);
    }
    return Number.parseInt(row, 2);
  });

  return Object.freeze(encoded) as unknown as BitmapGlyph;
}

/** Glyph data is intentionally exported for callers that want a direct lookup. */
export const BITMAP_FONT: Readonly<Record<string, BitmapGlyph>> = Object.freeze({
  " ": glyph(
    "00000",
    "00000",
    "00000",
    "00000",
    "00000",
    "00000",
    "00000",
  ),

  A: glyph(
    "01110",
    "10001",
    "10001",
    "11111",
    "10001",
    "10001",
    "10001",
  ),
  B: glyph(
    "11110",
    "10001",
    "10001",
    "11110",
    "10001",
    "10001",
    "11110",
  ),
  C: glyph(
    "01111",
    "10000",
    "10000",
    "10000",
    "10000",
    "10000",
    "01111",
  ),
  D: glyph(
    "11110",
    "10001",
    "10001",
    "10001",
    "10001",
    "10001",
    "11110",
  ),
  E: glyph(
    "11111",
    "10000",
    "10000",
    "11110",
    "10000",
    "10000",
    "11111",
  ),
  F: glyph(
    "11111",
    "10000",
    "10000",
    "11110",
    "10000",
    "10000",
    "10000",
  ),
  G: glyph(
    "01111",
    "10000",
    "10000",
    "10111",
    "10001",
    "10001",
    "01111",
  ),
  H: glyph(
    "10001",
    "10001",
    "10001",
    "11111",
    "10001",
    "10001",
    "10001",
  ),
  I: glyph(
    "11111",
    "00100",
    "00100",
    "00100",
    "00100",
    "00100",
    "11111",
  ),
  J: glyph(
    "00111",
    "00010",
    "00010",
    "00010",
    "00010",
    "10010",
    "01100",
  ),
  K: glyph(
    "10001",
    "10010",
    "10100",
    "11000",
    "10100",
    "10010",
    "10001",
  ),
  L: glyph(
    "10000",
    "10000",
    "10000",
    "10000",
    "10000",
    "10000",
    "11111",
  ),
  M: glyph(
    "10001",
    "11011",
    "10101",
    "10101",
    "10001",
    "10001",
    "10001",
  ),
  N: glyph(
    "10001",
    "11001",
    "10101",
    "10011",
    "10001",
    "10001",
    "10001",
  ),
  O: glyph(
    "01110",
    "10001",
    "10001",
    "10001",
    "10001",
    "10001",
    "01110",
  ),
  P: glyph(
    "11110",
    "10001",
    "10001",
    "11110",
    "10000",
    "10000",
    "10000",
  ),
  Q: glyph(
    "01110",
    "10001",
    "10001",
    "10001",
    "10101",
    "10010",
    "01101",
  ),
  R: glyph(
    "11110",
    "10001",
    "10001",
    "11110",
    "10100",
    "10010",
    "10001",
  ),
  S: glyph(
    "01111",
    "10000",
    "10000",
    "01110",
    "00001",
    "00001",
    "11110",
  ),
  T: glyph(
    "11111",
    "00100",
    "00100",
    "00100",
    "00100",
    "00100",
    "00100",
  ),
  U: glyph(
    "10001",
    "10001",
    "10001",
    "10001",
    "10001",
    "10001",
    "01110",
  ),
  V: glyph(
    "10001",
    "10001",
    "10001",
    "10001",
    "10001",
    "01010",
    "00100",
  ),
  W: glyph(
    "10001",
    "10001",
    "10001",
    "10101",
    "10101",
    "11011",
    "10001",
  ),
  X: glyph(
    "10001",
    "10001",
    "01010",
    "00100",
    "01010",
    "10001",
    "10001",
  ),
  Y: glyph(
    "10001",
    "10001",
    "01010",
    "00100",
    "00100",
    "00100",
    "00100",
  ),
  Z: glyph(
    "11111",
    "00001",
    "00010",
    "00100",
    "01000",
    "10000",
    "11111",
  ),

  "0": glyph(
    "01110",
    "10001",
    "10011",
    "10101",
    "11001",
    "10001",
    "01110",
  ),
  "1": glyph(
    "00100",
    "01100",
    "00100",
    "00100",
    "00100",
    "00100",
    "01110",
  ),
  "2": glyph(
    "01110",
    "10001",
    "00001",
    "00010",
    "00100",
    "01000",
    "11111",
  ),
  "3": glyph(
    "11110",
    "00001",
    "00001",
    "01110",
    "00001",
    "00001",
    "11110",
  ),
  "4": glyph(
    "00010",
    "00110",
    "01010",
    "10010",
    "11111",
    "00010",
    "00010",
  ),
  "5": glyph(
    "11111",
    "10000",
    "10000",
    "11110",
    "00001",
    "00001",
    "11110",
  ),
  "6": glyph(
    "01110",
    "10000",
    "10000",
    "11110",
    "10001",
    "10001",
    "01110",
  ),
  "7": glyph(
    "11111",
    "00001",
    "00010",
    "00100",
    "01000",
    "01000",
    "01000",
  ),
  "8": glyph(
    "01110",
    "10001",
    "10001",
    "01110",
    "10001",
    "10001",
    "01110",
  ),
  "9": glyph(
    "01110",
    "10001",
    "10001",
    "01111",
    "00001",
    "00001",
    "01110",
  ),

  ":": glyph(
    "00000",
    "00100",
    "00100",
    "00000",
    "00100",
    "00100",
    "00000",
  ),
  "/": glyph(
    "00001",
    "00001",
    "00010",
    "00100",
    "01000",
    "10000",
    "10000",
  ),
  "-": glyph(
    "00000",
    "00000",
    "00000",
    "11111",
    "00000",
    "00000",
    "00000",
  ),
  "+": glyph(
    "00000",
    "00100",
    "00100",
    "11111",
    "00100",
    "00100",
    "00000",
  ),
  ".": glyph(
    "00000",
    "00000",
    "00000",
    "00000",
    "00000",
    "00110",
    "00110",
  ),
  ",": glyph(
    "00000",
    "00000",
    "00000",
    "00000",
    "00110",
    "00110",
    "00100",
  ),
  "(": glyph(
    "00010",
    "00100",
    "01000",
    "01000",
    "01000",
    "00100",
    "00010",
  ),
  ")": glyph(
    "01000",
    "00100",
    "00010",
    "00010",
    "00010",
    "00100",
    "01000",
  ),
  "\u00b0": glyph(
    "01100",
    "10010",
    "10010",
    "01100",
    "00000",
    "00000",
    "00000",
  ),
  "?": glyph(
    "01110",
    "10001",
    "00001",
    "00010",
    "00100",
    "00000",
    "00100",
  ),
  "!": glyph(
    "00100",
    "00100",
    "00100",
    "00100",
    "00100",
    "00000",
    "00100",
  ),

  // A few extras are useful for units, status messages, and identifiers.
  "'": glyph(
    "00100",
    "00100",
    "00010",
    "00000",
    "00000",
    "00000",
    "00000",
  ),
  '"': glyph(
    "01010",
    "01010",
    "00100",
    "00000",
    "00000",
    "00000",
    "00000",
  ),
  "#": glyph(
    "01010",
    "11111",
    "01010",
    "01010",
    "11111",
    "01010",
    "00000",
  ),
  "%": glyph(
    "11001",
    "11010",
    "00100",
    "01000",
    "10110",
    "00110",
    "00000",
  ),
  "&": glyph(
    "01100",
    "10010",
    "10100",
    "01000",
    "10101",
    "10010",
    "01101",
  ),
  "*": glyph(
    "00000",
    "10101",
    "01110",
    "11111",
    "01110",
    "10101",
    "00000",
  ),
  "=": glyph(
    "00000",
    "00000",
    "11111",
    "00000",
    "11111",
    "00000",
    "00000",
  ),
  "_": glyph(
    "00000",
    "00000",
    "00000",
    "00000",
    "00000",
    "00000",
    "11111",
  ),
  "[": glyph(
    "01110",
    "01000",
    "01000",
    "01000",
    "01000",
    "01000",
    "01110",
  ),
  "]": glyph(
    "01110",
    "00010",
    "00010",
    "00010",
    "00010",
    "00010",
    "01110",
  ),
  "|": glyph(
    "00100",
    "00100",
    "00100",
    "00100",
    "00100",
    "00100",
    "00100",
  ),
});

/** Alias with a size-oriented name for convenient imports. */
export const FONT_5X7 = BITMAP_FONT;

const CHARACTER_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  "\u2013": "-",
  "\u2014": "-",
  "\u2212": "-",
  "\u2018": "'",
  "\u2019": "'",
  "\u201c": '"',
  "\u201d": '"',
  "\u00ba": "\u00b0",
  "\t": " ",
});

function assertScale(scale: number): void {
  if (!Number.isInteger(scale) || scale < 1) {
    throw new RangeError("Bitmap font scale must be a positive integer.");
  }
}

function assertSpacing(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer.`);
  }
}

/**
 * Returns the canonical glyph key. Input is case-insensitive; unknown symbols
 * resolve to `?`, and an empty string resolves to a space.
 */
export function normalizeGlyphCharacter(character: string): string {
  const firstCharacter = Array.from(character)[0] ?? " ";
  const alias = CHARACTER_ALIASES[firstCharacter] ?? firstCharacter;

  if (BITMAP_FONT[alias]) {
    return alias;
  }

  const uppercase = alias.toUpperCase();
  return BITMAP_FONT[uppercase] ? uppercase : "?";
}

export function hasGlyph(character: string): boolean {
  const firstCharacter = Array.from(character)[0];
  if (firstCharacter === undefined) {
    return false;
  }

  const alias = CHARACTER_ALIASES[firstCharacter] ?? firstCharacter;
  return Boolean(BITMAP_FONT[alias] ?? BITMAP_FONT[alias.toUpperCase()]);
}

/** Gets an immutable array of seven five-bit row masks. */
export function getGlyph(character: string): BitmapGlyph {
  return BITMAP_FONT[normalizeGlyphCharacter(character)];
}

/** Tests one unscaled glyph cell without allocating an intermediate matrix. */
export function getGlyphBit(
  characterOrGlyph: string | BitmapGlyph,
  column: number,
  row: number,
): boolean {
  if (
    !Number.isInteger(column) ||
    !Number.isInteger(row) ||
    column < 0 ||
    column >= GLYPH_WIDTH ||
    row < 0 ||
    row >= GLYPH_HEIGHT
  ) {
    return false;
  }

  const selectedGlyph =
    typeof characterOrGlyph === "string"
      ? getGlyph(characterOrGlyph)
      : characterOrGlyph;
  const mask = 1 << (GLYPH_WIDTH - 1 - column);
  return (selectedGlyph[row] & mask) !== 0;
}

/**
 * Expands a glyph into a row-major boolean matrix. Every source LED becomes a
 * `scale` by `scale` block, preserving the discrete LED grid.
 */
export function getScaledGlyphBits(
  characterOrGlyph: string | BitmapGlyph,
  scale = 1,
): ReadonlyArray<ReadonlyArray<boolean>> {
  assertScale(scale);
  const selectedGlyph =
    typeof characterOrGlyph === "string"
      ? getGlyph(characterOrGlyph)
      : characterOrGlyph;
  const rows: boolean[][] = [];

  for (let sourceY = 0; sourceY < GLYPH_HEIGHT; sourceY += 1) {
    for (let repeatY = 0; repeatY < scale; repeatY += 1) {
      const outputRow: boolean[] = [];
      for (let sourceX = 0; sourceX < GLYPH_WIDTH; sourceX += 1) {
        const isLit = getGlyphBit(selectedGlyph, sourceX, sourceY);
        for (let repeatX = 0; repeatX < scale; repeatX += 1) {
          outputRow.push(isLit);
        }
      }
      rows.push(Object.freeze(outputRow) as boolean[]);
    }
  }

  return Object.freeze(rows);
}

/**
 * Returns only lit destination cells. This is convenient for batched canvas
 * rendering because callers never need to visit unlit glyph cells.
 */
export function getGlyphPixels(
  characterOrGlyph: string | BitmapGlyph,
  scale = 1,
): ReadonlyArray<GlyphPixel> {
  assertScale(scale);
  const selectedGlyph =
    typeof characterOrGlyph === "string"
      ? getGlyph(characterOrGlyph)
      : characterOrGlyph;
  const pixels: GlyphPixel[] = [];

  for (let sourceY = 0; sourceY < GLYPH_HEIGHT; sourceY += 1) {
    for (let sourceX = 0; sourceX < GLYPH_WIDTH; sourceX += 1) {
      if (!getGlyphBit(selectedGlyph, sourceX, sourceY)) {
        continue;
      }

      for (let offsetY = 0; offsetY < scale; offsetY += 1) {
        for (let offsetX = 0; offsetX < scale; offsetX += 1) {
          pixels.push(
            Object.freeze({
              x: sourceX * scale + offsetX,
              y: sourceY * scale + offsetY,
            }),
          );
        }
      }
    }
  }

  return Object.freeze(pixels);
}

/** Width of a single line in destination LED cells. */
export function measureTextWidth(
  text: string,
  scale = 1,
  letterSpacing = DEFAULT_LETTER_SPACING,
): number {
  assertScale(scale);
  assertSpacing(letterSpacing, "Letter spacing");

  const characterCount = Array.from(text).length;
  if (characterCount === 0) {
    return 0;
  }

  return (
    characterCount * GLYPH_WIDTH * scale +
    (characterCount - 1) * letterSpacing * scale
  );
}

/**
 * Measures one or more newline-separated lines in destination LED cells.
 * Spacing arguments are expressed in source-grid cells and scale with glyphs.
 */
export function measureText(
  text: string,
  scale = 1,
  letterSpacing = DEFAULT_LETTER_SPACING,
  lineSpacing = DEFAULT_LINE_SPACING,
): BitmapTextMetrics {
  assertScale(scale);
  assertSpacing(letterSpacing, "Letter spacing");
  assertSpacing(lineSpacing, "Line spacing");

  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const lineHeight = GLYPH_HEIGHT * scale;
  const width = lines.reduce(
    (maximum, line) =>
      Math.max(maximum, measureTextWidth(line, scale, letterSpacing)),
    0,
  );
  const height =
    lines.length * lineHeight + (lines.length - 1) * lineSpacing * scale;

  return Object.freeze({
    width,
    height,
    lineHeight,
    lineCount: lines.length,
  });
}
