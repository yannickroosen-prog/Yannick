# Implementatiestatus – Warme Babbel app

Datum: 8 september 2026.

## Belangrijke context
In deze ontwikkelomgeving waren **geen Supabase-, Resend- of WordPress-admin-credentials** beschikbaar. Daarom:
- is de database (schema + RLS) volledig gebouwd én getest op een **echte lokale PostgreSQL** (35 tests);
- is de app volledig gebouwd, getypecheckt, gelint, geproductiebuild en per route rooktest-gedraaid;
- kon de **end-to-end test tegen Supabase/Resend** (registratie-e-mail, realtime tussen twee browsers,
  storage-upload) hier **nog niet** uitgevoerd worden. De Playwright-suite daarvoor staat klaar
  (`tests/e2e/`) en draait zodra een Supabase-project gekoppeld is (zie `DEPLOYMENT.md` §5).

## Completed
### Analyse & ontwerp
- Read-only audit van warmebabbel.be (`ANALYSIS.md`), requirements (`REQUIREMENTS.md`), architectuur
  (`ARCHITECTURE.md`), databaseontwerp (`DATABASE.md`), security audit (`SECURITY.md`), deployment
  (`DEPLOYMENT.md`), migratieplan + tooling (`MIGRATION.md`, `scripts/wp-export-analyze.ts`).

### Database (Supabase/PostgreSQL)
- Versioned migraties: schema, enums, keuzelijsten (geseed uit de huidige site), functies, triggers,
  rate limiting, RLS-policies, storage-buckets en -policies, realtime-publicatie.
