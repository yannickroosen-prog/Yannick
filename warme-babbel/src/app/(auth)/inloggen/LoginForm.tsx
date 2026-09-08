"use client";

import { useActionState } from "react";
import { loginAction, type AuthState } from "../actions";
import { Field, Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormMessage";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState<AuthState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormError message={state.errors?.form} />
      <Field label="E-mailadres" name="email" required error={state.errors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required defaultValue={state.values?.email} invalid={!!state.errors?.email} />
      </Field>
      <Field label="Wachtwoord" name="password" required error={state.errors?.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required invalid={!!state.errors?.password} />
      </Field>
      <SubmitButton size="lg" className="w-full" pendingText="Inloggen…">
        Inloggen
      </SubmitButton>
    </form>
  );
}
