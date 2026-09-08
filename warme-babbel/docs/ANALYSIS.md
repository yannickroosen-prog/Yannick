# Technische audit van warmebabbel.be (bestaande WordPress-site)

> Datum audit: 8 september 2026
> Scope: uitsluitend **read-only** analyse van de publieke website, de publieke WordPress REST API en de
> publieke AJAX-endpoints die de site zelf gebruikt. Er is **niets gewijzigd** op de bestaande omgeving.
> Er waren **geen wp-admin-credentials** beschikbaar in deze sessie; alles wat hieronder over de
> adminomgeving staat is afgeleid uit publiek zichtbare informatie (plugin-assets, REST-namespaces,
> formulierstructuur, front-end templates) en wordt als "afgeleid" gemarkeerd.

---

## 1. Samenvatting

Warme Babbel is een WordPress-site van Similes vzw waar **familieleden van mensen met psychische
problemen** ("babbelzoekers") in contact kunnen komen met **ervaringsdeskundige vrijwilligers**
("Warme Babbelaars") voor een eenmalig, gratis gesprek: live, per telefoon, videocall, e-mail of samen
naar een Similes-activiteit.

De volledige gebruikersfunctionaliteit draait op de plugin **Ultimate Member** (UM) met extensies:

| Functie | Implementatie |
|---|---|
| Registratie, login, wachtwoord reset, account | Ultimate Member core (formulieren `um_form`) |
| Profielen met custom velden | UM core + `um-user-tags` (velden als taxonomie-tags) |
| Ledendirectory met filters | UM directory (`um_directory` #77 "Warme Babbelaars", hash `hKZ4A`) |
| Privéberichten | `um-messaging` (UM Private Messages, betalende extensie) |
| Groepen / uitnodigingen / notificaties | Pagina's bestaan, maar shortcodes renderen als ruwe tekst → extensies **niet (meer) actief** |
| Contact-/probleem-/feedbackformulieren | Contact Form 7 + reCAPTCHA |
| Getuigenissen | Strong Testimonials (CPT `wpm-testimonial`) |
| Beveiliging | Wordfence + Wordfence Login Security |
| Cookies | CookieYes |
| Analytics | Google Site Kit (GA4 via gtag) |
| Redirects | Redirection |
| Thema | `um-theme` (UM-thema) met child-thema "Warme Babbel UM Theme" (Companen) |

Kernproblemen van de huidige opzet (relevant voor de herbouw):

1. **Privacy-model is plugin-gedreven, niet database-gedreven.** Wie wat mag zien hangt af van UM-instellingen
   en templates. De ledendirectory op de homepage toont profielen en verhalen van Warme Babbelaars
   **zonder login** (inclusief foto en volledige "mijn verhaal").
2. **Chat is niet realtime.** UM Private Messages werkt met page reloads/AJAX-polling en een e-mailmelding.
3. **Dubbele/inconsistente data**: de directory geeft per pagina duplicaten (bv. "Maarten", "Ludo", "Lenny",
   "Ellis", "JORIS" komen 2× voor over pagina 1 en 2 door onstabiele sortering); de directory rapporteert
   21 gebruikers maar er zijn ~16 unieke profielen.
4. **Fysieke locaties zijn "gebruikers"**: het Inloophuis Kempen, de Warme Babbelplek Grimbergen en het
   Praatcafé Hasselt zijn UM-gebruikersaccounts met een profiel (workaround).
5. **Geen block/report-functionaliteit** voor gebruikers; ongepast gedrag moet per e-mail gemeld worden.
6. **Geen aparte adminomgeving**: moderatie gebeurt in wp-admin (UM > Users) en is niet zichtbaar in de
   publieke laag.
7. **Zware front-end**: homepage 145 kB HTML + ~50 scripts (jQuery, UM, masonry, select2, cropper,
   recaptcha, gtag, cookieyes, typekit-fonts).

---

## 2. Technische fingerprint

| Item | Waarde |
|---|---|
| Webserver | nginx (HTTP/2) |
| CMS | WordPress (recent: `wp-abilities/v1` en `wp-img-auto-sizes` aanwezig → WP 6.9+) |
| Taal | `nl-NL` |
| REST root | `https://warmebabbel.be/wp-json/` (308 routes) |
| REST namespaces | `oembed/1.0`, `contact-form-7/v1`, `cky/v1` (CookieYes), `redirection/v1`, `strong-testimonials/v1`, `wpchill/v1`, `wordfence-login-security/v1`, `wordfence/v1`, `genesisblocks/v1`, `google-site-kit/v1`, `font-awesome/v1`, `wp/v2`, `wp-site-health/v1`, `wp-block-editor/v1`, `wp-abilities/v1` |
| Sitemap | `wp-sitemap.xml` (posts, pages, `wpm-testimonial`, categories) |
| robots.txt | Alleen `/wp-admin/` disallow; **profielpagina's (`/user/…`) zijn indexeerbaar** |
| Security headers | Geen `X-Frame-Options`, geen `Content-Security-Policy`, geen `Strict-Transport-Security`, geen `Referrer-Policy` op de homepage |
| Cookie bij eerste bezoek | `um-register-profile-photo` (UM registratie-foto sessie) |
| Fonts | Adobe Typekit (`myriad-pro` body, `foco` italic koppen) + Google Fonts Open Sans (thema) + Font Awesome |
| Kleuren (child-thema) | `--red: #b41411`, `--orange: #e74c0a`, `--beige: #f1f0ea`; tekst `#333/#444`, wit |
| Logo | "Warme Babbel" woordmerk in rood/oranje met tekstballon-motief (`Logo-warme-babbel.png`, 985×500) |
| Standaard avatar | `Similes_warmebabbel_avatar1.png` (418×418) |
| Standaard omslagfoto | `Similes_warmebabbel_omslagfoto.png` (2827×1047) |

### Geïnventariseerde plugins (afgeleid uit assets/REST)

| Plugin | Bewijs | Rol |
|---|---|---|
| Ultimate Member | 47 asset-verwijzingen, CPT's `um_form`, `um_directory` | Accounts, profielen, directory |
| UM – User Tags (`um-user-tags`) | JS `um-user-tags-members.min.js`, filter-URL's `/members/filter/<slug>/?tag_field=regio` | Profielvelden regio/thema/band/… als taxonomie-tags |
| UM – Private Messages (`um-messaging`) | CSS/JS, `message_button` in directory-JSON, `?profiletab=messages` in Help | Privéberichten |
| UM – Groups | Pagina's `groepen`, `mijn-groepen`, `nieuwe-groep-aanmaken`, `mijn-uitnodigingen` met niet-gerenderde shortcodes | **Inactief** |
| UM – Real-time Notifications | Pagina `notificaties` (leeg); child-CSS bevat `.um-notification-*` regels | Waarschijnlijk **inactief** of enkel voor ingelogde gebruikers |
| Contact Form 7 (+ reCAPTCHA v3) | JS, REST `contact-form-7/v1` | Contact, "Lukt er iets niet?", feedback |
| Strong Testimonials | CPT `wpm-testimonial`, slider-JS | 9 getuigenissen op homepage |
| Wordfence + Login Security | REST namespaces | Firewall, 2FA/passkeys voor admin |
| CookieYes | REST `cky/v1`, extern script | Cookiebanner |
| Google Site Kit | generator-tag `Site Kit by Google 1.187.0`, gtag | Analytics |
| Redirection | REST `redirection/v1` | Redirects (bv. `/user/` → `/`, `/account/` → `/login/?redirect_to=…`) |
| Genesis Blocks | CSS/JS | Gutenberg-layoutblokken |
| Font Awesome (officiële plugin) | REST `font-awesome/v1` | Iconen |
| wpchill | REST `wpchill/v1` | Notificatiekader van Strong Testimonials |

### Thema

- Parent: `um-theme` (Ultimate Member Theme). Child: **"Warme Babbel UM Theme"** door Companen (companen.be),
  versie 1.0.0. Child-CSS importeert Typekit-fonts en definieert de merkkleuren.
- Layout: Bootstrap-achtige containers (`boot-container-fluid`), homepage zonder sidebar
  (`template-parts/template-nosidebar.php`), zelfde template voor `/met-wie/`.

---

## 3. Publieke pagina's

Alle pagina's uit `wp-sitemap-posts-page-1.xml` en `wp/v2/pages` (22 pagina's).

