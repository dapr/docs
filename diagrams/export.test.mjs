import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { el, text } from './engine.mjs';
import { run, renderScene, OUT_DIR } from './export.mjs';

const scene = (over = {}) => ({
  width: 100,
  height: 50,
  title: 'A title',
  desc: 'A description',
  build: () => [el('rect', { x: 0, y: 0, width: 10, height: 10 }), el('text', { x: 5, y: 5 }, [text('hi')])],
  ...over,
});
// alpha and beta deliberately share title and desc.
const fixtures = () => ({ alpha: scene(), beta: scene() });
const tmp = () => mkdtempSync(join(tmpdir(), 'diagrams-'));
const snapshot = (dir) =>
  existsSync(dir) ? Object.fromEntries(readdirSync(dir).sort().map((f) => [f, readFileSync(join(dir, f), 'utf8')])) : null;
const withDir = (fn) => () => {
  const d = tmp();
  try {
    fn(d);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
};

test('the default output directory is daprdocs/assets/diagrams (tests never use it)', () => {
  assert.ok(OUT_DIR.endsWith(join('daprdocs', 'assets', 'diagrams')));
});

test('exporting twice produces byte-identical output', () => {
  const a = tmp();
  const b = tmp();
  try {
    run({ scenes: fixtures(), outDir: a });
    run({ scenes: fixtures(), outDir: b });
    run({ scenes: fixtures(), outDir: b });
    const sa = snapshot(a);
    assert.deepEqual(Object.keys(sa), ['alpha.svg', 'beta.svg']);
    assert.deepEqual(snapshot(b), sa);
  } finally {
    rmSync(a, { recursive: true, force: true });
    rmSync(b, { recursive: true, force: true });
  }
});

test(
  'output is LF with one trailing newline, and ids come from the scene name',
  withDir((d) => {
    run({ scenes: fixtures(), outDir: d });
    const raw = readFileSync(join(d, 'alpha.svg'));
    assert.ok(!raw.includes(0x0d), 'no CR bytes');
    const s = raw.toString('utf8');
    assert.ok(s.endsWith('\n') && !s.endsWith('\n\n'));
    assert.match(s, /id="alpha-title"/);
    // same title+desc in another scene must not collide
    assert.match(readFileSync(join(d, 'beta.svg'), 'utf8'), /id="beta-title"/);
  }),
);

test(
  '--check exits 0 when committed files match',
  withDir((d) => {
    run({ scenes: fixtures(), outDir: d });
    const r = run({ scenes: fixtures(), outDir: d, check: true });
    assert.equal(r.ok, true);
    assert.deepEqual(r.problems, []);
  }),
);

test(
  '--check exits 1 and names the file when one differs, is missing or is orphaned',
  withDir((d) => {
    run({ scenes: fixtures(), outDir: d });
    writeFileSync(join(d, 'alpha.svg'), 'tampered\n');
    writeFileSync(join(d, 'gone.svg'), '<svg/>\n');
    const r = run({ scenes: { ...fixtures(), gamma: scene() }, outDir: d, check: true });
    assert.equal(r.ok, false);
    const msg = r.problems.join('\n');
    assert.match(msg, /alpha\.svg: differs/);
    assert.match(msg, /gamma\.svg: missing/);
    assert.match(msg, /gone\.svg: no matching scene/);
    assert.doesNotMatch(msg, /beta\.svg/);
  }),
);

test(
  '--check does not write to disk',
  withDir((d) => {
    run({ scenes: fixtures(), outDir: d });
    writeFileSync(join(d, 'alpha.svg'), 'tampered\n');
    writeFileSync(join(d, 'gone.svg'), '<svg/>\n');
    const before = snapshot(d);
    run({ scenes: { ...fixtures(), gamma: scene() }, outDir: d, check: true });
    assert.deepEqual(snapshot(d), before, 'no file created, changed or deleted');
    // a directory that does not exist must not be created either
    const nowhere = join(d, 'nested', 'out');
    assert.equal(run({ scenes: fixtures(), outDir: nowhere, check: true }).ok, false);
    assert.equal(existsSync(join(d, 'nested')), false);
  }),
);

test(
  'export removes orphaned svgs (and only svgs) so --check can pass',
  withDir((d) => {
    writeFileSync(join(d, 'gone.svg'), '<svg/>\n');
    writeFileSync(join(d, 'keep.txt'), 'x');
    run({ scenes: fixtures(), outDir: d });
    assert.deepEqual(readdirSync(d).sort(), ['alpha.svg', 'beta.svg', 'keep.txt']);
    assert.equal(run({ scenes: fixtures(), outDir: d, check: true }).ok, true);
  }),
);

for (const field of ['title', 'desc']) {
  for (const [label, value] of [['absent', undefined], ['empty', ''], ['whitespace-only', ' \t\n'], ['non-string', 42]]) {
    test(
      `a scene with ${label} ${field} fails the export and writes nothing`,
      withDir((d) => {
        const bad = scene({ [field]: value });
        const r = run({ scenes: { ...fixtures(), bad }, outDir: d });
        assert.equal(r.ok, false);
        assert.match(r.problems.join('\n'), new RegExp(`scene "bad": ${field} is required`));
        assert.deepEqual(readdirSync(d), [], 'valid scenes are not written either');
        assert.equal(run({ scenes: { bad }, outDir: d, check: true }).ok, false);
      }),
    );
  }
}

test('other malformed scenes fail with a named reason', () => {
  assert.throws(() => renderScene('x', scene({ width: 0 })), /width must be a positive number/);
  assert.throws(() => renderScene('x', scene({ height: NaN })), /height/);
  assert.throws(() => renderScene('x', scene({ build: undefined })), /build\(\) is required/);
  assert.throws(() => renderScene('x', scene({ build: () => 'nope' })), /must return an array/);
  assert.throws(() => renderScene('Bad Name', scene()), /name must match/);
  assert.throws(() => renderScene('../x', scene()), /name must match/);
});
