import { Search, X } from "lucide-react";
import type { OptionMap } from "@/lib/constants";
import { Select, Input } from "@/components/ui/Field";
import { Button, ButtonLink } from "@/components/ui/Button";
import { AutoSubmit } from "@/components/AutoSubmit";

export type Filters = {
  q?: string;
  regio?: string;
  thema?: string;
  band?: string;
  contact?: string;
  leeftijd?: string;
  geslacht?: string;
  zonderAfspraak?: string;
};

export function FilterBar({ options, filters, action = "/profielen" }: { options: OptionMap; filters: Filters; action?: string }) {
  const hasFilters = Object.values(filters).some((v) => v && v.length > 0);
  const select = (name: keyof Filters, label: string, kind: keyof OptionMap) => (
    <label className="block text-sm font-semibold">
      <span className="mb-1 block">{label}</span>
      <Select name={name} defaultValue={filters[name] ?? ""} className="min-h-11 py-2">
        <option value="">Alle</option>
        {options[kind].map((o) => (
          <option key={o.slug} value={o.slug}>{o.label}</option>
        ))}
      </Select>
    </label>
  );
  return (
    <form method="get" action={action} className="rounded-3xl bg-white p-4 shadow-card sm:p-5" role="search" aria-label="Warme Babbelaars filteren">
      <AutoSubmit />
      <label className="block text-sm font-semibold">
        <span className="mb-1 block">Zoeken op naam of verhaal</span>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-ink-muted" aria-hidden="true" />
          <Input type="search" name="q" defaultValue={filters.q ?? ""} placeholder="Bv. autisme, mama, Gent…" className="pl-12" />
        </div>
      </label>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {select("regio", "Regio", "region")}
        {select("thema", "Thema", "theme")}
        {select("band", "Band", "relation")}
        {select("contact", "Contactwijze", "contact_method")}
        {select("leeftijd", "Leeftijd", "age_group")}
        {select("geslacht", "Geslacht", "gender")}
        <label className="flex items-end gap-2 pb-2 text-sm font-semibold">
          <input type="checkbox" name="zonderAfspraak" value="1" defaultChecked={filters.zonderAfspraak === "1"} className="form-checkbox h-5 w-5 rounded border-brand-sand text-brand-orange focus:ring-brand-orange" />
          Zonder afspraak
        </label>
        <div className="flex items-end gap-2">
          <Button type="submit" className="flex-1">Toon resultaten</Button>
          {hasFilters && (
            <ButtonLink href={action} variant="ghost" aria-label="Filters wissen">
              <X className="h-4 w-4" aria-hidden="true" /> Wis
            </ButtonLink>
          )}
        </div>
      </div>
    </form>
  );
}
