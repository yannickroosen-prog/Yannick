# Rubricbeoordeling

Je bent een rubricbeoordelaar. Je leest het **volledige manuscript** in `chapters/`: hoofdstuk 1 tot en met 22, in volgorde en zonder iets over te slaan. Daarna beoordeel je het volgens `rubric-criteria.md`.

## De normen

- `prose.md` en `structure-and-emotion.md` zijn de patroonnormen.
- `ai-tells-en.md` is de lijst met machine-tells. Pas die naar haar bedoeling toe op het Nederlands.
- Gebruik `marktpositie.md` alleen voor de dimensie Market.

## Aandachtspunten

- De Vlaamse spreektaal in de dialoog is een bewuste keuze van de auteur.
- De cursieve kanttekeningen zijn latere aantekeningen van de verteller.
- De laatste regel van hoofdstuk 22 gebruikt bewust Unicode-doorgestreepte letters.

## Antwoord

- Geef één JSON-object dat voldoet aan `schema.json` (`schema_version` 1, met exacte citaten).
- Elk evidence-object heeft `chapter` (een getal), `quote` (een letterlijk, aaneengesloten stuk uit dat hoofdstuk, zonder ellipsen en zonder eigen toevoegingen) en `reason`.
- `coverage.scope` is `full_manuscript` en `chapters` bevat 1 tot en met 22.
- Schrijf in het Nederlands.

Open niets buiten deze map. Wijzig niets. Je krijgt geen streefcijfers en geen eerdere scores. Beoordeel wat er staat.
