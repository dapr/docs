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
  assert.equal(tid, 'publish-subscribe-title');
  assert.throws(() => svg({ width: 1, height: 1, title: 'T' }));
  assert.throws(() => svg({ width: 1, height: 1, desc: 'D' }));
});

test('C exposes only var(--d-*) strings, never a hex literal', () => {
  for (const v of Object.values(C)) assert.match(v, /^var\(--d-[a-z-]+\)$/);
  assert.equal(C.navy, 'var(--d-blue)');
  assert.ok(Object.isFrozen(C));
});

test('APP has 4 entries in sky, blue, teal, orange order', () => {
  assert.ok(Object.isFrozen(APP));
  assert.deepEqual(APP.map((a) => a.stroke), ['var(--d-sky)', 'var(--d-blue)', 'var(--d-teal)', 'var(--d-orange)']);
  for (const a of APP) assert.match(a.fill, /^var\(--d-[a-z-]+-fill\)$/);
});
