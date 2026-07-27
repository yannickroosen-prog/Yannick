// Rasterdetectie: verdeel het rechtgetrokken bord in 15x15 cellen en bepaal
// per cel of er een STEEN ligt.
//
// Belangrijk: een Scrabble-bord is zelf zwaar bedrukt (gekleurde bonusvakken,
// tekst). Donkere pixels tellen werkt daardoor niet — bedrukte bonusvakken
// worden dan als steen aangezien. Scrabble-stenen zijn daarentegen bleek,
// warm (crème/hout) en weinig verzadigd, terwijl álle bordkleuren juist sterk
// verzadigd zijn. We detecteren stenen dus op kleur: hoge helderheid + lage
// verzadiging.

import { BOARD_SIZE } from '../scrabble/config';

export interface CellImage {
  row: number;
  col: number;
  canvas: HTMLCanvasElement;
  /** Aandeel "steen-achtige" (bleke, warme) pixels in de cel (0-1). */
  tileScore: number;
  /** Geschat: ligt er een steen in deze cel? */
  occupied: boolean;
}

export interface GridExtractionResult {
  cells: CellImage[];
  size: number;
}

/**
 * Snijdt het vierkante bordbeeld in 15x15 cellen.
 * `inset` knipt de celranden weg zodat rasterlijnen niet meetellen.
 */
export function extractGrid(
  board: HTMLCanvasElement,
  occupancyThreshold = 0.4,
  inset = 0.14
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

      const tileScore = computeTileScore(srcCtx, x0, y0, w, h);
      cells.push({
        row: r,
        col: c,
        canvas: cellCanvas,
        tileScore,
        occupied: tileScore > occupancyThreshold,
      });
    }
  }

  return { cells, size };
}

/**
 * Berekent het aandeel pixels dat op een Scrabble-steen lijkt: bleek en warm.
 *
 * Criterium (in HSV-termen):
 *  - hoge helderheid  (value  > ~0.55)
 *  - lage verzadiging (sat    < ~0.35)
 *  - niet blauw-dominant (stenen zijn crème/hout, geen wit-blauwe reflectie)
 *
 * Dit sluit de sterk verzadigde bordkleuren (teal, rood, marineblauw, geel,
 * groen) uit en houdt alleen de bleke stenen over.
 */
function computeTileScore(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): number {
  const { data } = ctx.getImageData(x, y, w, h);
  const n = w * h;
  if (n === 0) return 0;

  let tileLike = 0;
  for (let i = 0; i < n; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const value = max / 255;
    const sat = max === 0 ? 0 : (max - min) / max;

    // Bleek + warm: helder, weinig verzadigd, en blauw niet dominant.
    if (value > 0.55 && sat < 0.35 && b <= max) {
      tileLike++;
    }
  }
  return tileLike / n;
}
