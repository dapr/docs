// Shape vocabulary shared by every diagram. Each builder is a pure function of
// its arguments and returns a Node (see engine.mjs). No state, no clocks.
//
// Conventions
// - x, y are the CENTRE of a shape, except panel() where x, y is the top-left.
// - Colours are var(--d-*) strings from C / APP, never literals.
// - Light mode: teal and mint never carry meaning alone. No text is ever teal or
//   mint, and a teal/mint outline needs a text label on the same shape.

import { el, text, C, APP } from './engine.mjs';

export const OUTLINE = 2.2;
export const ARROW_W = 2;
export const HEAD = 8;
export const FILL_OPACITY = 0.6;
export const MIN_LABEL = 11;
const HIDDEN = { 'stroke-dasharray': '3 3', 'stroke-opacity': 0.35 };

const n = (v) => String(+Number(v).toFixed(2));
const COS30 = Math.cos(Math.PI / 6);

function assertInk(color, what) {
  if (color === C.teal || color === C.mint) {
    throw new Error(`${what}: teal and mint fail contrast on white, choose another colour`);
  }
}

// Teal and mint outlines are only allowed when the shape also carries a text label
// (an empty string is no label). Throws otherwise.
function assertStroke(stroke, name, what) {
  if ((stroke === C.teal || stroke === C.mint) && !(typeof name === 'string' ? name.trim() : name)) {
    throw new Error(`${what}: a teal or mint outline needs a text label (fails contrast on white)`);
  }
}

const outline = (stroke, extra = {}) => ({
  stroke,
  'stroke-width': OUTLINE,
  'stroke-linejoin': 'round',
  'stroke-linecap': 'round',
  ...extra,
});
const tint = (fill) => ({ fill, 'fill-opacity': FILL_OPACITY });

// ---------------------------------------------------------------- group, label

// Evenly spaced centres for `n` slots across [x0, x1]: the standard way to lay
// out a row of marks, tiles or boxes so the gaps at each end match the gaps
// between items.
export function slots(x0, x1, n) {
  const pitch = (x1 - x0) / n;
  return Array.from({ length: n }, (_, i) => x0 + pitch * (i + 0.5));
}

export function group(arg = {}) {
  const o = Array.isArray(arg) ? { children: arg } : arg;
  const { children = [], ...attrs } = o;
  return el('g', attrs, children);
}

// y is the vertical centre of the whole text block, so labels centre on shapes
// without dominant-baseline (which renderers disagree on).
// `mono: true` is the ONE font-family a scene may set, and it is the page's
// own, not a new one: var(--font-mono) is what code, pre, kbd and samp use.
// A terminal command set in the body font reads as prose.
export const MONO = 'var(--font-mono)';

export function label({
  x, y, text: content, size = 11, weight = 600, color = C.body, halo = false, anchor = 'middle',
  mono = false,
}) {
  if (size < MIN_LABEL) throw new RangeError(`label(): size ${size} is below ${MIN_LABEL}px`);
  assertInk(color, 'label()');
  const lines = String(content).split('\n');
  const lh = size * 1.2;
  const y0 = y + size * 0.35 - ((lines.length - 1) * lh) / 2;
  const kids =
    lines.length === 1
      ? [text(lines[0])]
      : lines.map((l, i) => el('tspan', i === 0 ? { x: n(x) } : { x: n(x), dy: n(lh) }, [text(l)]));
  const mk = (attrs) =>
    el('text', {
      x: n(x),
      y: n(y0),
      'text-anchor': anchor,
      'font-size': size,
      'font-weight': weight,
      ...(mono ? { 'font-family': MONO } : {}),
      ...attrs,
    }, kids);
  const fill = mk({ fill: color });
  if (!halo) return fill;
  const under = mk({
    fill: C.bg, stroke: C.bg, 'stroke-width': 4, 'stroke-linejoin': 'round', 'aria-hidden': 'true',
  });
  return el('g', {}, [under, fill]);
}

