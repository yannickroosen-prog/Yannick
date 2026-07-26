// Core domeintypes voor de Scrabble-engine.

/** Bonusvaktype op het bord. */
export type BonusType =
  | 'none'
  | 'DL' // dubbele letterwaarde
  | 'TL' // driedubbele letterwaarde
  | 'DW' // dubbele woordwaarde
  | 'TW' // driedubbele woordwaarde
  | 'STAR'; // middenvak (telt als dubbel woord bij openingszet)

/** Een enkel vakje op het bord. */
export interface Cell {
  /** Hoofdletter A-Z, of null bij leeg vak. '?' stelt een blanco steen voor. */
  letter: string | null;
  /** Betrouwbaarheid van de OCR-detectie (0-1). 1 = handmatig ingevoerd/zeker. */
  confidence: number;
  /** True wanneer de gebruiker deze detectie moet controleren. */
  uncertain?: boolean;
  /** True wanneer deze steen een blanco (joker) is en 0 punten telt. */
  blank?: boolean;
}

/** Het volledige 15x15 bord. board[row][col]. */
export type Board = Cell[][];

/** Positie op het bord. */
export interface Position {
  row: number;
  col: number;
}

/** Een geplaatste steen tijdens een zet. */
export interface PlacedTile extends Position {
  letter: string;
  blank: boolean;
}

/** Een woord dat door een zet gevormd of geraakt is. */
export interface ScoredWord {
  word: string;
  positions: Position[];
  score: number;
  /** True wanneer het woord in het woordenboek voorkomt (indien geladen). */
  valid?: boolean;
  /** Per-letter puntendetail voor de UI. */
  breakdown: {
    letter: string;
    base: number;
    bonus: BonusType;
    /** Punten na letterbonus, vóór woordbonus. */
    effective: number;
  }[];
}

/** Volledig resultaat van een gedetecteerde zet. */
export interface Move {
  id: string;
  playerId: string;
  /** ISO-timestamp. */
  playedAt: string;
  /** Nieuw geplaatste stenen t.o.v. de vorige scan. */
  tiles: PlacedTile[];
  /** Alle woorden die door de zet gevormd of verlengd zijn. */
  words: ScoredWord[];
  /** Totale score van de zet inclusief eventuele bingo-bonus. */
  score: number;
  /** True wanneer alle 7 stenen in één beurt gebruikt zijn (bingo). */
  bingo: boolean;
  /** Optionele opmerking. */
  note?: string;
}

export interface Player {
  id: string;
  name: string;
  color: string;
}

/** Letterwaardenconfiguratie (taalafhankelijk). */
export type LetterValues = Record<string, number>;

/** Aantal stenen per letter in de zak (taalafhankelijk). */
export type LetterDistribution = Record<string, number>;
