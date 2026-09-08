import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = { title: "Nieuw wachtwoord" };

export default async function ResetPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/inloggen?fout=link");
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl">Kies een nieuw wachtwoord</h1>
        <p className="mt-1 text-brand-ink-soft">Voor het account met e-mailadres <strong>{user.email}</strong>.</p>
      </div>
      <ResetForm />
    </div>
  );
}
