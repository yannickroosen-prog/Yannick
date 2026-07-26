/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Volledig client-side app -> statische export. Levert een `out/`-map met
  // index.html die als gewone statische site (ook offline/PWA) werkt.
  output: 'export',
  images: { unoptimized: true },
  // HTTP-headers (camera-permissie, sw-cache) worden bij statische export via
  // netlify.toml gezet i.p.v. next.config (headers() wordt daar niet toegepast).
};

export default nextConfig;
