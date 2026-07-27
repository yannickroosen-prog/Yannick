// Homografie + perspectiefwarp in puur JS (geen OpenCV nodig), voor het
// rechttrekken van een echte bordfoto en het uitsnijden van de 15x15 cellen.

import { createCanvas, loadImage } from '@napi-rs/canvas';

/** Los een 8-parameter homografie op: (u,v) -> (x,y), 4 correspondenties. */
export function solveHomography(dst, src) {
  // dst = square (u,v), src = photo (x,y). We willen H zodat src = H*dst.
  const A = [];
  const b = [];
  for (let i = 0; i < 4; i++) {
    const [u, v] = dst[i];
    const [x, y] = src[i];
    A.push([u, v, 1, 0, 0, 0, -x * u, -x * v]);
    b.push(x);
    A.push([0, 0, 0, u, v, 1, -y * u, -y * v]);
    b.push(y);
  }
  const h = gauss(A, b); // [h11,h12,h13,h21,h22,h23,h31,h32]
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

function gauss(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++)
      if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    [M[col], M[piv]] = [M[piv], M[col]];
    const d = M[col][col];
    for (let j = col; j <= n; j++) M[col][j] /= d;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col];
      for (let j = col; j <= n; j++) M[r][j] -= f * M[col][j];
    }
  }
  return M.map((row) => row[n]);
}

function apply(H, u, v) {
  const x = H[0] * u + H[1] * v + H[2];
  const y = H[3] * u + H[4] * v + H[5];
  const w = H[6] * u + H[7] * v + H[8];
  return [x / w, y / w];
}

/**
 * Trekt de bordfoto recht naar een `size`x`size` canvas via inverse sampling.
 * `corners` = [TL, TR, BR, BL] in fotopixels.
 */
export async function warpBoard(imagePath, corners, size = 480) {
  const img = await loadImage(imagePath);
  const srcCanvas = createCanvas(img.width, img.height);
  srcCanvas.getContext('2d').drawImage(img, 0, 0);
  const srcData = srcCanvas.getContext('2d').getImageData(0, 0, img.width, img.height).data;

  const dstCorners = [
    [0, 0],
    [size, 0],
    [size, size],
    [0, size],
  ];
  const H = solveHomography(dstCorners, corners);

  const out = createCanvas(size, size);
  const octx = out.getContext('2d');
  const outImg = octx.createImageData(size, size);

  for (let vy = 0; vy < size; vy++) {
    for (let vx = 0; vx < size; vx++) {
      const [sx, sy] = apply(H, vx, vy);
      const ix = Math.round(sx);
      const iy = Math.round(sy);
      const di = (vy * size + vx) * 4;
      if (ix >= 0 && ix < img.width && iy >= 0 && iy < img.height) {
        const si = (iy * img.width + ix) * 4;
        outImg.data[di] = srcData[si];
        outImg.data[di + 1] = srcData[si + 1];
        outImg.data[di + 2] = srcData[si + 2];
        outImg.data[di + 3] = 255;
      } else {
        outImg.data[di + 3] = 255;
      }
    }
  }
  octx.putImageData(outImg, 0, 0);
  return out;
}

/** Tekent een 15x15 raster over het warped canvas (voor visuele controle). */
export function drawGridOverlay(canvas) {
  const size = canvas.width;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = 'rgba(255,0,0,0.7)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 15; i++) {
    const p = (i / 15) * size;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }
  return canvas;
}

/**
 * Snijdt de 15x15 cellen uit een echte bordfoto en geeft grijswaarde-cellen
 * (Float32Array van 32x32, genormaliseerd) terug. Cellen binnen `exclude`
 * (rijen/kolommen rond gelegde stenen) worden overgeslagen, zodat de reeks
 * uitsluitend NIET-steen-voorbeelden bevat.
 */
export async function extractRealCells(imagePath, corners, exclude, IMG = 32) {
  const size = IMG * 15;
  const warped = await warpBoard(imagePath, corners, size);
  const ctx = warped.getContext('2d');
  const cells = [];
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (
        exclude &&
        r >= exclude.r0 && r <= exclude.r1 &&
        c >= exclude.c0 && c <= exclude.c1
      ) continue;
      const { data } = ctx.getImageData(c * IMG, r * IMG, IMG, IMG);
      const g = new Float32Array(IMG * IMG);
      for (let i = 0; i < IMG * IMG; i++) {
        g[i] = (0.299 * data[i*4] + 0.587 * data[i*4+1] + 0.114 * data[i*4+2]) / 255;
      }
      cells.push(g);
    }
  }
  return cells;
}
