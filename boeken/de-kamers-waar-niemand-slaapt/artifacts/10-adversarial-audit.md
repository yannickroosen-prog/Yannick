# 10 — Adversariële audit

Manuscript: *De kamers waar niemand slaapt*, hoofdstukken 1–14 (43.457 woorden volgens `wc -w`, koppen inbegrepen).
Rol: auditor, alleen lezen. Er is geen hoofdstuk of planbestand aangepast.
Alineanummering: elke niet-lege regel van het hoofdstukbestand telt als één alinea. De kop (`# n. Titel`) is alinea 1, en scheidingslijnen (`---`) tellen ook mee. Met `awk 'NF{n++; print n": "$0}'` vind je elke verwijzing terug.
De sectie "Brief contract check" in `07-outline.md` is genegeerd: dat is procesmetadata en geen bewijs.

---

## Resultaten per pass

### Pass 0 — Briefcontract

| Briefclausule (letterlijk uit `00-brief.md`) | Outline/ledger | Manuscript | Resultaat |
|---|---|---|---|
| Premisse: "een man en een vrouw die geen kinderen kunnen krijgen. Niet als een medisch verhaal over onvruchtbaarheid, maar als een existentiële roman over de fundamentele oneerlijkheid van het bestaan." | 07: alle 14 rijen; 02 escalatielogica 1–8 | Medisch detail blijft overal ondergeschikt aan de scène (ch2 potje, ch4 spuiten, ch9 echo). Er is geen kliniekgids. | PASS |
| Centrale gedachte: "het leven belooft niets, maar laat mensen wel hun hele bestaan rond die belofte organiseren." | 04 centrale vraag | Wordt gedragen door het huis, de kamers en de voorwerpen. In ch14 al. 78 wordt de gedachte echter bijna letterlijk als stelling uitgeschreven (zie T-01). | PASS als contract, als uitvoering een literair probleem |
| Belofte: "je zult lachen waar je zou moeten huilen" | 07 humorkolom | ch1 olijfpit, ch2 tandarts/kroon, ch3 imitatie van Kristof, ch8 verf, ch10 Fanny Twee, ch11 prijzen van Dylan, ch12 tafel, ch14 suikerboon. | PASS |
| Tijdvenster: "maart 2016 – oktober 2023 (benaderend, "ongeveer zeven en een half jaar")" | 07 rij 1 "maart 2016", rij 14 "mei–okt 2023"; 09 medische tijdlijn | ch1 staat niet expliciet in maart, maar "twee jaar" na de lente van 2014 en vóór de afspraak van "twaalf mei" past. ch14 al. 81: "op een dinsdagavond in oktober … zeven jaar na de olijfpit". | PASS (benaderend) |
| POV: "ik-vorm, Steven Claeys (1–4, 6–9, 11–14); ik-vorm, Lies Van Damme (5 en 10)" | 07 kolom POV | ch5 en ch10 dragen *Lies* en staan in de tegenwoordige tijd. De andere hoofdstukken zijn Steven. | PASS |
| Lengte: "42.000–52.000 woorden; vloer 42.000" | 07: 46.500 gepland | 43.457. Dat ligt binnen het contract, maar 3.043 onder de planning en maar 1.457 boven de vloer. | PASS. Let op: het netto-effect van de schrapvoorstellen hieronder moet boven 42.000 blijven. Schatting: ±800 woorden geschrapt, ±600 erbij door T-04. |
| Gedateerde gebeurtenissen (exact) | 09 | Alle weekdagen kloppen: za 17-09-2016, di 14-06-2016 (Lena, "dinsdagnacht"), vr 17-05-2019, vr 24-05-2019 (verkiezingen zo 26-05 kloppen), ma 16-03-2020, ma 08-06-2020, do 12-11-2020, vr 15-10-2021, di 17-01-2023, do 26-01-2023. Leeftijden kloppen ook: 38/37 in april 2020, 39/38 in voorjaar 2021, Kristof 43, Steven 41 in september 2023. | PASS |

Er zijn geen exacte contracttickets open. De ledger wijkt op twee punten af van het manuscript, maar daar heeft het manuscript gelijk (T-20).

Extra eisen uit de oorspronkelijke opdracht van de auteur:
- **Alledaags begin.** PASS. "De vaatwasser gaf het op op een dinsdag."
- **Onrecht nooit voortdurend benoemen.** FAIL. Zie ch2 al. 76, ch6 al. 67, ch12 al. 36 en ch14 al. 78 (T-01, T-07).
- **Filosofie uit het gewone leven.** Grotendeels PASS. Twee essaypassages (ch2 al. 74–76, ch14 al. 76–78) stappen over op betoog.
- **Geen therapeutische taal of troostclichés.** PASS. "loslaten" (Danny, Rita) en "een plek geven" (Ilse) staan in citaat en botsen telkens met de context. "Leegte" komt niet voor. Er zijn wel twee sentimentele metaforen: ch7 al. 77 ("nergens, en dus overal") en ch11 al. 98 ("een kamer van je lijf").
- **Voorwerpen dragen de emotie.** PASS, en dat is de grootste kracht van het boek. Het probleem is dat ze daarna vaak nog worden uitgelegd.
- **De lege kamers geen symbool dat steeds wordt uitgelegd.** FAIL (T-03).
- **Humor op de plaats van tranen.** PASS.
- **Slot: geen les, geen nihilisme, wel waardigheid zonder rechtvaardigheid.** Het slot voldoet in handelingen: haag, peter, trein, doopsuiker, deur. Het wordt ondergraven door een uitgesproken stelling en een sluitzin met een moraal (T-01, T-02).
- **Eigen binnenleven van de vrouw.** PASS voor ch5 en ch10: woede, verlangen (Ward, appartementen, microscoop), fouten (liegen tegen de arts). In Deel III wordt haar woede alleen nog gerapporteerd (T-14).

### Pass 1 — Bestaansrecht
Elk hoofdstuk heeft een eigen draaipunt. ch3, ch6 en ch12 zijn alle drie familie- of vriendenfeesten, maar elk heeft een andere waardeverschuiving: eerste barst, wreedheid, onthulling. Er wordt niets geschrapt of samengevoegd. Het gedeelde skelet van die drie is wel een herhalingsprobleem (T-11). PASS.

### Pass 2 — Stem
Steven is consistent: hij telt, kent huishoudmechaniek, schrijft lange zinnen met een kleine draai. Bij de bijfiguren werkt de "bedek de naam"-test goed. Kristof heeft "manneke" en "Ik ga het kort houden", Rita "Ik zeg maar wat", Danny "Ge moet…", Roger halve zinnen. Lies onderscheidt zich door de tegenwoordige tijd en kortere alinea's. Toch neemt ze Stevens tics over, gebruikt ze meer beeldspraak dan haar stemkaart toelaat ("houdt niet van beeldspraak") en ontleent ze zelfs een beeld letterlijk aan ch1 (T-13). Het ritme blijft binnen de enveloppe. Het grote stemprobleem is een vertellerstic (T-06). **Gedeeltelijk FAIL (medium).**

