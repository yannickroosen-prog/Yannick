# Verslag van de run

## 10 november 2026 — fase 0: intake

- Workflow: Book Genesis (felipelobomotta-blip/book-genesis-v4), skill `book-genesis`, begeleide modus (check-in).
- Opgeslagen: `ASSUMPTIONS.md`, `artifacts/00-brief.md`, `artifacts/01-market-map.md`, `artifacts/02-story-engine.md`, `work/idee-auteur.md`, `PROJECT_STATE.yaml`.
- Onderzoek: zoekmachine beschikbaar, bronpagina's (o.a. Wikipedia) geblokkeerd door de netwerkinstellingen van deze sessie. Marktpoort blijft **niet geverifieerd**.
- Gevonden causaal probleem: de sprongregel ('nooit terug naar een beleefde dag') botst met het slot in 1837 als de graaf 1837 zelf beleefde. Voorstel: hij springt van 1784 naar 1838. Wacht op akkoord van de auteur.
- Tegenstrijdige bronnen over vertrekhaven en -datum van de Mignonette (Southampton 19 mei of Tollesbury 5 mei 1884). Op te lossen in fase 2.
- Onafhankelijkheid: alleen geïsoleerde subagents van dezelfde modelfamilie. Isolatiecheck nog niet uitgevoerd.
- Volgende stap: akkoord of correcties van de auteur op de intake, daarna fase 1 (personages, thema, stem met ritmecontract, emotionele curve).

## 10 november 2026 — akkoord intake, fase 1: fundament, proefhoofdstuk

- Auteur keurde de intake goed met aanpassingen: tijdlijn met tussenstop in december 1884, geen prijs per sprong, ~80.000 woorden, *Life of Pi* in het nawoord, werkveld `[auteursnaam]`, de inhoud van de wacht.
- Intakebestanden bijgewerkt (`ASSUMPTIONS.md`, `00-brief.md`, `02-story-engine.md`).
- Fase 1 opgeslagen: `03-characters.md`, `04-theme.md`, `05-voice.md`, `06-emotional-curve.md`.
- Extra bronnen gecontroleerd: gedenkteken Peartree Green (sterfdatum 25 juli 1884), redding door de Duitse bark Montezuma en aankomst in Falmouth op 6 september, Poe met Virginia en Maria Clemm in New York in 1837 (Carmine Street), Pym geregistreerd door Harper in juni 1837.
- Afwijking op vraag van de auteur: proefhoofdstuk 12 (het avondeten, 3.507 woorden) geschreven vóór fase 2, als werkstuk in `work/proef-hoofdstuk-12.md`. Het is niet canoniek en heeft geen paneelronde gehad.
- Stemcontract heeft nog geen comp-bewijs; de vijf voorbeeldpassages zijn origineel ontwerp.
- Volgende stap: reactie van de auteur op het proefhoofdstuk, daarna fase 2 (outline, openingsstrategie, continuïteitsregister).

## 10 november 2026 — feedback op het proefhoofdstuk, fase 2: architectuur

- Proefhoofdstuk 12 herzien volgens de auteur:
  - de zin 'Wie in de sloep gaat zitten …' is geschrapt; de kam blijft;
  - de Bijbel-grap van Brooks is bewaard voor hfst. 9;
  - 'vreemde dankbaarheid' is twee keer geschrapt;
  - de tweede omgestoten thee is vervangen door Brooks die blijft kijken;
  - de kanttekening na de lach geeft nu twijfel in plaats van zekerheid;
  - de verwijzingen naar hoofdstukken zijn weg;
  - het slot is vervangen door de zin van de auteur;
  - 'zeshonderd jaar' is geschrapt.
  - Nieuwe lengte: 3.366 woorden.
- Fase 2 opgeslagen: `07-outline.md` (22 hoofdstukken, 78.300 woorden), `08-opening-strategy.md` en `09-continuity-ledger.md`.
- Twee bouwbeslissingen ter bevestiging:
  - I-02: de haven in één dag;
  - I-01: de 'zesenveertig jaar' uit de openingszin botste met de nieuwe tijdlijn en wordt hersteld door het bijgeloof met knipsels.
