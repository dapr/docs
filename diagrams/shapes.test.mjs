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
  // Every outline in the set takes the one line weight, so a hexagon's border
  // matches the card beside it rather than being derived from its own size.
  assert.equal(poly.attrs['stroke-width'], S.lineWidth());
});

test('the first app is the Dapr green: solid fill, dark outline, dark name', () => {
  const g = S.hex({ x: 0, y: 0, label: 'App', ...APP[0] });
  const poly = find(g, (x) => x.tag === 'polygon')[0];
  assert.equal(poly.attrs.fill, C.green);
  // Solid, not tinted: at 0.6 over the dark ground the green darkens enough
  // that dark ink on it falls under 4.5:1.
  assert.equal(poly.attrs['fill-opacity'], undefined);
  assert.equal(poly.attrs.stroke, C.appInk);
  assert.equal(find(g, (x) => x.tag === 'text')[0].attrs.fill, C.appInk);
});

test('the apps after the first keep the tinted palette and body ink', () => {
  for (const i of [1, 2, 3]) {
    const g = S.hex({ x: 0, y: 0, label: 'App', ...APP[i] });
    const poly = find(g, (x) => x.tag === 'polygon')[0];
    assert.equal(poly.attrs['fill-opacity'], S.FILL_OPACITY, `APP[${i}] is tinted`);
    assert.equal(find(g, (x) => x.tag === 'text')[0].attrs.fill, C.body, `APP[${i}] takes body ink`);
  }
});

test('hex defaults to APP[0] colours and a label of a third of r, never under the floor', () => {
  const g = S.hex({ x: 0, y: 0 });
  const [t] = find(g, (x) => x.tag === 'text');
  assert.equal(find(g, (x) => x.tag === 'polygon')[0].attrs.stroke, APP[0].stroke);
  assert.equal(+t.attrs['font-size'], 14.17);
  // A third of r while that clears the floor, and the floor below it.
  assert.equal(+find(S.hex({ x: 0, y: 0, r: 36 }), (x) => x.tag === 'text')[0].attrs['font-size'], 12);
  assert.equal(+find(S.hex({ x: 0, y: 0, r: 24 }), (x) => x.tag === 'text')[0].attrs['font-size'], S.MIN_LABEL);
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
  assert.throws(() => S.label({ x: 0, y: 0, text: 'x', size: 9 }), RangeError);
  assert.throws(() => S.label({ x: 0, y: 0, text: 'x', color: C.teal }));
  assert.throws(() => S.label({ x: 0, y: 0, text: 'x', color: C.mint }));
  const t = S.label({ x: 0, y: 0, text: 'x' });
  assert.equal(t.attrs['font-size'], 11);
  assert.equal(t.attrs['font-weight'], 600);
  assert.equal(t.attrs.fill, C.body);
});

test('lineWidth() holds one RENDERED thickness whatever the canvas is', () => {
  // The svg fills the content column, so a stroke of n units renders at
  // n * column / canvasWidth. A single constant therefore renders thinner on a
  // wide canvas than a narrow one; the width has to come from the canvas.
  const at = (w) => { S.setCanvasWidth(w); return S.lineWidth(); };
  const rendered = (w) => +((at(w) * S.LINE_COLUMN) / w).toFixed(2);
  assert.equal(rendered(1512), S.LINE_TARGET);
  assert.equal(rendered(740), S.LINE_TARGET);
  assert.ok(at(1512) > at(740), 'a wider canvas needs a heavier stroke to render the same');
  S.setCanvasWidth(null);
});

test('roundedPath() turns each corner with an arc, not a mitre', () => {
  const node = S.roundedPath({ points: [[0, 100], [0, 0], [200, 0]], r: 10 });
  // Straight up to 10 short of the corner, round it, then run on.
  assert.equal(node.attrs.d, 'M0,100 L0,10 Q0,0 10,0 L200,0');
  assert.equal(node.attrs.fill, 'none');
});

test('roundedPath() never rounds more than half a leg', () => {
  // The vertical leg is only 12 long, so a radius of 40 would overshoot past
  // the previous point and fold the line back on itself.
  const node = S.roundedPath({ points: [[0, 12], [0, 0], [200, 0]], r: 40 });
  assert.equal(node.attrs.d, 'M0,12 L0,6 Q0,0 6,0 L200,0');
});

