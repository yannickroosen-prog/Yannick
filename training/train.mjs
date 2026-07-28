// Traint een klein CNN om Scrabble-letters (A-Z) te herkennen.
//
// We hebben geen dataset van échte steenfoto's, dus we genereren synthetische,
// sterk geaugmenteerde steenbeelden: donkere serif-letter op een crème steen,
// met puntwaarde-cijfer, rotatie, ruis, blur en helderheidsvariatie. Dat
// generaliseert verrassend goed voor deze sterk beperkte (26 glyphs) taak.
//
// Uitvoer: ../public/models/letters/{model.json,weights.bin} + labels.json

import * as tf from '@tensorflow/tfjs-node';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { extractRealCells } from './warp_lib.mjs';

// Echte bordfoto's als extra NEGATIEVE data (echte kleuren/opdruk/naad/glans).
// Elk item: pad, hoekpunten [TL,TR,BR,BL] in fotopixels, en de uit te sluiten
// zone (rond gelegde stenen) zodat er geen letters in de negatieven sluipen.
const REAL_SOURCES = [
  {
    path: './real/don_board.jpg',
    corners: [[148, 1113], [1851, 1082], [1835, 2880], [66, 2956]],
    exclude: { r0: 5, r1: 9, c0: 5, c1: 11 },
  },
];
const REAL_AUG = 12; // varianten per echte cel

// Echte gelegde stenen als POSITIEVE data (echt tegel-lettertype, slab-serif).
// Elk item: pad + lijst [letter, centrumX, centrumY] in fotopixels + cropgrootte.
const REAL_POSITIVES = [
  {
    path: './real/don_board.jpg',
    crop: 112,
    tiles: [
      ['D', 1002, 1953],
      ['O', 1113, 1953],
      ['N', 1218, 1953],
    ],
  },
];
const POS_AUG = 60; // varianten per echte steen

// Losse gelabelde steen-crops (uit detect_tiles/extract_positives) en echte
// negatieve patches (tafel/hout), opgeslagen als [{label?,g}] JSON.
const REAL_POS_FILES = ['./real/pos_tiles1.json'];
const REAL_NEG_FILES = ['./real/neg_wood.json'];

const __dirname = dirname(fileURLToPath(import.meta.url));

const IMG = 32; // modelinvoer 32x32
const RENDER = 64; // render op 64 en verklein → nettere antialiasing
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const POINTS = {
  A: 1, B: 3, C: 5, D: 2, E: 1, F: 4, G: 3, H: 4, I: 1, J: 4, K: 3, L: 3,
  M: 3, N: 1, O: 1, P: 3, Q: 10, R: 2, S: 2, T: 2, U: 4, V: 4, W: 5, X: 8, Y: 8, Z: 4,
};

// Extra klasse voor "geen letter" (leeg vak, bonusvak, bordtextuur, achtergrond).
const EMPTY = '∅';
const CLASSES = [...LETTERS, EMPTY];
const EMPTY_INDEX = LETTERS.length;

const TRAIN_PER_CLASS = 700;
const VAL_PER_CLASS = 120;
// Ruime, diverse negatieve set zodat het model niet-stenen betrouwbaar afwijst.
const NEG_TRAIN = 6500;
const NEG_VAL = 1000;
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

  return rasterize(c);
}

/**
 * Verklein een RENDERxRENDER-canvas naar IMG grijswaarden [0,1] met
 * augmentatie (optionele blur, helderheid/contrast, ruis). Gedeeld door
 * positieve en negatieve voorbeelden.
 */
