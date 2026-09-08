import type { Metadata } from "next";
import Link from "next/link";
import { Bell } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageShell, PageTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelative, cn } from "@/lib/utils";
import { markAllReadAction } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

export const metadata: Metadata = { title: "Meldingen" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const me = await requireUser("/meldingen");
  const supabase = await createClient();
  const { data } = await supabase.from("notifications").select("*").eq("user_id", me.id).order("created_at", { ascending: false }).limit(50);
  const rows = data ?? [];
  const unread = rows.filter((r) => !r.read_at).length;

  return (
    <PageShell className="max-w-2xl">
      <PageTitle
        title="Meldingen"
        actions={
          unread > 0 ? (
            <form action={markAllReadAction}>
              <SubmitButton variant="ghost" size="sm">Alles als gelezen markeren</SubmitButton>
            </form>
          ) : undefined
        }
      />
      {rows.length === 0 ? (
        <EmptyState icon={<Bell className="h-6 w-6" aria-hidden="true" />} title="Geen meldingen">Hier verschijnen nieuwe berichten en belangrijke accountmeldingen.</EmptyState>
      ) : (
        <ul className="divide-y divide-brand-sand overflow-hidden rounded-3xl bg-white shadow-card">
          {rows.map((n) => {
            const inner = (
              <div className={cn("px-5 py-4", !n.read_at && "bg-brand-orange-soft/40")}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className={cn("font-heading", !n.read_at ? "font-extrabold" : "font-bold")}>{n.title}</p>
                  <time className="shrink-0 text-xs text-brand-ink-muted" dateTime={n.created_at}>{formatRelative(n.created_at)}</time>
                </div>
                {n.body && <p className="mt-1 text-sm text-brand-ink-soft">{n.body}</p>}
              </div>
            );
            return <li key={n.id}>{n.link ? <Link href={n.link} className="block hover:bg-brand-cream">{inner}</Link> : inner}</li>;
          })}
        </ul>
      )}
    </PageShell>
  );
}
