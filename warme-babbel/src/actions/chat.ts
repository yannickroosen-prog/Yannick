"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { messageSchema } from "@/lib/validation";
import { notifyNewMessage } from "@/lib/email/notify";

export type ActionResult = { ok: boolean; error?: string; id?: string | number };

/** Start (of hervat) een gesprek met een gebruiker en ga naar de chat. */
export async function startConversationAction(formData: FormData) {
  const otherId = String(formData.get("userId") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/inloggen?next=${encodeURIComponent(`/profiel/${otherId}`)}`);
  const { data, error } = await supabase.rpc("start_conversation", { p_other: otherId });
  if (error || !data) {
    redirect(`/profiel/${otherId}?fout=${encodeURIComponent(error?.message ?? "Gesprek starten is niet gelukt")}`);
  }
  redirect(`/chat/${data}`);
}

/** Verstuurt een bericht (RLS controleert lidmaatschap, blokkades, status) en stuurt eventueel een e-mailmelding. */
export async function sendMessageAction(input: { conversationId: string; body: string }): Promise<ActionResult> {
  const parsed = messageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldig bericht" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Je bent niet ingelogd." };

  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: parsed.data.conversationId, sender_id: user.id, body: parsed.data.body })
    .select("id")
    .single();
  if (error) {
    const friendly = /Te veel berichten/.test(error.message)
      ? "Je stuurt erg veel berichten in korte tijd. Wacht even en probeer opnieuw."
      : /row-level security|policy/i.test(error.message)
        ? "Je kan in dit gesprek geen berichten (meer) sturen."
        : "Bericht versturen is niet gelukt.";
    return { ok: false, error: friendly };
  }

  // E-mailmelding (service role, server-only). Faalt zacht.
  try {
    await notifyNewMessage(parsed.data.conversationId, user.id, parsed.data.body);
  } catch (e) {
    console.error("[notify] e-mailmelding mislukt", e);
  }
  return { ok: true, id: data.id };
}

export async function markConversationReadAction(conversationId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("mark_conversation_read", { p_conversation: conversationId });
}

export async function setArchivedAction(formData: FormData) {
  const conversationId = String(formData.get("conversationId") ?? "");
  const archived = String(formData.get("archived") ?? "") === "1";
  const supabase = await createClient();
  await supabase.rpc("set_conversation_archived", { p_conversation: conversationId, p_archived: archived });
  revalidatePath("/chat");
  redirect(archived ? "/chat" : `/chat/${conversationId}`);
}

export async function deleteOwnMessageAction(messageId: number): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("messages").update({ deleted_at: new Date().toISOString() }).eq("id", messageId);
  return error ? { ok: false, error: "Verwijderen is niet gelukt." } : { ok: true };
}
