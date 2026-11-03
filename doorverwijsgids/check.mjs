// Controleert de beslissingsboom: bestaan alle fiches en stappen, is alles
// bereikbaar, en worden alleen nagekeken fiches onder "fiches" gebruikt?
// Gebruik:  node doorverwijsgids/check.mjs
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const map = dirname(fileURLToPath(import.meta.url));
const w = {};
for (const f of ["data/fiches.js", "data/boom.js"]) {
  new Function("window", readFileSync(join(map, f), "utf8"))(w);
}

const OK = new Set(["Bevestigd", "Deels bevestigd", "Tegenstrijdige informatie"]);
const fiche = {};
for (const f of w.DG_FICHES.fiches) for (const id of f.ids || [f.id]) fiche[id] = f;

const stappen = w.DG_BOOM.stappen;
const fouten = [];
const gebruikt = new Set();

for (const [id, s] of Object.entries(stappen)) {
  if (!s.vraag) fouten.push(`${id}: geen vraag`);
  for (const o of s.opties || []) {
    if (!stappen[o.naar]) fouten.push(`${id}: optie "${o.label}" verwijst naar onbekende stap "${o.naar}"`);
  }
  for (const fid of s.fiches || []) {
    gebruikt.add(fid);
    if (!fiche[fid]) fouten.push(`${id}: fiche ${fid} bestaat niet`);
    else if (!OK.has(fiche[fid].status)) fouten.push(`${id}: fiche ${fid} (${fiche[fid].naam}) is "${fiche[fid].status}" en hoort onder nietNagekeken`);
  }
  for (const fid of s.nietNagekeken || []) {
    gebruikt.add(fid);
    if (!fiche[fid]) fouten.push(`${id}: fiche ${fid} bestaat niet`);
    else if (OK.has(fiche[fid].status)) fouten.push(`${id}: fiche ${fid} (${fiche[fid].naam}) is nagekeken en hoort onder fiches`);
  }
  const heeftInhoud = (s.opties || []).length || (s.fiches || []).length || (s.nietNagekeken || []).length || (s.nood || []).length;
  if (!heeftInhoud) fouten.push(`${id}: stap zonder opties, fiches of noodnummers`);
}

// Bereikbaarheid vanaf de startstap.
const bereikt = new Set();
const wacht = [w.DG_BOOM.start];
while (wacht.length) {
  const id = wacht.pop();
  if (bereikt.has(id) || !stappen[id]) continue;
  bereikt.add(id);
  for (const o of stappen[id].opties || []) wacht.push(o.naar);
}
for (const id of Object.keys(stappen)) if (!bereikt.has(id)) fouten.push(`${id}: niet bereikbaar vanaf "${w.DG_BOOM.start}"`);

// Nagekeken fiches die nergens in de boom voorkomen.
const nagekekenOngebruikt = w.DG_FICHES.fiches.filter((f) => OK.has(f.status) && !(f.ids || [f.id]).some((i) => gebruikt.has(i)));
const ongebruikt = w.DG_FICHES.fiches.filter((f) => !(f.ids || [f.id]).some((i) => gebruikt.has(i)));

console.log(`${Object.keys(stappen).length} stappen, ${w.DG_FICHES.fiches.length} fiches (${w.DG_FICHES.fiches.filter((f) => OK.has(f.status)).length} nagekeken)`);
if (nagekekenOngebruikt.length) console.log("Nagekeken maar nergens gebruikt: " + nagekekenOngebruikt.map((f) => `${f.id} ${f.naam}`).join("; "));
if (ongebruikt.length) console.log(`Niet in de boom opgenomen (${ongebruikt.length}): ` + ongebruikt.map((f) => f.id).join(", "));
if (fouten.length) {
  console.error("FOUTEN:\n- " + fouten.join("\n- "));
  process.exit(1);
}
console.log("OK: boom is sluitend.");
