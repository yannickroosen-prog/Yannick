import { NextResponse, type NextRequest } from "next/server";
import { Webhook } from "standardwebhooks";
import { sendEmail } from "@/lib/email/send";
import { confirmSignupEmail, emailChangeEmail, magicLinkEmail, reauthenticationEmail, resetPasswordEmail } from "@/emails/templates";
import { siteUrl } from "@/lib/site";
import { safeNext } from "@/lib/utils";

/**
 * Supabase Auth "Send Email" hook → Resend met eigen templates.
 * Configureer in Supabase: Authentication > Hooks > Send Email > HTTPS, URL = <app>/api/hooks/auth-email,
 * en zet het gegenereerde secret in SUPABASE_AUTH_HOOK_SECRET (formaat v1,whsec_…).
 */
export const dynamic = "force-dynamic";

type HookPayload = {
  user: { id: string; email: string; user_metadata?: { display_name?: string } };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: "signup" | "recovery" | "invite" | "magiclink" | "email_change" | "email_change_current" | "email_change_new" | "reauthentication";
    site_url: string;
    token_new?: string;
    token_hash_new?: string;
    new_email?: string;
  };
};

function nextFromRedirect(redirectTo: string | undefined, fallback: string) {
  try {
    if (!redirectTo) return fallback;
    const u = new URL(redirectTo);
    return safeNext(u.searchParams.get("next") ?? u.pathname + u.search, fallback);
  } catch {
    return fallback;
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.SUPABASE_AUTH_HOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Hook niet geconfigureerd" }, { status: 500 });

  const payloadText = await request.text();
  const headers = {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
  };
  let payload: HookPayload;
  try {
    const wh = new Webhook(secret.replace(/^v1,whsec_/, "").replace(/^whsec_/, ""));
    payload = wh.verify(payloadText, headers) as HookPayload;
  } catch {
    return NextResponse.json({ error: "Ongeldige handtekening" }, { status: 401 });
  }

  const { user, email_data: d } = payload;
  const name = user.user_metadata?.display_name ?? "";
  const confirm = (type: string, tokenHash: string, next: string) => siteUrl(`/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=${type}&next=${encodeURIComponent(next)}`);

  let mail: { subject: string; html: string; text: string } | null = null;
  let to = user.email;

  switch (d.email_action_type) {
    case "signup":
      mail = confirmSignupEmail({ name, url: confirm("signup", d.token_hash, nextFromRedirect(d.redirect_to, "/mijn-profiel?welkom=1")) });
      break;
    case "recovery":
      mail = resetPasswordEmail({ name, url: confirm("recovery", d.token_hash, "/wachtwoord-herstellen") });
      break;
    case "magiclink":
      mail = magicLinkEmail({ name, url: confirm("magiclink", d.token_hash, nextFromRedirect(d.redirect_to, "/profielen")) });
      break;
    case "invite":
      mail = confirmSignupEmail({ name, url: confirm("invite", d.token_hash, "/mijn-profiel?welkom=1") });
      break;
    case "email_change":
    case "email_change_new":
      to = d.new_email ?? user.email;
      mail = emailChangeEmail({ name, newEmail: d.new_email ?? "", url: confirm("email_change", d.token_hash_new ?? d.token_hash, "/instellingen") });
      break;
    case "email_change_current":
      mail = emailChangeEmail({ name, newEmail: d.new_email ?? "", url: confirm("email_change", d.token_hash, "/instellingen") });
      break;
    case "reauthentication":
      mail = reauthenticationEmail({ code: d.token });
      break;
  }
  if (!mail) return NextResponse.json({ error: "Onbekend e-mailtype" }, { status: 400 });

  const result = await sendEmail({ to, ...mail });
  if (!result.ok) {
    return NextResponse.json({ error: { http_code: 500, message: "E-mail versturen mislukt" } }, { status: 500 });
  }
  return NextResponse.json({});
}
