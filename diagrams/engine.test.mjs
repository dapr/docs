import test from 'node:test';
import assert from 'node:assert/strict';
import { el, text, serialize, svg, C, APP } from './engine.mjs';

test('serialize escapes & < > in text content', () => {
  assert.equal(serialize(el('text', {}, ['A & B'])), '<text>A &amp; B</text>');
  assert.equal(serialize(text('<x>')), '&lt;x&gt;');
});

test('serialize escapes " and & in attribute values', () => {
  assert.equal(serialize(el('g', { 'data-x': 'a"b&c' })), '<g data-x="a&quot;b&amp;c"/>');
});

test('serialize emits attributes in insertion order', () => {
  assert.equal(serialize(el('rect', { z: 1, a: 2, m: 3 })), '<rect z="1" a="2" m="3"/>');
  const s = () => svg({ width: 10, height: 5, title: 'T', desc: 'D' });
  assert.equal(s(), s());
});

test('svg() sets role=img and aria-labelledby matching the title and desc ids', () => {
  const out = svg({ width: 100, height: 50, title: 'Publish & Subscribe', desc: 'Two apps', children: [el('rect')] });
  const tid = /<title id="([^"]+)">Publish &amp; Subscribe<\/title>/.exec(out)?.[1];
  const did = /<desc id="([^"]+)">Two apps<\/desc>/.exec(out)?.[1];
  assert.ok(tid && did && tid !== did);
  assert.match(out, /role="img"/);
  assert.match(out, new RegExp(`aria-labelledby="${tid} ${did}"`));
  assert.match(out, /viewBox="0 0 100 50"/);
  assert.match(tid, /^publish-subscribe-[0-9a-f]{6}-title$/);
  assert.throws(() => svg({ width: 1, height: 1, title: 'T' }));
  assert.throws(() => svg({ width: 1, height: 1, desc: 'D' }));
});

test('C exposes only var(--d-*) strings, never a hex literal', () => {
  for (const v of Object.values(C)) assert.match(v, /^var\(--d-[a-z-]+\)$/);
  assert.equal(C.navy, 'var(--d-blue)');
  assert.ok(Object.isFrozen(C));
});

test('APP leads with the green app, then sky, blue, teal in order', () => {
  assert.ok(Object.isFrozen(APP));
  assert.deepEqual(APP.map((a) => a.stroke),
    ['var(--d-app-ink)', 'var(--d-sky)', 'var(--d-blue)', 'var(--d-teal)']);
  // The first is solid Dapr green with its own ink; the rest are tints.
  assert.deepEqual(APP[0], { stroke: 'var(--d-app-ink)', fill: 'var(--d-green)', ink: 'var(--d-app-ink)', solid: true });
  for (const a of APP.slice(1)) {
    assert.match(a.fill, /^var\(--d-[a-z-]+-fill\)$/);
    assert.equal(a.solid, false);
    assert.equal(a.ink, 'var(--d-body)');
  }
});

const ids = (o) => [...o.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
const mk = (title, extra = {}) => svg({ width: 1, height: 1, title, desc: 'D', ...extra });

test('titles that slug alike produce different ids', () => {
  const a = ids(mk('Pub/Sub'));
  const b = ids(mk('Pub Sub'));
  assert.equal(a.length, 2);
  for (const i of a) assert.ok(!b.includes(i));
});

test('explicit id disambiguates identical title and desc', () => {
  const a = ids(mk('Same', { id: 'one' }));
  const b = ids(mk('Same', { id: 'two' }));
  assert.deepEqual(a, ['one-title', 'one-desc']);
  for (const i of a) assert.ok(!b.includes(i));
});

test('ids are valid NCNames even when the title starts with a digit or symbol', () => {
  for (const t of ['3 apps', '!!!', '--x', 'ünï']) {
    for (const i of ids(mk(t))) assert.match(i, /^[A-Za-z][A-Za-z0-9-]*$/);
  }
  assert.match(ids(mk('x', { id: '9lives' }))[0], /^d-9lives-title$/);
});

test('re-rendering the same scene is byte-identical regardless of prior renders', () => {
  const first = mk('Repeat');
  mk('Other'); mk('Another');
  assert.equal(mk('Repeat'), first);
});

test('default ids are pinned to an exact value (hash input must not change)', () => {
  assert.deepEqual(ids(mk('Pub/Sub')), ['pub-sub-b06c76-title', 'pub-sub-b06c76-desc']);
});

test('every app palette entry is complete, so spreading one cannot inherit another', () => {
  for (const [i, a] of APP.entries()) {
    for (const k of ['stroke', 'fill', 'ink', 'solid']) {
      assert.ok(k in a, `APP[${i}] is missing "${k}": spreading it lets a default stand in`);
    }
  }
});
