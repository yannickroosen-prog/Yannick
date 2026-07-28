// Snijdt gelabelde steen-crops uit (op basis van detect_tiles-coördinaten) en
// maakt een VERIFICATIE-montage met de labels erop, zodat we kunnen controleren
// dat elk label bij de juiste crop hoort vóór we ermee trainen. Slaat de
// 32x32 grijswaarde-samples op voor de training.

import { loadImage, createCanvas } from '@napi-rs/canvas';
import { readFileSync, writeFileSync } from 'node:fs';

const COORDS = JSON.parse(readFileSync(process.env.COORDS));
const LABELS = JSON.parse(readFileSync(process.env.LABELS)); // { "0":"O", ... }
const OUT = process.env.OUT;
const OUT_MONTAGE = process.env.OUT_MONTAGE;
const IMG = 32;

const img = await loadImage(COORDS.in);
const cv = createCanvas(COORDS.W, COORDS.H);
cv.getContext('2d').drawImage(img, 0, 0, COORDS.W, COORDS.H);

const entries = Object.entries(LABELS);
const samples = [];
const COLS = 10,
  CELL = 60,
  ROWS = Math.ceil(entries.length / COLS);
const M = createCanvas(COLS * CELL, ROWS * CELL);
const mc = M.getContext('2d');
mc.fillStyle = '#222';
mc.fillRect(0, 0, M.width, M.height);

entries.forEach(([idxStr, label], k) => {
  const cr = COORDS.crops[Number(idxStr)];
  const cell = createCanvas(IMG, IMG);
  const cc = cell.getContext('2d');
  cc.drawImage(cv, cr.x, cr.y, cr.side, cr.side, 0, 0, IMG, IMG);
  const { data } = cc.getImageData(0, 0, IMG, IMG);
  const g = new Array(IMG * IMG);
  for (let i = 0; i < IMG * IMG; i++) {
    g[i] = (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;
  }
  samples.push({ label, g });

  const ox = (k % COLS) * CELL + 2,
    oy = ((k / COLS) | 0) * CELL + 2;
  mc.drawImage(cell, ox, oy, 48, 48);
  mc.fillStyle = '#0f0';
  mc.font = 'bold 14px sans';
  mc.fillText(label, ox + 50 - 14, oy + 46);
});

writeFileSync(OUT, JSON.stringify(samples));
writeFileSync(OUT_MONTAGE, M.toBuffer('image/png'));
console.log(`samples: ${samples.length}`);
