# 10 — Adversariële audit (finaal, blind)

Auditor: frisse, read-only lezer. Geen eerdere audits, scores of reparatiegeschiedenis geraadpleegd. Het "Brief contract check"-blok in `07-outline.md` is genegeerd als procesmetadata. Waar ledger en manuscript verschillen, geldt "Canon vastgelegd na drafting" als nieuwste canon.

**Alineanummering.** Alle locaties tellen elke niet-lege regel van het hoofdstukbestand, kopregel = 1, scènescheidingen `---` meegeteld (reproduceerbaar met `awk 'NF{p++; print p": "$0}' chapter-NN.md`).

**Woordtelling (streepjes als spatie, zonder koppen en scènescheidingen):** 2.911 / 3.229 / 3.276 / 3.263 / 2.308 / 3.004 / 3.104 / 2.825 / 2.964 / 2.471 / 3.214 / 3.528 / 3.977 / 2.284 = **±42.358 woorden**.

**Algemeen oordeel vooraf.** Dit is een sterk, beheerst manuscript: de opening werkt, de voorwerpen dragen echt, de humor zit waar hij moet zitten, Lies heeft een eigen leven en eigen schuld, en het slot betaalt de opening terug. Juist daarom vallen de resterende zwaktes op: op enkele dragende plaatsen legt het boek uit wat het al getoond heeft (vooral in het slot en rond "de kamers"), Steven verliest in de tweede helft zijn eigen zinsritme, en het derde deel wordt een opeenvolging van verzoenende, wijze bijfiguren. Twee tickets zijn hoog; de structuur kan alle reparaties dragen.

---

## Pass 0 — Briefcontract

| Briefbepaling (letterlijk) | Outline/ledger | Manuscript | Resultaat |
|---|---|---|---|
| Premisse: "een man en een vrouw die geen kinderen kunnen krijgen. Niet als een medisch verhaal over onvruchtbaarheid, maar als een existentiële roman over de fundamentele oneerlijkheid van het bestaan." | 07 alle rijen; 02 premisse | Medisch detail blijft ondergeschikt aan scène (ch2 potje, ch4 frigo/keuring, ch9 parking). | PASS |
| Lezersbelofte: "Je volgt een gewone man door zeven jaar waarin hij en zijn vrouw alles geven voor een kind dat niet komt, en je zult lachen waar je zou moeten huilen…" | 07 drukkolom | Humor op verlieskantelpunten: ch3 [84], ch4 [50], ch9 [70], ch10 [72]–[74], ch14 [43]–[51]. | PASS |
| Tijdvenster: "maart 2016 – oktober 2023 (benaderend, 'ongeveer zeven en een half jaar')" | 07 ch1 maart 2016 … ch14 mei–okt 2023; ledger tijdlijn | ch1 noemt geen maand maar ligt vóór de afspraak van 12 mei (ch1 [50]); ch14 [80] "op een dinsdagavond in oktober … zeven jaar na de olijfpit". | PASS (benaderend) |
| POV: "ik-vorm, Steven Claeys (hoofdstukken 1–4, 6–9, 11–14); ik-vorm, Lies Van Damme (hoofdstukken 5 en 10)" | 07 POV-kolom | ch5 en ch10 dragen `*Lies*`, tegenwoordige tijd; overige Steven. | PASS |
| Hoofdstukken: "14, gemiddeld ca. 3.300 woorden" | 07: 46.500 gepland | 14 hoofdstukken, gemiddeld ±3.025. | PASS (benaderend) |
| Lengtecontract: "42.000–52.000 woorden; vloer 42.000, plafond 52.000" (exact) | 07: 46.500 | ±42.358 | PASS, marge 358 woorden → zie T-20 |
| Ledger wereldregels/tijdlijn (canon na drafting) | 09 | Alle exacte datums gecontroleerd tegen weekdagen: 12.05.2016 (do), 02.06.2016 (do), Lena 14.06.2016 (di), feest za 17.09.2016, keuring wo 20.09.2017, Jozef † vr 17.05.2019, begrafenis vr 24.05.2019 (verkiezingen zo 26.05 klopt), curettage do 12.11.2020, vaatwasser di 17.01.2023, Mila do 26.01.2023 — kloppen. Eén interne datumbreuk: zie T-04. | PASS met één continuïteitsticket |

