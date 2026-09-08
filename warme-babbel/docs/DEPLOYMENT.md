# Deployment – Warme Babbel app

De app draait op **Netlify** (Next.js Runtime) met **Supabase** als backend en **Resend** voor e-mail.
De bestaande WordPress-site blijft onaangeroerd; de app wordt in een eerste fase via een iframe getoond.

## 0. Vereisten
- GitHub-repository met de map `warme-babbel/` (deze map is de *base directory*).
- Accounts: Netlify (bestaat), Supabase (gratis tier volstaat om te starten), Resend (gratis tier: 3000
  mails/maand) met een geverifieerd domein, bv. `warmebabbel.be` of `mail.warmebabbel.be`.

## 1. Supabase-project aanmaken
1. Maak een project op https://supabase.com/dashboard → **regio: EU (bv. Frankfurt / eu-central-1)** (GDPR).
2. Noteer uit *Project Settings → API*: Project URL, `anon` key en `service_role` key.
3. **Migraties toepassen** – kies één van beide:
   - **SQL Editor**: plak achtereenvolgens `supabase/migrations/0001_schema.sql`, `0002_rls.sql`,
     `0003_storage_realtime.sql` en voer ze uit; of
   - **Supabase CLI** (lokaal): `supabase link --project-ref <ref>` en `supabase db push`.
4. **Authentication → Providers → Email**: aan; "Confirm email" aan; "Secure email change" aan.
5. **Authentication → Settings**: Minimum password length **10**; Password requirements: letters+cijfers
   aanbevolen; **Leaked password protection** aan (Pro-plan) indien beschikbaar.
6. **Authentication → URL Configuration**:
   - Site URL: `https://app.warmebabbel.be` (of de tijdelijke Netlify-URL)
   - Redirect URLs: `https://app.warmebabbel.be/**`, `http://localhost:3000/**`
7. **Authentication → Hooks → Send Email hook**: type *HTTPS*, URL `https://app.warmebabbel.be/api/hooks/auth-email`.
   Genereer een secret en zet het in Netlify als `SUPABASE_AUTH_HOOK_SECRET` (formaat `v1,whsec_…`).
   *Fallback zonder hook*: Authentication → SMTP Settings → Resend (host `smtp.resend.com`, poort 465,
   user `resend`, password = API key) en plak de templates uit `supabase/templates/` in
   Authentication → Email Templates.
8. **Storage**: de buckets `avatars` en `attachments` zijn door migratie 0003 aangemaakt (private).
9. **Database → Replication / Realtime**: controleer dat `messages`, `notifications` en
   `conversation_members` in de publicatie `supabase_realtime` staan (migratie 0003 doet dit).
10. **Eerste beheerder**: registreer via de app, bevestig je e-mail, en voer daarna in de SQL Editor uit:
    ```sql
    update public.profiles set role = 'admin'
    where id = (select id from auth.users where email = 'jij@similes.be');
    ```
    (Daarna verlopen alle rolwijzigingen via `/admin`.)

## 2. Resend
1. Domein toevoegen en DNS-records (SPF/DKIM) plaatsen; wacht op "Verified".
2. API key aanmaken (Sending access) → `RESEND_API_KEY`.
3. `EMAIL_FROM` = `Warme Babbel <noreply@warmebabbel.be>` (moet op het geverifieerde domein zitten).
4. Optioneel `ADMIN_NOTIFY_EMAIL` = adres dat een mail krijgt bij elke nieuwe rapportering.

## 3. Netlify-project
1. **Add new project → Import from Git** → kies de GitHub-repo.
2. **Base directory**: `warme-babbel` · Build command: `npm run build` · Publish directory: `.next`
   (staat ook in `netlify.toml`). Node 22.
3. De **Next.js Runtime** (`@netlify/plugin-nextjs`) wordt automatisch geactiveerd.
4. **Environment variables** (Site configuration → Environment variables):

| Variabele | Waarde |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key (**secret**, nooit `NEXT_PUBLIC_`) |
| `SUPABASE_AUTH_HOOK_SECRET` | `v1,whsec_…` |
| `RESEND_API_KEY` | `re_…` |
| `EMAIL_FROM` | `Warme Babbel <noreply@warmebabbel.be>` |
| `ADMIN_NOTIFY_EMAIL` | optioneel |
| `NEXT_PUBLIC_SITE_URL` | `https://app.warmebabbel.be` |
| `NEXT_PUBLIC_LEGACY_SITE_URL` | `https://warmebabbel.be` |
| `FRAME_ANCESTORS` | optioneel, extra domeinen die mogen embedden |

5. **Deploy**. Controleer `https://<site>.netlify.app/api/health` → `{"ok":true,"supabase":true,"email":true}`.
6. Zet in Supabase de Site URL/Redirect URLs op de definitieve URL (stap 1.6) en de hook-URL (1.7).

