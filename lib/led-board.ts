import {
  GLYPH_HEIGHT,
  GLYPH_WIDTH,
  getGlyphBit,
  measureTextWidth,
} from "./bitmap-font";

export const LED_COLORS = {
  backdrop: "#030100",
  off: "#0a0400",
  border: "#341500",
  ghost: "#552800",
  amberLow: "#7b3500",
  amber: "#ffa000",
  amberBright: "#ffd737",
  whiteDim: "#bda98d",
  white: "#fff4df",
  red: "#ff1e1e",
  redDim: "#6f0808",
  green: "#39ff78",
  greenDim: "#0c6b31",
  blue: "#36a8ff",
  blueDim: "#0b3f68",
} as const;

export type LedColor = (typeof LED_COLORS)[keyof typeof LED_COLORS] | string;

export interface TextOptions {
  scale?: number;
  spacing?: number;
  maxWidth?: number;
  align?: "left" | "center" | "right";
}

interface BoardMetrics {
  width: number;
  height: number;
  pitch: number;
  rows: number;
  dpr: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Cell-only renderer for the flight board. All drawing primitives ultimately
 * resolve to integer grid coordinates and each color is submitted as one
 * canvas path to keep the frame cheap even on high-DPI displays.
 */
export class LEDBoard {
  readonly cols: number;
  readonly logicalRows: number;

  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly bufferCanvas: HTMLCanvasElement;
  private readonly bufferContext: CanvasRenderingContext2D;
  private readonly pixels = new Map<number, LedColor>();
  private metrics: BoardMetrics = {
    width: 0,
    height: 0,
    pitch: 1,
    rows: 76,
    dpr: 1,
    offsetX: 0,
    offsetY: 0,
  };
  private offGridPath: Path2D | null = null;

  constructor(canvas: HTMLCanvasElement, cols = 136, logicalRows = 76) {
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      throw new Error("A 2D canvas context is required for the LED board.");
    }
    const bufferCanvas = document.createElement("canvas");
    const bufferContext = bufferCanvas.getContext("2d", { alpha: false });
    if (!bufferContext) {
      throw new Error("A 2D canvas context is required for the LED back buffer.");
    }
    this.canvas = canvas;
    this.context = context;
    this.bufferCanvas = bufferCanvas;
    this.bufferContext = bufferContext;
    this.cols = cols;
    this.logicalRows = logicalRows;
    this.metrics.rows = logicalRows;
  }

  get rows(): number {
    return this.metrics.rows;
  }

  get pitch(): number {
    return this.metrics.pitch;
  }

  resize(width: number, height: number, requestedDpr = window.devicePixelRatio || 1): boolean {
    const safeWidth = Math.max(1, Math.floor(width));
    const safeHeight = Math.max(1, Math.floor(height));
    const dpr = Math.min(2, Math.max(1, requestedDpr));
    const rows = this.logicalRows;
    const pitch = Math.min(safeWidth / this.cols, safeHeight / rows);
    const offsetX = (safeWidth - this.cols * pitch) / 2;
    const offsetY = (safeHeight - rows * pitch) / 2;

    if (
      this.metrics.width === safeWidth &&
      this.metrics.height === safeHeight &&
      this.metrics.dpr === dpr &&
      this.metrics.rows === rows
    ) {
      return false;
    }

    this.metrics = { width: safeWidth, height: safeHeight, pitch, rows, dpr, offsetX, offsetY };
    this.canvas.width = Math.round(safeWidth * dpr);
    this.canvas.height = Math.round(safeHeight * dpr);
    this.bufferCanvas.width = this.canvas.width;
    this.bufferCanvas.height = this.canvas.height;
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.bufferContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.context.imageSmoothingEnabled = false;
    this.bufferContext.imageSmoothingEnabled = false;
    this.offGridPath = this.createGridPath();
    return true;
  }

  clear(): void {
    this.pixels.clear();
  }

