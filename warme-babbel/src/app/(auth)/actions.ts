"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { forgotSchema, loginSchema, registerSchema, resetPasswordSchema, zodErrors, type FieldErrors } from "@/lib/validation";
import { siteUrl } from "@/lib/site";
import { safeNext } from "@/lib/utils";

export type AuthState = { errors?: FieldErrors; message?: string; ok?: boolean; values?: Record<string, string> };

function values(fd: FormData, keys: string[]) {
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = String(fd.get(k) ?? "");
  return out;
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = registerSchema.safeParse(raw);
  const keep = values(formData, ["displayName", "email"]);
  if (!parsed.success) return { errors: zodErrors(parsed.error), values: keep };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: siteUrl("/auth/callback?next=/mijn-profiel?welkom=1"),
      data: { display_name: parsed.data.displayName, accepted_privacy: true },
    },
  });
  if (error) {
    const msg =
      error.code === "user_already_exists" || /already registered/i.test(error.message)
        ? "Er bestaat al een account met dit e-mailadres. Probeer in te loggen of vraag een nieuw wachtwoord aan."
        : error.code === "weak_password"
          ? "Dit wachtwoord is te zwak of te bekend. Kies een langer, unieker wachtwoord."
          : error.code === "over_email_send_rate_limit"
            ? "Er werden al veel e-mails gestuurd. Wacht even en probeer opnieuw."
            : "Registreren is niet gelukt. Probeer het later opnieuw.";
    return { errors: { form: msg }, values: keep };
  }
  redirect(`/registreren?verstuurd=1&email=${encodeURIComponent(parsed.data.email)}`);
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
  const keep = values(formData, ["email"]);
  if (!parsed.success) return { errors: zodErrors(parsed.error), values: keep };
  const next = safeNext(String(formData.get("next") ?? ""));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error) {
    const msg =
      error.code === "email_not_confirmed"
        ? "Bevestig eerst je e-mailadres via de link in je mailbox (kijk ook bij ongewenste e-mail)."
        : error.code === "invalid_credentials"
          ? "E-mailadres of wachtwoord klopt niet."
          : "Inloggen is niet gelukt. Probeer het opnieuw.";
    return { errors: { form: msg }, values: keep };
  }
  redirect(next);
}

export async function forgotPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = forgotSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { errors: zodErrors(parsed.error) };
  const supabase = await createClient();
  // Altijd hetzelfde antwoord, ongeacht of het adres bestaat (geen account-enumeratie).
  await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: siteUrl("/auth/callback?next=/wachtwoord-herstellen") });
  return { ok: true, message: "Als dit e-mailadres bij ons bekend is, ontvang je zo een e-mail met een link om een nieuw wachtwoord te kiezen." };
}

export async function resetPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { errors: zodErrors(parsed.error) };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { errors: { form: "Deze link is verlopen of al gebruikt. Vraag een nieuwe aan." } };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { errors: { form: error.code === "same_password" ? "Kies een ander wachtwoord dan je huidige." : "Wachtwoord opslaan is niet gelukt. Probeer opnieuw." } };
  }
  redirect("/profielen?wachtwoord=gewijzigd");
}

export async function resendConfirmationAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = forgotSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { errors: zodErrors(parsed.error) };
  const supabase = await createClient();
  await supabase.auth.resend({ type: "signup", email: parsed.data.email, options: { emailRedirectTo: siteUrl("/auth/callback?next=/mijn-profiel?welkom=1") } });
  return { ok: true, message: "We hebben de bevestigingsmail opnieuw verstuurd (als het adres bekend is en nog niet bevestigd was)." };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
