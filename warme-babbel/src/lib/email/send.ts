import "server-only";
import { Resend } from "resend";

type Mail = { to: string; subject: string; html: string; text: string };

let resend: Resend | undefined;

/**
 * Verstuurt een e-mail via Resend. Faalt zacht (logt) zodat een e-mailprobleem
 * nooit een gebruikersactie (bericht sturen, registreren) blokkeert.
 */
export async function sendEmail(mail: Mail): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn("[email] RESEND_API_KEY of EMAIL_FROM ontbreekt; e-mail niet verstuurd:", mail.subject, "→", mail.to);
    return { ok: false, error: "not_configured" };
  }
  try {
    resend ??= new Resend(apiKey);
    const { data, error } = await resend.emails.send({ from, to: mail.to, subject: mail.subject, html: mail.html, text: mail.text });
    if (error) {
      console.error("[email] Resend-fout:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (e) {
    console.error("[email] Verzenden mislukt:", e);
    return { ok: false, error: (e as Error).message };
  }
}
