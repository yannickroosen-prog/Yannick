# 11 — Eindscore (Genesis Score)

*Gemeten craft-risico, geen verkoopvoorspelling. Gesimuleerde lezers en beoordelaars, geen echte lezers. Geen uitspraak over publicatierijpheid; dat beslist een mens.*

## 1. Waar het boek staat
De roman is volledig: 14 hoofdstukken, 42.232 woorden, binnen het lengtecontract. Vier aparte gesimuleerde lezers bladeren door bij elk gesampled hoofdstuk, en de verse audit van het slot vindt geen zware problemen meer. Alleen de strengste rubriekpoort (8,5 na kalibratie) wordt niet gehaald. Proza, tempo en markt blijven tussen 7 en 7,5.

## 2. Volledigheid
- Hoofdstukken 14/14 · 42.232 woorden (`delivery/export-receipt.json`) · contract 42.000–52.000: **PASS**.
- Uitgeverspakket en positionering: aanwezig, hooktest uitgevoerd.
- Label: **compleet**.

## 3. Lezerspanel: eindlezing met vier aparte contexten
Steekproef: h1, h4 (≈25%), h6, h7 (midden), h8, h9, h11 (vóór de finale), h12 (climax), h13, h14 (slot). Elke lezer las in een eigen, geïsoleerde context.

| Hfst | Hilde | Joris | Saïda | Luchthaven | Meerderheid |
|---|---|---|---|---|---|
| 1 | ja | ja | ja | ja | 4/4 |
| 4 | ja | ja | ja | ja | 4/4 |
| 6 | ja | ja | ja | ja | 4/4 |
| 7 | ja | ja | ja | ja | 4/4 |
| 8 | ja | twijfel | ja | ja | 3/4 |
| 9 | ja | ja | ja | ja | 4/4 |
| 11 | ja | nee → **ja** na herziening | ja | ja | 4/4 |
| 12 | ja | ja | ja | ja | 4/4 |
| 13 | ja | twijfel | ja | ja | 3/4 |
| 14 | ja | nee → **ja** na herziening | ja | ja | 4/4 |

- **Panelpoort: gehaald.**
- Kanttekening: na deze lezing zijn h11 en h14 herzien. Joris las de nieuwe versies opnieuw. Hilde, Saïda en de luchthavenlezer lazen de vorige versie, waarop ze al "ja" gaven. Daarna kwamen er nog kleine continuïteitscorrecties.
- **Wat bleef hangen:** "Het is de enige datum in dat schrift zonder bedrag ernaast" · "Een vrouw met goed nieuws loopt naar iemand." · "*Maar ze kon het dus wel.*" / "Ik ben een van die mensen, Steven." · polypropyleen · "Ge hebt het gras gemaaid in januari" · de suikerboon van zeven jaar.

## 4. Rubriek: twee onafhankelijke beoordelaars op de slotteksten

| Dimensie | Gewicht | Beoordelaar A | Beoordelaar B | Mediaan | Gekalibreerd (−0,8) |
|---|---|---|---|---|---|
| Originaliteit | 1,1 | 8,0 | 7,8 | 7,9 | 7,1 |
| Thema | 1,0 | 8,5 | 8,3 | 8,4 | 7,6 |
| Personages | 1,2 | 8,5 | 8,2 | 8,35 | 7,55 |
| Proza | 1,0 | 7,5 (plafond) | 7,3 | 7,4 | 6,6 |
| Tempo | 1,0 | 7,5 | 7,4 | 7,45 | 6,65 |
| Emotie | 1,1 | 8,5 | 8,4 | 8,45 | 7,65 |
| Coherentie | 0,9 | 8,5 | 8,3 | 8,4 | 7,6 |
| Markt | 0,8 | 7,5 | 7,2 | 7,35 | 6,55 |
| Stem | 1,1 | 8,5 | 8,2 | 8,35 | 7,55 |
| Opening | 0,8 | 8,5 | 8,2 | 8,35 | 7,55 |

- **Gewogen gemiddelde (mediaan):** ruw **8,06**, gekalibreerd **7,26**. **Ondergrens:** 6,55 (Markt). **Doel:** 8,5.
- **Ter vergelijking, eerste rubriek:** ruw 7,94, gekalibreerd 7,14, ondergrens 6,5.
- **Poort: niet gehaald.**
- **Bronnen:** beoordelaar A (`rubric-final.json`) las de tekst na de taalcorrectie. Beoordelaar B (`rubric-final-2.json`) las de slotversie.

## 5. Poorten
- **Lengte:** gehaald.
- **Panel:** gehaald.
- **Audit:** de volledige verse audit op de tekst na de taalcorrectie gaf `revise` met 2 high-tickets. Die zijn verwerkt. Een verificatie-audit van het hele boek vond daarna 2 nieuwe high-continuïteitsfouten in h14; ook die zijn verwerkt. Een gerichte slotverificatie op h11–14, met continuïteitscontroles in h1–10, geeft **`audit_status: pass`**, zonder high-tickets (`evaluations/audit-verification-final.md`). Er is geen volledige boekaudit meer gedraaid op de allerlaatste versie.
- **Rubriek: niet gehaald.** Wat ontbreekt:
  1. Proza onder het plafond van de tells: het "niet X, maar Y"-contrast komt nog meer dan één keer per hoofdstuk voor in ongeveer 5 van de 14 hoofdstukken.
  2. Tempo: drie zwangerschapsaankondigingen op familiefeesten zitten in één sjabloon.
  3. Markt: een korte roman met een zeldzaam perspectief, maar zonder bewezen fondsplaats.

## 6. Onafhankelijkheid
- Alle critici waren geïsoleerde subagenten van dezelfde modelfamilie (Claude). Een tweede modelfamilie was niet beschikbaar in deze omgeving.
- In de eindlezing las elke persona in een eigen context. Eerdere panels simuleerden vier persona's in één context.
- De validatiescript voor lezer-JSON is door één lezer (Saïda) toegepast. De anderen gebruikten exacte citaten die per script gecontroleerd zijn.

## 7. Onenigheid en vertrouwen
- Joris haakte eerst af op h11 en h14, en las na herziening door.
- Beide rubriekbeoordelaars liggen dicht bij elkaar, met verschillen tot 0,4 per dimensie.
- Vertrouwen: middel. Alle tellingen gebruiken Engelstalige normen die naar het Nederlands vertaald zijn.

## 7b. Na de scores
Na de laatste rubriek en audit volgde nog één zinspass. Daarin is in h5, h8, h10 en h14 het ontkenningscontrast teruggebracht tot hooguit één per hoofdstuk (de grootste reden voor het proza-plafond), en zijn vier kleine continuïteitsnoten uit de slotverificatie verwerkt. Die laatste wijzigingen zijn niet opnieuw gescoord; de rubriek hierboven geldt voor de versie daarvóór.

## 8. Volgende stap
De zwakste dimensie is **Markt**, en binnen de tekst **Proza**. De zinspass op het ontkenningscontrast is gedaan; een nieuwe rubriekbeoordeling moet uitwijzen of het proza-plafond nu weg is. Daarna volgt een menselijke lezing door iemand uit de Vlaamse uitgeefwereld voor de positionering.
