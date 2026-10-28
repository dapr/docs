// The vendored marks that name a LANGUAGE or a CLOUD, in dapr.io's order, with
// the box each one draws in.
//
// Two scenes carry these rows - the overview and the service mesh comparison -
// and before this module each carried its own copy. The copies had already
// diverged: one listed six languages with C++ and no PHP or Rust, in a
// different order, at sizes picked by eye. A reader who meets the language row
// on one page and again on the next should meet the same row.
//
// SIZES. Every box here is the size the mark draws at on the overview, which
// is dapr.io's own. A scene with less room scales the whole row by one factor
// with scaleMarks() rather than picking new numbers per mark: that keeps the
// marks in proportion to EACH OTHER, which is the thing that goes wrong when
// they are set by hand - the Go wordmark is two and a half times the width of
// the Java cup and has to stay that way.

import { C } from './engine.mjs';
import { group, label } from './shapes.mjs';
import { icon, plate } from './icons.mjs';

// ---- languages -------------------------------------------------------------
// C++ is deliberately absent on the maintainer's instruction; cpp.svg stays
// vendored for a later scene. No mark carries a text label: each is a wordmark
// or a logo readers know. Go and PHP are the full-colour Commons files dapr.io
// vendors, so they are wide wordmarks rather than square glyphs.
//
// `w` and `h` bound the mark; `content` is the ink the plate is sized around.
export const LANGUAGES = Object.freeze([
  Object.freeze({ name: 'nodejs', w: 81, h: 50, content: 81 }),
  Object.freeze({ name: 'python', w: 148, h: 44, content: 135 }),
  Object.freeze({ name: 'dotnet', w: 54, h: 54, content: 54 }),
  Object.freeze({ name: 'go', w: 112, h: 42, content: 112 }),
  Object.freeze({ name: 'java', w: 34, h: 62, content: 33 }),
  Object.freeze({ name: 'php', w: 104, h: 56, content: 104 }),
  Object.freeze({ name: 'rust', w: 54, h: 54, content: 54 }),
]);

// The plate height that goes with LANGUAGES at scale 1.
export const LANG_PLATE_H = 80;

// ---- clouds ----------------------------------------------------------------
// Azure and Kubernetes have no wordmark in their file, so each gets a name
// beside it; AWS and Google Cloud carry theirs. Kubernetes is the
// single-colour wheel tinted its own brand blue, which is why C.kubernetes
// exists: it is the mark's colour, not a theme colour.
//
// `backed` marks the two that are wordmarks set in near-black and mid-grey
// whose owners' terms forbid recolouring them. On the dark ground they get the
// light backing these logos are designed to sit on; C.markPlate is transparent
// in light mode, so a scene that uses them stays identical there.
export const CLOUDS = Object.freeze([
  Object.freeze({ name: 'azure', size: 30, text: 'Azure' }),
  Object.freeze({ name: 'aws', w: 50, h: 30, backed: true }),
  Object.freeze({ name: 'google-cloud', w: 156, h: 24, backed: true }),
  Object.freeze({ name: 'kubernetes', size: 30, color: C.kubernetes, text: 'Kubernetes' }),
]);

export const CLOUD_LABEL = 15;
export const MARK_PLATE_H = 56;
export const MARK_PLATE_PAD = 16;

// The gap between a cloud mark's centre and the start of its name, at scale 1.
// On the overview this is the difference between the website's own x values,
// and it is the same 21 for both marks that carry a name.
export const CLOUD_TEXT_DX = 21;

// Every number in a row of marks, scaled by one factor. A row drawn smaller is
// the same row, not a new set of sizes.
export function scaleMarks(marks, k) {
  if (!(k > 0)) throw new Error(`scaleMarks(): scale must be positive, got ${k}`);
  return marks.map((m) => {
    const out = { ...m };
    for (const key of ['w', 'h', 'content', 'size']) {
      if (out[key] !== undefined) out[key] = +(out[key] * k).toFixed(2);
    }
    return out;
  });
}

// One cloud mark, drawn the way the overview draws it: the backing where the
// mark needs one, the mark, and its name beside it where the file has none.
// `x` is the MARK's centre; a name starts textDx to its right.
//
// The BACKING does not scale with `k`. It is a quiet rectangle whose job is to
// give a dark wordmark a light ground in dark mode, and it wants the same
// margin round a small mark as a large one - scaled down with the mark it
// stops being a margin. `backingH` is there for a scene whose row is too
// shallow for the default.
export function cloudMark({ mark, x, y, k = 1, textDx = CLOUD_TEXT_DX, backingH = MARK_PLATE_H }) {
  return group([
    mark.backed
      ? plate({ x, y, w: mark.w * k + MARK_PLATE_PAD, h: backingH, fill: C.markPlate })
      : null,
    icon({
      name: mark.name,
      x,
      y,
      ...(mark.size ? { size: mark.size * k } : { w: mark.w * k, h: mark.h * k }),
      ...(mark.color ? { color: mark.color } : {}),
    }),
    mark.text
      ? label({ x: x + textDx, y, text: mark.text, size: CLOUD_LABEL * k, anchor: 'start' })
      : null,
  ]);
}
