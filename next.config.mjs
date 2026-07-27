/** @type {import('next').NextConfig} */

// Basis-pad voor hosting onder een submap (bv. GitHub Pages: /Yannick).
// Leeg voor hosting op de root (bv. Netlify). Gezet via NEXT_PUBLIC_BASE_PATH.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  reactStrictMode: true,
  // Volledig client-side app -> statische export (out/-map met index.html).
  output: 'export',
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  // Beschikbaar maken voor de client (fetch van model/woordenlijst/sw).
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
