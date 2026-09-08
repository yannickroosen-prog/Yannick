# Migratie van bestaande Warme Babbel-gebruikers (WordPress → Supabase)

> **Er is geen migratie uitgevoerd op productie.** Dit document beschrijft de datastructuur, de mapping en de
> tooling voor een latere, gecontroleerde migratie. De bestaande site blijft ongewijzigd.

## 1. Bestaande datastructuur (WordPress + Ultimate Member)

| Bron | Inhoud |
|---|---|
| `wp_users` | `ID`, `user_login`, `user_email`, `user_pass` (phpass/bcrypt-hash), `display_name`, `user_registered` |
| `wp_usermeta` | `first_name`, `last_name`, `profile_photo`, `cover_photo`, `mijn_verhaal`, `Even-niet-beschikbaar`, `account_status` (`approved`, `awaiting_admin_review`, …), `role` (UM-rol), `hide_in_members`, `um_member_directory_data`, … |
| UM User Tags (taxonomie-termen per veld) | `regio`, `problematiek`, `relatie`, `contactwijze`, `leeftijd`, `geslacht`, `zonder-afspraak` |
| `wp-content/uploads/ultimatemember/<user_id>/profile_photo*.jpg` | Profielfoto's |
| `wp_um_conversations`, `wp_um_messages` (UM Private Messages) | Gesprekken en berichten (`conversation_id`, `user_a`, `user_b`, `author`, `recipient`, `content`, `time`, `status`) |

Exporteren kan **read-only** via (a) *Tools → Export* (XML: enkel auteurs, geen meta), (b) *Users → Export*
via UM ("UM > Users > Export as CSV", bevat meta), of (c) een SQL-dump door de hostingpartij. Optie (b)/(c) is
nodig voor de profielvelden.

## 2. Nieuwe datastructuur
Zie `DATABASE.md`: `auth.users` (e-mail, wachtwoord), `profiles` (rol, velden), `profile_options`
(slugs), Storage-bucket `avatars`, `conversations`/`conversation_members`/`messages`.

## 3. Mapping

| WordPress/UM | Supabase | Opmerking |
|---|---|---|
| `user_email` | `auth.users.email` | Verplicht, uniek; ongeldige adressen worden overgeslagen en gerapporteerd |
| `user_login` / `display_name` | `profiles.display_name` | 2–40 tekens; UM toont de gebruikersnaam als display name |
| `user_pass` | – | **Niet migreerbaar** (andere hash); zie §6 |
| UM-rol "Warme Babbelaar" / babbelaar-registratieformulier | `role = listener` | Zoekers → `seeker` |
| `account_status = approved` (babbelaar) | `listing_status = approved` | Anders `pending` |
| `hide_in_members` | `is_hidden` | |
| `Even-niet-beschikbaar` | `is_available = false` | |
| `mijn_verhaal` (HTML) | `story` (platte tekst) | HTML strippen, `<br>`/`<p>` → regeleinden, ≤ 3000 tekens |
| `regio` (labels) | `regions[]` (slugs) | Labelmapping in `scripts/wp-export-analyze.ts`; "Oost-brabant" → `vlaams-brabant-oost-brabant` enz. |
| `problematiek` | `themes[]` | "Allerlei thema's" → `allerlei` |
| `relatie` | `relations[]` | |
| `contactwijze` | `contact_methods[]` | |
| `leeftijd` ("60-er") | `age_group` (`60`) | |
| `geslacht` | `gender` | Man/Vrouw/X → `man`/`vrouw`/`x` |
| `zonder-afspraak` | `walk_in` | |
| `profile_photo` | Storage `avatars/<uuid>/<bestand>` + `avatar_path` | Download van `wp-content/uploads/ultimatemember/<id>/` (publiek) |
| Locatie-accounts (Inloophuis, Babbelplek, Praatcafé) | `places` | **Niet** als gebruiker migreren |
| `wp_um_conversations` / `wp_um_messages` | `conversations` / `messages` | Optioneel; enkel als beide gebruikers gemigreerd zijn |
| `first_name`, `last_name`, `cover_photo` | – | Bewust niet overgenomen (dataminimalisatie) |

