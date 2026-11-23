// Renders every registered scene to daprdocs/static/diagrams/<name>.png: the
// same drawing as the download svg beside it, rasterised for the places that
// refuse svg - slide decks, blog editors, chat.
//   node diagrams/render-png.mjs           render the scenes that need it
//   node diagrams/render-png.mjs --force   render all of them
//   node diagrams/render-png.mjs --check   render nothing; exit 1 if any png is stale
//
// Two things about png-manifest.json:
//
// It records the render SETTINGS as well as a hash per scene. A hash only
// answers "did this drawing change"; it cannot answer "would a fresh render of
// the unchanged drawing come out different", which is exactly what happens
// when the width or a baked font stack moves. Without the settings, changing
// either leaves every png stale with every hash still matching.
//
// It also sets the limit of what --check can say. The manifest answers "was a
// render with these settings performed from this drawing", not "is this file
// that render": --check hashes freshly rendered scene SVGs and checks that a
// png EXISTS beside each one; it never opens a png. So a hand-edited or
// truncated png passes here. What catches that is the per-scene test in
// tests/diagrams.spec.js, which asks the server for the file and reads the
// 8-byte PNG signature off the front of what comes back.
//
// And it exists at all because the pngs are skipped when they are current.
// Chromium's raster output is byte-stable run to run on one version, but not
// guaranteed across versions, so re-rendering an unchanged scene on an updated
// browser would churn a binary in git for no visible change. --force is there
// for the deliberate re-render.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { withHarness } from './browser-harness.mjs';
import { BODY_STACK, MONO_STACK, STANDALONE_DIR, renderScene, standalone } from './export.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
// Beside the download svg, under static/, so the committed file is served as
// itself rather than inlined into a page.
export const PNG_DIR = STANDALONE_DIR;
export const MANIFEST = join(HERE, 'png-manifest.json');

// Measured across the DRAWING, not the canvas: scene canvases carry between 2%
// and 36% slack, so two diagrams dropped into the same box on a slide would
// otherwise arrive at different sizes.
export const PNG_WIDTH = 1440;
// Scene units, applied to the trimmed viewBox. Not zero: getBBox() reports
// geometry without stroke width, and a stroke straddles the edge it is drawn
// on, so a tight crop would shave the outer half off every outline.
export const PNG_MARGIN = 12;
// Bumped by hand when something about the rasterising itself changes that the
// constants above do not describe.
export const GENERATOR = 1;

export function settings() {
  return { width: PNG_WIDTH, margin: PNG_MARGIN, generator: GENERATOR, body: BODY_STACK, mono: MONO_STACK };
}

export const sha256 = (text) => createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex');

// The download svg of every scene: both the thing that gets rasterised and the
// thing the manifest hashes, rendered once so the two cannot disagree.
export function standaloneSvgs(scenes) {
  const out = new Map();
  for (const [name, scene] of Object.entries(scenes)) out.set(name, standalone(renderScene(name, scene)));
  return out;
}

const sameSettings = (a, b) =>
  !!a && Object.keys(b).length === Object.keys(a).length && Object.keys(b).every((k) => a[k] === b[k]);

// The scenes needing a render. `hashes` is name -> svg hash for every scene
// the registry draws now; `present` is the names that already have a png on
// disk, because a hash matching a file somebody deleted still needs rendering.
export function stale(manifest, hashes, wanted, present) {
  const names = Object.keys(hashes).sort();
  if (!sameSettings(manifest?.settings, wanted)) return names;
  const have = new Set(present);
  return names.filter((name) => manifest.scenes?.[name] !== hashes[name] || !have.has(name));
}

// Names the manifest still lists that no scene draws any more.
export function orphans(manifest, hashes) {
  return Object.keys(manifest?.scenes ?? {}).filter((name) => !Object.hasOwn(hashes, name)).sort();
}

