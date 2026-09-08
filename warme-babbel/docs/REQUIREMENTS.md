# Functionele specificatie – nieuwe Warme Babbel-applicatie

Gebaseerd op de audit in `ANALYSIS.md`. Prioritering volgens MoSCoW.

## Rollen

| Rol | Omschrijving |
|---|---|
| **Bezoeker** | Niet ingelogd. Ziet de landingsinhoud en de lijst van Warme Babbelaars (beperkte weergave), kan registreren en inloggen. |
| **Babbelzoeker** (`seeker`) | Familielid/naaste met account. Kan babbelaarsprofielen bekijken, een privégesprek starten, eigen (niet-publiek) profiel beheren. |
| **Warme Babbelaar** (`listener`) | Vrijwilliger. Heeft een zichtbaar profiel in de directory (na goedkeuring), ontvangt en beantwoordt berichten, kan zich "even niet beschikbaar" zetten of het profiel verbergen. Kan profielen van babbelzoekers zien met wie hij/zij een gesprek heeft. |
| **Beheerder** (`admin`) | Similes-medewerker/coördinator. Beheert gebruikers, keurt babbelaars goed, behandelt rapporteringen, ziet statistieken. |

Een account heeft altijd exact één rol. Rollen worden **door een beheerder** toegekend (behalve `seeker`, de standaard bij registratie). Zelf-promotie is onmogelijk (database-constraint + RLS).

---

## MUST HAVE (MVP)

### Authenticatie & account
- M1. Registreren met e-mailadres + wachtwoord (min. 10 tekens), voornaam en weergavenaam, akkoord met privacybeleid.
- M2. E-mailverificatie vóór gebruik (Supabase Auth; e-mails via Resend).
- M3. Inloggen / uitloggen; sessie blijft behouden (cookie-gebaseerd, server-side gevalideerd).
- M4. Wachtwoord vergeten (resetlink per e-mail) en wachtwoord wijzigen (ingelogd).
- M5. Account verwijderen (met bevestiging). Berichten aan de andere partij blijven leesbaar als "verwijderde gebruiker"; persoonsgegevens worden gewist.
- M6. Geschorste of geblokkeerde accounts kunnen niet inloggen/gebruiken.

### Profielen
- M7. Profiel aanmaken/bewerken met de bestaande velden: weergavenaam, profielfoto, regio (meerdere), thema's, band, contactwijze, leeftijdsgroep, geslacht, "mijn verhaal", zonder afspraak, even niet beschikbaar.
- M8. Profielfoto uploaden (max 5 MB, JPG/PNG/WebP), opgeslagen in private Supabase Storage; weergave via signed URL's.
- M9. Privacy-instellingen: profiel verbergen uit de lijst (listener), e-mailnotificaties aan/uit.
- M10. Babbelzoeker-profiel is **enkel** zichtbaar voor beheerders en voor babbelaars met wie de zoeker een gesprek heeft.

### Ontdekken
- M11. Overzicht van goedgekeurde, zichtbare Warme Babbelaars als profielkaarten (`/profielen`).
- M12. Zoeken op naam/verhaal en filteren op regio, thema, band, contactwijze, leeftijd, geslacht, zonder afspraak; deterministische sortering (beschikbaar eerst, dan naam).
- M13. Profieldetail (`/profiel/[id]`) met CTA "Stuur een bericht" (login vereist).
- M14. Profielpagina's zijn niet indexeerbaar (`noindex`, geen sitemap).

### Privéchat
- M15. Vanuit een profiel een één-op-één-gesprek starten (één gesprek per paar gebruikers).
- M16. Berichten sturen/ontvangen met realtime updates (Supabase Realtime), timestamps, laatste bericht en ongelezen-telling in de gesprekkenlijst (`/chat`, `/chat/[id]`).
- M17. Mobielvriendelijke chat (lijst ↔ gesprek), berichtcomposer met Enter-om-te-verzenden en Shift+Enter voor nieuwe regel.
- M18. In-app notificatie + e-mailnotificatie (Resend) bij een nieuw bericht wanneer de ontvanger het gesprek niet open heeft (max. 1 e-mail per gesprek per 15 minuten).
- M19. Gesprek archiveren (voor jezelf) – nooit berichten van de ander verwijderen.