Geen open contractticket. Outlineafwijkingen (ch12 Steven slaapt in de kleine kamer op het plooibed i.p.v. "op de grond in kamer één"; Mila's geboorte al aan het eind van ch13) worden door de canon na drafting gedekt of zijn geen briefbepalingen.

**Aanvullende briefeisen van de auteur:**
- Begin met een alledaags voorval: PASS (vaatwasser, ch1 [2]).
- Het onrecht niet voortdurend benoemen: grotendeels PASS; expliciete benoemingen in ch2 [74]–[75] en ch14 [76]–[77] (T-01, T-12).
- Filosofie groeit uit het gewone leven: PASS (parkeerautomaat, keuring, PMD-zak).
- Geen therapeutentaal, zelfhulpwijsheid, sentimentele metaforen of troostclichés: therapeutentaal correct alleen bij derden met wrijving (Ilse "een plek hadden kunnen geven", ch11 [22]; Danny "loslaten", ch4 [58]). Maar in deel III stapelen wijsheden van bijfiguren zich op (T-09) en het slot eindigt op een dankbaarheidsinventaris (T-01).
- Voorwerpen dragen emotie: PASS, sterkste kwaliteit van het boek.
- De lege kamers niet als herhaald uitgelegd symbool: FAIL in ch10–11 (T-02).
- Humor waar de lezer zou moeten huilen: PASS.
- Slot: geen verheffende les, geen nihilisme, waardigheid zonder rechtvaardigheid: grotendeels PASS (PMD-zak "met twee handen"), maar ch14 [76]–[77] trekt het richting les (T-01).
- De vrouw heeft eigen binnenleven, woede, verlangens, gebreken: PASS (Immoweb, Ward, de leugen tegen de arts, woede over "de vrouw die gestopt is", microscoop).

## Pass 1 — Bestaansrecht

Elk hoofdstuk heeft een eigen functie en een eigen waardeverschuiving: 1 gewoonte→beslissing; 2 onwetendheid→"onverklaard"; 3 hoop→eerste barst; 4 verwachting→eerste negatieve test; 5 Lies' geheim voor de lezer; 6 Stevens wreedheid + doopsuiker ontdekt; 7 rouw met papieren vs. zonder; 8 valse rust → "Ik wil niet meer"; 9 de enige sterfdatum; 10 Lies blijft voorlopig; 11 een kind in huis en weer weg; 12 tuintafel + onthulling; 13 breuk → kleiner samen; 14 waardigheid zonder rechtvaardigheid. Geen merge- of cutkandidaat. **PASS.**

## Pass 2 — Stem

- Lies is herkenbaar (tegenwoordige tijd, metingen, "ik" i.p.v. "we"). Kristof ("manneke", "allee", "ge weet wat ik bedoel"), Rita ("ik zeg maar wat"), Danny ("ge moet…"), Roger (weer, haag) slagen voor de bedek-de-naamtest.
- **Probleem: Stevens ritme convergeert naar dat van Lies.** Gemiddelde zinslengte in pure verteltekst: ch1 13,8 · ch2 12,8 · ch3 13,6 → ch9 9,3 · ch12 9,9 · ch13 9,1 · ch14 9,8 (Lies: ch5 9,7 · ch10 8,9). Korte "Ik …"-zinnen (≤6 woorden) per 100 zinnen: ch12 21,8 en ch14 20,5 — hoger dan Lies' eigen hoofdstukken (18,1; 15,0). Het stemcontract zegt Steven = "lange zinnen met een kleine twist op het einde", Lies = "korte declaratieve zinnen". In ch12–14 is dat omgekeerd. Omgekeerd lekt Stevens hedge-tic ("Ik weet niet…", 43× in het boek) in Lies' hoofdstukken (5× in ch5) en gebruikt Lies, die "niet van beeldspraak houdt", geregeld vergelijkingen (ch5 [3], [9], [11], [52]; ch10 [26], [31]). → **T-05 (medium).**

## Pass 3 — Overuitleg

Het boek vertrouwt zijn beelden meestal. Waar het dat niet doet, gebeurt het op dragende plaatsen:
- ch14 [76]–[77]: thema benoemd + slotinventaris → **T-01 (high).**
- ch10–11: "de kamers" door vier personages in twee hoofdstukken benoemd en door Dylan geduid → **T-02 (high).**
- ch12 [108]: herhaalt de net getoonde tafelscène → T-07.
- ch8 [10], [50], [57]: emotie benoemd na het beeld → T-08.
- ch13 [25]–[27]: Rita parafraseert wat ch5 al toonde en wat Lies in [109]–[111] zelf zegt → T-06.
- Kleinere gevallen: ch2 [74]–[75], ch3 [64]/[91], ch4 [7]/[49], ch6 [99], ch11 [98] → T-12 t/m T-16.

## Pass 4 — Menselijke rommel

Sterk aanwezig: Stevens zes of zeven Duvels en zijn wreedheid op het koertje (ch6 [86]), het potjeskamertje, de geblutste buik, Danny's kroon van negenhonderd euro, Dirk die de terugbetaling navraagt, mevrouw Van Hecke en haar kapper, Lies die tegen de arts liegt, Lies die aan Ward denkt, de energiefactuur van 2022. **PASS.**

## Pass 5 — Falen

De medische lijn faalt overtuigend en herhaaldelijk. Maar de pleegzorglijn (ch11) loopt zonder één wrijving: de screening slaagt, de consulente vindt hun zwakste antwoord "een goed antwoord", Dylan hecht zich vanaf de eerste folder, er is geen enkele moeilijke nacht, Kelly's herstel wordt per telefoon gemeld. En in deel III worden haast alle bijfiguren wijs en verzoenend (Kristof biedt tweemaal excuses aan, Roger biedt excuses aan en levert een parallelle wachtgeschiedenis, Rita duidt Lies, Jeanine postuum een aforisme). → **T-03, T-09 (medium).**

## Pass 6 — Herhaling

- Nachtelijk bed-gebaar als hoofdstuksluiter of piek: ch1, ch5, ch6, ch7, ch10, ch12, ch13 (7 van 14). ch7 [78] en ch12 [112] delen bijna letterlijk "met de rand van haar hand, één keer" (bewuste echo, op zich verdedigbaar, maar binnen een sjabloon).
- Conflict → droge grap van Steven → Lies' "echte lach met haar hoofd achterover" → ontdooiing: ch3 [84], ch8 [40], ch10 [74], ch14 [50].
- "Ik zag het, en ik zei er niets over" / "Lies zag het. Ze zei er niets over": ch4, ch9, ch10, ch11, ch14.
→ **T-11 (medium).** Geen run van vijf hoofdstukken met identiek intern sjabloon (SE32): de POV-wissels in 5 en 10 breken het.

## Pass 7 — Structuur

Cumulatieve posities bij ±42.358 woorden:

| Beat | Doel | Werkelijk | Afwijking |
|---|---|---|---|
| Openingsbeeld 0–1% | vaatwasser | ch1 [2] | OK |
| Thema 5% (±2.100) | Roger "Wanneer beginnen jullie eraan?" | ch1 [10] ±1.000 (2,4%) | OK |
| Katalysator 10% (±4.240) | afspraak / "onverklaard" | ch1 [50] ±2.450 (5,8%) / ch2 [49] ±5.300 (12,5%) | binnen 5 pt |
| Overgang naar 2, 20% (±8.470) | eerste behandeling | eerste IUI onthuld ch3 [39] ±7.000 (16,5%); IVF ch4 ±9.420 (22%) | OK |
| B-verhaal 22% | Lies' stem | ch5 begint ±12.680 (30%) | 8 pt laat; multi-scènebeat, aanvaardbaar |
| Middelpunt 50% (±21.180) | doos/lockdown, valse rust | ch8 begint ±21.100; "Nog één keer" ±23.800 (56%) — verandert de aanpak (alleen nog de diepvries) | OK (SE14 voldaan) |
| Alles verloren 75% (±31.770) | Dylan weg | einde ch11 ±32.400 (76,5%) | OK |
| Overgang naar 3 / donkere nacht 80% | tuintafel + onthulling | ch12 [75] ±35.200 (83%) | OK |
| Finale | ch13–14 | ch13–14 | OK |

Hoofdstuklengtes 2.284–3.977, mediaan ±3.050: geen hoofdstuk buiten 0,5×–2× de mediaan, niet alles binnen 10%. Eindetypes gevarieerd (beeld, dialoog, feit; één reflectie-einde: ch10). **PASS**, met opmerking dat het werkelijke dieptepunt (SE15) eerder ch12 dan ch11 is — conform de outline ("donkere nacht ch12"), geen ticket.

## Pass 8 — Continuïteit

Gecontroleerd tegen 09 (canon na drafting voorrang): leeftijden (Steven 38/39/41, Lies 35/37/38, Jarne, Lena, Mila, Jozef 69, Kristof 43, Kelly 27), embryotelling (4 ingevroren → 2 ontdooid, 1 teruggeplaatst → laatste 2 overleven niet), Dylans tien weekends, de witte Picanto, Fanny † dec 2020, Jeanine 78, Patrick in Alicante, Roger 8 jaar wachten, Siemens 45 cm + stofzuiger, negentien weken in de kleine kamer (eind juli → begin december), doopsuiker (3 doosjes, 1 open, 2 in het handschoenkastje; ch6 bovenaan gezet; ch14 "zoals Lies ze daar had gezet").

Kennisketens:
- Lies' abortus: Lies, Rita, Sofie (ch5 [29]); Steven verwerft het ch12 [76] in juli 2022; geen eerder gebruik door Steven. OK.
- Lies hoorde de "weghalen"-zin: verwerving ch6 [88]–[89] (Steven weet het niet), onthulling ch12 [96]. OK.
- Lies' Immoweb-zoektocht: Steven ziet het telefoonlicht (ch10 [65]–[67]), het "waarom" hoort hij in ch13 [94]. Consistent met de ledger ("deels in ch13").
- Begrensde onbekenden (geen ticket): Lies weet in ch13 [107] dat Steven op het koertje "vijf glazen cava" op had en een kostenschrift bijhoudt — plausibel via gedeeld huis en waarneming, niet getoond. Rita weet van november (ch10 [36]) — Lies laat de route bewust open.
- Fouten: T-04 (datum 23.06.2016 vs. Lena's geboorte en "woensdag"), T-17 (reistijd Gent), T-18 (Brico maart 2020; 6.15 u vs 6.00 u).

## Pass 9 — Machineproza (Nederlandse equivalenten van de tells)

Telling op verteltekst (dialoog tussen enkele aanhalingstekens verwijderd):

| Tell | Plafond | Overschrijdingen |
|---|---|---|
| 1 Gedachtestreepjes | 3/1000 | geen (ch6: 33 streepjes zijn het kostenschrift, vrijgesteld) |
| 2 Contrast via ontkenning | ≤1/hfst, 0 in eerste/laatste alinea | ch10 (±4), ch5 (3), ch13 (3), ch7 (2), ch8 (2), ch6 (2); ch1 [3] "Niet met een knal, eerder met een zucht" in de openingsalinea's → T-10 |
| 5 Beeld, dan uitleg | ≤1/hfst, 0 op piek | ch12 [108], ch14 [77], ch8 [10]/[57], ch4 [7]/[49] |
| 6 Emotielabels | 2/1000, 0 op piek | ch8 2,4/1000 (piek [50]: "Ik schaamde me"), ch12 2,1/1000 |
| 7 Metronoom | sd ≥5 | geen run geflagd; sd 7,7–14,0 |
| 8 Betekenisinflatie | 1/1000 | geen overschrijding |
| 11 Gestapelde hedges | ≤2/hfst | ch2 (6 zinnen, bv. [34]) |
| Uitroeptekens in vertelling | — | alleen sms-citaten (ch3, ch13): vrijgesteld |

Vijf zwakste hoofdstukken, met citaat:
1. **ch14** — "Er was geen loket. Er was een man die zich stond te scheren." ([77])
2. **ch8** — "iets wat ik niet herkende en waarvan ik pas veel later begreep dat het opluchting was." ([10])
3. **ch10** — "Dat is geen zelfmedelijden. Het is een analyse." ([12]); "Wat ik hem niet vergeef, is niet wat hij denkt." ([32])
4. **ch12** — "Ik had die tafel gedragen. Vijf minuten nadat mijn broer had gezegd dat hij een derde kind kreeg, had ik zijn tafel gedragen" ([108])
5. **ch2** — "Kwaad zijn is een vorm van ordening." ([74])

## Pass 10 — Pitch en payoff

- **Bladzijde 1** overleeft: de vaatwasser, het kinderslot, "Het defect was ik." De luchthavenlezer blijft.
- **Bladzijde 5** (±1.500 woorden): Roger, de PMD-zak "Geen drinkbrikjes." — overleeft.
- **Middelpunt** (ch7 einde / ch8 begin): stopcontactbeveiligers en "Polypropyleen" — het beste stuk van het boek; ch8's schilderscène is de valse overwinning.
- **Laatste bladzijde**: de PMD-zak met dezelfde inhoud als in ch1, "met twee handen" — betaalt de opening terug. De centrale vraag ("Is het leven ons iets verschuldigd?") wordt in handelingen beantwoord: Steven draagt de tafel, snoeit Rogers haag, geeft de trein van zijn vader door, laat de deur op een kier. De relatie-arc wordt op de pagina betaald (ch13 [114]–[122]: "Omdat ik dan degene was die stopte." / "Ze vergaf me niet."). Lies' geheim heeft een gevolg en een keuze. Het slot wordt echter vlak vóór die laatste bladzijde verzwakt door de expliciete thesis in ch14 [76]–[77] (T-01).
- **Lengte**: binnen contract, maar slechts 358 woorden boven de vloer (T-20).

---

## Tickets (geprioriteerd)

```text
T-01 | severity: high | class: prose
where: chapter-14, paragrafen 75 tot 77
quote: "Ik had al die jaren gewacht. Op de uitslag, op het streepje, op de hartslag, op een verklaring. Ik dacht dat er ergens een loket was." / "Er was geen loket. Er was een man die zich stond te scheren. Er was de Siemens beneden, die om zes uur gepiept had. […] Er was een meisje van acht maanden met een houten trein."
problem: Op de emotionele piek van het slothoofdstuk benoemt Steven de these van het boek (er is geen instantie voor rechtvaardigheid; dat stond al in ch2 [75] "er is niemand bij wie je in beroep kunt gaan") en sluit hij af met een inventaris van wat er wél is — een montage van alle motieven die leest als "tel je zegeningen". Precies het verlossende, lerende slot dat de brief en de vijandige lezer (Joris) verbieden; het neemt de lezer het werk af dat de PMD-zak in [83]–[84] zelf doet.
smallest fix: Schrap in [76] de zinnen vanaf "Ik had al die jaren gewacht" en schrap [77] volledig; laat [78] (het sneetje) direct volgen op "Ik dacht het zoals je denkt dat de melk op is."
preserve: "Ik dacht het niet als een groot moment. Ik dacht het zoals je denkt dat de melk op is." (zonder de ontkenningsaanloop indien mogelijk) en "Ik draag hem morgen toch naar buiten met twee handen."
evidence: pass 3; pass 10; tell 4 en 5 (0 op de piek); brief "geen verheffende les", "niet voortdurend het onrecht benoemen"; panel Joris.
```

```text
T-02 | severity: high | class: prose
where: chapter-10, paragrafen 41, 42 en 47; chapter-11, paragrafen 20 tot 22, 63, 77 tot 82
quote: "'Gij zoudt dat goed kunnen. Gij en Steven. Ge hebt toch die kamers.'" / "*Ge hebt toch die kamers.*" / "En wij hebben een kamer. Dat is alles." / "Ik schreef: *Omdat we een kamer hebben.*" / "'We hebben er een kamer voor.'" / "die in een kamer sliep waar nooit iemand had geslapen" / "'Daarom hebt ge die kamers,' zei hij. […] 'Waar niks in zit.' […] 'Maar niks van iemand.'" / "Ik dacht aan *niks van iemand*."
problem: De brief eist dat de lege kamers geen herhaald uitgelegd symbool worden. In ±5.700 woorden benoemen vier personages (Rita, Lies, Steven, Ilse) en een kind de kamers expliciet, Dylan duidt hun betekenis woordelijk, en de verteller herhaalt die duiding nog eens. Wat negen hoofdstukken lang via dozen, droogrek en behang werkte, wordt hier een titelverklaring.
smallest fix: Houd er twee: het doorgestreepte antwoord (ch11 [20]–[26]) en Dylans "niks van iemand" (ch11 [81]). Schrap ch10 [42] (de cursieve herhaling van Rita's zin), ch10 [47] "En wij hebben een kamer. Dat is alles.", Stevens "We hebben er een kamer voor." (ch11 [22]), de glosse "waar nooit iemand had geslapen, of niet sinds de Brackes" (ch11 [63]) en ch11 [82] "Ik dacht aan *niks van iemand*."
preserve: "'Ja,' zei Dylan. 'Maar niks van iemand.'" en "'Oh,' zei Ilse. 'Wat een schattig behang.'"
evidence: pass 3; brief ("de lege kamers geen herhaald uitgelegd symbool"); 04-theme "De kamers worden niet uitgelegd"; panel Joris ("uitgelegde symbolen").
```

```text
T-03 | severity: medium | class: structural
where: chapter-11, paragrafen 22 tot 26, 40 tot 52, 65, 94 tot 101
quote: "'Ik vind het eigenlijk een goed antwoord,' zei Ilse." / "Ze had een nieuwe vriend, die *stabiel* was, zei Ilse, en die van Dylan hield."
problem: De pleegzorglijn kent geen enkele mislukking of wrijving: screening zonder bezwaar, een consulente die hun zwakste antwoord prijst, een kind dat vanaf de eerste folder hecht, tien weekends zonder één slechte nacht, heimwee, woedeaanval of conflict met Kelly, en een herstel dat per telefoon wordt gemeld. Dylan wordt een charmante prijzenrekenaar — precies het "schattige" kind waar de vijandige lezer misère-porno-met-suiker in ziet. Het "goed nieuws dat pijn doet" weegt minder omdat er niets gekost heeft.
smallest fix: Voeg in [65]–[70] één concreet weekend toe dat misloopt (bv. Dylan die niet wil eten, in bed plast of op zondag niet naar Kelly wil, of Kelly die te laat of niet komt) en laat Steven of Lies daarin iets verkeerd doen; 150–250 woorden, geen nieuwe scène nodig.
preserve: "'Kippenbouten,' zei ik. 'Vier negenennegentig. Dat is goedkoop.'" en de gistproef ([84]–[92]).
evidence: pass 5; brief ("rauw", geen sentimentaliteit); 03 Dylan "Dat is goed nieuws, en het doet pijn".
```

```text
T-04 | severity: medium | class: continuity
contract: exact
where: chapter-06, paragraaf 44; chapter-02, paragrafen 39, 77 en 87; chapter-03, paragraaf 90
quote: "*23.06.2016 — parking UZ — 6,20*" / "Die avond belde mijn moeder. Ze belt elke donderdag, maar het was een woensdag." / "Half juni moet ze bevallen. Kristof is er zo zenuwachtig voor. Het is een meisje." / "*Lena*, *14.06.2016*"
problem: Stevens eigen kostenschrift dateert de uitslagconsultatie (parking 6,20, ch2 [60]) op 23 juni 2016, een donderdag. Die avond spreekt Monique over Lena's geboorte als toekomst, terwijl Lena op 14 juni geboren is, en de tekst zegt uitdrukkelijk dat het een woensdag was. Een aandachtige lezer die de lijst in ch6 leest, ziet de breuk.
smallest fix: Wijzig de datum in ch6 [44] naar *08.06.2016* (een woensdag, vóór Lena's geboorte, na het spermaonderzoek van 2 juni).
preserve: de volledige kostenlijst van ch6 [41]–[56], inclusief "*07.2018 — Kroatië — niet geboekt*".
evidence: pass 8; 09 ledger (Lena °14.06.2016; consult mei 2016); weekdagcontrole.
affected references: 09 "Mei 2016: onderzoeken UZ Gent"; 07 rij 2 (mei 2016).
```

```text
T-05 | severity: medium | class: voice
where: chapter-12, paragrafen 22, 99 tot 106; chapter-13, paragraaf 92; chapter-14, paragrafen 70, 81 tot 82 (Steven); chapter-05, paragrafen 3, 9, 11, 52 en chapter-10, paragrafen 26, 31 (Lies)
quote: "Ik stond op. Ik nam twee schalen met slaatjes. Ik bracht ze naar binnen. Ik ging terug. Ik nam de borden. Ik ging terug." / "Ik ga er soms binnen. Ik doe er niets. Ik sta er."
problem: Het stemcontract onderscheidt Steven (lange, meanderende zinnen met een twist) van Lies (korte declaratieven). Stevens gemiddelde zinslengte daalt van 13,8 (ch1) naar 9,1–9,9 (ch9, ch12–14) en zijn aandeel korte "Ik …"-zinnen in ch12 en ch14 (21,8 en 20,5 per 100) ligt hoger dan in Lies' eigen hoofdstukken (18,1 en 15,0). Bedek de naam en ch12–14 lezen als Lies in de verleden tijd. Omgekeerd neemt Lies Stevens tic "Ik weet niet…" over (5× in ch5) en gebruikt ze vergelijkingen ("alsof er een glazen plaat tussen zat", "zoals twee mensen die elkaar een hand geven na een begrafenis") hoewel haar kaart zegt dat ze "niet van beeldspraak houdt".
smallest fix: Voeg in ch12–14 per scène twee of drie staccato-reeksen samen tot één lange Steven-zin met een feitelijke knik op het einde (zoals ch1 [5], ch2 [20]); in Lies' hoofdstukken twee vergelijkingen en twee keer "Ik weet niet" schrappen of vervangen door een meting.
preserve: de staccato in ch9 [44]–[47] (parking, "Er is geen hartslag") — daar is compressie verdiend.
evidence: pass 2; 05-voice ritmecontract en bedek-de-naamtest; tell 7.
```

```text
T-06 | severity: medium | class: prose
where: chapter-13, paragrafen 25 tot 27 en 35
quote: "'Ik zeg maar wat, Steven,' zei Rita. 'Maar ze heeft het toen alleen gedaan. En ze heeft daarna alles alleen gedaan. Die spuiten, dat heeft ze me verteld, dat ze die niet zelf kon zetten. Dat gij dat deed. Ze was daar zo kwaad om.'"
problem: Rita vertelt Steven (en de lezer) wat ch5 [11] al toonde en wat Lies zelf in ch13 [109]–[111] uitspreekt ("Ge zat op uw knieën op die badmat […] en ge vond dat schoon", "Ik heb drie jaar gewacht tot ge ergens mee zoudt smijten"). Doordat Rita het voorkauwt, landt Lies' confrontatie aan de keukentafel als herhaling in plaats van als aanval. Ook [35] ("*Mama, misschien heb ik die gebruikt.*") herhaalt ch5 [33].
smallest fix: Schrap Rita's uitleg over de spuiten en de kwaadheid ([25] vanaf "Die spuiten" t/m [27] tot "Kijk waar ik nu zit."); laat [35] staan óf schrap het, niet allebei behouden.
preserve: "'Ja,' zei ze. 'Ik wist niet wat ik anders moest doen. Ik ben een moeder. Een moeder haalt friet.'" en Lies' "'Zeg het nog eens,' zei Lies."
evidence: pass 3 (dialoog herhaalt eerdere vertelling); causal-evidence ("a repeated mechanism is a defect when it produces no new choice").
```

```text
T-07 | severity: medium | class: prose
where: chapter-12, paragraaf 108 (met 35)
quote: "Ik had die tafel gedragen. Vijf minuten nadat mijn broer had gezegd dat hij een derde kind kreeg, had ik zijn tafel gedragen, op zijn kant, door een deur die hij niet had gemeten, en ik had het gedaan zonder na te denken, omdat hij het vroeg en omdat de tafel nat werd en omdat er niemand anders was. Ik had het gewoon gedaan."
problem: Op de donkere nacht van het boek vat Steven de tafelscène samen die de lezer twintig alinea's eerder zag (en die [35] al duidde: "er was niemand anders, en dus droeg ik hem"). De samenvatting maakt het symbool expliciet vlak voor de echte nieuwe inzichtszin in [110].
smallest fix: Reduceer [108] tot "Ik dacht aan de tafel." plus één concreet zintuiglijk detail (de nerf, de vingers); laat [109]–[110] ongewijzigd.
preserve: "Ik denk dat ze van dezelfde man komen." en het overtrek met de raketten in [112]–[113].
evidence: pass 3; tell 4 (recap) en 5 (0 op de piek); 04-theme "symbolen nooit verklaard".
```

```text
T-08 | severity: medium | class: prose
where: chapter-08, paragrafen 10, 50 en 57
quote: "In de plaats daarvan kwam er iets anders, iets wat ik niet herkende en waarvan ik pas veel later begreep dat het opluchting was. Het was alsof iemand anders voor ons had beslist." / "Ik schaamde me. Dat was het eerste. […] Dat dat niet het leven was dat ik gewild had, maar dat het misschien een leven was." / "het was alsof er twee mensen in mij zaten die elk een andere mail hadden gelezen."
problem: Het hoofdstuk benoemt drie keer de emotie die de scène al draagt (opluchting, schaamte, verdeeldheid) en zet het kernbesef van het middelpunt in een contrast-door-ontkenning. Emotielabels 2,4/1000, met labels op de piek.
smallest fix: Schrap in [10] "waarvan ik pas veel later begreep dat het opluchting was" en de zin "Het was alsof iemand anders voor ons had beslist."; in [50] de eerste drie zinnen; in [57] de "twee mensen"-vergelijking.
preserve: "Alsof er een man van het crisiscentrum op de radio was gekomen en had gezegd: vanaf woensdag moet u niet meer hopen. Het is verboden. Tot nader order." en "Met Gebroken Wit en vals zingen en een pint in de tuin onder een lege lucht."
evidence: pass 3; tell 6 (0 op de piek), tell 2, tell 5.
```

```text
T-09 | severity: medium | class: character
where: chapter-13, paragrafen 63 tot 75; chapter-12, paragrafen 45 tot 51; chapter-14, paragraaf 9
quote: "'Dat had ik niet mogen vragen.'" / "Ze zei: er bestaan geen gewone vragen." / "'Ik ben een lafaard, eigenlijk.'" / "Ik heb het deze keer eerst aan u gevraagd."
problem: In deel III krijgt bijna elke bijfiguur een verzoenend inzicht of excuus: Kristof biedt tweemaal excuses aan, Roger verontschuldigt zich voor zijn vraag uit 2015 en levert een spiegelende acht-jaar-wachtgeschiedenis met postume wijsheid van Jeanine, Rita duidt Lies. De wereld die "gewoon doorgaat" (02 Verhaalmotor) wordt achteraf begripvol; samen met T-01 schuift het slot richting troost. Joris haakt af bij "een verlossend slot".
smallest fix: Schrap Rogers excuus en Jeanines aforisme (ch13 [69]–[75]); laat de haag en het wachten op Patrick staan. Eventueel ch14 [9] "Ik heb het deze keer eerst aan u gevraagd. […] Ik heb gewoon gebeld." inkorten tot de vraag zelf.
preserve: "'Van onder naar boven. En een beetje schuin.'" en "Ik heb sindsdien elke zondag om negen uur zijn haag gesnoeid."
evidence: pass 5; brief ("geen troostclichés", "geen verheffende les"); 03 "niemand is slecht; daarom kan hij nergens heen met zijn woede".
```

```text
T-10 | severity: medium | class: prose
where: chapter-10, paragrafen 12, 26, 32, 46; chapter-06, paragraaf 85; chapter-07, paragraaf 18; chapter-13, paragraaf 3; chapter-01, paragraaf 3
quote: "Dat is geen zelfmedelijden. Het is een analyse." / "Wat ik hem niet vergeef, is niet wat hij denkt." / "Het was niet de cava. Het was Bert." / "Zo was het niet. Het was niet beslist." / "Niet met een knal, eerder met een zucht"
problem: Contrast-door-ontkenning is de vaste manier geworden om een punt te maken, bij beide vertellers (ch10 ±4, ch5 3, ch13 3). Het ondermijnt het stemverschil (T-05) en hoort de vijandige lezer als sjabloon.
smallest fix: Per hoofdstuk maximaal één ontkenningscontrast behouden; in ch10 [12] en [32] de ontkenning schrappen en direct de positieve bewering geven.
preserve: ch1 [3] mag blijven als enige in de opening als het ritmevoorbeeld uit 05-voice behouden moet worden; ch12 [99] "Ze deed het portier niet hard dicht. Ze deed het zachtjes dicht" draagt de scène.
evidence: tell 2 (≤1 per hoofdstuk).
```

```text
T-11 | severity: medium | class: structural
where: einde chapter-01 [66]–[69], chapter-05 [57]–[66], chapter-06 [109]–[111], chapter-07 [78], chapter-10 [77]–[78], chapter-12 [111]–[114], chapter-13 [92]; lach-sjabloon chapter-03 [84], chapter-08 [40], chapter-10 [74], chapter-14 [50]
quote: "en het daar instoppen, met de rand van haar hand, één keer." (ch7 [78]) / "en trok het recht tot aan mijn schouder, met de rand van haar hand, één keer." (ch12 [112]) / "Ze lachte haar echte lach, in de Skoda" (ch14 [50])
problem: Zeven hoofdstukken pieken of sluiten op een nachtelijk bed-gebaar (hand op heup, rug naar de deur, dekbed instoppen), en vier conflicten ontdooien via hetzelfde mechaniek (droge grap van Steven → Lies' echte lach met haar hoofd achterover). De bewuste echo's verliezen kracht in een sjabloon.
smallest fix: Verplaats of vervang het bed-slot van ch5 of ch10 door een daglichtgebaar; laat in ch10 [74] Lies' lach weg of maak hem kort, zodat de lach in ch14 weer een gebeurtenis is.
preserve: de echo ch7 [78] / ch12 [112] (de dekbed/overtrek-spiegeling) en ch14 [50].
evidence: pass 6; SE31/SE32.
```

```text
T-12 | severity: low | class: prose
where: chapter-02, paragrafen 74 tot 75
quote: "Kwaad zijn is een vorm van ordening. Het zegt: dit had anders gemoeten."
problem: Een kort essay herhaalt wat de parkeerdialoog al zei ("'Ik zou liever willen dat het aan iets ligt,' zei ik." [66]). Na T-01 is dit de enige plek waar de these wordt uitgesproken; dan mag ze korter.
smallest fix: Houd [75] ("*Onverklaard* zegt niets. […]") en schrap [74].
preserve: "Je hebt de vragen van het mondeling examen allemaal juist beantwoord, en je bent niet geslaagd, en er is niemand bij wie je in beroep kunt gaan."
evidence: pass 3; brief "niet voortdurend het onrecht benoemen".
```

```text
T-13 | severity: low | class: prose
where: chapter-11, paragraaf 98
quote: "Ik meende het zoals ik het meende toen mijn broer zijn derde aankondigde, wat pas later kwam, maar ik zeg het hier al, omdat het hetzelfde soort menen was: een menen dat waar is, en dat toch ergens anders pijn doet."
problem: Legt het gevoel uit dat [96]–[97] ("'Ja,' zei ik. 'Dat is goed nieuws.'") al droeg, en vooruitgrijpend verklapt het de aankondiging van ch12.
smallest fix: Schrap [98] na "Ik meende het."
preserve: "'Hij vraagt of gij nog altijd de choco zonder hazelnoten eet.'"
evidence: tell 5; pass 3.
```

```text
T-14 | severity: low | class: prose
where: chapter-03, paragrafen 64 en 91
quote: "Dat is de volgorde van de dingen, voor sommige mensen. Je denkt het, en het komt." / "en dat ik suikerbonen at die bedoeld waren om te vieren dat er een kind was geboren, het kind van een ander"
problem: Duidt de toespraak en de doopsuiker na het beeld.
smallest fix: Schrap de laatste twee zinnen van [64]; in [91] stoppen na "met de vaatwasser die niet vol was en de koelkast die zoemde".
preserve: "Ik eet geen doopsuiker. Niemand eet doopsuiker."
evidence: tell 5.
```

```text
T-15 | severity: low | class: prose
where: chapter-04, paragrafen 7 en 49
quote: "Het voelde als een testament schrijven voor iemand die nog moest worden geboren, en ik bedacht dat dat eigenlijk precies was wat het was." / "Het was een lampje dat het werk deed van zichtbaar maken wie je bent"
problem: Beide beelden worden direct verklaard; het lampje (één kapot, hele auto afgekeurd) werkt zonder de uitleg.
smallest fix: Schrap in [7] de bijzin vanaf "en ik bedacht"; in [49] de tweede zin.
preserve: "Een van de twee was kapot, en de andere werkte, en daardoor was de hele auto afgekeurd."
evidence: tell 5.
```

```text
T-16 | severity: low | class: prose
where: chapter-06, paragraaf 99; chapter-12, paragraaf 84
quote: "zoals de olijfpit in de vaatwasser, maar dat ik deze keer niet wist welke filter ik moest losdraaien." / "het was er gekomen zoals water komt als je een filter losdraait"
problem: De vaatwasserfilter wordt tweemaal als verklarende vergelijking ingezet; de eerste keer met uitleg, de tweede keer op de piek van de onthulling.
smallest fix: Schrap de vergelijking in ch6 [99]; houd die in ch12 of vervang ze door "vanzelf".
preserve: "*Maar ze kon het dus wel.*" (ch12 [85]).
evidence: P17 (herhaling), tell 5.
```

```text
T-17 | severity: low | class: continuity
contract: approximate
where: chapter-02, paragraaf 20; chapter-08, paragraaf 16; chapter-09, paragraaf 18
quote: "We wonen vijftig minuten van Gent als er geen file staat." / "Ik heb er tweeëntwintig minuten over gedaan." / "We reden naar huis in vijfentwintig minuten."
problem: Zonder file is de rit vijftig minuten, op een lege E40 tweeëntwintig tot vijfentwintig. Het verschil maakt Lies' blijdschap in ch8 kleiner dan bedoeld (het lijkt een rekenfout, geen wonder).
smallest fix: ch2 [20]: "veertig minuten" of "een half uur als er geen file staat. Er staat altijd file."
preserve: "Er staat altijd file."
evidence: pass 8.
```

```text
T-18 | severity: low | class: continuity
where: chapter-08, paragraaf 13; chapter-03, paragraaf 4
quote: "Danny ging met zijn eigen auto naar de Brico, die open was, en kocht stofmaskers" / "Ik had het gehoord om kwart over zes 's ochtends […] Het was zes uur 's ochtends."
problem: Doe-het-zelfzaken waren in België van 18 maart tot 18 april 2020 dicht (ch8 [26] gebruikt de heropening correct). In ch3 hoort Steven het nieuws om 6.15 u, waarna Lies om "zes uur" gaat lopen.
smallest fix: ch8 [13] "naar een tankstation" of "naar de Action, die nog open was" (vóór 18 maart); ch3 [4] "Het was nog geen half zeven."
preserve: "kocht stofmaskers die bedoeld waren voor schuurwerk".
evidence: pass 8.
```

```text
T-19 | severity: low | class: voice
where: chapter-10, paragraaf 78
quote: "Ik ga niet weg. Dat heb ik toen besloten. Niet voor altijd. Voorlopig."
problem: Lies vertelt in de tegenwoordige tijd; "Dat heb ik toen besloten" breekt plots naar retrospectie en maakt van het einde een samenvattende reflectie (het enige reflectie-einde van het boek), terwijl [77] (de elf vuilbakjes, de hand op zijn schouder) het al zegt.
smallest fix: Schrap [78] of reduceer tot "Voorlopig."
preserve: "Er is een knopje met een vuilbakje. Ik druk er elf keer op."
evidence: tell 4; 05-voice (Lies: tegenwoordige tijd).
```

```text
T-20 | severity: low | class: structural
contract: exact
where: manuscript als geheel
quote: "Lengtecontract: 42.000–52.000 woorden; vloer 42.000, plafond 52.000"
problem: Het manuscript telt ±42.358 woorden: binnen contract, maar 358 boven de vloer. De schrappingen uit T-01, T-02, T-06 t/m T-08 en T-12 t/m T-16 samen (±900–1.100 woorden) duwen het boek onder de vloer.
smallest fix: Compenseer netto binnen de revisie: de toevoeging uit T-03 (150–250) en een verrijkte Steven-zin per scène uit T-05 volstaan niet alleen; plan een aanvullende concrete scène van ±500–800 woorden waar het boek nu het dunst is (ch14 telt 2.284, ch5 2.308), bv. een daglichtscène in deel III die wrijving geeft. Hertel na elke revisieronde.
preserve: de huidige hoofdstukvolgorde en het ritme van ch14's slot.
evidence: pass 0, pass 10; 00-brief lengtecontract; index.md (vloer is een harde poort).
```

---

## Samenvatting

- High: 2 (T-01, T-02) · Medium: 9 (T-03 t/m T-11) · Low: 9 (T-12 t/m T-20)
- Geen open exact contractticket (T-04 is een exacte interne datumbreuk, niet in strijd met de brief; T-20 is een risico, geen schending).
- Passes met high-ernst: pass 3 (overuitleg, T-01 en T-02). Andere passes: medium of schoon. De structuur draagt alle reparaties; geen herarchitectuur nodig.

audit_status: revise
