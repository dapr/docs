import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { el, text } from './engine.mjs';
import { settings, stale, orphans, renderPngs, PNG_WIDTH, PNG_MARGIN, GENERATOR } from './render-png.mjs';

const tmp = () => mkdtempSync(join(tmpdir(), 'pngs-'));
// The manifest lives inside the redirected directory: the orphan sweep only
// looks at .png, so a json file beside them is invisible to it, and one
// rmSync clears the lot.
const withDir = (fn) => async () => {
  const d = tmp();
  try {
    await fn(d, join(d, 'png-manifest.json'));
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
};

const scene = (over = {}) => ({
  width: 100,
  height: 50,
  title: 'A title',
  desc: 'A description',
  build: () => [
    el('rect', { x: 10, y: 10, width: 40, height: 20, fill: 'var(--d-sky)' }),
    el('text', { x: 10, y: 45, 'font-size': 10 }, [text('hi')]),
  ],
  ...over,
});

const manifest = (scenes, over = {}) => ({ settings: { ...settings(), ...over }, scenes });

test('the render settings carry the width, the margin, the generator and both font stacks', () => {
  assert.deepEqual(Object.keys(settings()).sort(), ['body', 'generator', 'margin', 'mono', 'width']);
  assert.equal(settings().width, PNG_WIDTH);
  assert.equal(settings().margin, PNG_MARGIN);
  assert.equal(settings().generator, GENERATOR);
  assert.match(settings().body, /^Inter,/);
  assert.match(settings().mono, /Geist Mono/);
});

test('stale names a scene whose svg hash moved', () => {
  const have = manifest({ alpha: 'aaa', beta: 'bbb' });
  assert.deepEqual(stale(have, { alpha: 'aaa', beta: 'CHANGED' }, settings(), ['alpha', 'beta']), ['beta']);
});

test('stale names a scene the manifest has never seen', () => {
  const have = manifest({ alpha: 'aaa' });
  assert.deepEqual(stale(have, { alpha: 'aaa', beta: 'bbb' }, settings(), ['alpha', 'beta']), ['beta']);
});

test('stale names a scene whose png file is gone', () => {
  const have = manifest({ alpha: 'aaa', beta: 'bbb' });
  assert.deepEqual(stale(have, { alpha: 'aaa', beta: 'bbb' }, settings(), ['alpha']), ['beta']);
});

test('stale names every scene when the settings differ', () => {
  const have = manifest({ alpha: 'aaa', beta: 'bbb' }, { width: 1200 });
  assert.deepEqual(stale(have, { alpha: 'aaa', beta: 'bbb' }, settings(), ['alpha', 'beta']), ['alpha', 'beta']);
});

test('stale names every scene when a font stack changes under unchanged hashes', () => {
  const have = manifest({ alpha: 'aaa' }, { mono: 'Courier' });
  assert.deepEqual(stale(have, { alpha: 'aaa' }, settings(), ['alpha']), ['alpha']);
});

test('stale names every scene when there is no manifest at all', () => {
  assert.deepEqual(stale(null, { alpha: 'aaa' }, settings(), ['alpha']), ['alpha']);
});

test('stale names nothing when hashes and settings match', () => {
  const have = manifest({ alpha: 'aaa', beta: 'bbb' });
  assert.deepEqual(stale(have, { alpha: 'aaa', beta: 'bbb' }, settings(), ['alpha', 'beta']), []);
});

test('orphans names a png whose scene is gone', () => {
  const have = manifest({ alpha: 'aaa', gone: 'ggg' });
  assert.deepEqual(orphans(have, { alpha: 'aaa' }), ['gone']);
  assert.deepEqual(orphans(have, { alpha: 'aaa', gone: 'ggg' }), []);
});

test('renderPngs refuses a redirected pngDir with the real manifest', async () => {
  const d = tmp();
  try {
    await assert.rejects(
      () => renderPngs({ scenes: { alpha: scene() }, pngDir: d }),
      /manifestPath/,
    );
    assert.deepEqual(readdirSync(d), []);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
});

test('renderPngs --check reports a missing png without opening a browser', withDir(async (dir, manifestPath) => {
  const out = await renderPngs({ scenes: { alpha: scene() }, pngDir: dir, manifestPath, check: true });
  assert.equal(out.ok, false);
  assert.equal(out.problems.length, 1);
  assert.match(out.problems[0], /alpha\.png/);
  assert.deepEqual(out.written, []);
  assert.equal(existsSync(manifestPath), false);
}));

// Both facts come straight out of the IHDR chunk rather than from an image
// library: width is the big-endian uint32 at byte 16, and the colour type at
// byte 25 is 6 for truecolour WITH alpha. A screenshot taken without
// omitBackground comes back as colour type 2, so that one byte is the whole
// transparency assertion.
const ihdr = (file) => {
  const png = readFileSync(file);
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20), colour: png[25] };
};