- Twee beats vallen bewust buiten de tolerantie van 5 punten: de overgang naar deel 2 (+5,9, op vraag van de auteur rond 25%) en de overgang naar deel 3 (+6,7).
- Brief-contractcheck: PASS. Verificatie: degraded (niet onafhankelijk); er is geen subagent gestart.
- Volgende stap: akkoord van de auteur op I-01 en I-02, daarna fase 3 (schrijven, te beginnen met hoofdstuk 1 en een leespanel).

## 10 november 2026 — fase 3: hoofdstukken 1-3

- Beslissingen van de auteur verwerkt:
  - I-01: nieuwe openingszin;
  - I-02: de haven in één dag, lengte volgt de inhoud;
  - hfst. 13: de kruik;
  - hfst. 19: de knoop is geen toestemming.
- Geschreven, gestaged met `stage_chapter.py` en canoniek gemaakt. Voor elk hoofdstuk zijn de hashes van bron, gestagede tekst en canonieke tekst identiek.

  | Hoofdstuk | Woorden | Gepland |
  |---|---|---|
  | hfst. 1 | 2.608 | 3.300 |
  | hfst. 2 | 2.279 | 3.900 |
  | hfst. 3 | 2.022 | 3.500 |

  `check_progress.py`: 6.888 woorden proza.
- **Lengteprojectie:** 64% van het plan. Bij dit tempo komt het boek op ongeveer 50.000 woorden, onder de vloer van 75.000. Volgens de orchestratorregel wordt er niet verder geschreven voor er herpland is. Er wordt niet opgevuld.
- **Leespanel:** het panel op hfst. 1 is nog niet uitgevoerd. Het vereist geïsoleerde subagents, en die starten we alleen op vraag van de auteur.
- Vastgelegde nieuwe feiten staan in het register:
  - het golfuur, tegen 5 uur 's morgens;
  - de vader Daniel, ketelmaker;
  - de alias Jermyn;
  - Lyle, Hutchings en de knipsels.

## 10 november 2026 — leespanel hfst. 1, hoofdstukken 4-6 (einde deel I)

- **Beslissingen van de auteur:**
  - lengte volgens optie 3: richtpunt 65.000 woorden, de vloer van 75.000 geschrapt; opnieuw bekijken na de eerste dagen in de sloep;
  - het golfuur wordt 'tegen de avond' (bronnen bij Brandeis en University of California Press, aangeleverd door de auteur; nog zelf na te kijken);
  - hfst. 2 eindigt op Richards blik, hfst. 3 op de plaathandschoen.
- **Hoofdstuk 2 en 3:** herzien als nieuwe pogingen (a2), gestaged en canoniek gemaakt.
- **Leespanel hfst. 1:** vier geïsoleerde subagents (Ann, Pieter, Sofie, Lotte). Alle vier slaan de bladzijde om. Verzameld in `evaluations/panel-chapter-01.md`. Hoog ticket P1-01: de alinea met de hofanekdotes. Defecten P1-03 tot P1-07 staan open voor revisie.
- **Feitelijke herstelling in hfst. 1 (a2):**
  - P1-02: Brooks werd genoemd vóór hij geïntroduceerd was;
  - 'begraven': Parker heeft geen graf;
  - 'tweede keer dat hij vroeg' klopte niet.
  - Stilistische tickets blijven voor fase 5.
- **Woordtelling:** de 6.888 uit het vorige verslag is geen optelfout. `check_progress.py` telt alleen proza, zonder koppen en opmaak, terwijl `wc` 6.909 telde.
- **Geschreven en canoniek gemaakt:**

  | Hoofdstuk | Woorden |
  |---|---|
  | hfst. 4 | 1.704 (a2: strofe-kanttekening in lijn met hfst. 13) |
  | hfst. 5 | 1.952 |
  | hfst. 6 | 1.980 |

  Deel I komt daarmee op 12.456 woorden, tegenover 20.300 gepland.
