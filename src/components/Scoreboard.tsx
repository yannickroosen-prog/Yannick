'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';

export function Scoreboard() {
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const moves = useGameStore((s) => s.moves);
  const renamePlayer = useGameStore((s) => s.renamePlayer);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const setCurrentPlayer = useGameStore((s) => s.setCurrentPlayer);

  const [editing, setEditing] = useState<string | null>(null);

  const scoreOf = (id: string) =>
    moves.filter((m) => m.playerId === id).reduce((s, m) => s + m.score, 0);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-500">Scorebord</h2>
        {players.length < 4 && (
          <button
            onClick={() => addPlayer('')}
            className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          >
            + Speler
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {players.map((p, i) => {
          const active = i === currentPlayerIndex;
          return (
            <button
              key={p.id}
              onClick={() => setCurrentPlayer(i)}
              className={[
                'flex items-center justify-between rounded-xl border p-2 text-left transition',
                active
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                  : 'border-neutral-200 dark:border-neutral-800',
              ].join(' ')}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  {editing === p.id ? (
                    <input
                      autoFocus
                      defaultValue={p.name}
                      onBlur={(e) => {
                        renamePlayer(p.id, e.target.value || p.name);
                        setEditing(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-transparent text-sm font-medium outline-none"
                    />
                  ) : (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(p.id);
                      }}
                      className="truncate text-sm font-medium"
                    >
                      {p.name}
                    </span>
                  )}
                </div>
                {active && (
                  <span className="text-[10px] font-semibold uppercase text-emerald-600">
                    aan de beurt
                  </span>
                )}
              </div>
              <div className="ml-2 flex items-center gap-1">
                <span className="text-xl font-bold tabular-nums">{scoreOf(p.id)}</span>
                {players.length > 1 && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      removePlayer(p.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.stopPropagation();
                        removePlayer(p.id);
                      }
                    }}
                    className="cursor-pointer text-neutral-300 hover:text-red-500"
                    aria-label={`${p.name} verwijderen`}
                  >
                    ✕
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
