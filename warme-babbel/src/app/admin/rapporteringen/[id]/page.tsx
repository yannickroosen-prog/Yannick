import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { REPORT_CATEGORIES, REPORT_STATUS_LABELS } from "@/lib/options";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Select, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { adminUpdateReportAction } from "@/actions/admin";
import { formatDateTime, cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Melding · Beheer" };
export const dynamic = "force-dynamic";

export default async function AdminReportPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; fout?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: r } = await supabase.from("reports").select("*").eq("id", id).maybeSingle();
  if (!r) notFound();

  const ids = [r.reporter_id, r.target_user_id, r.handled_by].filter((x): x is string => !!x);
  const [{ data: profiles }, { data: messages }, { data: targetMessage }] = await Promise.all([
    ids.length ? supabase.from("profiles").select("id, display_name, role, account_status").in("id", ids) : Promise.resolve({ data: [] }),
    r.target_conversation_id ? supabase.from("messages").select("*").eq("conversation_id", r.target_conversation_id).order("id", { ascending: false }).limit(60) : Promise.resolve({ data: [] }),
    r.target_message_id ? supabase.from("messages").select("*").eq("id", r.target_message_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const who = (uid: string | null) => profiles?.find((p) => p.id === uid);
  const cat = REPORT_CATEGORIES.find((x) => x.value === r.category)?.label ?? r.category;
  const thread = (messages ?? []).slice().reverse();

  return (
    <div className="space-y-6">
      <Link href="/admin/rapporteringen" className="text-sm font-semibold text-brand-ink-soft hover:text-brand-red">← Alle meldingen</Link>
      {sp.ok && <Alert tone="success">Melding bijgewerkt.</Alert>}
      {sp.fout && <Alert tone="error">{sp.fout}</Alert>}
      <div className="rounded-3xl bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl">Melding: {cat}</h1>
          <Badge tone={r.status === "open" ? "red" : r.status === "in_behandeling" ? "orange" : "neutral"}>{REPORT_STATUS_LABELS[r.status]}</Badge>
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-brand-ink-muted">Gemeld door</dt><dd>{r.reporter_id ? <Link href={`/admin/gebruikers/${r.reporter_id}`} className="font-semibold text-brand-red underline">{who(r.reporter_id)?.display_name ?? "onbekend"}</Link> : "verwijderde gebruiker"}</dd></div>
          <div><dt className="text-brand-ink-muted">Over</dt><dd>{r.target_user_id ? <Link href={`/admin/gebruikers/${r.target_user_id}`} className="font-semibold text-brand-red underline">{who(r.target_user_id)?.display_name ?? "onbekend"}</Link> : "—"}</dd></div>
          <div><dt className="text-brand-ink-muted">Datum</dt><dd>{formatDateTime(r.created_at)}</dd></div>
          <div><dt className="text-brand-ink-muted">Behandeld door</dt><dd>{r.handled_by ? `${who(r.handled_by)?.display_name ?? "beheerder"} · ${formatDateTime(r.handled_at)}` : "—"}</dd></div>
        </dl>
        <div className="mt-4">
          <h2 className="text-sm font-semibold text-brand-ink-muted">Toelichting van de melder</h2>
          <p className="prose-story mt-1 text-sm">{r.description || "—"}</p>
        </div>
        {targetMessage && (
          <div className="mt-4 rounded-2xl border border-brand-red/30 bg-red-50 p-4 text-sm">
            <h2 className="font-semibold text-brand-red">Gemeld bericht</h2>
            <p className="mt-1 whitespace-pre-wrap">{targetMessage.body}</p>
            <p className="mt-1 text-xs text-brand-ink-muted">{who(targetMessage.sender_id)?.display_name ?? "onbekend"} · {formatDateTime(targetMessage.created_at)}</p>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="rounded-3xl bg-white p-6 shadow-card" aria-labelledby="gesprek">
          <h2 id="gesprek" className="text-lg">Gesprek (laatste 60 berichten)</h2>
          {thread.length === 0 ? (
            <p className="mt-2 text-sm text-brand-ink-muted">{r.target_conversation_id ? "Geen berichten." : "Deze melding gaat niet over een gesprek."}</p>
          ) : (
            <ol className="mt-3 space-y-2">
              {thread.map((m) => {
                const flagged = m.id === r.target_message_id;
                const sender = who(m.sender_id);
                return (
                  <li key={m.id} className={cn("rounded-2xl px-4 py-2 text-sm", flagged ? "border border-brand-red bg-red-50" : "bg-brand-cream")}>
                    <p className="text-xs font-semibold text-brand-ink-muted">{sender?.display_name ?? "verwijderde gebruiker"} · {formatDateTime(m.created_at)}</p>
                    <p className={cn("mt-0.5 whitespace-pre-wrap", m.deleted_at && "italic text-brand-ink-muted")}>{m.deleted_at ? "[verwijderd] " : ""}{m.body}</p>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-card" aria-labelledby="behandel">
          <h2 id="behandel" className="text-lg">Behandelen</h2>
          <form action={adminUpdateReportAction} className="mt-3 space-y-3">
            <input type="hidden" name="reportId" value={r.id} />
            <label className="block text-sm font-semibold">Status
              <Select name="status" defaultValue={r.status} className="mt-1">
                {Object.entries(REPORT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </label>
            <label className="block text-sm font-semibold">Interne notities
              <Textarea name="notes" defaultValue={r.admin_notes ?? ""} rows={6} maxLength={4000} className="mt-1" />
            </label>
            <SubmitButton className="w-full">Opslaan</SubmitButton>
          </form>
          {r.target_user_id && (
            <p className="mt-4 text-sm text-brand-ink-soft">
              Schorsen of blokkeren doe je op de <Link href={`/admin/gebruikers/${r.target_user_id}`} className="font-semibold text-brand-red underline">gebruikerspagina</Link>.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
