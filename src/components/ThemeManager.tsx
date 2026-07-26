'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/store';

/**
 * Past de donkere modus toe op <html> en registreert de service worker (PWA).
 */
export function ThemeManager() {
  const darkMode = useGameStore((s) => s.settings.darkMode);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* offline-ondersteuning is optioneel */
      });
    }
  }, []);

  return null;
}
