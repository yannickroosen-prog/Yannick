"use client";

import { useActionState } from "react";
import { registerAction, type AuthState } from "../actions";
import { Field, Input, Checkbox } from "@/components/ui/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormMessage";
import { legacyUrl } from "@/lib/site";

export function RegisterForm() {
  const [state, action] = useActionState<AuthState, FormData>(registerAction, {});
  const privacy = legacyUrl("/privacybeleid/") ?? "#";
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormError message={state.errors?.form} />
      <Field label="Hoe mogen we je noemen?" name="displayName" required error={state.errors?.displayName} hint="Je voornaam of een schuilnaam. Dit is de naam die Warme Babbelaars zien.">
        <Input id="displayName" name="displayName" autoComplete="nickname" required maxLength={40} defaultValue={state.values?.displayName} invalid={!!state.errors?.displayName} />
      </Field>
      <Field label="E-mailadres" name="email" required error={state.errors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required defaultValue={state.values?.email} invalid={!!state.errors?.email} />
      </Field>
      <Field label="Wachtwoord" name="password" required error={state.errors?.password} hint="Minstens 10 tekens. Een zin die je makkelijk onthoudt werkt goed.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} invalid={!!state.errors?.password} />
      </Field>
      <Field label="Herhaal je wachtwoord" name="passwordConfirm" required error={state.errors?.passwordConfirm}>
        <Input id="passwordConfirm" name="passwordConfirm" type="password" autoComplete="new-password" required invalid={!!state.errors?.passwordConfirm} />
      </Field>
      {/* Honeypot: onzichtbaar voor mensen */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <Checkbox
        name="acceptPrivacy"
        label="Ik ga akkoord met het privacybeleid"
        description={
          <>
            Lees het <a href={privacy} target="_blank" rel="noreferrer" className="underline">privacybeleid van Similes vzw</a>.
          </>
        }
      />
      {state.errors?.acceptPrivacy && <p role="alert" className="text-sm font-medium text-brand-red">{state.errors.acceptPrivacy}</p>}
      <SubmitButton size="lg" className="w-full" pendingText="Account aanmaken…">
        Account aanmaken
      </SubmitButton>
    </form>
  );
}
