import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getOptions } from "@/lib/options";
import { Alert } from "@/components/ui/Alert";
import { PlaceForm } from "./PlaceForm";
import { adminDeletePlaceAction } from "@/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Plekken · Beheer" };
export const dynamic = "force-dynamic";

export default async function AdminPlacesPage({ searchParams }: { searchParams: Promise<{ ok?: string; fout?: string; bewerk?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: places }, options] = await Promise.all([supabase.from("places").select("*").order("sort_order").order("name"), getOptions()]);
  const editing = (places ?? []).find((p) => p.id === sp.bewerk) ?? null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Warme Babbelplekken &amp; luisterlijn</h1>
      <p className="max-w-2xl text-brand-ink-soft">Inloophuizen, praatcafés en de luisterlijn worden op de startpagina getoond. Vroeger waren dit nepgebruikers; nu zijn het aparte plekken.</p>
      {sp.ok && <Alert tone="success">Opgeslagen.</Alert>}
      {sp.fout && <Alert tone="error">{sp.fout}</Alert>}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-card">
          <h2 className="text-lg">{editing ? `Bewerk: ${editing.name}` : "Nieuwe plek"}</h2>
          <PlaceForm key={editing?.id ?? "new"} place={editing} regions={options.region} />
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-card">
          <h2 className="text-lg">Bestaande plekken</h2>
          <ul className="mt-3 divide-y divide-brand-sand">
            {(places ?? []).length === 0 && <li className="py-3 text-sm text-brand-ink-muted">Nog geen plekken.</li>}
            {(places ?? []).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-semibold">{p.name} <Badge tone={p.is_published ? "green" : "neutral"}>{p.is_published ? "online" : "verborgen"}</Badge></p>
                  <p className="text-brand-ink-muted">{p.kind}{p.address ? ` · ${p.address.split("\n")[0]}` : ""}</p>
                </div>
                <div className="flex gap-2">
                  <a href={`/admin/plekken?bewerk=${p.id}`} className="font-semibold text-brand-red underline">Bewerk</a>
                  <form action={adminDeletePlaceAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <SubmitButton variant="ghost" size="sm">Verwijder</SubmitButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
