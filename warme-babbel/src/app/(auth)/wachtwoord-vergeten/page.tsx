import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "./ForgotForm";

export const metadata: Metadata = { title: "Wachtwoord vergeten" };

export default function ForgotPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl">Wachtwoord vergeten?</h1>
        <p className="mt-1 text-brand-ink-soft">Geen zorgen. Vul je e-mailadres in en we sturen je een link om een nieuw wachtwoord te kiezen.</p>
      </div>
      <ForgotForm />
      <p className="text-sm text-brand-ink-soft">
        <Link href="/inloggen" className="font-semibold text-brand-red underline">Terug naar inloggen</Link>
      </p>
    </div>
  );
}