- **Volgende stap:** deel II (hfst. 7-12) en de herziening van het proefhoofdstuk tot hfst. 12.

## 10 november 2026 — deel II: hoofdstukken 7-12

- **Hfst. 4 (a3):** de kanttekening over de tweede strofe is geschrapt op vraag van de auteur. De kruik blijft een verrassing voor hfst. 13.
- **Nawoordnotities gestart** in `work/nawoord-notities.md`: de zin over de Vlaamse spreektaal en de erkenning van *Life of Pi*.
- **Geschreven en canoniek gemaakt:**

  | Hoofdstuk | Woorden |
  |---|---|
  | hfst. 7 | 1.669 |
  | hfst. 8 | 1.587 |
  | hfst. 9 | 1.449 |
  | hfst. 10 | 1.534 |
  | hfst. 11 | 1.344 |
  | hfst. 12 | 3.206 (uit het herziene proefhoofdstuk; opent met 'Stephens bakt') |

- **Totaal:** 23.149 woorden proza in 12 hoofdstukken.
- **Ritmeprojectie** (informatief): bij dit ritme komt het boek op ongeveer 45.000 woorden. Volgens de afspraak met de auteur valt de lengtebeslissing na de eerste dagen in de sloep (hfst. 13-14).
- **Aanpassingen aan het proefhoofdstuk:**
  - de openingsscène is verhuisd naar het slot van hfst. 11;
  - de graaf slaapt op de vloer, niet in een kooi;
  - het brood wordt niet opnieuw beschreven;
  - de graaf kent het uur niet;
  - Richards loon: vier pond is zeven maanden werk;
  - de prijs wordt pas hier genoemd: 'De eerste keer had ik dat geweigerd.'
- **Leespanel:** de workflow voorziet een paneelronde rond 25% en 50%. Die is nog niet uitgevoerd, in afwachting van de auteur.

## 10 november 2026 — leespanel hfst. 12, hoofdstukken 13-14

- **Leespanel hfst. 12:** dezelfde vier subagents, met de aanloop uit hfst. 11 en de drie vragen van de auteur. Alle vier slaan de bladzijde om. Twee hoge tickets:
  - P12-01: de tafelschikking;
  - P12-02: het cv van de verteller.
  - Zie `evaluations/panel-chapter-12.md`.
- **Revisiethema over twee panels:** het cv van de verteller en het bonmot aan het slot van een alinea.
- **Hfst. 13 (2.011 woorden):**
  - de graaf kiest zelf om 15 uur te wekken;
  - de kruik wordt gevuld en losgelaten voor Brooks;
  - de graaf maakt de sloep los en haalt geen water.
- **Hfst. 14 (1.660 woorden):**
  - opent met de gewoonte van ruimte maken;
  - de laars wordt een hoosvat en drijft weg;
  - de schildpad;
  - 'Dan kijken ze me nu al zo aan';
  - Brooks' laatste lach.
- **Totaal:** 26.824 woorden in 14 hoofdstukken.
- **Lengtegegevens** (voor de beslissing van de auteur):

  | Deel | Woorden |
  |---|---|
  | de kade, één dag (hfst. 1-6) | 12.456 |
  | zes weken aan boord (hfst. 7-12) | 10.693 |
  | eerste vijf dagen in de sloep (hfst. 13-14) | 3.675 |

## 10 november 2026 — hoofdstukken 15-19 (de sloep)

- **Beslissingen van de auteur:**
  - korte roman, richtpunt ongeveer 50.000 woorden;
  - stilistische revisie pas na de volledige eerste versie (`work/revisie-notities.md`, met 'Hij spaarde hen' te schrappen);
  - hfst. 19 eindigt bij het vertrek van de graaf.
