import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";
import { Alert } from "@/components/ui/Alert";
import { ResendForm } from "./ResendForm";

export const metadata: Metadata = { title: "Registreren" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ verstuurd?: string; email?: string }> }) {
  const sp = await searchParams;
  if (sp.verstuurd === "1") {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl">Kijk in je mailbox</h1>
        <Alert tone="success" title="Bijna klaar!">
          We stuurden een e-mail naar <strong>{sp.email}</strong>. Klik op de link in die e-mail om je account te activeren. Kijk ook bij je ongewenste e-mail.
        </Alert>
        <ResendForm email={sp.email ?? ""} />
        <p className="text-sm text-brand-ink-soft">
          Al bevestigd? <Link href="/inloggen" className="font-semibold text-brand-red underline">Log in</Link>.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl">Maak een account</h1>
        <p className="mt-1 text-brand-ink-soft">Met een account kan je een Warme Babbelaar een privébericht sturen. Het is gratis en je gegevens blijven privé.</p>
      </div>
      <RegisterForm />
      <p className="text-sm text-brand-ink-soft">
        Heb je al een account? <Link href="/inloggen" className="font-semibold text-brand-red underline">Inloggen</Link>
      </p>
    </div>
  );
}
