// Renders every registered scene to daprdocs/assets/diagrams/<name>.svg.
//   node diagrams/export.mjs           write the files
//   node diagrams/export.mjs --check   write nothing; exit 1 if any file is stale
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { svg } from './engine.mjs';

const here = dirname(fileURLToPath(import.meta.url));
export const OUT_DIR = join(here, '..', 'daprdocs', 'assets', 'diagrams');

const NAME = /^[a-z0-9][a-z0-9-]*$/;
const blank = (v) => typeof v !== 'string' || !v.trim();

// Render one scene to the exact file content (LF, trailing newline).
// The scene name is passed as svg()'s id so accessible-name ids are unique
// by construction and stable under title edits.
export function renderScene(name, scene) {
  const fail = (m) => {
    throw new Error(`scene "${name}": ${m}`);
  };
  if (!NAME.test(name)) fail('name must match /^[a-z0-9][a-z0-9-]*$/');
  if (!scene || typeof scene !== 'object') fail('scene must be an object');
  if (blank(scene.title)) fail('title is required (non-empty string)');
  if (blank(scene.desc)) fail('desc is required (non-empty string)');
  for (const k of ['width', 'height']) {
    if (!Number.isFinite(scene[k]) || scene[k] <= 0) fail(`${k} must be a positive number`);
  }
  if (typeof scene.build !== 'function') fail('build() is required');
  const children = scene.build();
  if (!Array.isArray(children)) fail('build() must return an array of nodes');
  const out = svg({
    width: scene.width,
    height: scene.height,
    title: scene.title,
    desc: scene.desc,
    id: name,
    children,
  });
  return out.endsWith('\n') ? out : `${out}\n`;
}

// Returns { ok, problems[], written[] }. Renders everything before touching
// disk, so a bad scene leaves the output directory untouched.
export function run({ scenes, outDir = OUT_DIR, check = false } = {}) {
  const problems = [];
  const rendered = new Map();
  for (const [name, scene] of Object.entries(scenes)) {
    try {
      rendered.set(name, renderScene(name, scene));
    } catch (e) {
      problems.push(e.message);
    }
  }
  if (problems.length) return { ok: false, problems, written: [] };

  const existing = existsSync(outDir) ? readdirSync(outDir).filter((f) => f.endsWith('.svg')) : [];
  const orphans = existing.filter((f) => !rendered.has(f.slice(0, -4)));

  if (check) {
    const fix = '(run npm run export:diagrams)';
    for (const [name, content] of rendered) {
      const file = join(outDir, `${name}.svg`);
      if (!existsSync(file)) problems.push(`${name}.svg: missing ${fix}`);
      else if (readFileSync(file, 'utf8') !== content) problems.push(`${name}.svg: differs from a fresh render ${fix}`);
    }
    for (const f of orphans) problems.push(`${f}: no matching scene ${fix}`);
    return { ok: problems.length === 0, problems, written: [] };
  }

  mkdirSync(outDir, { recursive: true });
  const written = [];
  for (const [name, content] of rendered) {
    writeFileSync(join(outDir, `${name}.svg`), Buffer.from(content, 'utf8'));
    written.push(`${name}.svg`);
  }
  for (const f of orphans) unlinkSync(join(outDir, f));
  return { ok: true, problems: [], written };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { scenes } = await import('./scenes/index.mjs');
  const check = process.argv.includes('--check');
  const { ok, problems, written } = run({ scenes, check });
  if (!ok) {
    console.error(check ? 'Diagram check failed:' : 'Diagram export failed:');
    for (const p of problems) console.error(`  ${p}`);
    process.exitCode = 1;
  } else {
    console.log(check ? `Diagrams up to date (${Object.keys(scenes).length}).` : `Exported ${written.length} diagram(s).`);
  }
}