test('a rendered png is 1440 wide and carries an alpha channel', withDir(async (dir, manifestPath) => {
  const out = await renderPngs({ scenes: { alpha: scene() }, pngDir: dir, manifestPath });
  assert.deepEqual(out.problems, []);
  assert.equal(out.ok, true);
  assert.deepEqual(out.written, ['alpha.png']);
  const { width, height, colour } = ihdr(join(dir, 'alpha.png'));
  assert.equal(width, PNG_WIDTH);
  assert.equal(colour, 6);
  // The drawing is wider than it is tall, and the trim keeps that: a png as
  // tall as it is wide would mean the canvas came through instead of the ink.
  assert.ok(height > 0 && height < PNG_WIDTH, `height ${height}`);
  const written = JSON.parse(readFileSync(manifestPath, 'utf8'));
  assert.deepEqual(written.settings, settings());
  assert.deepEqual(Object.keys(written.scenes), ['alpha']);
}));

test('a second render writes nothing and leaves the png byte-identical', withDir(async (dir, manifestPath) => {
  await renderPngs({ scenes: { alpha: scene() }, pngDir: dir, manifestPath });
  const before = readFileSync(join(dir, 'alpha.png'));
  const out = await renderPngs({ scenes: { alpha: scene() }, pngDir: dir, manifestPath });
  assert.deepEqual(out.written, []);
  assert.deepEqual(readFileSync(join(dir, 'alpha.png')), before);
  const forced = await renderPngs({ scenes: { alpha: scene() }, pngDir: dir, manifestPath, force: true });
  assert.deepEqual(forced.written, ['alpha.png']);
  assert.deepEqual(readFileSync(join(dir, 'alpha.png')), before);
}));

test('rendering throws on a scene with no measurable drawing', withDir(async (dir, manifestPath) => {
  await assert.rejects(
    () => renderPngs({ scenes: { empty: scene({ build: () => [] }) }, pngDir: dir, manifestPath }),
    /empty/,
  );
  assert.deepEqual(readdirSync(dir), []);
}));

test('renderPngs --check reports an orphan png', withDir(async (dir, manifestPath) => {
  await renderPngs({ scenes: { alpha: scene() }, pngDir: dir, manifestPath });
  const out = await renderPngs({ scenes: {}, pngDir: dir, manifestPath, check: true });
  assert.equal(out.ok, false);
  assert.match(out.problems.join('\n'), /alpha\.png: no matching scene/);
  assert.equal(existsSync(join(dir, 'alpha.png')), true);
}));

test('an emptied registry does not wipe the committed pngs', withDir(async (dir, manifestPath) => {
  await renderPngs({ scenes: { alpha: scene() }, pngDir: dir, manifestPath });
  const out = await renderPngs({ scenes: {}, pngDir: dir, manifestPath });
  assert.equal(out.ok, false);
  assert.match(out.problems.join('\n'), /registry is empty/);
  assert.equal(existsSync(join(dir, 'alpha.png')), true);
}));

test('a png whose scene is gone is deleted and dropped from the manifest', withDir(async (dir, manifestPath) => {
  await renderPngs({ scenes: { alpha: scene(), beta: scene() }, pngDir: dir, manifestPath });
  const out = await renderPngs({ scenes: { alpha: scene() }, pngDir: dir, manifestPath });
  assert.deepEqual(out.removed, ['beta.png']);
  assert.equal(existsSync(join(dir, 'beta.png')), false);
  assert.deepEqual(Object.keys(JSON.parse(readFileSync(manifestPath, 'utf8')).scenes), ['alpha']);
}));

test('a manifest entry whose png already went by hand is pruned', withDir(async (dir, manifestPath) => {
  await renderPngs({ scenes: { alpha: scene() }, pngDir: dir, manifestPath });
  const have = JSON.parse(readFileSync(manifestPath, 'utf8'));
  writeFileSync(manifestPath, JSON.stringify({ ...have, scenes: { ...have.scenes, ghost: 'ggg' } }));
  const out = await renderPngs({ scenes: { alpha: scene() }, pngDir: dir, manifestPath });
  // Nothing to render and no file to delete, but the entry still has to go, or
  // --check reports an orphan that no run can ever clear.
  assert.deepEqual(out.written, []);
  assert.deepEqual(out.removed, []);
  assert.deepEqual(Object.keys(JSON.parse(readFileSync(manifestPath, 'utf8')).scenes), ['alpha']);
}));
