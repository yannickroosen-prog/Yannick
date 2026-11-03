// Beslissingsboom van de Doorverwijsgids Similes.
//
// Elke stap ("knoop") heeft een id. Een stap toont een vraag met keuzes
// (opties), of een resultaat met fiches, of allebei. De fiche-id's verwijzen
// naar data/fiches.js. Fiches die nog niet zijn nagekeken, zet je onder
// "nietNagekeken": die krijgen in de viewer automatisch een waarschuwing en
// tonen geen telefoonnummers.
//
// Velden per stap:
//   vraag         De vraag of titel van de stap.
//   uitleg        Korte toelichting voor de vrijwilliger (optioneel).
//   vraagTip      Wat je de beller kan vragen om te kiezen (optioneel).
//   opties        Lijst met { label, uitleg, naar } (naar = id van de volgende stap).
//   fiches        Fiche-id's die je mag gebruiken om door te verwijzen.
//   nietNagekeken Fiche-id's die nog niet nagekeken zijn (alleen naam en website).
//   zeg           Voorbeeldzin die je tegen de beller kan zeggen (optioneel).
//   alert         { soort: "gevaar" | "letop", tekst } (optioneel).
//   nood          Noodnummers om groot te tonen: [{ nummer, tekst }] (optioneel).

window.DG_BOOM = {
  start: "start",
  stappen: {
    start: {
      vraag: "Is er nu gevaar?",
      uitleg: "Begin elk gesprek hier. Acuut gevaar gaat altijd voor.",
      vraagTip: "Is er op dit moment iemand in gevaar? Is er sprake van zelfdoding, geweld of een medische noodsituatie?",
      opties: [
        { label: "Ja, iemand is nu in gevaar", uitleg: "Medische nood, geweld, acute crisis.", naar: "gevaar" },
        { label: "Iemand denkt aan zelfdoding, of de beller maakt zich daar zorgen over", uitleg: "Ook zonder acuut gevaar.", naar: "zelfdoding" },
        { label: "Nee, geen acuut gevaar", uitleg: "Ga verder naar de vraag.", naar: "wie" }
      ]
    },

    gevaar: {
      vraag: "Acuut gevaar: bel een noodnummer",
      alert: { soort: "gevaar", tekst: "Verwijs meteen door. Blijf aan de lijn tot de beller weet wie hij of zij belt." },
      nood: [
        { nummer: "112", tekst: "Dringende medische hulp en brandweer" },
        { nummer: "101", tekst: "Politie bij een noodsituatie" },
        { nummer: "1733", tekst: "Huisarts van wacht" },
        { nummer: "1813", tekst: "Zelfmoordlijn, dag en nacht" }
      ],
      zeg: "Dit klinkt als een situatie waarin je nu hulp nodig hebt. Bel 112. Als het over zelfdoding gaat, kan je ook de Zelfmoordlijn bellen op 1813, dag en nacht.",
      opties: [
        { label: "Het gaat over zelfdoding", naar: "zelfdoding" },
        { label: "Het gaat over geweld of misbruik", naar: "geweld" },
        { label: "Het gevaar is geweken, verder met de vraag", naar: "wie" }
      ]
    },

    zelfdoding: {
      vraag: "Zelfdoding: Zelfmoordlijn 1813",
      uitleg: "Voor wie zelf aan zelfdoding denkt, voor wie zich zorgen maakt om iemand, en voor nabestaanden. Bij acuut gevaar eerst 112.",
      alert: { soort: "letop", tekst: "Stuur iemand met suïcidale gedachten niet naar het aanbod rond levenseinde of euthanasie. Geef geen diagnose en geen advies over wat iemand moet doen." },
      fiches: ["DG-014"],
      zeg: "Je kan hiervoor de Zelfmoordlijn bellen op 1813. Dat is gratis, anoniem en dag en nacht bereikbaar. Ook als je je zorgen maakt om iemand anders, mag je bellen.",
      opties: [
        { label: "De beller rouwt na een zelfdoding", naar: "rouw" },
        { label: "De beller wil ook zelf steun als naaste", naar: "naaste" }
      ]
    },

    wie: {
      vraag: "Voor wie zoekt de beller iets?",
      vraagTip: "Gaat het over jezelf, of over iemand in je omgeving?",
      opties: [
        { label: "Voor zichzelf, als naaste", uitleg: "Partner, ouder, kind, broer, zus, vriend van iemand met psychische problemen.", naar: "naaste" },
        { label: "Voor iemand anders", uitleg: "De partner, het kind, de ouder of de vriend heeft hulp nodig.", naar: "ander" },
        { label: "Een praktische of juridische vraag", uitleg: "Bewindvoering, geld, wonen, klacht, justitie.", naar: "praktisch" },
        { label: "Informatie over een thema", uitleg: "Psychose, depressie, verslaving, autisme en meer.", naar: "info" },
        { label: "Vraag van over de taalgrens", uitleg: "Brussel of Wallonië, Franstalig.", naar: "taalgrens" }
      ]
    },

    naaste: {
      vraag: "Wat heeft de naaste zelf nodig?",
      uitleg: "Naasten hebben eigen noden. Dit gaat over steun voor de beller zelf.",
      vraagTip: "Wat zou jou nu het meest helpen: even praten, mensen ontmoeten die hetzelfde meemaken, of iets anders?",
      opties: [
        { label: "Even praten, het verhaal kwijt", naar: "naaste-praten" },
        { label: "Mensen ontmoeten in dezelfde situatie", naar: "naaste-lotgenoten" },
        { label: "Zorgt als mantelzorger en zoekt steun", naar: "mantelzorg" },
        { label: "Is kind of jongere van een ouder met psychische problemen", naar: "kopp" },
        { label: "Rouwt na een zelfdoding", naar: "rouw" },
        { label: "Zoekt eigenlijk hulp voor de persoon met psychische problemen", naar: "ander" }
      ]
    },

    "naaste-praten": {
      vraag: "Praten als naaste",
      uitleg: "De Similes Luisterlijn is er speciaal voor naasten. Buiten de uren of 's nachts: Tele-Onthaal 106.",
      fiches: ["DG-004", "DG-010", "DG-003"],
      zeg: "Bij de Similes Luisterlijn zitten vrijwilligers die zelf weten wat het is om naaste te zijn. Je mag gewoon bellen, zonder afspraak. Wil je 's nachts of in het weekend met iemand praten, dan kan je dag en nacht terecht bij Tele-Onthaal op 106.",
      opties: [
        { label: "Ook mensen ontmoeten in dezelfde situatie", naar: "naaste-lotgenoten" }
      ]
    },

    "naaste-lotgenoten": {
      vraag: "Lotgenoten ontmoeten",
      uitleg: "Het groepsaanbod van Similes: praatgroepen, infomomenten, vorming en ontspanning, per provincie en online. Warme Babbel staat on hold tot begin 2027.",
      fiches: ["DG-002", "DG-003", "DG-001"],
      nietNagekeken: ["DG-005"],
      zeg: "Similes brengt naasten samen in gespreksgroepen en op infomomenten, in elke provincie en ook online. Op activiteiten.similes.be kan je filteren op wie je bent, bijvoorbeeld partner, ouder of broer of zus.",
      opties: [
        { label: "Liever eerst een-op-een praten", naar: "naaste-praten" }
      ]
    },

    mantelzorg: {
      vraag: "Mantelzorg",
      uitleg: "De fiches over mantelzorg zijn nog niet nagekeken. Verwijs nu naar de Similes Luisterlijn en het groepsaanbod, en noem de organisaties hieronder alleen als nog na te kijken.",
      fiches: ["DG-004", "DG-002"],
      nietNagekeken: ["DG-105", "DG-106", "DG-107", "DG-108", "DG-109", "DG-110"],
      zeg: "Er bestaan organisaties voor mantelzorgers, maar die gegevens zijn in onze gids nog niet nagekeken. Kijk best even op hun website. Bij Similes kan je intussen altijd terecht om te praten of om andere naasten te ontmoeten."
    },

    kopp: {
      vraag: "Kind of jongere van een ouder met psychische problemen",
      uitleg: "Voor kinderen en jongeren zelf: Awel, JAC en TEJO. Voor kinderen vanaf 18 jaar: het groepsaanbod van Similes. De KOPP-fiches zijn nog niet nagekeken.",
      vraagTip: "Hoe oud is het kind of de jongere? Wil het kind zelf met iemand praten?",
      fiches: ["DG-012", "DG-020", "DG-021", "DG-002"],
      nietNagekeken: ["DG-111", "DG-112", "DG-113", "DG-110"],
      zeg: "Kinderen en jongeren kunnen gratis en anoniem bellen of chatten met Awel op 102. Jongeren van 12 tot 25 kunnen bij het JAC terecht, jongeren van 10 tot 20 bij TEJO voor gesprekken."
    },

    rouw: {
      vraag: "Rouw na zelfdoding",
      uitleg: "Dit is rouwondersteuning, geen crisishulp. Nabestaanden kunnen ook bij de Zelfmoordlijn 1813 terecht.",
      alert: { soort: "letop", tekst: "Houd rouw na zelfdoding gescheiden van levenseinde en euthanasie. Bij suïcidale gedachten: Zelfmoordlijn 1813." },
      fiches: ["DG-100", "DG-014", "DG-002"],
      zeg: "Werkgroep Verder na Zelfdoding is er speciaal voor nabestaanden: praatgroepen, een ontmoetingsdag en een online chat. Bij Similes kan je ook andere naasten ontmoeten."
    },

    ander: {
      vraag: "Wat speelt er bij de partner, het kind, de ouder of de vriend?",
      vraagTip: "Kan je vertellen wat er nu het meest zorgen geeft?",
      opties: [
        { label: "Zoekt psychische hulp of behandeling", naar: "hulp-leeftijd" },
        { label: "Wacht al lang op hulp", naar: "wachttijd" },
        { label: "Wil gewoon met iemand praten", naar: "praten" },
        { label: "Alcohol, drugs, medicatie, gokken of gamen", naar: "verslaving" },
        { label: "Geweld, misbruik of mishandeling", naar: "geweld" },
        { label: "Euthanasiewens door psychisch lijden", naar: "euthanasie-check" },
        { label: "Vragen over levenseinde of palliatieve zorg", naar: "levenseinde" },
        { label: "Vragen over gender of seksuele voorkeur", naar: "lumi" },
        { label: "Een specifiek thema: psychose, depressie, eetstoornis en meer", naar: "info" }
      ]
    },

    "hulp-leeftijd": {
      vraag: "Hoe oud is de persoon die hulp zoekt?",
      vraagTip: "Hoe oud is je kind, partner, ouder of vriend?",
      opties: [
        { label: "Kind of jongere, tot ongeveer 25 jaar", naar: "hulp-jong" },
        { label: "Volwassene", naar: "hulp-volwassene" }
      ]
    },

    "hulp-jong": {
      vraag: "Hulp voor een kind of jongere",
      uitleg: "Awel om te praten, JAC voor jongeren van 12 tot 25, TEJO voor gesprekken van 10 tot 20 jaar. Een CGG behandelt ook kinderen en jongeren; naasten kunnen aanmelden.",
      fiches: ["DG-012", "DG-020", "DG-021", "DG-024"],
      zeg: "Jongeren kunnen gratis en anoniem terecht bij Awel op 102, bij het JAC of bij TEJO. Voor behandeling kan je als ouder zelf aanmelden bij een Centrum Geestelijke Gezondheidszorg in de buurt.",
      opties: [
        { label: "Het kind heeft zelf een ouder met psychische problemen", naar: "kopp" }
      ]
    },

    "hulp-volwassene": {
      vraag: "Hulp voor een volwassene",
      uitleg: "CAW voor alle welzijnsvragen, CGG voor behandeling van ernstige psychische problemen. Naasten kunnen iemand aanmelden bij een CGG. Geen van beide is een route bij acuut gevaar.",
      vraagTip: "Is er al een huisarts of hulpverlener betrokken? Zoek je een gesprek, een behandeling of een opname?",
      fiches: ["DG-019", "DG-024", "DG-026", "DG-028"],
      zeg: "Het CAW is gratis en helpt bij alle welzijnsvragen, je belt 0800 13 500. Voor een behandeling kan je terecht bij een Centrum Geestelijke Gezondheidszorg. Als familielid mag je zelf iemand aanmelden.",
      opties: [
        { label: "Er is een lange wachttijd", naar: "wachttijd" },
        { label: "Regionaal netwerk geestelijke gezondheid zoeken", naar: "netwerken" }
      ]
    },

    wachttijd: {
      vraag: "Lange wachttijd",
      uitleg: "Het Wachthuis in Haacht overbrugt wachttijden, maar de werking is niet bevestigd: eerst nakijken. Intussen kan de naaste zelf steun zoeken bij Similes.",
      fiches: ["DG-124", "DG-024", "DG-004"],
      zeg: "In Haacht is er Het Wachthuis, een plek voor wie wacht op hulp. Kijk best eerst op hun website of ze nog actief zijn. Intussen kan je zelf als naaste bij Similes terecht om te praten."
    },

    praten: {
      vraag: "Gewoon met iemand praten",
      uitleg: "Tele-Onthaal is er dag en nacht voor iedereen. LuisterGenoten zijn mensen die zelf een psychische kwetsbaarheid kennen.",
      fiches: ["DG-010", "DG-016"],
      zeg: "Bij Tele-Onthaal kan je dag en nacht gratis en anoniem bellen op 106, ook in het weekend. Bij LuisterGenoten luisteren mensen die zelf ervaring hebben met een psychische kwetsbaarheid."
    },

    verslaving: {
      vraag: "Alcohol, drugs, medicatie, gokken of gamen",
      uitleg: "De Druglijn is er ook voor naasten, met een eigen luik 'Bezorgd om iemand'. Zelfhulpgroepen voor naasten zijn nog niet nagekeken.",
      fiches: ["DG-013", "DG-024"],
      nietNagekeken: ["DG-061", "DG-062", "DG-065", "DG-063", "DG-064", "DG-059", "DG-060", "DG-056", "DG-057", "DG-058"],
      zeg: "De Druglijn is er ook voor familie en vrienden. Je kan bellen op 078 15 10 20, op weekdagen van 10 tot 20 uur, of chatten. Het gesprek is anoniem."
    },

    geweld: {
      vraag: "Geweld, misbruik of mishandeling",
      uitleg: "1712 is niet dag en nacht open: buiten de uren verwijst 1712 naar 106 en 1813. Minderjarigen kunnen ook chatten met Nupraatikerover. Bij gevaar: politie 101, medische hulp 112.",
      alert: { soort: "gevaar", tekst: "Is er nu gevaar? Politie 101. Dringende medische hulp 112." },
      fiches: ["DG-011", "DG-022", "DG-019"],
      nietNagekeken: ["DG-032"],
      zeg: "Voor vragen over geweld, misbruik of mishandeling kan je gratis bellen naar 1712, op werkdagen van 9 tot 18 uur. Je hoeft niet te zeggen wie je bent. Je kan ook bellen over iemand anders."
    },

    "euthanasie-check": {
      vraag: "Is er nu een crisis of zijn er suïcidale gedachten?",
      uitleg: "Houd steun bij suïcidale gedachten gescheiden van vragen over euthanasie. Leg geen voorwaarden voor euthanasie uit.",
      vraagTip: "Is er op dit moment een crisis? Denkt de persoon eraan om zichzelf iets aan te doen?",
      opties: [
        { label: "Ja, er is een crisis of er zijn suïcidale gedachten", naar: "zelfdoding" },
        { label: "Nee, het gaat om een euthanasiewens door aanhoudend psychisch lijden", naar: "euthanasie-regio" }
      ]
    },

    "euthanasie-regio": {
      vraag: "Waar woont de persoon?",
      uitleg: "Reakiro heeft een aanmeldbeperking per regio. De persoon heeft minstens een eigen huisarts nodig. Naasten zijn welkom.",
      opties: [
        { label: "Vlaams-Brabant", uitleg: "Of al in behandeling bij UPC KU Leuven, De Hulster, Walden vzw of een organisatie van Evara.", naar: "reakiro-leuven" },
        { label: "West-Vlaanderen", uitleg: "Of in behandeling in een West-Vlaams psychiatrisch ziekenhuis.", naar: "reakiro-wvl" },
        { label: "Elders", naar: "euthanasie-elders" }
      ]
    },

    "reakiro-leuven": {
      vraag: "Reakiro Leuven",
      alert: { soort: "letop", tekst: "Geen crisislijn. Bij acuut gevaar 112, bij suïcidale gedachten 1813. Leg geen voorwaarden voor euthanasie uit." },
      fiches: ["DG-103", "DG-101"],
      zeg: "Reakiro in Leuven begeleidt mensen met een euthanasiewens door ondraaglijk psychisch lijden, en ook hun naasten zijn er welkom. Aanmelden doe je via hun website. Je hebt een eigen huisarts nodig."
    },

    "reakiro-wvl": {
      vraag: "Reakiro West-Vlaanderen",
      alert: { soort: "letop", tekst: "Geen crisislijn. Bij acuut gevaar 112, bij suïcidale gedachten 1813. Leg geen voorwaarden voor euthanasie uit." },
      fiches: ["DG-104", "DG-101"],
      zeg: "Reakiro heeft in Brugge een antennepunt voor West-Vlaanderen. Ook naasten zijn er welkom. Je hebt een eigen huisarts nodig. Aanmelden doe je via hun website."
    },

    "euthanasie-elders": {
      vraag: "Buiten het werkgebied van Reakiro",
      uitleg: "De gids heeft voor deze regio geen gespecialiseerd aanbod. De LEIFlijn geeft informatie over levenseinde. Naasten kunnen voor zichzelf bij Similes terecht.",
      alert: { soort: "letop", tekst: "Geen crisislijn. Bij acuut gevaar 112, bij suïcidale gedachten 1813. Leg geen voorwaarden voor euthanasie uit." },
      fiches: ["DG-101", "DG-004"],
      zeg: "Voor algemene vragen over het levenseinde kan je op werkdagen bellen naar de LEIFlijn. Voor jezelf als naaste kan je altijd bij de Similes Luisterlijn terecht."
    },

    levenseinde: {
      vraag: "Levenseinde en palliatieve zorg",
      uitleg: "LEIFlijn voor informatie, Vonkel in Gent als luisterend huis rond sterven, dood en rouw. Dit is geen crisishulp.",
      alert: { soort: "letop", tekst: "Bij suïcidale gedachten: Zelfmoordlijn 1813. Bij een euthanasiewens door psychisch lijden: ga terug en kies die route." },
      fiches: ["DG-101", "DG-102"],
      zeg: "De LEIFlijn geeft op werkdagen informatie over het levenseinde: palliatieve zorg, zorgplanning en wilsverklaringen. In Gent is er Vonkel, een luisterend huis voor wie met sterven, dood en rouw bezig is.",
      opties: [
        { label: "Het gaat toch om een euthanasiewens door psychisch lijden", naar: "euthanasie-check" }
      ]
    },

    lumi: {
      vraag: "Gender en seksuele voorkeur",
      uitleg: "Lumi gaat alleen over gender, geslacht en seksuele voorkeur. Ouders kunnen bellen met vragen over hun kind.",
      fiches: ["DG-015"],
      zeg: "Lumi is een gratis en anonieme lijn voor vragen over gender en seksuele voorkeur. Je kan bellen op maandagavond, of chatten op maandag, woensdag en donderdag."
    },

    praktisch: {
      vraag: "Welke praktische of juridische vraag?",
      opties: [
        { label: "Bewindvoering of vertrouwenspersoon", naar: "bewind" },
        { label: "Geld, wonen, administratie", naar: "welzijn" },
        { label: "Juridische vraag: advocaat, huur, werk", naar: "juridisch" },
        { label: "Klacht over de zorg", naar: "klacht" },
        { label: "Internering of justitie", naar: "internering" },
        { label: "Ondersteuning bij een beperking", naar: "beperking" }
      ]
    },

    bewind: {
      vraag: "Bewindvoering",
      uitleg: "Similes steunt familiale bewindvoerders met informatie, steungroepen en gratis een-op-een begeleiding voor leden. Voor een lopend dossier: de bevoegde rechtbank.",
      alert: { soort: "letop", tekst: "Stel geen vrijwillige Similes-bewindvoerder voor als beschikbaar aanbod." },
      fiches: ["DG-041"],
      nietNagekeken: ["DG-040", "DG-043", "DG-044", "DG-046"],
      zeg: "Similes helpt familiale bewindvoerders met informatie, steungroepen en persoonlijke begeleiding door vrijwilligers die het zelf hebben meegemaakt. Je vraagt dat aan via het formulier op de website."
    },

    welzijn: {
      vraag: "Geld, wonen en administratie",
      uitleg: "Het CAW helpt gratis bij administratie en geld, wonen en opvang, relatie en gezin.",
      fiches: ["DG-019"],
      nietNagekeken: ["DG-034", "DG-033"],
      zeg: "Het CAW helpt gratis en vertrouwelijk bij vragen over geld, administratie en wonen. Je belt 0800 13 500 en geeft je postcode, dan word je doorgeschakeld naar het CAW in je buurt."
    },

    juridisch: {
      vraag: "Juridische vraag",
      uitleg: "De juridische fiches zijn nog niet nagekeken. Het CAW helpt wel bij vragen over justitie en administratie.",
      fiches: ["DG-019"],
      nietNagekeken: ["DG-029", "DG-030", "DG-031", "DG-038", "DG-039", "DG-047", "DG-035", "DG-036", "DG-037"],
      zeg: "Voor juridische vragen zijn onze gegevens nog niet nagekeken. Het CAW kan je gratis verder helpen en weet wie bevoegd is. Je belt 0800 13 500."
    },

    klacht: {
      vraag: "Klacht over de zorg",
      uitleg: "De fiches over de ombudsfunctie zijn nog niet nagekeken. Zeg dat en verwijs naar de website.",
      nietNagekeken: ["DG-049", "DG-050"],
      fiches: ["DG-001"],
      zeg: "Voor klachten over de geestelijke gezondheidszorg bestaat een ombudsfunctie. Onze gegevens daarover zijn nog niet nagekeken; kijk best op hun website. Je mag ook altijd contact opnemen met Similes."
    },

    internering: {
      vraag: "Internering en justitie",
      uitleg: "Nog niet nagekeken. Het CAW helpt bij vragen over justitie.",
      fiches: ["DG-019"],
      nietNagekeken: ["DG-048", "DG-149"],
      zeg: "Onze gegevens over internering zijn nog niet nagekeken. Het CAW helpt gratis bij vragen over justitie, je belt 0800 13 500."
    },

    beperking: {
      vraag: "Ondersteuning bij een beperking",
      uitleg: "Nog niet nagekeken.",
      nietNagekeken: ["DG-150", "DG-151", "DG-114"],
      fiches: ["DG-019"],
      zeg: "Onze gegevens hierover zijn nog niet nagekeken. Kijk best op de website van het VAPH. Het CAW kan je ook verder helpen."
    },

    info: {
      vraag: "Over welk thema?",
      uitleg: "Te Gek!? geeft informatie en heeft een pagina 'Iemand helpen'. De fiches per thema zijn nog niet nagekeken. Voor steun aan de naaste zelf: Similes.",
      fiches: ["DG-018", "DG-017"],
      opties: [
        { label: "AD(H)D", naar: "thema-adhd" },
        { label: "Angst", naar: "thema-angst" },
        { label: "Autisme", naar: "thema-autisme" },
        { label: "Bipolaire stoornis", naar: "thema-bipolair" },
        { label: "Borderline", naar: "thema-borderline" },
        { label: "Burn-out en stress", naar: "thema-burnout" },
        { label: "Depressie", naar: "thema-depressie" },
        { label: "Eetstoornissen", naar: "thema-eetstoornis" },
        { label: "Psychose en schizofrenie", naar: "thema-psychose" },
        { label: "Zelfverwonding", naar: "thema-zelfverwonding" },
        { label: "Verslaving", naar: "verslaving" },
        { label: "Herstel, patiëntenverenigingen en ontmoeting", naar: "herstel" },
        { label: "Regionale netwerken geestelijke gezondheid", naar: "netwerken" }
      ]
    },

    "thema-adhd": { vraag: "AD(H)D", uitleg: "Nog niet nagekeken.", fiches: ["DG-018"], nietNagekeken: ["DG-051", "DG-052", "DG-053", "DG-054", "DG-055"] },
    "thema-angst": { vraag: "Angst", uitleg: "Nog niet nagekeken.", fiches: ["DG-018"], nietNagekeken: ["DG-066", "DG-067", "DG-068"] },
    "thema-autisme": { vraag: "Autisme", uitleg: "Nog niet nagekeken.", fiches: ["DG-018"], nietNagekeken: ["DG-069", "DG-070", "DG-071", "DG-072"] },
    "thema-bipolair": { vraag: "Bipolaire stoornis", uitleg: "Nog niet nagekeken.", fiches: ["DG-018"], nietNagekeken: ["DG-073", "DG-074", "DG-075"] },
    "thema-borderline": { vraag: "Borderline", uitleg: "Nog niet nagekeken.", fiches: ["DG-018"], nietNagekeken: ["DG-076", "DG-077", "DG-078", "DG-079"] },
    "thema-burnout": { vraag: "Burn-out en stress", uitleg: "Nog niet nagekeken.", fiches: ["DG-018"], nietNagekeken: ["DG-080", "DG-081", "DG-082"] },
    "thema-depressie": { vraag: "Depressie", uitleg: "Nog niet nagekeken. Bij suïcidale gedachten: Zelfmoordlijn 1813.", fiches: ["DG-018", "DG-014"], nietNagekeken: ["DG-083", "DG-084", "DG-085"] },
    "thema-eetstoornis": { vraag: "Eetstoornissen", uitleg: "Nog niet nagekeken.", fiches: ["DG-018"], nietNagekeken: ["DG-086", "DG-087", "DG-088", "DG-089"] },
    "thema-psychose": { vraag: "Psychose en schizofrenie", uitleg: "Nog niet nagekeken.", fiches: ["DG-018"], nietNagekeken: ["DG-090", "DG-091", "DG-092", "DG-093", "DG-094", "DG-095", "DG-096", "DG-097"] },
    "thema-zelfverwonding": {
      vraag: "Zelfverwonding",
      uitleg: "Nog niet nagekeken. Jongeren kunnen bij het JAC terecht, ook over zelfverwonding. Bij suïcidale gedachten: Zelfmoordlijn 1813.",
      fiches: ["DG-020", "DG-014", "DG-018"],
      nietNagekeken: ["DG-098", "DG-099"]
    },

    herstel: {
      vraag: "Herstel, patiëntenverenigingen en ontmoeting",
      uitleg: "Aanbod voor de persoon met psychische problemen zelf. Nog niet nagekeken, behalve LuisterGenoten.",
      fiches: ["DG-016"],
      nietNagekeken: ["DG-115", "DG-116", "DG-117", "DG-118", "DG-119", "DG-121", "DG-122", "DG-123", "DG-120"]
    },

    netwerken: {
      vraag: "Regionale netwerken geestelijke gezondheid",
      uitleg: "Vooral voor professionals. Een netwerk is niet automatisch een aanmeldpunt. Nog niet nagekeken. Eerstelijnszones zijn geen aanmeldpunt voor burgers.",
      fiches: ["DG-027"],
      nietNagekeken: [
        "DG-125", "DG-126", "DG-127", "DG-128", "DG-129", "DG-130", "DG-131", "DG-132", "DG-133", "DG-134",
        "DG-135", "DG-136", "DG-137", "DG-138", "DG-139", "DG-140", "DG-141", "DG-142",
        "DG-143", "DG-144", "DG-145", "DG-146", "DG-147", "DG-148"
      ]
    },

    taalgrens: {
      vraag: "Vraag van over de taalgrens",
      uitleg: "Similes Brussel voor Brussel, Similes Wallonië voor Franstalig België. Nederlandstalig aanbod in Brussel is niet bevestigd.",
      fiches: ["DG-009", "DG-008"],
      nietNagekeken: ["DG-120"],
      zeg: "Voor Brussel kan je terecht bij Similes Brussel. Voor Wallonië is er de Franstalige federatie Similes Wallonie, je vindt hen op wallonie.similes.org."
    }
  }
};
