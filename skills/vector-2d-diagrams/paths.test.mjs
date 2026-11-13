// The skill describes this repository, so it has to keep describing it. These
// tests fail when a path it names stops existing, and when text from the
// upstream it was adapted from creeps back in.

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..');

const DOCS = ['SKILL.md', 'reference/engine.md'];
const read = (f) => readFileSync(join(here, f), 'utf8');

// Only paths rooted at something this repo actually has. A backticked string
// is otherwise just as likely to be a URL, a shortcode or an npm script.
const ROOTS = ['diagrams/', 'daprdocs/', 'tests/', 'skills/', '.gitattributes'];

function repoPaths(body) {
  return [...body.matchAll(/`([^`\n]+)`/g)]
    .map((m) => m[1].trim())
    .filter((p) => ROOTS.some((r) => p.startsWith(r)))
    // Placeholders stand for a family of files, not one of them.
    .filter((p) => !/[<>*{}]/.test(p));
}

// Some paths the skill names are GENERATED - Hugo's build output, the render
// directory - so they are absent from a fresh checkout and present the moment
// anyone builds. "It does not exist" therefore says nothing about them, and a
// CI runner would fail on a path that is perfectly correct. Git already knows
// which ones those are: an ignored path is generated, and a typo is ignored by
// nothing, so the check still catches the mistake this test is here for.
function generated(p) {
  try {
    execFileSync('git', ['check-ignore', '-q', '--', p], { cwd: repo, stdio: 'ignore' });
    return true;
  } catch {
    // Exit 1 is "not ignored"; anything else means git could not answer, and
    // an unanswered question is not permission to skip the path.
    return false;
  }
}

test('every repo path named in the skill exists', () => {
  const missing = [];
  for (const doc of DOCS) {
    for (const p of repoPaths(read(doc))) {
      if (!existsSync(join(repo, p)) && !generated(p)) missing.push(`${doc}: ${p}`);
    }
  }
  assert.deepEqual(missing, [], `paths named in the skill that do not exist:\n${missing.join('\n')}`);
});

test('the skill names at least the files it is built on', () => {
  // Guards the test above against passing because the regex matched nothing.
  const named = DOCS.flatMap((d) => repoPaths(read(d)));
  for (const p of ['diagrams/engine.mjs', 'diagrams/shapes.mjs', 'diagrams/icons.mjs']) {
    assert.ok(named.includes(p), `the skill no longer names ${p}`);
  }
});

test('the skill describes this repo, not the one it was adapted from', () => {
  for (const doc of DOCS) {
    const body = read(doc);
    for (const stale of ['themes/bigspring', 'dapr.io', 'dapr/website', 'data/homepage.yml']) {
      assert.ok(!body.includes(stale), `${doc} still mentions ${stale}`);
    }
  }
});

test('the skill does not describe animation, which these diagrams do not do', () => {
  // Every diagram here is a still. Reinstating any of this would describe a
  // pause button, a reduced-motion path and a noscript fallback that the
  // shortcode does not render.
  for (const doc of DOCS) {
    const body = read(doc).toLowerCase();
    for (const stale of ['pause button', 'prefers-reduced-motion', 'noscript', 'd3-timer']) {
      assert.ok(!body.includes(stale), `${doc} still mentions ${stale}`);
    }
  }
});

test('the render script the workflow tells you to run exists', () => {
  assert.ok(existsSync(join(here, 'scripts', 'render-scene.mjs')));
  assert.match(read('SKILL.md'), /scripts\/render-scene\.mjs/);
});
