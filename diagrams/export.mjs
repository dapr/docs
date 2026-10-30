// Renders every registered scene to daprdocs/assets/diagrams/<name>.svg.
//   node diagrams/export.mjs           write the files
//   node diagrams/export.mjs --check   write nothing; exit 1 if any file is stale
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { svg } from './engine.mjs';
import { setIconScope } from './icons.mjs';
import { setCanvasWidth } from './shapes.mjs';
import ORIGINS from './bbox.json' with { type: 'json' };

const here = dirname(fileURLToPath(import.meta.url));
export const OUT_DIR = join(here, '..', 'daprdocs', 'assets', 'diagrams');
// A second copy of every scene, for the download and copy buttons. The inlined
// svg paints in var(--d-*), which only resolves on a page that defines those
// tokens: saved or pasted anywhere else it comes out black or blank. This copy
// has the LIGHT values substituted in, so it is a picture that works on its
// own. It cannot follow the theme - a file has to pick one - and light is the
// one a reader is most likely to paste into.
export const STANDALONE_DIR = join(here, '..', 'daprdocs', 'static', 'diagrams');
const TOKENS = join(here, '..', 'daprdocs', 'assets', 'scss', '_tokens.scss');

// The :root values, which is the light theme. Read from the stylesheet so the
// two cannot drift: a token renamed there must be renamed here or the
// substitution below fails loudly rather than leaving a var() in the file.
function lightTokens() {
  const scss = readFileSync(TOKENS, 'utf8');
  const root = scss.slice(0, scss.indexOf('[data-bs-theme="dark"]'));
  const out = new Map();
  for (const m of root.matchAll(/^\s*(--d-[a-z-]+)\s*:\s*([^;]+);/gm)) out.set(m[1], m[2].trim());
  return out;
}

// Replace every var(--d-*) with its light value. Throws on a token the
// stylesheet does not define, because a silently unresolved one is exactly the
// broken file this exists to prevent.
export function standalone(svgText, tokens = lightTokens()) {
  const missing = new Set();
  const out = svgText.replace(/var\((--d-[a-z-]+)\)/g, (whole, token) => {
    const value = tokens.get(token);
    if (value === undefined) {
      missing.add(token);
      return whole;
    }
    return value;
  });
  if (missing.size) throw new Error(`standalone svg: no light value for ${[...missing].join(', ')}`);
  return out;
}

// No doubled or trailing hyphens: those slug to the same svg id as their tidy twin.
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const blank = (v) => typeof v !== 'string' || !v.trim();

// The first id drawn twice anywhere in a scene, or null. Ids reach the page
// verbatim once the shortcode inlines the svg, so a collision here is invalid
// HTML on a real docs page - and it is not otherwise detectable, because every
// guard upstream of this one looks at a single mark rather than a whole scene.
function duplicateIds(nodes) {
  const seen = new Set();
  const visit = (n) => {
    if (!n || typeof n !== 'object' || n.text !== undefined) return null;
    const id = n.attrs && n.attrs.id;
    if (id !== undefined) {
      if (seen.has(id)) return id;
      seen.add(id);
    }
    for (const c of n.children ?? []) {
      const hit = visit(c);
      if (hit) return hit;
    }
    return null;
  };
  for (const n of nodes) {
    const hit = visit(n);
    if (hit) return hit;
  }
  return null;
}

// Render one scene to the exact file content (LF, trailing newline).
// The scene name is passed as svg()'s id so accessible-name ids are unique
// by construction and stable under title edits.
export function renderScene(name, scene) {
  const fail = (m) => {
    throw new Error(`scene "${name}": ${m}`);
  };
  if (!NAME.test(name)) fail(`name must match ${NAME}`);
  if (!scene || typeof scene !== 'object') fail('scene must be an object');
  if (blank(scene.title)) fail('title is required (non-empty string)');
  if (blank(scene.desc)) fail('desc is required (non-empty string)');
  for (const k of ['width', 'height']) {
    if (!Number.isFinite(scene[k]) || scene[k] <= 0) fail(`${k} must be a positive number`);
  }
  if (typeof scene.build !== 'function') fail('build() is required');
  // Scope icon ids to this scene for the duration of the build, so two diagrams
  // on one page cannot emit the same ids, and so no scene has to remember to.
  let children;
  setIconScope(name);
  // Arrows, buses and dashed borders take their weight from the canvas, so
  // one rendered thickness holds across diagrams of different widths.
  setCanvasWidth(scene.width);
  try {
    children = scene.build();
  } catch (e) {
    // A bare "no mark named ..." tells an operator with 24 scenes nothing about
    // which one failed, and build() is where most failures happen.
    fail(e && e.message ? e.message : String(e));
  } finally {
    setIconScope('');
    setCanvasWidth(null);
  }
  if (!Array.isArray(children)) fail('build() must return an array of nodes');
  const dup = duplicateIds(children);
  if (dup) fail(`duplicate id "${dup}" - two elements cannot share one id once the svg is inlined into a page`);
  const out = svg({
    width: scene.width,
    height: scene.height,
    title: scene.title,
    desc: scene.desc,
    id: name,
    children,
    origin: ORIGINS[name] ?? [0, 0],
  });
  // Some vendored marks carry CR inside their path data (java.svg has CR CR LF),
  // and .gitattributes pins these files to eol=lf, so git rewrites those bytes on
  // commit and a fresh clone would never match a fresh render. Normalise here
  // instead. CR, LF and tab are all just whitespace wherever they appear in these
  // documents, so no renderer sees a difference.
  const lf = out.replace(/\r\n?/g, '\n');
  return lf.endsWith('\n') ? lf : `${lf}\n`;
}

