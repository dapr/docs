// Brand marks: reads a vendored SVG from daprdocs/assets/icons/, checks it, and
// inlines it as engine nodes. The file on disk is never modified; every change
// happens to the in-memory copy (ids and classes prefixed, outer <svg> replaced
// by a positioned <g>). Pure: identical input gives byte-identical output.

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { el, text, C } from './engine.mjs';
import { label as drawLabel } from './shapes.mjs';

export const ICONS_DIR = fileURLToPath(new URL('../daprdocs/assets/icons/', import.meta.url));

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
    stack[stack.length - 1].children.push({ text: t });
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

const FORBIDDEN_TAGS = new Set([
  'script', 'foreignobject', 'iframe', 'embed', 'object', 'audio', 'video',
  'animate', 'animatetransform', 'animatemotion', 'set',
]);

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
  const checkValue = (v, where) => {
    if (/javascript:|vbscript:|data:|expression\s*\(|@import/i.test(v)) fail(`${where} contains a script, data or import reference`);
    for (const u of v.matchAll(/url\(\s*(['"]?)([^)'"]*)\1\s*\)/gi)) {
      if (!u[2].trim().startsWith('#')) fail(`${where} references an external url(${u[2]})`);
    }
  };
  walk(root, (n) => {
    const tag = n.tag.toLowerCase().replace(/^[^:]*:/, '');
    if (FORBIDDEN_TAGS.has(tag)) fail(`contains <${n.tag}>`);
    for (const [k, v] of Object.entries(n.attrs)) {
      const key = k.toLowerCase();
      if (/^on/.test(key)) fail(`has the event handler attribute ${k}`);
      if (key === 'href' || key.endsWith(':href')) {
        if (!v.trim().startsWith('#')) fail(`has an external ${k}="${v}"`);
      }
      checkValue(v, `attribute ${k}`);
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
  const href = (v) => v.replace(/^#(.+)$/, (m, id) => (ids.has(id) ? `#${prefix}${id}` : m));
  walk(root, (n) => {
    for (const [k, v] of Object.entries(n.attrs)) {
      if (k === 'id') n.attrs[k] = `${prefix}${v}`;
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
      if (node.tag === 'style' || c.text.trim() !== '') children.push(text(node.tag === 'style' ? c.text : c.text));
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

// x, y are the CENTRE of the box, like every other builder. `size` makes a square
// box; give `w` and `h` for a wide mark. The mark is scaled to fit the box and
// keeps its aspect ratio, centred in it. `color` tints single-colour marks only.
// `label` is optional; with none, nothing but the mark is drawn. `scope` is for
// pages that hold several diagrams: pass the diagram id so two diagrams that draw
// the same mark at the same spot still get distinct ids.
export function icon({ name, x, y, size = 32, w, h, color = C.body, label, labelDy, labelSize = 13, scope = '', dir = ICONS_DIR }) {
  const src = readMark(name, dir);
  const boxW = w ?? size;
  const boxH = h ?? size;
  const prefix = `ic-${scope ? `${scope}-` : ''}${name}-${num(x)}-${num(y)}-`;
  const mark = parseMark(src, { name, prefix });
  const [vx, vy, vw, vh] = mark.viewBox;
  const s = Math.min(boxW / vw, boxH / vh);
  const tx = x - (vw * s) / 2 - vx * s;
  const ty = y - (vh * s) / 2 - vy * s;
  const attrs = { class: 'd-icon', 'data-mark': name, transform: `translate(${num(tx)} ${num(ty)}) scale(${num(s)})` };
  if (mark.full) Object.assign(attrs, mark.inherited);
  else attrs.fill = color;
  const parts = [el('g', attrs, mark.children)];
  if (typeof label === 'string' && label.trim() !== '') {
    parts.push(drawLabel({ x, y: y + (labelDy ?? boxH / 2 + 14), text: label, size: labelSize }));
  }
  return el('g', { class: 'd-icon-group' }, parts);
}

// Neutral backing for full-colour marks, so they stay legible on both ground
// colours (--d-diagram-plate is near-white in both themes). x, y = CENTRE.
export function plate({ x, y, w, h }) {
  return el('rect', {
    class: 'd-plate',
    x: num(x - w / 2),
    y: num(y - h / 2),
    width: num(w),
    height: num(h),
    rx: 8,
    fill: C.plate,
  });
}
