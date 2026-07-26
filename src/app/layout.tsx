import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeManager } from '@/components/ThemeManager';

export const metadata: Metadata = {
  title: 'Scrabble Vision Scorekeeper',
  description:
    'Scan met je smartphonecamera een Scrabble-bord en bereken automatisch de score.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Scrabble Vision',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f766e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body>
        <ThemeManager />
        {children}
      </body>
    </html>
  );
}