// One line of text whose parts differ in colour or weight, for a URL or a
// command where part of it is the point. The parts flow as <tspan>s inside one
// <text>, so nothing has to be positioned by hand: measuring text would need
// font metrics the exporter does not have.
export function richLabel({
  x, y, parts, size = 13, weight = 400, color = C.body, anchor = 'start', mono = false,
}) {
  if (size < MIN_LABEL) throw new RangeError(`richLabel(): size ${size} is below ${MIN_LABEL}px`);
  assertInk(color, 'richLabel()');
  const kids = (parts ?? []).map((part) => {
    const attrs = {};
    if (part.color !== undefined && part.color !== color) {
      assertInk(part.color, 'richLabel() part');
      attrs.fill = part.color;
    }
    if (part.weight !== undefined && part.weight !== weight) attrs['font-weight'] = part.weight;
    return el('tspan', attrs, [text(String(part.text))]);
  });
  if (!kids.length) throw new Error('richLabel(): parts is required');
  return el('text', {
    x: n(x),
    y: n(y + size * 0.35),
    'text-anchor': anchor,
    'font-size': size,
    'font-weight': weight,
    ...(mono ? { 'font-family': MONO } : {}),
    fill: color,
  }, kids);
}

// ----------------------------------------------------------------- hex family

// Half the width of a pointy-top hexagon of radius r. Its leftmost point is at
// x - hexHalfWidth(r) and its lowest at x, which is what you need to line one
// shape up against another's edge rather than guessing.
export function hexHalfWidth(r) {
  return (Math.sqrt(3) / 2) * r;
}

export function hexPoints(x, y, r) {
  const pts = [];
  for (let k = 0; k < 6; k++) {
    const a = ((-90 + 60 * k) * Math.PI) / 180;
    pts.push(`${n(x + r * Math.cos(a))},${n(y + r * Math.sin(a))}`);
  }
  return pts.join(' ');
}

export function hex({
  x, y, r = 42.5, stroke = APP[0].stroke, fill = APP[0].fill, label: name = 'App', size, labelDx = 0,
}) {
  assertStroke(stroke, name, 'hex()');
  const poly = el('polygon', { points: hexPoints(x, y, r), ...tint(fill), ...outline(stroke) });
  const s = size ?? Math.max(MIN_LABEL, +(r / 3).toFixed(2));
  return el('g', { class: 'd-hex' }, [
    poly,
    name ? label({ x: x + labelDx, y, text: name, size: s }) : null,
  ]);
}

// The small Dapr hexagon. The Dapr logo is a Task 4 asset: pass it as `mark`
// (a Node drawn as given, on top of the hexagon). Without a mark the badge is
// a plain solid navy hexagon.
export function badge({ x, y, r = 19, mark = null }) {
  return el('g', { class: 'd-badge' }, [
    el('polygon', { points: hexPoints(x, y, r), fill: C.navy, stroke: C.navy, 'stroke-width': OUTLINE, 'stroke-linejoin': 'round' }),
    mark,
  ]);
}

export function daprApp({ x, y, r = 42.5, stroke, fill, label: name, size, labelDx, badgeLeft = false, mark = null }) {
  const bx = x + (badgeLeft ? -1 : 1) * r * 0.75;
  const by = y + r * 0.7;
  return el('g', { class: 'd-dapr-app' }, [
    hex({ x, y, r, stroke, fill, label: name, size, labelDx }),
    badge({ x: bx, y: by, r: +(r * 0.447).toFixed(2), mark }),
  ]);
}

// ----------------------------------------------------------- workflow shapes

// A workflow activity. Teal outline is fine here: the box always has its label.
export function box({ x, y, w = 194, h = 30, label: name = '', stroke = C.teal, fill = C.tealFill, size = 11 }) {
  assertStroke(stroke, name, 'box()');
  return el('g', { class: 'd-box' }, [
    el('rect', { x: n(x - w / 2), y: n(y - h / 2), width: w, height: h, rx: 6, ...tint(fill), ...outline(stroke) }),
    name ? label({ x, y, text: name, size }) : null,
  ]);
}

