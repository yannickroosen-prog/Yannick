import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { Alert } from "@/components/ui/Alert";
import { safeNext } from "@/lib/utils";

export const metadata: Metadata = { title: "Inloggen" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; bevestigd?: string; fout?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl">Welkom terug</h1>
        <p className="mt-1 text-brand-ink-soft">Log in om je gesprekken te bekijken of een Warme Babbelaar te contacteren.</p>
      </div>
      {sp.bevestigd === "1" && <Alert tone="success">Je e-mailadres is bevestigd. Je kan nu inloggen.</Alert>}
      {sp.fout === "link" && <Alert tone="error">Deze link is ongeldig of verlopen. Vraag een nieuwe aan.</Alert>}
      <LoginForm next={safeNext(sp.next)} />
      <div className="flex flex-col gap-2 text-sm text-brand-ink-soft sm:flex-row sm:justify-between">
        <Link href="/wachtwoord-vergeten" className="font-semibold text-brand-red underline">Wachtwoord vergeten?</Link>
        <span>
          Nog geen account? <Link href="/registreren" className="font-semibold text-brand-red underline">Registreren</Link>
        </span>
      </div>
    </div>
  );
}
