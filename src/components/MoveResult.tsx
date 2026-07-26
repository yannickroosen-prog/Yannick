'use client';

import type { DetectMoveResult } from '@/lib/scrabble/moveDetection';
import { BONUS_LABELS } from '@/lib/scrabble/config';

interface MoveResultProps {
  result: DetectMoveResult;
  playerName: string;
  playerColor: string;
  onConfirm: () => void;
  onDiscard: () => void;
}

export function MoveResult({
  result,
  playerName,
  playerColor,
  onConfirm,
  onDiscard,
}: MoveResultProps) {
  const move = result.move;

  if (!move) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-neutral-600 dark:text-neutral-400">
          Geen nieuwe stenen gevonden sinds de vorige scan. Corrigeer eventueel
          handmatig door op een vakje te tikken.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: playerColor }}
          />
          <span className="font-semibold">{playerName}</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            +{move.score}
          </div>
          {move.bingo && (
            <div className="text-xs font-semibold text-amber-600">
              ★ Bingo! (+50)
            </div>
          )}
        </div>
      </div>

      {/* Woorden met puntendetail */}
      <div className="space-y-2">
        {move.words.map((w, i) => (
          <div
            key={i}
            className="rounded-lg bg-neutral-50 p-2 text-sm dark:bg-neutral-800"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-base font-bold tracking-wide">
                {w.word}
                {w.valid === false && (
                  <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-normal text-red-700 dark:bg-red-950 dark:text-red-300">
                    onbekend
                  </span>
                )}
                {w.valid === true && (
                  <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-normal text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    geldig
                  </span>
                )}
              </span>
              <span className="font-semibold">{w.score} ptn</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {w.breakdown.map((b, j) => (
                <span
                  key={j}
                  className="inline-flex items-center gap-0.5 rounded bg-white px-1 py-0.5 text-xs dark:bg-neutral-900"
                  title={b.bonus !== 'none' ? BONUS_LABELS[b.bonus] : undefined}
                >
                  <span className="font-bold">{b.letter}</span>
                  <span className="text-neutral-500">{b.base}</span>
                  {b.bonus !== 'none' && (
                    <span className="text-[10px] font-semibold text-emerald-600">
                      {BONUS_LABELS[b.bonus]}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {result.warnings.length > 0 && (
        <div className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {result.warnings.map((w, i) => (
            <div key={i}>⚠ {w}</div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onDiscard}
          className="flex-1 rounded-lg border border-neutral-300 py-2.5 text-sm font-medium dark:border-neutral-700"
        >
          Opnieuw
        </button>
        <button
          onClick={onConfirm}
          className="flex-[2] rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Bevestig zet (+{move.score})
        </button>
      </div>
    </div>
  );
}