// A workflow start or end. Label sits under the circle unless labelDy says otherwise.
export function node({ x, y, r = 16, stroke = C.navy, fill = C.bg, label: name = '', labelDy }) {
  assertStroke(stroke, name, 'node()');
  return el('g', { class: 'd-node' }, [
    el('circle', { cx: n(x), cy: n(y), r, fill, ...outline(stroke) }),
    name ? label({ x, y: y + (labelDy ?? r + 14), text: name }) : null,
  ]);
}

// ------------------------------------------------------------------ data shapes

// top and bottom are the y of the top and bottom ellipse centres.
export function cylinder({
  x, top, bottom, rx = 24, ry = 8, stroke = C.navy, fill = APP[1].fill, label: name = '', labelDy,
}) {
  assertStroke(stroke, name, 'cylinder()');
  const l = x - rx;
  const rgt = x + rx;
  const body = `M${n(l)},${n(top)} L${n(l)},${n(bottom)} A${rx},${ry} 0 0 0 ${n(rgt)},${n(bottom)} L${n(rgt)},${n(top)}`;
  return el('g', { class: 'd-cylinder' }, [
    el('path', { d: `${body} A${rx},${ry} 0 0 0 ${n(l)},${n(top)} Z`, ...tint(fill), stroke: 'none' }),
    // hidden back rim of the base: faint and dashed
    el('path', { d: `M${n(l)},${n(bottom)} A${rx},${ry} 0 0 1 ${n(rgt)},${n(bottom)}`, fill: 'none', ...outline(stroke, HIDDEN) }),
    el('path', { d: body, fill: 'none', ...outline(stroke) }),
    el('ellipse', { cx: n(x), cy: n(top), rx, ry, ...tint(fill), ...outline(stroke) }),
    name ? label({ x, y: labelDy !== undefined ? top + labelDy : bottom + ry + 14, text: name }) : null,
  ]);
}

function envelopeShape(x, y, w, stroke, fill) {
  const h = +(w * 0.7).toFixed(2);
  const l = x - w / 2;
  const t = y - h / 2;
  return [
    // opaque underlay so a shape behind does not show through the tint
    el('rect', { x: n(l), y: n(t), width: n(w), height: n(h), rx: 3, fill: C.bg }),
    el('rect', { x: n(l), y: n(t), width: n(w), height: n(h), rx: 3, ...tint(fill), ...outline(stroke) }),
    el('polyline', { points: `${n(l)},${n(t)} ${n(x)},${n(y + h * 0.1)} ${n(l + w)},${n(t)}`, fill: 'none', ...outline(stroke) }),
  ];
}

export function envelope({ x, y, w = 35, color = C.navy, stroke, fill = APP[0].fill, label: name = '', labelDy }) {
  assertStroke(stroke ?? color, name, 'envelope()');
  const h = w * 0.7;
  return el('g', { class: 'd-envelope' }, [
    ...envelopeShape(x, y, w, stroke ?? color, fill),
    name ? label({ x, y: y + (labelDy ?? h / 2 + 14), text: name }) : null,
  ]);
}

// Two stacked envelopes. The back one peeks out up and to the right.
export function broker({ x, y, w = 46, label: name = '', labelDy, stroke = C.navy, fill = APP[0].fill }) {
  assertStroke(stroke, name, 'broker()');
  const h = w * 0.7;
  const off = w * 0.14;
  return el('g', { class: 'd-broker' }, [
    ...envelopeShape(x + off, y - off, w, stroke, fill),
    ...envelopeShape(x - off / 2, y + off / 2, w, stroke, fill),
    name ? label({ x, y: y + (labelDy ?? h / 2 + off + 14), text: name }) : null,
  ]);
}

// ----------------------------------------------------------------- glyph shapes

