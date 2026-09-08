import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { REPORT_CATEGORIES, REPORT_STATUS_LABELS } from "@/lib/options";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Meldingen · Beheer" };
export const dynamic = "force-dynamic";

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "open" } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(100);
  if (status === "open") query = query.in("status", ["open", "in_behandeling"]);
  else if (status !== "alle") query = query.eq("status", status as "afgehandeld");
  const { data } = await query;
  const rows = data ?? [];
  const ids = Array.from(new Set(rows.flatMap((r) => [r.reporter_id, r.target_user_id]).filter((x): x is string => !!x)));
  const { data: profiles } = ids.length ? await supabase.from("profiles").select("id, display_name").in("id", ids) : { data: [] };
  const name = (id: string | null) => profiles?.find((p) => p.id === id)?.display_name ?? (id ? "onbekend" : "—");
  const cat = (c: string) => REPORT_CATEGORIES.find((x) => x.value === c)?.label ?? c;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Meldingen</h1>
      <nav className="flex flex-wrap gap-2" aria-label="Filter op status">
        {[["open", "Open"], ["afgehandeld", "Afgehandeld"], ["afgewezen", "Afgewezen"], ["alle", "Alle"]].map(([k, v]) => (
          <Link key={k} href={`/admin/rapporteringen?status=${k}`} className={cn(buttonClasses(status === k ? "primary" : "outline", "sm"))} aria-current={status === k ? "page" : undefined}>{v}</Link>
        ))}
      </nav>
      <div className="overflow-x-auto rounded-3xl bg-white shadow-card">
        <table className="w-full min-w-[44rem] text-sm">
          <thead className="bg-brand-beige text-left text-xs uppercase tracking-wide text-brand-ink-muted">
            <tr><th className="px-4 py-3">Categorie</th><th className="px-4 py-3">Over</th><th className="px-4 py-3">Gemeld door</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Datum</th></tr>
          </thead>
          <tbody className="divide-y divide-brand-sand">
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-brand-ink-muted">Geen meldingen.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-brand-cream">
                <td className="px-4 py-3"><Link href={`/admin/rapporteringen/${r.id}`} className="font-semibold text-brand-red underline">{cat(r.category)}</Link>
                  <span className="ml-1 text-xs text-brand-ink-muted">{r.target_message_id ? "bericht" : r.target_conversation_id ? "gesprek" : "profiel"}</span></td>
                <td className="px-4 py-3">{name(r.target_user_id)}</td>
                <td className="px-4 py-3">{name(r.reporter_id)}</td>
                <td className="px-4 py-3"><Badge tone={r.status === "open" ? "red" : r.status === "in_behandeling" ? "orange" : "neutral"}>{REPORT_STATUS_LABELS[r.status]}</Badge></td>
                <td className="px-4 py-3 text-brand-ink-muted">{formatDateTime(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
