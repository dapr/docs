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
// Everything a <text> says, tspans joined, for asserting on what a card reads.
const said = (t) => find(t, (x) => x.tag === 'tspan').length
  ? find(t, (x) => x.tag === 'tspan').map((x) => x.children[0].content).join('')
  : t.children.map((c) => c.content).join('');
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
  cylinder: S.cylinder({ x: 100, top: 90, bottom: 120, label: 'DB' }),
  envelope: S.envelope({ x: 100, y: 100, label: 'Msg' }),
  broker: S.broker({ x: 100, y: 100, label: 'Broker' }),
  lockBox: S.lockBox({ x: 100, y: 100, label: 'Secrets' }),
  secureLock: S.secureLock({ x: 100, y: 100, label: 'mTLS' }),
  panel: S.panel({ x: 10, y: 10, w: 100, h: 80 }),
  pill: S.pill({ x: 100, y: 100, w: 80, text: 'Caption' }),
  pillFilled: S.pill({ x: 100, y: 100, w: 80, text: 'Caption', filled: true }),
  tile: S.tile({ x: 100, y: 100, label: 'State\nstore', tag: 'alpha', icon: S.badge({ x: 100, y: 85 }) }),
  tileInline: S.tile({ x: 100, y: 100, w: 150, h: 40, inline: true, label: 'Jobs', icon: (cx, cy) => S.badge({ x: cx, y: cy, r: 8 }) }),
  arrow: S.arrow({ from: [0, 0], to: [50, 0] }),
  decision: S.decision({ x: 100, y: 100, label: 'Gate', ...APP[2] }),
});

test('a lollipop on a purely vertical stalk needs no elbowX and draws the stalk', () => {
  // The builder was written for a stalk leaving a vertical face sideways. A
  // flow diagram hangs the mark above a box instead, so the stalk runs
  // straight down. Before this, every point shared an x, the path collapsed to
  // zero length, and the scene rendered a bare ring with nothing joining it to
  // the shape - which no geometric test could see.
  const g = S.lollipop({ x: 100, y: 60, to: 100, toY: 100 });
  const [line] = find(g, (x) => x.tag === 'line');
  assert.ok(line, 'a vertical stalk is drawn as a line');
  assert.deepEqual(
    [line.attrs.x1, line.attrs.y1, line.attrs.x2, line.attrs.y2].map(Number),
    [100, 60, 100, 100],
  );
});

test('a lollipop that changes BOTH x and y still demands elbowX', () => {
  assert.throws(() => S.lollipop({ x: 100, y: 60, to: 160, toY: 100 }), /elbowX/);
});

test('decision draws a diamond centred on x, y', () => {
  const g = S.decision({ x: 100, y: 200, w: 90, h: 60, label: 'Gate' });
  const pts = polyPts(g);
  assert.equal(pts.length, 4);
  // top, right, bottom, left - in that order, so the points read as a path
  assert.deepEqual(pts, [[100, 170], [145, 200], [100, 230], [55, 200]]);
  assert.equal(mid(pts.map((p) => p[0])), 100);
  assert.equal(mid(pts.map((p) => p[1])), 200);
});

test('decision takes the shared line weight, like every other outline', () => {
  const [poly] = find(S.decision({ x: 0, y: 0, label: 'Gate' }), (x) => x.tag === 'polygon');
  assert.equal(poly.attrs['stroke-width'], S.lineWidth());
});

test('decision centres its label on the widest part of the diamond', () => {
  // The diamond is widest at its vertical centre, so that is the only row
  // where a label has the full w to sit in. A label placed anywhere else
  // overflows a shape that still passes every geometric check.
  const g = S.decision({ x: 100, y: 200, w: 90, h: 60, label: 'Gate' });
  const [t] = find(g, (x) => x.tag === 'text');
  assert.equal(Number(t.attrs.x), 100);
  assert.equal(Number(t.attrs.y) - 200 < 6, true, 'label sits on the centre row');
});