- **Continuïteitsherstellingen:**
  - hfst. 13 (a2): de graaf steekt het dagboek in zijn binnenzak. Anders kon het de ondergang niet overleven;
  - hfst. 13 (a2): 'Ik weet het niet' vervangen door 'Het is drie uur'. Daardoor klopt 'Dat is de eerste keer dat ge dat zegt' in hfst. 17;
  - de stemkaart is daarop aangepast.
- **Geschreven en canoniek gemaakt:**

  | Hoofdstuk | Woorden | Inhoud |
  |---|---|---|
  | hfst. 15 | 1.561 | Richard verbetert Stephens, ergert zich aan de kousen, vraagt de riem, drinkt zeewater: 'Gij zijt een slechte waarzegger. Maar ge liegt niet meer.' |
  | hfst. 16 | 599 | het dagboek weigert; onthult dat de sloephoofdstukken later zijn geschreven |
  | hfst. 17 | 841 | het warme hemd |
  | hfst. 18 | 1.262 | het laatste vlees van Stephens, het lot, het aanbod |
  | hfst. 19 | 706 | de wacht zonder de vraag, de knoop, het vertrek |

- **Totaal:** 31.799 woorden in 19 hoofdstukken.
- **Projectie:** met deel IV komt het boek uit op ongeveer 37.000 à 39.000 woorden, onder het richtpunt van de auteur (~45.000 tot 50.000). Dit is gemeld aan de auteur. Er is niet opgevuld.

## 10 november 2026 — deel IV (hfst. 20-22): eerste versie volledig

- **Hfst. 19 (a2):** het dagboek en Pym liggen even op zijn knie terwijl hij de jas onder Richards hoofd vouwt (auteur). Het slot blijft 'Ik ben gegaan.'
- **Hfst. 20:** maart 1837, Carmine Street, nacht, vorst.
  - Maria Clemm verwarmt een hemd bij het vuur; Virginia geeft haar sjaal.
  - De graaf komt vragen waar de naam vandaan komt en vertelt in plaats daarvan de jongen.
  - Poe vraagt of hij de naam mag gebruiken: 'Ja … Omdat ik wil dat iemand hem onthoudt.'
- **Hfst. 21:** veertien weken later, de drukproeven.
  - 'Ik heb hem het lot gegeven.'
  - Poe neemt aan dat de graaf erbij was: 'Waar was u toen het gebeurde?'
  - De wacht wordt verteld; Poe zwijgt; de knoop.
- **Hfst. 22:** de kade uit het hoofd opgeschreven. Het woord van de Fransman is vergeten. 'Dank u' wordt doorgestreept. Daar eindigt het.
- **Tijdlijn gewijzigd:** de graaf leeft de weken tussen hfst. 20 en 21 (geen sprong). Daarmee is de kamer van hfst. 16 zijn kamer in Hudson Street.
- **Totaal:** 22 hoofdstukken, 35.421 woorden proza.
- **Export (leesexemplaar):**
  - `delivery/manuscript.md` en `delivery/de-naam-van-de-drenkeling.epub`; EPUB-validatie: passed.
  - Scope: draft. Literaire kwaliteit is niet beoordeeld; dit is geen publicatiegoedkeuring.
  - De doorhaling in het slot staat in Unicode, omdat `~~` in de EPUB letterlijk verscheen.
- **Niet uitgevoerd in fase 3:**
  - de continuïteitscontroles per blok van vijf hoofdstukken;
  - leespanels op ±25% en vóór de finale (alleen hfst. 1 en hfst. 12 zijn gelezen).
  - Fase 4 (audit) moet de continuïteit volledig nalopen.

## 10 november 2026 — de auteur heeft de eerste versie gelezen

- Oordeel van de auteur: Richard is na hfst. 19 genoeg gekend om hem in de sloep achter te laten. Er komt geen extra scène.
- Hfst. 1 en het slot (het doorgestreepte 'Dank u') blijven ongewijzigd.
- Nieuw revisiepunt in `work/revisie-notities.md`: Richard doorziet de graaf aan het einde mogelijk één keer te vaak.
- Volgende stap: fase 4, de adversariële audit, als de auteur akkoord gaat.