### Pass 3 — Overuitleg
Dit is het zwaarste probleem van het manuscript. Het patroon is vast: een sterk beeld of gebaar, daarna een zin die zegt wat het betekende. Het gebeurt in bijna elk hoofdstuk en vaak op het emotionele hoogtepunt: ch4 al. 49 en 73, ch6 al. 72, ch7 al. 77, ch8 al. 80, ch10 al. 73, ch11 al. 15, 82, 98 en 119, ch12 al. 36 en 110–112, ch13 al. 95, ch14 al. 71, 76–78 en 86–88. **FAIL (high)**: T-01, T-02, T-03, T-05, T-07, T-08, T-09.

### Pass 4 — Menselijke rommel
Sterk. Er is kleinzieligheid (de wreedheid van Steven op het koertje, ch6 al. 68; zijn uitval over Kelly, ch12 al. 71), idle talk (Dirk en de verzekeringen, Danny en zijn kroon), lichamelijkheid (potje, spuiten, krampen, curettage, rugpijn, te korte matras), zelfveroorzaakt falen (olijfpit, zes à zeven Duvels, gras maaien in januari) en wrijving buiten de hoofdplot (ketels, Van Hecke, energieprijzen). **PASS.**

### Pass 5 — Falen
De plannen falen terecht en hard (IUI, IVF, diepvries, adoptie, pleegzorg). Interpersoonlijke breuken herstellen echter telkens binnen dezelfde scène met één geestige of tedere zin, gevolgd door een lach of een hand (T-10). Daardoor kost elke breuk te weinig. **Gedeeltelijk FAIL (medium).**

### Pass 6 — Herhaling
Er zijn drie terugkerende sjablonen:
- **Feesthoofdstukken.** ch3, ch6 en ch12 volgen hetzelfde schema: aankondiging, drank, rit met Lies, thuis. Er zijn letterlijke herhalingen. "In de auto zei Lies niets tot we de straat uit waren." staat in ch3 en ch12. "Ik ga het kort houden" staat in ch3, ch12 en ch14 (T-11).
- **Slotbeelden.** Alle 14 hoofdstukken eindigen op een stil, huiselijk slotbeeld. Roger fungeert in zes hoofdstukken als koor bij het slot. ch3 en ch9 eindigen met hetzelfde telefoontje van Van Hecke (T-12).
- **Gezicht lezen en uitleggen.** Dit gebeurt zes keer (T-05).

Daarnaast herhaalt het boek de "hand op haar heup"-slotgebaren (ch1, ch4, ch5 tweemaal, ch11) en het beeld van slapend leven dat op water wacht: gist in ch11 al. 88–91 en raderdiertje in ch14 al. 65. Het tweede verzwakt het eerste. **FAIL (medium).**

### Pass 7 — Structuur (cumulatieve woordposities)
ch1 eindigt op 2.922 (6,7%), ch2 op 6.215 (14,3%), ch3 op 9.503 (21,9%), ch4 op 12.827 (29,5%), ch5 op 15.165 (34,9%), ch6 op 18.184 (41,8%), ch7 op 21.433 (49,3%), ch8 op 24.407 (56,2%), ch9 op 27.541 (63,4%), ch10 op 30.109 (69,3%), ch11 op 33.504 (77,1%), ch12 op 37.230 (85,7%), ch13 op 40.887 (94,1%) en ch14 op 43.457.

- **Catalysator** (10%). De afspraak valt op ±6%, het potje op ±9–11%. Binnen de marge.
- **Overgang naar 2** (20%). De eerste IUI wordt onthuld in ch3 (±16%), IVF begint aan het begin van ch4 (21,9%). OK.
- **B-verhaal.** Lies krijgt haar eigen stem pas in ch5 (29,5% tegenover 22% gepland), dus 7,5 punten laat. Dat is acceptabel omdat ze in ch1–4 sterk aanwezig is. Geen ticket.
- **Middelpunt** (50%). ch7/ch8 bestaat uit de doos van vader, dan de valse rust van de lockdown en dan "nog één keer". Het middelpunt verandert hoe Steven het doel nastreeft (SE14). PASS.
- **Miskraam.** Ligt op ±59–62%, iets vroeger dan de geplande 57–64%. OK.
- **Alles verloren** (75%). Dylan vertrekt op 77%, maar het werkelijke dieptepunt (SE15) is ch12 (±84–86%). Dat is aanvaardbaar, want het dieptepunt is dan de donkere nacht.
- **Finale.** Hier zit het structurele gat. De gevolgen van de onthulling in ch12 worden in ch13 al. 94–95 in samenvatting afgehandeld (T-04). Stevens emotionele boog sluit daardoor in vertelling in plaats van in een scène (SE34).

**Gedeeltelijk FAIL.** Het ticket hoort bij pass 10.

### Pass 8 — Continuïteit
- **Wie weet wat.**
  - Lies' abortus. De lezer hoort het in ch5. Steven verwerft het in ch12 al. 78 (juli 2022) en gebruikt het nergens eerder. PASS.
  - Lies heeft de opmerking op het koertje gehoord. Ze verwerft die in ch6 al. 70–72 en gebruikt ze in ch12 al. 98. PASS.
  - Steven weet van de appartementen. Hij verwerft dat in ch10 al. 65–67 (het blauwe licht onder het dekbed). Hier spreekt de ledger het manuscript tegen (T-20).
  - Rita weet dat Steven het weet (ch13 al. 15). Ze leidt het af uit zijn onverwachte bezoek. Dat is een plausibele, begrensde onbekende.
  - Lies weet dat Steven 's nachts in de kleine kamer komt (ch10 al. 30), via het krakende scharnier. PASS.
- **Voorwerpen.**
  - Doopsuiker: ch3, ch4 al. 50, ch6 al. 86, ch14 al. 40–41. Consistent (zeven suikerbonen in een ongeopend doosje), op het lot van het derde, geopende doosje na (T-19).
  - Stopcontactbeveiligers: ch7 (twee eruit, tien terug), ch11 al. 35 en ch14 al. 62. PASS.
  - Vaatwasser: ch1, ch11, ch13 (Bosch, daarna Siemens 45 cm). PASS.
- **Tegenstrijdigheden.**
  - Wie maakte de afspraak voor de abortus (T-15).
  - Het aantal bezoeken van Dylan (T-17).
  - De jaren zestig van Roger (T-18).
  - Kleine feiten (T-19).
  - De ledger is verouderd (T-20).

Er is geen enkel geval van een personage dat informatie gebruikt voordat het die kon weten. **PASS met medium- en low-tickets.**

