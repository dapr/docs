// A LABEL PAINTED OVER BY A SHAPE DRAWN AFTER IT, which nothing caught until
// two scenes shipped with a caption hidden behind the next hexagon down.
//
// SVG has no z-index: later siblings paint over earlier ones. A scene that
// places a label and then draws a solid shape across it loses the label
// completely, and every other check in the suite still passes - the text node
// exists, its font size is right, it is inside the canvas, the colours
// resolve, the canvas is the size the formula wants. The only thing that knows
// is a pair of eyes on the rendered page, and eyes are what this set keeps
// finding bugs with when it should be finding them by test.
//
// WHAT IT CHECKS. A scene's own FREE labels - the ones it places itself, not a
// shape's name, told apart by the same "no `d-` ancestor" rule
// type-size.test.mjs uses - must not have their ANCHOR POINT inside a solid
// shape that is painted later.
//
// WHY THE ANCHOR POINT AND NOT THE BOX. The exporter has no font metrics, so a
// label's width is not knowable here; scenes pass measured widths in by hand.
// The anchor is exact. A label whose anchor is inside a later solid shape is
// certainly hidden, so there are no false alarms, and the failure this is
// built for - a label dropped on top of the next shape in the stack - puts
// the anchor well inside. A label that only CLIPS a shape at one end slips
// through, and that is the honest limit of a check with no metrics.
//
// WHY ONLY SOLID SHAPES. The set tints most fills to 0.6, and a label behind a
// tinted panel is dimmed but legible - several scenes do it deliberately. Only
// a fill that is fully opaque actually hides anything.
//
// WHY SHAPES UNDER A TRANSFORM ARE SKIPPED. icon() places a vendored mark by
// scaling and translating a group, so the rectangles inside the Dapr logo
// carry the mark's OWN coordinates, not the scene's. Read as scene
// coordinates they land in the middle of the drawing and swallow whatever
// label is there: the first run of this check reported six shipped scenes,
// every one of them a caption sitting innocently where a logo's internals
// would be if they were not transformed. This walker does not apply
// transforms, so it declines to judge anything under one.

import test from 'node:test';
import assert from 'node:assert/strict';
import { scenes } from './scenes/index.mjs';
import { setIconScope } from './icons.mjs';
import { setCanvasWidth } from './shapes.mjs';

const num = (v) => (v === undefined || v === null ? NaN : Number(v));

const isOpaque = (attrs) => {
  const fill = attrs.fill;
  if (typeof fill !== 'string' || fill === 'none' || fill === 'transparent') return false;
  const o = attrs['fill-opacity'];
  return o === undefined || Number(o) === 1;
};

// The shapes whose geometry can be known without parsing path data. A
// cylinder is a <path> and is not among them; the hexagons that caused this
// are polygons.
function shapeOf(node) {
  const a = node.attrs ?? {};
  if (!isOpaque(a)) return null;
  if (node.tag === 'polygon' && typeof a.points === 'string') {
    const pts = a.points.trim().split(/\s+/).map((p) => p.split(',').map(Number));
    return pts.length >= 3 && pts.every((p) => p.length === 2 && p.every(Number.isFinite))
      ? { kind: 'poly', pts }
      : null;
  }
  if (node.tag === 'circle') {
    const c = { kind: 'circle', cx: num(a.cx), cy: num(a.cy), r: num(a.r) };
    return Number.isFinite(c.cx) && Number.isFinite(c.cy) && Number.isFinite(c.r) ? c : null;
  }
  if (node.tag === 'rect') {
    const r = {
      kind: 'rect', x: num(a.x), y: num(a.y), w: num(a.width), h: num(a.height),
    };
    return [r.x, r.y, r.w, r.h].every(Number.isFinite) ? r : null;
  }
  return null;
}

const inside = (s, x, y) => {
  if (s.kind === 'circle') return (x - s.cx) ** 2 + (y - s.cy) ** 2 <= s.r ** 2;
  if (s.kind === 'rect') return x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h;
  // Ray casting, which is exact for the convex hexagons this is really about
  // and correct for any simple polygon.
  let hit = false;
  for (let i = 0, j = s.pts.length - 1; i < s.pts.length; j = i, i += 1) {
    const [xi, yi] = s.pts[i];
    const [xj, yj] = s.pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
};

// Walk in document order, which is paint order, recording free labels and
// opaque shapes with the position each was emitted at.
function collect(node, state, inShape = false, moved = false) {
  if (!node || typeof node !== 'object') return state;
  if (Array.isArray(node)) {
    for (const child of node) collect(child, state, inShape, moved);
    return state;
  }
  const cls = node.attrs && node.attrs.class;
  const shape = inShape
    || (typeof cls === 'string' && cls.split(' ').some((c) => c.startsWith('d-')));
  const shifted = moved || (node.attrs && node.attrs.transform !== undefined);

  const geom = shifted ? null : shapeOf(node);
  if (geom) state.shapes.push({ ...geom, at: state.n });

  if (node.tag === 'text' && !shape) {
    const x = num(node.attrs?.x);
    const y = num(node.attrs?.y);
    const content = [];
    const text = (k) => {
      if (!k || typeof k !== 'object') return;
      if (Array.isArray(k)) { k.forEach(text); return; }
      if (typeof k.content === 'string') content.push(k.content);
      if (k.children) text(k.children);
    };
    text(node.children);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      state.labels.push({ x, y, at: state.n, text: content.join(' ').trim() });
    }
  }
  state.n += 1;
  if (node.children) collect(node.children, state, shape, shifted);
  return state;
}

function built(name, scene) {
  setIconScope(name);
  setCanvasWidth(scene.width);
  try {
    return collect(scene.build(), { n: 0, labels: [], shapes: [] });
  } finally {
    setIconScope('');
    setCanvasWidth(null);
  }
}

test('no free label is painted over by a shape drawn after it', () => {
  const hidden = [];
  for (const [name, scene] of Object.entries(scenes)) {
    const { labels, shapes } = built(name, scene);
    for (const l of labels) {
      const over = shapes.find((s) => s.at > l.at && inside(s, l.x, l.y));
      if (!over) continue;
      hidden.push(
        `${name}: ${JSON.stringify(l.text)} at (${l.x}, ${l.y}) is inside a solid `
        + `${over.kind} drawn after it, so the page shows the shape and not the label. `
        + 'Move the label clear, or draw it after the shape - SVG has no z-index, and '
        + 'later siblings paint over earlier ones.',
      );
    }
  }
  assert.deepEqual(hidden, [], `a label is hidden:\n${hidden.join('\n')}`);
});
