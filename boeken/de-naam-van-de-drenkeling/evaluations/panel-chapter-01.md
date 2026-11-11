# Leespanel: hoofdstuk 1

Vier gesimuleerde lezers hebben het hoofdstuk blind gelezen. Elke lezer was een aparte subagent van dezelfde modelfamilie en kreeg alleen het leespakket te zien: geen plan, geen brief en geen scores.

- **Onafhankelijkheid:** geïsoleerde subagents, zelfde modelfamilie. Dit zijn geen menselijke lezers.
- **Gelezen versie:** `manuscript/chapters/chapter-01.md`, sha256 `8714a487ab2bc2ed281a9569101ba412853a2e5814229ad63b19c78225b818dc` (versie a1).
- **Pakket:** `work/panel-ch01/packet.md`. Het bevat de drie extra vragen van de auteur.
- **Ruwe verdicten:** `work/panel-ch01/{ann,pieter,sofie,lotte}.json`. Alle vier zijn geldige JSON.
- **Validatie:** niet uitgevoerd met `validate_blind_reader.py`. Het pakket gebruikte het oude citaatformaat zonder passagecatalogus, en de extra auteursvragen vallen buiten het schema. De citaten zijn met de hand gecontroleerd tegen versie a1.

## Uitkomst

| Signaal | Ann (primair) | Pieter (vijandig) | Sofie (aangrenzend) | Lotte (toevallig) | Regel | Uitkomst |
|---|---|---|---|---|---|---|
| Bladzijde omslaan | ja | ja | ja | ja | ≥ 3 van 4 | **geslaagd (4/4)** |
| Waar de aandacht wegzakte | hertogin-zin | vier koningen | hertogin-zin | mist-alinea | twee in dezelfde alinea = hoog | **hoog ticket: alinea 'hertogin / koopman in Amsterdam'** |
| Gevoel | tederheid, knoop in de maag | tegenzin die overgaat in ongemak | lichte beklemming | spanning, knoop in de maag | | |

## Defecten

Een signaal telt als defect wanneer minstens twee lezers het geven of dezelfde passage aanwijzen.

| ID | Passage | Lezers | Soort | Ernst | Status |
|---|---|---|---|---|---|
| P1-01 | 'Ik heb een hertogin verteld … Het is een vak.' (alinea met hofanekdotes) | Ann en Sofie (stoppunt); Pieter, Sofie, Lotte en Ann ('Het is een vak' als zwakste passage of tell) | stoppunt, moraal aan het slot, pose | **hoog** | open: revisie (fase 5) |
| P1-02 | 'als hij over Brooks sprak' | Ann, Pieter, Lotte | continuïteit: naam vóór introductie | middel | **gesloten in a2** (feitelijke herstelling) |
| P1-03 | 'Het was trots, maar trots op een ander.' | Ann, Pieter, Lotte | machineproza: contrast door ontkenning | middel | open: revisie |
| P1-04 | 'Ik wist het, maar ik begreep het niet.' | Sofie, Pieter | moraal aan het slot | laag | open: revisie |
| P1-05 | 'als een kaart die je niet durft uit te spelen, omdat …' | Ann, Pieter | beeld dat meteen wordt uitgelegd | laag | open: revisie |
| P1-06 | 'zoals een mond die iets wil zeggen en het niet doet.' | Sofie, Pieter | beeld dat meteen wordt uitgelegd | laag | open: revisie |
| P1-07 | ''Ge zijt geen zeeman.'' | Ann, Sofie, Lotte (continuity_doubt of confusing, zonder uitleg) | onduidelijk | middel | open: oorzaak niet benoemd door de lezers; aan de auteur voorgelegd |
| P1-08 | Vlaamse spreektaal bij een Engelse jongen | alle vier, onder 'verward door' | stijlkeuze van de auteur | let op | **beslissing van de auteur**: behouden. Zie de vraag aan de auteur |

## Notities van één lezer

Deze zijn bewaard, maar tellen niet als defect.

- **Sofie: 'de plaats waar hij is begraven'.** Parker heeft geen graf, alleen een gedenkteken. Dit is een **feitelijke fout** en is **gesloten in a2**.
- **Pieter: 'het was de tweede keer dat hij dat vroeg'.** De eerste vraag was 'Wat zijt ge dan?' en niet 'Wat doet ge hier?'. Dit is een **continuïteitsfout** en is **gesloten in a2**.
- **Pieter: 'Ik hoop dat hij het heeft weggegooid. Ik vrees dat hij het heeft bewaard.'** Hij noemt dit een cliché. Ann zet dezelfde zin bij wat ze morgen nog weet. De zin blijft staan.
- **Lotte: de mist-alinea.** Ze vond de opening traag, een *slow_start*.
- **Ann en Lotte: 'zesenveertig jaar uit de krant'.** Zie hun vraag hieronder. Hoofdstuk 2 beantwoordt die vraag.

## Wat bewaard moet blijven

Wat de lezers morgen nog weten:
- de deining van achteren, en dat de verteller dat zinnetje vaker herlas dan het verslag van zijn dood (Ann, Sofie, Lotte; Pieter koos het als sterkste passage);
- het blad in de plas, 'ik heb haar laten liggen' (alle vier);
- de linkerlaars op de rechterknie (Ann);
- de halve zakdoek in Brabants linnen, verkeerd geknoopt (Sofie: sterkste passage; Pieter: wat hem raakte);
- 'Ik herkende hem niet … ik liep hem voorbij' (Lotte: sterkste passage);
- 'de naam van het mes' (Pieter).

## Antwoorden op de vragen van de auteur

**1. Wat wil Richard?** Alle vier geven in de kern hetzelfde antwoord: zijn laars laten houden tot vanavond, op tijd aan boord zijn, en in Sydney aankomen met loon en een brief die zegt wat hij kan.

**2. Vertrouwen of wantrouwen?** Alle vier antwoorden 'beide'.
- Ann: 'Ik vroeg het omdat ik wilde horen hoe hij het zou zeggen.' Ze vindt dat hij met de jongen speelt.
- Pieter: 'Ik had een antwoord voor die jongen klaar, omdat ik voor alles een antwoord klaar had.' Hij schrijft erbij: 'zijn kanttekeningen strepen zichzelf door, en dat maakt hem geloofwaardiger dan ik wilde.'
- Sofie en Lotte: 'vier koningen de hand gekust'. Ze vinden hem eerlijk over zijn falen, maar hij liegt van beroep.

**3. Waarom lezen ze door?**

| Lezer | Reden | Hun vraag voor hoofdstuk 2 |
|---|---|---|
| Ann | Richard | 'Gaat hij mee kijken bij het vertrek, en zegt hij het dan alsnog?' |
| Pieter | de verzwegen wacht | 'Kan hij het lot niet veranderen, of wil hij het niet? Als het boek dat laat glijden, ben ik weg.' |
| Sofie | de verzwegen wacht | 'Gaat hij mee kijken, en zegt hij het dan toch, of vaart hij zelfs mee?' |
| Lotte | de verzwegen wacht | 'Gaat hij vanavond mee kijken en zegt hij het dan alsnog?' |

Niemand leest door voor de rare man en het bedankje. Drie lezers lezen door voor de wacht, één voor Richard. Pieters voorwaarde wordt beantwoord in hoofdstuk 2: daar staan de sprongregel en het procesverslag waarin de graaf niet voorkomt.
