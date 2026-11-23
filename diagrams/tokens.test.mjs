import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { C, APP } from './engine.mjs';

const scss = readFileSync(new URL('../daprdocs/assets/scss/_tokens.scss', import.meta.url), 'utf8');
const dark = scss.indexOf('[data-bs-theme="dark"]');
const defs = (block) => new Set([...block.matchAll(/^\s*(--d-[a-z-]+)\s*:/gm)].map((m) => m[1]));
const light = defs(scss.slice(0, dark));
const darkSet = defs(scss.slice(dark));

const used = [...new Set([...Object.values(C), ...APP.flatMap((a) => [a.stroke, a.fill])]
  .map((v) => /var\((--d-[a-z-]+)\)/.exec(v)[1]))];

test('every token C references is defined in _tokens.scss', () => {
  assert.ok(dark > 0);
  for (const t of used) assert.ok(light.has(t), `${t} missing from :root`);
});

test('every diagram token is defined under [data-bs-theme="dark"] too', () => {
  for (const t of used) assert.ok(darkSet.has(t), `${t} missing from dark block`);
});
