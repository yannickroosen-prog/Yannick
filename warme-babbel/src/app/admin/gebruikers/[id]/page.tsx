import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOptions, labelsFor, ACCOUNT_STATUS_LABELS, LISTING_STATUS_LABELS, ROLE_LABELS, REPORT_STATUS_LABELS } from "@/lib/options";
import { signAvatarUrl } from "@/lib/avatars";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Select, Textarea, Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { adminAddNoteAction, adminSetAccountStatusAction, adminSetListingStatusAction, adminSetRoleAction } from "@/actions/admin";
import { formatDateTime } from "@/lib/utils";
import type { Json } from "@/lib/database.types";

export const metadata: Metadata = { title: "Gebruiker · Beheer" };
export const dynamic = "force-dynamic";

function details(d: Json): string {
  if (!d || typeof d !== "object" || Array.isArray(d)) return "";
  const o = d as Record<string, Json | undefined>;
  const parts: string[] = [];
  if (o.from !== undefined || o.to !== undefined) parts.push(`${o.from ?? "?"} → ${o.to ?? "?"}`);
  if (o.note) parts.push(String(o.note));
  if (o.notes) parts.push(String(o.notes));
  return parts.join(" · ");
}

export default async function AdminUserPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; fout?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: profile }, options] = await Promise.all([supabase.from("profiles").select("*").eq("id", id).maybeSingle(), getOptions()]);
  if (!profile) notFound();

  const [{ data: events }, { data: reportsAbout }, { data: reportsBy }, { data: prefs }, avatarUrl, { count: convCount }] = await Promise.all([
    supabase.from("moderation_events").select("*").eq("target_user_id", id).order("created_at", { ascending: false }).limit(50),
    supabase.from("reports").select("id, category, status, created_at").eq("target_user_id", id).order("created_at", { ascending: false }),
    supabase.from("reports").select("id, category, status, created_at").eq("reporter_id", id).order("created_at", { ascending: false }),
    supabase.from("profile_preferences").select("*").eq("user_id", id).maybeSingle(),
    signAvatarUrl(profile.avatar_path),
    supabase.from("conversation_members").select("conversation_id", { count: "exact", head: true }).eq("user_id", id),
  ]);

  let email: string | null = null;
  let lastSignIn: string | null = null;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { data } = await createAdminClient().auth.admin.getUserById(id);
      email = data.user?.email ?? null;
      lastSignIn = data.user?.last_sign_in_at ?? null;
    } catch {
      /* geen service key: e-mail niet beschikbaar */
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/gebruikers" className="text-sm font-semibold text-brand-ink-soft hover:text-brand-red">← Alle gebruikers</Link>
      {sp.ok && <Alert tone="success">Wijziging opgeslagen.</Alert>}
      {sp.fout && <Alert tone="error">{sp.fout}</Alert>}

      <div className="flex flex-wrap items-center gap-4 rounded-3xl bg-white p-6 shadow-card">
        <Avatar src={avatarUrl} name={profile.display_name} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl">{profile.display_name}</h1>
          <p className="text-sm text-brand-ink-muted">{email ?? "e-mail niet beschikbaar (geen service key)"} · laatst ingelogd {lastSignIn ? formatDateTime(lastSignIn) : "—"}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone="ink">{ROLE_LABELS[profile.role]}</Badge>
            <Badge tone={profile.account_status === "active" ? "green" : "red"}>{ACCOUNT_STATUS_LABELS[profile.account_status]}</Badge>
            {profile.role === "listener" && <Badge tone={profile.listing_status === "approved" ? "green" : "orange"}>{LISTING_STATUS_LABELS[profile.listing_status]}</Badge>}
            {profile.is_hidden && <Badge tone="neutral">Verborgen</Badge>}
            {!profile.is_available && <Badge tone="neutral">Niet beschikbaar</Badge>}
          </div>
        </div>
        <Link href={`/profiel/${profile.id}`} className="text-sm font-semibold text-brand-red underline">Profiel bekijken</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 rounded-3xl bg-white p-5 shadow-card lg:col-span-2" aria-labelledby="prof">
          <h2 id="prof" className="text-lg">Profielgegevens</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-brand-ink-muted">Regio</dt><dd>{labelsFor(options, "region", profile.regions).join(", ") || "—"}</dd></div>
            <div><dt className="text-brand-ink-muted">Thema&apos;s</dt><dd>{labelsFor(options, "theme", profile.themes).join(", ") || "—"}</dd></div>
            <div><dt className="text-brand-ink-muted">Band</dt><dd>{labelsFor(options, "relation", profile.relations).join(", ") || "—"}</dd></div>
            <div><dt className="text-brand-ink-muted">Contactwijze</dt><dd>{labelsFor(options, "contact_method", profile.contact_methods).join(", ") || "—"}</dd></div>
            <div><dt className="text-brand-ink-muted">Leeftijd / geslacht</dt><dd>{[profile.age_group && labelsFor(options, "age_group", [profile.age_group])[0], profile.gender && labelsFor(options, "gender", [profile.gender])[0]].filter(Boolean).join(" · ") || "—"}</dd></div>
            <div><dt className="text-brand-ink-muted">Gesprekken</dt><dd>{convCount ?? 0}</dd></div>
            <div><dt className="text-brand-ink-muted">Aangemaakt</dt><dd>{formatDateTime(profile.created_at)}</dd></div>
            <div><dt className="text-brand-ink-muted">E-mailmeldingen</dt><dd>{prefs?.email_on_message ? "aan" : "uit"}</dd></div>
          </dl>
          <div>
            <h3 className="text-sm font-semibold text-brand-ink-muted">Verhaal</h3>
            <p className="prose-story mt-1 text-sm">{profile.story || "—"}</p>
          </div>
        </section>

        <section className="space-y-5 rounded-3xl bg-white p-5 shadow-card" aria-labelledby="acties">
          <h2 id="acties" className="text-lg">Acties</h2>
          <form action={adminSetRoleAction} className="space-y-2">
            <input type="hidden" name="userId" value={profile.id} />
            <label className="block text-sm font-semibold">Rol
              <Select name="role" defaultValue={profile.role} className="mt-1">
                {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </label>
            <Input name="note" placeholder="Notitie (optioneel)" maxLength={500} />
            <SubmitButton size="sm" variant="outline">Rol opslaan</SubmitButton>
          </form>
          {profile.role === "listener" && (
            <form action={adminSetListingStatusAction} className="space-y-2">
              <input type="hidden" name="userId" value={profile.id} />
              <label className="block text-sm font-semibold">Zichtbaar in lijst
                <Select name="status" defaultValue={profile.listing_status} className="mt-1">
                  {Object.entries(LISTING_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </Select>
              </label>
              <Input name="note" placeholder="Notitie (optioneel)" maxLength={500} />
              <SubmitButton size="sm" variant="outline">Lijststatus opslaan</SubmitButton>
            </form>
          )}
          <form action={adminSetAccountStatusAction} className="space-y-2">
            <input type="hidden" name="userId" value={profile.id} />
            <label className="block text-sm font-semibold">Accountstatus
              <Select name="status" defaultValue={profile.account_status} className="mt-1">
                {Object.entries(ACCOUNT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </label>
            <Input name="note" placeholder="Reden (wordt aan de gebruiker gemaild)" maxLength={500} />
            <SubmitButton size="sm" variant="danger">Status opslaan</SubmitButton>
          </form>
          <form action={adminAddNoteAction} className="space-y-2">
            <input type="hidden" name="userId" value={profile.id} />
            <label className="block text-sm font-semibold">Moderatienotitie
              <Textarea name="note" rows={3} maxLength={2000} className="mt-1 min-h-20" />
            </label>
            <SubmitButton size="sm" variant="ghost">Notitie toevoegen</SubmitButton>
          </form>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-5 shadow-card" aria-labelledby="log">
          <h2 id="log" className="text-lg">Moderatielog</h2>
          {(events ?? []).length === 0 ? <p className="mt-2 text-sm text-brand-ink-muted">Nog geen gebeurtenissen.</p> : (
            <ul className="mt-2 divide-y divide-brand-sand text-sm">
              {(events ?? []).map((e) => (
                <li key={e.id} className="py-2">
                  <p><span className="font-semibold">{e.action}</span> <span className="text-brand-ink-muted">· {formatDateTime(e.created_at)}</span></p>
                  {details(e.details) && <p className="text-brand-ink-soft">{details(e.details)}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-3xl bg-white p-5 shadow-card" aria-labelledby="rep">
          <h2 id="rep" className="text-lg">Meldingen</h2>
          <h3 className="mt-2 text-sm font-semibold text-brand-ink-muted">Over deze gebruiker ({reportsAbout?.length ?? 0})</h3>
          <ul className="divide-y divide-brand-sand text-sm">
            {(reportsAbout ?? []).map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2">
                <Link href={`/admin/rapporteringen/${r.id}`} className="font-semibold text-brand-red underline">{r.category.replace("_", " ")}</Link>
                <Badge tone={r.status === "open" ? "red" : r.status === "in_behandeling" ? "orange" : "neutral"}>{REPORT_STATUS_LABELS[r.status]}</Badge>
              </li>
            ))}
          </ul>
          <h3 className="mt-4 text-sm font-semibold text-brand-ink-muted">Door deze gebruiker ({reportsBy?.length ?? 0})</h3>
          <ul className="divide-y divide-brand-sand text-sm">
            {(reportsBy ?? []).map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2">
                <Link href={`/admin/rapporteringen/${r.id}`} className="font-semibold text-brand-red underline">{r.category.replace("_", " ")}</Link>
                <Badge tone="neutral">{REPORT_STATUS_LABELS[r.status]}</Badge>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
