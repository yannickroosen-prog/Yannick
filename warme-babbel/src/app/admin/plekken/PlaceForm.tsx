import type { PlaceRow, ProfileOptionRow } from "@/lib/database.types";
import { adminSavePlaceAction } from "@/actions/admin";
import { Field, Input, Select, Textarea, Checkbox } from "@/components/ui/Field";
import { SubmitButton } from "@/components/SubmitButton";

export function PlaceForm({ place, regions }: { place: PlaceRow | null; regions: ProfileOptionRow[] }) {
  return (
    <form action={adminSavePlaceAction} className="mt-3 space-y-3">
      {place && <input type="hidden" name="id" value={place.id} />}
      <Field label="Naam" name="name" required><Input id="name" name="name" defaultValue={place?.name ?? ""} required maxLength={120} /></Field>
      <Field label="Soort" name="kind" required>
        <Select id="kind" name="kind" defaultValue={place?.kind ?? "inloophuis"}>
          <option value="inloophuis">Inloophuis</option>
          <option value="babbelplek">Warme Babbelplek / praatcafé</option>
          <option value="luisterlijn">Luisterlijn</option>
          <option value="andere">Andere</option>
        </Select>
      </Field>
      <Field label="Omschrijving" name="description"><Textarea id="description" name="description" defaultValue={place?.description ?? ""} rows={3} maxLength={3000} className="min-h-20" /></Field>
      <Field label="Adres" name="address"><Textarea id="address" name="address" defaultValue={place?.address ?? ""} rows={2} maxLength={300} className="min-h-16" /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Telefoon" name="phone"><Input id="phone" name="phone" defaultValue={place?.phone ?? ""} maxLength={40} /></Field>
        <Field label="E-mail" name="email"><Input id="email" name="email" type="email" defaultValue={place?.email ?? ""} maxLength={120} /></Field>
      </div>
      <Field label="Openingsuren" name="opening_hours" hint="Eén regel per dag."><Textarea id="opening_hours" name="opening_hours" defaultValue={place?.opening_hours ?? ""} rows={4} maxLength={1000} className="min-h-24" /></Field>
      <fieldset>
        <legend className="text-sm font-semibold">Regio&apos;s</legend>
        <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
          {regions.map((r) => (
            <label key={r.slug} className="flex min-h-10 items-center gap-2 text-sm">
              <input type="checkbox" name="regions" value={r.slug} defaultChecked={place?.regions.includes(r.slug)} className="form-checkbox h-4 w-4 rounded border-brand-sand text-brand-orange" /> {r.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Volgorde" name="sort_order"><Input id="sort_order" name="sort_order" type="number" defaultValue={place?.sort_order ?? 0} /></Field>
        <Checkbox name="is_published" defaultChecked={place?.is_published ?? false} label="Tonen op de startpagina" />
      </div>
      <SubmitButton>{place ? "Wijzigingen opslaan" : "Plek toevoegen"}</SubmitButton>
    </form>
  );
}
