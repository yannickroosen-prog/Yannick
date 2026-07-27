// Traint een klein CNN om Scrabble-letters (A-Z) te herkennen.
//
// We hebben geen dataset van échte steenfoto's, dus we genereren synthetische,
// sterk geaugmenteerde steenbeelden: donkere serif-letter op een crème steen,
// met puntwaarde-cijfer, rotatie, ruis, blur en helderheidsvariatie. Dat
// generaliseert verrassend goed voor deze sterk beperkte (26 glyphs) taak.
//
// Uitvoer: ../public/models/letters/{model.json,weights.bin} + labels.json

import * as tf from '@tensorflow/tfjs-node';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const IMG = 32; // modelinvoer 32x32
const RENDER = 64; // render op 64 en verklein → nettere antialiasing
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const POINTS = {
  A: 1, B: 3, C: 5, D: 2, E: 1, F: 4, G: 3, H: 4, I: 1, J: 4, K: 3, L: 3,
  M: 3, N: 1, O: 1, P: 3, Q: 10, R: 2, S: 2, T: 2, U: 4, V: 4, W: 5, X: 8, Y: 8, Z: 4,
};

const TRAIN_PER_CLASS = 700;
const VAL_PER_CLASS = 120;
const EPOCHS = 18;
const BATCH = 128;

// ---- Fonts: serif-varianten + wat sans voor vormvariatie ----
const families = GlobalFonts.families.map((f) => f.family);
const pick = (needle) => families.filter((f) => f.toLowerCase().includes(needle));
const FONTS = Array.from(
  new Set([
    ...pick('serif'),
    ...pick('nimbus'),
    ...pick('liberation sans'),
    ...pick('dejavu sans'),
    'serif',
    'sans-serif',
  ])
).slice(0, 8);
console.log('Gebruikte fonts:', FONTS.join(' | '));

const rnd = (a, b) => a + Math.random() * (b - a);
const rndInt = (a, b) => Math.floor(rnd(a, b + 1));
const choice = (arr) => arr[rndInt(0, arr.length - 1)];

// Render één geaugmenteerd steenbeeld → Float32Array(IMG*IMG) in [0,1].
function renderSample(letter) {
  const c = createCanvas(RENDER, RENDER);
  const ctx = c.getContext('2d');

  // Crème steenachtergrond met variatie.
  const bg = [rnd(225, 250), rnd(215, 240), rnd(185, 215)];
  ctx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`;
  ctx.fillRect(0, 0, RENDER, RENDER);

  // Soms een donkere celrand (steenrand / bordbleed) zichtbaar.
  if (Math.random() < 0.5) {
    const inset = rnd(0, 4);
    ctx.lineWidth = rnd(2, 6);
    ctx.strokeStyle = `rgba(${rnd(40, 120)},${rnd(60, 120)},${rnd(60, 120)},${rnd(
      0.3,
      0.8
    )})`;
    ctx.strokeRect(inset, inset, RENDER - 2 * inset, RENDER - 2 * inset);
  }

  const inkShade = rnd(10, 80);
  ctx.fillStyle = `rgb(${inkShade},${inkShade},${inkShade})`;

  // Grote letter, gecentreerd met jitter + rotatie.
  ctx.save();
  ctx.translate(RENDER / 2 + rnd(-4, 4), RENDER / 2 + rnd(-4, 4));
  ctx.rotate((rnd(-11, 11) * Math.PI) / 180);
  const weight = Math.random() < 0.75 ? 'bold' : 'normal';
  const size = rnd(34, 48);
  ctx.font = `${weight} ${size}px "${choice(FONTS)}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, 0, rnd(-2, 2));
  ctx.restore();

  // Puntwaarde-cijfer rechtsonder (zoals op een echte steen).
  if (Math.random() < 0.7) {
    ctx.save();
    ctx.font = `bold ${rnd(9, 13)}px "${choice(FONTS)}"`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(String(POINTS[letter]), RENDER - rnd(3, 8), RENDER - rnd(2, 6));
    ctx.restore();
  }

  // Verklein naar IMG (optionele extra blur via tussenstap).
  const small = createCanvas(IMG, IMG);
  const sctx = small.getContext('2d');
  if (Math.random() < 0.4) {
    const b = rndInt(10, 18); // blur: eerst naar klein, dan omhoog
    const tmp = createCanvas(b, b);
    tmp.getContext('2d').drawImage(c, 0, 0, b, b);
    sctx.drawImage(tmp, 0, 0, IMG, IMG);
  } else {
    sctx.drawImage(c, 0, 0, IMG, IMG);
  }

  const { data } = sctx.getImageData(0, 0, IMG, IMG);
  const out = new Float32Array(IMG * IMG);
  const brightness = rnd(-25, 25);
  const contrast = rnd(0.8, 1.25);
  const noise = rnd(0, 22);
  for (let i = 0; i < IMG * IMG; i++) {
    let v = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
    v = (v - 128) * contrast + 128 + brightness + (Math.random() - 0.5) * noise;
    out[i] = Math.max(0, Math.min(255, v)) / 255;
  }
  return out;
}

