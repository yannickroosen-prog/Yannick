import type {
  Board,
  BonusType,
  LetterValues,
  Position,
  ScoredWord,
} from './types';
import { BOARD_SIZE, BINGO_BONUS, RACK_SIZE } from './config';

export interface ScoringConfig {
  letterValues: LetterValues;
  bonusBoard: BonusType[][];
}

function letterValue(cfg: ScoringConfig, board: Board, r: number, c: number): number {
  const cell = board[r][c];
  if (!cell.letter) return 0;
  if (cell.blank) return 0; // blanco steen = 0 punten
  return cfg.letterValues[cell.letter] ?? 0;
}

/** Woordbonus-multiplier van een vak (alleen relevant voor nieuwe stenen). */
function wordMultiplier(bonus: BonusType): number {
  if (bonus === 'DW' || bonus === 'STAR') return 2;
  if (bonus === 'TW') return 3;
  return 1;
}

/** Letterbonus-multiplier van een vak. */
function letterMultiplier(bonus: BonusType): number {
  if (bonus === 'DL') return 2;
  if (bonus === 'TL') return 3;
  return 1;
}

/**
 * Verzamelt het aaneengesloten woord dat door (row,col) loopt in de
 * gegeven richting. Retourneert null als het "woord" maar 1 letter lang is.
 */
function collectWord(
  board: Board,
  start: Position,
  dr: number,
  dc: number
): Position[] | null {
  // Ga terug naar het begin van het woord.
  let r = start.row;
  let c = start.col;
  while (
    r - dr >= 0 &&
    r - dr < BOARD_SIZE &&
    c - dc >= 0 &&
    c - dc < BOARD_SIZE &&
    board[r - dr][c - dc].letter
  ) {
    r -= dr;
    c -= dc;
  }

  // Loop vooruit tot het einde en verzamel de posities.
  const positions: Position[] = [];
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c].letter) {
    positions.push({ row: r, col: c });
    r += dr;
    c += dc;
  }

  return positions.length >= 2 ? positions : null;
}

/**
 * Scoort één woord (reeks posities). Bonusvakken tellen alleen mee voor
 * posities die deel uitmaken van `newSet` (de nieuw geplaatste stenen).
 */
function scoreWord(
  cfg: ScoringConfig,
  board: Board,
  positions: Position[],
  newSet: Set<string>
): ScoredWord {
  let raw = 0;
  let wordMult = 1;
  let word = '';
  const breakdown: ScoredWord['breakdown'] = [];

  for (const pos of positions) {
    const cell = board[pos.row][pos.col];
    const base = letterValue(cfg, board, pos.row, pos.col);
    const isNew = newSet.has(key(pos));
    const bonus: BonusType = isNew ? cfg.bonusBoard[pos.row][pos.col] : 'none';

    const effective = base * letterMultiplier(bonus);
    raw += effective;
    wordMult *= wordMultiplier(bonus);
    word += cell.letter ?? '';

    breakdown.push({ letter: cell.letter ?? '', base, bonus, effective });
  }

  return {
    word,
    positions,
    score: raw * wordMult,
    breakdown,
  };
}

function key(p: Position): string {
  return `${p.row},${p.col}`;
}

export interface MoveScore {
  words: ScoredWord[];
  score: number;
  bingo: boolean;
}

/**
 * Berekent de score van een zet gegeven het (nieuwe) bord en de posities
 * van de nieuw geplaatste stenen.
 *
 * Verzamelt het hoofdwoord + alle dwarswoorden en telt elk woord één keer.
 */
export function scoreMove(
  cfg: ScoringConfig,
  board: Board,
  newTiles: Position[]
): MoveScore {
  const newSet = new Set(newTiles.map(key));
  if (newTiles.length === 0) {
    return { words: [], score: 0, bingo: false };
  }

  // Bepaal de oriëntatie van de zet.
  const rows = new Set(newTiles.map((t) => t.row));
  const cols = new Set(newTiles.map((t) => t.col));
  const isHorizontal = rows.size === 1;
  const isVertical = cols.size === 1;

  const wordsByKey = new Map<string, ScoredWord>();

  const addWord = (positions: Position[] | null) => {
    if (!positions) return;
    const wordKey = positions.map(key).join('|');
    if (wordsByKey.has(wordKey)) return;
    const scored = scoreWord(cfg, board, positions, newSet);
    wordsByKey.set(wordKey, scored);
  };

  // Hoofdwoord(en): langs de as van de zet.
  if (isHorizontal) {
    addWord(collectWord(board, newTiles[0], 0, 1));
  }
  if (isVertical) {
    addWord(collectWord(board, newTiles[0], 1, 0));
  }
  // Enkele steen: probeer beide richtingen als hoofdwoord.
  if (!isHorizontal && !isVertical) {
    addWord(collectWord(board, newTiles[0], 0, 1));
    addWord(collectWord(board, newTiles[0], 1, 0));
  }

  // Dwarswoorden: voor elke nieuwe steen het loodrechte woord.
  for (const tile of newTiles) {
    if (isHorizontal) {
      addWord(collectWord(board, tile, 1, 0)); // verticaal dwarswoord
    }
    if (isVertical) {
      addWord(collectWord(board, tile, 0, 1)); // horizontaal dwarswoord
    }
    if (!isHorizontal && !isVertical) {
      addWord(collectWord(board, tile, 1, 0));
      addWord(collectWord(board, tile, 0, 1));
    }
  }

  const words = Array.from(wordsByKey.values());
  let score = words.reduce((sum, w) => sum + w.score, 0);

  const bingo = newTiles.length >= RACK_SIZE;
  if (bingo) score += BINGO_BONUS;

  return { words, score, bingo };
}