- 35 RLS-/beveiligingstests (cross-user, cross-conversation, ID-manipulatie, zelf-promotie, blokkade, schorsing,
  rapportering, admin-RPC's, storage, rate limits, accountverwijdering) – **allemaal groen**.

### Applicatie
- Auth: registreren (met privacy-akkoord en honeypot), e-mailbevestiging (hook of SMTP-templates), inloggen,
  uitloggen, wachtwoord vergeten/herstellen, wachtwoord wijzigen (met huidig wachtwoord), sessiebeheer via
  cookies + middleware, geschorst-scherm.
- Profielen: bewerken (alle velden uit de audit), profielfoto upload/verwijderen (private bucket, signed
  URL's, magic-bytes-controle), beschikbaarheid, verbergen, foto-privacy, account verwijderen.
- Ontdekken: `/profielen` met zoeken, 7 filters, paginering, deterministische sortering, profielkaarten;
  `/profiel/[id]` met CTA, rapporteren, blokkeren; `noindex` voor profielen.
- Privéchat: gesprek starten vanuit profiel, gesprekkenlijst met laatste bericht en ongelezen-tellers,
  realtime berichten (Supabase Realtime), optimistische verzending, paginering van oudere berichten, eigen
  bericht verwijderen (soft), archiveren, datumscheiders, mobile-first lay-out, Enter/Shift+Enter.
- Notificaties: in-app (bel-icoon + `/meldingen`, realtime), e-mail bij nieuw bericht (Resend, cooldown 15
  min, enkel als gesprek niet open), systeemmails (goedkeuring, schorsing), adminmail bij melding.
- Block & report: blokkeren/deblokkeren, rapporteren van profiel/bericht/gesprek met 5 categorieën.
- Admin (`/admin`): dashboard met statistieken, gebruikers zoeken/filteren, gebruikersdetail (rol, lijststatus,
  accountstatus, notities, moderatielog, meldingen), meldingen behandelen met notities en inzage in gemeld
  gesprek, beheer van Warme Babbelplekken/luisterlijn.
- Landingspagina in de stijl van Warme Babbel (warm, rustig, mobile-first), header/footer, 404/error-pagina's.
- Iframe-modus (`?embed=1`, `Sec-Fetch-Dest`), `public/embed.js` met auto-hoogte, CSP `frame-ancestors`.
- Netlify-configuratie (`netlify.toml`, Next.js Runtime), security headers, `robots`, healthcheck.
- Toegankelijkheid: semantische HTML, labels/aria, skip-link, zichtbare focus, touch targets ≥ 44 px,
  contrastrijke kleuren, `prefers-reduced-motion`, native `<dialog>`.
- Tests: 14 unit-tests, 35 RLS-tests, Playwright e2e-suite (4 actoren) klaar om te draaien.

## Partial
| Onderdeel | Status | Wat ontbreekt |
|---|---|---|
| End-to-end verificatie | Suite geschreven, niet uitgevoerd | Supabase-project + Resend-domein nodig; daarna `npm run test:e2e` |
| E-mail via Resend | Code + templates klaar | Domeinverificatie en hook-secret in Supabase/Netlify |
| Bijlagen in chat | Tabel, bucket en policies klaar | Geen upload-UI (should-have S4) |
| Plekken | Tabel + admin-CRUD + landingspagina | Bestaande drie locaties moeten door admin ingevoerd worden |
| Inhoudspagina's (Hoe?, Tips, Help, Privacy) | Links naar WordPress via `NEXT_PUBLIC_LEGACY_SITE_URL` | Eigen pagina's in de app (should-have S8) |
| Netlify-site | Config klaar | Project aanmaken/koppelen in Netlify UI (zie `DEPLOYMENT.md` §3); kan ook door mij gebeuren op vraag |

## Not implemented
- Read receipts, typing indicator, online-status (could-have).
- Uitnodigingsflow voor nieuwe babbelaars (should-have S2) – nu: admin zet rol handmatig.
- Automatische herinnering bij onbeantwoord bericht (S6).
- GDPR-export van eigen gegevens (S7).
- Feedbackformulier na een babbel, meertaligheid, web push (could-have).
- Migratie van bestaande gebruikers is **niet uitgevoerd** (bewust; tooling + plan aanwezig).

## Known issues
1. Zonder `SUPABASE_SERVICE_ROLE_KEY` werken accountverwijdering en e-mailnotificaties niet; de rest wel.
2. Inloggen *binnen* een iframe kan falen in Safari/Firefox (third-party cookies). Aanbevolen: iframe enkel
   voor ontdekken; chat/inloggen in de app zelf (zie `DEPLOYMENT.md` §6).
3. `script-src 'unsafe-inline'` in de CSP (vereist door Next.js).
4. De handmatig bijgehouden `database.types.ts` moet mee evolueren met migraties (of gegenereerd worden met
   `supabase gen types`).
5. Registratie meldt "e-mailadres bestaat al" (account-enumeratie, bewuste UX-keuze; in Supabase te verbergen).
6. De repository bevat ook het oudere Scrabble-project in de root; de app leeft in `warme-babbel/` (Netlify
   base directory). Een aparte repository is netter en eenvoudig te maken door de map te verplaatsen.

## Production checklist
- [ ] Supabase-project (EU) aanmaken; migraties 0001–0003 toepassen; Auth-instellingen (bevestiging, min.
      wachtwoordlengte 10, leaked-password check, URL's) – `DEPLOYMENT.md` §1
- [ ] Send Email-hook instellen (of SMTP + templates) en secret in Netlify
- [ ] Resend: domein verifiëren, API key, `EMAIL_FROM`
- [ ] Netlify: project met base directory `warme-babbel`, alle env-variabelen, deploy, `/api/health` groen
- [ ] Eerste beheerder promoveren (SQL) en inloggen op `/admin`
- [ ] Plekken invoeren (Inloophuis Kempen, Similes Salon Grimbergen, Praatcafé Hasselt, Luisterlijn)
- [ ] Warme Babbelaars aanmaken/migreren en goedkeuren (zie `MIGRATION.md`)
- [ ] `npm run test:e2e` tegen staging/productie laten slagen
- [ ] Privacybeleid aanvullen (Supabase, Resend, Netlify als verwerkers) en link controleren
- [ ] Subdomein `app.warmebabbel.be` + HTTPS; `NEXT_PUBLIC_SITE_URL` en Supabase-redirects bijwerken
- [ ] Iframe-pagina in WordPress toevoegen (na overleg) of rechtstreeks linken
- [ ] Monitoring afspreken (Supabase logs, Netlify logs, `ADMIN_NOTIFY_EMAIL`)
- [ ] Optioneel: CAPTCHA in Supabase Attack Protection, Sentry
