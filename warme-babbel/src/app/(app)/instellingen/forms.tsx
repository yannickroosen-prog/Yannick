"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { changePasswordAction, updatePreferencesAction, type SettingsState } from "@/actions/settings";
import { Field, Input, Checkbox } from "@/components/ui/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

export function PasswordForm() {
  const [state, action] = useActionState<SettingsState, FormData>(changePasswordAction, {});
  return (
    <form action={action} className="mt-4 space-y-4" noValidate>
      {state.errors?.form && <Alert tone="error">{state.errors.form}</Alert>}
      {state.ok && <Alert tone="success">{state.message}</Alert>}
      <Field label="Huidig wachtwoord" name="currentPassword" required error={state.errors?.currentPassword}>
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required invalid={!!state.errors?.currentPassword} />
      </Field>
      <Field label="Nieuw wachtwoord" name="password" required error={state.errors?.password} hint="Minstens 10 tekens.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} invalid={!!state.errors?.password} />
      </Field>
      <Field label="Herhaal nieuw wachtwoord" name="passwordConfirm" required error={state.errors?.passwordConfirm}>
        <Input id="passwordConfirm" name="passwordConfirm" type="password" autoComplete="new-password" required invalid={!!state.errors?.passwordConfirm} />
      </Field>
      <SubmitButton pendingText="Opslaan…">Wachtwoord wijzigen</SubmitButton>
    </form>
  );
}

export function PreferencesForm({ emailOnMessage, emailOnSystem }: { emailOnMessage: boolean; emailOnSystem: boolean }) {
  const [state, action] = useActionState<SettingsState, FormData>(updatePreferencesAction, {});
  return (
    <form action={action} className="mt-3 space-y-2">
      {state.errors?.form && <Alert tone="error">{state.errors.form}</Alert>}
      {state.ok && <Alert tone="success">{state.message}</Alert>}
      <Checkbox name="emailOnMessage" defaultChecked={emailOnMessage} label="E-mail bij een nieuw bericht" description="Maximaal één e-mail per gesprek per kwartier, enkel als je het gesprek niet open hebt." />
      <Checkbox name="emailOnSystem" defaultChecked={emailOnSystem} label="E-mail bij belangrijke accountmeldingen" description="Bijvoorbeeld wanneer je profiel als Warme Babbelaar is goedgekeurd." />
      <div className="pt-2">
        <SubmitButton size="sm" pendingText="Opslaan…">Voorkeuren opslaan</SubmitButton>
      </div>
    </form>
  );
}

export function DeleteAccountForm() {
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const ready = confirmText.trim().toUpperCase() === "VERWIJDER";

  const submit = async () => {
    if (!ready || !confirm("Ben je zeker? Je account wordt definitief verwijderd.")) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/account/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: "VERWIJDER" }) });
    if (res.ok) {
      router.replace("/?account=verwijderd");
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Verwijderen is niet gelukt. Probeer later opnieuw of mail naar info@similes.be.");
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      {error && <Alert tone="error">{error}</Alert>}
      <Field label='Typ "VERWIJDER" om te bevestigen' name="confirmDelete">
        <Input id="confirmDelete" name="confirmDelete" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" />
      </Field>
      <Button variant="danger" disabled={!ready || busy} onClick={submit}>
        {busy ? "Verwijderen…" : "Mijn account definitief verwijderen"}
      </Button>
    </div>
  );
}
