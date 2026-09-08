/**
 * Analyseert (en optioneel importeert) een Ultimate Member-export van de bestaande Warme Babbel-site.
 *
 *   npx tsx scripts/wp-export-analyze.ts <export.csv|export.json>            → enkel analyse + mapping (dry run)
 *   npx tsx scripts/wp-export-analyze.ts <export.csv|export.json> --import   → import in Supabase (vraagt bevestiging)
 *
 * Verwachte kolommen (UM CSV-export, namen zijn flexibel/hoofdletterongevoelig):
 *   ID, user_login, user_email, display_name, role, account_status, hide_in_members, Even-niet-beschikbaar,
 *   mijn_verhaal, regio, problematiek, relatie, contactwijze, leeftijd, geslacht, zonder-afspraak, profile_photo
 * Meerwaardige velden: gescheiden door ",", ";" of "|".
 *
 * Er wordt NOOIT iets naar WordPress geschreven; enkel gelezen (en foto's gedownload).
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { createInterface } from "node:readline";

type Row = Record<string, string>;

const LABEL_MAP: Record<string, Record<string, string>> = {
  region: {
    "antwerpen: kempen": "antwerpen-kempen",
    "antwerpen: regio antwerpen": "antwerpen-regio-antwerpen",
    "antwerpen: rivierenland": "antwerpen-rivierenland",
    brussel: "brussel",
    "limburg: regio limburg": "limburg",
    "oost-vlaanderen: denderregio": "oost-vlaanderen-denderregio",
    "oost-vlaanderen: regio gent": "oost-vlaanderen-gent",
    "oost-vlaanderen: vlaamse ardennen": "oost-vlaanderen-vlaamse-ardennen",
    "oost-vlaanderen: waasland": "oost-vlaanderen-waasland",
    "vlaams-brabant: halle-vilvoorde": "vlaams-brabant-halle-vilvoorde",
    "vlaams-brabant: oost-brabant": "vlaams-brabant-oost-brabant",
    "west-vlaanderen: midwest": "west-vlaanderen-midwest",
    "west-vlaanderen: regio brugge": "west-vlaanderen-brugge",
    "west-vlaanderen: regio oostende": "west-vlaanderen-oostende",
    "west-vlaanderen: westhoek": "west-vlaanderen-westhoek",
    "west-vlaanderen: zuid-west-vlaanderen": "west-vlaanderen-zuid",
    "niet regio-specifiek": "niet-regio-specifiek",
  },
  theme: {
    "allerlei thema's": "allerlei", "allerlei thema’s": "allerlei", autisme: "autisme", borderline: "borderline", depressie: "depressie",
    eetstoornissen: "eetstoornissen", euthanasie: "euthanasie", internering: "internering", narcisme: "narcisme", psychose: "psychose",
    "suïcide": "suicide", suicide: "suicide", verslaving: "verslaving", "ander thema": "ander",
  },
  relation: {
    "(ex)partner van": "partner", "ouder van": "ouder", "kind van": "kind", "broer/zus van": "broer-zus", "grootouder van": "grootouder",
    "vriend van": "vriend", "andere band": "andere",
  },
  contact_method: { ontmoeting: "ontmoeting", telefoon: "telefoon", videocall: "videocall", "e-mail": "email", email: "email", "samen naar similes activiteit": "similes-activiteit" },
  age_group: { "20-er": "20", "30-er": "30", "40-er": "40", "50-er": "50", "60-er": "60", "70-er": "70", "80-er": "80" },
  gender: { man: "man", vrouw: "vrouw", x: "x" },
};

const LOCATION_HINTS = ["inloophuis", "babbelplek", "praatcaf", "luisterlijn", "similes salon"];

function parseCsv(text: string): Row[] {
  const rows: string[][] = [];
  let cur: string[] = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === "," ) { cur.push(field); field = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; cur.push(field); rows.push(cur); cur = []; field = ""; }
    else field += c;
  }
  if (field || cur.length) { cur.push(field); rows.push(cur); }
  const [header, ...body] = rows.filter((r) => r.some((x) => x.trim()));
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim().toLowerCase(), (r[i] ?? "").trim()])));
}

function get(row: Row, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k.toLowerCase()];
    if (v !== undefined && v !== "") return v;
  }
  return "";
}

function splitMulti(v: string): string[] {
  return v.split(/[|;,]/).map((s) => s.trim()).filter(Boolean);
}

function stripHtml(html: string): string {
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n").replace(/<\/(p|div|li)>/gi, "\n").replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#0?39;|&#8217;/g, "'").replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n").trim();
}

type Mapped = {
  source_id: string; email: string; display_name: string; role: "seeker" | "listener"; listing_status: "approved" | "pending";
  is_hidden: boolean; is_available: boolean; walk_in: boolean; story: string; regions: string[]; themes: string[]; relations: string[];
  contact_methods: string[]; age_group: string | null; gender: string | null; photo_url: string | null; warnings: string[];
};

function mapRow(row: Row, unknown: Set<string>): Mapped | { skip: string } {
  const email = get(row, "user_email", "email").toLowerCase();
  const login = get(row, "user_login", "username");
  const display = get(row, "display_name", "nickname") || login;
  const warnings: string[] = [];
  if (LOCATION_HINTS.some((h) => display.toLowerCase().includes(h))) return { skip: `locatie-account (${display}) → invoeren als 'plek'` };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { skip: `ongeldig e-mailadres "${email}" (${display})` };

  const mapList = (kind: keyof typeof LABEL_MAP, value: string) =>
    splitMulti(value).map((label) => {
      const slug = LABEL_MAP[kind][label.toLowerCase()];
      if (!slug) unknown.add(`${kind}: ${label}`);
      return slug;
    }).filter((x): x is string => !!x);

  const umRole = get(row, "role", "um_role", "wp_capabilities").toLowerCase();
  const isListener = /babbelaar|listener|vrijwillig/.test(umRole) || !!get(row, "regio") || !!get(row, "mijn_verhaal");
  const status = get(row, "account_status").toLowerCase();
  let story = stripHtml(get(row, "mijn_verhaal", "mijn verhaal", "story"));
  if (story.length > 3000) { warnings.push("verhaal ingekort tot 3000 tekens"); story = story.slice(0, 3000); }
  let name = display.trim();
  if (name.length < 2) name = login || "Gebruiker";
  if (name.length > 40) { warnings.push("naam ingekort"); name = name.slice(0, 40); }
  const age = mapList("age_group", get(row, "leeftijd"))[0] ?? null;
  const gender = mapList("gender", get(row, "geslacht"))[0] ?? null;
  const photo = get(row, "profile_photo");
  const sourceId = get(row, "id", "user_id");
  return {
    source_id: sourceId, email, display_name: name, role: isListener ? "listener" : "seeker",
    listing_status: isListener && status === "approved" ? "approved" : "pending",
    is_hidden: ["1", "yes", "ja", "true"].includes(get(row, "hide_in_members").toLowerCase()),
    is_available: !get(row, "even-niet-beschikbaar", "even niet beschikbaar"),
    walk_in: !!get(row, "zonder-afspraak", "zonder afspraak"),
    story, regions: mapList("region", get(row, "regio")), themes: mapList("theme", get(row, "problematiek", "thema")),
    relations: mapList("relation", get(row, "relatie", "band")), contact_methods: mapList("contact_method", get(row, "contactwijze")),
    age_group: age, gender,
    photo_url: photo && sourceId ? `https://warmebabbel.be/wp-content/uploads/ultimatemember/${sourceId}/${photo.replace(/^.*\//, "")}` : null,
    warnings,
  };
}

async function main() {
  const file = process.argv[2];
  const doImport = process.argv.includes("--import");
  if (!file) { console.error("Gebruik: tsx scripts/wp-export-analyze.ts <export.csv|json> [--import]"); process.exit(1); }
  const raw = readFileSync(file, "utf8");
  const rows: Row[] = extname(file).toLowerCase() === ".json"
    ? (JSON.parse(raw) as Row[]).map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k.toLowerCase(), String(v ?? "")])))
    : parseCsv(raw);

  const unknown = new Set<string>();
  const seen = new Set<string>();
  const mapped: Mapped[] = [];
  const skipped: string[] = [];
  for (const row of rows) {
    const id = get(row, "id", "user_id") || get(row, "user_email");
    if (seen.has(id)) { skipped.push(`duplicaat ${id}`); continue; }
    seen.add(id);
    const m = mapRow(row, unknown);
    if ("skip" in m) skipped.push(m.skip); else mapped.push(m);
  }

  const outDir = join(dirname(file), "");
  mkdirSync(outDir, { recursive: true });
  const report = [
    `# Migratierapport – ${new Date().toISOString()}`, "",
    `Rijen in export: ${rows.length}`, `Te migreren: ${mapped.length} (${mapped.filter((m) => m.role === "listener").length} babbelaars, ${mapped.filter((m) => m.role === "seeker").length} zoekers)`,
    `Overgeslagen: ${skipped.length}`, ...skipped.map((s) => `- ${s}`), "",
    `## Onbekende labels (${unknown.size}) – voeg toe aan LABEL_MAP`, ...Array.from(unknown).map((u) => `- ${u}`), "",
    "## Waarschuwingen", ...mapped.flatMap((m) => m.warnings.map((w) => `- ${m.display_name}: ${w}`)),
  ].join("\n");
  writeFileSync(join(outDir, "report.md"), report);
  writeFileSync(join(outDir, "profiles.json"), JSON.stringify(mapped, null, 2));
  console.log(report);
  console.log(`\nGeschreven: ${join(outDir, "report.md")} en profiles.json`);

  if (!doImport) { console.log("\nDry run – niets geïmporteerd. Gebruik --import om te importeren."); return; }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY zijn vereist voor --import");
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise<string>((res) => rl.question(`\n${mapped.length} accounts importeren in ${url}? Typ IMPORT om te bevestigen: `, res));
  rl.close();
  if (answer !== "IMPORT") { console.log("Geannuleerd."); return; }

  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(url, key, { auth: { persistSession: false } });
  let ok = 0, failed = 0;
  for (const m of mapped) {
    try {
      // Idempotent: bestaande auth-user op e-mail hergebruiken
      const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
      let user = list?.users.find((u) => u.email?.toLowerCase() === m.email);
      if (!user) {
        const { data, error } = await admin.auth.admin.createUser({
          email: m.email, email_confirm: true, password: crypto.randomUUID() + crypto.randomUUID(),
          user_metadata: { display_name: m.display_name, accepted_privacy: true, migrated_from_wp_id: m.source_id },
        });
        if (error || !data.user) throw error ?? new Error("createUser mislukt");
        user = data.user;
      }
      let avatar_path: string | null = null;
      if (m.photo_url) {
        const res = await fetch(m.photo_url);
        const type = res.headers.get("content-type") ?? "";
        if (res.ok && /image\/(jpeg|png|webp)/.test(type)) {
          const buf = Buffer.from(await res.arrayBuffer());
          if (buf.length <= 5 * 1024 * 1024) {
            const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
            avatar_path = `${user.id}/migrated.${ext}`;
            const { error } = await admin.storage.from("avatars").upload(avatar_path, buf, { contentType: type, upsert: true });
            if (error) { avatar_path = null; m.warnings.push(`foto niet geüpload: ${error.message}`); }
          }
        }
      }
      const { error: pErr } = await admin.from("profiles").update({
        display_name: m.display_name, role: m.role, listing_status: m.listing_status, is_hidden: m.is_hidden, is_available: m.is_available,
        walk_in: m.walk_in, story: m.story || null, regions: m.regions, themes: m.themes, relations: m.relations, contact_methods: m.contact_methods,
        age_group: m.age_group, gender: m.gender, avatar_path,
      }).eq("id", user.id);
      if (pErr) throw pErr;
      ok++;
      console.log(`✔ ${m.display_name} <${m.email}>`);
    } catch (e) {
      failed++;
      console.error(`✖ ${m.display_name}: ${(e as Error).message}`);
    }
  }
  console.log(`\nKlaar: ${ok} geïmporteerd, ${failed} mislukt. Stuur nu de 'stel je wachtwoord in'-mails (zie docs/MIGRATION.md §6).`);
}

main().catch((e) => { console.error(e); process.exit(1); });