function buildDataset(perClass) {
  const n = perClass * LETTERS.length;
  const xs = new Float32Array(n * IMG * IMG);
  const ys = new Int32Array(n);
  let k = 0;
  for (let li = 0; li < LETTERS.length; li++) {
    for (let s = 0; s < perClass; s++) {
      const sample = renderSample(LETTERS[li]);
      xs.set(sample, k * IMG * IMG);
      ys[k] = li;
      k++;
    }
  }
  const xsT = tf.tensor4d(xs, [n, IMG, IMG, 1]);
  const ysT = tf.oneHot(tf.tensor1d(ys, 'int32'), LETTERS.length);
  return { xsT, ysT };
}

function buildModel() {
  const model = tf.sequential();
  model.add(
    tf.layers.conv2d({
      inputShape: [IMG, IMG, 1],
      filters: 24,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same',
    })
  );
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
  model.add(
    tf.layers.conv2d({ filters: 48, kernelSize: 3, activation: 'relu', padding: 'same' })
  );
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
  model.add(
    tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu', padding: 'same' })
  );
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
  model.add(tf.layers.flatten());
  model.add(tf.layers.dropout({ rate: 0.35 }));
  model.add(tf.layers.dense({ units: 96, activation: 'relu' }));
  model.add(tf.layers.dropout({ rate: 0.35 }));
  model.add(tf.layers.dense({ units: LETTERS.length, activation: 'softmax' }));
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });
  return model;
}

async function main() {
  console.log('Trainingsdata genereren…');
  const train = buildDataset(TRAIN_PER_CLASS);
  const val = buildDataset(VAL_PER_CLASS);
  console.log('Train:', train.xsT.shape, 'Val:', val.xsT.shape);

  const model = buildModel();
  model.summary();

  await model.fit(train.xsT, train.ysT, {
    epochs: EPOCHS,
    batchSize: BATCH,
    validationData: [val.xsT, val.ysT],
    callbacks: {
      onEpochEnd: (e, logs) =>
        console.log(
          `epoch ${e + 1}/${EPOCHS}  loss=${logs.loss.toFixed(3)}  acc=${logs.acc.toFixed(
            3
          )}  val_acc=${logs.val_acc.toFixed(3)}`
        ),
    },
  });

  const outDir = join(__dirname, '..', 'public', 'models', 'letters');
  mkdirSync(outDir, { recursive: true });
  await model.save(`file://${outDir}`);
  writeFileSync(join(outDir, 'labels.json'), JSON.stringify(LETTERS));
  console.log('Model opgeslagen in', outDir);

  train.xsT.dispose();
  train.ysT.dispose();
  val.xsT.dispose();
  val.ysT.dispose();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
