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
  // The solid app fills, and the white that names the darker three. Fixed in
  // both themes, because the name sits on the fill rather than on the page.
  appSky: 'var(--d-app-sky)',
  appGold: 'var(--d-app-gold)',
  appTeal: 'var(--d-app-teal)',
  appBlue: 'var(--d-app-blue)',
  paper: 'var(--d-app-paper)',
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
  // The tints that go with C.blue and C.navy, named after the colour they
  // belong to rather than after their token - C.blue IS --d-sky and C.navy IS
  // --d-blue, and a scene picking a fill should not have to know that.
  blueFill: 'var(--d-sky-fill)',
  navyFill: 'var(--d-blue-fill)',
});

// The app hexagons, in the order a diagram uses them: green, light blue,
// yellow, teal, dark blue. Every one is a SOLID Dapr brand colour outlined in
// the app ink, and every one carries its name ON that fill, which is why both
// the fill and the ink are the same in either theme - neither sits on the page.
//
// The ink is stated per entry rather than derived: dark on the green and the
// yellow, white on the light blue, the teal and the dark blue. White on the
// light blue (2.56:1) and on the teal (2.63:1) is under the contrast floor and
// is a deliberate house decision, recorded in the skill. Do not "fix" it here.
//
// Every entry states all four properties, including the ones it shares with the
// default. A scene spreads an entry - `hex({ ..., ...APP[1] })` - and a missing
// property is `undefined`, which is exactly what makes a default parameter fire:
// an entry that left `ink` and `solid` out drew the second app SOLID with the
// first app's dark ink on it, which on the dark theme is near-black on
// near-black.
const ink = 'var(--d-app-ink)';
const paper = 'var(--d-app-paper)';
export const APP = Object.freeze([
  Object.freeze({ stroke: ink, fill: 'var(--d-green)', ink, solid: true }),
  Object.freeze({ stroke: ink, fill: 'var(--d-app-sky)', ink: paper, solid: true }),
  Object.freeze({ stroke: ink, fill: 'var(--d-app-gold)', ink, solid: true }),
  Object.freeze({ stroke: ink, fill: 'var(--d-app-teal)', ink: paper, solid: true }),
  Object.freeze({ stroke: ink, fill: 'var(--d-app-blue)', ink: paper, solid: true }),
]);