// hexHalfWidthAt() answers "how wide is the shape at this height", which is
// what a label beside a hexagon needs. A VERTICAL arrow meeting a hexagon off
// its centre line needs the other question - "how low is the boundary at this
// horizontal offset" - and the hexagon's own polygon is what that has to
// agree with, or the arrow stops in mid air or buries its head in the shape.
test('hexEdgeAt() lands on the lower edge of the polygon hex() draws', () => {
  const r = 60;
  const w = S.hexHalfWidth(r);
  assert.equal(S.hexEdgeAt(r, 0), r, 'straight below the centre: the bottom vertex');
  assert.ok(Math.abs(S.hexEdgeAt(r, w) - r / 2) < 1e-9, 'at the widest point: the lower corner');
  assert.equal(S.hexEdgeAt(r, -24), S.hexEdgeAt(r, 24), 'the same on either side');
  // The lower-right edge of the drawn polygon runs from the bottom vertex to
  // the lower-right corner; every answer has to sit on that segment.
  const pts = polyPts(S.hex({ x: 0, y: 0, r }));
  const [bx, by] = pts[3];
  const [cx2, cy2] = pts[2];
  // Distance FROM that segment, in scene units: hexPoints() rounds its
  // vertices to two places, so the drawn edge is not exactly the ideal one
  // and an exact-equality check here would be measuring the rounding.
  const edge = Math.hypot(cx2 - bx, cy2 - by);
  for (const dx of [12, 24, 36, 48]) {
    const dy = S.hexEdgeAt(r, dx);
    const off = Math.abs((cx2 - bx) * (dy - by) - (cy2 - by) * (dx - bx)) / edge;
    assert.ok(off < 0.01, `dx ${dx} is ${off} off the drawn edge`);
  }
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

test('every app hexagon is solid and names itself in its own ink', () => {
  for (const [i, entry] of APP.entries()) {
    const g = S.hex({ x: 0, y: 0, label: 'App', ...entry });
    const poly = find(g, (x) => x.tag === 'polygon')[0];
    assert.equal(poly.attrs['fill-opacity'], undefined, `APP[${i}] is solid, never tinted`);
    assert.equal(poly.attrs.fill, entry.fill, `APP[${i}] fill`);
    assert.equal(poly.attrs.stroke, C.appInk, `APP[${i}] is outlined in the app ink`);
    assert.equal(find(g, (x) => x.tag === 'text')[0].attrs.fill, entry.ink, `APP[${i}] names itself in its own ink`);
  }
  // The name sits on the fill, which is what tells the theme test to skip it.
  assert.ok(S.hex({ x: 0, y: 0, label: 'App', ...APP[1] }).attrs.class.includes('d-hex-solid'));
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

// An app hexagon can name the endpoint it answers on - `/method`, a port -
// and that second line is CODE, so it is set in the code font and smaller.
// It belongs inside the hexagon's own group: a text node laid over a shape
// from outside is what the free-label check in tests/diagrams.spec.js exists
// to catch, and it cannot tell a deliberate one from the defect.
test('hex sets an optional sub-line under the name, in the code font', () => {
  const g = S.hex({ x: 10, y: 20, r: 62, label: 'App', sub: '/method' });
  const ts = find(g, (x) => x.tag === 'text');
  assert.equal(ts.length, 2, 'the name and the sub-line');
  assert.equal(ts[1].attrs['font-family'], S.MONO, 'a path is code, and set in the code font');
  assert.ok(+ts[1].attrs.y > +ts[0].attrs.y, 'the sub-line is under the name');
  assert.ok(+ts[1].attrs['font-size'] < +ts[0].attrs['font-size'], 'and smaller than it');
  assert.equal(ts[1].attrs.fill, ts[0].attrs.fill, 'both take the name ink');
});

test('the name and its sub-line straddle the hexagon the way label() sets two lines', () => {
  const g = S.hex({ x: 0, y: 0, r: 60, label: 'App', sub: 'App', size: 20, subSize: 20 });
  const ts = find(g, (x) => x.tag === 'text');
  const two = S.label({ x: 0, y: 0, text: ['App', 'App'].join(String.fromCharCode(10)), size: 20 });
  assert.equal(+ts[0].attrs.y, +two.attrs.y, 'the name sits where a two-line label puts its first line');
  assert.equal(+ts[1].attrs.y - +ts[0].attrs.y, 24, 'and the sub-line one line height below it');
});

// A hexagon whose contents are a MARK and a name has to centre the pair, not
// the name: the name alone on the centre row leaves the block sitting high.
// labelDy moves the whole name block, sub-line included, the way labelDx
// moves it sideways - and the name stays inside the hexagon's own group,
// which a scene positioning the text itself could not manage.
test('hex drops its name off the centre row with labelDy, sub-line and all', () => {
  const at = { x: 0, y: 100, r: 60, label: 'App', sub: '/method' };
  const plain = find(S.hex(at), (x) => x.tag === 'text');
  const moved = find(S.hex({ ...at, labelDy: 18 }), (x) => x.tag === 'text');
  assert.equal(+moved[0].attrs.y - +plain[0].attrs.y, 18, 'the name moves down');
  assert.equal(+moved[1].attrs.y - +plain[1].attrs.y, 18, 'and the sub-line with it');
});

test('a hex sub-line never falls under the label floor', () => {
  const ts = find(S.hex({ x: 0, y: 0, r: 36, label: 'App', sub: '/x' }), (x) => x.tag === 'text');
  assert.equal(+ts[1].attrs['font-size'], S.MIN_LABEL);
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
  const g = S.cylinder({ x: 100, top: 90, bottom: 120 });
  const dashed = find(g, (x) => x.attrs['stroke-dasharray']);
  assert.equal(dashed.length, 1);
  assert.ok(dashed[0].attrs['stroke-opacity'] < 0.5);
  const [e] = find(g, (x) => x.tag === 'ellipse');
  assert.equal(e.attrs.rx, 66);
  assert.equal(e.attrs.ry, 15);
});

test('a store given a width takes the house ratio from it', () => {
  const w = 140;
  const g = S.cylinder({ x: 200, y: 100, w, label: 'State store' });
  const [rim] = find(g, (x) => x.tag === 'ellipse');
  assert.equal(+rim.attrs.rx, w / 2, 'the width is the width');
  assert.equal(+rim.attrs.ry, +(w * S.STORE_RIM).toFixed(2), 'and the rim follows it');
  // Drawn height: between the rim centres, plus a rim at each end.
  const top = +rim.attrs.cy;
  const bottom = 2 * 100 - top;
  const drawn = bottom - top + 2 * +rim.attrs.ry;
  assert.equal(+(w / drawn).toFixed(3), S.STORE_RATIO, 'the ratio is the point of the form');
  assert.ok(drawn < w, 'and it is still wider than it is tall');
});

test('a data store is wider than it is tall, and carries its name inside', () => {
  const g = S.cylinder({ x: 100, top: 90, bottom: 120, label: 'State store' });
  const [name] = find(g, (x) => x.tag === 'text');
  assert.equal(name.children[0].content, 'State store');
  // label() takes the centre and drops the baseline by a third of the size,
  // so the name sits between the two ellipse centres rather than under them.
  assert.ok(+name.attrs.y > 90 && +name.attrs.y < 120, `inside the body: ${name.attrs.y}`);
  assert.equal(name.attrs.fill, C.appInk, 'dark ink on the gold');
  // Drawn tall and narrow it is a broker on its end, which pipe() draws.
  assert.throws(() => S.cylinder({ x: 0, top: 0, bottom: 120 }), /wider than it is tall/);
});

test('a data store refuses a body too shallow to carry its name', () => {
  // Refuse rather than shrink: a clamped name is a drawing that silently
  // stops scaling, and the fix is a deeper store.
  assert.throws(() => S.cylinder({ x: 0, top: 0, bottom: 8, label: 'State store' }), /cannot carry/);
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
  for (const k of ['hex', 'box', 'node', 'cylinder', 'envelope', 'broker', 'lockBox', 'secureLock', 'panel']) {
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

test('a teal outline still needs a name, though no app is outlined in teal now', () => {
  // Every app outlines in the app ink, so the rule now bites only where a
  // scene reaches for C.teal itself.
  assert.throws(() => S.hex({ x: 0, y: 0, stroke: C.teal, label: '' }));
  assert.doesNotThrow(() => S.hex({ x: 0, y: 0, stroke: C.teal }));
  assert.doesNotThrow(() => S.hex({ x: 0, y: 0, stroke: APP[0].stroke, label: '' }));
  for (const a of APP) assert.equal(a.stroke, C.appInk);
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

test('pipe() is cylinder() on its side: a left opening and a right bulge', () => {
  const node = S.pipe({ x1: 100, x2: 300, y: 50, ry: 40, rx: 10, label: 'Broker' });
  const ell = find(node, (n) => n.tag === 'ellipse')[0];
  assert.equal(+ell.attrs.cx, 100, 'the opening is at the LEFT end');
  assert.equal(+ell.attrs.rx, 10);
  assert.equal(+ell.attrs.ry, 40);
  // Long and shallow, which is what tells it from a data store.
  const body = find(node, (n) => n.tag === 'path').map((n) => n.attrs.d);
  assert.ok(body.some((d) => d.includes('100,10') && d.includes('300,10')), `body runs along the top: ${body}`);
  const name = find(node, (n) => n.tag === 'text')[0];
  assert.equal(name.children[0].content, 'Broker', 'and carries its name');
  assert.ok(Math.abs(+name.attrs.y - 50) < 10, `inside the pipe, not under it: ${name.attrs.y}`);
  assert.equal(name.attrs.fill, C.appInk, 'dark ink on the green');
});

test('a broker is two to three times as long as it is across', () => {
  // Shorter and it reads as a tank, which is cylinder(); longer and it reads
  // as a line with ends rather than as a shape.
  const across = 80;
  assert.throws(() => S.pipe({ x1: 0, x2: across * 1.5, y: 0, ry: across / 2 }), /two to three times/);
  assert.throws(() => S.pipe({ x1: 0, x2: across * 4, y: 0, ry: across / 2 }), /two to three times/);
  assert.doesNotThrow(() => S.pipe({ x1: 0, x2: across * 2.5, y: 0, ry: across / 2 }));
});

test('hexHalfWidthAt() follows the hexagon from its flat side to its point', () => {
  const r = 56;
  const w = S.hexHalfWidth(r);
  assert.equal(S.hexHalfWidthAt(r, 0), w, 'widest at the centre');
  assert.equal(S.hexHalfWidthAt(r, r / 2), w, 'and still so at the end of the flat side');
  assert.equal(S.hexHalfWidthAt(r, r), 0, 'nothing at the point');
  assert.equal(S.hexHalfWidthAt(r, r * 2), 0, 'and nothing past it, never negative');
  assert.equal(S.hexHalfWidthAt(r, -r / 2), S.hexHalfWidthAt(r, r / 2), 'symmetric about the centre');
  // Halfway down the sloping edge is halfway between the flat side and the
  // point, which is what the polygon hex() draws does.
  assert.equal(+S.hexHalfWidthAt(r, r * 0.75).toFixed(6), +(w / 2).toFixed(6));
});

test('callout() is a white card with a black border and a DASHED leader', () => {
  const g = S.callout({ x: 200, y: 100, text: 'State management', to: [400, 200] });
  const [card] = find(g, (n) => n.tag === 'rect');
  assert.equal(card.attrs.fill, C.plate, 'white in both themes: it is paper over the picture');
  assert.equal(card.attrs.stroke, C.appInk);
  assert.equal(card.attrs['fill-opacity'], undefined, 'never tinted');
  const [name] = find(g, (n) => n.tag === 'text');
  assert.equal(name.attrs.fill, C.plateInk, 'ink for type on a plate, not body ink');
  // The leader is dashed and the head is not.
  const [line] = find(g, (n) => n.tag === 'line');
  assert.ok(line.attrs['stroke-dasharray'], 'the leader is dashed');
  const [head] = find(g, (n) => n.tag === 'polyline');
  assert.equal(head.attrs['stroke-dasharray'], undefined, 'the head is solid');
});

test('a callout with no target draws no leader, and arrows are solid by default', () => {
  const g = S.callout({ x: 0, y: 0, text: 'Note' });
  assert.equal(find(g, (n) => n.tag === 'line').length, 0);
  const [line] = find(S.arrow({ from: [0, 0], to: [50, 0] }), (n) => n.tag === 'line');
  assert.equal(line.attrs['stroke-dasharray'], undefined);
});

test('socket() cups the ball from the side its consumer is on', () => {
  const left = S.socket({ x: 200, y: 50, from: 100 });
  const right = S.socket({ x: 200, y: 50, from: 300 });
  const stalk = (g) => find(g, (n) => n.tag === 'line')[0].attrs;
  const cup = (g) => find(g, (n) => n.tag === 'path')[0].attrs.d;
  // The stalk stops at the near rim, which is a different rim each way.
  assert.equal(+stalk(left).x2, 200 - S.SOCKET_R);
  assert.equal(+stalk(right).x2, 200 + S.SOCKET_R);
  // And the arc sweeps the other way, so the cup faces the ball either way.
  assert.match(cup(left), /A21,21 0 0 0 /);
  assert.match(cup(right), /A21,21 0 0 1 /);
});

test('elbowArrow() draws one run and puts the head at the end of it', () => {
  const g = S.elbowArrow({ points: [[0, 0], [0, 100], [200, 100]] });
  const runs = find(g, (n) => (n.attrs?.class ?? '') === 'd-run');
  assert.equal(runs.length, 1, 'one path, however many corners');
  const heads = find(g, (n) => n.tag === 'polyline');
  assert.equal(heads.length, 1);
  // The chevron sits ON the last point, not near it.
  const tip = heads[0].attrs.points.split(' ')[1].split(',').map(Number);
  assert.deepEqual(tip, [200, 100]);
});

test('stepMark() puts its number on a fill that is the same in both themes', () => {
  // C.navy and C.bg would look right on the light theme and inverted on the
  // dark one: --d-blue is a deep navy in light and a pale blue in dark, while
  // the page ground goes the other way. The app tokens are fixed across both,
  // which is what a numeral sitting ON a shape needs.
  const g = S.stepMark({ x: 40, y: 40, step: 2 });
  const disc = find(g, (n) => n.tag === 'circle')[0];
  assert.equal(disc.attrs.fill, C.appBlue);
  const text = find(g, (n) => n.tag === 'text')[0];
  assert.equal(text.attrs.fill, C.paper);
  // And the theme check is told to look past it.
  assert.ok(find(g, (n) => (n.attrs?.class ?? '') === 'd-on-fill').length);
});

test('stepMark() renders its number, not the formatter that shares its name', () => {
  // `n` is this module's number formatter; a parameter called `n` shadowed it
  // and cx came out as "n is not a function".
  const g = S.stepMark({ x: 7, y: 9, step: 3 });
  assert.equal(find(g, (x) => x.tag === 'circle')[0].attrs.cx, '7');
  assert.equal(find(g, (x) => x.tag === 'text')[0].children[0].content, '3');
});

test('codeCard() sets its code left aligned in the code face, and its name above', () => {
  // Centred, a block of YAML reads as a picture of YAML rather than as YAML,
  // and a reader cannot run their eye down the keys. Every line has to start
  // at the same x, which is what anchor 'start' plus one x per tspan gives.
  const g = S.codeCard({
    x: 200, y: 100, w: 240, h: 90,
    title: 'local-secret-store.yaml',
    code: 'metadata:\n  name: localsecretstore',
  });
  const rect = find(g, (n) => n.tag === 'rect')[0];
  const texts = find(g, (n) => n.tag === 'text');
  const name = texts.find((t) => t.children.some((k) => k.content === 'local-secret-store.yaml'));
  const code = texts.find((t) => t.attrs['font-family'] !== undefined);

  assert.ok(name, 'the artifact is named');
  // ABOVE the card, not inside it: inside, the name competes with the code for
  // the same left margin and the two are different kinds of thing.
  assert.ok(Number(name.attrs.y) < Number(rect.attrs.y), 'the name sits above the card');

  assert.equal(code.attrs['text-anchor'], 'start');
  assert.ok(Number(code.attrs.x) > Number(rect.attrs.x), 'the code is inset from the border');
  // Every line starts at the same x, or the block is not left aligned.
  const xs = new Set(code.children.map((k) => k.attrs?.x).filter((v) => v !== undefined));
  assert.equal(xs.size, 1);
});

test('codeCard() keeps indentation, which YAML needs to mean what it says', () => {
  // Each line is its own tspan, and a space at the start of a tspan is
  // whitespace at a tag boundary: XML collapses it and the minifier drops the
  // rest. A component's YAML came out with `value` at the same depth as
  // `- name`, which is a different document and one that will not load.
  const g = S.codeCard({
    x: 0, y: 0, w: 300, h: 90,
    code: 'metadata:\n  - name: secretsFile\n    value: secrets.json',
  });
  const code = find(g, (n) => n.tag === 'text').find((t) => t.attrs['font-family'] !== undefined);
  const lines = code.children.map((k) => k.children[0].content);
  assert.equal(lines[0], 'metadata:');
  // Non-breaking spaces, and the SAME COUNT as the spaces they replace: in a
  // monospace face that is what keeps the depths apart.
  assert.equal(lines[1], '  - name: secretsFile');
  assert.equal(lines[2], '    value: secrets.json');
  // And nothing inside a line is touched, or the code would read as padded.
  assert.ok(lines[1].includes('- name: secretsFile'));
});

test('codeCard() refuses type under the label floor', () => {
  // Code at nine units is unreadable on the page and shrinks further in the
  // figure, and nothing downstream measures rendered type.
  assert.throws(
    () => S.codeCard({ x: 0, y: 0, w: 100, h: 50, code: 'x', size: 9 }),
    /below/,
  );
});

test('elbowArrow() dashes the run and leaves the head solid', () => {
  // A dashed line says the thing does not happen; a dashed chevron just reads
  // as a badly drawn one, which is the split arrow() already makes.
  const pts = [[0, 0], [0, 100], [200, 100]];
  const g = S.elbowArrow({ points: pts, dash: true });
  const run = find(g, (n) => (n.attrs?.class ?? '') === 'd-run')[0];
  assert.equal(run.attrs['stroke-dasharray'], '6 5');
  const head = find(g, (n) => n.tag === 'polyline')[0];
  assert.equal(head.attrs['stroke-dasharray'], undefined);
  // And the default stays solid, so nothing already drawn changes.
  const plain = find(S.elbowArrow({ points: pts }), (n) => (n.attrs?.class ?? '') === 'd-run')[0];
  assert.equal(plain.attrs['stroke-dasharray'], undefined);
});

test('elbowArrow() can put a head on both ends, and on neither', () => {
  const pts = [[0, 0], [0, 100], [200, 100]];
  assert.equal(find(S.elbowArrow({ points: pts, heads: 'both' }), (n) => n.tag === 'polyline').length, 2);
  assert.equal(find(S.elbowArrow({ points: pts, heads: 'none' }), (n) => n.tag === 'polyline').length, 0);
  const start = S.elbowArrow({ points: pts, heads: 'start' });
  const tip = find(start, (n) => n.tag === 'polyline')[0].attrs.points.split(' ')[1].split(',').map(Number);
  assert.deepEqual(tip, [0, 0]);
});

test('elbowArrow() never lets a head outrun the leg it sits on', () => {
  // A leg shorter than the head length would otherwise push the chevron past
  // the corner before it and bend the arrow backwards.
  const g = S.elbowArrow({ points: [[0, 0], [0, 100], [10, 100]] });
  // The chevron itself is a fixed size; what is capped is the line it is
  // drawn on, which must not reach back past the corner at x = 0.
  const head = find(g, (n) => (n.attrs?.class ?? '') === 'd-arrow')[0];
  const line = find(head, (n) => n.tag === 'line')[0];
  assert.equal(+line.attrs.x1, 5, `the head line starts at ${line.attrs.x1}, half the 10px leg`);
  assert.equal(+line.attrs.x2, 10);
});

test('pod() is a dashed sky box that carries its own name', () => {
  const g = S.pod({ x: 10, y: 20, w: 200, h: 160, name: 'Pod A', captionW: 70 });
  const panel = find(g, (n) => n.tag === 'rect' && n.attrs['stroke-dasharray'])[0];
  assert.equal(panel.attrs.stroke, C.blue, 'every pod in the set is sky');
  assert.equal(+panel.attrs.width, 200);
  assert.match(serialize(g), />Pod A</, 'the pod says which pod it is');
});

// ------------------------------------------- the maintainer's review of page 2

test('node() can set its name INSIDE the circle, in a given ink', () => {
  // The source flowcharts put "Start" and "End" inside their terminals. The
  // first draft hung them underneath because C.orange is the ink version of
  // the brand orange; measured, C.appInk on it is 5.5:1 in light and 7.0:1 in
  // dark, so the name can go where the source puts it.
  const g = S.node({
    x: 100, y: 200, r: 28, fill: C.orange, stroke: C.appInk,
    label: 'End', labelInside: true, ink: C.appInk,
  });
  const t = find(g, (x) => x.tag === 'text')[0];
  assert.equal(t.attrs.fill, C.appInk);
  // label() centres on y by dropping the baseline about a third of the size,
  // so the baseline sits just below the centre and nowhere near the rim.
  assert.ok(Math.abs(Number(t.attrs.y) - 200) < 14, `baseline ${t.attrs.y} is not inside the circle`);
});

test('node() still names itself below the circle when nothing says otherwise', () => {
  const g = S.node({ x: 0, y: 0, r: 16, label: 'Start' });
  const t = find(g, (x) => x.tag === 'text')[0];
  assert.ok(Number(t.attrs.y) > 16, 'the default is still a name under the marker');
});

test('decisionPoints() names the four vertices decision() actually draws', () => {
  // A diamond means a decision, and each way out leaves from its OWN point.
  // The scene was computing `x + w / 2` by hand, which is how three branches
  // ended up leaving the gate from one vertex.
  const spec = { x: 300, y: 200, w: 104, h: 68 };
  const p = S.decisionPoints(spec);
  const drawn = polyPts(S.decision(spec));
  assert.deepEqual(p.top, [300, 166]);
  assert.deepEqual(p.right, [352, 200]);
  assert.deepEqual(p.bottom, [300, 234]);
  assert.deepEqual(p.left, [248, 200]);
  for (const v of [p.top, p.right, p.bottom, p.left]) {
    assert.ok(drawn.some(([dx, dy]) => dx === v[0] && dy === v[1]), `${v} is not a corner of the polygon`);
  }
});

test('roundedPath() refuses a repeated point rather than emitting NaN', () => {
  // The corner cut divides by the leg length, so a repeated point makes that
  // 0/0 and every coordinate downstream of it is NaN in the `d` attribute - an
  // invalid path the exporter accepted and the browser drew as a truncated run.
  assert.throws(
    () => S.roundedPath({ points: [[0, 0], [100, 0], [100, 0], [200, 0]] }),
    /a leg has no length/,
  );
  assert.ok(!S.roundedPath({ points: [[0, 0], [100, 0], [100, 80]] }).attrs.d.includes('NaN'));
});

test('elbowArrow() rejects a zero-length leg anywhere, not only under a head', () => {
  // The guard used to live inside the chevron helper, so it only ever saw the
  // legs that carry a head. A repeated point in the middle of a run, or
  // anywhere in a headless bus feeder, reached roundedPath() and exported clean.
  const repeated = [[0, 0], [100, 0], [100, 0], [200, 0]];
  assert.throws(() => S.elbowArrow({ points: repeated }), /a leg has no length/);
  assert.throws(() => S.elbowArrow({ points: repeated, heads: 'none' }), /a leg has no length/);
});

test('richLabel() sets the code font on a part that asks for it', () => {
  // "Invoke /orders method" is prose with a path inside it. The path has to be
  // recognisable as one, and the rest must not turn into code.
  const node = S.richLabel({
    x: 0, y: 0, size: 13,
    parts: [{ text: 'Invoke ' }, { text: '/orders', mono: true }, { text: ' method' }],
  });
  const fonts = node.children.map((c) => c.attrs['font-family']);
  assert.equal(fonts[0], undefined);
  assert.equal(fonts[1], S.MONO);
  assert.equal(fonts[2], undefined);
  assert.equal(node.attrs['font-family'], undefined, 'the line itself is not code');
});

test('richLabel() does not repeat the code font on a line that is wholly code', () => {
  const node = S.richLabel({
    x: 0, y: 0, size: 13, mono: true,
    parts: [{ text: 'GET ' }, { text: '/v1.0/state', mono: true }],
  });
  assert.equal(node.attrs['font-family'], S.MONO);
  for (const kid of node.children) assert.equal(kid.attrs['font-family'], undefined);
});

test('richLabel() keeps a space that sits at the edge of a part', () => {
  // The page this svg is inlined into is minified, and a minifier drops
  // whitespace between tags: "Invoke " + "/orders" + " method" was served as
  // <tspan>Invoke</tspan><tspan>/orders</tspan><tspan>method</tspan> and the
  // page read "Invoke/ordersmethod". The exported FILE was correct the whole
  // time, which is why only the rendered page showed it. xml:space="preserve"
  // is no use - the minifier strips that attribute too.
  const node = S.richLabel({
    x: 0, y: 0, size: 13,
    parts: [{ text: 'Invoke ' }, { text: '/orders', mono: true }, { text: ' method' }],
  });
  const texts = node.children.map((c) => c.children[0].content);
  assert.equal(texts[0], 'Invoke ', 'the trailing space became non-breaking');
  assert.equal(texts[1], '/orders', 'and a part with no edge space is untouched');
  assert.equal(texts[2], ' method', 'as did the leading one');

  // Spaces INSIDE a part are ordinary: nothing can collapse them, because they
  // are not at a tag boundary.
  const inner = S.richLabel({ x: 0, y: 0, size: 13, parts: [{ text: 'two words' }] });
  assert.equal(inner.children[0].children[0].content, 'two words');
});

test('hexNameBlock leaves a one-line name exactly where it was', () => {
  // This fix must not move a single committed SVG, and `bindings-overview` is
  // the one scene already drawing a sub-line. The old spacing was
  // (size + subSize) * 0.6 from the name's centre; for one line the new
  // formula has to reduce to that same number.
  const size = 20;
  const sub = Math.max(S.MIN_LABEL, +(size * 0.7).toFixed(2));
  const block = S.hexNameBlock({ size, sub: '/method' });
  assert.equal(block.lead, +((size + sub) * 0.6).toFixed(2));
});

test('hex clears a two-line name before its sub-line', () => {
  // A sub spaced from the name's CENTRE runs into a name that has a second
  // line, because label() centres multi-line text on its own y. Both sit
  // inside the hexagon's group, so the rendered free-label check cannot see
  // it - it only catches text that has drifted onto a shape from outside.
  // This is the only thing that can.
  const texts = (g) => find(g, (x) => x.tag === 'text');
  const [, oneSub] = texts(S.hex({ x: 0, y: 0, r: 60, label: 'App', sub: '/orders' }));
  const [twoName, twoSub] = texts(
    S.hex({ x: 0, y: 0, r: 60, label: 'Order\nProcessor', sub: '/orders' }),
  );

  // label() sets the second line a line height below the first.
  const secondLine = +twoName.attrs.y + 20 * 1.2;
  assert.ok(+twoSub.attrs.y > secondLine, 'the sub-line clears the second line of the name');
  assert.ok(+twoSub.attrs.y > +oneSub.attrs.y, 'and sits lower than a one-line name puts it');
});

// AN HTTP EXCHANGE CARD. The configuration, state, secrets and pub/sub
// overviews all show a call to the Dapr API this way, so the card is one
// drawing rather than four scenes stacking their own text at their own
// offsets.
test('httpCard draws the request, the status and the response', () => {
  const card = S.httpCard({
    x: 0, y: 0, w: 300, h: 160,
    method: 'GET', url: '/v1.0/configuration/store', status: '200 OK', body: '"value"',
  });
  const lines = find(card, (n) => n.tag === 'text').map(said);
  assert.deepEqual(lines, ['GET', '/v1.0/configuration/store', '200 OK', '"value"']);
});

test('httpCard puts its divider between the request and the response', () => {
  // Derived, not picked: the line has to move with the card rather than sit
  // at a y somebody chose for one size of it.
  const card = S.httpCard({
    x: 0, y: 0, w: 300, h: 160,
    method: 'GET', url: '/v1.0/x', status: '200 OK', body: '"v"',
  });
  const line = find(card, (n) => n.tag === 'line')[0];
  const urlY = +find(card, (n) => n.tag === 'text' && said(n) === '/v1.0/x')[0].attrs.y;
  const bodyY = +find(card, (n) => n.tag === 'text' && said(n) === '"v"')[0].attrs.y;
  assert.ok(+line.attrs.y1 > urlY, 'under the url');
  assert.ok(+line.attrs.y1 < bodyY, 'and over the body');
  assert.equal(line.attrs.y1, line.attrs.y2, 'and level');
});

test('httpCard paints ground behind the status so the divider cannot cross it', () => {
  // The rendered check `paints ground behind any label a line crosses` fails a
  // label a line runs through with nothing painted behind it, and the divider
  // runs straight through this one.
  const card = S.httpCard({
    x: 0, y: 0, w: 300, h: 160,
    method: 'GET', url: '/v1.0/x', status: '200 OK', body: '"v"',
  });
  const chip = find(card, (n) => n.attrs && n.attrs.class === 'd-pill')[0];
  assert.ok(chip, 'the status sits on a pill');
  const plate = find(chip, (n) => n.tag === 'rect')[0];
  assert.equal(plate.attrs.fill, C.bg, 'filled with the page ground');
});

test('httpCard refuses type below the floor, and a card with no method', () => {
  assert.throws(() => S.httpCard({ x: 0, y: 0, w: 300, h: 160, method: 'GET', size: 4 }), /below/);
  assert.throws(() => S.httpCard({ x: 0, y: 0, w: 300, h: 160 }), /method/);
});
