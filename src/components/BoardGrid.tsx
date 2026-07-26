'use client';

import type { Board, BonusType, Position } from '@/lib/scrabble/types';
import { BONUS_BG, BONUS_LABELS } from '@/lib/scrabble/config';
import { useGameStore } from '@/lib/store';

interface BoardGridProps {
  board: Board;
  /** Posities die nieuw gelegd zijn (worden gemarkeerd). */
  newTiles?: Position[];
  /** Callback bij tik op een cel (voor handmatige correctie). */
  onCellClick?: (row: number, col: number) => void;
  /** Toon bonuslabels op lege vakjes. */
  showBonusLabels?: boolean;
}

export function BoardGrid({
  board,
  newTiles = [],
  onCellClick,
  showBonusLabels = true,
}: BoardGridProps) {
  const bonusBoard = useGameStore((s) => s.settings.bonusBoard);
  const newSet = new Set(newTiles.map((t) => `${t.row},${t.col}`));

  return (
    <div className="mx-auto w-full max-w-[min(92vw,32rem)] select-none">
      <div
        className="grid aspect-square w-full gap-[2px] rounded-lg bg-neutral-300 p-[2px] dark:bg-neutral-700"
        style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const bonus: BonusType = bonusBoard[r][c];
            const isNew = newSet.has(`${r},${c}`);
            const hasLetter = !!cell.letter;
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => onCellClick?.(r, c)}
                aria-label={`rij ${r + 1}, kolom ${c + 1}${
                  cell.letter ? `, letter ${cell.letter}` : ', leeg'
                }`}
                className={[
                  'relative flex items-center justify-center rounded-[2px] text-[clamp(6px,2vw,14px)] font-bold leading-none transition-colors',
                  hasLetter
                    ? 'bg-amber-200 text-neutral-900 dark:bg-amber-300'
                    : BONUS_BG[bonus],
                  isNew ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-neutral-900' : '',
                  cell.uncertain ? 'outline outline-2 outline-red-500' : '',
                  onCellClick ? 'cursor-pointer active:scale-95' : 'cursor-default',
                ].join(' ')}
              >
                {hasLetter ? (
                  <>
                    <span>{cell.letter}</span>
                    {cell.blank && (
                      <span className="absolute right-[1px] top-[1px] text-[6px] text-neutral-500">
                        ○
                      </span>
                    )}
                  </>
                ) : showBonusLabels && bonus !== 'none' ? (
                  <span className="text-[clamp(5px,1.5vw,10px)] font-semibold text-white/90 mix-blend-plus-lighter">
                    {BONUS_LABELS[bonus]}
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
