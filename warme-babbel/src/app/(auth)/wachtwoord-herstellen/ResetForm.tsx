"use client";

import { useActionState } from "react";
import { resetPasswordAction, type AuthState } from "../actions";
import { Field, Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormMessage";

export function ResetForm() {
  const [state, action] = useActionState<AuthState, FormData>(resetPasswordAction, {});
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormError message={state.errors?.form} />
      <Field label="Nieuw wachtwoord" name="password" required error={state.errors?.password} hint="Minstens 10 tekens.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} invalid={!!state.errors?.password} />
      </Field>
      <Field label="Herhaal je nieuwe wachtwoord" name="passwordConfirm" required error={state.errors?.passwordConfirm}>
        <Input id="passwordConfirm" name="passwordConfirm" type="password" autoComplete="new-password" required invalid={!!state.errors?.passwordConfirm} />
      </Field>
      <SubmitButton size="lg" className="w-full" pendingText="Opslaan…">
        Wachtwoord opslaan
      </SubmitButton>
    </form>
  );
}
