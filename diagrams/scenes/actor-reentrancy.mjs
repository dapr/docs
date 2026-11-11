// THE TWO CHAINS REENTRANCY ALLOWS: a coordinator an actor calls back into,
// and an actor calling a method on itself.
//
// Replaces /images/actor-reentrancy.png on
// developing-applications/building-blocks/actors/actor-reentrancy.md, under
// "Examples of chains that reentrancy allows are shown below".
//
// Fact-check, against the prose and the code block directly above the image:
//   - "An actor wants to call a method on itself" - the right-hand picture.
//   - "Actors are used in workflows to perform work, then call back onto the
//     coordinating actor" - the left-hand one. Note that the return leg is a
//     CALL, not a response: the page's own chain is `ActorA -> Actor B ->
//     Actor A`, and that third hop re-entering the locked coordinator is the
//     whole point of the feature. Drawn as two separate arrows, which is what
//     the source draws and what the chain says.
//   - the page lists the self-call FIRST and the workflow case second, while
//     the image draws them the other way round. Left to right is not an
//     ordering here - neither picture follows from the other - so the
//     source's arrangement is kept.
//
// Where this departs from the source image, and why:
//   - THE TWO CHAINS ARE NAMED under the pictures they draw, in the page's
//     own code font and its own words - `ActorA -> Actor B -> Actor A` and
//     `Actor A -> Actor A`. The source leaves the reader to work out which
//     half answers which bullet, and the page states both chains three
//     paragraphs above in exactly this form.
//   - the workers take DIFFERENT fills. The source paints both pale blue and
//     the coordinator dark, which says "coordinator and workers"; in this set
//     a fill says WHICH actor, and two workers are two actor instances. Two
//     hexagons may share a fill only if they share a name, which
//     diagrams/app-colour.test.mjs enforces.
//   - the self-call is an orthogonal loop rather than the source's drawn arc:
//     every run in this set turns at right angles, and a single curved arrow
//     in a drawing of straight ones reads as a different kind of thing.
//   - no drop shadows. Nothing in this set has one.

import { APP } from '../engine.mjs';
import {
  arrow, elbowArrow, group, hex, hexHalfWidth, label,
} from '../shapes.mjs';

const EDGE = 29;
const V_EDGE = 14;

// 13, the size render-width.mjs is calibrated against.
const TEXT = 13;

// A shape's NAME scales with the shape, so it is not the scene's body type.
// 16 is what the longest line here wants: "Coordinator" is eleven characters
// and a hexagon is 1.732r across, so at APP_R it clears the sloping edges by
// half an em each side - the rule `holds every shape's own name inside it`.
const NAME = 16;
const APP_R = 70;
const APP_HALF = hexHalfWidth(APP_R);

// How far the two legs of a pair stand off the line between the shapes they
// join, and how far their words stand off the leg.
const LEG_OFF = 13;
const WORD_OFF = 30;

// ---- the coordinator and its two workers ------------------------------------
const TOP_Y = Math.round(V_EDGE + APP_R);
// Deep enough that the diagonal legs, and the words riding beside them, have
// a run to be read along.
const DROP = 224;
const BOT_Y = TOP_Y + DROP;

// Wide enough for the inner pair of words to sit between the two inner legs
// without either touching: it is the middle of this picture that crowds, not
// the outside.
const SPREAD = 196;

const CX = Math.round(EDGE + SPREAD + APP_HALF);
const COORD = { x: CX, y: TOP_Y, r: APP_R, hex: true };
const WORK_1 = { x: CX - SPREAD, y: BOT_Y, r: APP_R, hex: true };
const WORK_2 = { x: CX + SPREAD, y: BOT_Y, r: APP_R, hex: true };

const LEFT_RIGHT = CX + SPREAD + APP_HALF;

// ---- and, apart from them, an actor calling itself ---------------------------
const GROUP_GAP = 120;

// The loop runs out of the hexagon's right face, down, and back into it. How
// far out it goes is what its words need inside it, measured on the rendered
// page, with air at both ends.
const LOOP_W = 86;        // "Call local" / "method", the longer line
const LOOP_PAD = 20;
const LOOP_DX = LOOP_W + LOOP_PAD * 2;
// The loop leaves and returns clear of the shape's own middle, so the two
// ends read as two ends rather than as one line doubled back on itself.
const LOOP_DY = 30;

const SELF_X = Math.round(LEFT_RIGHT + GROUP_GAP + APP_HALF);
const SELF = { x: SELF_X, y: BOT_Y, r: APP_R, hex: true };
const LOOP_X = SELF_X + APP_HALF + LOOP_DX;

// ---- the chains, named under what they draw ---------------------------------
const CAPTION_DY = 38;
const CAPTION_Y = Math.round(BOT_Y + APP_R + CAPTION_DY);

