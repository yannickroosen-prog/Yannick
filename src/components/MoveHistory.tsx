'use client';

import { useGameStore } from '@/lib/store';
import { exportCSV, exportPDF } from '@/lib/export';

export function MoveHistory() {
  const moves = useGameStore((s) => s.moves);
  const players = useGameStore((s) => s.players);
  const undoLastMove = useGameStore((s) => s.undoLastMove);
  const resetGame = useGameStore((s) => s.resetGame);

  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? id;
  const colorOf = (id: string) => players.find((p) => p.id === id)?.color ?? '#888';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => exportPDF(players, moves)}
          disabled={moves.length === 0}
          className="flex-1 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
        >
          Export PDF
        </button>
        <button
          onClick={() => exportCSV(players, moves)}
          disabled={moves.length === 0}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium disabled:opacity-40 dark:border-neutral-700"
        >
          Export CSV
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={undoLastMove}
          disabled={moves.length === 0}
          className="flex-1 rounded-lg border border-amber-300 px-3 py-2 text-sm font-medium text-amber-700 disabled:opacity-40 dark:border-amber-800 dark:text-amber-300"
        >
          ↺ Laatste zet ongedaan
        </button>
        <button
          onClick={() => {
            if (confirm('Nieuw spel starten? Alle zetten worden gewist.')) resetGame();
          }}
          className="flex-1 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-800 dark:text-red-300"
        >
          Nieuw spel
        </button>
      </div>

      {moves.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-500">
          Nog geen zetten gespeeld.
        </p>
      ) : (
        <ol className="space-y-2">
          {[...moves].reverse().map((m, idx) => {
            const number = moves.length - idx;
            return (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-right text-xs text-neutral-400">{number}.</span>
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: colorOf(m.playerId) }}
                  />
                  <div>
                    <div className="font-medium">
                      {m.words.map((w) => w.word).join(' + ') || '—'}
                      {m.bingo && <span className="ml-1 text-amber-500">★</span>}
                    </div>
                    <div className="text-xs text-neutral-500">{nameOf(m.playerId)}</div>
                  </div>
                </div>
                <span className="text-lg font-bold tabular-nums text-emerald-600">
                  +{m.score}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