## 4. Domein / subdomein
1. Netlify → Domain management → Add domain → `app.warmebabbel.be`.
2. Bij de DNS-beheerder van warmebabbel.be: `CNAME app → <site>.netlify.app` (of Netlify DNS).
3. Netlify zet automatisch een Let's Encrypt-certificaat (HTTPS + HSTS-header staat in de config).
4. Werk `NEXT_PUBLIC_SITE_URL` en de Supabase-URL's bij en redeploy.

De app is URL-onafhankelijk: enkel `NEXT_PUBLIC_SITE_URL` (links in e-mails) en de Supabase-redirectlijst
kennen het domein.

## 5. Productie testen (checklist)
1. `/api/health` geeft `ok`.
2. Registreer een testaccount → bevestigingsmail van Resend komt aan → link werkt → `/mijn-profiel?welkom=1`.
3. Wachtwoord vergeten → mail → nieuw wachtwoord → inloggen.
4. Admin: zet een tweede testaccount op rol *Warme Babbelaar* + lijststatus *Goedgekeurd* → verschijnt op `/profielen`.
5. Account A → profiel babbelaar → "Stuur een bericht" → bericht → account B (ander toestel/incognito) ziet het
   realtime en krijgt na een paar minuten een e-mail als B het gesprek niet open heeft.
6. Blokkeren, rapporteren, melding afhandelen in `/admin/rapporteringen`.
7. Account verwijderen in `/instellingen`.
8. Voer `npm run test:e2e` uit tegen productie/staging met `E2E_BASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (maakt en verwijdert eigen testaccounts).

## 6. Iframe-integratie in warmebabbel.be (overgangsfase)

> Dit vereist enkel een nieuwe pagina of blok in WordPress. Er wordt niets aan bestaande functionaliteit
> gewijzigd. Voer dit pas uit na overleg.

1. Maak in WordPress een pagina (bv. "Zoek een Warme Babbelaar – nieuw") met een **Aangepaste HTML**-blok:
   ```html
   <iframe id="warme-babbel" src="https://app.warmebabbel.be/profielen?embed=1"
           title="Warme Babbel" style="width:100%;border:0;min-height:700px"
           allow="clipboard-write" loading="lazy"></iframe>
   <script src="https://app.warmebabbel.be/embed.js" data-iframe="warme-babbel" defer></script>
   ```
   `embed.js` past de hoogte automatisch aan (postMessage) en scrolt naar boven bij navigatie.
2. **Deeplinks** in de iframe: `?embed=1` bewaart de embed-modus in een cookie, dus `/profiel/<id>`, `/chat`,
   `/chat/<id>` werken ook binnen de iframe. Een menu-item in WordPress kan naar
   `https://app.warmebabbel.be/profielen` linken (buiten iframe) zodra gewenst.
3. **Headers**: de app stuurt `Content-Security-Policy: frame-ancestors 'self' https://warmebabbel.be
   https://www.warmebabbel.be`. Andere domeinen (staging) toevoegen via `FRAME_ANCESTORS`.
4. **Cookies / login in de iframe**: Safari en Firefox blokkeren third-party cookies. Inloggen *binnen* de
   iframe kan daar mislukken. Aanbevolen strategie:
   - Fase 1: iframe voor **ontdekken** (`/profielen`, `/profiel/[id]`); de knop "Log in om een bericht te
     sturen" openen in een nieuw venster: voeg in WordPress `target="_top"`-gedrag toe via de link
     `https://app.warmebabbel.be/inloggen` in de tekst rond de iframe, of gebruik de app rechtstreeks.
   - Fase 2: verwijs vanuit WordPress rechtstreeks naar `app.warmebabbel.be` (geen iframe meer) – dit is de
     aanbevolen eindsituatie.
   - Alternatief: de app op hetzelfde registrable domein (`app.warmebabbel.be` onder `warmebabbel.be`) telt
     in Chrome als first-party; Safari (ITP) partitioneert alsnog in iframes.
5. **Hoogte**: geen vaste hoogtes in de app; `min-height` in de iframe is een fallback tot `embed.js` laadt.
6. **Mobiel**: de app is mobile-first; de WordPress-container moet volledige breedte toelaten (het thema heeft
   een full-width template, zie `ANALYSIS.md`).

## 7. Volledige overschakeling (later)
1. WordPress-menu's laten verwijzen naar `app.warmebabbel.be`.
2. Inhoudspagina's (Hoe?, Tips, Help, Privacybeleid) overzetten naar de app (should-have S8) of laten staan.
3. DNS voor `warmebabbel.be` naar Netlify; WordPress naar `oud.warmebabbel.be` of uitschakelen; redirects
   in `netlify.toml` (`/met-wie/ → /profielen`, `/user/* → /profielen`, `/login/ → /inloggen`, …).

## 8. Lokaal ontwikkelen
```bash
cd warme-babbel
cp .env.example .env.local     # vul Supabase/Resend in
npm install
npm run dev                    # http://localhost:3000
npm run typecheck && npm run lint && npm run test:unit
npm run db:local:start && npm run test:rls
```
