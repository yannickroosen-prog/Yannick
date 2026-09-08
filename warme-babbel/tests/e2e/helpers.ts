import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Page } from "@playwright/test";

/**
 * Hulpfuncties voor e2e-tests tegen een echt Supabase-project.
 * Testaccounts worden aangemaakt met de service role (e-mail bevestigd), zodat de tests
 * geen mailbox nodig hebben. Ze worden na afloop weer verwijderd.
 */
export function adminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY zijn vereist voor e2e-tests.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export type TestUser = { id: string; email: string; password: string; name: string };

export async function createTestUser(admin: SupabaseClient, name: string, opts?: { role?: "seeker" | "listener" | "admin"; approved?: boolean }): Promise<TestUser> {
  const email = `e2e-${name.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
  const password = `E2E-wachtwoord-${Math.random().toString(36).slice(2)}!`;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { display_name: name, accepted_privacy: true } });
  if (error || !data.user) throw error ?? new Error("createUser mislukt");
  const id = data.user.id;
  if (opts?.role && opts.role !== "seeker") {
    const { error: e } = await admin.from("profiles").update({ role: opts.role, listing_status: opts.approved ? "approved" : "pending", story: `Ik ben ${name}. Ik luister graag naar jouw verhaal.`, regions: ["brussel"], themes: ["allerlei"], relations: ["ouder"], contact_methods: ["telefoon", "ontmoeting"] }).eq("id", id);
    if (e) throw e;
  }
  return { id, email, password, name };
}

export async function deleteTestUser(admin: SupabaseClient, id: string) {
  await admin.auth.admin.deleteUser(id).catch(() => {});
}

export async function login(page: Page, user: TestUser, next?: string) {
  await page.goto(`/inloggen${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  await page.getByLabel("E-mailadres").fill(user.email);
  await page.getByLabel("Wachtwoord", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Inloggen" }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/inloggen"));
}
