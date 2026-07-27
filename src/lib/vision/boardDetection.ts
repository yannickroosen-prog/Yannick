// Borddetectie + perspectiefcorrectie met OpenCV.js.
//
// Doel: het grootste vierhoekige contour (het Scrabble-bord) vinden in het
// camerabeeld en dit rechttrekken naar een vierkant beeld van `size`x`size`.

import { loadOpenCV, isOpenCVReady } from './opencv';

export interface Corner {
  x: number;
  y: number;
}

export interface BoardDetectionResult {
  /** Warped, vierkant beeld van het bord. */
  canvas: HTMLCanvasElement;
  /** De vier hoekpunten in het bronbeeld (voor de overlay). */
  corners: Corner[];
  /** True wanneer het bord automatisch gedetecteerd is (i.p.v. fallback-kader). */
  autoDetected: boolean;
}

export interface DetectOptions {
  /** Hoeken van het uitlijnkader (fallback als autodetectie faalt). */
  fallbackCorners?: Corner[];
  /**
   * Als opgegeven: gebruik deze hoeken direct (door de gebruiker uitgelijnd) en
   * sla automatische detectie over. Dit is de betrouwbaarste weg.
   */
  forceCorners?: Corner[];
}

/**
 * Detecteert het bord en trekt het recht.
 * Met `forceCorners` worden de handmatig uitgelijnde hoeken direct gebruikt.
 * Anders wordt automatische detectie geprobeerd met terugval op `fallbackCorners`.
 */
export async function detectAndWarpBoard(
  source: HTMLCanvasElement | HTMLVideoElement,
  size = 900,
  options: DetectOptions = {}
): Promise<BoardDetectionResult> {
  const { fallbackCorners, forceCorners } = options;
  const srcCanvas = toCanvas(source);

  let corners: Corner[] | null = null;
  let autoDetected = false;

  if (forceCorners && forceCorners.length === 4) {
    corners = orderCorners(forceCorners);
    // Zorg dat OpenCV geladen is voor de perspectiefwarp.
    try {
      if (!isOpenCVReady()) await loadOpenCV();
    } catch {
      /* val terug op benadering in warpToSquare */
    }
  } else {
    try {
      if (!isOpenCVReady()) await loadOpenCV();
      corners = findBoardCorners(srcCanvas);
      autoDetected = !!corners;
    } catch {
      corners = null;
    }

    if (!corners) {
      corners =
        fallbackCorners ??
        [
          { x: 0, y: 0 },
          { x: srcCanvas.width, y: 0 },
          { x: srcCanvas.width, y: srcCanvas.height },
          { x: 0, y: srcCanvas.height },
        ];
    }
  }

  const canvas = warpToSquare(srcCanvas, corners, size);
  return { canvas, corners, autoDetected };
}

function toCanvas(source: HTMLCanvasElement | HTMLVideoElement): HTMLCanvasElement {
  if (source instanceof HTMLCanvasElement) return source;
  const canvas = document.createElement('canvas');
  canvas.width = source.videoWidth || source.clientWidth;
  canvas.height = source.videoHeight || source.clientHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * Zoekt de vier hoeken van het grootste vierhoekige contour in het beeld.
 * Retourneert null als er niets bruikbaars gevonden wordt.
 */
function findBoardCorners(canvas: HTMLCanvasElement): Corner[] | null {
  const cv = window.cv;
  const src = cv.imread(canvas);
  const gray = new cv.Mat();
  const blur = new cv.Mat();
  const edges = new cv.Mat();
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  try {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0);
    cv.Canny(blur, edges, 50, 150);
    // Sluit gaten in randen.
    const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
    cv.dilate(edges, edges, kernel);
    kernel.delete();

    cv.findContours(
      edges,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    const imgArea = canvas.width * canvas.height;
    let best: Corner[] | null = null;
    let bestArea = 0;

    for (let i = 0; i < contours.size(); i++) {
      const cnt = contours.get(i);
      const peri = cv.arcLength(cnt, true);
      const approx = new cv.Mat();
      cv.approxPolyDP(cnt, approx, 0.02 * peri, true);

      if (approx.rows === 4) {
        const area = Math.abs(cv.contourArea(approx));
        // Het bord vult een substantieel deel van het beeld.
        if (area > bestArea && area > imgArea * 0.2) {
          const pts: Corner[] = [];
          for (let j = 0; j < 4; j++) {
            pts.push({ x: approx.data32S[j * 2], y: approx.data32S[j * 2 + 1] });
          }
          best = orderCorners(pts);
          bestArea = area;
        }
      }
      approx.delete();
      cnt.delete();
    }

    return best;
  } finally {
    src.delete();
    gray.delete();
    blur.delete();
    edges.delete();
    contours.delete();
    hierarchy.delete();
  }
}

/** Ordent 4 punten als [linksboven, rechtsboven, rechtsonder, linksonder]. */
export function orderCorners(pts: Corner[]): Corner[] {
  const sum = pts.map((p) => p.x + p.y);
  const diff = pts.map((p) => p.x - p.y);
  const tl = pts[sum.indexOf(Math.min(...sum))];
  const br = pts[sum.indexOf(Math.max(...sum))];
  const tr = pts[diff.indexOf(Math.max(...diff))];
  const bl = pts[diff.indexOf(Math.min(...diff))];
  return [tl, tr, br, bl];
}

/** Perspectieftransformatie naar een vierkant canvas. */
export function warpToSquare(
  canvas: HTMLCanvasElement,
  corners: Corner[],
  size: number
): HTMLCanvasElement {
  const out = document.createElement('canvas');
  out.width = size;
  out.height = size;

  // Zonder OpenCV: eenvoudige bilineaire benadering via drawImage niet mogelijk
  // voor perspectief; gebruik OpenCV als beschikbaar.
  if (isOpenCVReady()) {
    const cv = window.cv;
    const src = cv.imread(canvas);
    const dst = new cv.Mat();
    const [tl, tr, br, bl] = corners;
    const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
      tl.x, tl.y, tr.x, tr.y, br.x, br.y, bl.x, bl.y,
    ]);
    const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
      0, 0, size, 0, size, size, 0, size,
    ]);
    const M = cv.getPerspectiveTransform(srcTri, dstTri);
    cv.warpPerspective(src, dst, M, new cv.Size(size, size));
    cv.imshow(out, dst);
    src.delete();
    dst.delete();
    srcTri.delete();
    dstTri.delete();
    M.delete();
    return out;
  }

  // Fallback: het beeld is (nagenoeg) recht — schaal simpelweg de bounding box.
  const ctx = out.getContext('2d')!;
  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const w = Math.max(...xs) - minX;
  const h = Math.max(...ys) - minY;
  ctx.drawImage(canvas, minX, minY, w, h, 0, 0, size, size);
  return out;
}
