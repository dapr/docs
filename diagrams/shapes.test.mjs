import test from 'node:test';
import assert from 'node:assert/strict';
import { serialize, C, APP } from './engine.mjs';
import * as S from './shapes.mjs';

const find = (node, pred, out = []) => {
  if (node && node.tag) {
    if (pred(node)) out.push(node);
    node.children.forEach((c) => find(c, pred, out));
  }
  return out;
};
const byClass = (node, cls) => find(node, (x) => x.attrs.class === cls);
const polyPts = (g) => find(g, (x) => x.tag === 'polygon')[0].attrs.points.split(' ').map((p) => p.split(',').map(Number));
const mid = (vals) => (Math.min(...vals) + Math.max(...vals)) / 2;

// One of each builder with default-ish arguments.
const samples = () => ({
  group: S.group([S.panel({ x: 0, y: 0, w: 10, h: 10 })]),
  label: S.label({ x: 50, y: 50, text: 'a\nb', halo: true }),
  hex: S.hex({ x: 100, y: 100 }),
  badge: S.badge({ x: 10, y: 10 }),
  daprApp: S.daprApp({ x: 100, y: 100 }),
  daprAppLeft: S.daprApp({ x: 100, y: 100, badgeLeft: true }),
  box: S.box({ x: 100, y: 100, label: 'Activity' }),
  node: S.node({ x: 100, y: 100, label: 'Start' }),
  cylinder: S.cylinder({ x: 100, top: 80, bottom: 120, label: 'DB' }),
  envelope: S.envelope({ x: 100, y: 100, label: 'Msg' }),
  broker: S.broker({ x: 100, y: 100, label: 'Broker' }),
  lockBox: S.lockBox({ x: 100, y: 100, label: 'Secrets' }),
  person: S.person({ x: 100, y: 100, label: 'User' }),
  secureLock: S.secureLock({ x: 100, y: 100, label: 'mTLS' }),
  panel: S.panel({ x: 10, y: 10, w: 100, h: 80 }),
  pill: S.pill({ x: 100, y: 100, w: 80, text: 'Caption' }),
  pillFilled: S.pill({ x: 100, y: 100, w: 80, text: 'Caption', filled: true }),
  tile: S.tile({ x: 100, y: 100, label: 'State\nstore', tag: 'alpha', icon: S.badge({ x: 100, y: 85 }) }),
  tileInline: S.tile({ x: 100, y: 100, w: 150, h: 40, inline: true, label: 'Jobs', icon: (cx, cy) => S.badge({ x: cx, y: cy, r: 8 }) }),
  arrow: S.arrow({ from: [0, 0], to: [50, 0] }),
});

test('hex draws a pointy-top hexagon with 6 points at radius r', () => {
  const g = S.hex({ x: 100, y: 200, r: 40 });
  const pts = polyPts(g);
  assert.equal(pts.length, 6);
  for (const [px, py] of pts) assert.ok(Math.abs(Math.hypot(px - 100, py - 200) - 40) < 0.02);
  assert.deepEqual(pts[0], [100, 160]); // top vertex: pointy-top
  const [poly] = find(g, (x) => x.tag === 'polygon');
  assert.equal(poly.attrs['fill-opacity'], 0.6);
  assert.equal(poly.attrs['stroke-width'], 2.2);
});

test('hex defaults to APP[0] colours and a label of a third of r, never under 11', () => {
  const g = S.hex({ x: 0, y: 0 });
  const [t] = find(g, (x) => x.tag === 'text');
  assert.equal(find(g, (x) => x.tag === 'polygon')[0].attrs.stroke, APP[0].stroke);
  assert.equal(+t.attrs['font-size'], 14.17);
  assert.equal(+find(S.hex({ x: 0, y: 0, r: 32 }), (x) => x.tag === 'text')[0].attrs['font-size'], 11);
  assert.ok(Math.abs(Math.hypot(polyPts(g)[0][0], polyPts(g)[0][1]) - 42.5) < 0.02);
});

test('daprApp docks the badge bottom-right by default, bottom-left with badgeLeft', () => {
  const badgePts = (g) => polyPts(byClass(g, 'd-badge')[0]);
  const right = badgePts(S.daprApp({ x: 100, y: 100 }));
  const left = badgePts(S.daprApp({ x: 100, y: 100, badgeLeft: true }));
  assert.ok(mid(right.map((p) => p[0])) > 100);
  assert.ok(mid(left.map((p) => p[0])) < 100);
  assert.ok(mid(right.map((p) => p[1])) > 100); // below centre
});

