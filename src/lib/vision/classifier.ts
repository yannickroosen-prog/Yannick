// Browser-inferentie met het getrainde CNN-lettermodel (TensorFlow.js).
//
// Het model is offline getraind op synthetische steenbeelden (zie /training) en
// wordt als statische assets uit /public/models/letters geladen. Alles draait
// client-side, dus het werkt ook offline (PWA).

import type { OcrResult } from './ocr';

const MODEL_URL = '/models/letters/model.json';
const IMG = 32;

let tfRef: typeof import('@tensorflow/tfjs') | null = null;
let modelPromise: Promise<any> | null = null;
const EMPTY = '∅';
// Onder deze zekerheid wordt een letter afgewezen (behandeld als geen steen).
// Echte stenen scoren doorgaans >0,95; dit filtert twijfelachtige textuur weg.
const ACCEPT_MIN = 0.85;
let labels: string[] = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), EMPTY];

/** Laadt TensorFlow.js + het model (idempotent). Gooit als het model ontbreekt. */
export async function loadModel(): Promise<any> {
  if (modelPromise) return modelPromise;
  modelPromise = (async () => {
    const tf = await import('@tensorflow/tfjs');
    tfRef = tf;
    // Labels laden (index → letter); val stil terug op A-Z.
    try {
      const res = await fetch('/models/letters/labels.json');
      if (res.ok) labels = await res.json();
    } catch {
      /* standaard A-Z */
    }
    const model = await tf.loadLayersModel(MODEL_URL);
    return model;
  })();
  return modelPromise;
}

/** Is het model beschikbaar (geprobeerd te laden en gelukt)? */
export async function isModelAvailable(): Promise<boolean> {
  try {
    await loadModel();
    return true;
  } catch {
    modelPromise = null;
    return false;
  }
}

/**
 * Zet een celbeeld om naar de modelinvoer: 32x32 grijswaarden, genormaliseerd
 * naar [0,1] — dezelfde representatie als tijdens de training.
 */
function toInput(tf: typeof import('@tensorflow/tfjs'), canvas: HTMLCanvasElement) {
  const tmp = document.createElement('canvas');
  tmp.width = IMG;
  tmp.height = IMG;
  const ctx = tmp.getContext('2d')!;
  ctx.drawImage(canvas, 0, 0, IMG, IMG);
  const { data } = ctx.getImageData(0, 0, IMG, IMG);
  const gray = new Float32Array(IMG * IMG);
  for (let i = 0; i < IMG * IMG; i++) {
    gray[i] =
      (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;
  }
  return tf.tensor4d(gray, [1, IMG, IMG, 1]);
}

/** Herkent een enkele letter met het CNN. */
export async function recognizeLetterModel(
  canvas: HTMLCanvasElement
): Promise<OcrResult> {
  const model = await loadModel();
  const tf = tfRef!;
  const input = toInput(tf, canvas);
  const logits = model.predict(input) as import('@tensorflow/tfjs').Tensor;
  const probs = (await logits.data()) as Float32Array;
  input.dispose();
  logits.dispose();

  let best = 0;
  for (let i = 1; i < probs.length; i++) if (probs[i] > probs[best]) best = i;

  const label = labels[best];
  const confidence = probs[best] ?? 0;
  // '∅' = geen steen, of te lage zekerheid → geen letter teruggeven. Zo worden
  // bonusvakken, achtergrond en twijfelachtige textuur afgewezen i.p.v. als
  // willekeurige letter gelezen.
  if (!label || label === EMPTY || confidence < ACCEPT_MIN) {
    return { letter: null, confidence };
  }
  return { letter: label, confidence };
}
