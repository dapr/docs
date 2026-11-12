// TWO CAPTION PILLS CROWDING EACH OTHER, which nothing caught until a pod's
// name shipped two units under a cluster's.
//
// A region's name sits in a pill centred ON its border, so half of it hangs
// inside the box. Nest one region in another and the two pills are drawn from
// the same corner: the outer at CAPTION_INSET from its own left edge, the
// inner at CAPTION_INSET from ITS left edge, which is only the padding further
// in. Vertically they are separated by exactly the padding between the two
// borders, and a pill reaches CAPTION_H / 2 each side of the border it sits
// on. Pad a nested region by less than a whole pill and the two names touch.
//
// On `secrets-kubernetes-store` the padding was 28 and the pills are 26 tall,
// so the gap between "Kubernetes cluster" and "Pod" came to TWO UNITS. Every
// other check passed: both pills drew, both names were legible and the right
// size, both were inside the canvas, the contrast resolved in both themes.
// Nothing but an eye on the rendered page could see it, which is what this is
// here to replace.
//
// WHAT IT CHECKS. In each scene, no two caption pills may come within
// MIN_CLEAR of each other. Boxes are clear when they are apart on EITHER axis,
// which is what lets a row of pods sit side by side at a sensible pitch while
// still catching two names stacked almost on top of each other.
//
// WHY A GAP AND NOT JUST OVERLAP. Overlap is not the failure - the failure is
// two names near enough that a reader has to work out which box each belongs
// to, and that starts well before they touch. Ten units is about a third of a
// pill's height, which is the point at which they stop reading as two labels
// and start reading as one smudge.
//
// WHY SHAPES UNDER A TRANSFORM ARE SKIPPED. Same reason as
// label-cover.test.mjs: icon() places a vendored mark by scaling and
// translating a group, so anything inside carries the mark's own coordinates
// rather than the scene's.

import test from 'node:test';
import assert from 'node:assert/strict';
import { scenes } from './scenes/index.mjs';
import { setIconScope } from './icons.mjs';
import { setCanvasWidth } from './shapes.mjs';

// A third of a pill's height. Closer than this and two names read as one.
const MIN_CLEAR = 10;

const num = (v) => (v === undefined || v === null ? NaN : Number(v));

const classes = (node) => {
  const cls = node.attrs && node.attrs.class;
  return typeof cls === 'string' ? cls.split(' ') : [];
};

function allContent(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const child of node) allContent(child, out);
    return out;
  }
  if (typeof node.content === 'string') out.push(node.content);
  if (node.children) allContent(node.children, out);
  return out;
}

// Every caption pill in a scene, as a box with the name on it.
function pills(node, out = [], moved = false) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const child of node) pills(child, out, moved);
    return out;
  }
  const shifted = moved || (node.attrs && node.attrs.transform !== undefined);
  if (!shifted && classes(node).includes('d-pill')) {
    const rect = (function find(k) {
      if (!k || typeof k !== 'object') return null;
      if (Array.isArray(k)) {
        for (const c of k) {
          const hit = find(c);
          if (hit) return hit;
        }
        return null;
      }
      if (k.tag === 'rect') return k;
      return k.children ? find(k.children) : null;
    }(node.children));
    if (rect) {
      const x = num(rect.attrs.x);
      const y = num(rect.attrs.y);
      const w = num(rect.attrs.width);
      const h = num(rect.attrs.height);
      if ([x, y, w, h].every(Number.isFinite)) {
        out.push({
          x, y, w, h, text: allContent(node).join(' ').trim(),
        });
      }
    }
    // Nothing inside a pill is another pill.
    return out;
  }
  if (node.children) pills(node.children, out, shifted);
  return out;
}

// How far apart two boxes are. Negative on an axis means they overlap on it;
// the pair is clear when EITHER axis separates them by enough.
const clearance = (a, b) => Math.max(
  Math.max(a.x - (b.x + b.w), b.x - (a.x + a.w)),
  Math.max(a.y - (b.y + b.h), b.y - (a.y + a.h)),
);

function built(name, scene) {
  setIconScope(name);
  setCanvasWidth(scene.width);
  try {
    return pills(scene.build());
  } finally {
    setIconScope('');
    setCanvasWidth(null);
  }
}

test('no two caption pills crowd each other', () => {
  const crowded = [];
  for (const [name, scene] of Object.entries(scenes)) {
    const found = built(name, scene);
    for (let i = 0; i < found.length; i += 1) {
      for (let j = i + 1; j < found.length; j += 1) {
        const gap = clearance(found[i], found[j]);
        if (gap >= MIN_CLEAR) continue;
        crowded.push(
          `${name}: ${JSON.stringify(found[i].text)} and ${JSON.stringify(found[j].text)} `
          + `are ${gap.toFixed(1)} apart, under the ${MIN_CLEAR} two names need to read as two. `
          + 'A caption pill hangs CAPTION_H / 2 inside its own border, so a nested region '
          + 'has to be padded by more than a whole pill - pad it from the outer pill\'s '
          + 'lower edge, not from the border.',
        );
      }
    }
  }
  assert.deepEqual(crowded, [], `caption pills are crowded:\n${crowded.join('\n')}`);
});
