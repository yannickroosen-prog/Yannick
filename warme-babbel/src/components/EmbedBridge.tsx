"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Stuurt de documenthoogte naar de parent-pagina (iframe-integratie) en vraagt om naar boven te
 * scrollen bij navigatie. Werkt samen met public/embed.js. Enkel actief in embed-modus.
 */
export function EmbedBridge() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.parent === window) return;
    const post = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ source: "warme-babbel", type: "height", height }, "*");
    };
    post();
    const ro = new ResizeObserver(() => post());
    ro.observe(document.body);
    const interval = window.setInterval(post, 1500);
    return () => {
      ro.disconnect();
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (window.parent === window) return;
    window.parent.postMessage({ source: "warme-babbel", type: "scroll-top" }, "*");
  }, [pathname]);

  return null;
}