test('region() captions a dashed area with a pill in the SAME colour', () => {
  const node = S.region({ x: 10, y: 20, w: 300, h: 200, stroke: C.blue, caption: 'Pod', captionW: 56 });
  const dashed = find(node, (n) => n.attrs?.class === 'd-panel')[0];
  const pillRect = find(node, (n) => n.attrs?.class === 'd-pill')[0];
  assert.equal(dashed.attrs.stroke, C.blue);
  assert.equal(find(pillRect, (n) => n.tag === 'rect')[0].attrs.stroke, C.blue, 'the pill borrows the region`s colour');
  // The caption is ordinary ink, not the region's colour: it is a name, not a
  // part of the border.
  assert.equal(find(pillRect, (n) => n.tag === 'text')[0].attrs.fill, C.body);
});

test('region() without a caption is just the dashed area', () => {
  const node = S.region({ x: 0, y: 0, w: 100, h: 100, stroke: C.navy });
  assert.equal(find(node, (n) => n.attrs?.class === 'd-pill').length, 0);
});

test('lollipop() is a hollow ball on a stalk back to what provides it', () => {
  const node = S.lollipop({ x: 100, y: 50, to: 200 });
  const line = find(node, (n) => n.tag === 'line')[0];
  assert.equal(+line.attrs.x1, 100, 'the stalk starts at the ball');
  assert.equal(+line.attrs.x2, 200, 'and ends on the provider');
  assert.equal(+line.attrs.y1, 50);
  const ball = find(node, (n) => n.tag === 'circle')[0];
  assert.equal(+ball.attrs.cx, 100);
  assert.equal(ball.attrs.fill, C.bg, 'hollow, as UML draws a lollipop');
  assert.equal(+ball.attrs.r, S.BALL_R);
});

test('lollipop() elbows when what provides it is not level with the ball', () => {
  const node = S.lollipop({ x: 100, y: 50, to: 400, toY: 200, elbowX: 250, elbowR: 20 });
  assert.equal(find(node, (n) => n.tag === 'line').length, 0, 'an elbow is one run, not three lines');
  assert.equal(find(node, (n) => n.tag === 'polyline').length, 0, 'and it turns with an arc, not a mitre');
  const run = find(node, (n) => n.tag === 'path')[0];
  assert.equal(run.attrs.d, 'M100,50 L230,50 Q250,50 250,70 L250,180 Q250,200 270,200 L400,200');
  assert.equal(run.attrs.fill, 'none');
  // The ball still sits at the end the interface is named from.
  assert.equal(+find(node, (n) => n.tag === 'circle')[0].attrs.cy, 50);
});

test('an elbow without a turn to make is refused rather than drawn flat', () => {
  assert.throws(() => S.lollipop({ x: 0, y: 0, to: 100, toY: 50 }), /needs elbowX/);
});

test('socket() cups the ball from the consumer`s side', () => {
  const node = S.socket({ x: 100, y: 50, from: 20 });
  const arc = find(node, (n) => n.tag === 'path')[0];
  // Opens towards the provider: it runs from the ball's top to its bottom the
  // long way round, through the point nearest the consumer.
  assert.match(arc.attrs.d, /^M100,29 A21,21 0 0 0 100,71$/);
  assert.equal(arc.attrs.fill, 'none');
  const line = find(node, (n) => n.tag === 'line')[0];
  assert.equal(+line.attrs.x1, 20, 'the stalk starts at the consumer');
  assert.equal(+line.attrs.x2, 79, 'and ends on the arc, not on the ball');
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
  const [r] = find(S.box({ x: 0, y: 0, label: 'A' }), (x) => x.tag === 'rect');
  assert.equal(r.attrs.width, 194);
  assert.equal(r.attrs.height, 30);
});

