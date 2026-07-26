import type { Board, Cell, Position } from './types';
import { BOARD_SIZE } from './config';

export function emptyCell(): Cell {
  return { letter: null, confidence: 1 };
}

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, emptyCell)
  );
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

export function inBounds(pos: Position): boolean {
  return pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE;
}

export function isFilled(board: Board, row: number, col: number): boolean {
  return inBounds({ row, col }) && board[row][col].letter !== null;
}

/** Aantal gevulde vakjes op het bord. */
export function countTiles(board: Board): number {
  let n = 0;
  for (const row of board) for (const cell of row) if (cell.letter) n++;
  return n;
}

/**
 * Bepaalt de nieuw geplaatste posities: vakjes die nu gevuld zijn en
 * in het vorige bord leeg waren.
 */
export function diffNewTiles(previous: Board, current: Board): Position[] {
  const added: Position[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const before = previous[r][c].letter;
      const after = current[r][c].letter;
      if (!before && after) added.push({ row: r, col: c });
    }
  }
  return added;
}

/** Vakjes die veranderd zijn van letter (mogelijke OCR-fout of correctie). */
export function diffChangedTiles(previous: Board, current: Board): Position[] {
  const changed: Position[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const before = previous[r][c].letter;
      const after = current[r][c].letter;
      if (before && after && before !== after) changed.push({ row: r, col: c });
    }
  }
  return changed;
}
