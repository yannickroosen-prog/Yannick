# Eindrapport: De naam van de drenkeling

## 1. Waar het boek staat

*De naam van de drenkeling* is een volledige korte roman van 22 hoofdstukken en 35.260 woorden. Hij is herzien, nagekeken door een aparte auditor en door vier gesimuleerde lezers in een blinde vergelijking aanvaard. De drie onafhankelijke beoordelaars vinden stem, opening, emotie, personages en thema de sterkste punten. Na de kalibratie blijven proza, samenhang en marktpositie onder de streefwaarde van de workflow. Dat zijn de plekken voor een volgende ronde.

## 2. Volledigheid

| | Plan | Werkelijk |
|---|---|---|
| Hoofdstukken | 22 | 22 (alle aanwezig, opeenvolgend) |
| Woorden | richtpunt ongeveer 50.000 (korte roman). Op beslissing van de auteur geldt geen ondergrens; plafond 60.000 | 35.260 (proza, `check_progress.py`) |
| Lengtepoort | | Gehaald binnen het contract van de auteur. De auteur aanvaardde deze lengte uitdrukkelijk na lezing. Het boek blijft onder het richtpunt van 50.000. |
| Redactioneel pakket | | Aanwezig (`12-editorial-package.md`, `13-positioning.md`, `14-nawoord.md`) |

**Label: volledig (korte roman).** De kwaliteitspoorten hieronder staan los van dat label.

## 3. Leespanel

Vier gesimuleerde lezers: Ann (primair), Pieter (vijandig), Sofie (aangrenzend) en Lotte (toevallig). Ze vergeleken telkens de eerste en de herziene versie, blind.

| Hfst. | Doorlezen | Voorkeur voor de herziening | Besluit |
|---|---|---|---|
| 1 (opening) | 4/4 | 3–1 (ronde 2) | aanvaard |
| 12 (middenpunt) | 4/4 | 4–0 (ronde 2) | aanvaard |
| 18 (dieptepunt) | 4/4 | 4–0 | aanvaard |
| 21 (onthulling) | 4/4 | 3–1 | aanvaard |

**Resterende opmerkingen:** het hoofdstuk aan tafel 'komt traag op gang' (Lotte). De tafelschikking in hfst. 12 blijft voor één lezer een drempel.

**Wat de lezers onthouden:**
- het blad in de plas;
- de deining van achteren;
- de duim over de korst;
- 'Hij had niet gezegd een uur waarvóór';
- 'Omdat ge weg kunt';
- de knoop.

**Dekking van de huidige tekst: gedeeltelijk.** Na de laatste lezingen kregen hfst. 1, 12, 18 en 21 nog kleine wijzigingen:
- proeflezing en spelling;
- 'zeven weken';
- 'Heel de kade';
- de herstelde zin 'Het was trots, maar trots op een ander', die drie van de vier lezers misten.

Die versies zijn niet opnieuw gelezen.

## 4. Rubric

Drie lezingen van het volledige manuscript, elk in een frisse, geïsoleerde context. Alle drie zijn gevalideerd met `validate_rubric.py`: status *passed*, citaten exact.

| Dimensie | Gewicht | Lezing 1 | Lezing 2 | Lezing 3 | Mediaan | Gekalibreerd (−0,8) |
|---|---|---|---|---|---|---|
| Originaliteit | 1,1 | 8,5 | 8,0 | 8,8 | 8,5 | 7,7 |
| Thema | 1,0 | 8,5 | 8,5 | 9,0 | 8,5 | 7,7 |
| Personages | 1,2 | 8,5 | 8,5 | 8,7 | 8,5 | 7,7 |
| Proza | 1,0 | 8,0 | 7,5 | 7,5 | 7,5 | 6,7 |
| Tempo | 1,0 | 7,8 | 7,5 | 8,0 | 7,8 | 7,0 |
| Emotie | 1,1 | 8,7 | 8,5 | 8,8 | 8,7 | 7,9 |
| Samenhang | 0,9 | 7,5 | 7,5 | 8,4 | 7,5 | 6,7 |
| Markt | 0,8 | 7,0 | 7,0 | 7,3 | 7,0 | 6,2 |
| Stem | 1,1 | 8,8 | 8,5 | 9,0 | 8,8 | 8,0 |
| Opening | 0,8 | 9,0 | 8,5 | 8,8 | 8,8 | 8,0 |