### Privacy & veiligheid
- M20. Row Level Security op elke tabel; frontend vertrouwt nooit op eigen autorisatie.
- M21. Gebruiker A kan gesprekken/berichten van B niet lezen, wijzigen of verwijderen, ook niet met gemanipuleerde ID's.
- M22. Blokkeren: geblokkeerde gebruikers kunnen elkaar geen berichten meer sturen en zien elkaar niet in de lijst.
- M23. Rapporteren van een profiel, bericht of gesprek met categorie (ongewenst gedrag, spam, ongepaste inhoud, intimidatie, andere) en toelichting.
- M24. Rate limiting op berichten (database-trigger) en Supabase Auth-rate limits.

### Admin
- M25. Aparte adminomgeving `/admin` met role-based access (server-side + RLS).
- M26. Gebruikers bekijken/zoeken, rol wijzigen, babbelaar goedkeuren, schorsen/blokkeren, profiel bekijken.
- M27. Rapporteringen bekijken, in behandeling nemen, afhandelen met moderatienotities; moderatielog.
- M28. Basisstatistieken (aantal gebruikers per rol, gesprekken, berichten, openstaande meldingen).

### Platform
- M29. Draait op Netlify (Next.js Runtime), URL-onafhankelijk (`NEXT_PUBLIC_SITE_URL` enkel voor e-mails), security headers.
- M30. Iframe-compatibel: `frame-ancestors` toegestaan voor warmebabbel.be, responsive zonder vaste hoogtes, `?embed=1`-modus zonder eigen header/footer, deeplinks werken rechtstreeks.
- M31. Toegankelijk (WCAG 2.1 AA-principes): keyboard, focus, labels, contrast, touch targets ≥ 44px.

---

## SHOULD HAVE

- S1. "Warme Babbelplekken" (inloophuis, praatcafé, luisterlijn) als aparte, door admin beheerde entiteit i.p.v. nepgebruikers.
- S2. Uitnodigingsflow voor nieuwe babbelaars (admin nodigt e-mailadres uit; account krijgt automatisch rol listener in status "in review").
- S3. Read receipts ("gelezen") in de chat.
- S4. Bijlagen (afbeeldingen) in berichten (tabel en storage-policies zijn voorzien; UI later).
- S5. Admin-dashboard met grafieken (gesprekken per week, reactietijd babbelaars).
- S6. Automatische herinnering aan babbelaar bij onbeantwoord bericht na 3 dagen.
- S7. Exporteren van eigen gegevens (GDPR-inzage).
- S8. Statische inhoudspagina's (Hoe?, Tips, Help) in de app zodat WordPress volledig kan verdwijnen.

## COULD HAVE

- C1. Typing indicator en online-status (Realtime Presence).
- C2. Feedbackformulier na een babbel (anoniem mogelijk).
- C3. Meertaligheid (FR).
- C4. Push-notificaties (web push).
- C5. Zoekmachine-optimalisatie van landingspagina (niet van profielen).
- C6. Magic-link login / passkeys.

## NOT REQUIRED (bewust niet overgenomen)

- N1. UM Groups, uitnodigingen, groepsfunctionaliteit (inactief op de huidige site).
- N2. Omslagfoto's (geen functionele waarde; verhoogt privacyrisico en opslag).
- N3. Gebruikersnaam als apart loginveld (login met e-mailadres; weergavenaam vrij te kiezen).
- N4. Publieke `/members/`-directory van álle leden.
- N5. Voornaam/achternaam verplicht voor babbelzoekers (dataminimalisatie: enkel weergavenaam).
- N6. Third-party tracking (Google Analytics, cookiebanner) – geen cookies buiten de sessie.
- N7. Cover photo cropper, Typekit-fonts, jQuery-stack.

---

## Verbeteringen t.o.v. de huidige site

| Huidig | Nieuw |
|---|---|
| Berichten via page reload/polling | Realtime chat met ongelezen-tellers en notificaties |
| Privacy via plugin-instellingen | Database-afgedwongen privacy (RLS) + tests |
| Ongepast gedrag melden via e-mail | Block & report in-app met adminworkflow en audittrail |
| Moderatie in wp-admin | Eigen adminomgeving met zoeken, statussen, notities, statistieken |
| Babbelaarsverhalen publiek en indexeerbaar | Lijst laagdrempelig, maar `noindex`, zichtbaarheid instelbaar |
| Locaties als gebruikers | Aparte "plekken" (should-have) |
| Directory met duplicaten | Deterministische, gepagineerde query |
| Zware pagina met ~50 scripts | Slanke Next.js-app, mobile-first, geen third-party scripts |
| Gebruikersnaam + voornaam + achternaam verplicht | Dataminimalisatie: e-mail + weergavenaam |
| Geen accessibility-aandacht | Semantische HTML, keyboardnavigatie, focus states, contrast |