const W = Math.ceil(LOOP_X + EDGE);
const H = Math.ceil(CAPTION_Y + TEXT + V_EDGE);

// A PAIR OF LEGS ON A DIAGONAL. Two arrows between the same two shapes have
// to stand off the line between them, or they are one line with a head at
// each end - and the ORDER is what this picture is about. The offset is
// perpendicular to the run rather than horizontal: shifted sideways, the two
// legs of the left pair would splay and the right pair's would converge.
//
// `outward` is the side the first leg takes, which is the far side from the
// middle of the picture: the source puts "start work" outside each pair and
// "work complete" between them, and so does this.
function pair({ from, to, outward, down, up }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  const px = (-dy / len) * outward;
  const py = (dx / len) * outward;
  const shift = (p, k) => ({ ...p, x: p.x + px * k, y: p.y + py * k });
  const mid = (k) => ({
    x: (from.x + to.x) / 2 + px * k,
    y: (from.y + to.y) / 2 + py * k,
  });
  const out = mid(LEG_OFF + WORD_OFF);
  const back = mid(-LEG_OFF - WORD_OFF);
  return group([
    arrow({ from: shift(from, LEG_OFF), to: shift(to, LEG_OFF) }),
    arrow({ from: shift(to, -LEG_OFF), to: shift(from, -LEG_OFF) }),
    // HALOED: these words sit in the corridor between two diagonal legs,
    // and the legs of the OTHER pair reach across it. Ground behind a
    // label a line crosses is what the rendered check of that name wants.
    label({ x: out.x, y: out.y, text: down, size: TEXT, halo: true }),
    label({ x: back.x, y: back.y, text: up, size: TEXT, halo: true }),
  ]);
}

export default {
  width: W,
  height: H,
  title: 'The two call chains actor reentrancy allows',
  desc:
    'On the left, a green hexagon named Coordinator Actor at the top, with a '
    + 'blue hexagon named Worker Actor 1 below left and a gold hexagon named '
    + 'Worker Actor 2 below right. Each worker is joined to the coordinator by '
    + 'two arrows: start work running down to the worker, and work complete '
    + 'running back up into the coordinator. Under them, the chain ActorA -> '
    + 'Actor B -> Actor A. On the right, a teal hexagon named Actor with an '
    + 'arrow leaving its right side, turning down and returning into it, '
    + 'labelled Call local method; under it, the chain Actor A -> Actor A.',

  build() {
    return [
      // ---- the workflow chain: out to a worker, and back into the lock ----
      pair({
        from: COORD, to: WORK_1, outward: 1, down: 'start work', up: 'work\ncomplete',
      }),
      pair({
        from: COORD, to: WORK_2, outward: -1, down: 'start work', up: 'work\ncomplete',
      }),

      // ---- the self-call: out of one face and back into the other ---------
      elbowArrow({
        points: [
          [SELF_X + APP_HALF + 2, BOT_Y - LOOP_DY],
          [LOOP_X, BOT_Y - LOOP_DY],
          [LOOP_X, BOT_Y + LOOP_DY],
          [SELF_X + APP_HALF + 2, BOT_Y + LOOP_DY],
        ],
      }),
      label({
        x: (SELF_X + APP_HALF + LOOP_X) / 2, y: BOT_Y,
        text: 'Call local\nmethod', size: TEXT,
      }),

      // ---- the shapes, over the lines that reach them ---------------------
      hex({ x: COORD.x, y: COORD.y, r: APP_R, label: 'Coordinator\nActor', size: NAME, ...APP[0] }),
      hex({ x: WORK_1.x, y: WORK_1.y, r: APP_R, label: 'Worker\nActor 1', size: NAME, ...APP[1] }),
      hex({ x: WORK_2.x, y: WORK_2.y, r: APP_R, label: 'Worker\nActor 2', size: NAME, ...APP[2] }),
      hex({ x: SELF.x, y: SELF.y, r: APP_R, label: 'Actor', size: NAME, ...APP[3] }),

      // ---- the chains the page lists, under the pictures that draw them ---
      // An ARROW CHARACTER, not the page's `->`. Set in the code face, `->`
      // ligates into an arrow and swallows the space in front of it, so
      // "Actor A -> Actor B" arrives as "Actor A→ Actor B"; and these are
      // names of chains rather than code, which is why they are in the body
      // face at the body weight.
      label({
        x: CX, y: CAPTION_Y, text: 'Actor A → Actor B → Actor A',
        size: TEXT, weight: 400,
      }),
      label({
        x: (SELF_X - APP_HALF + LOOP_X) / 2, y: CAPTION_Y, text: 'Actor A → Actor A',
        size: TEXT, weight: 400,
      }),
    ];
  },
};
