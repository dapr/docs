// Measures where each scene's DRAWING sits in its canvas, and writes the
// viewBox origin that centres it to bbox.json.
//
// A canvas is not a frame the drawing is centred in by construction: a scene
// places its parts at coordinates, and whatever air is left over lands
// wherever the arithmetic put it. That does not show while a diagram fills the
// content column, because the figure's own edges are the page's. It shows the
// moment a figure renders narrower than the column, where the drawing sits
// visibly off to one side of its own white space.
//
// The drawing's extent cannot be computed from the scene: most of it is TEXT,
// and text has no width until a font renders it. So, like ink.json, it is
// measured once in a headless browser and committed. `npm run measure:bbox`
// regenerates it. The exporter passes each origin to svg(); a scene with no
// entry exports at 0 0 and a test says so.
//
// The measurement does not depend on what is already in the file: each scene
// is rendered at the origin 0 0 and the centring origin derived from that, so
// running this twice gives the same answer.

import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { renderScene } from './export.mjs';
import { scenes } from './scenes/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const STATIC = join(REPO, 'daprdocs', 'static');
const OUT = join(HERE, 'bbox.json');

// The site's own faces, served from the repo rather than from a build, so this
// needs nothing built first. Label widths depend on them, and a fallback face
// would measure a drawing nobody sees.
const FACES = [
  ['Geist', 400, 'geist-400.woff2'], ['Geist', 500, 'geist-500.woff2'],
  ['Geist', 600, 'geist-600.woff2'], ['Geist', 700, 'geist-700.woff2'],
  ['Inter', 400, 'inter-400.woff2'], ['Inter', 500, 'inter-500.woff2'],
  ['Inter', 600, 'inter-600.woff2'],
  ['Geist Mono', 400, 'geist-mono-400.woff2'], ['Geist Mono', 500, 'geist-mono-500.woff2'],
];

const fontCss = FACES
  .map(([family, weight, file]) => `@font-face{font-family:"${family}";font-weight:${weight};font-display:block;src:url("/fonts/${file}") format("woff2")}`)
  .join('');

const round = (v) => +v.toFixed(2);

function page(names) {
  // The same variables the page sets, so `var(--font-mono)` on a code label
  // resolves to the face it will really be drawn in.
  const figures = names
    .map((name) => `<div class="fig" data-scene="${name}" style="width:900px">${renderScene(name, scenes[name])}</div>`)
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss}
:root{--font-head:"Geist",sans-serif;--font-body:"Inter",sans-serif;--font-mono:"Geist Mono",monospace}
body{margin:0;font-family:var(--font-body)}
.fig svg{display:block;width:100%;height:auto}</style></head><body>${figures}</body></html>`;
}

export async function measure() {
  const names = Object.keys(scenes);
  const server = createServer((req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname;
    if (path === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(page(names));
      return;
    }
    try {
      const file = join(STATIC, path);
      if (!file.startsWith(STATIC)) throw new Error('outside static');
      res.writeHead(200, { 'content-type': extname(file) === '.woff2' ? 'font/woff2' : 'application/octet-stream' });
      res.end(readFileSync(file));
    } catch {
      res.writeHead(404);
      res.end('');
    }
  });
  await new Promise((ready) => server.listen(0, '127.0.0.1', ready));
  const { port } = server.address();

  const browser = await chromium.launch();
  try {
    const tab = await browser.newPage({ viewport: { width: 1000, height: 900 } });
    await tab.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' });
    await tab.evaluate(() => document.fonts.ready);
    const measured = await tab.evaluate(() => Object.fromEntries(
      [...document.querySelectorAll('.fig')].map((fig) => {
        const el = fig.querySelector('svg');
        const b = el.getBBox();
        const v = el.viewBox.baseVal;
        // The origin that puts the same amount of air on both sides: the
        // content's own centre, less half the canvas.
        return [fig.dataset.scene, [b.x + b.width / 2 - v.width / 2, b.y + b.height / 2 - v.height / 2]];
      }),
    ));
    for (const [name, origin] of Object.entries(measured)) {
      if (!Number.isFinite(origin[0]) || !Number.isFinite(origin[1])) {
        throw new Error(`measure-bbox: scene "${name}" has no measurable drawing`);
      }
    }
    const sorted = Object.fromEntries(
      Object.keys(measured).sort().map((k) => [k, measured[k].map(round)]),
    );
    writeFileSync(OUT, `${JSON.stringify(sorted, null, 2)}\n`);
    return sorted;
  } finally {
    await browser.close();
    server.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith('measure-bbox.mjs')) {
  const boxes = await measure();
  console.log(`Measured ${Object.keys(boxes).length} scene(s) into ${OUT}`);
}
