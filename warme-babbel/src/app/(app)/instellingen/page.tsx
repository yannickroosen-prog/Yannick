import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageShell, PageTitle } from "@/components/ui/Card";
import { PasswordForm, PreferencesForm, DeleteAccountForm } from "./forms";
import { BlockButton } from "@/components/BlockButton";
import { ROLE_LABELS } from "@/lib/options";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Instellingen" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const me = await requireUser("/instellingen");
  const supabase = await createClient();
  const [{ data: prefs }, { data: blocks }] = await Promise.all([
    supabase.from("profile_preferences").select("*").eq("user_id", me.id).maybeSingle(),
    supabase.from("blocks").select("blocked_id, created_at").eq("blocker_id", me.id),
  ]);
  const blockedIds = (blocks ?? []).map((b) => b.blocked_id);
  const { data: blockedProfiles } = blockedIds.length ? await supabase.from("profiles").select("id, display_name").in("id", blockedIds) : { data: [] };

  return (
    <PageShell className="max-w-3xl">
      <PageTitle title="Instellingen" />
      <div className="space-y-8">
        <section className="rounded-3xl bg-white p-6 shadow-card" aria-labelledby="account">
          <h2 id="account" className="text-xl">Account</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-brand-ink-muted">E-mailadres</dt><dd className="font-semibold">{me.email}</dd></div>
            <div><dt className="text-brand-ink-muted">Rol</dt><dd className="font-semibold">{ROLE_LABELS[me.profile.role]}</dd></div>
            <div><dt className="text-brand-ink-muted">Lid sinds</dt><dd className="font-semibold">{formatDate(me.profile.created_at)}</dd></div>
            <div><dt className="text-brand-ink-muted">Privacybeleid aanvaard</dt><dd className="font-semibold">{prefs?.accepted_privacy_at ? formatDate(prefs.accepted_privacy_at) : "—"}</dd></div>
          </dl>
          <p className="mt-3 text-sm text-brand-ink-soft">Je profiel bewerk je via <Link href="/mijn-profiel" className="font-semibold text-brand-red underline">Mijn profiel</Link>.</p>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-card" aria-labelledby="meldingen">
          <h2 id="meldingen" className="text-xl">E-mailmeldingen</h2>
          <PreferencesForm emailOnMessage={prefs?.email_on_message ?? true} emailOnSystem={prefs?.email_on_system ?? true} />
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-card" aria-labelledby="wachtwoord">
          <h2 id="wachtwoord" className="text-xl">Wachtwoord wijzigen</h2>
          <PasswordForm />
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-card" aria-labelledby="blokkades">
          <h2 id="blokkades" className="text-xl">Geblokkeerde gebruikers</h2>
          {(blockedProfiles ?? []).length === 0 ? (
            <p className="mt-2 text-sm text-brand-ink-soft">Je hebt niemand geblokkeerd.</p>
          ) : (
            <ul className="mt-3 divide-y divide-brand-sand">
              {(blockedProfiles ?? []).map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <span className="font-semibold">{p.display_name}</span>
                  <BlockButton userId={p.id} name={p.display_name} blocked returnTo="/instellingen" compact />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-brand-red/30 bg-white p-6 shadow-card" aria-labelledby="verwijderen">
          <h2 id="verwijderen" className="text-xl text-brand-red">Account verwijderen</h2>
          <p className="mt-2 text-sm text-brand-ink-soft">
            Je profiel, foto, voorkeuren en meldingen worden definitief verwijderd. Berichten die je stuurde worden voor de andere persoon vervangen door &ldquo;bericht verwijderd&rdquo;. Dit kan niet ongedaan gemaakt worden.
          </p>
          <DeleteAccountForm />
        </section>
      </div>
    </PageShell>
  );
}
