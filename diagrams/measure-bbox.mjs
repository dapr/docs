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

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withHarness } from './browser-harness.mjs';
import { renderScene } from './export.mjs';
import { scenes } from './scenes/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'bbox.json');

const round = (v) => +v.toFixed(2);

function figures(names) {
  return names
    .map((name) => `<div class="fig" data-scene="${name}" style="width:900px">${renderScene(name, scenes[name])}</div>`)
    .join('');
}

export async function measure() {
  const names = Object.keys(scenes);
  return withHarness(async (tab) => {
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
  }, { body: figures(names), viewport: { width: 1000, height: 900 } });
}

if (process.argv[1] && process.argv[1].endsWith('measure-bbox.mjs')) {
  const boxes = await measure();
  console.log(`Measured ${Object.keys(boxes).length} scene(s) into ${OUT}`);
}