function rasterize(c) {
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

const BONUS_COLORS = [
  [45, 110, 120], // teal (bord)
  [190, 60, 55], // rood 3L
  [45, 50, 80], // marine 2L/3L
  [90, 120, 60], // groen 3W
  [220, 180, 70], // goud 2W/2L
];
const BONUS_TEXT = ['3X', '2X', 'LETTER', 'WAARDE', 'WOORD', 'L', 'W', ''];

/**
 * Rendert een NEGATIEF voorbeeld: iets wat GEEN steen is. Vier typen:
 *  a) bedrukt bonusvak (gekleurd, met witte tekstfragmenten als "3X LETTER")
 *  b) egaal bordvak met gridlijn
 *  c) aanrecht/tafel-achtige lichte, gespikkelde textuur
 *  d) vage ruis/gradient
 */
function renderNegative() {
  const c = createCanvas(RENDER, RENDER);
  const ctx = c.getContext('2d');
  const type = rndInt(0, 5);

  if (type === 0) {
    // Bonusvak: teal ondergrond + gekleurde ruit + witte tekst.
    const base = BONUS_COLORS[0];
    ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
    ctx.fillRect(0, 0, RENDER, RENDER);
    const col = choice(BONUS_COLORS.slice(1));
    ctx.save();
    ctx.translate(RENDER / 2, RENDER / 2);
    ctx.rotate(Math.PI / 4);
    const s = rnd(30, 52);
    ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
    ctx.fillRect(-s / 2, -s / 2, s, s);
    ctx.restore();
    if (Math.random() < 0.8) {
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font = `bold ${rnd(8, 13)}px "${choice(FONTS)}"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(choice(BONUS_TEXT), RENDER / 2, RENDER / 2 + rnd(-10, 10));
    }
  } else if (type === 1) {
    // Egaal bordvak met gridlijn.
    const base = BONUS_COLORS[0];
    ctx.fillStyle = `rgb(${base[0] + rnd(-15, 15)},${base[1] + rnd(-15, 15)},${
      base[2] + rnd(-15, 15)
    })`;
    ctx.fillRect(0, 0, RENDER, RENDER);
    ctx.strokeStyle = 'rgba(240,240,235,0.85)';
    ctx.lineWidth = rnd(2, 5);
    const edge = choice([0, RENDER]);
    if (Math.random() < 0.5) {
      ctx.beginPath();
      ctx.moveTo(edge, 0);
      ctx.lineTo(edge, RENDER);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, edge);
      ctx.lineTo(RENDER, edge);
      ctx.stroke();
    }
  } else if (type === 2) {
    // Aanrecht/tafel: licht, gespikkeld.
    ctx.fillStyle = `rgb(${rnd(220, 245)},${rnd(218, 240)},${rnd(210, 235)})`;
    ctx.fillRect(0, 0, RENDER, RENDER);
    for (let i = 0; i < rndInt(20, 80); i++) {
      const g = rnd(150, 210);
      ctx.fillStyle = `rgba(${g},${g},${g},0.5)`;
      ctx.fillRect(rnd(0, RENDER), rnd(0, RENDER), rnd(1, 3), rnd(1, 3));
    }
  } else if (type === 3) {
    // Vouwnaad van het bord: donkere band dwars door een teal cel.
    const base = BONUS_COLORS[0];
    ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
    ctx.fillRect(0, 0, RENDER, RENDER);
    ctx.fillStyle = `rgba(${rnd(10, 40)},${rnd(20, 50)},${rnd(20, 50)},${rnd(0.4, 0.8)})`;
    const bandH = rnd(6, 16);
    const y = rnd(0, RENDER - bandH);
    if (Math.random() < 0.5) ctx.fillRect(0, y, RENDER, bandH);
    else ctx.fillRect(y, 0, bandH, RENDER);
  } else if (type === 4) {
    // Glans/reflectie: heldere vlek over teal of crème ondergrond.
    if (Math.random() < 0.5) {
      const base = BONUS_COLORS[0];
      ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
    } else {
      ctx.fillStyle = `rgb(${rnd(225, 245)},${rnd(215, 238)},${rnd(190, 215)})`;
    }
    ctx.fillRect(0, 0, RENDER, RENDER);
    const gx = rnd(0, RENDER);
    const gy = rnd(0, RENDER);
    const grad = ctx.createRadialGradient(gx, gy, 2, gx, gy, rnd(20, 50));
    grad.addColorStop(0, `rgba(255,255,255,${rnd(0.4, 0.85)})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, RENDER, RENDER);
  } else {
    // Vage gradient/ruis (met soms zware ruis).
    const g = rnd(60, 200);
    ctx.fillStyle = `rgb(${g},${g + rnd(-30, 30)},${g + rnd(-30, 30)})`;
    ctx.fillRect(0, 0, RENDER, RENDER);
    if (Math.random() < 0.6) {
      const im = ctx.getImageData(0, 0, RENDER, RENDER);
      for (let i = 0; i < im.data.length; i += 4) {
        const nz = (Math.random() - 0.5) * rnd(40, 120);
        im.data[i] += nz;
        im.data[i + 1] += nz;
        im.data[i + 2] += nz;
      }
      ctx.putImageData(im, 0, 0);
    }
  }

  return rasterize(c);
}

function buildDataset(perClass, negCount) {
  const n = perClass * LETTERS.length + negCount;
  const xs = new Float32Array(n * IMG * IMG);
  const ys = new Int32Array(n);
  let k = 0;
  for (let li = 0; li < LETTERS.length; li++) {
    for (let s = 0; s < perClass; s++) {
      xs.set(renderSample(LETTERS[li]), k * IMG * IMG);
      ys[k] = li;
      k++;
    }
  }
  for (let s = 0; s < negCount; s++) {
    xs.set(renderNegative(), k * IMG * IMG);
    ys[k] = EMPTY_INDEX;
    k++;
  }
  const xsT = tf.tensor4d(xs, [n, IMG, IMG, 1]);
  const ysT = tf.oneHot(tf.tensor1d(ys, 'int32'), CLASSES.length);
  return { xsT, ysT };
}

/** Lichte augmentatie van een reeds gerasterde cel (helderheid/contrast/ruis). */
function augmentFloat(g) {
  const out = new Float32Array(g.length);
  const brightness = rnd(-0.1, 0.1);
  const contrast = rnd(0.85, 1.2);
  const noise = rnd(0, 0.08);
  for (let i = 0; i < g.length; i++) {
    let v = (g[i] - 0.5) * contrast + 0.5 + brightness + (Math.random() - 0.5) * noise;
    out[i] = Math.max(0, Math.min(1, v));
  }
  return out;
}

/** Laadt echte NIET-steen-cellen uit de bordfoto's, elk REAL_AUG keer geaugmenteerd. */
async function loadRealNegatives() {
  const all = [];
  for (const src of REAL_SOURCES) {
    if (!existsSync(join(__dirname, src.path))) continue;
    const cells = await extractRealCells(
      join(__dirname, src.path),
      src.corners,
      src.exclude,
      IMG
    );
    for (const cell of cells) {
      all.push(cell);
      for (let a = 0; a < REAL_AUG; a++) all.push(augmentFloat(cell));
    }
  }
  return all;
}

/** Laadt echte gelegde stenen als positieve, geaugmenteerde voorbeelden. */
async function loadRealPositives() {
  const out = [];
  for (const src of REAL_POSITIVES) {
    if (!existsSync(join(__dirname, src.path))) continue;
    const img = await loadImage(join(__dirname, src.path));
    const cv = createCanvas(img.width, img.height);
    cv.getContext('2d').drawImage(img, 0, 0);
    for (const [letter, cx, cy] of src.tiles) {
      const li = LETTERS.indexOf(letter);
      if (li < 0) continue;
      for (let a = 0; a < POS_AUG; a++) {
        const S = src.crop * rnd(0.9, 1.15);
        const jx = rnd(-6, 6);
        const jy = rnd(-6, 6);
        const cell = createCanvas(IMG, IMG);
        const cc = cell.getContext('2d');
        cc.save();
        cc.translate(IMG / 2, IMG / 2);
        cc.rotate((rnd(-9, 9) * Math.PI) / 180);
        cc.translate(-IMG / 2, -IMG / 2);
        cc.drawImage(cv, cx - S / 2 + jx, cy - S / 2 + jy, S, S, 0, 0, IMG, IMG);
        cc.restore();
        const { data } = cc.getImageData(0, 0, IMG, IMG);
        const g = new Float32Array(IMG * IMG);
        const brightness = rnd(-0.12, 0.12);
        const contrast = rnd(0.85, 1.2);
        const noise = rnd(0, 0.07);
        for (let i = 0; i < IMG * IMG; i++) {
          let v =
            (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) /
            255;
          v = (v - 0.5) * contrast + 0.5 + brightness + (Math.random() - 0.5) * noise;
          g[i] = Math.max(0, Math.min(1, v));
        }
        out.push({ g, li });
      }
    }
  }
  return out;
}

/** Laadt gelabelde/ongelabelde sample-bestanden ([{label?,g}]) met augmentatie. */
function loadSampleFiles(files, forceLi, augPer) {
  const out = [];
  for (const f of files) {
    const p = join(__dirname, f);
    if (!existsSync(p)) continue;
    const arr = JSON.parse(readFileSync(p));
    for (const s of arr) {
      const li = forceLi != null ? forceLi : LETTERS.indexOf(s.label);
      if (li < 0) continue;
      const base = Float32Array.from(s.g);
      out.push({ g: base, li });
      for (let a = 0; a < augPer; a++) out.push({ g: augmentFloat(base), li });
    }
  }
  return out;
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
  model.add(tf.layers.dense({ units: CLASSES.length, activation: 'softmax' }));
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });
  return model;
}

