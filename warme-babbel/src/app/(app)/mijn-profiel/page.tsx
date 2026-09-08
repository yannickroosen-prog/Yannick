import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getOptions } from "@/lib/options";
import { signAvatarUrl } from "@/lib/avatars";
import { PageShell, PageTitle } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { ProfileForm } from "./ProfileForm";
import { AvatarForm } from "./AvatarForm";
import { LISTING_STATUS_LABELS } from "@/lib/options";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Mijn profiel" };
export const dynamic = "force-dynamic";

export default async function MyProfilePage({ searchParams }: { searchParams: Promise<{ welkom?: string }> }) {
  const [me, options, sp] = await Promise.all([requireUser("/mijn-profiel"), getOptions(), searchParams]);
  const avatarUrl = await signAvatarUrl(me.profile.avatar_path);
  const isListener = me.profile.role === "listener";

  return (
    <PageShell className="max-w-3xl">
      <PageTitle
        title="Mijn profiel"
        intro={isListener ? "Zo zien babbelzoekers jou. Een warm, eerlijk verhaal helpt mensen om de stap te zetten." : "Je profiel is enkel zichtbaar voor de Warme Babbelaars met wie je een gesprek hebt en voor Similes. Alles is optioneel."}
        actions={<Link href={`/profiel/${me.id}`} className="text-sm font-semibold text-brand-red underline">Bekijk als bezoeker</Link>}
      />
      {sp.welkom === "1" && (
        <Alert tone="success" title="Welkom bij Warme Babbel!" className="mb-6">
          Je account is actief. Vul gerust je profiel aan, of ga meteen naar de <Link href="/profielen" className="font-semibold underline">Warme Babbelaars</Link>.
        </Alert>
      )}
      {isListener && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-card">
          <span className="text-sm font-semibold">Status als Warme Babbelaar:</span>
          <Badge tone={me.profile.listing_status === "approved" ? "green" : me.profile.listing_status === "pending" ? "orange" : "red"}>{LISTING_STATUS_LABELS[me.profile.listing_status]}</Badge>
          {me.profile.listing_status === "pending" && <span className="text-sm text-brand-ink-muted">Een beheerder van Similes bekijkt je profiel en zet het daarna online.</span>}
        </div>
      )}
      <div className="space-y-8">
        <AvatarForm avatarUrl={avatarUrl} name={me.profile.display_name} />
        <ProfileForm profile={me.profile} options={options} />
      </div>
    </PageShell>
  );
}
