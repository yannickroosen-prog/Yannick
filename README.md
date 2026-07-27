# 🔤 Scrabble Vision Scorekeeper

Een webapp die met de camera van een smartphone naar een Scrabble-bord kijkt,
de letters herkent, de gespeelde zet detecteert en automatisch de score
berekent volgens de officiële (Nederlandse) Scrabble-regels.

> **Status: werkend MVP.** De volledige pipeline — camera → borddetectie →
> rasterdetectie → OCR → zetdetectie → scoring → UI — is geïmplementeerd, met
> handmatige correctie zodat de app ook bruikbaar blijft wanneer de OCR een
> letter mist.

## Functies

- 📷 **Live camerabeeld** via `getUserMedia`, met uitlijnkader en scanknop.
- 📁 **Foto uploaden** (uit de galerij) als alternatief voor de live camera.
- 🎯 **Handmatige hoekuitlijning**: sleep de 4 bordhoeken voor een exacte
  perspectiefcorrectie.
- 🤖 **Automatische scanmodus** (scant periodiek).
- 🧠 **Computer vision**: borddetectie + perspectiefcorrectie (OpenCV.js),
  15×15-rasterdetectie met kleur-gebaseerde steendetectie.
- 🔡 **Getraind lettermodel**: een klein CNN (TensorFlow.js, ~0,5 MB) herkent
  letters volledig client-side/offline; met automatische terugval op Tesseract-OCR.
  Zie [`training/`](training/README.md) voor de trainingspipeline.
- ✍️ **Handmatige correctie**: onzekere detecties worden rood gemarkeerd en zijn
  per vakje aan te passen.
- 🔍 **Zetdetectie**: vergelijkt de huidige scan met de vorige en bepaalt welke
  stenen nieuw zijn en welke woorden gevormd zijn.
- 🧮 **Scoringsengine**: officiële regels, configureerbare letterwaarden en
  bonusvakken, dwarswoorden, blanco stenen, en de 50-punten-bingobonus.
- 📖 **Woordvalidatie** (optioneel, met eigen woordenlijst).
- 🏆 **Scorebord** voor 1–4 spelers met beurtwissel en historiek.
- 📤 **Export** naar PDF en CSV.
- 🌙 **Donkere modus** en 📱 **PWA** (installeerbaar, offline app-shell).

## Tech-stack

| Onderdeel        | Keuze                          |
| ---------------- | ------------------------------ |
| Framework        | Next.js 14 (App Router)        |
| Taal             | TypeScript                     |
| Styling          | Tailwind CSS (responsive, mobile-first) |
| State + opslag   | Zustand + `localStorage`       |
| Borddetectie     | OpenCV.js (lazy, via CDN)      |
| OCR              | Tesseract.js                   |
| Export           | jsPDF + jspdf-autotable        |
| Tests            | Vitest                         |

## Aan de slag

```bash
npm install
npm run dev        # ontwikkelserver op http://localhost:3000
npm run build      # productiebuild
npm run typecheck  # TypeScript-controle
npm test           # unit-tests (scoringsengine + zetdetectie)
```

> **Camera vereist HTTPS** (of `localhost`). Op een telefoon test je het
> makkelijkst via een HTTPS-tunnel of een deploy (bv. Vercel/Netlify).

## Hoe het werkt

De code volgt de gevraagde ontwikkelvolgorde en is per stap opgesplitst:

```
src/lib/vision/
  opencv.ts          # lazy loader voor OpenCV.js
  boardDetection.ts  # 1. borddetectie + perspectiefcorrectie
  gridExtraction.ts  # 2. 15×15-raster + bezettingsdetectie
  ocr.ts             # 3. OCR per cel (Tesseract) + betrouwbaarheid
  pipeline.ts        # orkestratie: frame → Board

src/lib/scrabble/
  config.ts          # letterwaarden + bonusbord (Nederlands, configureerbaar)
  board.ts           # bordmodel + diff-hulpmiddelen
  scoring.ts         # 5. scoringsengine (woorden, bonussen, bingo)
  moveDetection.ts   # 4. zetdetectie (vorige vs. huidige scan)
  dictionary.ts      # optionele woordvalidatie
  scoring.test.ts    # unit-tests

src/lib/
  store.ts           # spelers, scores, historiek (Zustand + persist)
  export.ts          # PDF/CSV-export

src/components/       # 6. UI (camera, bord, scorebord, resultaten, instellingen)
src/app/              # Next.js App Router + PWA
```

### Scanflow

1. Richt de camera op het bord binnen het kader en druk op de scanknop.
2. Het bord wordt gedetecteerd, rechtgetrokken en in 15×15 verdeeld.
3. Bezette vakjes gaan door de OCR; onzekere letters worden gemarkeerd.
4. De app vergelijkt met de vorige stand, toont de gevormde woorden met
   puntendetail en het totaal (incl. eventuele bingobonus).
5. Corrigeer waar nodig door op een vakje te tikken en druk op **Bevestig zet**.

## Configuratie

- **Letterwaarden & onzekerheidsdrempel**: aanpasbaar in het tabblad
  *Instellingen*.
- **Bonusvakken**: gedefinieerd in `src/lib/scrabble/config.ts`
  (`DEFAULT_BONUS_BOARD`), symmetrisch opgebouwd volgens het standaardbord.
- **Woordenlijst**: plaats `public/dictionaries/nl.txt` (één woord per regel) om
  woordvalidatie in te schakelen. Zie de README in die map.

## Automatisch deployen (CI/CD)

Bij elke push naar de ontwikkelbranch bouwt en publiceert
`.github/workflows/deploy.yml` de app automatisch naar Netlify
(https://scrabble-vision-scorekeeper.netlify.app).

Eenmalige instelling — voeg één GitHub-secret toe:

1. Maak een **Netlify personal access token** aan:
   Netlify → *User settings* → *Applications* → *Personal access tokens* →
   *New access token*
   (https://app.netlify.com/user/applications#personal-access-tokens).
2. Zet die token als repo-secret **`NETLIFY_AUTH_TOKEN`**:
   GitHub-repo → *Settings* → *Secrets and variables* → *Actions* →
   *New repository secret*.

Daarna deployt elke `git push` automatisch. Het site-id staat al in de workflow
(niet geheim). De workflow draait ook eerst de tests; faalt een test, dan wordt
er niet gedeployd.

## Beperkingen & vervolg

- OCR van losse letters is gevoelig voor belichting en hoek; de handmatige
  correctie is daarom een kernonderdeel, geen bijzaak.
- OpenCV.js wordt van een CDN geladen; voor volledige offline werking kun je het
  bestand lokaal in `public/` plaatsen en de URL in `opencv.ts` aanpassen.
- Mogelijke uitbreidingen: per-letter-classifier getraind op Scrabble-stenen,
  automatische bonusvak-herkenning op kleur, en meertalige steenverdelingen.
