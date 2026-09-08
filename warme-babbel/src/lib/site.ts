/** Basis-URL van de app voor links in e-mails. De app zelf is URL-onafhankelijk. */
export function siteUrl(path = ""): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return base + (path.startsWith("/") ? path : `/${path}`);
}

/** Bestaande WordPress-site voor inhoudelijke pagina's (optioneel). */
export function legacyUrl(path = ""): string | null {
  const base = process.env.NEXT_PUBLIC_LEGACY_SITE_URL?.replace(/\/$/, "");
  if (!base) return null;
  return base + (path.startsWith("/") ? path : `/${path}`);
}

export const ORG = {
  name: "Similes vzw",
  email: "info@similes.be",
  phone: "016 244 201",
  helplinePhone: "016 244 200",
  address: "Groeneweg 151, 3001 Heverlee",
};
