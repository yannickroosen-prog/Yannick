"use client";

import { useActionState } from "react";
import { resendConfirmationAction, type AuthState } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Alert } from "@/components/ui/Alert";

export function ResendForm({ email }: { email: string }) {
  const [state, action] = useActionState<AuthState, FormData>(resendConfirmationAction, {});
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="email" value={email} />
      {state.message && <Alert tone="info">{state.message}</Alert>}
      <SubmitButton variant="outline" size="sm" pendingText="Versturen…">
        E-mail opnieuw versturen
      </SubmitButton>
    </form>
  );
}