## 4. Datakwaliteit (vastgesteld in de audit)
- Directory toont duplicaten (5 van 21 kaarten); in de export moeten gebruikers op `ID` gededupliceerd worden.
- Sommige "Mijn verhaal"-velden bevatten HTML (`<div dir="auto">`, `<p>`), soms leeg.
- Regiolabels zijn niet uniform ("Oost-brabant" vs "Oost-Brabant", "regio Antwerpen").
- Eén profiel toont "1 more" in thema's (afgekapte tag).
- Gebruikersnamen worden als display name gebruikt (bv. "JORIS", "Pioentje", "Annemie V.").

## 5. Privacyrisico's en maatregelen
- Persoonsgegevens (e-mail, verhaal, foto) verlaten de WordPress-omgeving: enkel via een beveiligd kanaal,
  export tijdelijk bewaren, na migratie wissen. Exportbestanden staan in `.gitignore` (`migration-data/`,
  `wp-export*`).
- Rechtsgrond: de gebruikers gaven hun gegevens voor deze dienst; informeer hen per e-mail over de nieuwe
  omgeving en de verwerkers (Supabase EU, Resend, Netlify) vóór de omschakeling.
- Babbelzoekers (geen publiek profiel): overweeg om **enkel Warme Babbelaars** te migreren en zoekers een
  nieuw account te laten maken. Dat minimaliseert de verwerking; oude gesprekken blijven dan in WordPress
  (read-only) beschikbaar tot de site uitgaat.
- Berichtenmigratie is het meest gevoelig; doe dit enkel als er een duidelijke nood is.

## 6. Wachtwoordmigratie
WordPress-hashes (phpass/bcrypt met WP-prefix) zijn niet compatibel met Supabase Auth. Aanpak:
1. Gebruikers aanmaken met `auth.admin.createUser({ email, email_confirm: true, password: <willekeurig> })`.
2. Direct na de migratie een **"Stel je wachtwoord in"-mail** sturen (recovery-flow via Resend) of
   `auth.admin.generateLink({ type: 'recovery' })` per gebruiker.
3. Communiceer vooraf ("Je krijgt een e-mail om je wachtwoord opnieuw in te stellen").

## 7. Profielmigratie – tooling
`scripts/wp-export-analyze.ts` leest een UM CSV/JSON-export **lokaal**, dedupliceert, mapt labels naar slugs,
strips HTML en produceert:
- een rapport (`migration-data/report.md`): aantallen, onbekende labels, ongeldige e-mails, te lange verhalen;
- een `migration-data/profiles.json` klaar voor import.

```bash
npx tsx scripts/wp-export-analyze.ts migration-data/um-export.csv        # analyse (dry run, schrijft niets naar Supabase)
npx tsx scripts/wp-export-analyze.ts migration-data/um-export.csv --import   # import: vereist SUPABASE_SERVICE_ROLE_KEY en expliciete bevestiging
```
De `--import`-modus vraagt bevestiging, maakt per rij een auth-user + profiel (idempotent op e-mail), zet
`listing_status` en downloadt de profielfoto naar de bucket. Locatie-accounts worden overgeslagen.

## 8. Afbeeldingen
Profielfoto's staan publiek op `https://warmebabbel.be/wp-content/uploads/ultimatemember/<user_id>/profile_photo.jpg`
(varianten `-190x190`). Het script downloadt de grootste variant, controleert MIME (jpeg/png/webp) en ≤ 5 MB,
en uploadt naar `avatars/<supabase_uid>/migrated.<ext>`.

## 9. Handmatige stappen
1. Exportbestand verkrijgen (UM CSV of SQL-dump) en lokaal in `migration-data/` plaatsen.
2. `wp-export-analyze.ts` draaien en het rapport nakijken (onbekende labels handmatig mappen in het script).
3. Beslissen: enkel babbelaars, of ook zoekers/berichten.
4. Testimport in een **staging**-Supabase-project; controleren via `/admin/gebruikers`.
5. Communicatie naar gebruikers (nieuwe omgeving, wachtwoord instellen).
6. Productie-import op een rustig moment; daarna WordPress-registratie/berichten sluiten of doorverwijzen.
7. Exportbestanden vernietigen.
