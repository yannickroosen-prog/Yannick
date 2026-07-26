// Rasterdetectie: verdeel het rechtgetrokken bord in 15x15 cellen en bepaal
// per cel of er een steen ligt (bezettingsdetectie op basis van inktdichtheid).

import { BOARD_SIZE } from '../scrabble/config';

export interface CellImage {
  row: number;
  col: number;
  canvas: HTMLCanvasElement;
  /** Aandeel donkere pixels (0-1) — proxy voor "er ligt een steen/letter". */
  ink: number;
  /** Geschat: bevat deze cel een steen? */
  occupied: boolean;
}

export interface GridExtractionResult {
  cells: CellImage[];
  size: number;
}

/**
 * Snijdt het vierkante bordbeeld in 15x15 cellen.
 * `inset` knipt de celranden weg zodat rasterlijnen de OCR niet storen.
 */
export function extractGrid(
  board: HTMLCanvasElement,
  occupancyThreshold = 0.06,
  inset = 0.12
): GridExtractionResult {
  const size = board.width;
  const cellSize = size / BOARD_SIZE;
  const cells: CellImage[] = [];

  const srcCtx = board.getContext('2d', { willReadFrequently: true })!;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const x0 = Math.round(c * cellSize + cellSize * inset);
      const y0 = Math.round(r * cellSize + cellSize * inset);
      const w = Math.round(cellSize * (1 - 2 * inset));
      const h = Math.round(cellSize * (1 - 2 * inset));

      const cellCanvas = document.createElement('canvas');
      cellCanvas.width = w;
      cellCanvas.height = h;
      const cctx = cellCanvas.getContext('2d')!;
      cctx.drawImage(board, x0, y0, w, h, 0, 0, w, h);

      const ink = computeInk(srcCtx, x0, y0, w, h);
      cells.push({
        row: r,
        col: c,
        canvas: cellCanvas,
        ink,
        occupied: ink > occupancyThreshold,
      });
    }
  }

  return { cells, size };
}

/**
 * Berekent het aandeel "inkt" (donkere pixels na Otsu-achtige drempel) binnen
 * een regio. Dit onderscheidt lege vakjes van vakjes met een letter.
 */
function computeInk(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): number {
  const { data } = ctx.getImageData(x, y, w, h);
  const n = w * h;
  if (n === 0) return 0;

  // Gemiddelde luminantie bepalen.
  let sum = 0;
  const lum = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    lum[i] = l;
    sum += l;
  }
  const mean = sum / n;
  // Drempel iets onder het gemiddelde; tel donkere pixels (letterlijnen).
  const threshold = mean * 0.6;
  let dark = 0;
  for (let i = 0; i < n; i++) if (lum[i] < threshold) dark++;
  return dark / n;
}
