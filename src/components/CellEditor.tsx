'use client';

import { useEffect, useState } from 'react';
import type { Cell } from '@/lib/scrabble/types';

export type EntryDirection = 'h' | 'v';

interface CellEditorProps {
  row: number;
  col: number;
  cell: Cell;
  direction: EntryDirection;
  onToggleDirection: () => void;
  /** letter = null betekent: dit vak leegmaken. */
  onPick: (letter: string | null, blank: boolean) => void;
  /** Stap terug en maak het vorige vak leeg. */
  onBackspace: () => void;
  onClose: () => void;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function CellEditor({
  row,
  col,
  cell,
  direction,
  onToggleDirection,
  onPick,
  onBackspace,
  onClose,
}: CellEditorProps) {
  const [blank, setBlank] = useState(!!cell.blank);

  // Fysiek toetsenbord: letters typen, backspace wissen, enter/escape sluiten.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        onBackspace();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        onPick(e.key.toUpperCase(), blank);
      } else if (e.key === ' ') {
        e.preventDefault();
        setBlank((b) => !b);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [blank, onPick, onBackspace, onClose]);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white p-3 shadow-2xl safe-bottom dark:border-neutral-800 dark:bg-neutral-900"
      role="dialog"
      aria-label="Letter invoeren"
    >
      <div className="mx-auto max-w-lg">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            Vak R{row + 1} · K{col + 1}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleDirection}
              className="rounded-lg bg-neutral-100 px-3 py-1.5 text-sm font-medium dark:bg-neutral-800"
              title="Invoerrichting"
            >
              {direction === 'h' ? '→ horizontaal' : '↓ verticaal'}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white"
            >
              Klaar
            </button>
          </div>
        </div>

        <label className="mb-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={blank}
            onChange={(e) => setBlank(e.target.checked)}
            className="h-4 w-4"
          />
          Blanco steen (joker, 0 punten) — spatie schakelt om
        </label>

        <div className="grid grid-cols-7 gap-1">
          {LETTERS.map((l) => (
            <button
              key={l}
              onClick={() => onPick(l, blank)}
              className={[
                'aspect-[4/3] rounded-md text-sm font-bold',
                cell.letter === l
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-100 hover:bg-emerald-100 dark:bg-neutral-800 dark:hover:bg-neutral-700',
              ].join(' ')}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="mt-2 flex gap-2">
          <button
            onClick={onBackspace}
            className="flex-1 rounded-lg border border-neutral-300 py-2 text-sm font-medium dark:border-neutral-700"
          >
            ⌫ Terug
          </button>
          <button
            onClick={() => onPick(null, false)}
            className="flex-1 rounded-lg bg-red-50 py-2 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            Vak leegmaken
          </button>
        </div>

        <p className="mt-2 text-center text-[11px] text-neutral-500">
          Tip: typ letters op je toetsenbord — het volgende vak wordt vanzelf
          geselecteerd in de gekozen richting.
        </p>
      </div>
    </div>
  );
}
