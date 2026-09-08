"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type AuthState } from "../actions";
import { Field, Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormMessage";
import { Alert } from "@/components/ui/Alert";

export function ForgotForm() {
  const [state, action] = useActionState<AuthState, FormData>(forgotPasswordAction, {});
  if (state.ok) return <Alert tone="success" title="E-mail verstuurd">{state.message}</Alert>;
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormError message={state.errors?.form} />
      <Field label="E-mailadres" name="email" required error={state.errors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required invalid={!!state.errors?.email} />
      </Field>
      <SubmitButton size="lg" className="w-full" pendingText="Versturen…">
        Stuur mij een link
      </SubmitButton>
    </form>
  );
}
