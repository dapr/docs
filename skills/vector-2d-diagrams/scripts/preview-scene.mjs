// Screenshot a scene in both themes WITHOUT the Hugo dev server, and print
// what it actually measures.
//
//   node skills/vector-2d-diagrams/scripts/preview-scene.mjs <name> [css-width]
//
// `render-scene.mjs` loads the real page, which is the honest check and the one
// to finish on. It also needs the dev server up and a rebuild between every
// change, which is around half a minute per look - too slow to place a label
// by, so labels end up placed by arithmetic and checked once at the end.
//
// This serves the LAST BUILD's stylesheet and webfonts out of daprdocs/public
// and inlines the freshly exported token SVG into a bare page of its own. Same
// CSS, same fonts, so the label widths are the ones the page gets, and the
// turnaround is a couple of seconds. It also prints the scene's bbox, its four
// margins and the measured box of every label, which is how a wrap or a
// clearance gets decided instead of estimated.
//
// What it does NOT check, and what render-scene.mjs is still for: that the
// shortcode inlines the scene, that the figure sits correctly in the content
// column, and anything else about the page around the drawing.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const REPO = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const PUBLIC = join(REPO, 'daprdocs', 'public');

const [name, widthArg = '1000'] = process.argv.slice(2);
if (!name) {
  console.error('usage: preview-scene.mjs <name> [css-width]');
  process.exit(2);
}
const width = Number(widthArg);

// Without the stylesheet and the webfonts every label is measured in a
// fallback face at a fallback size, which is worse than useless: it looks like
// a measurement. Refuse rather than quietly mislead.
const stylesheet = join(PUBLIC, 'scss', 'main.css');
if (!existsSync(stylesheet)) {
  console.error(`no build to borrow CSS and fonts from (${stylesheet} is missing).\nRun \`npm run build\` once, or use render-scene.mjs against the dev server.`);
  process.exit(2);
}

const svgPath = join(REPO, 'daprdocs', 'assets', 'diagrams', `${name}.svg`);
if (!existsSync(svgPath)) {
  console.error(`no exported scene at ${svgPath}. Run \`npm run export:diagrams\` first.`);
  process.exit(2);
}
const svg = await readFile(svgPath, 'utf8');

// That stylesheet is only as current as the last build, and tokens added since
// are simply absent: the app palette was, which painted App B black on black
// and looked like a scene bug. Re-declare the live ones after it. The file is
// plain custom properties in two blocks once its comments are out.
const tokens = (await readFile(join(REPO, 'daprdocs', 'assets', 'scss', '_tokens.scss'), 'utf8'))
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');

const html = `<!doctype html><html data-bs-theme="light"><head><meta charset="utf-8">
<link rel="stylesheet" href="/scss/main.css">
<style>${tokens}</style>
<style>
 html,body{margin:0;background:var(--d-ground)}
 #wrap{width:${width}px;padding:24px;box-sizing:border-box;background:var(--d-ground)}
 figure.dapr-diagram{margin:0}
 .dapr-diagram svg{display:block;width:100%;height:auto}
</style></head><body><div id="wrap">
<figure class="dapr-diagram" data-diagram="${name}">${svg}</figure>
</div></body></html>`;

const TYPES = {
  '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.js': 'text/javascript', '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/__scene') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }
  try {
    const file = join(PUBLIC, path);
    if (!file.startsWith(PUBLIC)) throw new Error('outside the build');
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('');
  }
});
await new Promise((ready) => server.listen(0, '127.0.0.1', ready));
const { port } = server.address();

const outDir = join(REPO, '.diagram-renders');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const written = [];
try {
  for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({
      viewport: { width: width + 40, height: 1200 },
      deviceScaleFactor: 2,
    });
    await page.goto(`http://127.0.0.1:${port}/__scene`, { waitUntil: 'load' });
    // Fonts change label widths, so nothing is measured until they are in.
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate((t) => document.documentElement.setAttribute('data-bs-theme', t), theme);

    if (theme === 'light') {
      const m = await page.evaluate(() => {
        const svgEl = document.querySelector('.dapr-diagram svg');
        const b = svgEl.getBBox();
        const v = svgEl.viewBox.baseVal;
        const round = (n) => +n.toFixed(1);
        return {
          // The FRAME, origin included: bbox.json gives most scenes a
          // non-zero viewBox origin, and a margin measured from 0 is wrong by
          // exactly that much.
          view: { w: v.width, h: v.height, x: v.x, y: v.y },
          box: { l: round(b.x), t: round(b.y), r: round(b.x + b.width), b: round(b.y + b.height) },
          texts: [...svgEl.querySelectorAll('text')].map((t) => {
            const r = t.getBBox();
            // label() gives each LINE of a multi-line label its own x, so
            // those join with a space; richLabel()'s inline runs have no x and
            // join with nothing, or a URL comes back with gaps in it.
            const spans = [...t.querySelectorAll('tspan')];
            const text = spans.length
              ? spans.map((s) => (s.hasAttribute('x') ? ` ${s.textContent}` : s.textContent)).join('')
              : t.textContent;
            return {
              text: text.replace(/\s+/g, ' ').trim(),
              l: round(r.x), t: round(r.y), r: round(r.x + r.width), b: round(r.y + r.height),
            };
          }),
        };
      });
      const at = m.view.x || m.view.y ? `  at ${m.view.x} ${m.view.y}` : '';
      console.log(`viewBox ${m.view.w} x ${m.view.h}${at}   ratio ${(m.view.w / m.view.h).toFixed(3)}`);
      console.log(`bbox    left ${m.box.l}  top ${m.box.t}  right ${m.box.r}  bottom ${m.box.b}   (scene coordinates)`);
      const edge = (n) => n.toFixed(1);
      console.log(`margins left ${edge(m.box.l - m.view.x)}  top ${edge(m.box.t - m.view.y)}  right ${edge(m.view.x + m.view.w - m.box.r)}  bottom ${edge(m.view.y + m.view.h - m.box.b)}`);
      console.log('labels, as drawn:');
      for (const t of m.texts) {
        console.log(`  x ${t.l}..${t.r}   y ${t.t}..${t.b}   ${JSON.stringify(t.text)}`);
      }
    }

    const file = join(outDir, `${name}-${theme}.png`);
    await page.locator('#wrap').screenshot({ path: file });
    written.push(file);
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}

console.log(`\n${written.join('\n')}`);
