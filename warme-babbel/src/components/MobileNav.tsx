"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { me: { name: string; isAdmin: boolean } | null; unread: number };

export function MobileNav({ me, unread }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const item = "block rounded-2xl px-4 py-3 text-lg font-semibold text-brand-ink hover:bg-brand-beige";

  return (
    <div className="md:hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Menu sluiten" : "Menu openen"} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-brand-ink hover:bg-brand-beige">
        {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
      </button>
      <div id="mobile-menu" hidden={!open} className={cn("absolute inset-x-0 top-16 border-b border-brand-sand bg-brand-cream p-3 shadow-card", !open && "hidden")}>
        <nav aria-label="Mobiele navigatie" className="space-y-1">
          <Link href="/" className={item}>Home</Link>
          <Link href="/profielen" className={item}>Warme Babbelaars</Link>
          {me ? (
            <>
              <Link href="/chat" className={item}>
                Gesprekken {unread > 0 && <span className="ml-2 rounded-full bg-brand-red px-2 py-0.5 text-xs text-white">{unread}</span>}
              </Link>
              <Link href="/meldingen" className={item}>Meldingen</Link>
              <Link href="/mijn-profiel" className={item}>Mijn profiel</Link>
              <Link href="/instellingen" className={item}>Instellingen</Link>
              {me.isAdmin && <Link href="/admin" className={cn(item, "text-brand-red")}>Beheer</Link>}
              <form action="/auth/uitloggen" method="post">
                <button type="submit" className={cn(item, "w-full text-left text-brand-ink-soft")}>Uitloggen</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/inloggen" className={item}>Inloggen</Link>
              <Link href="/registreren" className={item}>Registreren</Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
