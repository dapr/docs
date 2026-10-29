import test from 'node:test';
import assert from 'node:assert/strict';
import { APP, C } from './engine.mjs';
import { hexHalfWidth } from './shapes.mjs';
import { SIDECAR_CLEARANCE, SIDECAR_R, appSidecar, sidecarAt } from './app.mjs';

// The app hexagon's class picks up a modifier when it is drawn solid, so match
// on the class LIST rather than on the whole attribute.
const hasClass = (n, c) => (n.attrs?.class ?? '').split(' ').includes(c);

const find = (node, pred, out = []) => {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) { for (const k of node) find(k, pred, out); return out; }
  if (pred(node)) out.push(node);
  for (const k of node.children ?? []) find(k, pred, out);
  return out;
};

test('the sidecar`s left edge sits on the app hexagon`s centre', () => {
  const s = sidecarAt({ x: 100, y: 200, r: 60 });
  assert.equal(+(s.x - hexHalfWidth(s.r)).toFixed(1), 100);
  assert.equal(s.r, +(60 * SIDECAR_R).toFixed(2));
  assert.equal(s.hex, true);
});

test('the pair overlaps properly, clears the app for arrows, and keeps the name', () => {
  const r = 60;
  const s = sidecarAt({ x: 0, y: 0, r });
  // An arrow at the sidecar's height passes under the app's lowest point.
  assert.ok(s.y - r >= r * SIDECAR_CLEARANCE - 0.01, `centre ${s.y} should clear the app's bottom at ${r}`);
  // And the sidecar is still well inside the app hexagon, not hanging off it:
  // the overlap is what makes the two read as one object.
  assert.ok(s.y - s.r < r * 0.5, `the sidecar's top ${s.y - s.r} should be well inside the app`);
  assert.ok(s.y - s.r > Math.max(11, r / 3) * 0.5, 'the sidecar starts below the name');
});

test('everything scales from the app radius: one drawing at two sizes', () => {
  const a = sidecarAt({ x: 0, y: 0, r: 40 });
  const b = sidecarAt({ x: 0, y: 0, r: 80 });
  assert.equal(+(b.x / a.x).toFixed(3), 2);
  assert.equal(+(b.r / a.r).toFixed(3), 2);
});

test('appSidecar draws the app, its name and the Dapr hexagon', () => {
  const node = appSidecar({ x: 100, y: 100, r: 50, label: 'App A', ...APP[1] });
  // Count the two hexagons by their groups: the Dapr wordmark is itself made
  // of polygons, so counting <polygon> would count its insides too.
  const app = find(node, (n) => hasClass(n, 'd-hex'))[0];
  const side = find(node, (n) => hasClass(n, 'd-mark-hex'))[0];
  assert.ok(app && side, 'the app and the sidecar');
  assert.equal(find(app, (n) => n.tag === 'polygon')[0].attrs.stroke, APP[1].stroke, 'the app takes the colour it was given');
  assert.equal(find(side, (n) => n.tag === 'polygon')[0].attrs.stroke, C.blue, 'the sidecar is always the Dapr hexagon');
  assert.ok(find(node, (n) => n.content === 'App A').length > 0);
  assert.equal(find(node, (n) => n.attrs?.['data-mark'] === 'logo-blue').length, 1);
});

test('the drawn sidecar sits exactly where sidecarAt says it does', () => {
  const at = sidecarAt({ x: 100, y: 100, r: 50 });
  const node = appSidecar({ x: 100, y: 100, r: 50, label: 'App' });
  const poly = find(find(node, (n) => hasClass(n, 'd-mark-hex'))[0], (n) => n.tag === 'polygon')[0];
  const xs = poly.attrs.points.split(' ').map((p) => +p.split(',')[0]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  assert.ok(Math.abs(cx - at.x) < 0.5, `drawn centre ${cx} vs ${at.x}`);
});

test('a later app in the palette keeps its own fill and its own ink', () => {
  // Spreading a palette entry must carry EVERY property the pair draws with.
  // An entry that leaves one out lets appSidecar's own default - the first
  // app's - stand in, and the second app comes out green with dark ink on it,
  // which is the first app again under another name.
  const node = appSidecar({ x: 0, y: 0, r: 50, label: 'App B', ...APP[1] });
  const poly = find(find(node, (n) => hasClass(n, 'd-hex'))[0], (n) => n.tag === 'polygon')[0];
  assert.equal(poly.attrs['fill-opacity'], undefined, 'every app is solid');
  assert.equal(poly.attrs.fill, APP[1].fill, 'the SECOND fill, not the first');
  const name = find(node, (n) => n.tag === 'text' && find(n, (t) => t.content === 'App B').length)[0];
  assert.equal(name.attrs.fill, APP[1].ink, 'and the white that goes on it');
  assert.notEqual(APP[1].ink, APP[0].ink);
});
