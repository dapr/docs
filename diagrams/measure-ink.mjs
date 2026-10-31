// Measures the DRAWN box of every vendored mark and writes it to ink.json.
//
// icon() fits a mark's viewBox, and a viewBox is not the ink: go.svg draws
// 24x9 inside a 24x24 box, and the Google Cloud mark is a wordmark five units
// tall in a box thirty-three wide. Two marks given the same size therefore
// come out at very different optical weights, which is fine in a row of marks
// that carry their names and hopeless in a column of marks that do not.
//
// A bounding box cannot be computed from path data without a renderer, so it
// is measured once in a headless browser and committed. `npm run measure:ink`
// regenerates it; a test fails if a mark has no entry.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';
import { ICONS_DIR, listMarks, parseMark } from './icons.mjs';
import { serialize } from './engine.mjs';

const OUT = join(ICONS_DIR, 'ink.json');

const round = (n) => +n.toFixed(3);

export async function measure(dir = ICONS_DIR) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const ink = {};
  for (const name of listMarks(dir)) {
    const mark = parseMark(readFileSync(join(dir, `${name}.svg`), 'utf8'), { name, prefix: `m-${name}-` });
    const [vx, vy, vw, vh] = mark.viewBox;
    const doc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" width="${vw}" height="${vh}">`
      + `<g id="ink">${mark.children.map(serialize).join('')}</g></svg>`;
    await page.setContent(`<!doctype html><body style="margin:0">${doc}</body>`);
    const box = await page.evaluate(() => {
      const b = document.getElementById('ink').getBBox();
      return [b.x, b.y, b.width, b.height];
    });
    if (!(box[2] > 0) || !(box[3] > 0)) throw new Error(`measure-ink: "${name}" draws nothing measurable`);
    ink[name] = box.map(round);
  }
  await browser.close();
  // Sorted, so the file is stable and a diff shows only what changed.
  const sorted = Object.fromEntries(Object.keys(ink).sort().map((k) => [k, ink[k]]));
  writeFileSync(OUT, `${JSON.stringify(sorted, null, 2)}\n`);
  return sorted;
}

if (process.argv[1] && process.argv[1].endsWith('measure-ink.mjs')) {
  const ink = await measure();
  console.log(`Measured ${Object.keys(ink).length} mark(s) into ${OUT}`);
}