// Returns { ok, problems[], written[], removed[] } (removed = orphans deleted). Renders everything before touching
// disk, so a bad scene leaves the output directory untouched.
export function run({ scenes, outDir = OUT_DIR, standaloneDir, check = false } = {}) {
  // A caller that redirects outDir - every test does - must redirect the
  // standalone directory too, or it writes to and DELETES FROM the real one.
  // Defaulting it silently is how the test suite once emptied static/diagrams.
  if (standaloneDir === undefined) {
    if (outDir !== OUT_DIR) {
      throw new Error('run(): pass standaloneDir whenever you pass outDir, or the real one is used');
    }
    standaloneDir = STANDALONE_DIR;
  }
  const problems = [];
  const rendered = new Map();
  for (const [name, scene] of Object.entries(scenes)) {
    try {
      rendered.set(name, renderScene(name, scene));
    } catch (e) {
      problems.push(e.message);
    }
  }
  if (problems.length) return { ok: false, problems, written: [], removed: [] };

  // The standalone copies are rendered from the same strings, so the two can
  // never disagree about what the scene draws - only about how it is coloured.
  const flat = new Map();
  try {
    const tokens = lightTokens();
    for (const [name, content] of rendered) flat.set(name, standalone(content, tokens));
  } catch (e) {
    return { ok: false, problems: [e.message], written: [], removed: [] };
  }

  const existing = existsSync(outDir) ? readdirSync(outDir).filter((f) => f.endsWith('.svg')) : [];
  const orphans = existing.filter((f) => !rendered.has(f.slice(0, -4)));
  const flatExisting = existsSync(standaloneDir)
    ? readdirSync(standaloneDir).filter((f) => f.endsWith('.svg'))
    : [];
  const flatOrphans = flatExisting.filter((f) => !flat.has(f.slice(0, -4)));

  if (check) {
    const fix = '(run npm run export:diagrams)';
    for (const [name, content] of rendered) {
      const file = join(outDir, `${name}.svg`);
      if (!existsSync(file)) problems.push(`${name}.svg: missing ${fix}`);
      else if (readFileSync(file, 'utf8') !== content) problems.push(`${name}.svg: differs from a fresh render ${fix}`);
    }
    for (const f of orphans) problems.push(`${f}: no matching scene ${fix}`);
    for (const [name, content] of flat) {
      const file = join(standaloneDir, `${name}.svg`);
      if (!existsSync(file)) problems.push(`static/diagrams/${name}.svg: missing ${fix}`);
      else if (readFileSync(file, 'utf8') !== content) {
        problems.push(`static/diagrams/${name}.svg: differs from a fresh render ${fix}`);
      }
    }
    for (const f of flatOrphans) problems.push(`static/diagrams/${f}: no matching scene ${fix}`);
    return { ok: problems.length === 0, problems, written: [], removed: [] };
  }

  // An emptied registry (typo, bad merge) must not silently wipe every committed diagram.
  if (rendered.size === 0 && orphans.length) {
    problems.push(`registry is empty but ${orphans.length} svgs exist in ${outDir}; refusing to delete them`);
    return { ok: false, problems, written: [], removed: [] };
  }

  mkdirSync(outDir, { recursive: true });
  mkdirSync(standaloneDir, { recursive: true });
  const written = [];
  for (const [name, content] of rendered) {
    writeFileSync(join(outDir, `${name}.svg`), Buffer.from(content, 'utf8'));
    written.push(`${name}.svg`);
  }
  for (const [name, content] of flat) {
    writeFileSync(join(standaloneDir, `${name}.svg`), Buffer.from(content, 'utf8'));
    written.push(`static/diagrams/${name}.svg`);
  }
  for (const f of orphans) unlinkSync(join(outDir, f));
  for (const f of flatOrphans) unlinkSync(join(standaloneDir, f));
  return { ok: true, problems: [], written, removed: [...orphans, ...flatOrphans] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { scenes } = await import('./scenes/index.mjs');
  const check = process.argv.includes('--check');
  const { ok, problems, written, removed } = run({ scenes, check });
  if (!ok) {
    console.error(check ? 'Diagram check failed:' : 'Diagram export failed:');
    for (const p of problems) console.error(`  ${p}`);
    process.exitCode = 1;
  } else {
    for (const f of removed) console.log(`Removed orphan: ${f}`);
    console.log(check ? `Diagrams up to date (${Object.keys(scenes).length}).` : `Exported ${written.length} diagram(s).`);
  }
}