| ID | URL | Titel | Doel | Functionaliteit / formulieren | CTA's |
|---|---|---|---|---|---|
| 57 | `/` | Warme Babbel (homepagina) | Landingspagina + directory | UM directory `hKZ4A` (grid, filters), testimonial-slider, secties Inloophuis/Luisterlijn | "💬 Zoek een Warme Babbelaar" (#onze-warme-babbelaars), "🏠 Inloophuis & Warme Babbelplek", "☎️ Luisterlijn", "Privé bericht" per kaart (→ login), "Stuur ons een mailtje" (mailto kristin.thorisaen@similes.be; info@similes.be) |
| 37 | `/met-wie/` | Met wie? | Directory-pagina | Zelfde UM-directory met filters regio, thema, band, contactwijze, leeftijd, geslacht, zonder afspraak | Profielkaarten → `/user/<slug>/` |
| 40 | `/hoe/` | Hoe vraag je jouw Warme Babbel aan? | Uitleg stappenplan | Quicklinks (registreren, inloggen, wachtwoord vergeten, help); CF7-formulier "Lukt er iets niet?" (naam, e-mail, onderwerp, omschrijving) | Registreer je / Inloggen / tips / feedbackformulier |
| 42 | `/tips/` | Tips | Gesprekstips voor babbelzoekers | Inhoudelijk; voorbeeldbericht; link naar feedbackformulier | "Zoek een warme babbel" |
| 44 | `/over-similes/` | Over Similes | Info over de vereniging | Statisch | "Ontdek de missie & visie", "Ontdek onze andere activiteiten" (externe links) |
| 131 | `/vrijwilliger-worden/` | Word Warme Babbelaar | Werving vrijwilligers | Statisch; externe links naar Similes-formulier & infosessies; Cera/Good Company-vermelding | "Meld je aan als kandidaat-vrijwilliger" (extern) |
| 129 | `/contact/` | Contact | Contactformulier | CF7: `your-name`, `your-email`, `your-message` | — |
| 1042 | `/help/` | Help | FAQ voor Warme Babbelaars (login, profiel, foto, beschikbaarheid, verbergen profiel, berichten, verwijderen gesprek, ongepast gedrag) | CF7 "Niet gevonden wat je zocht?" (naam, e-mail, onderwerp, probleem) | — |
| 3 | `/privacybeleid/` | Privacybeleid | GDPR-tekst Similes vzw (KBO BE 0413.066.283, Groeneweg 151, 3001 Heverlee) | Statisch | — |
| 25 | `/registreren/` | Registreren | Registratie **babbelzoeker** (UM form #79 "Registreer je als Babbelzoeker") | Velden: gebruikersnaam*, voornaam, achternaam, e-mail*, wachtwoord*, bevestiging*, privacy-akkoord (GDPR-checkbox), honeypot | Link naar inloggen |
| 678 | `/registreer-je-als-warme-babbelaar/` | Registreer je als Warme Babbelaar | Registratie **vrijwilliger** (UM form #76) — niet gelinkt in menu, enkel op uitnodiging | Velden: zie §5 | — |
| 24 | `/login/` | Inloggen | UM login form #15 | gebruikersnaam of e-mail, wachtwoord, "aangemeld blijven", honeypot | Registreren, Wachtwoord vergeten? |
| 29 | `/password-reset/` | Wachtwoord herstellen | UM reset | gebruikersnaam of e-mail | — |
| 28 | `/account/` | Account | UM account (tabs: algemeen, wachtwoord `/account/password/`, privacy `/account/privacy/`, verwijderen) | Redirect naar login indien niet ingelogd | — |
| 23 | `/user/` | Gebruiker | UM profielpagina (`/user/<slug>/`, `?um_action=edit`, `?profiletab=messages`) | Profiel bekijken/bewerken, foto & omslagfoto uploaden (cropper), berichten-tab | "Privé bericht" |
| 26 | `/members/` | Leden | UM directory #17 "Members" (default; toont omslagfoto, avatar, naam, berichtknop) | Filter-URL's `/members/filter/<tag>/?tag_field=<veld>` | — |
| 27 | `/logout/` | Uitloggen | UM logout → redirect naar `/` | — | — |
| 22 | `/notificaties/` | Notificaties | UM Notifications (leeg gerenderd) | Inactief | — |
| 18–21 | `/groepen/`, `/nieuwe-groep-aanmaken/`, `/mijn-groepen/`, `/mijn-uitnodigingen/` | Groepen | UM Groups-shortcodes worden **als ruwe tekst** getoond (`[ultimatemember_groups]` …) | Inactief / verweesd | — |

Overige content:
- **Berichten (posts)**: enkel `hello-world` (ongebruikt).
- **Getuigenissen** (`wpm-testimonial`, 9 stuks), o.a. "Alleen iemand die hetzelfde meemaakte weet hoe het
  echt is.", "Ik kon vrij praten, zonder angst voor een oordeel.", "Amai, dat luchtte op. Ik kan weer
  verder." — bruikbaar als citaten in de nieuwe app.
- **Media**: logo's (Warme Babbel, Similes, Cera, Vlaanderen), hero-foto (shutterstock), locatiefoto's
  (Grimbergen, Hasselt, Kempen), screenshots voor de Help-pagina.

### Navigatie

- Hoofdmenu: Jouw Warme Babbel (`/`), Met wie?, Hoe?, Tips, Over Similes, Word Warme Babbelaar, Inloggen
  (avatar-dropdown als ingelogd).
- Footer: Similes vzw, info@similes.be, 016 244 201, activiteitenkalender (activiteiten.similes.be),
  Word Warme Babbelaar, Contact, Over Similes, Privacybeleid, Help, nieuwsbrief (nl.similes.be),
  "Met de steun van" Cera + Vlaanderen, social links (Facebook, Instagram, LinkedIn, Twitter).

### Homepage-inhoud (samengevat)

1. Hero "Nood aan een warme babbel?" met 3 CTA-knoppen.
2. "Wat is een Warme Babbel?" — uitleg.
3. "Wie zijn de Warme Babbelaars?" — uitleg + directory met filters.
4. "Ervaringen" — testimonial-slider.
5. "🏠 Inloophuis & Warme Babbelplek" — 3 locatiekaarten (Turnhout, Grimbergen, Hasselt) → UM-profielen.
6. "☎️ Luisterlijn" — 016 244 200, ma–vr 10–12u, wo (even weken) 19–21u.

---

## 4. Gebruikers en rollen

### Soorten gebruikers (afgeleid)

| Type | Hoe aangemaakt | Zichtbaarheid | Opmerking |
|---|---|---|---|
| **Babbelzoeker** (familielid/naaste) | Zelfregistratie via `/registreren/` (UM form #79) + e-mailactivatie | Profiel **niet** zichtbaar voor bezoekers; enkel voor admin en Warme Babbelaars (bron: Tips-pagina) | Kan Warme Babbelaars een privébericht sturen |
| **Warme Babbelaar** (vrijwilliger) | Registratie via verborgen pagina `/registreer-je-als-warme-babbelaar/` (UM form #76) na e-mailcontact met info@similes.be; account moet door admin **goedgekeurd** worden (profiel toont "status Goedgekeurd") | Profiel **publiek** in directory (ook zonder login) | Kan zichzelf "Even niet beschikbaar" zetten of profiel verbergen |
| **Locatie-account** (Inloophuis, Warme Babbelplek, Praatcafé) | Handmatig door admin | Publiek in directory | Workaround: geen echte persoon |
| **Beheerder** | WordPress-admin | wp-admin + UM | Modereert via wp-admin; geen aparte tooling |
| **Vrijwilligerscoördinator** ("Suzanne of Laetitia") | genoemd in Help | — | Ontvangt meldingen van ongepast gedrag per e-mail/telefoon |

UM-rollen zelf zijn niet publiek opvraagbaar; de directory-JSON geeft `role: "undefined"` en
`account_status_name: "onbepaald"` voor anonieme bezoekers. Waarschijnlijk (afgeleid) bestaan er twee
UM-rollen (bv. "Warme Babbelaar" en "Babbelzoeker") met verschillende profielformulieren:
`um_form` #75 "Profiel Warme babbelaar" en #744 "Profiel Babbelzoeker".

### Registratie-/loginflow

1. Registratie (UM) → e-mail met activatielink ("Na registratie ontvang je een bevestigingsmail").
2. Login met gebruikersnaam **of** e-mailadres + wachtwoord, "aangemeld blijven".
3. Wachtwoord vergeten → e-mail met resetlink (`/password-reset/`).
4. Wachtwoord wijzigen → `/account/password/` (huidig + nieuw + bevestiging).
5. Uitloggen → avatar-dropdown of `/logout/`.
6. Account verwijderen → UM Account-tab "Verwijderen" (standaard in UM; niet geverifieerd zonder login).
7. Anti-spam: honeypot-veld ("Only fill in if you are not human"), reCAPTCHA op CF7, Wordfence.

### Hoe gebruikers communiceren

- Vanuit een profielkaart of profielpagina: knop **"Privé bericht"** (`data-message_to=<user_id>`); niet
  ingelogd → redirect naar `/login/?redirect_to=…`.
- Berichten worden bekeken op `/user/<slug>/?profiletab=messages` met gesprekkenlijst in zijbalk.
- Nieuw bericht: e-mailmelding + rood cijfer bij e-mail-icoon (UM Messaging).
- Gesprek verwijderen via vuilbak-icoon (Help waarschuwt: verwijder niet bij ongewenst gedrag, meld het).
- Verdere afspraak (telefoon/ontmoeting/video) gebeurt **buiten** het platform.

---

## 5. Profielvelden (uit UM-formulier #76 en directory-JSON)

| Meta-key (UM) | Label | Type | Verplicht | Opties |
|---|---|---|---|---|
| `user_login` | Gebruikersnaam | tekst | ja | — (wordt display name / URL-slug) |
| `first_name` | Voornaam | tekst | ja (babbelaar) / nee (zoeker) | |
| `last_name` | Achternaam | tekst | ja (babbelaar) / nee (zoeker) | |
| `user_email` | E-mailadres | e-mail | ja | |
| `user_password` + `confirm_user_password` | Wachtwoord | | ja | |
| `register_profile_photo` / `profile_photo` | Profielfoto | upload + crop | ja (babbelaar) | opgeslagen in `wp-content/uploads/ultimatemember/<user_id>/profile_photo-*.jpg` |
| `cover_photo` | Omslagfoto | upload | nee | standaard `Similes_warmebabbel_omslagfoto.png` |
| `regio` | Regio | user-tag (multi) | ja | Antwerpen: Kempen · Antwerpen: regio Antwerpen · Antwerpen: Rivierenland · Brussel · Limburg: regio Limburg · niet regio-specifiek · Oost-Vlaanderen: Denderregio · Oost-Vlaanderen: regio Gent · Oost-Vlaanderen: Vlaamse Ardennen · Oost-Vlaanderen: Waasland · Vlaams-Brabant: Halle-Vilvoorde · Vlaams-Brabant: Oost-Brabant · West-Vlaanderen: Midwest · West-Vlaanderen: regio Brugge · West-Vlaanderen: regio Oostende · West-Vlaanderen: Westhoek · West-Vlaanderen: Zuid-West-Vlaanderen |
| `problematiek` | Thema | user-tag (multi) | ja | Allerlei thema's · Ander thema · Autisme · Borderline · Depressie · Eetstoornissen · Euthanasie · Internering · Narcisme · Psychose · Suïcide · Verslaving |
| `relatie` | Band | user-tag (multi) | ja | (ex)Partner van · Andere band · Broer/zus van · Grootouder van · Kind van · Ouder van · Vriend van |
| `zonder-afspraak` | Zonder afspraak | checkbox-tag | nee | "zonder afspraak" (voor inloophuizen/praatcafés) |
| `contactwijze` | Contactwijze | user-tag (multi) | ja | E-mail · Ontmoeting · Samen naar Similes activiteit · Telefoon · Videocall |
| `leeftijd` | Leeftijd | user-tag (single) | ja | 20-er · 30-er · 40-er · 50-er · 60-er · 70-er · 80-er |
| `geslacht` | Geslacht | user-tag (single) | ja | Man · Vrouw · X |
| `mijn_verhaal` | Mijn verhaal | textarea (HTML toegelaten) | ja (babbelaar) | 170–2500 tekens in de praktijk |
| `Even-niet-beschikbaar` | Even niet beschikbaar | checkbox | nee | toont badge op kaart; 3 van 16 babbelaars staan momenteel op niet-beschikbaar |
| `use_gdpr_agreement` / `use_terms_conditions_agreement` | Privacy-akkoord | checkbox | ja | |
| UM-intern | `account_status` (approved/awaiting_admin_review/…), `hide_in_members` (verberg profiel), `role` | | | |

Publiek zichtbaar op een babbelaarsprofiel (zonder login): display name (= gebruikersnaam), profielfoto,
omslagfoto, regio, thema, band, contactwijze, leeftijd, geslacht, zonder-afspraak, mijn verhaal,
beschikbaarheidsbadge, accountstatus-melding ("Deze gebruikersaccount status is Goedgekeurd").
**Niet** publiek: e-mail, voornaam/achternaam (display name is de gebruikersnaam), wachtwoord, berichten.

Babbelzoeker-profiel (form #744, afgeleid): zelfde velden maar optioneel; alleen zichtbaar voor admin en
Warme Babbelaars.

### Feitelijke data in de directory (peiling 8/9/2026)

- 21 kaarten over 2 pagina's, **16 unieke** profielen (5 duplicaten door onstabiele sortering).
- 13 personen + 3 locaties (Inloophuis Kempen, Warme Babbelplek Grimbergen, Praatcafé Hasselt).
- Regio-verdeling: Kempen 5, regio Antwerpen 4, Denderregio 3, Waasland 3, Brussel 2, Halle-Vilvoorde 2,
  Limburg 1, Brugge 1, Oost-Brabant 1.
- Contactwijze: Ontmoeting 19, E-mail 16, Telefoon 14, Samen naar activiteit 8, Videocall 4.
- Leeftijd: 60-er 7, 70-er 6, 30/40/50-er telkens 2. Geslacht: 11 vrouw, 8 man.
- 3 profielen "Even niet beschikbaar".

---

## 6. Ledendirectory (UM directory)

- Twee directories: #77 "Warme Babbelaars" (hash `hKZ4A`, gebruikt op `/` en `/met-wie/`) en #17 "Members"
  (`/members/`, default UM).
- Data wordt geladen via `POST /wp-admin/admin-ajax.php` `action=um_get_members` met `nonce`,
  `directory_id`, `page` en filterwaarden; respons bevat per gebruiker HTML-snippets (avatar, tags, verhaal,
  message-knop). Filters: `regio`, `problematiek`, `relatie`, `contactwijze`, `leeftijd`, `geslacht`,
  `zonder-afspraak` (select2-dropdowns). Grid-weergave, 12 per pagina, paginatie.
- Directory is **publiek** (geen login vereist), maar de "Privé bericht"-knop stuurt naar login.
- Lege staat: "Er zijn (nog) geen Warme Babbelaars die aan deze criteria voldoen."

---

## 7. Formulieren

| Formulier | Plugin | Velden | Locatie |
|---|---|---|---|
| Registreer je als Babbelzoeker (#79) | UM | zie §5 | `/registreren/` |
| Registreer je als Warme Babbelaar (#76) | UM | zie §5 (volledig) | `/registreer-je-als-warme-babbelaar/` |
| Default Login (#15) | UM | username/e-mail, wachtwoord, remember | `/login/` |
| Password reset | UM | username/e-mail | `/password-reset/` |
| Profiel Warme babbelaar (#75) / Profiel Babbelzoeker (#744) | UM | profielbewerking | `/user/?um_action=edit` |
| Contact | CF7 | your-name, your-email, your-message | `/contact/` |
| Lukt er iets niet? | CF7 | naam, e-mail, onderwerp, omschrijving | `/hoe/`, `/help/` |
| Feedbackformulier | extern (link) | — | gelinkt vanuit `/hoe/` en `/tips/` |
| Kandidaat-vrijwilliger | extern (Similes) | — | `/vrijwilliger-worden/` |

---

## 8. E-mails (afgeleid uit UM-standaard + Help-tekst)

- Activatiemail na registratie (UM "Account Activation Email").
- Wachtwoord-resetmail (UM "Password Reset Email").
- Melding nieuw privébericht (UM Messaging e-mailnotificatie).
- Vermoedelijk ook admin-notificaties bij nieuwe registratie / goedkeuring (UM standaard).
- Afzender/SMTP niet vaststelbaar zonder admin.

---

## 9. WordPress-structuur (afgeleid)

- **Custom post types**: `um_form` (7 formulieren), `um_directory` (2), `wpm-testimonial` (9), standaard
  `post`/`page`/`attachment`/`nav_menu_item`.
- **Taxonomieën** (publiek): `category`, `post_tag`, `nav_menu`, `wp_pattern_category`. De UM User Tags-
  velden zijn in de praktijk **niet-publieke taxonomieën** (`um_user_tag`-achtige registraties per veld —
  slugs zoals `oost-vlaanderen-denderregio`, `allerlei-themas`, `kind-van`, `zestiger`, `dertiger`,
  `vrouw`, term-ID's 17–86).
- **Gebruikersdata** (WordPress-standaard): `wp_users` (login, e-mail, wachtwoord-hash phpass/bcrypt),
  `wp_usermeta` (UM-velden: `first_name`, `last_name`, `profile_photo`, `cover_photo`, `mijn_verhaal`,
  `Even-niet-beschikbaar`, `account_status`, `role`, `hide_in_members`, …) en term-relaties voor de tags.
- **Berichten** (UM Messaging): eigen tabellen `wp_um_conversations` en `wp_um_messages`
  (kolommen o.a. `conversation_id`, `user_a`, `user_b`, `last_updated`; messages: `author`, `recipient`,
  `content`, `time`, `status`) — standaard schema van de extensie, niet geverifieerd.
- **Shortcodes**: `[ultimatemember form_id=…]`, `[ultimatemember_account]`, `[ultimatemember_password]`,
  `[ultimatemember_login]`, `[ultimatemember_directory id=…]`, `[ultimatemember_groups]` (verweesd),
  `[contact-form-7 id=…]`, `[testimonial_view id=1]`.
- **Externe integraties**: Google Analytics (Site Kit), Google reCAPTCHA, CookieYes, Adobe Typekit,
  Font Awesome CDN, Google Fonts, activiteiten.similes.be, nl.similes.be.
- **Publieke REST-API**: `wp/v2/pages`, `posts`, `media`, `um_form` en `um_directory` (enkel
  titels/slugs; geen meta), `wp/v2/users` → **401** (goed), CF7-forms → 403 (goed).

---

## 10. Beveiliging en privacy — observaties (read-only)

| Observatie | Risico | Aanpak in nieuwe app |
|---|---|---|
| Babbelaarsprofielen (foto, verhaal, regio, leeftijd, geslacht) publiek zonder login én indexeerbaar | Persoonsgegevens van vrijwilligers in zoekmachines | Directory blijft laagdrempelig, maar `noindex`, geen sitemap, en zichtbaarheid per profiel instelbaar; volledige verhalen enkel na login (instelbaar) |
| Geen X-Frame-Options/CSP | Clickjacking mogelijk | Security headers in Netlify-config; iframe-embedding enkel vanaf warmebabbel.be |
| Wachtwoordbeleid en 2FA voor gebruikers niet zichtbaar | Zwakke wachtwoorden | Supabase Auth met minimale wachtwoordlengte, leaked-password check, rate limiting |
| Ongepast gedrag enkel via e-mail te melden | Trage moderatie, geen audittrail | Block & report in-app + adminworkflow + moderatielog |
| Berichten via plugin-tabellen zonder rijniveau-beveiliging | Afhankelijk van plugin-code | PostgreSQL RLS op alle tabellen |
| Duplicaten in directory | Verwarrende UX | Deterministische sortering + unieke query |
| Locaties als gebruikersaccounts | Datavervuiling | Aparte entiteit "plekken" (locations) |
| Meerdere trackingscripts (gtag, cookieyes) | Cookies vóór consent (niet gecontroleerd) | Nieuwe app: geen third-party tracking standaard |

---

## 11. Integratie-analyse (iframe in warmebabbel.be)

- warmebabbel.be zet zelf geen `X-Frame-Options`/CSP, en dat is ook niet relevant: de **nieuwe app** wordt in
  WordPress ingebed, dus **onze** headers bepalen of dat mag (`Content-Security-Policy: frame-ancestors
  'self' https://warmebabbel.be https://www.warmebabbel.be`).
- WordPress laat in het blokeditor "Custom HTML"-blok een `<iframe>` toe; de site heeft geen extra iframe-plugin
  nodig. Het thema gebruikt een full-width container op de homepage (geschikt voor een brede iframe).
- Cookies: de app draait op een subdomein (bv. `app.warmebabbel.be`). Supabase-sessiecookies op dat subdomein
  zijn **first-party voor het subdomein**, maar binnen een iframe op `warmebabbel.be` gelden ze als
  third-party in Safari/Firefox (ITP/ETP) → login in iframe kan geblokkeerd worden. Zie `docs/ARCHITECTURE.md`
  §"Iframe-strategie" (aanbeveling: iframe voor ontdekken, "open in nieuw venster"/top-level redirect voor
  inloggen en chatten, of `Partitioned` cookies/CHIPS).
- Deeplinks: `/profielen`, `/profiel/[id]`, `/chat`, `/chat/[id]` moeten rechtstreeks werken; een
  `?embed=1`-parameter of de `Sec-Fetch-Dest: iframe`-header kan de chrome (header/footer) verbergen.

---

## 12. Bronnen geraadpleegd (allemaal GET/leesacties)

- `https://warmebabbel.be/` en alle pagina's uit de sitemap (HTML).
- `https://warmebabbel.be/robots.txt`, `wp-sitemap*.xml`.
- `https://warmebabbel.be/wp-json/` (+ `wp/v2/pages`, `types`, `taxonomies`, `media`, `um_form`,
  `um_directory`, `users` → 401, `contact-form-7/v1/contact-forms` → 403).
- `POST https://warmebabbel.be/wp-admin/admin-ajax.php` `action=um_get_members` (de leesactie die de
  browser zelf uitvoert om de directory te tonen; geen schrijfactie).
- `https://warmebabbel.be/user/ellis/`, `https://warmebabbel.be/user/inloophuis+kempen/` (profielpagina's).
- `wp-content/themes/um-theme-child/style.css`, logo- en avatarbestanden.
- `https://warmebabbel.be/wp-login.php` (enkel HTTP-status; niet ingelogd).

Niet beschikbaar / niet gedaan: wp-admin (geen credentials), databasetoegang, plugininstellingen, UM-rollen,
e-mailtemplates, gebruikersaantallen (babbelzoekers), CF7-ontvangers.
