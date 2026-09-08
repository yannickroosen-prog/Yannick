import type { NextConfig } from "next";

/**
 * Domeinen die de app in een iframe mogen tonen (overgangsfase met WordPress).
 * Uitbreidbaar via env FRAME_ANCESTORS (spatie-gescheiden).
 */
const frameAncestors = [
  "'self'",
  "https://warmebabbel.be",
  "https://www.warmebabbel.be",
  ...(process.env.FRAME_ANCESTORS?.split(/\s+/).filter(Boolean) ?? []),
].join(" ");

const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
      : undefined;
  } catch {
    return undefined;
  }
})();

const csp = [
  "default-src 'self'",
  // Next.js heeft inline scripts nodig voor hydration; geen externe scripts.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co${supabaseHost ? ` https://${supabaseHost} wss://${supabaseHost}` : ""}`,
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  `frame-ancestors ${frameAncestors}`,
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Profielen en chat mogen nooit door zoekmachines geïndexeerd worden; de landingspagina overschrijft dit via metadata.
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Monorepo-map: voorkom dat Next de bovenliggende lockfile als root neemt.
  outputFileTracingRoot: __dirname,
  experimental: {
    // Profielfoto's (max 5 MB) gaan via een Server Action
    serverActions: { bodySizeLimit: "6mb" },
  },
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/**" }]
      : [],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        // Landingspagina en profielenlijst mogen wél geïndexeerd worden (niet de individuele profielen).
        source: "/",
        headers: [{ key: "X-Robots-Tag", value: "index, follow" }],
      },
      {
        source: "/embed.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/brand/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
