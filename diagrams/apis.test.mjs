import test from 'node:test';
import assert from 'node:assert/strict';
import { C } from './engine.mjs';
import { APIS, CROSS_CUTTING, INLINE_LABEL, TILE_GLYPH, TILE_LABEL, TILE_W, api, apiTile } from './apis.mjs';

const find = (node, pred, out = []) => {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) { for (const k of node) find(k, pred, out); return out; }
  if (pred(node)) out.push(node);
  for (const k of node.children ?? []) find(k, pred, out);
  return out;
};

test('the catalogue is the website set: sixteen APIs and three cross-cutting', () => {
  assert.equal(APIS.length, 16);
  assert.equal(CROSS_CUTTING.length, 3);
  assert.deepEqual(APIS.slice(0, 3).map((a) => a.key), ['workflows', 'pubsub', 'service-invocation']);
  assert.deepEqual(CROSS_CUTTING.map((a) => a.key), ['observability', 'security', 'resiliency']);
});

test('every entry carries a key, a mark, a name and a wrapped name', () => {
  for (const a of [...APIS, ...CROSS_CUTTING]) {
    assert.match(a.key, /^[a-z0-9]+(-[a-z0-9]+)*$/, a.key);
    assert.match(a.mark, /^[a-z0-9]+(-[a-z0-9]+)*$/, a.key);
    assert.ok(a.name.length > 0, a.key);
    assert.ok(!a.name.includes('\n'), `${a.key}: name is the one-line form`);
    // The wrapped form is the same words, so a tile and a table cannot disagree
    // about what an API is called.
    assert.equal(a.wrap.replace(/\n/g, ' '), a.name, a.key);
  }
});

test('keys are unique, and the alpha set is tagged', () => {
  const keys = [...APIS, ...CROSS_CUTTING].map((a) => a.key);
  assert.equal(new Set(keys).size, keys.length);
  const alpha = APIS.filter((a) => a.tag === 'alpha').map((a) => a.key);
  assert.deepEqual(alpha, ['cryptography', 'distributed-lock', 'conversation', 'binary-store', 'search', 'vector']);
});

test('api() looks one up and refuses a name that is not in the catalogue', () => {
  assert.equal(api('secrets').name, 'Secrets');
  assert.equal(api('observability').name, 'Observability');
  assert.throws(() => api('Secrets'), /not in the API catalogue/);
  assert.throws(() => api('state-store'), /not in the API catalogue/);
});

test('apiTile() draws the block: the right mark, the name, and blue', () => {
  const node = apiTile({ key: 'pubsub', x: 100, y: 100, w: 99, h: 99 });
  const rect = find(node, (n) => n.tag === 'rect')[0];
  assert.equal(rect.attrs.stroke, C.blue);
  assert.equal(rect.attrs.rx, 10);
  const mark = find(node, (n) => n.attrs?.['data-mark'])[0];
  assert.equal(mark.attrs['data-mark'], 'fluent-mail-copy');
  const texts = find(node, (n) => n.tag === 'text');
  assert.ok(texts.some((t) => find(t, (x) => x.content === 'Publish & subscribe').length > 0));
});

test('apiTile() wraps the name only when asked, and carries the alpha tag', () => {
  const wrapped = apiTile({ key: 'pubsub', x: 0, y: 0, w: 99, h: 99, wrap: true });
  assert.ok(find(wrapped, (n) => n.tag === 'tspan').length >= 2);
  // The tag comes from the catalogue, so no scene can ship an untagged alpha API.
  const crypto = apiTile({ key: 'cryptography', x: 0, y: 0, w: 99, h: 99 });
  assert.ok(find(crypto, (n) => n.content === 'alpha').length > 0);
});

test('a filled block takes the tile ink for its mark, not blue on blue', () => {
  const node = apiTile({ key: 'observability', x: 0, y: 0, w: 160, h: 76, filled: true, inline: true });
  const mark = find(node, (n) => n.attrs?.['data-mark'])[0];
  assert.equal(mark.attrs.fill, C.bg);
});

test('a block scales from its width: the glyph follows, it is not passed too', () => {
  const markOf = (w) => {
    const n = apiTile({ key: 'secrets', x: 0, y: 0, w, h: w });
    const g = find(n, (x) => x.attrs?.['data-mark'])[0];
    return +g.attrs.transform.match(/scale\(([0-9.]+)\)/)[1];
  };
  // Twice the card is twice the glyph, so a small block and a large one are
  // the same drawing at two sizes. Scaled UP, because scaling this one down by
  // half would take its name under the legibility floor and be refused.
  assert.ok(Math.abs(markOf(TILE_W * 2) / markOf(TILE_W) - 2) < 0.01);
  // And the reference card still draws the glyph it always drew.
  assert.equal(+(TILE_W * TILE_GLYPH).toFixed(2), 44);
});

test('the name scales with the card too: a smaller block is not a smaller box with the same type', () => {
  const sizeOf = (o) => +find(apiTile({ key: 'secrets', x: 0, y: 0, ...o }), (x) => x.tag === 'text')[0].attrs['font-size'];
  assert.equal(sizeOf({ w: TILE_W, h: TILE_W }), 14);
  assert.equal(sizeOf({ w: TILE_W * 2, h: TILE_W * 2 }), +(TILE_W * 2 * TILE_LABEL).toFixed(2));
  // The inline block carries its name BESIDE the mark, so it is its own form
  // with its own ratio: 160 by 76 has always set its name at 14.
  assert.equal(sizeOf({ w: 160, h: 76, inline: true }), +(76 * INLINE_LABEL).toFixed(2));
});

test('a block too small to carry a legible name is refused, not shrunk silently', () => {
  assert.throws(() => apiTile({ key: 'secrets', x: 0, y: 0, w: 60, h: 60 }), /below the 10px floor/);
});
