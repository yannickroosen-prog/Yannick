import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MapPin, MessageCircleHeart, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getOptions, labelFor, labelsFor, KIND_LABELS } from "@/lib/options";
import { signAvatarUrl } from "@/lib/avatars";
import { PageShell } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { ButtonLink } from "@/components/ui/Button";
import { SubmitButton } from "@/components/SubmitButton";
import { ReportDialog } from "@/components/ReportDialog";
import { BlockButton } from "@/components/BlockButton";
import { startConversationAction } from "@/actions/chat";

export const metadata: Metadata = { title: "Profiel", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ProfilePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ fout?: string }> }) {
  const { id } = await params;
  const { fout } = await searchParams;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const [me, options, { data: profile }] = await Promise.all([getCurrentUser(), getOptions(), supabase.from("profiles").select("*").eq("id", id).maybeSingle()]);
  // RLS: alleen zichtbare profielen komen terug. Onzichtbaar → 404 (geen hint over bestaan).
  if (!profile) notFound();

  const isSelf = me?.id === profile.id;
  const anonymous = !me;
  const avatarUrl = anonymous && !profile.show_photo_public ? null : await signAvatarUrl(profile.avatar_path, anonymous);
  const isListedListener = profile.role === "listener" && profile.listing_status === "approved" && !profile.is_hidden;

  let blocked = false;
  if (me && !isSelf) {
    const { data } = await supabase.from("blocks").select("blocked_id").eq("blocker_id", me.id).eq("blocked_id", profile.id).maybeSingle();
    blocked = !!data;
  }

  const rows: { label: string; values: string[] }[] = [
    { label: KIND_LABELS.region, values: labelsFor(options, "region", profile.regions) },
    { label: KIND_LABELS.theme, values: labelsFor(options, "theme", profile.themes) },
    { label: KIND_LABELS.relation, values: labelsFor(options, "relation", profile.relations) },
    { label: KIND_LABELS.contact_method, values: labelsFor(options, "contact_method", profile.contact_methods) },
    { label: KIND_LABELS.age_group, values: profile.age_group ? [labelFor(options, "age_group", profile.age_group)] : [] },
    { label: KIND_LABELS.gender, values: profile.gender ? [labelFor(options, "gender", profile.gender)] : [] },
  ].filter((r) => r.values.length > 0);

  return (
    <PageShell className="max-w-4xl">
      <Link href="/profielen" className="text-sm font-semibold text-brand-ink-soft hover:text-brand-red">← Alle Warme Babbelaars</Link>
      {fout && <Alert tone="error" className="mt-4">{fout}</Alert>}
      <article className="mt-4 overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="h-24 bg-gradient-to-r from-brand-red via-brand-orange to-brand-orange-soft sm:h-32" aria-hidden="true" />
        <div className="px-6 pb-8 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar src={avatarUrl} name={profile.display_name} size="xl" className="ring-4" />
              <div className="pb-1">
                <h1 className="text-3xl">{profile.display_name}</h1>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {profile.role === "listener" && <Badge tone="orange">Warme Babbelaar</Badge>}
                  {profile.role === "listener" && (profile.is_available ? <Badge tone="green">Beschikbaar</Badge> : <Badge tone="neutral"><Clock className="h-3 w-3" aria-hidden="true" /> Even niet beschikbaar</Badge>)}
                  {profile.walk_in && <Badge tone="neutral">Zonder afspraak</Badge>}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isSelf ? (
                <ButtonLink href="/mijn-profiel" variant="outline">
                  <Pencil className="h-4 w-4" aria-hidden="true" /> Profiel bewerken
                </ButtonLink>
              ) : me ? (
                <>
                  {(isListedListener || me.profile.role !== "seeker") && !blocked && (
                    <form action={startConversationAction}>
                      <input type="hidden" name="userId" value={profile.id} />
                      <SubmitButton size="lg" pendingText="Gesprek openen…">
                        <MessageCircleHeart className="h-5 w-5" aria-hidden="true" /> Stuur een bericht
                      </SubmitButton>
                    </form>
                  )}
                  <ReportDialog targetUserId={profile.id} compact />
                  <BlockButton userId={profile.id} name={profile.display_name} blocked={blocked} returnTo={`/profiel/${profile.id}`} compact />
                </>
              ) : (
                <ButtonLink href={`/inloggen?next=${encodeURIComponent(`/profiel/${profile.id}`)}`} size="lg">
                  <MessageCircleHeart className="h-5 w-5" aria-hidden="true" /> Log in om een bericht te sturen
                </ButtonLink>
              )}
            </div>
          </div>

          {!me && (
            <p className="mt-4 text-sm text-brand-ink-muted">
              Nog geen account? <Link href="/registreren" className="font-semibold text-brand-red underline">Registreer gratis</Link> – het duurt maar een minuutje.
            </p>
          )}
          {!profile.is_available && profile.role === "listener" && !isSelf && (
            <Alert tone="warning" className="mt-4">
              {profile.display_name} is even niet beschikbaar. Je kan wel een bericht sturen, maar het antwoord kan wat langer duren. Bekijk gerust ook andere Warme Babbelaars.
            </Alert>
          )}

          <div className="mt-8 grid gap-8 md:grid-cols-[1fr_16rem]">
            <section aria-labelledby="verhaal">
              <h2 id="verhaal" className="text-xl">Mijn verhaal</h2>
              {profile.story ? (
                <p className="prose-story mt-3">{profile.story}</p>
              ) : (
                <p className="mt-3 text-brand-ink-muted">{profile.display_name} heeft nog geen verhaal toegevoegd.</p>
              )}
            </section>
            <aside className="space-y-4 rounded-2xl bg-brand-cream p-5">
              {rows.length === 0 && <p className="text-sm text-brand-ink-muted">Geen extra informatie.</p>}
              {rows.map((r) => (
                <div key={r.label}>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-brand-ink-muted">{r.label}</h3>
                  <ul className="mt-1 flex flex-wrap gap-1.5">
                    {r.values.map((v) => (
                      <li key={v} className="chip bg-white">
                        {r.label === KIND_LABELS.region && <MapPin className="h-3.5 w-3.5 text-brand-orange" aria-hidden="true" />}
                        {v}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
