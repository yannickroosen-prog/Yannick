import type { Metadata, Viewport } from "next";
import { Nunito, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { isEmbedded } from "@/lib/embed";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EmbedBridge } from "@/components/EmbedBridge";
import { cn } from "@/lib/utils";

const heading = Nunito({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-heading", display: "swap" });
const body = Source_Sans_3({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Warme Babbel", template: "%s · Warme Babbel" },
  description: "Een warme babbel met iemand die het ook meemaakte. Voor en door families van mensen met psychische problemen. Een initiatief van Similes vzw.",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf9f4",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [embedded, me] = await Promise.all([isEmbedded(), getCurrentUser()]);
  return (
    <html lang="nl" className={cn(heading.variable, body.variable, embedded && "embed")}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-brand-ink focus:px-4 focus:py-2 focus:text-white">
          Naar de inhoud
        </a>
        {!embedded && <Header me={me} />}
        <main id="main" className="flex-1">
          {children}
        </main>
        {!embedded && <Footer />}
        {embedded && <EmbedBridge />}
      </body>
    </html>
  );
}
