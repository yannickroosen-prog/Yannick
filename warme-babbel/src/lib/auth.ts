import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/database.types";

export type CurrentUser = {
  id: string;
  email: string | null;
  profile: ProfileRow;
};

/**
 * Ingelogde gebruiker + profiel (per request gecachet).
 * Geeft null als niet ingelogd. Gebruikt getUser() (server-side gevalideerd).
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) return null;
  return { id: user.id, email: user.email ?? null, profile };
});

/** Vereist login; geschorste accounts worden naar /geschorst gestuurd. */
export async function requireUser(next?: string): Promise<CurrentUser> {
  const me = await getCurrentUser();
  if (!me) redirect(`/inloggen${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  if (me.profile.account_status !== "active") redirect("/geschorst");
  return me;
}

/** Vereist admin-rol. Niet-admins krijgen een 404-achtige redirect (geen hint dat /admin bestaat). */
export async function requireAdmin(): Promise<CurrentUser> {
  const me = await requireUser("/admin");
  if (me.profile.role !== "admin") redirect("/profielen");
  return me;
}
