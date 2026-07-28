// Detecteert losse Scrabble-stenen op een foto via de donkerste pixels (de
// zwarte letters). Elke voldoende grote donkere blob = een letter; we snijden
// een vierkant rond de blob uit (de steen) en maken een genummerde montage om
// handmatig te labelen. Coördinaten worden opgeslagen voor de extractie erna.

import { loadImage, createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';

const IN = process.env.IN;
const OUT_MONTAGE = process.env.OUT_MONTAGE;
const OUT_COORDS = process.env.OUT_COORDS;
const MAXW = 1500;
const DARK = Number(process.env.DARK || 80);
const TOP = Number(process.env.TOP || 60);

const img = await loadImage(IN);
const scale = Math.min(1, MAXW / img.width);
const W = Math.round(img.width * scale);
const H = Math.round(img.height * scale);
const cv = createCanvas(W, H);
const ctx = cv.getContext('2d');
ctx.drawImage(img, 0, 0, W, H);
const data = ctx.getImageData(0, 0, W, H).data;

// Donkermasker.
const mask = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) {
  const g = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  mask[i] = g < DARK ? 1 : 0;
}

// Connected components (flood fill, 8-connectiviteit).
const label = new Int32Array(W * H).fill(0);
const comps = [];
let cur = 0;
const stack = [];
for (let s = 0; s < W * H; s++) {
  if (!mask[s] || label[s]) continue;
  cur++;
  stack.length = 0;
  stack.push(s);
  label[s] = cur;
  let minX = W, minY = H, maxX = 0, maxY = 0, area = 0, sx = 0, sy = 0;
  while (stack.length) {
    const p = stack.pop();
    const x = p % W;
    const y = (p / W) | 0;
    area++; sx += x; sy += y;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const np = ny * W + nx;
      if (mask[np] && !label[np]) { label[np] = cur; stack.push(np); }
    }
  }
  const bw = maxX - minX + 1, bh = maxY - minY + 1;
  comps.push({ minX, minY, maxX, maxY, bw, bh, area, cx: sx / area, cy: sy / area });
}

// Filter op lettergrootte: niet te klein (ruis/puntcijfers), niet te groot
// (samengevloeide blobs), redelijke verhouding.
const minSide = H * 0.02;
const maxSide = H * 0.12;
const kept = comps.filter((c) => {
  const big = Math.max(c.bw, c.bh);
  const small = Math.min(c.bw, c.bh);
  return big > minSide && big < maxSide && small > minSide * 0.5 && c.area > big * small * 0.12;
});
kept.sort((a, b) => b.area - a.area);
const top = kept.slice(0, TOP);

// Crop-vierkant rond elke blob (ruim, om de hele steen te vatten).
const crops = top.map((c) => {
  const side = Math.max(c.bw, c.bh) * 2.1;
  return {
    x: Math.round(c.cx - side / 2),
    y: Math.round(c.cy - side / 2),
    side: Math.round(side),
  };
});

// Montage (10 kolommen) met indexnummers.
const CELL = 72, COLS = 10, ROWS = Math.ceil(crops.length / COLS);
const M = createCanvas(COLS * CELL, ROWS * CELL);
const mc = M.getContext('2d');
mc.fillStyle = '#222'; mc.fillRect(0, 0, M.width, M.height);
crops.forEach((cr, i) => {
  const cell = createCanvas(64, 64);
  cell.getContext('2d').drawImage(cv, cr.x, cr.y, cr.side, cr.side, 0, 0, 64, 64);
  const ox = (i % COLS) * CELL + 3, oy = ((i / COLS) | 0) * CELL + 3;
  mc.drawImage(cell, ox, oy);
  mc.fillStyle = '#0f0'; mc.font = 'bold 12px sans';
  mc.fillText(String(i), ox + 1, oy + 62);
});
writeFileSync(OUT_MONTAGE, M.toBuffer('image/png'));
writeFileSync(OUT_COORDS, JSON.stringify({ in: IN, scale, W, H, crops }));
console.log(`components: ${comps.length}, kept: ${kept.length}, montage: ${crops.length}`);
