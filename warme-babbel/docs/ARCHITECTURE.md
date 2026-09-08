# Architectuur – Warme Babbel app

## Overzicht

```
┌──────────────────────────────┐        ┌─────────────────────────────────────────┐
│  warmebabbel.be (WordPress)  │ iframe │  app.warmebabbel.be  (Netlify)          │
│  – blijft ongewijzigd        │ ─────► │  Next.js 15 (App Router, TypeScript)    │
│  – later: link/redirect      │        │  React 19 + Tailwind CSS                │
└──────────────────────────────┘        │  Server Components + Server Actions     │
                                        │  Route Handlers (/api/*)                │
                                        └────────────┬────────────────────────────┘
                                                     │ supabase-js (@supabase/ssr)
                                        ┌────────────▼────────────────────────────┐
                                        │  Supabase                               │
                                        │  – PostgreSQL + Row Level Security      │
                                        │  – Auth (e-mail/wachtwoord, PKCE)       │
                                        │  – Storage (private bucket avatars)     │
                                        │  – Realtime (postgres_changes)          │
                                        └────────────┬────────────────────────────┘
                                                     │ Auth "Send Email"-hook  /  app
                                        ┌────────────▼────────────────────────────┐
                                        │  Resend (transactionele e-mail)         │
                                        └─────────────────────────────────────────┘
```

De applicatie heeft **geen enkele runtime-afhankelijkheid van WordPress**. WordPress is enkel de plek waar de
app tijdelijk via een iframe wordt getoond en waar de inhoudspagina's (Hoe?, Tips, Help, Privacybeleid) nog
staan; de app linkt daarnaar met configureerbare URL's (`NEXT_PUBLIC_LEGACY_SITE_URL`) en werkt ook als die
links wegvallen.

## Frontend

- **Next.js 15 App Router** met React Server Components voor dataload (server-side, met de sessie van de
  gebruiker → RLS geldt), Server Actions voor mutaties, client components alleen waar interactie nodig is
  (chat, filters, composer, uploads).
- **Routing** (alle routes rechtstreeks bereikbaar, deeplink-proof):

| Route | Toegang | Doel |
|---|---|---|
| `/` | publiek | Landingspagina: uitleg, CTA's, plekken, luisterlijn, citaten |
| `/profielen` | publiek | Ontdek Warme Babbelaars (kaarten, zoeken, filters, paginatie) |
| `/profiel/[id]` | publiek (beperkt) / ingelogd (volledig) | Profieldetail + "Stuur een bericht" |
| `/registreren`, `/inloggen`, `/wachtwoord-vergeten`, `/wachtwoord-herstellen` | publiek | Auth |
| `/auth/confirm`, `/auth/callback` | publiek | Token-uitwisseling (e-mailbevestiging, reset, PKCE) |
| `/chat`, `/chat/[id]` | ingelogd | Gesprekkenlijst en gesprek |
| `/mijn-profiel` | ingelogd | Profiel bewerken, foto, beschikbaarheid |
| `/instellingen` | ingelogd | Wachtwoord, notificaties, privacy, blokkades, account verwijderen |
| `/meldingen` | ingelogd | In-app notificaties |
| `/admin`, `/admin/gebruikers`, `/admin/gebruikers/[id]`, `/admin/rapporteringen`, `/admin/rapporteringen/[id]`, `/admin/plekken` | admin | Beheer |
| `/api/hooks/auth-email` | Supabase (webhook-handtekening) | Auth-e-mails via Resend |
| `/api/account/delete` | ingelogd (POST) | Account verwijderen via service role |
| `/api/health` | publiek | Healthcheck |

- **Embed-modus**: `?embed=1` (of `Sec-Fetch-Dest: iframe`) zet een cookie `wb_embed`; de layout verbergt dan
  header/footer, gebruikt compacte marges en stuurt de documenthoogte via `postMessage` naar de parent
  (`public/embed.js` bevat het snippet voor WordPress). Alle links blijven binnen de iframe werken; auth-e-mails
  linken altijd naar de **top-level** app-URL.
- **Styling**: Tailwind CSS met een warm, rustig design-systeem (merkkleuren rood `#b41411`, oranje
  `#e74c0a`, beige `#f1f0ea`, crème-achtergrond, donkere warme inkt). Fonts via `next/font` (self-hosted bij
  build): Nunito (koppen) en Source Sans 3 (tekst). Mobile-first, touch targets ≥ 44 px, zichtbare focus ringen.
- **Iconen**: lucide-react (tree-shakeable).

## Backend (Supabase)

- **Database**: PostgreSQL met schema in `supabase/migrations/` (versioned). Zie `DATABASE.md`.
- **Authorisatie**: uitsluitend via RLS + `security definer`-functies met expliciete checks. De frontend voert
  nooit "vertrouwde" filtering uit; ze toont enkel wat de database teruggeeft.
- **Rollen**: kolom `profiles.role` (`seeker` | `listener` | `admin`), enkel wijzigbaar via
  `admin_set_role()` (security definer, controleert `is_admin()`, logt in `moderation_events`). Een trigger
  weigert wijzigingen aan `role`, `account_status`, `listing_status` door niet-admins.
- **Auth**: Supabase Auth (e-mail + wachtwoord, e-mailbevestiging verplicht, PKCE-flow, wachtwoord ≥ 10
  tekens, "leaked password protection" aan). Sessies in httpOnly-cookies via `@supabase/ssr`; `middleware.ts`
  vernieuwt tokens en bewaakt beschermde routes. Profiel wordt bij registratie aangemaakt door een trigger op
  `auth.users` (metadata `display_name`).
