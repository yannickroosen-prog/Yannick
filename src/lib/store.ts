'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Board,
  BonusType,
  LetterValues,
  Move,
  Player,
} from './scrabble/types';
import { createEmptyBoard, cloneBoard } from './scrabble/board';
import {
  DUTCH_LETTER_VALUES,
  DEFAULT_BONUS_BOARD,
  DEFAULT_PLAYER_COLORS,
} from './scrabble/config';

export interface Settings {
  letterValues: LetterValues;
  bonusBoard: BonusType[][];
  uncertaintyThreshold: number;
  autoScan: boolean;
  darkMode: boolean;
  /** Woordvalidatie tonen wanneer een woordenboek geladen is. */
  validateWords: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  /** Bevestigde bordtoestand. */
  board: Board;
  moves: Move[];
  settings: Settings;

  // Spelersbeheer
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  renamePlayer: (id: string, name: string) => void;
  setCurrentPlayer: (index: number) => void;
  nextPlayer: () => void;

  // Zetten
  commitMove: (board: Board, move: Omit<Move, 'id' | 'playerId' | 'playedAt'>) => void;
  undoLastMove: () => void;
  setBoard: (board: Board) => void;
  resetGame: () => void;

  // Instellingen
  updateSettings: (patch: Partial<Settings>) => void;
  setLetterValue: (letter: string, value: number) => void;
  toggleDarkMode: () => void;

  // Afgeleide waarden
  score: (playerId: string) => number;
}

let idCounter = 0;
function makeId(prefix: string): string {
  // Deterministische, botsingsvrije id zonder afhankelijkheid van Date/Math.random
  // op het moduleniveau (belangrijk voor SSR-hydratie).
  idCounter += 1;
  return `${prefix}_${idCounter}_${
    typeof performance !== 'undefined' ? Math.round(performance.now()) : idCounter
  }`;
}

const defaultSettings: Settings = {
  letterValues: DUTCH_LETTER_VALUES,
  bonusBoard: DEFAULT_BONUS_BOARD,
  uncertaintyThreshold: 0.55,
  autoScan: false,
  darkMode: false,
  validateWords: true,
};

function defaultPlayers(): Player[] {
  return [
    { id: 'p1', name: 'Speler 1', color: DEFAULT_PLAYER_COLORS[0] },
    { id: 'p2', name: 'Speler 2', color: DEFAULT_PLAYER_COLORS[1] },
  ];
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      players: defaultPlayers(),
      currentPlayerIndex: 0,
      board: createEmptyBoard(),
      moves: [],
      settings: defaultSettings,

      addPlayer: (name) =>
        set((s) => {
          if (s.players.length >= 4) return s;
          const color = DEFAULT_PLAYER_COLORS[s.players.length % DEFAULT_PLAYER_COLORS.length];
          return {
            players: [
              ...s.players,
              { id: makeId('p'), name: name || `Speler ${s.players.length + 1}`, color },
            ],
          };
        }),

      removePlayer: (id) =>
        set((s) => {
          if (s.players.length <= 1) return s;
          const players = s.players.filter((p) => p.id !== id);
          return {
            players,
            currentPlayerIndex: Math.min(s.currentPlayerIndex, players.length - 1),
          };
        }),

      renamePlayer: (id, name) =>
        set((s) => ({
          players: s.players.map((p) => (p.id === id ? { ...p, name } : p)),
        })),

      setCurrentPlayer: (index) => set({ currentPlayerIndex: index }),

      nextPlayer: () =>
        set((s) => ({
          currentPlayerIndex: (s.currentPlayerIndex + 1) % s.players.length,
        })),

      commitMove: (board, movePartial) =>
        set((s) => {
          const player = s.players[s.currentPlayerIndex];
          const move: Move = {
            ...movePartial,
            id: makeId('m'),
            playerId: player.id,
            playedAt: new Date().toISOString(),
          };
          return {
            board: cloneBoard(board),
            moves: [...s.moves, move],
            currentPlayerIndex: (s.currentPlayerIndex + 1) % s.players.length,
          };
        }),

      undoLastMove: () =>
        set((s) => {
          if (s.moves.length === 0) return s;
          const moves = s.moves.slice(0, -1);
          // Herbouw het bord door de resterende zetten opnieuw toe te passen.
          const board = createEmptyBoard();
          for (const m of moves) {
            for (const t of m.tiles) {
              board[t.row][t.col] = {
                letter: t.letter,
                confidence: 1,
                blank: t.blank,
              };
            }
          }
          return {
            moves,
            board,
            currentPlayerIndex:
              (s.currentPlayerIndex - 1 + s.players.length) % s.players.length,
          };
        }),

      setBoard: (board) => set({ board: cloneBoard(board) }),

      resetGame: () =>
        set({
          board: createEmptyBoard(),
          moves: [],
          currentPlayerIndex: 0,
        }),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      setLetterValue: (letter, value) =>
        set((s) => ({
          settings: {
            ...s.settings,
            letterValues: { ...s.settings.letterValues, [letter]: value },
          },
        })),

      toggleDarkMode: () =>
        set((s) => ({ settings: { ...s.settings, darkMode: !s.settings.darkMode } })),

      score: (playerId) =>
        get()
          .moves.filter((m) => m.playerId === playerId)
          .reduce((sum, m) => sum + m.score, 0),
    }),
    {
      name: 'scrabble-vision-store',
      version: 1,
      // Bord en zetten worden bewaard; de vluchtige velden ook zodat je een
      // spel kunt hervatten na het sluiten van de app.
      partialize: (s) => ({
        players: s.players,
        currentPlayerIndex: s.currentPlayerIndex,
        board: s.board,
        moves: s.moves,
        settings: s.settings,
      }),
    }
  )
);