| | Waarde |
|---|---|
| Laagste gekalibreerde dimensie | **6,2** (Markt) |
| Gewogen gemiddelde (gekalibreerd) | **7,4** |
| Streefwaarde | 8,5 |
| **Rubricpoort** | **niet gehaald** |

De kalibratie trekt standaard 0,8 af, omdat interne scores hoog uitvallen. Zonder kalibratie is het gewogen gemiddelde ongeveer 8,2.

## 5. Poorten

**Gehaald:**
- de audit, na hercontrole (`10b-audit-recheck.md`, *pass*);
- het leespanel op de steekproef;
- de volledigheid.

**Niet gehaald:**
- **Rubricpoort.** Laagste dimensie 6,2 tegenover 8,5. Vier dimensies liggen meer dan 1,0 onder de streefwaarde: Markt (6,2), Proza (6,7), Samenhang (6,7) en Tempo (7,0). Originaliteit, Thema en Personages (7,7) liggen er 0,8 onder.
- **Marktpoort.** Niet geverifieerd. Er waren geen bestsellerlijsten of lezersrecensies beschikbaar. De comps zijn voorlopig.
- **Panel op de huidige tekst.** Gedeeltelijk: er zijn kleine wijzigingen na de laatste lezing (zie punt 3).

## 6. Onafhankelijkheid

| | |
|---|---|
| Niveau | geïsoleerde subagents |
| Graad | **B** (frisse contexten, één modelfamilie) |
| Schrijver en critici | zelfde modelfamilie (Claude) |
| Tweede modelfamilie | geen beschikbaar in deze sessie |
| Isolatiecheck | niet formeel uitgevoerd. Elke critic kreeg alleen een eigen pakket en de opdracht niets anders te openen. |

Geen enkel oordeel in dit rapport komt van een mens. De lezers zijn gesimuleerd.

## 7. Meningsverschillen en zekerheid

- **Proza.** Lezing 1 geeft 8,0. Lezingen 2 en 3 houden het op 7,5, door de plafondregel: contrast door ontkenning ('niet X, maar Y') overschrijdt het plafond in ongeveer zes hoofdstukken (2, 3, 4, 6, 7 en 12). Twee lezers noemen ook de tic met 'zoals je …', ongeveer 22 keer.
- **Samenhang.** Lezing 3 geeft 8,4, lezingen 1 en 2 geven 7,5. Ze noemen kleine haperingen bij voorwerpen: de plaathandschoen, de zakdoek, de verdeling van het brood. Die haperingen zijn deels al hersteld in de proeflezing.
- **Markt.** Alle drie lezen het einde als gesloten. Daardoor is 'boek I van een reeks' uit de tekst nauwelijks af te leiden. Ze vinden Haig en Schwab te commercieel als comps. Lezing 2 noemt de Vlaamse spreektaal een risico voor Nederlandse lezers.
- **Zekerheid:** bij alle drie medium. De tellingen van tells zijn benaderend, omdat de lijst Engelstalig is.

**Sterkste passage** (twee van de drie lezingen): 'Ik zag Richards duim over de korst gaan. Eén keer, heen en terug.' (hfst. 12).

**Zwakste passages**, telkens één lezing:
- Poes lange zin in hfst. 20;
- de reeks blikken in hfst. 18;
- de kloppende vaten in hfst. 13.

## 8. Volgende stap

- **Zwakste dimensie:** Markt (6,2). De ingreep met het meeste effect is één zichtbare reeksdraad, vóór de laatste bladzijde. Bijvoorbeeld in hfst. 22, waar de graaf zich afvraagt wie hij nog meer in een verhaal heeft veranderd. Zo leest een uitgever 'boek I'. Daarnaast de comps verifiëren tegen Nederlandstalige lijsten.
- **Voor Proza en Samenhang (6,7):** één gerichte correctieronde op contrast door ontkenning in hfst. 2, 3, 4, 6, 7 en 12, en op de tic met 'zoals je'. Daarna een nieuwe vergelijkende leesronde op de betrokken hoofdstukken.

Deze cijfers meten risico's in het vakmanschap. Ze voorspellen geen verkoop. Of het boek klaar is voor publicatie, beslist een mens.