function padlock(x, y, s, color) {
  const bw = s * 0.46;
  const bh = s * 0.34;
  const sr = bw * 0.32;
  const by = y - bh / 2 + s * 0.08;
  return [
    el('path', { d: `M${n(x - sr)},${n(by)} L${n(x - sr)},${n(by - s * 0.12)} A${n(sr)},${n(sr)} 0 0 1 ${n(x + sr)},${n(by - s * 0.12)} L${n(x + sr)},${n(by)}`, fill: 'none', ...outline(color) }),
    el('rect', { x: n(x - bw / 2), y: n(by), width: n(bw), height: n(bh), rx: 3, fill: color, stroke: color, 'stroke-width': OUTLINE, 'stroke-linejoin': 'round' }),
  ];
}

// A secret store. Navy outline with a teal tint: a bare teal outline would have
// no label to carry it in light mode.
export function lockBox({ x, y, size = 44, stroke = C.navy, fill = C.tealFill, label: name = '', labelDy }) {
  assertStroke(stroke, name, 'lockBox()');
  return el('g', { class: 'd-lock-box' }, [
    el('rect', { x: n(x - size / 2), y: n(y - size / 2), width: size, height: size, rx: 8, ...tint(fill), ...outline(stroke) }),
    ...padlock(x, y, size, C.navy),
    name ? label({ x, y: y + (labelDy ?? size / 2 + 14), text: name }) : null,
  ]);
}

export function person({ x, y, size = 40, stroke = C.navy, fill = APP[0].fill, label: name = '', labelDy }) {
  assertStroke(stroke, name, 'person()');
  const s = size;
  const hr = s * 0.2;
  const hy = y - s * 0.22;
  const sy = y + s * 0.48;
  const sw = s * 0.42;
  return el('g', { class: 'd-person' }, [
    el('circle', { cx: n(x), cy: n(hy), r: n(hr), ...tint(fill), ...outline(stroke) }),
    el('path', { d: `M${n(x - sw)},${n(sy)} L${n(x - sw)},${n(sy - s * 0.1)} A${n(sw)},${n(s * 0.34)} 0 0 1 ${n(x + sw)},${n(sy - s * 0.1)} L${n(x + sw)},${n(sy)} Z`, ...tint(fill), ...outline(stroke) }),
    name ? label({ x, y: y + (labelDy ?? s / 2 + 14), text: name }) : null,
  ]);
}

// Secure communication: padlock inside a shield.
export function secureLock({ x, y, size = 44, stroke = C.blue, label: name = '', labelDy }) {
  assertStroke(stroke, name, 'secureLock()');
  const w = size * 0.8;
  const t = y - size / 2;
  const b = y + size / 2;
  const shield = `M${n(x)},${n(t)} L${n(x + w / 2)},${n(t + size * 0.18)} L${n(x + w / 2)},${n(y + size * 0.1)} Q${n(x + w / 2)},${n(b - size * 0.12)} ${n(x)},${n(b)} Q${n(x - w / 2)},${n(b - size * 0.12)} ${n(x - w / 2)},${n(y + size * 0.1)} L${n(x - w / 2)},${n(t + size * 0.18)} Z`;
  return el('g', { class: 'd-secure-lock' }, [
    el('path', { d: shield, ...tint(APP[0].fill), ...outline(stroke) }),
    ...padlock(x, y + size * 0.02, size * 0.9, C.navy),
    name ? label({ x, y: y + (labelDy ?? size / 2 + 14), text: name }) : null,
  ]);
}

// -------------------------------------------------------------- grouping shapes

// x, y is the TOP-LEFT corner (a region is placed by its extent).
// Teal is allowed here, and only here, by maintainer decision: a dashed grouping
// border is decorative, its contents are each individually labelled, and dapr.io's
// `apis` scene bands its three groups teal / sky / navy. Measured on our own
// tokens: light teal #4EA4AF is 2.90:1 on white, just under the 3:1 non-text
// threshold; dark teal #6cc4cf on #0b0e14 is comfortably above it. If that
// shortfall is ever ruled unacceptable, darkening --d-teal to about #4A9FAA
// reaches 3.08:1 without changing the colour family.
export function panel({ x, y, w, h, stroke = C.caption, r = 10 }) {
  if (stroke === C.mint) throw new Error('panel(): mint fails contrast on white, choose another colour');
  return el('rect', {
    class: 'd-panel', x: n(x), y: n(y), width: n(w), height: n(h), rx: r, fill: 'none',
    ...outline(stroke, { 'stroke-dasharray': '6 6' }),
  });
}

