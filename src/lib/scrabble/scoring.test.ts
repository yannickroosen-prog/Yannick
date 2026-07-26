import { describe, it, expect } from 'vitest';
import { createEmptyBoard } from './board';
import { scoreMove, type ScoringConfig } from './scoring';
import { detectMove } from './moveDetection';
import {
  DUTCH_LETTER_VALUES,
  DEFAULT_BONUS_BOARD,
} from './config';
import type { Board, Position } from './types';

const cfg: ScoringConfig = {
  letterValues: DUTCH_LETTER_VALUES,
  bonusBoard: DEFAULT_BONUS_BOARD,
};

function place(board: Board, row: number, col: number, letter: string, blank = false) {
  board[row][col] = { letter, confidence: 1, blank };
}

function word(board: Board, row: number, col: number, text: string, horizontal = true) {
  const tiles: Position[] = [];
  for (let i = 0; i < text.length; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    place(board, r, c, text[i]);
    tiles.push({ row: r, col: c });
  }
  return tiles;
}

describe('scoreMove', () => {
  it('scoort een eenvoudig woord zonder bonus', () => {
    const board = createEmptyBoard();
    // "NET" op rij 4, kolommen 5-7 — deze vakjes zijn neutraal.
    const tiles = word(board, 4, 5, 'NET');
    const res = scoreMove(cfg, board, tiles);
    // N=1, E=1, T=2 => 4
    expect(res.score).toBe(4);
    expect(res.words).toHaveLength(1);
    expect(res.words[0].word).toBe('NET');
  });

  it('past het middenvak (dubbel woord) toe bij de openingszet', () => {
    const board = createEmptyBoard();
    // "NET" over het middenvak (7,7).
    const tiles = word(board, 7, 6, 'NET');
    const res = scoreMove(cfg, board, tiles);
    // basis 4, midden = dubbel woord => 8
    expect(res.score).toBe(8);
  });

  it('past een dubbele-letterbonus toe', () => {
    const board = createEmptyBoard();
    // DL-vak op (0,3). Leg "AAP" op rij 0, kolommen 3-5.
    const tiles = word(board, 0, 3, 'AAP');
    const res = scoreMove(cfg, board, tiles);
    // A op DL = 1*2=2, A=1, P=3 => 6
    expect(res.score).toBe(6);
  });

  it('past een driedubbel-woordbonus toe (hoekvak)', () => {
    const board = createEmptyBoard();
    // TW op (0,0). "NET" op rij 0, kol 0-2.
    const tiles = word(board, 0, 0, 'NET');
    const res = scoreMove(cfg, board, tiles);
    // basis 4 * 3 = 12
    expect(res.score).toBe(12);
  });

  it('geeft 50 bonuspunten bij een bingo (7 stenen)', () => {
    const board = createEmptyBoard();
    // 7x N op rij 6, kol 4-10. Rij 6 heeft dubbele-lettervakken op kol 6 en 8,
    // dus 2 van de N's tellen dubbel: basis 7 + 2 = 9, plus 50 bingo = 59.
    const tiles = word(board, 6, 4, 'NNNNNNN');
    const res = scoreMove(cfg, board, tiles);
    expect(res.bingo).toBe(true);
    expect(res.score).toBe(9 + 50);
  });

  it('telt blanco stenen als 0 punten', () => {
    const board = createEmptyBoard();
    const tiles = word(board, 5, 5, 'NET');
    board[5][5].blank = true; // N wordt blanco
    const res = scoreMove(cfg, board, tiles);
    // N=0, E=1, T=2 => 3
    expect(res.score).toBe(3);
  });

  it('scoort dwarswoorden bij aanhaken', () => {
    const board = createEmptyBoard();
    // Bestaand woord "NET" verticaal op kol 7, rij 7-9.
    word(board, 7, 7, 'NET', false);
    // Speel "AT" horizontaal die de bestaande T (op 9,7) verlengt tot ...
    // Eenvoudiger: leg één letter "S" onder om dwarswoord te testen.
    // We testen aanhaken: leg "IS" beginnend op (7,8) horizontaal, waarbij
    // I naast N komt -> vormt geen echt Nederlands woord maar test de logica.
    const board2 = createEmptyBoard();
    word(board2, 7, 7, 'NET'); // horizontaal N(7,7) E(7,8) T(7,9)
    // Leg verticaal "A" onder E: (8,8). Nieuw woord verticaal = "EA".
    place(board2, 8, 8, 'A');
    const res = scoreMove(cfg, board2, [{ row: 8, col: 8 }]);
    // Dwarswoord "EA": E=1 (bestaand), A op (8,8)=dubbele letter =1*2=2 => 3.
    expect(res.score).toBe(3);
    expect(res.words[0].word).toBe('EA');
  });
});

describe('detectMove', () => {
  it('detecteert nieuwe stenen tussen twee scans', () => {
    const prev = createEmptyBoard();
    word(prev, 7, 6, 'NET');
    const curr = prev.map((row) => row.map((c) => ({ ...c })));
    // Voeg "S" toe achter NET => "NETS" (7,9)... 'NET' eindigt op kol 8, dus S op (7,9).
    place(curr, 7, 9, 'S');
    const res = detectMove(prev, curr, cfg);
    expect(res.newTiles).toHaveLength(1);
    expect(res.move).not.toBeNull();
    expect(res.move!.words[0].word).toBe('NETS');
  });

  it('waarschuwt bij losse (niet-uitgelijnde) stenen', () => {
    const prev = createEmptyBoard();
    const curr = createEmptyBoard();
    place(curr, 3, 3, 'A');
    place(curr, 5, 8, 'B');
    const res = detectMove(prev, curr, cfg);
    expect(res.warnings.length).toBeGreaterThan(0);
  });
});
