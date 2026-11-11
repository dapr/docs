// TWO APPS, ONE SHARED RESOURCE, AND WHAT THE LOCK DID - the picture the
// distributed lock how-to draws three times.
//
// howto-use-distributed-lock.md ships three images that are one arrangement
// in three states: two app-and-sidecar pairs on the left, one store on the
// right, a run from each sidecar to it, and beside each run a numbered step, a
// glyph saying what became of it, and a line or two of words. What changes
// between them is the glyph, the words, and whether the two apps are the same
// app. Everything else - every radius, every gap, every baseline - is the
// same, and drawing it three times is how three pictures on ONE page end up
// disagreeing about a shape nobody meant to change.
//
// So this is the arrangement, once, and a scene says what is true of its own
// state. It is a whole scene rather than a builder because the whole picture
// is what repeats; the moment one of those pages wants a different
// arrangement, that page stops calling this and draws itself.
//
// IT AGREES WITH `distributed-lock-overview`, on the page before it: same
// radii, same combined app-and-sidecar shape, same unbranded store named
// Shared resource, same navy-for-allowed and red-dashed-for-denied. A reader
// moving from the overview to the how-to should not have to re-learn the
// picture.
//
// WHY THE RUNS LEAVE THE SIDECARS. The source draws app and sidecar as one
// overlapping shape and runs the line out of the pair; appSidecar() draws that
// same combined shape, so the run leaves the sidecar's right face. The
// overview scene has a longer note on this - it had to route around the
// component file, which these three do not show.

import { C, APP } from './engine.mjs';
import {
  cylinder, elbowArrow, group, hexHalfWidth, label, stepMark, STEP_R, STORE_RATIO,
} from './shapes.mjs';
import { appSidecar, pairExtent, sidecarAt } from './app.mjs';
import { icon } from './icons.mjs';

const EDGE = 29;
const V_EDGE = 14;

const TEXT = 13;
const NAME = 17;

const APP_R = 60;
// hex() sizes a name at a third of the radius, and appSidecar() follows it.
const APP_NAME = APP_R / 3;

const STORE_W = 120;
const STORE_H = STORE_W / STORE_RATIO;

const GLYPH = 36;

// ---- the two rows ----------------------------------------------------------
const ROW_T = V_EDGE + APP_R;
const APP_X = EDGE + hexHalfWidth(APP_R);
const pairAt = (y) => ({ x: APP_X, y, r: APP_R, size: APP_NAME });

// How far the pair reaches below the app's own centre - the sidecar hangs
// below the hexagon, so the app's radius is the wrong number - and where the
// instance caption sits under it.
const PAIR_BOTTOM = pairExtent({ r: APP_R, size: APP_NAME }).bottom;
const INST_DY = 18;
const instanceY = (y) => y + PAIR_BOTTOM + INST_DY;

// THE ROW GAP IS DERIVED, not chosen, and the thing it is derived from is the
// instance caption under the UPPER pair clearing the top point of the LOWER
// app's hexagon. Chosen, it was 180, and that caption was drawn and then
// painted over by the hexagon below it - a label that exists, is the right
// size, is inside the canvas and is on the page nowhere at all. Nothing in
// the suite saw it until diagrams/label-cover.test.mjs, which exists because
// of this. Deriving it means the two can never drift back together.
const INST_CLEAR = 16;
const ROW_GAP = Math.ceil(PAIR_BOTTOM + INST_DY + TEXT + APP_R + INST_CLEAR);
const ROW_B = ROW_T + ROW_GAP;
const SIDE_T = sidecarAt(pairAt(ROW_T));
const SIDE_B = sidecarAt(pairAt(ROW_B));
const SIDE_R = SIDE_T.r;
const SIDE_RIGHT = SIDE_T.x + hexHalfWidth(SIDE_R);

// ---- the step, the glyph and the words, in that reading order ---------------
// Measured on the rendered page at 13/600 - the exporter has no font metrics.
// This is the longest line any of the THREE states sets, not the longest this
// one sets: sizing each picture to its own words would make three pictures of
// three different widths out of one arrangement, and the reader meets all
// three on one page. The cost is some slack on the shorter two.
const CAPTION_W = 203;