// Returns { ok, problems[], written[], removed[] }. Mirrors run() in export.mjs.
export async function renderPngs({ scenes, pngDir = PNG_DIR, manifestPath, check = false, force = false } = {}) {
  // A caller that redirects pngDir - every test does - must redirect the
  // manifest too. Otherwise a render into a temp directory stamps the real
  // manifest, and every committed png then reads as up to date while none of
  // them were touched. Defaulting it silently is how the sibling exporter once
  // emptied static/diagrams.
  if (manifestPath === undefined) {
    if (pngDir !== PNG_DIR) {
      throw new Error('renderPngs(): pass manifestPath whenever you pass pngDir, or the real one is used');
    }
    manifestPath = MANIFEST;
  }

  let svgs;
  try {
    svgs = standaloneSvgs(scenes);
  } catch (e) {
    return { ok: false, problems: [e.message], written: [], removed: [] };
  }
  const hashes = Object.fromEntries([...svgs].map(([name, text]) => [name, sha256(text)]));
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : null;
  const present = existsSync(pngDir)
    ? readdirSync(pngDir).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4))
    : [];
  const wanted = settings();
  const behind = stale(manifest, hashes, wanted, present);
  // A png with no scene, counted from the manifest and from the directory
  // both: an entry left behind and a file left behind are halves of the same
  // mistake, and either one should fail --check.
  const dead = [...new Set([...orphans(manifest, hashes), ...present.filter((n) => !Object.hasOwn(hashes, n))])].sort();

  if (check) {
    const problems = [];
    const fix = '(run npm run export:pngs)';
    const have = new Set(present);
    for (const name of behind) problems.push(`${name}.png: ${have.has(name) ? 'stale' : 'missing'} ${fix}`);
    for (const name of dead) problems.push(`${name}.png: no matching scene ${fix}`);
    return { ok: problems.length === 0, problems, written: [], removed: [] };
  }

  // An emptied registry (typo, bad merge) must not silently wipe every
  // committed png.
  if (svgs.size === 0 && dead.length) {
    const problem = `registry is empty but ${dead.length} png(s) exist in ${pngDir}; refusing to delete them`;
    return { ok: false, problems: [problem], written: [], removed: [] };
  }

  // Rasterise everything before touching disk, so a scene that cannot be
  // measured leaves the output directory as it found it.
  const todo = force ? [...svgs.keys()].sort() : behind;
  const shots = todo.length ? await rasterise(todo.map((name) => [name, svgs.get(name)])) : new Map();

  mkdirSync(pngDir, { recursive: true });
  const written = [];
  for (const [name, bytes] of shots) {
    writeFileSync(join(pngDir, `${name}.png`), bytes);
    written.push(`${name}.png`);
  }
  const removed = [];
  for (const name of dead) {
    const file = join(pngDir, `${name}.png`);
    if (!existsSync(file)) continue;
    unlinkSync(file);
    removed.push(`${name}.png`);
  }

  // Last, once every file is on disk. A crash mid-render leaves the manifest
  // describing the previous render, so the next run redoes the scenes that did
  // not make it rather than trusting a stamp for files that were never written.
  if (written.length || dead.length) {
    const scenesOut = Object.fromEntries(Object.keys(hashes).sort().map((n) => [n, hashes[n]]));
    writeFileSync(manifestPath, `${JSON.stringify({ settings: wanted, scenes: scenesOut }, null, 2)}
`);
  }
  return { ok: true, problems: [], written, removed };
}

// name -> png bytes, all through one browser and one page. The page is the
// font harness: a label drawn in the browser's fallback face is a label
// nobody sees, and the download svg names Inter and Geist Mono outright.
async function rasterise(jobs) {
  return withHarness(async (tab) => {
    const out = new Map();
    for (const [name, svgText] of jobs) {
      const drawn = await tab.evaluate(({ markup, margin, width }) => {
        document.body.innerHTML = markup;
        const root = document.querySelector('svg');
        // getBBox() on the root gives the union of its children in the ROOT'S
        // OWN user space, with child transforms already applied - which is the
        // coordinate system a replacement viewBox is written in. A client rect
        // would be css pixels, and wrong here.
        const ink = root.getBBox();
        if (!(ink.width > 0) || !(ink.height > 0)) return false;
        const w = ink.width + margin * 2;
        const h = ink.height + margin * 2;
        root.setAttribute('viewBox', `${ink.x - margin} ${ink.y - margin} ${w} ${h}`);
        root.setAttribute('width', width);
        root.setAttribute('height', Math.round((width * h) / w));
        // Inline by default, which gives the element a line box to sit in and
        // a fractional offset to be screenshotted at.
        root.style.display = 'block';
        return true;
      }, { markup: svgText, margin: PNG_MARGIN, width: PNG_WIDTH });
      if (!drawn) throw new Error(`scene "${name}": no measurable drawing to rasterise`);
      await tab.evaluate(() => document.fonts.ready);
      // omitBackground is the transparency: without it the canvas comes back
      // opaque white (and the png as colour type 2 rather than 6). The white
      // plates INSIDE the drawing are painted fills and stay opaque either way.
      out.set(name, await tab.locator('body > svg').screenshot({ omitBackground: true }));
    }
    return out;
  }, { viewport: { width: PNG_WIDTH + 60, height: 900 } });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { scenes } = await import('./scenes/index.mjs');
  const check = process.argv.includes('--check');
  const force = process.argv.includes('--force');
  const { ok, problems, written, removed } = await renderPngs({ scenes, check, force });
  if (!ok) {
    console.error(check ? 'PNG check failed:' : 'PNG export failed:');
    for (const p of problems) console.error(`  ${p}`);
    process.exitCode = 1;
  } else {
    for (const f of removed) console.log(`Removed orphan: ${f}`);
    if (check) console.log(`PNGs up to date (${Object.keys(scenes).length}).`);
    else console.log(written.length ? `Rendered ${written.length} png(s).` : 'PNGs already up to date.');
  }
}
