# Security audit – Warme Babbel app

Datum: 8 september 2026. Scope: de nieuwe applicatie (`warme-babbel/`). De bestaande WordPress-site is niet
gewijzigd of getest op kwetsbaarheden (read-only observaties staan in `ANALYSIS.md` §10).

Legenda: ✅ geïmplementeerd en getest · ☑️ geïmplementeerd · ⚠️ actie nodig vóór livegang

## 1. Authenticatie
| Controle | Status | Toelichting |
|---|---|---|
| E-mail + wachtwoord via Supabase Auth, verplichte e-mailbevestiging | ☑️ | `signUp` met `emailRedirectTo`; login weigert `email_not_confirmed` |
| Wachtwoordbeleid | ☑️ | Min. 10 tekens client- en server-side (zod); ⚠️ zet in Supabase ook "Minimum password length = 10" en "Leaked password protection" aan |
| Sessies | ☑️ | httpOnly-cookies via `@supabase/ssr`; middleware vernieuwt tokens; `getUser()` (server-gevalideerd) i.p.v. `getSession()` |
| Wachtwoord reset / wijzigen | ☑️ | Resetlink via hook/Resend; wijzigen vereist huidig wachtwoord (re-auth) |
| Account-enumeratie | ☑️ | "Wachtwoord vergeten" geeft altijd hetzelfde antwoord; registratie meldt wel "bestaat al" (bewuste UX-keuze) |
| Brute force | ⚠️ | Supabase Auth rate limits (standaard aan). Aanbevolen: Attack Protection → CAPTCHA (Turnstile/hCaptcha) inschakelen als spam optreedt |
| Honeypot bij registratie | ☑️ | Veld `website` |
| Uitloggen | ☑️ | Enkel via POST met Origin-controle |

## 2. Autorisatie
| Controle | Status |
|---|---|
| RLS op alle tabellen, standaard dicht | ✅ (35 tests) |
| Rol/status enkel via admin-RPC's; zelf-promotie onmogelijk | ✅ |
| Cross-user profieltoegang (babbelzoekers onzichtbaar voor elkaar) | ✅ |
| Cross-conversation toegang (ID-manipulatie) | ✅ 404 + RLS (0 rijen) |
| Berichten van anderen wijzigen/verwijderen | ✅ geweigerd |
| Blokkade blokkeert beide richtingen; geschorst account kan niets | ✅ |
| Adminroutes: server-side `requireAdmin()` + RLS `is_admin()` | ✅ |
| Admin leest enkel gemelde gesprekken (dataminimalisatie) | ✅ |
| Realtime-abonnementen onder RLS | ☑️ (Supabase-gedrag; tabellen in publicatie met replica identity full) |
| Storage: eigen map, private bucket, signed URL's (1 u) | ✅ policies getest |

## 3. Input & output
| Controle | Status |
|---|---|
| XSS | ☑️ React-escaping; verhaal/berichten als tekst (`whitespace-pre-wrap`), geen `dangerouslySetInnerHTML` |
| E-mails | ✅ alle dynamische inhoud ge-escaped (unit test) |
| Validatie | ☑️ zod op alle server actions; DB-constraints (lengtes, opties, enums) als tweede laag |
| Zoekfilter (PostgREST `or`) | ☑️ speciale tekens gestript, lengte begrensd |
| Open redirect (`next=`) | ✅ `safeNext()` (unit test) |
| Uploads | ☑️ MIME + magic bytes + grootte (server); bucket-limiet 5 MB + allowed_mime_types |

## 4. CSRF
Server Actions zijn Origin-gebonden (Next.js). Route handlers die muteren (`/auth/uitloggen`,
`/api/account/delete`) controleren `Origin` t.o.v. `Host` en eisen een sessie. De auth-hook eist een geldige
Standard-Webhooks-handtekening. ☑️

## 5. Injection
Enkel supabase-js query builder (geparametriseerd) en `pg` met parameters in tests; geen string-SQL met invoer.
PL/pgSQL-functies gebruiken parameters. ☑️

## 6. Rate limiting
| Actie | Limiet | Waar |
|---|---|---|
| Berichten | 30 / minuut | DB-trigger |
| Nieuwe gesprekken | 20 / dag | `start_conversation()` |
| Meldingen | 10 / dag | DB-trigger |
| E-mailmelding per gesprek | 1 / 15 min | `conversation_members.last_email_at` |
| Auth (login, signup, reset) | Supabase-limieten | Supabase |

## 7. Headers & transport
CSP (`default-src 'self'`, `frame-ancestors` beperkt tot warmebabbel.be), HSTS, `nosniff`, Referrer-Policy,
Permissions-Policy, `X-Robots-Tag` (noindex behalve `/` en `/profielen`). HTTPS via Netlify. ☑️
`script-src 'unsafe-inline'` is nodig voor Next.js-hydratie; nonces zijn een mogelijke verbetering.

## 8. Secrets
`.env.local` in `.gitignore`; `.env.example` bevat enkel namen. Service role enkel in server-only modules
(`import "server-only"`). Geen credentials in de repo. ☑️

## 9. Privacy (GDPR)
- Dataminimalisatie: geen voornaam/achternaam/geboortedatum; e-mail enkel in `auth.users`.
- Recht op verwijdering: self-service (`/instellingen`), berichten geanonimiseerd, avatar gewist, auth-user
  verwijderd (cascade). ☑️
- Recht op inzage/export: ⚠️ handmatig via Supabase-dashboard (should-have S7).
- Profielen van babbelzoekers nooit publiek; babbelaarsprofielen `noindex`. ☑️
- Geen third-party tracking of cookies buiten de sessie. ☑️
- Privacybeleid: link naar warmebabbel.be/privacybeleid; ⚠️ vul het beleid aan met de nieuwe verwerkers
  (Supabase in EU-regio, Resend, Netlify).

## 10. Logging & monitoring
- `moderation_events` als audittrail. ☑️
- Serverlogs bevatten geen berichtinhoud; e-mailfouten worden gelogd zonder inhoud. ☑️
- ⚠️ Aanbevolen: Supabase Auth-logs en Netlify-functielogs periodiek nakijken; optioneel Sentry.

## 11. Bekende beperkingen / restrisico's
1. `unsafe-inline` in CSP (Next.js).
2. Realtime en `total_unread` doen extra queries per event; bij grote volumes cachen.
3. E-mailnotificaties en accountverwijdering vereisen `SUPABASE_SERVICE_ROLE_KEY` in Netlify; zonder die key
   werkt de rest van de app gewoon.
4. Signed URL's van foto's zijn 1 uur deelbaar door wie ze heeft (aanvaard; foto's zijn vandaag ook publiek).
5. Iframe-modus: third-party-cookieblokkering in Safari/Firefox kan inloggen in de iframe verhinderen; zie
   `DEPLOYMENT.md` §Iframe.

## 12. Uitgevoerde tests
- `npm run test:rls` – 35 RLS/authorisatietests (cross-user, cross-conversation, RLS-bypass, admin, storage,
  rate limits, schorsing, verwijdering) ✅
- `npm run test:unit` – validatie, open-redirect, e-mail-escaping ✅
- `npm run test:e2e` – Playwright-scenario met 4 actoren (⚠️ vereist een Supabase-project; nog niet uitgevoerd
  in deze omgeving, zie `IMPLEMENTATION.md`)
