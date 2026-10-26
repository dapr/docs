// Shared helpers for the diagram scripts: build the site, serve it, and load
// Playwright from tests/ (the only place it is installed).
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

export const repoRoot = resolve(import.meta.dirname, '..', '..', '..');
const require = createRequire(import.meta.url);
export const { chromium } = require(resolve(repoRoot, 'tests/node_modules/playwright'));

// Builds the site into tests/.site-<name> (gitignored), serves it on `port`,
// and returns { url, close }. Assets use a localhost baseURL, so the page under
// test loads its own CSS and JS, not production's.
export async function serveSite(name, port) {
  const dir = `tests/.site-${name}`;
  const build = spawnSync('hugo', ['--quiet', '--cleanDestinationDir', '--baseURL', `http://localhost:${port}/`, '--destination', dir],
    { cwd: repoRoot, encoding: 'utf8' });
  if (build.status !== 0) throw new Error(`hugo failed:\n${build.stderr}`);
  const server = spawn('node', ['tests/serve.js', dir, String(port)], { cwd: repoRoot, stdio: 'ignore' });
  const url = `http://localhost:${port}/`;
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(url)).ok) break; } catch { await new Promise((r) => setTimeout(r, 100)); }
  }
  return {
    url,
    close() { server.kill(); rmSync(resolve(repoRoot, dir), { recursive: true, force: true }); },
  };
}

// Reads `--name value` pairs and bare arguments from process.argv.
export function args() {
  const out = { _: [] };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith('--')) out[a[i].slice(2)] = a[i + 1]?.startsWith('--') || a[i + 1] === undefined ? true : a[++i];
    else out._.push(a[i]);
  }
  return out;
}
