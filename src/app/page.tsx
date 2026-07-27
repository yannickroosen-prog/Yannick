'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/lib/store';
import { Scoreboard } from '@/components/Scoreboard';
import { BoardGrid } from '@/components/BoardGrid';
import { MoveResult } from '@/components/MoveResult';
import { MoveHistory } from '@/components/MoveHistory';
import { SettingsPanel } from '@/components/SettingsPanel';
import { CellEditor, type EntryDirection } from '@/components/CellEditor';
import { detectMove, type DetectMoveResult } from '@/lib/scrabble/moveDetection';
import { cloneBoard } from '@/lib/scrabble/board';
import { BOARD_SIZE } from '@/lib/scrabble/config';
import type { Board, Cell } from '@/lib/scrabble/types';
import type { Corner } from '@/lib/vision/boardDetection';
import { loadDictionary } from '@/lib/scrabble/dictionary';

// Camera + zware visie-libs alleen client-side laden.
const CameraView = dynamic(
  () => import('@/components/CameraView').then((m) => m.CameraView),
  { ssr: false }
);
const ScanAligner = dynamic(
  () => import('@/components/ScanAligner').then((m) => m.ScanAligner),
  { ssr: false }
);

type Tab = 'scan' | 'board' | 'history' | 'settings';

export default function Home() {
  const board = useGameStore((s) => s.board);
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const settings = useGameStore((s) => s.settings);
  const commitMove = useGameStore((s) => s.commitMove);

  const [tab, setTab] = useState<Tab>('scan');
  const [hydrated, setHydrated] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState<{ f: number; label: string } | null>(null);
  const [pendingBoard, setPendingBoard] = useState<Board | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Uitlijning van een vastgelegd beeld.
  const [captured, setCaptured] = useState<HTMLCanvasElement | null>(null);
  const [capturedGuide, setCapturedGuide] = useState<Corner[]>([]);

  // Handmatige invoer.
  const [editCell, setEditCell] = useState<{ row: number; col: number } | null>(null);
  const [entryDir, setEntryDir] = useState<EntryDirection>('h');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (settings.validateWords) loadDictionary();
  }, [settings.validateWords]);

  const cfg = useMemo(
    () => ({ letterValues: settings.letterValues, bonusBoard: settings.bonusBoard }),
    [settings.letterValues, settings.bonusBoard]
  );

  const result: DetectMoveResult | null = useMemo(() => {
    if (!pendingBoard) return null;
    return detectMove(board, pendingBoard, cfg);
  }, [board, pendingBoard, cfg]);

  const runScan = useCallback(
    async (still: HTMLCanvasElement, guide: Corner[], forceCorners?: Corner[]) => {
      setScanning(true);
      setScanError(null);
      setCaptured(null);
      setProgress({ f: 0, label: 'Starten…' });
      try {
        const { scanBoard } = await import('@/lib/vision/pipeline');
        const scan = await scanBoard(still, {
          uncertaintyThreshold: settings.uncertaintyThreshold,
          fallbackCorners: guide,
          forceCorners,
          onProgress: (f, label) => setProgress({ f, label }),
        });
        // Bestaande stenen behouden; de scan vult (nieuwe) letters aan.
        const merged = cloneBoard(board);
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            const scanned = scan.board[r][c];
            if (scanned.letter && !merged[r][c].letter) {
              merged[r][c] = scanned;
            }
          }
        }
        setPendingBoard(merged);
        setTab('board');
      } catch (e) {
        setScanError(e instanceof Error ? e.message : 'Scannen mislukt. Probeer opnieuw.');
      } finally {
        setScanning(false);
        setProgress(null);
      }
    },
    [board, settings.uncertaintyThreshold]
  );

  const handleCapture = useCallback(
    (still: HTMLCanvasElement, guide: Corner[]) => {
      if (scanning) return;
      if (settings.autoScan) {
        // Auto-scan: geen handmatige uitlijning, gebruik automatische detectie.
        runScan(still, guide);
      } else {
        // Bevries het beeld en laat de gebruiker de hoeken uitlijnen.
        setCaptured(still);
        setCapturedGuide(guide);
      }
    },
    [scanning, settings.autoScan, runScan]
  );

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file || scanning) return;
      setScanError(null);
      try {
        const { fileToCanvas } = await import('@/lib/vision/image');
        const canvas = await fileToCanvas(file);
        // Gecentreerd vierkant kader als startpunt voor de uitlijning.
        const side = Math.min(canvas.width, canvas.height) * 0.9;
        const x0 = (canvas.width - side) / 2;
        const y0 = (canvas.height - side) / 2;
        const guide: Corner[] = [
          { x: x0, y: y0 },
          { x: x0 + side, y: y0 },
          { x: x0 + side, y: y0 + side },
          { x: x0, y: y0 + side },
        ];
        setCaptured(canvas);
        setCapturedGuide(guide);
      } catch (e) {
        setScanError(e instanceof Error ? e.message : 'Kon de foto niet laden.');
      }
    },
    [scanning]
  );

  // ---- Handmatige invoer ----
  const openEditorAt = (row: number, col: number) => {
    setPendingBoard((prev) => prev ?? cloneBoard(board));
    setEditCell({ row, col });
  };

  const startManualEntry = () => {
    setPendingBoard((prev) => prev ?? cloneBoard(board));
    setEditCell({ row: 7, col: 7 });
    setTab('board');
  };

  const setCellAt = (row: number, col: number, cell: Cell) => {
    setPendingBoard((prev) => {
      const base = prev ?? cloneBoard(board);
      const next = cloneBoard(base);
      next[row][col] = cell;
      return next;
    });
  };

  const advance = (row: number, col: number) => {
    const nr = entryDir === 'v' ? row + 1 : row;
    const nc = entryDir === 'h' ? col + 1 : col;
    if (nr < BOARD_SIZE && nc < BOARD_SIZE) setEditCell({ row: nr, col: nc });
  };

  const handlePick = (letter: string | null, blank: boolean) => {
    if (!editCell) return;
    const { row, col } = editCell;
    if (letter === null) {
      setCellAt(row, col, { letter: null, confidence: 1 });
    } else {
      setCellAt(row, col, { letter, confidence: 1, blank, uncertain: false });
      advance(row, col);
    }
  };

  const handleBackspace = () => {
    if (!editCell) return;
    const { row, col } = editCell;
    const pr = entryDir === 'v' ? row - 1 : row;
    const pc = entryDir === 'h' ? col - 1 : col;
    if (pr >= 0 && pc >= 0) {
      setCellAt(pr, pc, { letter: null, confidence: 1 });
      setEditCell({ row: pr, col: pc });
    } else {
      setCellAt(row, col, { letter: null, confidence: 1 });
    }
  };

  const confirmMove = () => {
    if (!pendingBoard || !result?.move) return;
    commitMove(pendingBoard, result.move);
    setPendingBoard(null);
    setEditCell(null);
    setTab('scan');
  };

  const discardScan = () => {
    setPendingBoard(null);
    setEditCell(null);
    setTab('scan');
  };

  const currentPlayer = players[currentPlayerIndex] ?? players[0];
  const displayBoard = pendingBoard ?? board;

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-3 pb-24 pt-4 safe-top">
      <header className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">🔤 Scrabble Vision</h1>
        <span className="text-xs text-neutral-500">Automatische scorekeeper</span>
      </header>

      <Scoreboard />

      <div className="mt-4">
        {tab === 'scan' && (
          <div className="space-y-3">
            <CameraView
              onCapture={handleCapture}
              scanning={scanning}
              autoScan={settings.autoScan}
            />
            {progress && (
              <div className="rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800">
                <div className="mb-1 flex justify-between text-xs">
                  <span>{progress.label}</span>
                  <span>{Math.round(progress.f * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${progress.f * 100}%` }}
                  />
                </div>
              </div>
            )}
            {scanError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {scanError}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 rounded-xl border border-neutral-300 py-3 text-sm font-medium dark:border-neutral-700"
              >
                📁 Foto uploaden
              </button>
              <button
                onClick={startManualEntry}
                className="flex-1 rounded-xl border border-neutral-300 py-3 text-sm font-medium dark:border-neutral-700"
              >
                ✍️ Handmatig invoeren
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <p className="text-center text-xs text-neutral-500">
              Richt de camera op het bord en druk op de knop. Daarna lijn je de
              vier hoeken uit voor een nauwkeurige uitlezing. Werkt de herkenning
              niet goed? Gebruik handmatige invoer — de score wordt hoe dan ook
              correct berekend.
            </p>
          </div>
        )}

        {tab === 'board' && (
          <div className="space-y-4">
            {pendingBoard && result?.move && (
              <MoveResult
                result={result}
                playerName={currentPlayer.name}
                playerColor={currentPlayer.color}
                onConfirm={confirmMove}
                onDiscard={discardScan}
              />
            )}
            {pendingBoard && !result?.move && (
              <div className="flex items-center gap-2">
                <p className="flex-1 text-sm text-neutral-500">
                  Tik op de vakjes en typ de gelegde letters.
                </p>
                <button
                  onClick={discardScan}
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700"
                >
                  Wissen
                </button>
              </div>
            )}
            <BoardGrid
              board={displayBoard}
              newTiles={result?.newTiles ?? []}
              onCellClick={(row, col) => openEditorAt(row, col)}
            />
            <p className="text-center text-xs text-neutral-500">
              Tik op een vakje om de letter te corrigeren. Nieuw gelegde stenen
              hebben een groene rand, onzekere detecties een rode.
            </p>
          </div>
        )}

        {tab === 'history' && <MoveHistory />}
        {tab === 'settings' && <SettingsPanel />}
      </div>

      {/* Uitlijnscherm na het vastleggen van een beeld */}
      {captured && (
        <ScanAligner
          image={captured}
          initialCorners={capturedGuide}
          onConfirm={(corners) => runScan(captured, capturedGuide, corners)}
          onCancel={() => setCaptured(null)}
        />
      )}

      {/* Letterinvoer (bottom sheet) */}
      {editCell && (
        <CellEditor
          row={editCell.row}
          col={editCell.col}
          cell={displayBoard[editCell.row][editCell.col]}
          direction={entryDir}
          onToggleDirection={() => setEntryDir((d) => (d === 'h' ? 'v' : 'h'))}
          onPick={handlePick}
          onBackspace={handleBackspace}
          onClose={() => setEditCell(null)}
        />
      )}

      {/* Onderste navigatie */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {([
            ['scan', '📷', 'Scannen'],
            ['board', '🎯', 'Bord'],
            ['history', '📜', 'Historiek'],
            ['settings', '⚙️', 'Instellingen'],
          ] as const).map(([key, icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition ${
                tab === key ? 'text-emerald-600' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <span className="text-lg">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
