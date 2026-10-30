// Brand marks: reads a vendored SVG from daprdocs/assets/icons/, checks it, and
// inlines it as engine nodes. The file on disk is never modified; every change
// happens to the in-memory copy (ids and classes prefixed, outer <svg> replaced
// by a positioned <g>). Pure: identical input gives byte-identical output.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { el, text, C } from './engine.mjs';
import { label as drawLabel, group, hexPoints, lineWidth } from './shapes.mjs';

export const ICONS_DIR = fileURLToPath(new URL('../daprdocs/assets/icons/', import.meta.url));

// The scene currently being rendered. The exporter sets this around build() so
// icon() can scope its ids without every call site remembering to: two diagrams
// on one page that draw the same mark at the same point would otherwise emit the
// same ids. Pass `scope` explicitly to override it.
let currentScope = '';
export function setIconScope(scope = '') {
  currentScope = typeof scope === 'string' ? scope : '';
}

export class IconError extends Error {
  constructor(message) {
    super(message);
    this.name = 'IconError';
  }
}

const num = (n) => Number(n.toFixed(4));
const NAME_RE = /^[a-z0-9][a-z0-9-]*$/;

// ---------------------------------------------------------------- XML reader

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decode(s, name) {
  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*);/g, (m, e) => {
    if (e[0] === '#') {
      const cp = e[1] === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return String.fromCodePoint(cp);
    }
    if (e in ENTITIES) return ENTITIES[e];
    throw new IconError(`mark "${name}": unsupported entity &${e};`);
  });
}

// ---- Normalisation. The screen (assertSafe), the rewrite (prefixTree) and the output (clean)
// must all see the SAME text, or a value the screen approves is not recognised by the rewrite
// and comes out as a silently dangling reference. So values are normalised once, here, at parse
// time, and every later stage reads the normalised tree.

// Attribute names that matter to the screen, the rewrite or the colour detection. SVG itself
// is case-sensitive, but an HTML parser lowercases attribute names on inline SVG, so HREF, ID
// or CLASS would reach the page as href, id and class. They are lowercased here; two spellings
// of one name on one element are refused.
const CANON_ATTRS = new Set(['id', 'class', 'href', 'xlink:href', 'style', 'fill', 'stroke', 'stop-color', 'flood-color']);

