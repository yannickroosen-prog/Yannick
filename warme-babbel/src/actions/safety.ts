"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { reportSchema } from "@/lib/validation";
import { REPORT_CATEGORIES } from "@/lib/options";
import { notifyAdminsOfReport } from "@/lib/email/notify";

export type SafetyState = { ok?: boolean; error?: string; message?: string };

export async function blockUserAction(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "/chat");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("blocks").insert({ blocker_id: user.id, blocked_id: userId }).select();
  revalidatePath(returnTo);
  revalidatePath("/instellingen");
}

export async function unblockUserAction(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "/instellingen");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("blocks").delete().eq("blocker_id", user.id).eq("blocked_id", userId);
  revalidatePath(returnTo);
  revalidatePath("/instellingen");
}

export async function reportAction(_prev: SafetyState, formData: FormData): Promise<SafetyState> {
  const raw = {
    category: formData.get("category"),
    description: formData.get("description") ?? "",
    targetUserId: formData.get("targetUserId") || undefined,
    targetConversationId: formData.get("targetConversationId") || undefined,
    targetMessageId: formData.get("targetMessageId") || undefined,
  };
  const parsed = reportSchema.safeParse(raw);
  if (!parsed.success) return { error: "Kies een categorie en probeer opnieuw." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Je bent niet ingelogd." };

  const { data, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: user.id,
      target_user_id: parsed.data.targetUserId ?? null,
      target_conversation_id: parsed.data.targetConversationId ?? null,
      target_message_id: parsed.data.targetMessageId ?? null,
      category: parsed.data.category,
      description: parsed.data.description || null,
    })
    .select("id")
    .single();
  if (error) {
    return { error: /veel meldingen/.test(error.message) ? error.message : "Melding versturen is niet gelukt. Probeer opnieuw of mail naar info@similes.be." };
  }
  const label = REPORT_CATEGORIES.find((c) => c.value === parsed.data.category)?.label ?? parsed.data.category;
  try {
    await notifyAdminsOfReport(data.id, label);
  } catch (e) {
    console.error("[report] adminmelding mislukt", e);
  }
  return { ok: true, message: "Bedankt voor je melding. Een beheerder van Similes bekijkt ze zo snel mogelijk." };
}
