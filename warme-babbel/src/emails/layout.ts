/**
 * Responsive e-mailtemplate (tabel-gebaseerd, inline CSS) in de huisstijl van Warme Babbel.
 * Alle inhoud wordt ge-escaped; links komen altijd van siteUrl().
 */
export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export type EmailContent = {
  preheader: string;
  title: string;
  /** Paragrafen (platte tekst; regeleinden worden <br>). */
  paragraphs: string[];
  cta?: { label: string; url: string };
  /** Kleine tekst onderaan, bv. "Deze link is 1 uur geldig." */
  footnote?: string;
};

export function renderEmail(c: EmailContent, opts: { siteUrl: string; orgName?: string }): { html: string; text: string } {
  const org = opts.orgName ?? "Similes vzw";
  const paras = c.paragraphs
    .map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#2b2523;">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
  const cta = c.cta
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;"><tr><td style="border-radius:999px;background:#e74c0a;">
         <a href="${escapeHtml(c.cta.url)}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">${escapeHtml(c.cta.label)}</a>
       </td></tr></table>
       <p style="margin:0 0 16px;font-size:13px;line-height:1.5;color:#8a807a;">Werkt de knop niet? Kopieer deze link in je browser:<br><a href="${escapeHtml(c.cta.url)}" style="color:#b41411;word-break:break-all;">${escapeHtml(c.cta.url)}</a></p>`
    : "";
  const foot = c.footnote ? `<p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#8a807a;">${escapeHtml(c.footnote)}</p>` : "";

  const html = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(c.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f0ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(c.preheader)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f1f0ea;">
<tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;">
    <tr><td style="padding:0 8px 20px;">
      <a href="${escapeHtml(opts.siteUrl)}" style="text-decoration:none;">
        <span style="font-size:22px;font-weight:800;color:#b41411;">Warme</span> <span style="font-size:22px;font-weight:800;color:#e74c0a;">Babbel</span>
      </a>
    </td></tr>
    <tr><td style="background:#ffffff;border-radius:20px;padding:32px 28px;">
      <h1 style="margin:0 0 20px;font-size:24px;line-height:1.3;color:#2b2523;">${escapeHtml(c.title)}</h1>
      ${paras}
      ${cta}
      ${foot}
    </td></tr>
    <tr><td style="padding:20px 8px 0;font-size:12px;line-height:1.6;color:#8a807a;">
      ${escapeHtml(org)} · Voor en door families van mensen met psychische problemen.<br>
      Je ontvangt deze e-mail omdat je een account hebt op Warme Babbel. Meldingsvoorkeuren pas je aan via
      <a href="${escapeHtml(opts.siteUrl)}/instellingen" style="color:#b41411;">je instellingen</a>.
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

  const text = [c.title, "", ...c.paragraphs, "", c.cta ? `${c.cta.label}: ${c.cta.url}` : "", c.footnote ?? "", "", `— ${org}`]
    .filter((l) => l !== undefined)
    .join("\n");
  return { html, text };
}
