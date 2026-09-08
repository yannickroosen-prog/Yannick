import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { newMessageEmail, reportReceivedAdminEmail } from "@/emails/templates";

const EMAIL_COOLDOWN_MS = 15 * 60 * 1000;

/**
 * E-mailmelding voor een nieuw bericht. Wordt server-side aangeroepen NA een geslaagde insert (RLS).
 * Criteria: ontvanger wil e-mails, heeft het gesprek niet gelezen sinds het bericht, en kreeg de
 * laatste 15 minuten geen mail voor dit gesprek. Gebruikt de service role (alleen server).
 */
export async function notifyNewMessage(conversationId: string, senderId: string, body: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const admin = createAdminClient();

  const { data: members } = await admin
    .from("conversation_members")
    .select("user_id, last_read_at, last_email_at")
    .eq("conversation_id", conversationId);
  const recipient = members?.find((m) => m.user_id !== senderId);
  if (!recipient) return;

  const now = Date.now();
  if (recipient.last_email_at && now - new Date(recipient.last_email_at).getTime() < EMAIL_COOLDOWN_MS) return;
  // Als de ontvanger het gesprek in de laatste 2 minuten heeft gelezen, zit hij waarschijnlijk in de chat.
  if (now - new Date(recipient.last_read_at).getTime() < 2 * 60 * 1000) return;

  const [{ data: prefs }, { data: profiles }, { data: authUser }] = await Promise.all([
    admin.from("profile_preferences").select("email_on_message").eq("user_id", recipient.user_id).maybeSingle(),
    admin.from("profiles").select("id, display_name, account_status").in("id", [recipient.user_id, senderId]),
    admin.auth.admin.getUserById(recipient.user_id),
  ]);
  if (prefs && !prefs.email_on_message) return;
  const recipientProfile = profiles?.find((p) => p.id === recipient.user_id);
  const senderProfile = profiles?.find((p) => p.id === senderId);
  const email = authUser?.user?.email;
  if (!email || !recipientProfile || recipientProfile.account_status !== "active") return;

  const mail = newMessageEmail({
    recipientName: recipientProfile.display_name,
    senderName: senderProfile?.display_name ?? "Iemand",
    preview: body.length > 160 ? body.slice(0, 159) + "…" : body,
    conversationId,
  });
  const result = await sendEmail({ to: email, ...mail });
  if (result.ok) {
    await admin
      .from("conversation_members")
      .update({ last_email_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", recipient.user_id);
  }
}

/** Optionele melding aan de beheerder(s) bij een nieuwe rapportering. */
export async function notifyAdminsOfReport(reportId: string, categoryLabel: string) {
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!to) return;
  await sendEmail({ to, ...reportReceivedAdminEmail({ category: categoryLabel, reportId }) });
}

/** Systeemmail naar een specifieke gebruiker (service role om het e-mailadres op te halen). */
export async function emailUser(userId: string, build: (name: string) => { subject: string; html: string; text: string }) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const admin = createAdminClient();
  const [{ data: prefs }, { data: profile }, { data: authUser }] = await Promise.all([
    admin.from("profile_preferences").select("email_on_system").eq("user_id", userId).maybeSingle(),
    admin.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
    admin.auth.admin.getUserById(userId),
  ]);
  if (prefs && !prefs.email_on_system) return;
  const email = authUser?.user?.email;
  if (!email) return;
  await sendEmail({ to: email, ...build(profile?.display_name ?? "") });
}
