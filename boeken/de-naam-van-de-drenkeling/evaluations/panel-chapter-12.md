# Leespanel: hoofdstuk 12 (middenpunt)

Vier gesimuleerde lezers hebben dit hoofdstuk blind gelezen. Elke lezer was een aparte subagent van dezelfde modelfamilie. Het zijn geen menselijke lezers.

- **Gelezen versie:** `manuscript/chapters/chapter-12.md`, sha256 `ef45eaa0f6133f8242531cbbd9462eb1417eb057cc73b57acdc967fcb806d038`.
- **Pakket:** `work/panel-ch12/packet.md`. Het bevat ongeveer de laatste 300 woorden van hoofdstuk 11 als aanloop en de drie vragen van de auteur. De lezers schreven eerst hun leeservaring in eigen woorden op.
- **Ruwe verdicten:** `work/panel-ch12/{ann,pieter,sofie,lotte}.json`. Alle vier zijn geldige JSON.
- **Validatie:** niet uitgevoerd met `validate_blind_reader.py`. Het pakket gebruikte het oude citaatformaat met extra velden.

## Uitkomst

| Signaal | Ann | Pieter | Sofie | Lotte | Uitkomst |
|---|---|---|---|---|---|
| Bladzijde omslaan | ja | ja | ja | ja | **geslaagd (4/4)** |
| Waar de aandacht wegzakte | tafelschikking ('Stephens zat rechts van hem') | 'Ik heb in mijn leven veel stiltes gehoord.' | 'aan tafels … een koning zweeg' | 'Vijf mannen pasten er alleen in' | **twee hoge tickets**: telkens twee lezers in dezelfde alinea |
| Gevoel | beklemming, schaamte namens de verteller | tegen zijn zin geraakt, met ergernis | beklemming | beklemming, een beetje verdriet | |

## Hoge tickets

| ID | Alinea | Lezers | Opmerking |
|---|---|---|---|
| P12-01 | De kajuit en de tafelschikking ('De kajuit … whist … Stephens zat rechts …') | Ann en Lotte (stoppunt); Pieter en Ann (*slow_start*) | Het komt meteen na de spanning van de naam. Inkorten tot wat de lezer nodig heeft: wie naast wie zit. |
| P12-02 | 'Ik heb in mijn leven veel stiltes gehoord … koning … zoon gesneuveld' | Pieter en Sofie (stoppunt); Ann (zwakste passage) | Hetzelfde patroon als P1-01 in hoofdstuk 1: het cv van de verteller onderbreekt de jongen. |

## Defecten

Een signaal telt als defect wanneer minstens twee lezers het geven.

| ID | Passage | Lezers | Soort |
|---|---|---|---|
| P12-03 | 'Het was een gebaar dat hij zo vaak had gemaakt dat het geen gebaar meer was. Het was een plaats in de lucht waar dingen terechtkwamen.' | alle vier | beeld dat meteen wordt uitgelegd |
| P12-04 | 'Dat is een eigenschap die je aan hoven ver brengt.' | alle vier | moraal aan het slot, bonmot |
| P12-05 | 'Ik bedoel niet dat hij stil werd zoals een jongen stil wordt …' | Sofie, Lotte, Pieter | contrast door ontkenning |
| P12-06 | 'Dudley bad niet lang. Hij bad met nadruk' | Sofie, Ann | contrast door ontkenning |
| P12-07 | 'zoals een verkeerde noot in een strijkkwartet …' | Ann, Pieter | cliché; te veel 'zoals'-vergelijkingen |

**Patroon over twee panels:** het cv van de verteller (P1-01, P12-02) en het bonmot aan het slot van een alinea (P1-01, P12-04) komen telkens terug. Dat is het belangrijkste revisiethema.

## Wat bewaard moet blijven

