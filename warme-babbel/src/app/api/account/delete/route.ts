import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Verwijdert het eigen account definitief.
 * 1. anonymize_own_profile() (als de gebruiker zelf, RLS) – berichten worden "verwijderd".
 * 2. auth.admin.deleteUser (service role) – cascade verwijdert profiel, voorkeuren, lidmaatschappen, blokkades.
 * 3. Eigen avatarbestanden opruimen.
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  if (body?.confirm !== "VERWIJDER") return NextResponse.json({ error: "Bevestiging ontbreekt." }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: "Accountverwijdering is nog niet geconfigureerd. Mail naar info@similes.be." }, { status: 503 });

  const { error: anonErr } = await supabase.rpc("anonymize_own_profile");
  if (anonErr) return NextResponse.json({ error: "Verwijderen is niet gelukt." }, { status: 500 });

  const admin = createAdminClient();
  const { data: files } = await admin.storage.from("avatars").list(user.id);
  if (files?.length) await admin.storage.from("avatars").remove(files.map((f) => `${user.id}/${f.name}`));
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: "Verwijderen is niet gelukt." }, { status: 500 });

  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
