# Doorverwijsgids Similes: beslissingsboom

Een webpagina die een vrijwilliger of medewerker tijdens een gesprek stap voor stap naar de juiste doorverwijzing leidt. Gebaseerd op de Doorverwijsgids Similes (werkversie van 2026-11-03).

- Begint altijd met de vraag of er acuut gevaar is. Noodnummers staan vast bovenaan.
- Toont per stap wat je de beller kan vragen en wat je kan zeggen.
- Toont alleen nagekeken fiches als doorverwijzing. Fiches die nog niet nagekeken zijn, staan apart, zonder telefoonnummers, met de waarschuwing uit de gids.
- Zoekveld op organisatie of trefwoord (druk `/`).
- Toetsen: cijfers kiezen een optie, `Backspace` gaat terug, `Esc` begint opnieuw.
- Knop "Kopieer samenvatting" zet de doorverwijzing in het klembord voor je notities.
- Werkt zonder server, zonder database en zonder externe bibliotheken. Ook op een smartphone en in donkere modus. Afdrukbaar.
- De gevolgde weg staat in de adresbalk (`#start/wie/naaste`), zodat je een stap kan delen of bookmarken.

## Bestanden

| Bestand | Wat |
| --- | --- |
| `index.html` | De pagina. |
| `style.css` | Opmaak. |
| `app.js` | De viewer. Hoef je niet aan te passen om de inhoud te wijzigen. |
| `data/boom.js` | **De beslissingsboom**: vragen, keuzes, voorbeeldzinnen en welke fiches bij welke stap horen. |
| `data/fiches.js` | **De fiches**: alle organisaties met status, contactgegevens, uren, kosten en "Let op". Gegenereerd uit de markdown-gids. |
| `check.mjs` | Controleert of de boom sluitend is (`node doorverwijsgids/check.mjs`). |

## Hosten

De map is volledig statisch. Kies wat het makkelijkst is:

1. **Eigen webserver of hosting van de website**: upload de hele map `doorverwijsgids/` via FTP of de bestandsbeheerder naar bijvoorbeeld `https://www.similes.be/doorverwijsgids/`. Klaar.
2. **GitHub Pages of Netlify (deze repo)**: bij `npm run build` wordt de map automatisch meegekopieerd naar `out/doorverwijsgids/`. Na een deploy staat de gids dus op `https://<site>/doorverwijsgids/`.
3. **Zonder hosting**: open `index.html` rechtstreeks in een browser, bijvoorbeeld vanaf een USB-stick of een gedeelde map. Alles werkt ook zo.

Wil je de pagina afschermen voor vrijwilligers, zet er dan een wachtwoord op via de hosting (bijvoorbeeld "password protection" bij Netlify of een `.htaccess` op een eigen server). De pagina zelf bevat geen wachtwoord, want alles erin staat ook op de websites van de organisaties.

## Inhoud aanpassen

### De boom

Open `data/boom.js`. Elke stap heeft een naam (bijvoorbeeld `naaste-praten`) en deze velden:

```js
"naaste-praten": {
  vraag: "Praten als naaste",                      // titel of vraag
  uitleg: "Korte toelichting voor de vrijwilliger.",
  vraagTip: "Wat je de beller kan vragen.",        // optioneel
  zeg: "Voorbeeldzin voor de beller.",             // optioneel
  alert: { soort: "letop", tekst: "..." },         // optioneel, soort "gevaar" of "letop"
  fiches: ["DG-004", "DG-010"],                    // nagekeken fiches om naar te verwijzen
  nietNagekeken: ["DG-105"],                       // fiches die nog niet nagekeken zijn
  opties: [                                        // keuzes naar een volgende stap
    { label: "Ook lotgenoten ontmoeten", uitleg: "optioneel", naar: "naaste-lotgenoten" }
  ]
}
```

Een stap mag alleen keuzes hebben, alleen fiches, of allebei. Na een wijziging:

```
node doorverwijsgids/check.mjs
```

Het script meldt fiches die niet bestaan, stappen die nergens naartoe leiden, stappen die onbereikbaar zijn, en nagekeken fiches die onder `nietNagekeken` staan of omgekeerd.

### De fiches

`data/fiches.js` is gegenereerd uit de markdown-werkversie van de gids. Wordt een fiche nagekeken (status `Bevestigd` of `Deels bevestigd`), dan toont de viewer ze automatisch volledig, en wijst `check.mjs` erop dat ze in de boom van `nietNagekeken` naar `fiches` mag verhuizen.

Kleine correcties kan je rechtstreeks in `data/fiches.js` doen. Voor een nieuwe versie van de gids genereer je het bestand opnieuw met `tools/parse_fiches.py` (`python3 doorverwijsgids/tools/parse_fiches.py <gids.md> doorverwijsgids/data/fiches.js`), of je past de velden met de hand aan. Het formaat is gewone JSON met de velden `id`, `ids`, `naam`, `deel`, `soort`, `status`, `gecontroleerd`, `waarvoor`, `voorWie`, `voorNaasten`, `regio`, `telefoon`, `chat`, `mail`, `website`, `uren`, `kosten`, `anoniem`, `letOp`, `trefwoorden` en `bron`.

## Regels die in de viewer zijn ingebouwd

- Fiches met status `Niet gecontroleerd`, `Niet gevonden` of `Intern te bevestigen` tonen alleen naam, website en de waarschuwing. Telefoonnummers en gegevens uit 2023 worden nooit getoond.
- Het veld `Let op` staat altijd zichtbaar bij elke fiche.
- Acute crisishulp, suïcidale gedachten, rouw na zelfdoding en levenseinde of euthanasie zijn aparte routes. De route rond euthanasie vraagt eerst of er een crisis is.
- De negen gebruiksregels van de gids staan onderaan elke pagina.