export function pill({ x, y, w, h = 26, text: content, color = C.navy, filled = false, size = 15 }) {
  if (filled) assertInk(color, 'pill() filled');
  return el('g', { class: 'd-pill' }, [
    el('rect', {
      x: n(x - w / 2), y: n(y - h / 2), width: n(w), height: n(h), rx: n(h / 2),
      fill: filled ? color : C.bg, ...outline(color),
    }),
    label({ x, y, text: content, size, weight: 600, color: filled ? C.bg : C.body }),
  ]);
}

// `icon` is a Node, or a function (cx, cy) => Node when it needs its position.
// The icon builder arrives in Task 4.
export function tile({
  x, y, icon = null, label: name = '', color = C.navy, filled = false, size = 99, w = size, h = size,
  inline = false, tag = '', labelSize = 11.5, inlinePad = 26, inlineGap = 24,
  desc = '', descSize = 13, iconDy = 48, titleDy = 96, descDy = 124,
  // Plain tiles place the glyph and name by proportion, which is fine until the
  // tile is square and the name runs to two lines. Give glyphSize and the two
  // are treated as ONE group and centred in the tile together, which is what
  // reads as deliberate; glyphDy/nameDy override either half outright.
  glyphSize = null, glyphGap = 10, glyphDy = null, nameDy = null,
}) {
  if (filled) assertInk(color, 'tile() filled');
  assertStroke(color, name, 'tile()');
  const ink = filled ? C.bg : C.body;
  const place = (cx, cy) => (typeof icon === 'function' ? icon(cx, cy) : icon);
  const parts = [
    el('rect', { x: n(x - w / 2), y: n(y - h / 2), width: n(w), height: n(h), rx: 10, fill: filled ? color : C.bg, ...outline(color) }),
  ];
  if (desc) {
    // A capability card: glyph, title, then a paragraph. Laid out from the top
    // edge rather than by proportion, so a card with a three-line description
    // and one with a two-line description still line their glyphs and titles up.
    // `desc` is split on newlines and never wrapped for you: where the lines
    // break is a layout decision, and auto-wrapping would make the output
    // depend on font metrics the exporter cannot see.
    const top = y - h / 2;
    const lines = String(desc).split('\n').length;
    parts.push(place(x, top + iconDy));
    parts.push(label({ x, y: top + titleDy, text: name, size: labelSize, weight: 700, color: ink }));
    // Wrapped so the description is distinguishable from the title: a test
    // that wants a card's name must not get its paragraph as well.
    parts.push(el('g', { class: 'd-tile-desc' }, [label({
      x,
      y: top + descDy + ((lines - 1) * descSize * 1.2) / 2,
      text: desc,
      size: descSize,
      weight: 400,
      color: ink,
    })]));
  } else if (inline) {
    // inlinePad is the icon CENTRE's inset from the left edge, so the visible gap
    // is inlinePad minus half the glyph: raise it when a glyph grows, or it
    // creeps towards the edge.
    parts.push(place(x - w / 2 + inlinePad, y));
    parts.push(label({ x: x - w / 2 + inlinePad + inlineGap, y, text: name, size: labelSize, anchor: 'start', color: ink }));
  } else {
    let gDy = glyphDy;
    let nDy = nameDy;
    if (glyphSize !== null && (gDy === null || nDy === null)) {
      // Stack glyph over name, then centre the stack. The name block's height
      // is what makes a two-line card differ from a one-line one.
      const nameH = String(name).split('\n').length * labelSize * 1.2;
      const top = -(glyphSize + glyphGap + nameH) / 2;
      if (gDy === null) gDy = top + glyphSize / 2;
      if (nDy === null) nDy = top + glyphSize + glyphGap + nameH / 2;
    }
    parts.push(place(x, y + (gDy ?? -h * 0.15)));
    parts.push(label({ x, y: y + (nDy ?? h * 0.3), text: name, size: labelSize, color: ink }));
  }
  if (tag) parts.push(label({ x: x + w / 2 - 8, y: y - h / 2 + 16, text: tag, size: 11, anchor: 'end', color: ink }));
  return el('g', { class: 'd-tile' }, parts);
}

