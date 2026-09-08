import type { Metadata } from "next";
import { Users } from "lucide-react";
import { getOptions } from "@/lib/options";
import { getCurrentUser } from "@/lib/auth";
import { searchListeners, PAGE_SIZE } from "@/lib/listeners";
import { signAvatarUrls } from "@/lib/avatars";
import { FilterBar, type Filters } from "@/components/FilterBar";
import { ProfileCard } from "@/components/ProfileCard";
import { Pagination } from "@/components/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageShell, PageTitle } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";

export const metadata: Metadata = {
  title: "Warme Babbelaars",
  description: "Ontdek onze Warme Babbelaars: ervaringsdeskundige vrijwilligers die naar jouw verhaal luisteren.",
  robots: { index: true, follow: true },
};

export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function ProfilesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const filters: Filters = {
    q: str(sp.q),
    regio: str(sp.regio),
    thema: str(sp.thema),
    band: str(sp.band),
    contact: str(sp.contact),
    leeftijd: str(sp.leeftijd),
    geslacht: str(sp.geslacht),
    zonderAfspraak: str(sp.zonderAfspraak),
  };
  const page = Math.max(1, parseInt(str(sp.page) || "1", 10) || 1);

  const [options, me, { rows, total }] = await Promise.all([getOptions(), getCurrentUser(), searchListeners(filters, page)]);
  const anonymous = !me;
  const avatarPaths = rows.filter((r) => !anonymous || r.show_photo_public).map((r) => r.avatar_path);
  const avatars = await signAvatarUrls(avatarPaths, anonymous);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const makeHref = (p: number) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/profielen${qs ? `?${qs}` : ""}`;
  };

  return (
    <PageShell>
      <PageTitle
        title="Onze Warme Babbelaars"
        intro="Snuister rustig door de profielen of gebruik de filters. Klik op een naam om het volledige verhaal te lezen en een gesprek te starten."
      />
      {str(sp.wachtwoord) === "gewijzigd" && <Alert tone="success" className="mb-4">Je wachtwoord is gewijzigd.</Alert>}
      <FilterBar options={options} filters={filters} />
      <p className="mt-6 text-sm text-brand-ink-muted" aria-live="polite">
        {total === 0 ? "Geen resultaten" : total === 1 ? "1 Warme Babbelaar" : `${total} Warme Babbelaars`}
      </p>
      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={<Users className="h-6 w-6" aria-hidden="true" />} title="Er zijn (nog) geen Warme Babbelaars die aan deze criteria voldoen.">
            Probeer minder filters, of kies een andere regio. Veel Warme Babbelaars zijn ook bereikbaar via telefoon of videocall.
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => (
            <li key={p.id} className="relative">
              <ProfileCard profile={p} avatarUrl={avatars.get(p.avatar_path ?? "") ?? null} options={options} />
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} totalPages={totalPages} makeHref={makeHref} />
    </PageShell>
  );
}