- 'Hij had niet gezegd een uur waarvóór.' (alle vier)
- 'Ik zag Richards duim over de korst gaan. Eén keer, heen en terug.' (sterkste passage voor Sofie, Lotte en Pieter)
- 'Dudley keek naar zijn eigen hand, die leeg bleef, en wachtte zonder te weten dat hij wachtte.' (sterkste passage voor Ann)
- 'Hij at het op.' (Pieter: 'De verteller zegt precies wat er gaat gebeuren en heeft ongelijk.')
- 'Hij liet niet los.' (Lotte)
- 'Het water van de thee was het tweede water van het vlees.' (Sofie)
- De kanttekeningen die de verteller corrigeren (Ann, Pieter). Pieter: 'Dit is de regel die het boek zichzelf oplegt.'

## Antwoorden op de vragen van de auteur

**1. Wat heeft Richard gelezen?** Alle vier kwamen tot hetzelfde uit alleen dit fragment: zijn eigen naam in een procesverslag, en dat de mannen aan tafel (Dudley en Stephens, zeggen Ann en Pieter) hem zullen doden en opeten. Pieter en Sofie denken dat hij ook de datum las.

| Aanwijzing | Genoemd door |
|---|---|
| 'En in de sloep?' | alle vier |
| 'Hij keek naar hun handen.' | Ann, Pieter, Lotte, Sofie |
| 'Richard zei het te laat.' (het amen) | Sofie, Lotte |
| het bord met de barst | Ann |
| 'Hoe laat is het?' | Pieter |

**2. Het brood.** Alle vier lazen Dudleys gebaar als oprechte zorg en daardoor als wrange ironie.
- Lotte: 'Het voelde als een omgekeerd avondmaal.'
- Ann: 'Voor Dudley is het vriendelijkheid, voor ons een voorafbeelding.'

Alle vier verwachtten, net als de graaf, dat Richard het brood zou weigeren of iets zou zeggen. Alle vier vonden het sterker dat hij het gewoon opat.
- Ann: 'hij aanvaardt het leven dat hem nog rest'.
- Pieter: 'een keuze: hij neemt wat hem toekomt'.

**3. 'Vertel het nog eens.'** De lezingen lopen minder uiteen dan verwacht. De kern is bij alle vier dezelfde:

| Lezer | Kern van de lezing | Eigen accent |
|---|---|---|
| Ann | hij wil een toekomst horen en test of de verteller doet alsof hij Sydney haalt | 'Misschien is het ook een geschenk: hij laat de man nog één keer leraar zijn.' |
| Pieter | hij laat de verteller hem behandelen alsof hij een toekomst heeft | test of de verteller gelooft dat hij Sydney haalt |
| Sofie | hij wil een toekomst horen | 'voelt als een belofte die hij niet kan houden' |
| Lotte | hij doet alsof er een toekomst is | 'Misschien wil hij gewoon nog iets normaals horen. Of hij rekent uit of hij het nog kan veranderen.' |

De lezing 'gerustgesteld worden' komt bij niemand letterlijk voor. Lottes 'iets normaals horen' ligt er het dichtst bij. Ann voegt een derde richting toe: Richard geeft iets aan de graaf, in plaats van dat hij iets van hem vraagt.

Alle vier baseren hun lezing op dezelfde twee plaatsen in hoofdstuk 12 zelf. Ze kenden hoofdstuk 8 niet:
- de prijs die de eerste keer geweigerd werd en nu wel genoemd wordt;
- 'zoals ik het aan een leerling zou vertellen die er de rest van zijn leven iets mee moest doen.'

Hoofdstuk 12 draagt de terugverwijzing dus zelf.

## Notities van één lezer of door het fragment

- **'Ik heb dat horloge sinds 1761'** (Sofie, Lotte, Ann). Ze waren verward door het fragment, omdat ze de tijdreis niet kennen. Dat is geen defect. Ann: 'het maakt me eerder nieuwsgierig.'
- **De Dolphin** (Lotte). Die naam staat in de aanloop en wordt in hoofdstuk 5 uitgelegd.
- **Vlaamse spreektaal** (Ann, Pieter, Sofie). Dit is de keuze van de auteur. Sofie: 'Ik raakte eraan gewend.'
- **'begreep ik dat het juist was op een manier die Stephens niet bedoelde'** (Pieter). Vaag. Laag.
- **Rundvlees 'in twee keer zoet water'** (Sofie, *continuity_doubt*). Ze zegt niet wat er wringt. Laag.
