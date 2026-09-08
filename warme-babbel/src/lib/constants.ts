import type { OptionKind, ProfileOptionRow } from "@/lib/database.types";

/** Pure constanten en hulpfuncties (client- én server-side bruikbaar). */
export type OptionMap = Record<OptionKind, ProfileOptionRow[]>;

export const KIND_LABELS: Record<OptionKind, string> = {
  region: "Regio",
  theme: "Thema",
  relation: "Band",
  contact_method: "Contactwijze",
  age_group: "Leeftijd",
  gender: "Geslacht",
};

export function labelFor(options: OptionMap, kind: OptionKind, slug: string | null | undefined): string {
  if (!slug) return "";
  return options[kind].find((o) => o.slug === slug)?.label ?? slug;
}

export function labelsFor(options: OptionMap, kind: OptionKind, slugs: string[] | null | undefined): string[] {
  return (slugs ?? []).map((s) => labelFor(options, kind, s));
}

export const REPORT_CATEGORIES: { value: "ongewenst_gedrag" | "spam" | "ongepaste_inhoud" | "intimidatie" | "andere"; label: string }[] = [
  { value: "ongewenst_gedrag", label: "Ongewenst gedrag" },
  { value: "spam", label: "Spam of reclame" },
  { value: "ongepaste_inhoud", label: "Ongepaste inhoud" },
  { value: "intimidatie", label: "Intimidatie of bedreiging" },
  { value: "andere", label: "Iets anders" },
];

export const REPORT_STATUS_LABELS = {
  open: "Open",
  in_behandeling: "In behandeling",
  afgehandeld: "Afgehandeld",
  afgewezen: "Afgewezen",
} as const;

export const ROLE_LABELS = { seeker: "Babbelzoeker", listener: "Warme Babbelaar", admin: "Beheerder" } as const;
export const ACCOUNT_STATUS_LABELS = { active: "Actief", suspended: "Geschorst", blocked: "Geblokkeerd" } as const;
export const LISTING_STATUS_LABELS = { pending: "Wacht op goedkeuring", approved: "Goedgekeurd", rejected: "Afgewezen" } as const;
