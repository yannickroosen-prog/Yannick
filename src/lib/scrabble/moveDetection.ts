import type { Board, Move, PlacedTile, Position } from './types';
import { diffNewTiles } from './board';
import { scoreMove, type ScoringConfig } from './scoring';
import { validateWord } from './dictionary';

export interface DetectMoveResult {
  move: Omit<Move, 'id' | 'playerId' | 'playedAt'> | null;
  /** Nieuw geplaatste posities (ook wanneer er geen geldige zet is). */
  newTiles: Position[];
  /** Waarschuwingen voor de gebruiker (bv. losse stenen). */
  warnings: string[];
}

/**
 * Vergelijkt de vorige en huidige scan en leidt de gespeelde zet af.
 *
 * - Bepaalt welke stenen nieuw zijn.
 * - Controleert dat de nieuwe stenen op één lijn liggen en aaneengesloten zijn.
 * - Berekent de score en valideert de gevormde woorden.
 */
export function detectMove(
  previous: Board,
  current: Board,
  cfg: ScoringConfig
): DetectMoveResult {
  const newTiles = diffNewTiles(previous, current);
  const warnings: string[] = [];

  if (newTiles.length === 0) {
    return { move: null, newTiles, warnings };
  }

  const rows = new Set(newTiles.map((t) => t.row));
  const cols = new Set(newTiles.map((t) => t.col));
  const sameRow = rows.size === 1;
  const sameCol = cols.size === 1;

  if (!sameRow && !sameCol) {
    warnings.push('De nieuwe stenen liggen niet op één rij of kolom.');
  } else {
    // Controleer aaneengesloten zijn (gaten mogen alleen door bestaande stenen).
    const gapWarning = checkContiguous(current, newTiles, sameRow);
    if (gapWarning) warnings.push(gapWarning);
  }

  const placed: PlacedTile[] = newTiles.map((t) => ({
    ...t,
    letter: current[t.row][t.col].letter as string,
    blank: !!current[t.row][t.col].blank,
  }));

  const result = scoreMove(cfg, current, newTiles);

  // Woordvalidatie (indien woordenboek geladen).
  const words = result.words.map((w) => ({
    ...w,
    valid: validateWord(w.word),
  }));

  const invalid = words.filter((w) => w.valid === false);
  if (invalid.length > 0) {
    warnings.push(
      `Onbekend woord: ${invalid.map((w) => w.word).join(', ')}`
    );
  }

  return {
    move: {
      tiles: placed,
      words,
      score: result.score,
      bingo: result.bingo,
    },
    newTiles,
    warnings,
  };
}

/**
 * Controleert dat de nieuwe stenen een aaneengesloten lijn vormen: tussen de
 * uiterste nieuwe stenen mogen alleen gevulde vakjes zitten.
 */
function checkContiguous(
  board: Board,
  newTiles: Position[],
  horizontal: boolean
): string | null {
  const sorted = [...newTiles].sort((a, b) =>
    horizontal ? a.col - b.col : a.row - b.row
  );
  const fixed = horizontal ? sorted[0].row : sorted[0].col;
  const start = horizontal ? sorted[0].col : sorted[0].row;
  const end = horizontal
    ? sorted[sorted.length - 1].col
    : sorted[sorted.length - 1].row;

  for (let i = start; i <= end; i++) {
    const r = horizontal ? fixed : i;
    const c = horizontal ? i : fixed;
    if (!board[r][c].letter) {
      return 'Er zit een gat tussen de nieuw gelegde stenen.';
    }
  }
  return null;
}
