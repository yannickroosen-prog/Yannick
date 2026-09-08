import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import type { ProfileRow } from "@/lib/database.types";
import type { OptionMap } from "@/lib/constants";
import { labelsFor } from "@/lib/constants";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { truncate } from "@/lib/utils";

const CONTACT_ICONS: Record<string, string> = { ontmoeting: "🤝", telefoon: "📞", videocall: "🎥", email: "✉️", "similes-activiteit": "🗓️" };

export function ProfileCard({ profile, avatarUrl, options }: { profile: ProfileRow; avatarUrl: string | null; options: OptionMap }) {
  const regions = labelsFor(options, "region", profile.regions);
  const themes = labelsFor(options, "theme", profile.themes);
  const relations = labelsFor(options, "relation", profile.relations);
  return (
    <article className="group flex h-full flex-col rounded-3xl bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-brand-orange">
      <div className="flex items-start gap-4">
        <Avatar src={avatarUrl} name={profile.display_name} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="text-xl leading-tight">
            <Link href={`/profiel/${profile.id}`} className="outline-none after:absolute after:inset-0 after:rounded-3xl after:content-['']">
              {profile.display_name}
            </Link>
          </h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {profile.is_available ? <Badge tone="green">Beschikbaar</Badge> : <Badge tone="orange"><Clock className="h-3 w-3" aria-hidden="true" /> Even niet beschikbaar</Badge>}
            {profile.walk_in && <Badge tone="neutral">Zonder afspraak</Badge>}
          </div>
        </div>
      </div>
      {regions.length > 0 && (
        <p className="mt-3 flex items-start gap-1.5 text-sm text-brand-ink-soft">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" aria-hidden="true" />
          <span>{regions.join(" · ")}</span>
        </p>
      )}
      {profile.story && <p className="mt-3 line-clamp-4 text-[0.95rem] leading-relaxed text-brand-ink-soft">{truncate(profile.story, 260)}</p>}
      <div className="mt-auto space-y-2 pt-4">
        {(relations.length > 0 || themes.length > 0) && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Ervaring">
            {relations.slice(0, 3).map((r) => (
              <li key={r} className="chip">{r}</li>
            ))}
            {themes.slice(0, 4).map((t) => (
              <li key={t} className="chip bg-brand-orange-soft text-brand-orange-dark">{t}</li>
            ))}
            {themes.length > 4 && <li className="chip">+{themes.length - 4}</li>}
          </ul>
        )}
        {profile.contact_methods.length > 0 && (
          <p className="text-sm text-brand-ink-muted" aria-label="Contactwijze">
            {profile.contact_methods.map((c) => `${CONTACT_ICONS[c] ?? ""} ${labelsFor(options, "contact_method", [c])[0]}`).join("  ")}
          </p>
        )}
      </div>
    </article>
  );
}
