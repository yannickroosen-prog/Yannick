// Taal- en bordconfiguratie. Alles is bewust configureerbaar gehouden.

import type { BonusType, LetterValues, LetterDistribution } from './types';

export const BOARD_SIZE = 15;

/** Aantal stenen op het rek — een volledige beurt (bingo) gebruikt er 7. */
export const RACK_SIZE = 7;

/** Bonuspunten wanneer alle 7 stenen in één beurt worden gelegd. */
export const BINGO_BONUS = 50;

/**
 * Nederlandse Scrabble-letterwaarden.
 * Bron: officiële Nederlandse Scrabble-editie.
 */
export const DUTCH_LETTER_VALUES: LetterValues = {
  A: 1, B: 3, C: 5, D: 2, E: 1, F: 4, G: 3, H: 4, I: 1, J: 4,
  K: 3, L: 3, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 2, S: 2, T: 2,
  U: 4, V: 4, W: 5, X: 8, Y: 8, Z: 4,
  '?': 0, // blanco steen
};

/** Nederlandse steenverdeling (102 stenen incl. 2 blanco's). */
export const DUTCH_LETTER_DISTRIBUTION: LetterDistribution = {
  A: 6, B: 2, C: 2, D: 5, E: 18, F: 2, G: 3, H: 2, I: 4, J: 2,
  K: 3, L: 3, M: 3, N: 10, O: 6, P: 2, Q: 1, R: 5, S: 5, T: 5,
  U: 3, V: 2, W: 2, X: 1, Y: 1, Z: 2,
  '?': 2,
};

/**
 * Bonusvakken van een standaard Scrabble-bord (15x15, symmetrisch).
 * Gedefinieerd via het kwadrant + spiegeling om fouten te vermijden.
 */
export const DEFAULT_BONUS_BOARD: BonusType[][] = buildBonusBoard();

function buildBonusBoard(): BonusType[][] {
  const board: BonusType[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => 'none' as BonusType)
  );

  const set = (r: number, c: number, type: BonusType) => {
    // Vier-voudige symmetrie t.o.v. het middelpunt (7,7).
    const points = [
      [r, c],
      [r, BOARD_SIZE - 1 - c],
      [BOARD_SIZE - 1 - r, c],
      [BOARD_SIZE - 1 - r, BOARD_SIZE - 1 - c],
    ];
    for (const [rr, cc] of points) board[rr][cc] = type;
  };

  // Driedubbel woord (TW)
  [
    [0, 0], [0, 7], [7, 0],
  ].forEach(([r, c]) => set(r, c, 'TW'));

  // Dubbel woord (DW) — diagonalen
  [
    [1, 1], [2, 2], [3, 3], [4, 4],
  ].forEach(([r, c]) => set(r, c, 'DW'));

  // Driedubbele letter (TL)
  [
    [1, 5], [5, 1], [5, 5],
  ].forEach(([r, c]) => set(r, c, 'TL'));

  // Dubbele letter (DL)
  [
    [0, 3], [2, 6], [3, 0], [3, 7], [6, 2], [6, 6], [7, 3],
  ].forEach(([r, c]) => set(r, c, 'DL'));

  // Middenvak
  board[7][7] = 'STAR';

  return board;
}

export const BONUS_LABELS: Record<BonusType, string> = {
  none: '',
  DL: '2L',
  TL: '3L',
  DW: '2W',
  TW: '3W',
  STAR: '★',
};

export const BONUS_DESCRIPTIONS: Record<BonusType, string> = {
  none: 'Gewoon vak',
  DL: 'Dubbele letterwaarde',
  TL: 'Driedubbele letterwaarde',
  DW: 'Dubbele woordwaarde',
  TW: 'Driedubbele woordwaarde',
  STAR: 'Middenvak (dubbel woord)',
};

/** Tailwind-achtergrondkleuren per bonustype (voor de bord-UI). */
export const BONUS_BG: Record<BonusType, string> = {
  none: 'bg-emerald-50 dark:bg-neutral-800',
  DL: 'bg-sky-300 dark:bg-sky-700',
  TL: 'bg-sky-500 dark:bg-sky-900',
  DW: 'bg-orange-300 dark:bg-orange-800',
  TW: 'bg-red-500 dark:bg-red-800',
  STAR: 'bg-orange-400 dark:bg-orange-700',
};

export const DEFAULT_PLAYER_COLORS = [
  '#2563eb', // blauw
  '#dc2626', // rood
  '#16a34a', // groen
  '#9333ea', // paars
];