### Pass 9 — Machineproza (Nederlandse equivalenten van `ai-tells-en.md`)
- **Gedachtestreepjes.** 2 in het hele boek. PASS.
- **Contrast door ontkenning** ("Niet X. Y." / "Het was geen X. Het was Y." / "niet omdat … maar omdat"). Plafond: 1 per hoofdstuk en 0 in de eerste en laatste alinea. Overschreden in ch3 (al. 14, 29, 34 en verder), ch6 (al. 67, 72), ch7 (al. 18, 33, 76), ch9 (al. 45, 67), ch10 (al. 12, 32), ch11 (al. 119) en ch14 (al. 76, 87–88, **in de laatste alinea's**). ch1 al. 3 ("Niet met een knal, eerder met een zucht") staat in een dragende positie, maar is het stemmodel. Vrijstelling.
- **Beeld, dan uitleg.** Plafond: 1 per hoofdstuk, 0 op de piek. Overschreden in ch4, ch6, ch7, ch8, ch10, ch11, ch12 en ch14 (zie pass 3).
- **Moraal bij de deur** (laatste alinea). ch10 ("Voorlopig is het eerlijkste woord dat ik ken, na meetonzekerheid.") en ch14 ("Het is omdat ik het draag."). Dat is 2 op 14, boven de grens van 1 op 10. Fail.
- **Hedge stacking.** In de Lies-hoofdstukken komt "Ik denk" 8 keer voor (ch5) en 10 keer (ch10), bij een stemkaart van "metingen, korte declaratieve zinnen".
- **Vertellerstic "Ik weet niet …".** 57 keer in het boek, waarvan 16 varianten van "Ik weet (nog steeds/niet meer) niet waarom" (T-06).
- **Emotielabels en significantie-inflatie.** Binnen de grenzen.

Vijf slechtste hoofdstukken, met citaat:
1. **ch14**: "Het leven was niets verschuldigd. Het had nooit iets beloofd." (al. 78) en "Dat is niet omdat het zwaar is." / "Het is omdat ik het draag." (al. 87–88).
2. **ch11**: "Het is de beste beschrijving van die kamers die iemand ooit gegeven heeft" (al. 82) en "Nu was er bijna niets meer in, en ze was vol. Ik weet niet hoe ik het anders moet zeggen." (al. 119).
3. **ch6**: "Ik denk nu dat het de blik was van iemand die iets heeft gehoord wat ze al jaren vreesde te zullen horen" (al. 72). Er zijn drie keer "Ik weet niet waarom" (al. 32, 86, 88).
4. **ch7**: "Iets wat nergens was, en dus overal." (al. 77). Daarnaast "Ik weet niet waarom" (al. 53) en "Ik weet niet waarom ik het zei." (al. 68).
5. **ch10**: "en het is het liefste wat iemand ooit tegen mij gezegd heeft." (al. 73) en het slot in al. 78.

**FAIL (medium).**

### Pass 10 — Pitch en payoff
- **Bladzijde 1.** Overleeft. "De vaatwasser gaf het op op een dinsdag." en "Een vaatwasser voor twee mensen is eigenlijk een kast met ambities." Droog en concreet. De luchthavenlezer blijft.
- **Bladzijde 5** (±1.500 woorden, ch1 al. 31–33). Overleeft. "De deuren staan meestal dicht. Dat is praktisch. Dan moet je ze niet verwarmen." Dit is het boek op zijn best: niets wordt uitgelegd.
- **Middelpunt** (ch7 en ch8). Sterk: de stopcontactbeveiligers, "Polypropyleen", Lies die zingt op de ladder en de pint onder de lege lucht.
- **Laatste bladzijde.** Verzwakt. Het slot betaalt de belofte van de opening in voorwerpen terug: de PMD-zak die al in ch1 al. 11 staat, de deur, de dinsdag. Daarna zegt de verteller wat het betekent (T-02). Twee alinea's eerder staat de these van de brief (T-01). Recensent Joris zou hier zijn bewijs vinden.
- **Centrale vraag.** "Is het leven ons iets verschuldigd?"
  - Setup: ch1 al. 10–11 (Roger: "Wanneer beginnen jullie eraan?") en ch2 al. 75.
  - Bewijs: ch9 (de enige "sterfdatum"), ch11 (Dylan gaat terug) en ch12 (Stevens morele boekhouding breekt: "*Maar ze kon het dus wel.*").
  - Keuze en gevolg op de pagina: Steven snoeit Rogers haag (ch13 al. 77), wordt peter, geeft de trein weg, gooit de doopsuiker van Lena weg en houdt dat van Mila (ch14 al. 54–55). Hij laat de deur open.

  Het antwoord staat dus al op de pagina, in handelingen. De uitgesproken versie is overbodig.
- **Stevens leugen** ("wie zich gedraagt, krijgt waar hij recht op heeft"). Die breekt in ch12 al. 110–112, maar het herstel ervan staat in vertelling (ch13 al. 95: "Ik heb haar niet vergeven. Er was niets om te vergeven.") in plaats van in een scène. Lies' eigen vraag "misschien heb ik die gebruikt" wordt beantwoord in een samenvattende alinea (ch13 al. 94) en via haar moeder (ch13 al. 35). Afhankelijkheid: één scène van ±500–800 woorden in ch13, het keukengesprek waarin Steven de zin hardop zegt (T-04).
- **Lengte.** Binnen het contract.

**FAIL (high)**: T-01, T-02, T-04.

---

## Tickets (geprioriteerd)

```text
T-01 | severity: high | class: prose
where: chapter-14, paragraphs 75 to 78
quote: "Het leven was niets verschuldigd. Het had nooit iets beloofd. Wij hadden het zelf beloofd, aan elkaar, aan de Brackes, aan de Brico met zijn Zacht Salie, aan de Action met haar stopcontactbeveiligers. Wij hadden een huis gekocht met drie slaapkamers. Het huis had nergens om gevraagd."
problem: De these van de brief ("het leven belooft niets…") staat bijna letterlijk op de voorlaatste bladzijde. Al. 76 vat de hele roman samen ("als je je handen waste met water zonder zeep en je formulieren invulde en je afspraken maakte om tien voor half tien …"). De lezer krijgt de conclusie voorgezegd die het boek in voorwerpen al had laten ontdekken. De brief zegt: "het onrecht nooit voortdurend benoemen". Dit is de vierde keer (na ch2 al. 76, ch6 al. 67 en ch12 al. 36), en de meest expliciete.
smallest fix: Schrap al. 78 helemaal. Snoei in al. 76 de recapitulatielijst na "op een verklaring." Laat al. 75 ("Ik dacht: dit is het. Er komt geen antwoord.") en al. 77 de zaak dragen.
preserve: "Er was geen loket. Er was een man die zich stond te scheren. Er was de Siemens beneden, die om zes uur gepiept had." en al. 79 (het sneetje, het stukje wc-papier "zoals mijn vader deed").
evidence: pass 3, pass 10; ai-tells #4/#5; brief: "nooit voortdurend het onrecht benoemen", "geen zelfhulpwijsheid"; 04-theme: "nooit door samenvattende zinnen".
```

```text
T-02 | severity: high | class: prose
where: chapter-14, paragraphs 86 to 88 (slot van het boek)
quote: "Ik draag hem morgen toch naar buiten met twee handen, zoals je iets draagt wat zwaar is." / "Dat is niet omdat het zwaar is." / "Het is omdat ik het draag."
problem: Het laatste beeld van het boek legt zichzelf uit, en dat met een ontkenningspaar ("niet omdat … Het is omdat …"), de tic van de verteller. Het klinkt als een tegeltjeswijsheid, precies het troostcliché dat de brief verbiedt. De echo van de PMD-zak uit ch1 al. 11 doet het werk al.
smallest fix: Schrap al. 87 en 88. Overweeg ook in al. 86 de vergelijking "zoals je iets draagt wat zwaar is" te schrappen, zodat het boek eindigt op "Ik draag hem morgen toch naar buiten met twee handen." of op al. 85 "Het is bijna niets."
preserve: "De PMD-zak is licht. Er zitten twee melkflessen in, wat blikjes, een schaaltje van gehakt, een lege fles van de afwasmachinetabletten. Het is bijna niets."
evidence: pass 10 (laatste bladzijde), ai-tells #2 (0 in laatste alinea), #4 (moral at the door), #5; brief: "geen verlossende les".
```

```text
T-03 | severity: high | class: prose
where: chapter-11, paragraphs 82, 98, 119; chapter-14, paragraphs 71 and 83; (ook ch10 al. 41–42, ch11 al. 20–22, ch12 al. 117)
quote: "Het is de beste beschrijving van die kamers die iemand ooit gegeven heeft, en ze kwam van een jongen van acht in de Colruyt die de prijs van pampers wist." (ch11 al. 82) / "De kamer was leeg. Niet zoals vroeger. Toen was ze vol geweest, met dozen en koffers en kerstversiering, en leeg. Nu was er bijna niets meer in, en ze was vol. Ik weet niet hoe ik het anders moet zeggen." (ch11 al. 119) / "Ik weet nu naar wie ze zwaaien. Naar Dylan, die ze zag. Naar mij, op het plooibed, in juli. Naar de Brackes. Naar niemand." (ch14 al. 71)
problem: De brief eist dat de lege kamers geen symbool worden dat steeds wordt uitgelegd. Het manuscript doet precies dat. Rita ("Ge hebt toch die kamers"), Steven ("Omdat we een kamer hebben", "We hebben er een kamer voor"), Dylan ("Daarom hebt ge die kamers"), Stevens commentaar daarop, de paradox leeg/vol, "een kamer van je lijf waar je geen deur naartoe hebt" (al. 98), de titelzin "in de kamer waar niemand sliep" (ch12 al. 117), de uitgelegde ballonnen (ch14 al. 71) en de telling "één jongen … acht keer, en één man, negentien weken" (ch14 al. 83). Het symbool wordt zo zwaar dat het niet meer in het huis staat maar in de marge.
smallest fix: Houd Dylans dialoog en Ilses "schattig behang". Schrap in ch11 al. 82 alles na "Ik dacht aan *niks van iemand*." Schrap ch11 al. 119 helemaal. Schrap in ch11 al. 98 de bijzin ", in een kamer van je lijf waar je geen deur naartoe hebt". Schrap in ch14 al. 71 de zinnen van "Ik weet nu naar wie ze zwaaien" tot "Het maakt voor de poppetjes niet uit." Snoei ch14 al. 83 tot "Er slaapt daar niemand." (of schrap al. 83 helemaal).
preserve: "'Ja,' zei Dylan. 'Maar niks van iemand.'" en "'Oh,' zei Ilse. 'Wat een schattig behang.'" en ch1 al. 33 "De deuren staan meestal dicht. Dat is praktisch. Dan moet je ze niet verwarmen."
evidence: pass 3; brief: "de lege kamers mogen geen symbool worden dat herhaaldelijk wordt uitgelegd"; 04-theme: "De kamers worden niet uitgelegd"; ai-tells #5.
```

```text
T-04 | severity: high | class: structural
where: chapter-13, paragraphs 94 to 95
quote: "Ze zei: 'Dat is het enige wat we weten. Al de rest is onverklaard.'" / "Ik heb haar niet vergeven. Er was niets om te vergeven." / "Als er iemand iets te vergeven was, dan was het niet zij."
problem: De onthulling in ch12 is het moreel hoogtepunt van het boek: Stevens boekhouding van wie een kind verdient, breekt. De gevolgen daarvan (de zin hardop, Lies' antwoord, haar woede over "weghalen", de herijking van Steven) staan in één samenvattende alinea ("Later hebben we er wel over gepraat. Niet in één keer. In stukken."). Daarna volgt een alinea waarin de verteller het morele oordeel zelf uitspreekt en zichzelf aanwijst. De lezer ziet de belangrijkste keuze van de hoofdpersoon niet gebeuren. Dat is precies "verzoening als verhaal", wat de outline (rij 13) wilde vermijden. Lies krijgt de themazin "Al de rest is onverklaard" in de mond, als echo van ch2.
smallest fix: Dramatiseer één "stuk" als scène van ±500–800 woorden: de avond in de keuken waarop Steven "*Maar ge kon het dus wel.*" hardop zegt. Lies antwoordt daar met haar eigen woede of weigering, niet met een slotformule (zie T-14). Schrap al. 95 helemaal. Laat de koffie met twee klontjes in al. 96 het oordeel dragen.
preserve: "We hebben het niet opgelost. We hebben een radiator ontlucht." (al. 93) en "Ze heeft me een kop koffie gegeven, de avond nadat ik die zin hardop gezegd had, met twee klontjes suiker, terwijl ik geen suiker neem. Ik heb hem opgedronken." (al. 96)
evidence: pass 10 (central question; promised decision happens off-page), pass 7 / SE34 (emotionele boog sluit op de pagina), 02-story-engine stap 7–8, 07-outline rij 13.
```

```text
T-05 | severity: high | class: prose
where: chapter-06, paragraph 72; chapter-08, paragraph 80; (ook ch3 al. 29, ch10 al. 71, ch12 al. 18)
quote: "Ik denk nu dat het de blik was van iemand die iets heeft gehoord wat ze al jaren vreesde te zullen horen, en die opgelucht is en kapot tegelijk, omdat het eindelijk gezegd is en het precies zo klinkt als ze dacht." (ch6 al. 72) / "Het was een blik die ik pas veel later heb leren lezen. Het was de blik van iemand die ziet dat ze iets gaat doen voor een ander, en die weet dat ze het hem nooit helemaal zal vergeven, en die het toch gaat doen." (ch8 al. 80)
problem: Op de twee emotionele pieken van ch6 en ch8 vertaalt de verteller Lies' gezicht in een volledige motivatie. Het is een formule die zes keer terugkomt ("een blik die ik niet kende / pas later heb leren lezen / iets wat ik niet ken … ik denk dat het angst is / het gezicht van iemand die …"). ch6 al. 72 verraadt bovendien de onthulling van ch12 ("al jaren vreesde"). Ook spreekt die passage de vertelpositie tegen: Steven schrijft in 2023 en wéét wat ze hoorde (ch12 al. 98), maar zegt "Ik denk nu" en "Ik weet niet wat ze gehoord had". Het gezicht wordt van de vrouw afgepakt en door de man ingevuld, terwijl Saïda-lezer juist wil dat ze geen decor is.
smallest fix: ch6: schrap al. 72 na "Het was een blik die ik niet kende." ch8: schrap al. 80 na "Ze keek lang naar me." In ch3 al. 29, ch10 al. 71 en ch12 al. 18 mag hooguit één van de drie zijn interpretatie houden. Kies ch3 ("iemand die een berekening maakt"), want die past bij haar beroep.
preserve: "'Ik ga naar huis,' zei ze." (ch6 al. 73) en "'Na de zomer,' zei ze." (ch8 al. 81)
evidence: pass 3, pass 8 (vertellerskennis), ai-tells #5 (0 op de piek); 03-characters: Saïda "haakt af als de vrouw decor blijft".
```

```text
T-06 | severity: medium | class: voice
where: chapter-01 al. 64; chapter-03 al. 64, 67, 93; chapter-04 al. 49, 54, 67; chapter-06 al. 32, 86, 88; chapter-07 al. 50, 53, 68; chapter-09 al. 33; chapter-11 al. 3; chapter-14 al. 73
quote: "Ik deed de deur van de kleine kamer open. Ik weet niet waarom." (ch1 al. 64) / "Ik weet niet waarom ik dat deed. Ik heb het niet aan Lies verteld." (ch3 al. 93) / "Ik scheurde de verpakking open. Ik weet niet waarom." (ch7 al. 53)
problem: "Ik weet niet …" komt 57 keer voor (±1,3 per 1.000 woorden), waarvan 16 keer "Ik weet niet (meer/nog steeds) waarom". Daarbij komen "Ik moet dat (eerlijk) zeggen" / "Ik zeg dat erbij" / "Ik wil dat dat er staat" (ch1 al. 11, 44; ch3 al. 18; ch7 al. 12; ch11 al. 5; ch12 al. 5, 36) en "Ik weet niet hoe ik het anders moet zeggen" (ch2 al. 31, ch11 al. 119). Het eerste gebruik op een stil moment werkt. Daarna wordt het een tic die steeds op dezelfde plaats staat: na een betekenisvol gebaar, als knipoog dat het betekenisvol was. Het gebaar verliest daardoor zijn eigenzinnigheid. Een verteller die "alles leest" en telt, weet opvallend vaak niet waarom.
smallest fix: Houd hooguit één instantie per hoofdstuk, in het hele boek ±5. Schrap de "waarom"-zinnen na gebaren (ch1 al. 64, ch3 al. 67 en 93, ch4 al. 54 en 67, ch6 al. 86 en 88, ch7 al. 53 en 68, ch14 al. 73) zonder vervanging. De handeling volstaat. Laat "Ik moet dat zeggen" alleen in ch1 al. 11 staan.
preserve: "Ik weet niet waarom ik het deed. Nee. Dat is niet waar. Ik weet het wel." (ch9 al. 33). Dit is de enige plaats waar de tic bewust wordt doorbroken, en ze werkt alleen als de tic elders zeldzamer is.
evidence: pass 2, pass 9 (hedge stacking-equivalent), 05-voice "hij legt nooit uit wat een beeld betekent".
```

```text
T-07 | severity: medium | class: prose
where: chapter-02, paragraph 76; chapter-06, paragraph 67; chapter-12, paragraph 36
quote: "Ik had toen nog niet door dat het leven zo in elkaar zit, dat het grootste deel ervan onverklaard is, en dat de mensen die een verklaring krijgen gewoon geluk hebben gehad met hun ongeluk." (ch2 al. 76) / "Dat er niemand was die slecht was, nergens, en dat er dus ook niemand was tegen wie ik kon zeggen wat ik wilde zeggen." (ch6 al. 67) / "Ik dacht aan niets. Dat is wat ik wil zeggen. Ik dacht niet aan rechtvaardigheid, aan het leven, aan wat het ons verschuldigd was." (ch12 al. 36)
problem: Het centrale onrecht ("er is niemand schuldig", "wat het leven ons verschuldigd is") wordt telkens als stelling benoemd. In ch12 gebeurt dat zelfs via ontkenning, op het moment dat het beeld (de tafel dragen) het alleen zou moeten doen. ch2 al. 75 had de gedachte al in een beeld gevangen (het mondeling examen). Al. 76 maakt er een levensles van.
smallest fix: Schrap ch2 al. 76 helemaal. Schrap in ch12 al. 36 de eerste drie zinnen, zodat de alinea begint bij "Ik dacht: mijn vingers glijden." Snoei ch6 al. 67 tot "Het was niet de cava. Het was Bert. … Hij stond daar." en laat de tussenliggende uitleg vallen.
preserve: "Je hebt de vragen van het mondeling examen allemaal juist beantwoord, en je bent niet geslaagd, en er is niemand bij wie je in beroep kunt gaan." (ch2 al. 75)
evidence: pass 3; brief "nooit voortdurend het onrecht benoemen; de lezer moet het ontdekken"; ai-tells #2, #5.
```

```text
T-08 | severity: medium | class: prose
where: chapter-07, paragraph 77; chapter-04, paragraphs 49 and 73; chapter-12, paragraphs 110 to 112; chapter-11, paragraphs 4, 15, 68
quote: "Maar ik huilde ook om iets wat geen akte had en geen kerk en geen stempel. Iets in een bananendoos. Iets in een ketel in Gent, bij min honderdzesennegentig graden. Iets wat nergens was, en dus overal." (ch7 al. 77)
problem: Op de piek van ch7 legt de verteller uit om wie hij huilt. Daarmee ontmantelt hij het contrast tussen de overlijdensakte en de doos, dat de scène al had opgebouwd, en eindigt hij op een sentimentele paradox ("nergens, en dus overal"). Hetzelfde mechanisme zit elders. ch4 al. 49: "Alles was in orde behalve een lampje van twee euro vijftig, en daarom was het rood." (een herhaling van "alles is in orde en het werkt niet", ch2). ch4 al. 73: "Weten is iets wat je met iemand samen doet." ch12 al. 112: "Ik denk dat ze van dezelfde man komen." ch11 al. 15: de uitleg van Lies' "iets wat niet over ons gaat". De aforismen in ch11 al. 4 en 68: "Je ziet ze komen. Je ziet ze nooit vertrekken." en "Het is wat mensen zeggen als er niets anders te zeggen valt."
smallest fix: ch7: schrap al. 77 helemaal (al. 76 eindigt sterk), of laat alleen "Ik weet niet om wie ik huilde." staan. ch4 al. 49: schrap de laatste drie zinnen. ch4 al. 73: schrap "Weten is iets wat je met iemand samen doet." ch12: schrap al. 112 tot "…en ik wist voor het eerst niet meer wie die man was" (die slotzin mag blijven). ch11: schrap de slotzin van al. 4, al. 15 vanaf "Een adoptie ging over ons." en de laatste zin van al. 68.
preserve: "Ze zei niet *het komt goed*. Ze zei niet *hij heeft niets gevoeld*. Ze stond daar gewoon." (ch7 al. 76) en "Ik had ook gedacht wat ik in de auto had gedacht. Ook dat had ik gewoon gedaan." (ch12 al. 111)
evidence: pass 3; ai-tells #5 (0 op de piek); brief "geen sentimentele metaforen".
```

```text
T-09 | severity: medium | class: prose
where: chapter-10, paragraphs 73 and 78
quote: "Ik begrijp niet wat hij bedoelt. Dan begrijp ik het. Hij bedoelt: voor ons twee. Hij bedoelt: als ge weggaat, ga ik mee. Hij bedoelt het niet als grap. Hij bedoelt het ook niet helemaal ernstig. Het is iets ertussenin, iets waar geen woord voor bestaat, en het is het liefste wat iemand ooit tegen mij gezegd heeft." / "Voorlopig is het eerlijkste woord dat ik ken, na meetonzekerheid."
problem: Stevens beste zin van het boek ("Kijk dan ook eens naar die met twee slaapkamers") wordt meteen door Lies ontleed en daarna gelabeld als "het liefste wat iemand ooit tegen mij gezegd heeft". Dat is net de emotionele labeling die bij haar stem ("woede zonder ironie, houdt niet van beeldspraak") niet hoort. Het hoofdstuk eindigt op een moraal die terugkoppelt naar ch5 ("Dat is het eerlijkste wat ik ken").
smallest fix: Schrap in al. 73 alles na "Dan begrijp ik het." Laat het hoofdstuk eindigen op "Ik ga niet weg. Dat heb ik toen besloten. Niet voor altijd. Voorlopig." en schrap de laatste zin.
preserve: "'Kijk dan ook eens naar die met twee slaapkamers,' zegt hij. 'Voor als ge er een vindt.'" en "Die nacht wis ik de favorieten. Alle elf. … Er is een knopje met een vuilbakje. Ik druk er elf keer op."
evidence: pass 3, pass 9 (ai-tells #4 en #9); 05-voice Lies-stemkaart.
```

```text
T-10 | severity: medium | class: structural
where: chapter-12, paragraphs 53 to 57; (zelfde patroon in ch3 al. 82–87, ch7 al. 67–73, ch10 al. 72–76, ch13 al. 88–92, ch14 al. 46–50)
quote: "'Ge hebt een tafel van vijfenzeventig kilo gekocht zonder de deur te meten.'" / "We stonden in de garage en lachten, en het was niet grappig, en we lachten tot Kristof hoestte"
problem: Elke breuk tussen personages heelt binnen dezelfde scène via één geestige of tedere zin, gevolgd door een lach of een hand: de imitatie van Kristof in de auto (ch3), "Polypropyleen" (ch7), de "twee slaapkamers" (ch10), de tafel (ch12), de radiator (ch13), de suikerboon (ch14). Elk moment is apart goed, maar samen vormen ze een sjabloon: de lezer leert dat geen enkele wonde de scène overleeft. Juist in ch12 ondermijnt het de uitval in de auto. Steven komt verzoend met Kristof uit de garage en barst tien minuten later uit, en die woede komt nu uit het niets in plaats van uit de garage.
smallest fix: Laat de verzoening in de garage van ch12 mislukken of half blijven. Steven maakt de grap niet, of Kristof lacht niet mee en Steven eet het stuk van de nul alleen. Zo draagt Steven de onverwerkte jaloezie mee de auto in. De andere vijf herstelmomenten blijven ongewijzigd.
preserve: "Hij legde zijn hand op mijn schouder. Het was een zware hand. Het was de hand van mijn vader. Ik had dat nooit gezien." (ch12 al. 60)
evidence: pass 5 (beats succeed too easily), pass 6.
```

```text
T-11 | severity: medium | class: structural
where: chapter-12, paragraphs 10, 63 and 70 (tegenover chapter-03, paragraphs 62, 68 and 78)
quote: "In de auto zei Lies niets tot we de straat uit waren." (letterlijk ch3 al. 68 en ch12 al. 63) / "'Ik ga het kort houden,' zei hij." (ch3 al. 62, ch12 al. 10, ch14 al. 3)
problem: ch3, ch6 en ch12 hebben hetzelfde skelet: feest, aankondiging van een kind, Steven drinkt, Lies op water of aan het stuur, autorit, thuis. ch12 kopieert bovendien zinnen en beelden uit ch3: "Ik ga het kort houden", de verkaveling met de bordjes "Hier woont …", "In de auto zei Lies niets…". Eén echo is bewust spiegelen, drie lagen echo op het climaxhoofdstuk zijn sjabloon. Het "kort houden"-motief verdient zijn uitbetaling in ch14 al. 3–4 ("Dat zegt ge altijd.") en wordt in ch12 voortijdig gebruikt.
smallest fix: Schrap in ch12 de letterlijke zin uit al. 63 en open de autorit anders. Schrap in ch12 al. 10 "Ik ga het kort houden" (Kristof kan gewoon beginnen). Schrap de bordjes in ch12 al. 70 of in ch14 al. 50 (houd ze op één plaats).
preserve: "'Ik ga het kort houden,' zei hij." / "'Dat zegt ge altijd.'" (ch14 al. 3–4)
evidence: pass 6; structure-and-emotion SE32 (template repetition).
```

```text
T-12 | severity: medium | class: structural
where: chapter-09, paragraph 99; chapter-11, paragraph 117; chapter-12, paragraph 102 (patroon over ch3, ch4, ch6, ch8, ch9, ch11, ch12)
quote: "Mevrouw Van Hecke uit Haaltert belde om vijf voor elf. Haar ketel gaf een rood lampje. Ik zei dat Kurt in de namiddag zou langskomen. Ze zei dat ze dan naar de tandarts moest. Ik zei dat ik zou kijken wat ik kon doen." (ch9 al. 99, bijna woordelijk ch3 al. 94) / "Roger stond aan zijn haag. Hij zwaaide ook. Ik weet niet naar wie." (ch11 al. 117)
problem: Alle veertien hoofdstukken eindigen op een stil, huiselijk slotbeeld of een anticlimax. Er is geen enkele cliffhanger of onthulling als slot, wat SE31 als vlag geeft (vier of meer opeenvolgende slotten van hetzelfde type). ch3 en ch9 gebruiken dezelfde grap van de klantentelefoon als slot. Roger duikt als zwijgend koor op aan het slot van ch4, ch6, ch8, ch9, ch11 en ch12, waardoor zijn eigen onthulling in ch13 ("Wij hebben ook lang gewacht") minder verrast.
smallest fix: Vervang het slot van ch9 door al. 97 (het planningsscherm met de "gekleurde balkjes van Ninove tot Lokeren"), zodat Van Hecke alleen in ch3 eindigt. Schrap Roger uit de slotalinea's van ch11 (de laatste drie zinnen van al. 117) en ch12 (al. 102). Laat ch12 eindigen met een onthulling of open vraag in plaats van met een sfeerbeeld: bijvoorbeeld stoppen bij al. 115 (het lege overtrek), zonder de samenvattende al. 117.
preserve: "Het was het overtrek met de raketten. Zonder dekbed erin. Gewoon het overtrek, een lege hoes van katoen, die niets warm hield." (ch12 al. 115)
evidence: pass 6; structure-and-emotion SE31, SE32.
```

```text
T-13 | severity: medium | class: voice
where: chapter-05, paragraphs 52 and 66; chapter-10, paragraphs 6, 30, 31
quote: "Ik ben niet van plan om te vertrekken. Dat moet ik er direct bij zeggen." (ch10 al. 6) / "Ik hoor het. Het huis vertelt alles." (ch10 al. 30) / "De lichten schuiven over het plafond, van links naar rechts." (ch5 al. 66; vgl. ch1 al. 62 "de koplampen schoven over het plafond, van links naar rechts")
problem: Lies' hoofdstukken moeten volgens 05-voice anders klinken: korte declaratieve zinnen, metingen, woede zonder ironie, geen beeldspraak. Ze nemen echter Stevens tics over ("Dat moet ik er direct bij zeggen", "Ik weet niet …", "Ik denk" ±8 keer in ch5 en ±10 keer in ch10), zijn beeld ("Het huis vertelt alles", dat Steven in ch11 al. 55 letterlijk herhaalt) en zijn slotbeeld uit ch1. Ze gebruikt ook vergelijkingen die zichzelf uitleggen ("zoals de gele emmer op de wasmachine, die iedereen ziet en die niemand noemt", ch5 al. 52; "zoals twee mensen die elkaar een hand geven na een begrafenis", ch10 al. 31). De "bedek de naam"-test haalt ze alleen dankzij de tegenwoordige tijd.
smallest fix: Schrap "Dat moet ik er direct bij zeggen." Vervang in ch10 al. 30 "Het huis vertelt alles." door een meting (bv. op welke stand het scharnier kraakt). Vervang het slotbeeld van ch5 al. 66 door iets uit Lies' eigen register (ze telt tot tien, wat al in de tekst staat). Schrap in ch5 al. 52 ", die iedereen ziet en die niemand noemt". Halveer "Ik denk" in beide hoofdstukken.
preserve: "Mijn lichaam heeft geen marge. Mijn lichaam zegt nee." (ch5 al. 6) en "Ik weet hoeveel kiemen er in vijfentwintig gram kip zitten, plus of min dertig." (ch5 al. 55)
evidence: pass 2 ("cover the name"), 05-voice "Lies' stem", 03-characters "houdt niet van beeldspraak".
```

```text
T-14 | severity: medium | class: character
where: chapter-13, paragraphs 25 to 27 and 35
quote: "'Ik zeg maar wat, Steven,' zei Rita. 'Maar ze heeft het toen alleen gedaan. En ze heeft daarna alles alleen gedaan. Die spuiten, dat heeft ze me verteld, dat ze die niet zelf kon zetten. Dat gij dat deed. Ze was daar zo kwaad om.'"
problem: Na ch12 al. 100 ("Ik ben een van die mensen, Steven.") komt Lies' woede, de kern van haar personage volgens 03 ("minder humor dan Steven, meer woede"), alleen nog via haar moeder (ch13 al. 25–27, 35) of in samenvatting (ch13 al. 94). Op de pagina is ze in Deel III vooral zorgdrager: ze legt het overtrek, ontlucht de radiator, zet koffie, lacht. Haar eigen verlangen krijgt wel een plek (de microscoop, ch14 al. 63), maar haar boosheid over "weghalen" en over vijf jaar lang de rol van "de vrouw die gestopt is" verdwijnt in Stevens perspectief.
smallest fix: Geef Lies in de scène uit T-04 één beurt van onverdunde woede of weigering. Ze weigert bijvoorbeeld zijn "het spijt me", of ze noemt het koertje, de Duvels of het potje bij naam. Ze krijgt daar geen slotformule ("Al de rest is onverklaard"). Schrap de interpretatieve zin in ch13 al. 35 ("Ik weet niet of dat onzin is. Ik ben geen dokter.") niet: die is goed. Het tekort zit in Lies, niet in Rita.
preserve: "'Ja,' zei ze. 'Ik wist niet wat ik anders moest doen. Ik ben een moeder. Een moeder haalt friet.'" (ch13 al. 23)
evidence: pass 4, pass 10; brief "de vrouw moet een eigen binnenleven, woede, verlangens en fouten hebben"; 03-characters Lies.
```

```text
T-15 | severity: medium | class: continuity
where: chapter-05, paragraph 30; chapter-13, paragraph 20
quote: "Ik heb het mijn moeder gezegd, op een zondagavond in de keuken in Sint-Niklaas, en ze heeft eerst gehuild en daarna een afspraak gemaakt" (ch5 al. 30) / "Ze had alles zelf geregeld, de afspraak, de papieren. Ze had me alleen nodig om te rijden." (ch13 al. 20)
problem: Lies zegt dat haar moeder de afspraak maakte. Rita zegt dat Lies alles zelf regelde. Dit is het centrale geheim van het boek, en de lezer zal het verschil opmerken. Als het opzettelijk is (elk schrijft de ander de regie toe), dan is het nergens leesbaar gemaakt. Nu leest het als een fout.
smallest fix: Stem één van beide af, of laat Steven in ch13 één bijzin opmerken dat Lies het anders had verteld (bv. na "Ze had me alleen nodig om te rijden.": "Lies had het anders verteld. Ik zei niets.").
preserve: "Achteraf heeft ze mij naar huis gebracht en friet gehaald" (ch5 al. 30)
evidence: pass 8; 09-continuity-ledger "Wie weet wat — Lies' abortus".
```

```text
T-16 | severity: low | class: prose
where: chapter-09, paragraphs 27 to 28 (tegenover chapter-04, paragraphs 72 to 73)
quote: "'Ik weet het,' zei ik." / "Ik wist niets. Ik had twee streepjes gezien. Het was de eerste keer in zes jaar."
problem: Het apparaat "'Ik weet het,' zei ik. Ik wist het niet." uit het stemmodel wordt in ch4 volledig uitgespeeld en in ch9 herhaald. Het komt ook voor in ch1 al. 49 en ch8 al. 70–74 ("Ik weet het." ×3 van Lies). In ch9 doet de herhaling het effect van ch4 teniet.
smallest fix: Schrap in ch9 al. 28 de eerste zin "Ik wist niets."
preserve: "Ik had twee streepjes gezien. Het was de eerste keer in zes jaar."
evidence: pass 6, 05-voice ritmecontract.
```

```text
T-17 | severity: low | class: continuity
where: chapter-11, paragraph 65; chapter-14, paragraph 83
quote: "Hij kwam acht keer, tussen oktober en juni. Eén weekend per maand, en twee keer extra, in de krokusvakantie en met Pasen"
problem: Een exacte telling. Maandelijks van oktober tot en met maart is zes keer, plus twee extra en het afscheidsweekend in juni maakt negen. Ook als april en mei wegvallen na het telefoontje van Ilse komt het niet uit op acht. ch14 al. 83 herhaalt "acht keer".
smallest fix: Wijzig naar "negen keer" (op beide plaatsen), of schrap één van de extra weekends.
preserve: "'Hij vraagt of gij nog altijd de choco zonder hazelnoten eet.'" (ch11 al. 101)
evidence: pass 8 (exact count); 09 Dylan "oktober 2021 tot juni 2022, één weekend per maand (+ enkele extra)".
```

```text
T-18 | severity: low | class: continuity
where: chapter-13, paragraph 65
quote: "'Op Patrick,' zei Roger. 'Acht jaar. Dat was in de jaren zestig."
problem: Volgens 03-characters is Roger 70 in 2016 (°±1946). Jeanine is 78 in oktober 2022 (ch13 al. 39, °±1944). Acht jaar wachten "in de jaren zestig" betekent dat ze ermee begonnen toen Roger ±15 was. Dat is een begrensde onbekende (het kan losjes bedoeld zijn), maar een oplettende lezer rekent mee.
smallest fix: "Dat was eind de jaren zestig, begin zeventig." of "Dat was in de jaren zeventig."
preserve: "'Ze had altijd gelijk,' zei Roger. 'Dat was het ambetante aan haar.'" (ch13 al. 75)
evidence: pass 8; 03-characters Roger (70).
```

```text
T-19 | severity: low | class: continuity
where: chapter-02, paragraph 88; chapter-08, paragraph 65; chapter-03, paragraphs 92 to 93
quote: "Begin juni moet ze bevallen." (ch2 al. 88) / "Ik heb in vijf jaar niet gezongen." (ch8 al. 65) / "Ik deed het doosje weer dicht met vijf suikerbonen erin. De andere twee doosjes deed ik niet open." (ch3 al. 92)
problem: (a) Het telefoontje met de moeder valt na de consultatie "in juni" (ch2 al. 39), terwijl Lena op 14 juni werd geboren, drie dagen vóór de uitgerekende datum (ch3 al. 4). De uitgerekende datum was dus ±17 juni en niet "begin juni". (b) Lies zegt dat ze "in vijf jaar" niet zong. In ch5 al. 25 staat echter "Ik zing nooit mee." en in ch8 al. 34 "Ik had haar nog nooit horen zingen.", dus ze zong nooit. (c) In ch3 al. 93 is "Ik nam ze mee" dubbelzinnig. In ch6 al. 86 liggen er twee doosjes in het handschoenkastje. Het geopende doosje met vijf suikerbonen verdwijnt zonder spoor.
smallest fix: (a) "Half juni moet ze bevallen." (b) "Ik heb nog nooit gezongen." of "Ik heb in vijf jaar niet zo hard gelachen." (c) Eén zin over het derde doosje in ch3 al. 92, of "Ik nam de twee andere mee".
preserve: "Ik zette de borden op de stapel zonder geluid te maken, alsof er ergens in huis iemand sliep die ik niet wakker wilde maken." (ch2 al. 94)
evidence: pass 8.
```

```text
T-20 | severity: low | class: continuity
where: artifacts/09-continuity-ledger.md (Medische tijdlijn; Wie weet wat), tegenover chapter-09 al. 2 en 74, chapter-10 al. 65, chapter-12 al. 104–108
quote: "Ze ontdooiden er twee, op een dinsdag in september. Eén overleefde het niet." (ch9 al. 2) / "Er zaten nog twee embryo's in de diepvries." (ch9 al. 74) / "'Ge kijkt 's nachts naar appartementen.'" (ch10 al. 65)
problem: De ledger zegt: "Sept 2020: ontdooiing; twee embryo's overleven …" en "Na 2020: geen embryo's meer over". Hij zegt ook: "Steven weet niet van Lies' overwegingen om weg te gaan (ch10) — ze zegt het in ch13 deels." Het manuscript heeft in beide gevallen een betere en intern consistente versie: 4 = 2 + 2, en de ontdooiing in januari 2021 mislukt. Steven ziet het licht van de telefoon in ch10. De outline (rij 12) plaatst Steven "op de grond in kamer één", het manuscript op het plooibed in de kleine kamer. Er is geen fout in het manuscript, maar de ledger is als controlemiddel onbetrouwbaar geworden.
smallest fix: Werk 09 (en 07 rij 12) bij naar het manuscript. Pas het manuscript niet aan.
preserve: "Er was niets meer in de diepvries. Er was niets meer om te beslissen." (ch9 al. 98)
evidence: pass 8; specialists/continuity.md (ledgerregels).
```

---

### Samenvatting tickets
- High: 5 (T-01, T-02, T-03, T-04, T-05). Alle vijf vallen onder pass 3 (overuitleg) en pass 10 (slot en payoff).
- Medium: 10 (T-06 t/m T-15)
- Low: 5 (T-16 t/m T-20)

Er is geen exact contractticket open. De structuur (beatposities, middelpunt, finale) draagt de herstellingen. Op T-04 na (één nieuwe scène) zijn bijna alle ingrepen schrappingen. Eén bewaking: het manuscript zit 1.457 woorden boven de vloer van 42.000. De som van de schrappingen plus de scène uit T-04 moet netto boven 42.000 blijven. Schatting: ±800 eruit, ±600 erbij.

audit_status: revise
