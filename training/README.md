# Lettermodel — offline training

Traint een klein CNN dat Scrabble-letters (A–Z) herkent. Het model draait daarna
volledig client-side in de app (TensorFlow.js) en wordt als statische assets
geladen uit `public/models/letters/`.

## Waarom synthetische data?

Er is geen dataset van échte steenfoto's. We genereren daarom sterk
geaugmenteerde synthetische stenen: donkere serif-letter op een crème steen, met
puntwaarde-cijfer, en variatie in font, grootte, rotatie, helderheid, ruis en
blur. Voor deze sterk beperkte taak (26 vaste glyphs) generaliseert dat goed
(~97% validatie-accuraatheid).

## Draaien

```bash
cd training
npm install
node train.mjs
```

Dit schrijft `public/models/letters/{model.json,weights.bin,labels.json}`.
Commit die bestanden mee; ze worden met de app meegedeployed.

De trainings-dependencies (`@tensorflow/tfjs-node`, `@napi-rs/canvas`) staan los
van de app en worden **niet** meegebundeld (`training/node_modules` is
gitignored).

## Afregelen

Pas bovenaan `train.mjs` aan:
- `TRAIN_PER_CLASS` / `VAL_PER_CLASS` — datasetgrootte per letter
- `EPOCHS`, `BATCH`
- de augmentatie-parameters in `renderSample()` (rotatie, ruis, blur, kleuren)

Meer variatie in de augmentatie = betere robuustheid op echte foto's.