test('label splits on \\n into two tspans', () => {
  const t = S.label({ x: 10, y: 20, text: 'one\ntwo' });
  const spans = find(t, (x) => x.tag === 'tspan');
  assert.equal(spans.length, 2);
  assert.equal(spans[0].children[0].content, 'one');
  assert.equal(spans[1].children[0].content, 'two');
  assert.equal(spans[1].attrs.x, '10');
  assert.equal(find(S.label({ x: 0, y: 0, text: 'solo' }), (x) => x.tag === 'tspan').length, 0);
});

test('label with halo:true emits a stroked copy beneath the fill', () => {
  const g = S.label({ x: 0, y: 0, text: 'Resiliency', halo: true });
  const [under, over] = find(g, (x) => x.tag === 'text');
  assert.equal(under.attrs.stroke, C.bg);
  assert.equal(under.attrs['aria-hidden'], 'true');
  assert.equal(over.attrs.stroke, undefined);
  assert.equal(over.attrs.fill, C.body);
  assert.equal(find(S.label({ x: 0, y: 0, text: 'x' }), (x) => x.attrs.stroke).length, 0);
});

test('label defaults to 11px / 600 / body, refuses under 11px and teal or mint text', () => {
  assert.throws(() => S.label({ x: 0, y: 0, text: 'x', size: 10 }), RangeError);
  assert.throws(() => S.label({ x: 0, y: 0, text: 'x', color: C.teal }));
  assert.throws(() => S.label({ x: 0, y: 0, text: 'x', color: C.mint }));
  const t = S.label({ x: 0, y: 0, text: 'x' });
  assert.equal(t.attrs['font-size'], 11);
  assert.equal(t.attrs['font-weight'], 600);
  assert.equal(t.attrs.fill, C.body);
});

test('filled pill and tile refuse teal and mint', () => {
  assert.throws(() => S.pill({ x: 0, y: 0, w: 50, text: 'a', filled: true, color: C.teal }));
  assert.throws(() => S.tile({ x: 0, y: 0, label: 'a', filled: true, color: C.mint }));
  assert.doesNotThrow(() => S.pill({ x: 0, y: 0, w: 50, text: 'a', filled: true }));
});

test('arrow stops at the shape edge, not the centre', () => {
  const a = { x: 100, y: 100, r: 42.5, hex: true };
  const b = { x: 300, y: 100, w: 60, h: 30 };
  const [line] = find(S.arrow({ from: a, to: b }), (x) => x.tag === 'line');
  const x1 = +line.attrs.x1;
  const x2 = +line.attrs.x2;
  assert.ok(x1 >= 100 + 42.5 * Math.cos(Math.PI / 6) && x1 < 100 + 42.5 + 0.01, `x1=${x1}`);
  assert.ok(x2 <= 300 - 30 && x2 > 300 - 33, `x2=${x2}`);
  const circ = find(S.arrow({ from: { x: 0, y: 0, r: 20 }, to: { x: 100, y: 0, r: 20 }, gap: 0 }), (x) => x.tag === 'line')[0];
  assert.equal(circ.attrs.x1, '20');
  assert.equal(circ.attrs.x2, '80');
});

test('arrow hex edge toward a vertex reaches r, toward a flat side reaches r*cos30', () => {
  const h = { x: 0, y: 0, r: 40, hex: true };
  const down = find(S.arrow({ from: h, to: [0, 200], gap: 0 }), (x) => x.tag === 'line')[0];
  assert.equal(+down.attrs.y1, 40);
  const side = find(S.arrow({ from: h, to: [200, 0], gap: 0 }), (x) => x.tag === 'line')[0];
  assert.equal(+side.attrs.x1, +(40 * Math.cos(Math.PI / 6)).toFixed(2));
});

