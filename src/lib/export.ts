// Export van het scorebord en de zettenhistoriek naar CSV en PDF.

import type { Move, Player } from './scrabble/types';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function playerName(players: Player[], id: string): string {
  return players.find((p) => p.id === id)?.name ?? id;
}

function csvEscape(value: string): string {
  if (/[",\n;]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** Exporteert de zettenhistoriek als CSV. */
export function exportCSV(players: Player[], moves: Move[]): void {
  const header = ['Nr', 'Speler', 'Woorden', 'Punten', 'Bingo', 'Tijd'];
  const rows = moves.map((m, i) => [
    String(i + 1),
    playerName(players, m.playerId),
    m.words.map((w) => w.word).join(' + '),
    String(m.score),
    m.bingo ? 'ja' : 'nee',
    new Date(m.playedAt).toLocaleString('nl-BE'),
  ]);

  // Eindtotalen per speler.
  const totals = players.map((p) => [
    '',
    p.name,
    'TOTAAL',
    String(moves.filter((m) => m.playerId === p.id).reduce((s, m) => s + m.score, 0)),
    '',
    '',
  ]);

  const all = [header, ...rows, [], ...totals];
  const csv = all.map((r) => r.map((c) => csvEscape(String(c))).join(';')).join('\n');
  triggerDownload(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }), 'scrabble-scores.csv');
}

/** Exporteert een net scoreoverzicht als PDF. */
export async function exportPDF(players: Player[], moves: Move[]): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Scrabble Vision — Scoreoverzicht', 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(new Date().toLocaleString('nl-BE'), 14, 25);
  doc.setTextColor(0);

  // Scorebord.
  const totals = players.map((p) => ({
    name: p.name,
    total: moves.filter((m) => m.playerId === p.id).reduce((s, m) => s + m.score, 0),
  }));
  totals.sort((a, b) => b.total - a.total);

  autoTable(doc, {
    startY: 32,
    head: [['Klassement', 'Speler', 'Punten']],
    body: totals.map((t, i) => [`${i + 1}`, t.name, `${t.total}`]),
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
  });

  // Zettenhistoriek.
  const afterTotals = (doc as any).lastAutoTable?.finalY ?? 60;
  autoTable(doc, {
    startY: afterTotals + 8,
    head: [['#', 'Speler', 'Woord(en)', 'Punten', 'Bingo']],
    body: moves.map((m, i) => [
      `${i + 1}`,
      playerName(players, m.playerId),
      m.words.map((w) => w.word).join(' + '),
      `${m.score}`,
      m.bingo ? '★' : '',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [16, 163, 74] },
    styles: { fontSize: 9 },
  });

  doc.save('scrabble-scores.pdf');
}
