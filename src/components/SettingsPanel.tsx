'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { loadDictionary, isDictionaryLoaded } from '@/lib/scrabble/dictionary';

export function SettingsPanel() {
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const setLetterValue = useGameStore((s) => s.setLetterValue);
  const toggleDarkMode = useGameStore((s) => s.toggleDarkMode);

  const [dictLoaded, setDictLoaded] = useState(false);
  const [dictChecking, setDictChecking] = useState(false);

  useEffect(() => {
    setDictLoaded(isDictionaryLoaded());
  }, []);

  const tryLoadDictionary = async () => {
    setDictChecking(true);
    const set = await loadDictionary();
    setDictLoaded(!!set && set.size > 0);
    setDictChecking(false);
  };

  const letters = Object.keys(settings.letterValues).filter((l) => l !== '?');

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-3 text-sm font-semibold">Weergave &amp; scan</h3>
        <Toggle
          label="Donkere modus"
          checked={settings.darkMode}
          onChange={toggleDarkMode}
        />
        <Toggle
          label="Automatische scanmodus"
          hint="Scant elke paar seconden automatisch."
          checked={settings.autoScan}
          onChange={(v) => updateSettings({ autoScan: v })}
        />
        <Toggle
          label="Woorden valideren"
          hint="Vereist een woordenlijst in /dictionaries/nl.txt."
          checked={settings.validateWords}
          onChange={(v) => updateSettings({ validateWords: v })}
        />

        <div className="mt-3">
          <label className="mb-1 block text-sm font-medium">Letterherkenning</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              ['model', 'Getraind model', 'CNN, sneller & offline'],
              ['ocr', 'OCR (Tesseract)', 'Klassieke tekstherkenning'],
            ] as const).map(([value, title, hint]) => (
              <button
                key={value}
                onClick={() => updateSettings({ recognizer: value })}
                className={[
                  'rounded-lg border p-2 text-left text-sm transition',
                  (settings.recognizer ?? 'model') === value
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'border-neutral-200 dark:border-neutral-800',
                ].join(' ')}
              >
                <div className="font-medium">{title}</div>
                <div className="text-xs text-neutral-500">{hint}</div>
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Bij het getrainde model wordt automatisch teruggevallen op OCR als het
            model niet beschikbaar is.
          </p>
        </div>

        <div className="mt-3">
          <label className="text-sm">
            Onzekerheidsdrempel: {Math.round(settings.uncertaintyThreshold * 100)}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.uncertaintyThreshold * 100)}
            onChange={(e) =>
              updateSettings({ uncertaintyThreshold: Number(e.target.value) / 100 })
            }
            className="w-full"
          />
          <p className="text-xs text-neutral-500">
            Detecties onder deze zekerheid worden rood gemarkeerd voor controle.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Woordenboek</h3>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              dictLoaded
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
            }`}
          >
            {dictLoaded ? 'geladen' : 'niet geladen'}
          </span>
        </div>
        <p className="mb-2 text-xs text-neutral-500">
          Plaats een Nederlandse woordenlijst als{' '}
          <code>public/dictionaries/nl.txt</code> (één woord per regel) om
          woorden automatisch te controleren.
        </p>
        <button
          onClick={tryLoadDictionary}
          disabled={dictChecking}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
        >
          {dictChecking ? 'Laden…' : 'Woordenlijst laden'}
        </button>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-1 text-sm font-semibold">Letterwaarden (Nederlands)</h3>
        <p className="mb-3 text-xs text-neutral-500">
          Pas de puntenwaarde per letter aan indien nodig.
        </p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {letters.map((l) => (
            <label
              key={l}
              className="flex items-center gap-1 rounded-lg bg-neutral-50 p-1.5 dark:bg-neutral-800"
            >
              <span className="w-4 font-bold">{l}</span>
              <input
                type="number"
                min={0}
                value={settings.letterValues[l]}
                onChange={(e) => setLetterValue(l, Number(e.target.value))}
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 py-2">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-neutral-500">{hint}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
          checked ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </label>
  );
}
