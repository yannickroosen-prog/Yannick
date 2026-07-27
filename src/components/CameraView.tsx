'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Corner } from '@/lib/vision/boardDetection';

interface CameraViewProps {
  /** Aangeroepen met een stilstaand beeld (canvas) + de kaderhoeken bij scannen. */
  onCapture: (still: HTMLCanvasElement, guideCorners: Corner[]) => void;
  scanning: boolean;
  autoScan: boolean;
}

export function CameraView({ onCapture, scanning, autoScan }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch (e) {
        setError(
          'Kon de camera niet openen. Geef toestemming en gebruik HTTPS (of localhost).'
        );
      }
    }

    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /** Berekent de hoeken van het uitlijnkader in videopixel-coördinaten. */
  const guideCorners = useCallback((): Corner[] => {
    const video = videoRef.current;
    if (!video) return [];
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    // Vierkant kader, 88% van de kleinste dimensie, gecentreerd.
    const side = Math.min(vw, vh) * 0.88;
    const x0 = (vw - side) / 2;
    const y0 = (vh - side) / 2;
    return [
      { x: x0, y: y0 },
      { x: x0 + side, y: y0 },
      { x: x0 + side, y: y0 + side },
      { x: x0, y: y0 + side },
    ];
  }, []);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !ready) return;
    // Neem een stilstaand beeld op videoresolutie.
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture(canvas, guideCorners());
  }, [onCapture, ready, guideCorners]);

  // Automatische scanmodus: scan elke 4 seconden.
  useEffect(() => {
    if (!autoScan || !ready) return;
    const id = setInterval(() => {
      if (!scanning) handleCapture();
    }, 4000);
    return () => clearInterval(id);
  }, [autoScan, ready, scanning, handleCapture]);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        playsInline
        muted
        className="h-full w-full object-cover"
        style={{ aspectRatio: '3 / 4', maxHeight: '60vh' }}
      />

      {/* Uitlijnkader-overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative aspect-square w-[88%] max-w-[88vw]">
          <div className="absolute inset-0 rounded-lg border-2 border-white/80 shadow-[0_0_0_100vmax_rgba(0,0,0,0.35)]" />
          {/* Hoekmarkeringen */}
          {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map(
            (pos, i) => (
              <div
                key={i}
                className={`absolute h-6 w-6 border-emerald-400 ${pos} ${
                  pos.includes('top') ? 'border-t-4' : 'border-b-4'
                } ${pos.includes('left') ? 'border-l-4' : 'border-r-4'}`}
              />
            )
          )}
        </div>
      </div>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center text-sm text-white">
          {error}
        </div>
      )}

      {/* Scanknop */}
      <div className="safe-bottom absolute inset-x-0 bottom-0 flex items-center justify-center pb-4">
        <button
          onClick={handleCapture}
          disabled={!ready || scanning}
          className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-emerald-500 text-white shadow-lg transition active:scale-90 disabled:opacity-50"
          aria-label="Scan het bord"
        >
          {scanning ? (
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <span className="h-8 w-8 rounded-full bg-white/20" />
          )}
        </button>
      </div>

      {autoScan && (
        <div className="absolute left-3 top-3 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white">
          Auto-scan aan
        </div>
      )}
    </div>
  );
}
