'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Corner } from '@/lib/vision/boardDetection';

interface ScanAlignerProps {
  /** Het stilstaande camerabeeld. */
  image: HTMLCanvasElement;
  /** Beginhoeken (bv. het uitlijnkader) in beeldpixel-coördinaten. */
  initialCorners: Corner[];
  onConfirm: (corners: Corner[]) => void;
  onCancel: () => void;
}

const LABELS = ['◤', '◥', '◢', '◣'];

/**
 * Laat de gebruiker de 4 hoeken van het bord precies op de foto slepen.
 * De uitgelijnde hoeken worden gebruikt voor een exacte perspectiefcorrectie,
 * zodat het 15x15-raster op de echte vakjes valt.
 */
export function ScanAligner({
  image,
  initialCorners,
  onConfirm,
  onCancel,
}: ScanAlignerProps) {
  const [corners, setCorners] = useState<Corner[]>(() =>
    initialCorners.length === 4
      ? initialCorners.map((c) => ({ ...c }))
      : defaultCorners(image.width, image.height)
  );
  const dragIndex = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const dataUrl = useMemo(() => image.toDataURL('image/jpeg', 0.9), [image]);
  const W = image.width;
  const H = image.height;

  const clientToImage = (clientX: number, clientY: number): Corner => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * W;
    const y = ((clientY - rect.top) / rect.height) * H;
    return {
      x: Math.max(0, Math.min(W, x)),
      y: Math.max(0, Math.min(H, y)),
    };
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (dragIndex.current === null) return;
      e.preventDefault();
      const p = clientToImage(e.clientX, e.clientY);
      setCorners((prev) => {
        const next = prev.map((c) => ({ ...c }));
        next[dragIndex.current!] = p;
        return next;
      });
    };
    const up = () => {
      dragIndex.current = null;
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [W, H]);

  const handleSize = Math.max(W, H) * 0.03;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      <div className="safe-top flex items-center justify-between p-3 text-white">
        <button onClick={onCancel} className="rounded-lg px-3 py-1.5 text-sm">
          Annuleer
        </button>
        <span className="text-sm font-medium">Sleep de hoeken op het bord</span>
        <span className="w-16" />
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden p-2">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="max-h-full max-w-full touch-none"
          style={{ aspectRatio: `${W} / ${H}` }}
        >
          <image href={dataUrl} x={0} y={0} width={W} height={H} />
          {/* Vlak tussen de hoeken */}
          <polygon
            points={corners.map((c) => `${c.x},${c.y}`).join(' ')}
            fill="rgba(16,185,129,0.15)"
            stroke="#10b981"
            strokeWidth={Math.max(2, W * 0.004)}
          />
          {/* Sleephandvatten */}
          {corners.map((c, i) => (
            <g key={i}>
              <circle
                cx={c.x}
                cy={c.y}
                r={handleSize}
                fill="rgba(16,185,129,0.35)"
                stroke="#10b981"
                strokeWidth={Math.max(2, W * 0.004)}
              />
              <circle cx={c.x} cy={c.y} r={handleSize * 0.25} fill="#fff" />
              {/* Groot, onzichtbaar treffervlak voor de vinger */}
              <circle
                cx={c.x}
                cy={c.y}
                r={handleSize * 2}
                fill="transparent"
                style={{ cursor: 'grab' }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  dragIndex.current = i;
                }}
              />
              <text
                x={c.x}
                y={c.y - handleSize * 1.6}
                fill="#10b981"
                fontSize={handleSize * 1.4}
                textAnchor="middle"
              >
                {LABELS[i]}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="safe-bottom flex gap-2 p-3">
        <button
          onClick={() => setCorners(defaultCorners(W, H))}
          className="flex-1 rounded-xl border border-white/30 py-3 text-sm font-medium text-white"
        >
          Reset kader
        </button>
        <button
          onClick={() => onConfirm(corners)}
          className="flex-[2] rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white"
        >
          Lees bord
        </button>
      </div>
    </div>
  );
}

function defaultCorners(w: number, h: number): Corner[] {
  const side = Math.min(w, h) * 0.9;
  const x0 = (w - side) / 2;
  const y0 = (h - side) / 2;
  return [
    { x: x0, y: y0 },
    { x: x0 + side, y: y0 },
    { x: x0 + side, y: y0 + side },
    { x: x0, y: y0 + side },
  ];
}