  set(col: number, row: number, color: LedColor): void {
    const x = Math.round(col);
    const y = Math.round(row);
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
      return;
    }
    this.pixels.set(y * this.cols + x, color);
  }

  unset(col: number, row: number): void {
    const x = Math.round(col);
    const y = Math.round(row);
    this.pixels.delete(y * this.cols + x);
  }

  horizontal(x1: number, x2: number, y: number, color: LedColor, dash = 1): void {
    const from = Math.min(Math.round(x1), Math.round(x2));
    const to = Math.max(Math.round(x1), Math.round(x2));
    const cadence = Math.max(1, Math.round(dash));
    for (let x = from; x <= to; x += 1) {
      if (cadence === 1 || Math.floor((x - from) / cadence) % 2 === 0) {
        this.set(x, y, color);
      }
    }
  }

  vertical(x: number, y1: number, y2: number, color: LedColor, dash = 1): void {
    const from = Math.min(Math.round(y1), Math.round(y2));
    const to = Math.max(Math.round(y1), Math.round(y2));
    const cadence = Math.max(1, Math.round(dash));
    for (let y = from; y <= to; y += 1) {
      if (cadence === 1 || Math.floor((y - from) / cadence) % 2 === 0) {
        this.set(x, y, color);
      }
    }
  }

  line(x0: number, y0: number, x1: number, y1: number, color: LedColor): void {
    let startX = Math.round(x0);
    let startY = Math.round(y0);
    const endX = Math.round(x1);
    const endY = Math.round(y1);
    const deltaX = Math.abs(endX - startX);
    const stepX = startX < endX ? 1 : -1;
    const deltaY = -Math.abs(endY - startY);
    const stepY = startY < endY ? 1 : -1;
    let error = deltaX + deltaY;

    while (true) {
      this.set(startX, startY, color);
      if (startX === endX && startY === endY) break;
      const doubled = error * 2;
      if (doubled >= deltaY) {
        error += deltaY;
        startX += stepX;
      }
      if (doubled <= deltaX) {
        error += deltaX;
        startY += stepY;
      }
    }
  }

  rect(x: number, y: number, width: number, height: number, color: LedColor): void {
    if (width <= 0 || height <= 0) return;
    this.horizontal(x, x + width - 1, y, color);
    this.horizontal(x, x + width - 1, y + height - 1, color);
    this.vertical(x, y, y + height - 1, color);
    this.vertical(x + width - 1, y, y + height - 1, color);
  }

  fill(x: number, y: number, width: number, height: number, color: LedColor): void {
    for (let row = y; row < y + height; row += 1) {
      this.horizontal(x, x + width - 1, row, color);
    }
  }

  text(value: string, x: number, y: number, color: LedColor, options: TextOptions = {}): number {
    const scale = Math.max(1, Math.floor(options.scale ?? 1));
    const spacing = Math.max(0, Math.floor(options.spacing ?? 1));
    const characters = Array.from(value.toUpperCase());
    const naturalWidth = measureTextWidth(value, scale, spacing);
    const maxWidth = options.maxWidth ?? Number.POSITIVE_INFINITY;
    let startX = Math.round(x);

    if (options.align === "center") startX -= Math.floor(Math.min(naturalWidth, maxWidth) / 2);
    if (options.align === "right") startX -= Math.min(naturalWidth, maxWidth);

    let cursor = startX;
    const rightEdge = startX + maxWidth;
    for (const character of characters) {
      const glyphWidth = GLYPH_WIDTH * scale;
      if (cursor + glyphWidth > rightEdge) break;
      for (let glyphY = 0; glyphY < GLYPH_HEIGHT; glyphY += 1) {
        for (let glyphX = 0; glyphX < GLYPH_WIDTH; glyphX += 1) {
          if (!getGlyphBit(character, glyphX, glyphY)) continue;
          for (let offsetY = 0; offsetY < scale; offsetY += 1) {
            for (let offsetX = 0; offsetX < scale; offsetX += 1) {
              this.set(
                cursor + glyphX * scale + offsetX,
                y + glyphY * scale + offsetY,
                color,
              );
            }
          }
        }
      }
      cursor += glyphWidth + spacing * scale;
    }
    return cursor - startX;
  }

  render(): void {
    const { width, height } = this.metrics;
    const context = this.bufferContext;
    context.save();
    context.setTransform(this.metrics.dpr, 0, 0, this.metrics.dpr, 0, 0);
    context.shadowBlur = 0;
    context.fillStyle = LED_COLORS.backdrop;
    context.fillRect(0, 0, width, height);

    if (this.offGridPath) {
      context.fillStyle = LED_COLORS.off;
      context.fill(this.offGridPath);
    }

    const paths = new Map<LedColor, Path2D>();
    for (const [index, color] of this.pixels) {
      let path = paths.get(color);
      if (!path) {
        path = new Path2D();
        paths.set(color, path);
      }
      const x = index % this.cols;
      const y = Math.floor(index / this.cols);
      this.appendCell(path, x, y);
    }

    for (const [color, path] of paths) {
      context.fillStyle = color;
      // The CSS filter supplies the optical bloom. Keeping the cell batches
      // shadow-free avoids long GPU queues and torn/incomplete visible frames.
      context.shadowBlur = 0;
      context.fill(path);
    }

    context.restore();
    this.context.save();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.drawImage(this.bufferCanvas, 0, 0);
    this.context.restore();
  }

  private createGridPath(): Path2D {
    const path = new Path2D();
    for (let y = 0; y < this.rows; y += 1) {
      for (let x = 0; x < this.cols; x += 1) {
        this.appendCell(path, x, y);
      }
    }
    return path;
  }

  private appendCell(path: Path2D, col: number, row: number): void {
    const pitch = this.metrics.pitch;
    const gap = Math.max(1, pitch * 0.22);
    const size = Math.max(1, pitch - gap);
    const inset = gap / 2;
    path.rect(
      this.metrics.offsetX + col * pitch + inset,
      this.metrics.offsetY + row * pitch + inset,
      size,
      size,
    );
  }
}
