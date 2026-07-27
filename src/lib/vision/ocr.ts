// OCR van individuele Scrabble-letters met Tesseract.js.
//
// We houden één worker in leven (opstarten is duur) en herkennen per cel een
// enkel teken. De letterset is beperkt tot A-Z (Scrabble kent geen accenten;
// blanco stenen worden apart afgehandeld).

import { createWorker, PSM, type Worker } from 'tesseract.js';

let workerPromise: Promise<Worker> | null = null;

const WHITELIST = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

async function getWorker(): Promise<Worker> {
  if (workerPromise) return workerPromise;
  workerPromise = (async () => {
    const worker = await createWorker('eng');
    await worker.setParameters({
      tessedit_char_whitelist: WHITELIST,
      tessedit_pageseg_mode: PSM.SINGLE_CHAR,
    });
    return worker;
  })();
  return workerPromise;
}

export interface OcrResult {
  letter: string | null;
  /** 0-1 */
  confidence: number;
}

/**
 * Voorbewerking voor scherpere OCR:
 *  1. Centrale uitsnede (~72%) — verwijdert de puntwaarde in de hoek en de
 *     steenranden, zodat alleen de grote letter overblijft.
 *  2. Grijswaarden + Otsu-drempel (automatische scheiding letter/achtergrond).
 *  3. Uitsnijden op de letter (bounding box) + witte marge.
 *  4. Opschalen naar een vaste hoogte voor Tesseract.
 */
function preprocess(src: HTMLCanvasElement): HTMLCanvasElement {
  // 1. Centrale uitsnede.
  const cropFrac = 0.72;
  const cw = Math.max(1, Math.round(src.width * cropFrac));
  const ch = Math.max(1, Math.round(src.height * cropFrac));
  const cx = Math.round((src.width - cw) / 2);
  const cy = Math.round((src.height - ch) / 2);

  const work = document.createElement('canvas');
  work.width = cw;
  work.height = ch;
  const wctx = work.getContext('2d', { willReadFrequently: true })!;
  wctx.drawImage(src, cx, cy, cw, ch, 0, 0, cw, ch);

  const img = wctx.getImageData(0, 0, cw, ch);
  const d = img.data;
  const n = cw * ch;

  // 2. Grijswaarden + histogram voor Otsu.
  const gray = new Uint8Array(n);
  const hist = new Array(256).fill(0);
  for (let i = 0; i < n; i++) {
    const v = Math.round(
      0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]
    );
    gray[i] = v;
    hist[v]++;
  }
  const threshold = otsu(hist, n);

  // 3. Binariseren + bounding box van de donkere pixels (de letter).
  let minX = cw,
    minY = ch,
    maxX = 0,
    maxY = 0,
    dark = 0;
  const bin = new Uint8Array(n); // 1 = letter (donker)
  for (let i = 0; i < n; i++) {
    const isDark = gray[i] < threshold;
    bin[i] = isDark ? 1 : 0;
    if (isDark) {
      dark++;
      const x = i % cw;
      const y = (i / cw) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  // Geen zinnige letter gevonden → geef een leeg wit beeld terug.
  if (dark < n * 0.01 || maxX <= minX || maxY <= minY) {
    const empty = document.createElement('canvas');
    empty.width = empty.height = 32;
    const ectx = empty.getContext('2d')!;
    ectx.fillStyle = '#fff';
    ectx.fillRect(0, 0, 32, 32);
    return empty;
  }

  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;

  // 4. Uitsnede met marge, opgeschaald naar vaste hoogte + witte rand.
  const targetH = 80;
  const scale = targetH / bh;
  const outW = Math.round(bw * scale);
  const pad = Math.round(targetH * 0.25);

  const out = document.createElement('canvas');
  out.width = outW + pad * 2;
  out.height = targetH + pad * 2;
  const octx = out.getContext('2d')!;
  octx.fillStyle = '#fff';
  octx.fillRect(0, 0, out.width, out.height);

  // Teken de gebinariseerde letter (zwart op wit).
  const glyph = wctx.createImageData(bw, bh);
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      const srcIdx = (minY + y) * cw + (minX + x);
      const v = bin[srcIdx] ? 0 : 255;
      const di = (y * bw + x) * 4;
      glyph.data[di] = glyph.data[di + 1] = glyph.data[di + 2] = v;
      glyph.data[di + 3] = 255;
    }
  }
  const glyphCanvas = document.createElement('canvas');
  glyphCanvas.width = bw;
  glyphCanvas.height = bh;
  glyphCanvas.getContext('2d')!.putImageData(glyph, 0, 0);

  octx.imageSmoothingEnabled = true;
  octx.drawImage(glyphCanvas, 0, 0, bw, bh, pad, pad, outW, targetH);
  return out;
}

/** Otsu's methode: bepaalt de optimale drempel uit het grijshistogram. */
function otsu(hist: number[], total: number): number {
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * hist[t];
  let sumB = 0;
  let wB = 0;
  let maxVar = 0;
  let threshold = 128;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > maxVar) {
      maxVar = between;
      threshold = t;
    }
  }
  return threshold;
}

/** Herkent een enkele letter in een celbeeld. */
export async function recognizeLetter(canvas: HTMLCanvasElement): Promise<OcrResult> {
  const worker = await getWorker();
  const pre = preprocess(canvas);
  const { data } = await worker.recognize(pre);
  const text = (data.text || '').replace(/[^A-Z]/gi, '').toUpperCase();
  const letter = text.length > 0 ? text[0] : null;
  const confidence = letter ? Math.min(1, (data.confidence ?? 0) / 100) : 0;
  return { letter, confidence };
}

/** Sluit de worker af (bv. bij unmount) om geheugen vrij te geven. */
export async function terminateOcr(): Promise<void> {
  if (workerPromise) {
    const worker = await workerPromise;
    await worker.terminate();
    workerPromise = null;
  }
}