// ---------------------------------------------------------------------- arrows

const fin = (v) => typeof v === 'number' && Number.isFinite(v);

// Distance from a shape's centre to its edge along unit direction (ux, uy).
// Throws on an unrecognised or incomplete descriptor rather than guessing.
function edgeDistance(s, ux, uy) {
  if (s.w !== undefined || s.h !== undefined) {
    if (!fin(s.w) || !fin(s.h)) throw new Error(`arrow(): rect descriptor needs numeric w and h, got ${JSON.stringify(s)}`);
    const tx = Math.abs(ux) < 1e-9 ? Infinity : s.w / 2 / Math.abs(ux);
    const ty = Math.abs(uy) < 1e-9 ? Infinity : s.h / 2 / Math.abs(uy);
    return Math.min(tx, ty);
  }
  if (!fin(s.r)) {
    throw new Error(`arrow(): descriptor needs r (circle, hex) or w and h (rect), got ${JSON.stringify(s)}`);
  }
  if (s.hex) {
    // pointy-top hexagon: three slabs, inradius r * cos30
    let m = 0;
    for (const deg of [0, 60, 120]) {
      const a = (deg * Math.PI) / 180;
      m = Math.max(m, Math.abs(ux * Math.cos(a) + uy * Math.sin(a)));
    }
    return (s.r * COS30) / m;
  }
  return s.r;
}

function centre(p) {
  if (Array.isArray(p)) {
    if (p.length !== 2 || !fin(p[0]) || !fin(p[1])) throw new Error(`arrow(): point must be [x, y], got ${JSON.stringify(p)}`);
    return { x: p[0], y: p[1] };
  }
  if (p === null || typeof p !== 'object' || !fin(p.x) || !fin(p.y)) {
    throw new Error(`arrow(): descriptor needs numeric x and y, got ${JSON.stringify(p)}`);
  }
  return p;
}

// from / to: a point [x, y] (used as is), a circle { x, y, r }, a hexagon
// { x, y, r, hex: true } or a rectangle { x, y, w, h }. The line runs between
// the shapes' EDGES, `gap` px clear of each. head: open 8px chevron at `to`.
export function arrow({ from, to, head = true, color = C.navy, gap = 2 }) {
  assertInk(color, 'arrow()'); // an arrow has no label of its own
  const a = centre(from);
  const b = centre(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) throw new Error('arrow(): from and to are the same point');
  const ux = dx / len;
  const uy = dy / len;
  const d0 = Array.isArray(from) ? 0 : edgeDistance(from, ux, uy) + gap;
  const d1 = Array.isArray(to) ? 0 : edgeDistance(to, ux, uy) + gap;
  if (d0 + d1 >= len) throw new Error('arrow(): shapes touch or overlap, no room for an arrow');
  const x1 = a.x + ux * d0;
  const y1 = a.y + uy * d0;
  const x2 = b.x - ux * d1;
  const y2 = b.y - uy * d1;
  const base = { stroke: color, 'stroke-width': ARROW_W, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' };
  const kids = [el('line', { x1: n(x1), y1: n(y1), x2: n(x2), y2: n(y2), ...base })];
  if (head) {
    const ang = Math.atan2(uy, ux);
    const wing = (s) => `${n(x2 - HEAD * Math.cos(ang + s * 0.5))},${n(y2 - HEAD * Math.sin(ang + s * 0.5))}`;
    kids.push(el('polyline', { points: `${wing(-1)} ${n(x2)},${n(y2)} ${wing(1)}`, ...base }));
  }
  return el('g', { class: 'd-arrow' }, kids);
}
