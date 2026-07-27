// Volledige visie-pipeline: camerabeeld -> bord -> raster -> OCR -> Board.

import type { Board } from '../scrabble/types';
import { createEmptyBoard } from '../scrabble/board';
import { detectAndWarpBoard, type Corner } from './boardDetection';
import { extractGrid } from './gridExtraction';
import { recognizeLetter } from './ocr';
import { recognizeLetterModel, isModelAvailable } from './classifier';

/** Welke letterherkenner gebruikt wordt. */
export type Recognizer = 'model' | 'ocr';

export interface ScanOptions {
  /** Betrouwbaarheidsdrempel waaronder een detectie "onzeker" is. */
  uncertaintyThreshold?: number;
  /** Hoeken van het uitlijnkader (fallback als autodetectie faalt). */
  fallbackCorners?: Corner[];
  /** Handmatig uitgelijnde hoeken; slaat automatische detectie over. */
  forceCorners?: Corner[];
  /** Voorkeursherkenner (standaard 'model', met terugval op OCR). */
  recognizer?: Recognizer;
  /** Voortgangscallback (0-1). */
  onProgress?: (fraction: number, label: string) => void;
}

export interface ScanResult {
  board: Board;
  /** Rechtgetrokken bordbeeld (voor de overlay/preview). */
  warped: HTMLCanvasElement;
  corners: Corner[];
  autoDetected: boolean;
  /** Aantal cellen dat als bezet werd gedetecteerd. */
  occupiedCount: number;
}

/**
 * Voert een volledige scan uit. Alleen bezette cellen worden door de (trage)
 * OCR gehaald; lege cellen blijven leeg. Onzekere detecties worden gemarkeerd.
 */
export async function scanBoard(
  source: HTMLCanvasElement | HTMLVideoElement,
  options: ScanOptions = {}
): Promise<ScanResult> {
  const {
    uncertaintyThreshold = 0.55,
    fallbackCorners,
    forceCorners,
    recognizer = 'model',
    onProgress,
  } = options;

  onProgress?.(0.05, 'Bord rechttrekken…');
  const detection = await detectAndWarpBoard(source, 900, {
    fallbackCorners,
    forceCorners,
  });

  onProgress?.(0.2, 'Raster opdelen…');
  const { cells } = extractGrid(detection.canvas);
  // Kies de herkenner: model indien gewenst én beschikbaar, anders OCR.
  const useModel = recognizer === 'model' && (await isModelAvailable());

  // Het model wijst zelf niet-stenen af (∅-klasse), dus dan bekijken we ELKE
  // cel. OCR is traag en kan niet afwijzen, dus daar gebruiken we de
  // kleur-voorfilter en lezen alleen bezette cellen.
  const targets = useModel ? cells : cells.filter((c) => c.occupied);
  const recognize = useModel ? recognizeLetterModel : recognizeLetter;

  const board: Board = createEmptyBoard();
  let done = 0;
  let found = 0;

  for (const cell of targets) {
    const { letter, confidence } = await recognize(cell.canvas);
    if (letter) {
      board[cell.row][cell.col] = {
        letter,
        confidence,
        uncertain: confidence < uncertaintyThreshold,
      };
      found++;
    }
    done++;
    onProgress?.(0.2 + 0.75 * (done / Math.max(1, targets.length)), 'Letters lezen…');
  }

  onProgress?.(1, 'Klaar');

  return {
    board,
    warped: detection.canvas,
    corners: detection.corners,
    autoDetected: detection.autoDetected,
    occupiedCount: found,
  };
}