const STEP_X = SIDE_RIGHT + 40 + STEP_R;
const GLYPH_X = STEP_X + STEP_R + 14 + GLYPH / 2;
const CAPTION_X = GLYPH_X + GLYPH / 2 + 16 + CAPTION_W / 2;

// ---- the shared resource ----------------------------------------------------
// Its name stands to its LEFT, as on the overview, which leaves its foot free
// for the lower run to come in at. The widest line is "resource".
const RES_NAME_W = 73;
// The air before the store is what brings the frame back over its 16:9 floor
// once the rows are as far apart as the instance captions need. It is the
// cheapest place to put it: everything else in the frame is sized by
// something.
const RES_GAP = 96;
const RES_X = Math.round(CAPTION_X + CAPTION_W / 2 + RES_GAP + RES_NAME_W + 14 + STORE_W / 2);
const RES_Y = (SIDE_T.y + SIDE_B.y) / 2;

const W = Math.ceil(RES_X + STORE_W / 2 + EDGE);

// Each row's commentary sits just clear of the run it explains - above the
// upper one, below the lower one - rather than in the middle of the frame: the
// glyph is the verdict on that run, and a verdict floating equidistant from
// two runs belongs to neither.
const CAP_DY = 40;
const CAP_T_Y = SIDE_T.y - CAP_DY;
const CAP_B_Y = SIDE_B.y + CAP_DY;

const H = Math.ceil(Math.max(
  instanceY(ROW_B) + TEXT,
  CAP_B_Y + TEXT * 1.2,
  SIDE_B.y + SIDE_R,
) + V_EDGE);

// A sidecar's run to the store: right along its own row, then in at the near
// end. The upper one comes down into the store's top and the lower one up into
// its foot, which is why the store's name is set beside it rather than under.
const access = (side, { dash = false, color = C.navy }) => elbowArrow({
  color,
  dash,
  points: [
    [SIDE_RIGHT + 2, side.y],
    [RES_X, side.y],
    [RES_X, RES_Y + (side === SIDE_T ? -1 : 1) * (STORE_H / 2 + 2)],
  ],
});

/**
 * One state of the picture.
 *
 * `top` and `bottom` each say what became of that row's run: its step number,
 * the glyph that is the verdict, whether the run is dashed, and the words. The
 * apps are named and coloured by the caller because two of the three states
 * draw the same application twice and the third draws two different ones -
 * see diagrams/app-colour.test.mjs, which is the check on that distinction.
 */
export function lockExample({
  title,
  desc,
  apps,
  instances = false,
  top,
  bottom,
}) {
  if (!Array.isArray(apps) || apps.length !== 2) {
    throw new Error('lockExample(): two apps, top and bottom');
  }
  const rows = [
    { ...top, side: SIDE_T, y: CAP_T_Y },
    { ...bottom, side: SIDE_B, y: CAP_B_Y },
  ];
  return {
    width: W,
    height: H,
    title,
    desc,

    build() {
      return [
        rows.map((row) => [
          access(row.side, { dash: row.dash, color: row.color ?? C.navy }),
          stepMark({ x: STEP_X, y: row.y, step: row.step }),
          icon({
            name: row.mark, x: GLYPH_X, y: row.y, size: GLYPH,
            color: row.color ?? C.navy, fit: 'ink',
          }),
          label({ x: CAPTION_X, y: row.y, text: row.caption, size: TEXT }),
        ]),

        // ---- the shapes, over the lines that reach them -------------------
        [ROW_T, ROW_B].map((y, i) => [
          appSidecar({ ...pairAt(y), label: apps[i].name, ...(apps[i].palette ?? APP[0]) }),
          instances
            ? label({
              x: APP_X, y: instanceY(y), text: `Instance ${i + 1}`, size: TEXT,
            })
            : null,
        ]),

        group({
          class: 'd-named-mark',
          children: [
            // No brand mark: the how-to's own words are "a resource", and its
            // example locks a file name. What is being locked is not this
            // picture's business.
            cylinder({ x: RES_X, y: RES_Y, w: STORE_W }),
            label({
              x: RES_X - STORE_W / 2 - 14, y: RES_Y, anchor: 'end',
              text: 'Shared\nresource', size: NAME,
            }),
          ],
        }),
      ];
    },
  };
}
