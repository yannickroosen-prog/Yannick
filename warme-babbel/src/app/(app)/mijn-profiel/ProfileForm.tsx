"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileState } from "@/actions/profile";
import type { ProfileRow } from "@/lib/database.types";
import type { OptionMap } from "@/lib/constants";
import { KIND_LABELS } from "@/lib/constants";
import { Field, Input, Textarea, Select, Checkbox } from "@/components/ui/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { Alert } from "@/components/ui/Alert";

function CheckGroup({ name, legend, options, selected, hint }: { name: string; legend: string; options: { slug: string; label: string }[]; selected: string[]; hint?: string }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">{legend}</legend>
      {hint && <p className="mt-0.5 text-sm text-brand-ink-muted">{hint}</p>}
      <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
        {options.map((o) => (
          <label key={o.slug} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 hover:bg-brand-cream">
            <input type="checkbox" name={name} value={o.slug} defaultChecked={selected.includes(o.slug)} className="form-checkbox h-5 w-5 rounded border-brand-sand text-brand-orange focus:ring-brand-orange" />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ProfileForm({ profile, options }: { profile: ProfileRow; options: OptionMap }) {
  const [state, action] = useActionState<ProfileState, FormData>(updateProfileAction, {});
  const isListener = profile.role === "listener";

  return (
    <form action={action} className="space-y-8" noValidate>
      {state.errors?.form && <Alert tone="error">{state.errors.form}</Alert>}
      {state.ok && <Alert tone="success">{state.message}</Alert>}

      <section className="space-y-5 rounded-3xl bg-white p-6 shadow-card" aria-labelledby="basis">
        <h2 id="basis" className="text-xl">Over jou</h2>
        <Field label="Naam" name="displayName" required error={state.errors?.displayName} hint="Je voornaam of een schuilnaam.">
          <Input id="displayName" name="displayName" defaultValue={profile.display_name} maxLength={40} required invalid={!!state.errors?.displayName} />
        </Field>
        <Field label="Mijn verhaal" name="story" error={state.errors?.story} hint={isListener ? "Vertel wie je bent, wat je meemaakte en wat je kan bieden. Dit is wat mensen over de streep trekt." : "Kort iets over jezelf en je situatie. Helpt de Warme Babbelaar om je beter te begrijpen (optioneel)."}>
          <Textarea id="story" name="story" defaultValue={profile.story ?? ""} maxLength={3000} rows={8} invalid={!!state.errors?.story} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={KIND_LABELS.age_group} name="ageGroup">
            <Select id="ageGroup" name="ageGroup" defaultValue={profile.age_group ?? ""}>
              <option value="">Liever niet zeggen</option>
              {options.age_group.map((o) => (
                <option key={o.slug} value={o.slug}>{o.label}</option>
              ))}
            </Select>
          </Field>
          <Field label={KIND_LABELS.gender} name="gender">
            <Select id="gender" name="gender" defaultValue={profile.gender ?? ""}>
              <option value="">Liever niet zeggen</option>
              {options.gender.map((o) => (
                <option key={o.slug} value={o.slug}>{o.label}</option>
              ))}
            </Select>
          </Field>
        </div>
      </section>

      <section className="space-y-6 rounded-3xl bg-white p-6 shadow-card" aria-labelledby="ervaring">
        <h2 id="ervaring" className="text-xl">Ervaring en contact</h2>
        <CheckGroup name="relations" legend={`${KIND_LABELS.relation} (ik ben …)`} options={options.relation} selected={profile.relations} hint="Je band met de persoon met psychische problemen." />
        <CheckGroup name="themes" legend={KIND_LABELS.theme} options={options.theme} selected={profile.themes} hint="Thema's waar je ervaring mee hebt." />
        <CheckGroup name="regions" legend={KIND_LABELS.region} options={options.region} selected={profile.regions} />
        <CheckGroup name="contactMethods" legend={KIND_LABELS.contact_method} options={options.contact_method} selected={profile.contact_methods} hint={isListener ? "Hoe wil je gesprekken aanbieden?" : "Hoe heb je het liefst contact?"} />
      </section>

      <section className="space-y-2 rounded-3xl bg-white p-6 shadow-card" aria-labelledby="zichtbaar">
        <h2 id="zichtbaar" className="text-xl">Beschikbaarheid en privacy</h2>
        {isListener && (
          <>
            <Checkbox name="isAvailable" defaultChecked={profile.is_available} label="Ik ben beschikbaar voor nieuwe gesprekken" description="Zet dit uit als je even geen nieuwe babbels aankan. Je profiel blijft zichtbaar met de melding 'Even niet beschikbaar'." />
            <Checkbox name="isHidden" defaultChecked={profile.is_hidden} label="Verberg mijn profiel uit de lijst" description="Je profiel is dan onzichtbaar voor bezoekers. Lopende gesprekken blijven werken." />
            <Checkbox name="walkIn" defaultChecked={profile.walk_in} label="Zonder afspraak" description="Enkel voor plekken waar je zonder afspraak kan binnenlopen." />
            <Checkbox name="showPhotoPublic" defaultChecked={profile.show_photo_public} label="Toon mijn foto ook aan bezoekers die niet ingelogd zijn" description="Uitgeschakeld: enkel ingelogde gebruikers zien je foto." />
          </>
        )}
        {!isListener && (
          <>
            <input type="hidden" name="isAvailable" value="on" />
            <input type="hidden" name="showPhotoPublic" value="on" />
            <p className="text-sm text-brand-ink-soft">Je profiel is nooit zichtbaar voor andere bezoekers. Enkel de Warme Babbelaars die je contacteert en de beheerders van Similes kunnen het bekijken.</p>
          </>
        )}
      </section>

      <div className="flex justify-end">
        <SubmitButton size="lg" pendingText="Opslaan…">Profiel opslaan</SubmitButton>
      </div>
    </form>
  );
}
