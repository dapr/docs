// Screenshot a diagram as the page actually renders it, in both themes.
//
//   node skills/d3-2d-diagrams/scripts/render-scene.mjs <name> [page-path] [width]
//
// Looking at the result is a required step, not a formality: the numeric tests
// pass on a mark that is invisible, on a label drawn twice in the same place,
// and on a glyph scaled to nothing inside a slack viewBox.
//
// Needs the dev server running (`npm run serve`, port 1313 by default; set
// DIAGRAM_PORT to override). Writes PNGs next to the repo in a git-ignored
// folder and prints where they went.

import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from '@playwright/test';

const [name, pagePath = `/${name}/`, width = '1600'] = process.argv.slice(2);

if (!name) {
  console.error('usage: render-scene.mjs <name> [page-path] [width]');
  process.exit(2);
}

const port = process.env.DIAGRAM_PORT || '1313';
const base = `http://localhost:${port}`;
const outDir = resolve(process.cwd(), '.diagram-renders');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const written = [];

try {
  for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({
      viewport: { width: Number(width), height: 1000 },
      deviceScaleFactor: 2,
    });
    // Not networkidle: the dev server holds a live-reload WebSocket open, so
    // the network never goes idle and the wait times out instead of loading.
    let response;
    try {
      response = await page.goto(base + pagePath, { waitUntil: 'domcontentloaded' });
    } catch (e) {
      throw new Error(`could not load ${base}${pagePath} (${e.message.split('\n')[0]}). Is the dev server running? Start it with \`npm run serve\`, or set DIAGRAM_PORT.`);
    }
    if (!response || !response.ok()) {
      throw new Error(`${base}${pagePath} returned ${response ? response.status() : 'nothing'}`);
    }
    // The inlined SVG is part of the document, so it is there once the DOM is,
    // but fonts are not, and they change label widths.
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate((t) => document.documentElement.setAttribute('data-bs-theme', t), theme);

    const figure = page.locator(`.dapr-diagram[data-diagram="${name}"]`);
    if ((await figure.count()) === 0) {
      throw new Error(`no diagram "${name}" on ${pagePath} - check the scene name and that the page calls the shortcode`);
    }
    // A cookie banner or any other fixed overlay paints over the figure and
    // ends up in the screenshot, hiding exactly the bottom row you wanted to
    // check. Take them out of the picture first.
    await page.evaluate(() => {
      for (const node of document.querySelectorAll('body *')) {
        if (getComputedStyle(node).position === 'fixed') {
          node.style.setProperty('display', 'none', 'important');
        }
      }
    });

    await figure.scrollIntoViewIfNeeded();

    const file = join(outDir, `${name}-${theme}.png`);
    await figure.screenshot({ path: file });
    written.push(file);
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(`Rendered ${name} in both themes:`);
for (const file of written) console.log(`  ${file}`);
console.log('\nOpen both. A diagram that passes every test can still be wrong.');
