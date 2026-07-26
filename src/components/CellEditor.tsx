'use client';

import { useState } from 'react';
import type { Cell } from '@/lib/scrabble/types';

interface CellEditorProps {
  row: number;
  col: number;
  cell: Cell;
  onSave: (cell: Cell) => void;
  onClose: () => void;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function CellEditor({ row, col, cell, onSave, onClose }: CellEditorProps) {
  const [blank, setBlank] = useState(!!cell.blank);

  const pick = (letter: string | null) => {
    if (letter === null) {
      onSave({ letter: null, confidence: 1 });
    } else {
      onSave({ letter, confidence: 1, blank, uncertain: false });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Vakje R{row + 1} · K{col + 1}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full px-2 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            ✕
          </button>
        </div>

        <label className="mb-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={blank}
            onChange={(e) => setBlank(e.target.checked)}
            className="h-4 w-4"
          />
          Blanco steen (joker, 0 punten)
        </label>

        <div className="grid grid-cols-7 gap-1">
          {LETTERS.map((l) => (
            <button
              key={l}
              onClick={() => pick(l)}
              className={[
                'aspect-square rounded-md text-sm font-bold',
                cell.letter === l
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-100 hover:bg-emerald-100 dark:bg-neutral-800 dark:hover:bg-neutral-700',
              ].join(' ')}
            >
              {l}
            </button>
          ))}
        </div>

        <button
          onClick={() => pick(null)}
          className="mt-3 w-full rounded-lg bg-red-50 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300"
        >
          Vakje leegmaken
        </button>
      </div>
    </div>
  );
}