test('every outline takes the one line weight, and tints are 0.6', () => {
  for (const k of ['hex', 'box', 'node', 'cylinder', 'envelope', 'broker', 'lockBox', 'person', 'secureLock', 'panel']) {
    const strokes = find(samples()[k], (x) => x.attrs['stroke-width'] !== undefined && x.attrs['stroke-width'] !== 4 && x.attrs.stroke !== 'none');
    assert.ok(strokes.length > 0, k);
    for (const s of strokes) assert.equal(s.attrs['stroke-width'], S.lineWidth(), k);
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

test('teal and mint arrows always throw; panel takes teal but never mint', () => {
  for (const c of [C.teal, C.mint]) {
    assert.throws(() => S.arrow({ from: [0, 0], to: [50, 0], color: c }));
  }
  // A dashed grouping border is decorative and its contents are each labelled,
  // so panel() is the one exception to the teal rule, matching how dapr.io's
  // `apis` scene bands its three groups. Mint stays out: 1.41:1 is not a line.
  assert.match(
    serialize(S.panel({ x: 0, y: 0, w: 5, h: 5, stroke: C.teal })),
    /stroke="var\(--d-teal\)"/,
  );
  assert.throws(() => S.panel({ x: 0, y: 0, w: 5, h: 5, stroke: C.mint }), /mint/);
});

test('teal and mint outlines throw without a label, including an empty one', () => {
  const at = { x: 50, y: 50 };
  for (const c of [C.teal, C.mint]) {
    const builders = {
      hex: (label) => S.hex({ ...at, stroke: c, label }),
      box: (label) => S.box({ ...at, stroke: c, label }),
      node: (label) => S.node({ ...at, stroke: c, label }),
      cylinder: (label) => S.cylinder({ x: 50, top: 40, bottom: 80, stroke: c, label }),
      envelope: (label) => S.envelope({ ...at, color: c, label }),
      broker: (label) => S.broker({ ...at, stroke: c, label }),
      lockBox: (label) => S.lockBox({ ...at, stroke: c, label }),
      person: (label) => S.person({ ...at, stroke: c, label }),
      secureLock: (label) => S.secureLock({ ...at, stroke: c, label }),
      tile: (label) => S.tile({ ...at, color: c, label }),
    };
    for (const [name, b] of Object.entries(builders)) {
      assert.throws(() => b(''), undefined, `${name} empty label`);
      if (name !== 'hex') assert.throws(() => b(undefined), undefined, `${name} no label`); // hex defaults to 'App'
      assert.doesNotThrow(() => b('Named'), `${name} labelled`);
    }
  }
});

test('hex with the teal app colour needs a name; empty string counts as none', () => {
  // Teal is APP[3] now that the green app leads the palette.
  assert.throws(() => S.hex({ x: 0, y: 0, stroke: APP[3].stroke, label: '' }));
  assert.doesNotThrow(() => S.hex({ x: 0, y: 0, stroke: APP[3].stroke }));
  assert.doesNotThrow(() => S.hex({ x: 0, y: 0, stroke: APP[0].stroke, label: '' }));
});

test('arrow throws on an unrecognised or incomplete descriptor', () => {
  const ok = { x: 200, y: 0, r: 10 };
  const bads = [{ x: 0, y: 0, radius: 20 }, { x: 0, y: 0 }, { x: 0, y: 0, w: 20 }, { x: 0, y: 0, h: 20 }, { y: 0, r: 5 }, { x: 0, y: 0, r: NaN }, [0], null];
  for (const bad of bads) {
    assert.throws(() => S.arrow({ from: bad, to: ok }), undefined, JSON.stringify(bad));
    assert.throws(() => S.arrow({ from: ok, to: bad }), undefined, JSON.stringify(bad));
  }
});

test('the hex arrow descriptor agrees with the polygon hex() draws for the same r', () => {
  const r = 37;
  const cx = 120;
  const cy = 90;
  const drawn = polyPts(S.hex({ x: cx, y: cy, r }));
  const desc = { x: cx, y: cy, r, hex: true };
  const line = (to) => find(S.arrow({ from: desc, to, gap: 0 }), (x) => x.tag === 'line')[0].attrs;
  // straight down hits the bottom vertex, straight right hits the flat right side
  assert.equal(+line([cx, cy + 300]).y1, drawn[3][1]);
  assert.equal(+line([cx + 300, cy]).x1, drawn[1][0]);
  assert.equal(+line([cx, cy - 300]).y1, drawn[0][1]);
  assert.equal(+line([cx - 300, cy]).x1, drawn[4][0]);
});

test('the app green is a fill, not an ink', () => {
  // It is the lightest colour in the set. Dark ink goes ON it (C.appInk);
  // setting type IN it gives 1.63:1 on the light ground.
  assert.throws(() => S.label({ x: 0, y: 0, text: 'App', color: C.green }), /green/);
});
