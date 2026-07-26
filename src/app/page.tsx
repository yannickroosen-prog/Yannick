'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/lib/store';
import { Scoreboard } from '@/components/Scoreboard';
import { BoardGrid } from '@/components/BoardGrid';
import { MoveResult } from '@/components/MoveResult';
import { MoveHistory } from '@/components/MoveHistory';
import { SettingsPanel } from '@/components/SettingsPanel';
import { CellEditor } from '@/components/CellEditor';
import { detectMove, type DetectMoveResult } from '@/lib/scrabble/moveDetection';
import { cloneBoard } from '@/lib/scrabble/board';
import type { Board, Cell } from '@/lib/scrabble/types';
import type { Corner } from '@/lib/vision/boardDetection';
import { loadDictionary } from '@/lib/scrabble/dictionary';

// Camera + zware visie-libs alleen client-side laden.
const CameraView = dynamic(
  () => import('@/components/CameraView').then((m) => m.CameraView),
  { ssr: false }
);

type Tab = 'scan' | 'board' | 'history' | 'settings';

export default function Home() {
  const board = useGameStore((s) => s.board);
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const settings = useGameStore((s) => s.settings);
  const commitMove = useGameStore((s) => s.commitMove);
  const setBoard = useGameStore((s) => s.setBoard);

  const [tab, setTab] = useState<Tab>('scan');
  const [hydrated, setHydrated] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState<{ f: number; label: string } | null>(null);
  const [pendingBoard, setPendingBoard] = useState<Board | null>(null);
  const [editCell, setEditCell] = useState<{ row: number; col: number } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Vermijd hydratie-mismatch: render de gepersisteerde store pas na mount.
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

  const handleCapture = useCallback(
    async (video: HTMLVideoElement, guideCorners: Corner[]) => {
      if (scanning) return;
      setScanning(true);
      setScanError(null);
      setProgress({ f: 0, label: 'Starten…' });
      try {
        const { scanBoard } = await import('@/lib/vision/pipeline');
        const scan = await scanBoard(video, {
          uncertaintyThreshold: settings.uncertaintyThreshold,
          fallbackCorners: guideCorners,
          onProgress: (f, label) => setProgress({ f, label }),
        });
        // Bestaande stenen behouden hun letter; de scan vult (nieuwe) letters aan.
        const merged = cloneBoard(board);
        for (let r = 0; r < 15; r++) {
          for (let c = 0; c < 15; c++) {
            const scanned = scan.board[r][c];
            if (scanned.letter && !merged[r][c].letter) {
              merged[r][c] = scanned;
            } else if (scanned.letter && merged[r][c].letter !== scanned.letter) {
              // Bestaande steen die anders gelezen wordt: markeer onzeker.
              merged[r][c] = { ...merged[r][c], uncertain: scanned.uncertain };
            }
          }
        }
        setPendingBoard(merged);
        setTab('board');
      } catch (e) {
        setScanError(
          e instanceof Error ? e.message : 'Scannen mislukt. Probeer opnieuw.'
        );
      } finally {
        setScanning(false);
        setProgress(null);
      }
    },
    [board, scanning, settings.uncertaintyThreshold]
  );

  const applyCellEdit = (cell: Cell) => {
    if (!editCell || !pendingBoard) return;
    const next = cloneBoard(pendingBoard);
    next[editCell.row][editCell.col] = cell;
    setPendingBoard(next);
  };

  const confirmMove = () => {
    if (!pendingBoard || !result?.move) return;
    commitMove(pendingBoard, result.move);
    setPendingBoard(null);
    setTab('scan');
  };

  const discardScan = () => {
    setPendingBoard(null);
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
        <h1 className="text-lg font-bold">
          🔤 Scrabble Vision
        </h1>
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
            <p className="text-center text-xs text-neutral-500">
              Richt de camera zo dat het bord het kader vult en druk op de knop.
              Onzekere letters kun je daarna handmatig corrigeren.
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
              <div className="flex gap-2">
                <button
                  onClick={discardScan}
                  className="flex-1 rounded-lg border border-neutral-300 py-2 text-sm dark:border-neutral-700"
                >
                  Scan verwerpen
                </button>
              </div>
            )}
            <BoardGrid
              board={displayBoard}
              newTiles={result?.newTiles ?? []}
              onCellClick={
                pendingBoard
                  ? (row, col) => setEditCell({ row, col })
                  : (row, col) => {
                      // Ook het bevestigde bord is handmatig corrigeerbaar.
                      setPendingBoard(cloneBoard(board));
                      setEditCell({ row, col });
                    }
              }
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

      {editCell && (
        <CellEditor
          row={editCell.row}
          col={editCell.col}
          cell={displayBoard[editCell.row][editCell.col]}
          onSave={applyCellEdit}
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
                tab === key
                  ? 'text-emerald-600'
                  : 'text-neutral-400 hover:text-neutral-600'
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
