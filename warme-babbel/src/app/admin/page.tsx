import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { AdminStats } from "@/lib/database.types";
import { REPORT_STATUS_LABELS, ROLE_LABELS } from "@/lib/options";
import { formatRelative } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Beheer" };
export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const supabase = await createClient();
  const [{ data: statsRaw }, { data: pending }, { data: reports }, { data: recent }] = await Promise.all([
    supabase.rpc("admin_stats"),
    supabase.from("profiles").select("id, display_name, created_at").eq("role", "listener").eq("listing_status", "pending").order("created_at"),
    supabase.from("reports").select("id, category, status, created_at").in("status", ["open", "in_behandeling"]).order("created_at", { ascending: false }).limit(8),
    supabase.from("profiles").select("id, display_name, role, created_at").order("created_at", { ascending: false }).limit(8),
  ]);
  const s = (statsRaw ?? {}) as unknown as Partial<AdminStats>;
  const tiles: { label: string; value: number | undefined; sub?: string }[] = [
    { label: "Gebruikers", value: s.users_total, sub: `${s.new_users_30d ?? 0} nieuw in 30 dagen` },
    { label: "Warme Babbelaars online", value: s.listeners_listed, sub: `${s.listeners_pending ?? 0} wachten op goedkeuring` },
    { label: "Babbelzoekers", value: s.seekers },
    { label: "Gesprekken", value: s.conversations, sub: `${s.conversations_7d ?? 0} deze week` },
    { label: "Berichten", value: s.messages, sub: `${s.messages_7d ?? 0} deze week` },
    { label: "Open meldingen", value: s.reports_open, sub: `${s.reports_total ?? 0} in totaal` },
    { label: "Geschorst/geblokkeerd", value: s.suspended },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl">Overzicht</h1>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.label} className="rounded-2xl bg-white p-4 shadow-card">
            <p className="text-sm text-brand-ink-muted">{t.label}</p>
            <p className="mt-1 font-heading text-3xl font-extrabold text-brand-ink">{t.value ?? "–"}</p>
            {t.sub && <p className="text-xs text-brand-ink-muted">{t.sub}</p>}
          </li>
        ))}
      </ul>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-3xl bg-white p-5 shadow-card" aria-labelledby="pending">
          <h2 id="pending" className="text-lg">Wachten op goedkeuring</h2>
          {(pending ?? []).length === 0 ? (
            <p className="mt-2 text-sm text-brand-ink-muted">Geen babbelaars in de wachtrij.</p>
          ) : (
            <ul className="mt-2 divide-y divide-brand-sand text-sm">
              {(pending ?? []).map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <Link href={`/admin/gebruikers/${p.id}`} className="font-semibold text-brand-red underline">{p.display_name}</Link>
                  <span className="text-brand-ink-muted">{formatRelative(p.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-3xl bg-white p-5 shadow-card" aria-labelledby="reports">
          <h2 id="reports" className="text-lg">Openstaande meldingen</h2>
          {(reports ?? []).length === 0 ? (
            <p className="mt-2 text-sm text-brand-ink-muted">Alles is behandeld. 🎉</p>
          ) : (
            <ul className="mt-2 divide-y divide-brand-sand text-sm">
              {(reports ?? []).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 py-2">
                  <Link href={`/admin/rapporteringen/${r.id}`} className="font-semibold text-brand-red underline">{r.category.replace("_", " ")}</Link>
                  <Badge tone={r.status === "open" ? "red" : "orange"}>{REPORT_STATUS_LABELS[r.status]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-3xl bg-white p-5 shadow-card" aria-labelledby="recent">
          <h2 id="recent" className="text-lg">Nieuwe gebruikers</h2>
          <ul className="mt-2 divide-y divide-brand-sand text-sm">
            {(recent ?? []).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 py-2">
                <Link href={`/admin/gebruikers/${p.id}`} className="font-semibold text-brand-red underline">{p.display_name}</Link>
                <span className="text-brand-ink-muted">{ROLE_LABELS[p.role]} · {formatRelative(p.created_at)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
