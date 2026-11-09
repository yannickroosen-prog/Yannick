# 11 — Eindscore (Genesis Score)

*Gemeten craft-risico, geen verkoopvoorspelling. Gesimuleerde lezers en beoordelaars, geen echte lezers. Geen uitspraak over publicatierijpheid; dat beslist een mens.*

## 1. Waar het boek staat
De roman is volledig: 14 hoofdstukken, ongeveer 42.600 woorden, binnen het afgesproken lengtecontract. Gesimuleerde lezers lezen de gesamplede hoofdstukken door, en het slot komt bij alle vier aan, bij twee van hen gedeeltelijk. De strenge rubriekpoort (doel 8,5 na kalibratie) wordt niet gehaald. Het zwakste punt is de marktpositionering. Daarna volgen tempo (een terugkerend hoofdstukstramien) en proza (een "niet X, maar Y"-constructie die te vaak terugkomt).

## 2. Volledigheid
- Hoofdstukken: 14/14. Woorden: zie `delivery/export-receipt.json` (± 42.600). Contract 42.000–52.000: **PASS** (dicht bij de vloer).
- Uitgeverspakket: aanwezig (`12-editorial-package.md`, `13-positioning.md`).
- Label: **compleet** (lengte, alle hoofdstukken, pakket). De kwaliteitspoorten staan hieronder apart.

## 3. Lezerspanel (eindlezing, `evaluations/panel-gate-pass-1.json`)
Steekproef: h1 (opening), h7 (midden), h12 (climax), h13, h14 (slot).

| Hfst | Hilde | Joris | Saïda | Luchthaven | Meerderheid |
|---|---|---|---|---|---|
| 1 | ja | ja | ja | twijfel | 3/4 ✔ |
| 7 | ja | ja | ja | ja | 4/4 ✔ |
| 12 | ja | ja | ja | ja | 4/4 ✔ |
| 13 | ja | twijfel | ja | twijfel | 2/4 ✘ → herzien: A/B 3× A + 1× gelijk; 3/4 ja ✔ |
| 14 | ja | ja | ja | ja | 4/4 ✔ |

Na de eindlezing zijn de gemelde uitlegzinnen geschrapt (h7, h12, h13, h14). Hoofdstuk 13 is blind vergeleken met de vorige versie: zie `evaluations/panel-chapter-13-compare.json` en de aanvulling onderaan.

**Wat lezers onthielden:** "*Maar ze kon het dus wel.*" · "Ik ben een van die mensen, Steven." · het polypropyleen-moment · Lies' uitbarsting "ge vond dat schoon" · de suikerboon van zeven jaar oud · "Het is de enige datum in dat schrift zonder bedrag ernaast."

## 4. Rubriek (`evaluations/rubric-pass-1.json`, beoordeeld op tekst na revisiepass 1)

| Dimensie | Gewicht | Ruw | Gekalibreerd (−0,8) |
|---|---|---|---|
| Originaliteit | 1,1 | 7,6 | 6,8 |
| Thema | 1,0 | 8,4 | 7,6 |
| Personages | 1,2 | 8,2 | 7,4 |
| Proza | 1,0 | 7,5 (plafond) | 6,7 |
| Tempo | 1,0 | 7,4 | 6,6 |
| Emotie | 1,1 | 8,5 | 7,7 |
| Coherentie | 0,9 | 8,0 | 7,2 |
| Markt | 0,8 | 7,3 | 6,5 |
| Stem | 1,1 | 8,2 | 7,4 |
| Opening | 0,8 | 8,1 | 7,3 |

- Gewogen gemiddelde: ruw **7,94**, gekalibreerd **7,14**. Ondergrens (gekalibreerd): **6,5** (Markt). Doel: 8,5.
- Poort: **niet gehaald**.
- Beperking: de rubriek is gescoord vóór de kleine correcties van pass 2 en 3 (schrappingen, één continuïteitsfout). De tellingen van "AI-tells" zijn Engelstalige normen, met de hand naar het Nederlands vertaald.

## 5. Poorten
**Poorten niet gehaald** (panelpoort wel gehaald):
- Rubriekpoort: gekalibreerde ondergrens 6,5 tegenover het doel 8,5. Ontbreekt: sterkere marktpositionering, minder voorspelbaar hoofdstukstramien (familieritueel → kleine ramp → stil slotbeeld), en het "niet X, maar Y"-contrast onder het plafond.
- Panelpoort: **gehaald** na herziening van h13 (alle gesamplede hoofdstukken ≥3/4). Kanttekening: de gemelde uitlegzinnen in h7, h12 en h14 zijn geschrapt maar die hoofdstukken zijn daarna niet opnieuw gelezen.
- Audit: eerste audit `revise` (5 high). De verificatie na pass 1 vond nog één nieuwe high (een continuïteitsfout), die in pass 2 is opgelost. Er is na pass 2 en 3 geen nieuwe volledige audit gedraaid. Er is dus **geen onafhankelijk bevestigde `audit_status: pass`**.

## 6. Onafhankelijkheid
- Niveau: geïsoleerde subagenten, **zelfde modelfamilie** (Claude). Geen tweede modelfamilie beschikbaar in deze omgeving.
- De panels simuleerden telkens vier persona's binnen één context (niet vier aparte contexten). Dat is zwakker dan het protocol vraagt.
- Checkpoints overgeslagen: ~25% (h4) en "vóór de finale". Continuïteitschecks per vijf hoofdstukken heeft de orchestrator zelf gedaan (niet onafhankelijk).
- De validatiescripts voor lezer-JSON en passagecatalogi zijn niet gebruikt (vrije citaten in plaats van passage-ID's).

## 7. Onenigheid en vertrouwen
- Joris (vijandig) en de luchthavenlezer vinden het slot "deels verdiend". Hilde en Saïda vinden het helemaal verdiend.
- De auditor en het panel vinden h14 "Ik dacht: dit is het." nog altijd een benoemd besef. De auteur vroeg uitdrukkelijk om zo'n moment, daarom is het behouden.
- Vertrouwen: middel.

## 8. Volgende stap
Zwakste dimensie: **Markt** (en **Tempo**). De ingreep met het meeste effect is de structuur van het middenstuk (h3–h9) breken. Laat minstens twee hoofdstukken níet eindigen op een stil slotbeeld, en geef er één een andere vorm, bijvoorbeeld het schrift met de harde kaft als lijst of een reeks sms'en. Aanscherpen van de positionering: zie `13-positioning.md`.

---
*Aanvulling na vergelijking h13:* zie onderaan `evaluations/revision-pass-1.md`.
