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

/** Voorbewerking: grijswaarden + contrast + drempel voor scherpere OCR. */
function preprocess(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement('canvas');
  const scale = Math.max(1, Math.round(64 / canvas.width));
  out.width = canvas.width * scale;
  out.height = canvas.height * scale;
  const ctx = out.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, 0, 0, out.width, out.height);

  const img = ctx.getImageData(0, 0, out.width, out.height);
  const d = img.data;
  // Gemiddelde luminantie → binariseren (donkere letter op lichte steen).
  let sum = 0;
  const n = out.width * out.height;
  for (let i = 0; i < n; i++) {
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] =
      0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
    sum += d[i * 4];
  }
  const mean = sum / n;
  for (let i = 0; i < n; i++) {
    const v = d[i * 4] < mean * 0.7 ? 0 : 255;
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return out;
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