async function main() {
  console.log('Trainingsdata genereren…');
  const train = buildDataset(TRAIN_PER_CLASS, NEG_TRAIN);
  const val = buildDataset(VAL_PER_CLASS, NEG_VAL);

  // Echte data uit bordfoto's toevoegen: negatieven (∅) + gelegde stenen.
  const negs = await loadRealNegatives();
  const pos = await loadRealPositives();
  const tilePos = loadSampleFiles(REAL_POS_FILES, null, POS_AUG);
  const woodNeg = loadSampleFiles(REAL_NEG_FILES, EMPTY_INDEX, 8);
  const extra = [
    ...negs.map((g) => ({ g, li: EMPTY_INDEX })),
    ...pos.map((p) => ({ g: p.g, li: p.li })),
    ...tilePos,
    ...woodNeg,
  ];
  console.log(
    `Extra echt: ${negs.length} bordneg, ${pos.length} DON-pos, ${tilePos.length} losse-steen-pos, ${woodNeg.length} houtneg`
  );
  let trainXs = train.xsT;
  let trainYs = train.ysT;
  if (extra.length > 0) {
    const flat = new Float32Array(extra.length * IMG * IMG);
    const idx = new Int32Array(extra.length);
    extra.forEach((e, i) => {
      flat.set(e.g, i * IMG * IMG);
      idx[i] = e.li;
    });
    const realX = tf.tensor4d(flat, [extra.length, IMG, IMG, 1]);
    const realY = tf.oneHot(tf.tensor1d(idx, 'int32'), CLASSES.length);
    trainXs = tf.concat([train.xsT, realX], 0);
    trainYs = tf.concat([train.ysT, realY], 0);
    train.xsT.dispose();
    train.ysT.dispose();
    realX.dispose();
    realY.dispose();
    console.log(`Echte data toegevoegd: ${negs.length} negatief, ${pos.length} positief`);
  }
  console.log('Train:', trainXs.shape, 'Val:', val.xsT.shape);

  const model = buildModel();
  model.summary();

  await model.fit(trainXs, trainYs, {
    epochs: EPOCHS,
    batchSize: BATCH,
    shuffle: true,
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
  writeFileSync(join(outDir, 'labels.json'), JSON.stringify(CLASSES));
  console.log('Model opgeslagen in', outDir);

  trainXs.dispose();
  trainYs.dispose();
  val.xsT.dispose();
  val.ysT.dispose();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