// url( ' #p ' ), URL(#p ) and url("#p") all become url(#p): CSS function names are
// case-insensitive, whitespace and quotes inside the parentheses are insignificant.
const normaliseUrls = (v) => v.replace(/url\(\s*(['"]?)\s*([^)'"]*?)\s*\1\s*\)/gi, (m, q, inner) => `url(${inner})`);

function canonAttrs(raw, tag, name) {
  const attrs = {};
  for (const [k, v] of Object.entries(raw)) {
    const lower = k.toLowerCase();
    const key = CANON_ATTRS.has(lower) ? lower : k;
    if (key in attrs) throw new IconError(`mark "${name}": <${tag}> has the attribute ${key} twice (case-insensitively)`);
    let val = normaliseUrls(v);
    if (key === 'href' || key === 'xlink:href' || key === 'id') val = val.trim();
    attrs[key] = val;
  }
  if ('href' in attrs && 'xlink:href' in attrs) throw new IconError(`mark "${name}": <${tag}> has both href and xlink:href`);
  return attrs;
}

// Minimal well-formed-XML reader: elements, attributes, text, CDATA. Comments,
// processing instructions and the DOCTYPE are dropped (a DOCTYPE with an
// internal subset or an ENTITY is rejected). Returns the root element.
function parseXml(src, name) {
  let s = src.replace(/^﻿/, '');
  s = s.replace(/<\?[\s\S]*?\?>/g, '');
  s = s.replace(/<!--[\s\S]*?-->/g, '');
  if (/<!ENTITY/i.test(s)) throw new IconError(`mark "${name}": contains an ENTITY declaration`);
  s = s.replace(/<!DOCTYPE[^>[]*(\[[\s\S]*?\])?\s*>/gi, (m, subset) => {
    if (subset) throw new IconError(`mark "${name}": DOCTYPE with an internal subset`);
    return '';
  });
  if (/<!DOCTYPE/i.test(s)) throw new IconError(`mark "${name}": unreadable DOCTYPE`);

  const root = { tag: '#root', attrs: {}, children: [] };
  const stack = [root];
  const tagRe = /<!\[CDATA\[([\s\S]*?)\]\]>|<\/([^\s>]+)\s*>|<([^\s/>!?]+)((?:\s+[^\s=/>]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/g;
  const attrRe = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let last = 0;
  let m;
  const pushText = (t) => {
    if (t === '') return;
    const top = stack[stack.length - 1];
    top.children.push({ text: top.tag === 'style' ? normaliseUrls(t) : t });
  };
  while ((m = tagRe.exec(s))) {
    const gap = s.slice(last, m.index);
    if (gap.includes('<')) throw new IconError(`mark "${name}": malformed markup near "${gap.slice(0, 30)}"`);
    pushText(decode(gap, name));
    last = tagRe.lastIndex;
    if (m[1] !== undefined) {
      pushText(m[1]);
    } else if (m[2] !== undefined) {
      const top = stack.pop();
      if (top.tag !== m[2] || stack.length === 0) throw new IconError(`mark "${name}": mismatched </${m[2]}>`);
    } else {
      const node = { tag: m[3], attrs: {}, children: [] };
      let a;
      attrRe.lastIndex = 0;
      while ((a = attrRe.exec(m[4]))) {
        node.attrs[a[1]] = decode(a[2] ?? a[3], name);
      }
      node.attrs = canonAttrs(node.attrs, node.tag, name);
      stack[stack.length - 1].children.push(node);
      if (m[5] !== '/') stack.push(node);
    }
  }
  const tail = s.slice(last);
  if (tail.trim() !== '') throw new IconError(`mark "${name}": trailing content`);
  if (stack.length !== 1) throw new IconError(`mark "${name}": unclosed <${stack[stack.length - 1].tag}>`);
  const roots = root.children.filter((c) => c.tag);
  if (roots.length !== 1 || roots[0].tag !== 'svg') throw new IconError(`mark "${name}": root element must be a single <svg>`);
  return roots[0];
}

// ------------------------------------------------------------ security check

// Allowlist, not denylist: only the elements the vendored marks use (plus inert
// plain geometry and <use>, which can only point at a same-document fragment).
// Anything else, including every animation, script, handler and embedding element,
// is refused, which closes the whole class (<handler>, <animateColor>, ...).
// Names are matched case-sensitively, as SVG does. dc:* / rdf:* are the metadata
// elements Commons files carry; they are dropped before output.
const ALLOWED_TAGS = new Set([
  'svg', 'g', 'defs', 'path', 'polygon', 'rect', 'circle', 'ellipse', 'line', 'polyline',
  'linearGradient', 'radialGradient', 'stop', 'clipPath', 'style', 'title', 'desc',
  'metadata', 'use', 'image',
]);
// Creative Commons, Dublin Core and RDF elements appear inside <metadata> in
// files exported by Inkscape (php.svg is one), and Inkscape's own editor state
// - <sodipodi:namedview>, which records the page colour, the zoom and the
// guides - sits directly under <svg> (kubernetes-secret.svg has one). None of
// it is drawn: an element in a foreign namespace is ignored by every renderer,
// and clean() drops every namespaced tag anyway, so none of it reaches the
// output. Anything nested INSIDE one is still walked and still has to pass,
// so this admits editor leftovers, not a hiding place. Rejecting a file over
// them would only push us to a worse copy of the same mark.
const allowedTag = (t) => ALLOWED_TAGS.has(t) || /^(cc|dc|rdf|sodipodi|inkscape):[A-Za-z-]+$/.test(t);

function walk(node, fn) {
  fn(node);
  for (const c of node.children) if (c.tag) walk(c, fn);
}

// Third-party content gets inlined into every docs page. Reject anything that can
// run code or fetch a resource: <script>, <foreignObject> and friends, any on*
// attribute, any href / xlink:href that is not a same-document "#fragment", any
// url(...) that is not "#fragment", javascript: and data: URLs, @import.
function assertSafe(root, name) {
  const fail = (why) => {
    throw new IconError(`mark "${name}" rejected: ${why}`);
  };
  // Some official logos ship as a raster inside an svg wrapper. That payload is
  // inert - it cannot run or fetch anything - so <image> may carry a base64
  // image data URI and nothing else may carry a data URI at all.
  const INLINE_IMAGE = /^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=\s]+$/i;
  const checkValue = (v, where, allowInlineImage = false) => {
    if (allowInlineImage && INLINE_IMAGE.test(v.trim())) return;
    if (/javascript:|vbscript:|data:|expression\s*\(|@import/i.test(v)) fail(`${where} contains a script, data or import reference`);
    for (const u of v.matchAll(/url\(\s*(['"]?)([^)'"]*)\1\s*\)/gi)) {
      if (!u[2].trim().startsWith('#')) fail(`${where} references an external url(${u[2]})`);
    }
  };
  walk(root, (n) => {
    const tag = n.tag;
    if (!allowedTag(tag)) fail(`contains <${n.tag}>, which is not an allowed element`);
    for (const [k, v] of Object.entries(n.attrs)) {
      const key = k.toLowerCase();
      if (/^on/.test(key)) fail(`has the event handler attribute ${k}`);
      const isHref = key === 'href' || key.endsWith(':href');
      const inlineImageOk = isHref && tag === 'image';
      if (isHref && !(inlineImageOk && INLINE_IMAGE.test(v.trim())) && !v.trim().startsWith('#')) {
        fail(`has an external ${k}="${v.slice(0, 60)}"`);
      }
      checkValue(v, `attribute ${k}`, inlineImageOk);
    }
    if (tag === 'style') {
      for (const c of n.children) if (c.text !== undefined) checkValue(c.text, '<style>');
    }
  });
}

// ------------------------------------------------------- id and class prefix

const CSS_IDENT = '-?[_a-zA-Z][\\w-]*';

function rewriteStyle(css, prefix, ids, name) {
  if (css.includes('@')) throw new IconError(`mark "${name}": at-rules in <style> are not supported`);
  return css.replace(/([^{}]+)\{([^{}]*)\}/g, (m, sel, body) => {
    const parts = sel.split(',').map((p) => p.trim());
    const out = parts.map((p) => {
      // Every selector must start with a class or id, or the rule would leak onto the page.
      if (!/^[.#]/.test(p)) throw new IconError(`mark "${name}": <style> selector "${p}" would affect the page`);
      return p
        .replace(new RegExp(`\\.(${CSS_IDENT})`, 'g'), (mm, c) => `.${prefix}${c}`)
        .replace(new RegExp(`#(${CSS_IDENT})`, 'g'), (mm, i) => (ids.has(i) ? `#${prefix}${i}` : mm));
    });
    return `${out.join(',')}{${body.trim()}}`;
  });
}

function prefixTree(root, prefix, name) {
  const ids = new Set();
  walk(root, (n) => {
    if (n.attrs.id !== undefined) ids.add(n.attrs.id);
  });
  const refs = (v) =>
    v
      .replace(/url\(\s*(['"]?)#([^)'"]+)\1\s*\)/g, (m, q, id) => (ids.has(id) ? `url(#${prefix}${id})` : m))
  ;
  // Trim first: assertSafe approved the trimmed value, so the rewrite must inspect and emit that same value.
  const href = (v) => v.replace(/^#(.+)$/, (m, id) => (ids.has(id) ? `#${prefix}${id}` : m));
  // Sketch exports repeat an id (logo-blue.svg carries three <rect id="Rectangle-4">),
  // and prefixing alone preserves the collision, which is invalid HTML once the
  // mark is inlined into a page. Give each repeat its own suffix. References are
  // NOT redirected: `url(#x)` and `href="#x"` keep resolving to the first
  // occurrence, which is what a browser does with duplicate ids anyway.
  const used = new Set();
  const uniq = (v) => {
    let out = `${prefix}${v}`;
    for (let i = 2; used.has(out); i += 1) out = `${prefix}${v}-${i}`;
    used.add(out);
    return out;
  };
  walk(root, (n) => {
    for (const [k, v] of Object.entries(n.attrs)) {
      if (k === 'id') n.attrs[k] = uniq(v);
      else if (k === 'class') n.attrs[k] = v.split(/\s+/).filter(Boolean).map((c) => `${prefix}${c}`).join(' ');
      else if (k === 'href' || k === 'xlink:href') n.attrs[k] = href(v);
      else n.attrs[k] = refs(v);
    }
    if (n.tag === 'style') {
      n.children = n.children.map((c) => (c.text === undefined ? c : { text: rewriteStyle(refs(c.text), prefix, ids, name) }));
    }
  });
}

// ----------------------------------------------------------- tree to nodes

const DROP_TAGS = new Set(['title', 'desc', 'metadata']);

// Removes accessibility/metadata nodes (the diagram supplies the accessible name),
// foreign-namespace elements and attributes, and rewrites xlink:href to href.
function clean(node) {
  const attrs = {};
  for (const [k, v] of Object.entries(node.attrs)) {
    if (k === 'xlink:href') attrs.href = v;
    else if (k.includes(':') || k === 'xmlns' || k === 'version' || k === 'xml:space') continue;
    else attrs[k] = v;
  }
  const children = [];
  for (const c of node.children) {
    if (c.text !== undefined) {
      if (node.tag === 'style' || c.text.trim() !== '') children.push(text(c.text));
    } else if (!DROP_TAGS.has(c.tag) && !c.tag.includes(':')) {
      children.push(clean(c));
    }
  }
  return el(node.tag, attrs, children);
}

// Does the mark paint with its own colours? Single-colour marks (Simple Icons)
// carry none and take the `color` argument; full-colour marks are left untouched.
const NO_PAINT = /^(none|currentcolor|inherit|transparent)$/i;
function hasOwnColour(root) {
  let found = false;
  const paint = (v) => {
    if (!NO_PAINT.test(v.trim())) found = true;
  };
  walk(root, (n) => {
    // An embedded raster carries its own colours by definition, and nothing a
    // tint could set would reach its pixels.
    if (n.tag === 'image') found = true;
    for (const [k, v] of Object.entries(n.attrs)) {
      if (k === 'fill' || k === 'stroke' || k === 'stop-color' || k === 'flood-color') paint(v);
      if (k === 'style') for (const d of v.matchAll(/(?:^|;)\s*(fill|stroke|stop-color|flood-color)\s*:\s*([^;]+)/g)) paint(d[2]);
    }
    if (n.tag === 'style') {
      for (const c of n.children) {
        if (c.text === undefined) continue;
        for (const d of c.text.matchAll(/(?:^|[;{])\s*(fill|stroke|stop-color|flood-color)\s*:\s*([^;}]+)/g)) paint(d[2]);
      }
    }
  });
  return found;
}

// SVG lengths in CSS pixels (user units): content coordinates of a file without a
// viewBox are in px, so "388.8pt" means 518.4 units. Relative units are unusable.
const UNIT_PX = { '': 1, px: 1, pt: 4 / 3, pc: 16, in: 96, cm: 96 / 2.54, mm: 96 / 25.4 };
function lengthPx(v) {
  const m = /^\s*([0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\s*([a-z%]*)\s*$/.exec(v ?? '');
  if (!m || !(m[2] in UNIT_PX)) return NaN;
  return Number(m[1]) * UNIT_PX[m[2]];
}

function viewBoxOf(root, name) {
  const vb = root.attrs.viewBox ?? root.attrs.viewbox;
  if (vb !== undefined) {
    const p = vb.trim().split(/[\s,]+/).map(Number);
    if (p.length !== 4 || p.some((v) => !Number.isFinite(v)) || p[2] <= 0 || p[3] <= 0) {
      throw new IconError(`mark "${name}": unusable viewBox "${vb}"`);
    }
    return p;
  }
  const w = lengthPx(root.attrs.width);
  const h = lengthPx(root.attrs.height);
  if (!(w > 0) || !(h > 0)) throw new IconError(`mark "${name}": no viewBox and no usable width/height`);
  return [0, 0, w, h];
}

const ROOT_PAINT = ['fill', 'fill-rule', 'clip-rule', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'opacity'];

const sanitisePrefix = (s) => s.replace(/[^A-Za-z0-9_-]/g, '_');

// Parse, check and prefix an SVG document. Exported so tests (and tools) can run
// the whole pipeline on text without touching disk.
export function parseMark(svgText, { name, prefix }) {
  const root = parseXml(svgText, name);
  assertSafe(root, name);
  const viewBox = viewBoxOf(root, name);
  const full = hasOwnColour(root);
  const pre = sanitisePrefix(prefix);
  prefixTree(root, pre, name);
  const inherited = {};
  for (const k of ROOT_PAINT) if (root.attrs[k] !== undefined) inherited[k] = root.attrs[k];
  const kids = clean(root).children;
  return { viewBox, full, inherited, children: kids };
}

const cache = new Map();
function readMark(name, dir) {
  if (typeof name !== 'string' || !NAME_RE.test(name)) throw new IconError(`icon: invalid mark name ${JSON.stringify(name)}`);
  const file = `${dir}${dir.endsWith('/') || dir.endsWith('\\') ? '' : '/'}${name}.svg`;
  let src = cache.get(file);
  if (src === undefined) {
    try {
      src = readFileSync(file, 'utf8');
    } catch (e) {
      if (e.code === 'ENOENT') throw new IconError(`icon: no mark named "${name}" (expected ${name}.svg in daprdocs/assets/icons/)`);
      throw e;
    }
    cache.set(file, src);
  }
  return src;
}

// Every .svg in the icons directory, as mark names (file name without ".svg"), sorted.
export function listMarks(dir = ICONS_DIR) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.svg'))
    .map((f) => f.slice(0, -4))
    .sort();
}

// The measured drawn box, read once. A mark with no entry is a mark that has
// not been measured since it was added, which is a mistake rather than a
// reason to silently fall back to its viewBox.
let inkTable = null;
function inkBox(name) {
  if (inkTable === null) {
    const file = join(ICONS_DIR, 'ink.json');
    inkTable = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  }
  const box = inkTable[name];
  if (!box) throw new IconError(`mark "${name}": no entry in ink.json; run npm run measure:ink`);
  return box;
}

// x, y are the CENTRE of the box, like every other builder. `size` makes a square
// box; give `w` and `h` for a wide mark. The mark is scaled to fit the box and
// keeps its aspect ratio, centred in it. `color` tints single-colour marks only.
// `label` is optional; with none, nothing but the mark is drawn. `scope` is for
// pages that hold several diagrams: pass the diagram id so two diagrams that draw
// the same mark at the same spot still get distinct ids.
export function icon({ name, x, y, size = 32, w, h, color = C.body, label, labelDy, labelSize = 13, scope, dir = ICONS_DIR, fit = 'box' }) {
  const src = readMark(name, dir);
  const boxW = w ?? size;
  const boxH = h ?? size;
  const sc = scope === undefined ? currentScope : scope;
  const prefix = `ic-${sc ? `${sc}-` : ''}${name}-${num(x)}-${num(y)}-`;
  const mark = parseMark(src, { name, prefix });
  // `fit: 'ink'` sizes the mark by what it DRAWS rather than by its viewBox.
  // The two differ a lot: go.svg draws 24x9 in a 24x24 box and the Google
  // Cloud wordmark is 5 units tall in a box 33 wide, so marks given the same
  // size come out at very different weights. That is tolerable in a row where
  // each mark carries its name and hopeless in a column where none do. The
  // drawn box cannot be computed from path data without a renderer, so it is
  // measured into ink.json by `npm run measure:ink`.
  const [vx, vy, vw, vh] = fit === 'ink' ? inkBox(name) : mark.viewBox;
  const s = Math.min(boxW / vw, boxH / vh);
  const tx = x - (vw * s) / 2 - vx * s;
  const ty = y - (vh * s) / 2 - vy * s;
  const attrs = { class: 'd-icon', 'data-mark': name, transform: `translate(${num(tx)} ${num(ty)}) scale(${num(s)})` };
  if (mark.full) Object.assign(attrs, mark.inherited);
  else {
    // `color` as well as `fill`: a glyph whose path paints `fill="currentColor"`
    // (every Fluent mark does) overrides the wrapper's fill, so without this it
    // renders in the page's inherited text colour instead of the token asked for.
    attrs.fill = color;
    attrs.color = color;
  }
  const parts = [el('g', attrs, mark.children)];
  if (typeof label === 'string' && label.trim() !== '') {
    parts.push(drawLabel({ x, y: y + (labelDy ?? boxH / 2 + 14), text: label, size: labelSize }));
  }
  return el('g', { class: 'd-icon-group' }, parts);
}

// One plate height for every marked logo, and the horizontal padding around the
// mark inside it. Exported so a scene can lay out around a plate it did not draw.
export const PLATE_H = 68;
export const PLATE_PAD = 28;

// A brand mark on its neutral plate. `w` and `h` are the box the mark is fitted
// into; `content` is how wide it actually draws inside that box, which is what
// the plate is sized around (several marks have slack viewBoxes, so the box and
// the ink are different widths). Single-colour marks are plated too, so a row
// does not go ragged in dark mode, and they are tinted C.plateInk rather than
// C.body: the plate is near-white in BOTH themes, so an ink that inverts with
// the page would vanish on it.
// `inside` sets a name beside the mark WITHIN the plate, for a file that has no
// wordmark of its own; `dx` shifts the mark to make room. Not to be confused
// with a scene label placed under the plate, which is ordinary C.body text.
export function brand({ name, x, y, w, h, content, plate: pw, dx = 0, inside, insideDx = 0, insideSize = 15, plateH = PLATE_H, pad = PLATE_PAD }) {
  return group([
    plate({ x, y, w: pw ?? content + pad, h: plateH }),
    icon({ name, x: x + dx, y, w, h, color: C.plateInk }),
    // Text that sits ON a plate takes C.plateInk, never C.body.
    inside
      ? drawLabel({ x: x + insideDx, y, text: inside, size: insideSize, anchor: 'start', color: C.plateInk })
      : null,
  ]);
}

// Neutral backing for full-colour marks, so they stay legible on both ground
// colours (--d-diagram-plate is near-white in both themes). x, y = CENTRE.
export function plate({ x, y, w, h, fill = C.plate }) {
  return el('rect', {
    class: 'd-plate',
    x: num(x - w / 2),
    y: num(y - h / 2),
    width: num(w),
    height: num(h),
    rx: 8,
    fill,
  });
}

// The Dapr wordmark's width as a multiple of the hexagon's radius. One number,
// so the logo is the same weight inside every Dapr hexagon in the set: eight of
// these were built by hand before this existed and the ratio had drifted from
// 1.27 to 1.50, which reads as the logo being bigger on some pages than others.
export const DAPR_MARK = 4 / 3;

// Any other mark in a hexagon - Consul, Redis, Zipkin - as a multiple of the
// radius. The wordmark is wide and short, so it takes more; a squarer mark
// takes less. Both scale with the hexagon, so a column of them keeps its
// family whatever size the scene draws them at.
export const MARK_IN_HEX = 0.8;

// A hexagon with a brand mark centred in it: a Dapr service, a sidecar, or a
// container running something else. The mark carries no name of its own, so it
// is centred both ways and the scene puts the name outside, below.
//
// The Dapr wordmark paints its own navy, so a hexagon carrying it is FILLED to
// act as its plate - without that it is navy on the dark ground and all but
// disappears. A tinted mark follows the theme and needs no plate.
//
// The outline is the LIGHT blue, never navy: a Dapr hexagon is the same shape
// in the same colour wherever it appears, and navy is for the marks and arrows
// around it. Two scenes drew theirs in navy before this was one definition.
export function markHex({ x, y, r, mark, size, stroke = C.blue, fill, color }) {
  const dapr = mark === 'logo-blue';
  if (!dapr && size === undefined) throw new Error(`markHex(): "${mark}" needs a size; only the Dapr wordmark has a default`);
  const w = size ?? r * DAPR_MARK;
  return el('g', { class: 'd-mark-hex' }, [
    el('polygon', {
      points: hexPoints(x, y, r),
      fill: fill ?? (dapr ? C.plate : C.bg),
      stroke,
      'stroke-width': lineWidth(),
      'stroke-linejoin': 'round',
    }),
    icon({ name: mark, x, y, w, h: w, ...(color ? { color } : {}) }),
  ]);
}
