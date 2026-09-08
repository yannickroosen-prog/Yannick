"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { changePasswordSchema, zodErrors, type FieldErrors } from "@/lib/validation";

export type SettingsState = { errors?: FieldErrors; ok?: boolean; message?: string };

export async function changePasswordAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { errors: zodErrors(parsed.error) };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { errors: { form: "Je bent niet ingelogd." } };

  // Huidig wachtwoord verifiëren vóór wijziging
  const { error: verifyErr } = await supabase.auth.signInWithPassword({ email: user.email, password: parsed.data.currentPassword });
  if (verifyErr) return { errors: { currentPassword: "Je huidige wachtwoord klopt niet." } };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { errors: { form: error.code === "same_password" ? "Kies een ander wachtwoord dan je huidige." : "Wachtwoord wijzigen is niet gelukt." } };
  return { ok: true, message: "Je wachtwoord is gewijzigd." };
}

export async function updatePreferencesAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { errors: { form: "Je bent niet ingelogd." } };
  const { error } = await supabase
    .from("profile_preferences")
    .upsert({ user_id: user.id, email_on_message: formData.get("emailOnMessage") === "on", email_on_system: formData.get("emailOnSystem") === "on" });
  if (error) return { errors: { form: "Opslaan is niet gelukt." } };
  revalidatePath("/instellingen");
  return { ok: true, message: "Je voorkeuren zijn opgeslagen." };
}