- **Storage**: bucket `avatars` (private). Pad `avatars/<user_id>/<uuid>.<ext>`; upload enkel door de eigenaar
  (policy op `storage.objects`), lezen door ingelogde gebruikers via kortlevende signed URL's die server-side
  worden aangemaakt. Publieke bezoekers zien in de lijst een placeholder of, wanneer de babbelaar dat toestaat,
  ook de foto (signed URL, 1 uur).
- **Realtime**: `postgres_changes` op `messages` (filter `conversation_id`) en `notifications` (filter
  `user_id`); RLS wordt door Realtime afgedwongen, dus een gebruiker kan zich niet abonneren op gesprekken
  waar hij geen lid van is. Tabellen staan in de publicatie `supabase_realtime`.
- **E-mail (Resend)**:
  1. **Auth-e-mails** (bevestiging, wachtwoord reset, e-mailwijziging): Supabase "Send Email"-hook →
     `POST /api/hooks/auth-email` (handtekening gecontroleerd met `standardwebhooks`) → Resend met onze
     responsive HTML-templates in `src/emails/`. Fallback: Supabase Custom SMTP (Resend SMTP) met de
     templates uit `supabase/templates/`.
  2. **Nieuw bericht**: na een geslaagde insert (RLS) beslist de server action met een service-role client of
     er gemaild wordt: ontvanger heeft e-mailnotificaties aan, heeft het gesprek niet recent gelezen, en er is
     de laatste 15 min. geen mail voor dit gesprek gestuurd (`conversation_members.last_email_at`).
  3. **Systeemmeldingen**: goedkeuring als babbelaar, afgehandelde melding, schorsing.
- **Service role** wordt uitsluitend server-side gebruikt (nooit in de browser) voor: account verwijderen
  (`auth.admin.deleteUser`), e-mailnotificaties, en admin-acties die de Auth-API nodig hebben (e-mail
  opzoeken). Alle andere admin-lezingen gaan via RLS-policies voor `is_admin()`.

## Security

- Security headers (`next.config.ts`): `Content-Security-Policy` met `frame-ancestors 'self'
  https://warmebabbel.be https://www.warmebabbel.be`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `X-Content-Type-Options: nosniff`, `Permissions-Policy`, HSTS (Netlify/HTTPS).
- CSRF: Server Actions zijn origin-gebonden (Next.js controleert `Origin`); route handlers die muteren eisen
  een ingelogde sessie + `Origin`-controle; de auth-hook eist een geldige webhook-handtekening.
- XSS: React escaping; "mijn verhaal" wordt als platte tekst met regeleinden gerenderd (geen HTML).
- Uploads: MIME + extensie + grootte gevalideerd client- én server-side; bucket-limiet 5 MB; enkel
  `image/jpeg|png|webp`.
- Rate limiting: databasetriggers (max. 30 berichten/min, 10 meldingen/dag, 20 nieuwe gesprekken/dag per
  gebruiker) + Supabase Auth-limieten.
- Geblokkeerde/geschorste accounts: RLS-functie `is_active()` weigert inserts; middleware logt uit.
- Secrets enkel in Netlify-omgevingsvariabelen; `.env.example` bevat enkel namen.

## Admin

Aparte route-groep `(admin)` met server-side check (`requireAdmin()`), aparte navigatie en RLS-policies die
enkel `is_admin()` toelaten. Admin-mutaties via security-definer RPC's die alles loggen in
`moderation_events`.

## Integratie met bestaande website (overgangsfase)

1. **Iframe** in een WordPress-pagina (bv. "Zoek een Warme Babbelaar"):
   `<iframe src="https://app.warmebabbel.be/profielen?embed=1" …>` + `embed.js` voor auto-hoogte.
2. **Doorsturen**: menu-items in WordPress kunnen rechtstreeks naar `https://app.warmebabbel.be/…` linken.
3. **Primaire omgeving**: DNS voor `warmebabbel.be` naar Netlify; WordPress-content wordt overgenomen door
   statische pagina's in de app (should-have S8) of blijft op een subdomein.
   Zie `DEPLOYMENT.md` §"Iframe-integratie".

## Schaalbaarheid

- Stateless Next.js op Netlify (edge/serverless), Supabase schaalt verticaal; indexen op alle
  foreign keys en filterkolommen (GIN op arrays, trigram op naam/verhaal).
- Realtime: één kanaal per open gesprek + één per gebruiker voor notificaties.
- Toekomst: bijlagen (tabel + bucket voorzien), plekken, meertaligheid via route-prefix.

## Mappenstructuur

```
warme-babbel/
├── docs/                    Analyse, requirements, architectuur, database, security, deployment, migratie
├── public/                  Statische assets, embed.js
├── scripts/                 Lokale Postgres, migraties toepassen, WP-exportanalyse
├── src/
│   ├── app/                 Routes (App Router)
│   ├── components/          UI-componenten
│   ├── emails/              E-mailtemplates (HTML)
│   ├── lib/                 Supabase clients, auth-helpers, validatie, utils
│   └── middleware.ts
├── supabase/
│   ├── migrations/          Versioned SQL
│   ├── templates/           Auth e-mailtemplates (fallback SMTP)
│   └── tests/               RLS-tests (draaien tegen echte Postgres)
├── tests/                   Unit- en e2e-tests
├── netlify.toml
└── next.config.ts
```