test('arrow has a 2px stroke, an open 8px head, and head:false omits it', () => {
  const g = S.arrow({ from: [0, 0], to: [100, 0] });
  const [line] = find(g, (x) => x.tag === 'line');
  const [head] = find(g, (x) => x.tag === 'polyline');
  assert.equal(line.attrs['stroke-width'], 2);
  assert.equal(head.attrs.fill, 'none');
  const [w1, tip, w2] = head.attrs.points.split(' ').map((p) => p.split(',').map(Number));
  assert.deepEqual(tip, [100, 0]);
  assert.ok(Math.abs(Math.hypot(w1[0] - 100, w1[1]) - 8) < 0.02);
  assert.ok(Math.abs(Math.hypot(w2[0] - 100, w2[1]) - 8) < 0.02);
  assert.equal(find(S.arrow({ from: [0, 0], to: [100, 0], head: false }), (x) => x.tag === 'polyline').length, 0);
  assert.equal(line.attrs.stroke, C.navy);
});

test('arrow throws when shapes leave no room', () => {
  assert.throws(() => S.arrow({ from: { x: 0, y: 0, r: 30 }, to: { x: 50, y: 0, r: 30 } }));
});

test('cylinder draws its hidden back rim faint and dashed', () => {
  const g = S.cylinder({ x: 100, top: 80, bottom: 120 });
  const dashed = find(g, (x) => x.attrs['stroke-dasharray']);
  assert.equal(dashed.length, 1);
  assert.ok(dashed[0].attrs['stroke-opacity'] < 0.5);
  const [e] = find(g, (x) => x.tag === 'ellipse');
  assert.equal(e.attrs.rx, 24);
  assert.equal(e.attrs.ry, 8);
});

test('panel is dashed, rounded r=10, unfilled; box defaults to 194x30', () => {
  const p = S.panel({ x: 1, y: 2, w: 3, h: 4 });
  assert.equal(p.attrs.rx, 10);
  assert.equal(p.attrs.fill, 'none');
  assert.ok(p.attrs['stroke-dasharray']);
  const [r] = find(S.box({ x: 0, y: 0 }), (x) => x.tag === 'rect');
  assert.equal(r.attrs.width, 194);
  assert.equal(r.attrs.height, 30);
});

test('outlines are 2.2px and tints 0.6 across shapes', () => {
  for (const k of ['hex', 'box', 'node', 'cylinder', 'envelope', 'broker', 'lockBox', 'person', 'secureLock', 'panel']) {
    const strokes = find(samples()[k], (x) => x.attrs['stroke-width'] !== undefined && x.attrs['stroke-width'] !== 4 && x.attrs.stroke !== 'none');
    assert.ok(strokes.length > 0, k);
    for (const s of strokes) assert.equal(s.attrs['stroke-width'], 2.2, k);
    for (const f of find(samples()[k], (x) => x.attrs['fill-opacity'] !== undefined)) assert.equal(f.attrs['fill-opacity'], 0.6, k);
  }
});

test('every builder emits only var(--d-*) colors', () => {
  for (const [name, node] of Object.entries(samples())) {
    const s = serialize(node);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(s), `${name} contains a hex literal`);
    assert.ok(!/\b(rgb|hsl)a?\(/.test(s), `${name} contains a functional colour`);
    for (const m of s.matchAll(/\b(?:fill|stroke)="([^"]*)"/g)) {
      assert.ok(m[1] === 'none' || /^var\(--d-[a-z-]+\)$/.test(m[1]), `${name}: ${m[1]}`);
    }
  }
});

test('no text is teal or mint in any default builder output', () => {
  for (const [name, node] of Object.entries(samples())) {
    for (const t of find(node, (x) => x.tag === 'text')) {
      assert.ok(t.attrs.fill !== C.teal && t.attrs.fill !== C.mint, name);
    }
  }
});

test('every label is at least 11px', () => {
  for (const [name, node] of Object.entries(samples())) {
    for (const t of find(node, (x) => x.tag === 'text')) assert.ok(+t.attrs['font-size'] >= 11, name);
  }
});

test('no builder emits a font-family', () => {
  for (const [name, node] of Object.entries(samples())) {
    assert.ok(!/font-family/.test(serialize(node)), name);
  }
});

test('builders are pure: identical input gives byte-identical output, whatever ran between', () => {
  const a = Object.values(samples()).map(serialize);
  S.hex({ x: 1, y: 2 });
  S.arrow({ from: [0, 0], to: [9, 9] });
  const b = Object.values(samples()).map(serialize);
  assert.deepEqual(a, b);
});

test('builders accept frozen arguments', () => {
  const o = Object.freeze({ x: 10, y: 10, r: 40 });
  assert.doesNotThrow(() => S.hex(o));
  assert.doesNotThrow(() => S.daprApp(o));
});
