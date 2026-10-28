// The card: a rounded box with a mark and a name, drawn the same way whatever
// it stands for. A Dapr API block is one of these (see apis.mjs); so is a
// Dapr Agents capability. What they have in common is the drawing, and that
// belongs in one place.
//
// What this module owns, and a caller cannot change:
//
//   - the PLACEMENT. tile() has two rules and passing its `glyphSize` switches
//     between them, which is how the same card ended up putting its name a
//     tenth of a box apart on two pages. Only one rule is used here, so
//     `glyphSize`, `glyphDy` and `nameDy` are dropped before tile() sees them.
//   - the SIZES. The mark and the name are derived from the card, so a card
//     drawn smaller is the same drawing at a smaller size rather than a
//     smaller box with the old type still in it. A scene picks `w` and `h`.
//
// Both derive from the card's SHORT side, which is what actually constrains
// what sits inside it: a wide, shallow card with the mark beside the name is
// 160 by 76, and sizes taken from its width would be twice its height.
//
// Two label ratios, because there are two forms. The stacked card carries the
// name UNDER the mark; the inline one carries it BESIDE, where the card's
// height is what the type has to fit.

import { C } from './engine.mjs';
import { tile } from './shapes.mjs';
import { icon } from './icons.mjs';

export const CARD_W = 112; // the reference card
export const CARD_GLYPH = 44 / CARD_W;
export const STACKED_LABEL = 14 / CARD_W;
export const INLINE_LABEL = 14 / 76;

// Below this a name is not worth drawing, so a card too small to carry one is
// refused rather than quietly made illegible.
export const MIN_LABEL = 11;

// The mark and name sizes for a card of these dimensions.
export function cardSizes({ w = CARD_W, h = w, inline = false } = {}) {
  const short = Math.min(w, h);
  const glyph = +(short * CARD_GLYPH).toFixed(2);
  const label = +(short * (inline ? INLINE_LABEL : STACKED_LABEL)).toFixed(2);
  if (label < MIN_LABEL) {
    throw new Error(`cardSizes(): a ${short} card gives a ${label}px name, below the ${MIN_LABEL}px floor. Draw the card larger.`);
  }
  return { glyph, label };
}

// One card. `mark` is a vendored mark's name; `name` is what it is called.
// `glyph` and `labelSize` exist only for a card with proportions of its own,
// such as one carrying a description as well as a name, and the scene that
// passes either says in a comment why.
export function card({ mark, name, color = C.blue, filled = false, inline = false, glyph, labelSize, ...rest }) {
  const { glyphSize, glyphDy, nameDy, ...pass } = rest;
  const derived = pass.desc ? { glyph: glyph ?? 30, label: labelSize ?? 14 } : cardSizes({ w: pass.w, h: pass.h, inline });
  const markSize = glyph ?? derived.glyph;
  return tile({
    icon: (cx, cy) => icon({ name: mark, x: cx, y: cy, size: markSize, color: filled ? C.bg : color }),
    label: name,
    labelSize: labelSize ?? derived.label,
    color,
    filled,
    inline,
    ...pass,
  });
}
