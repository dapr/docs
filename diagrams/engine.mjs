// Dependency-free SVG element tree + deterministic serializer.
// No Date, no randomness; attributes serialize in insertion order.

import { createHash } from 'node:crypto';

const TEXT = Symbol.for('d3-diagrams.text');

export function text(content) {
  return { [TEXT]: true, content: String(content) };
}

const isText = (n) => n !== null && typeof n === 'object' && n[TEXT] === true;

export function el(tag, attrs = {}, children = []) {
  const kids = (Array.isArray(children) ? children : [children])
    .flat(Infinity)
    .filter((c) => c !== null && c !== undefined && c !== false)
    .map((c) => (typeof c === 'string' || typeof c === 'number' ? text(c) : c));
  return { tag, attrs: { ...attrs }, children: kids };
}

const escText = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

export function serialize(node) {
  if (isText(node)) return escText(node.content);
  let out = `<${node.tag}`;
  for (const [k, v] of Object.entries(node.attrs)) {
    if (v === undefined || v === null) continue;
    out += ` ${k}="${escAttr(String(v))}"`;
  }
  if (node.children.length === 0) return `${out}/>`;
  return `${out}>${node.children.map(serialize).join('')}</${node.tag}>`;
}

function slug(s) {
  const out = String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return out || 'diagram';
}

// Ids must be unique per page and valid NCNames (no leading digit). Default: slug of
// the title plus a hash of title+desc, a pure function of this scene's inputs.
// Pass `id` to disambiguate scenes that share title and desc.
function idBase(title, desc, id) {
  let base;
  if (id !== undefined && id !== null && String(id).trim()) {
    base = slug(id);
  } else {
    const h = createHash('sha1').update(`${title}\0${desc}`).digest('hex').slice(0, 6);
    base = `${slug(title)}-${h}`;
  }
  return /^[a-z]/.test(base) ? base : `d-${base}`;
}

export function svg({ width, height, title, desc, id, children = [] }) {
  if (!title || !String(title).trim()) throw new Error('svg(): title is required');
  if (!desc || !String(desc).trim()) throw new Error('svg(): desc is required');
  const base = idBase(title, desc, id);
  const titleId = `${base}-title`;
  const descId = `${base}-desc`;
  return serialize(
    el(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: `0 0 ${width} ${height}`,
        role: 'img',
        'aria-labelledby': `${titleId} ${descId}`,
      },
      [
        el('title', { id: titleId }, [text(title)]),
        el('desc', { id: descId }, [text(desc)]),
        ...[].concat(children),
      ],
    ),
  );
}

export const C = Object.freeze({
  navy: 'var(--d-blue)',
  blue: 'var(--d-sky)',
  orange: 'var(--d-orange)',
  teal: 'var(--d-teal)',
  mint: 'var(--d-mint)',
  red: 'var(--d-red)',
  lavender: 'var(--d-lavender)',
  grey: 'var(--d-grey)',
  caption: 'var(--d-caption)',
  green: 'var(--d-green)',
  appInk: 'var(--d-app-ink)',
  // A vendor's own brand colour, for tinting a single-colour brand mark. Not a
  // theme colour: it is the same in light and dark, because the mark is.
  kubernetes: 'var(--d-brand-kubernetes)',
  // Shows only in dark: see --d-mark-plate.
  markPlate: 'var(--d-mark-plate)',
  body: 'var(--d-body)',
  bg: 'var(--d-ground)',
  plate: 'var(--d-diagram-plate)',
  plateInk: 'var(--d-diagram-ink)',
  tealFill: 'var(--d-teal-fill)',
});

// The FIRST app in a diagram is Dapr's green, drawn solid with dark ink on it,
// which is what the source images use and what a reader recognises as "the
// application". The ones after it take the tinted palette in order, so a second
// and third app are told apart by colour without competing with the first.
//
// Every entry states all four properties, including the ones it shares with the
// default. A scene spreads an entry - `hex({ ..., ...APP[1] })` - and a missing
// property is `undefined`, which is exactly what makes a default parameter fire:
// an entry that left `ink` and `solid` out drew the second app SOLID with the
// first app's dark ink on it, which on the dark theme is near-black on
// near-black.
const bodyInk = 'var(--d-body)';
export const APP = Object.freeze([
  Object.freeze({ stroke: 'var(--d-app-ink)', fill: 'var(--d-green)', ink: 'var(--d-app-ink)', solid: true }),
  Object.freeze({ stroke: 'var(--d-sky)', fill: 'var(--d-sky-fill)', ink: bodyInk, solid: false }),
  Object.freeze({ stroke: 'var(--d-blue)', fill: 'var(--d-blue-fill)', ink: bodyInk, solid: false }),
  Object.freeze({ stroke: 'var(--d-teal)', fill: 'var(--d-teal-fill)', ink: bodyInk, solid: false }),
]);
