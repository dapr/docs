// WHAT A WORKFLOW ACTOR DOES WITH THE STATE STORE ON ONE TURN: it loads the
// history it already has, runs the next step, and APPENDS what that produced.
//
// Replaces /images/workflow-overview/workflow-state-store-interactions.png on
// developing-applications/building-blocks/workflow/workflow-architecture.md,
// under "State store usage".
//
// Fact-check, against the paragraphs the image sits under:
//   - "workflows save their state incrementally by appending to a history
//     log" - which is why step 3 is Append and why the two new rows are
//     drawn at the END of the log rather than replacing it.
//   - "The history log for a workflow is distributed across multiple state
//     store keys so that each 'checkpoint' only needs to append the newest
//     entries" - one row per key, and only the last two are new.
//   - "The size of each checkpoint is determined by the number of concurrent
//     actions scheduled by the workflow before it goes into an idle state" -
//     the source's own example checkpoints two activities at once, and the
//     rows are the source's own words.
//   - "(cached)" on step 1 is the source's, and the page backs it: the
//     stateful workflow client section says a warm worker is sent only the
//     events added since its previous turn.
// Nothing here disagrees with the prose.
//
// THREE DEPARTURES FROM THE SOURCE:
//
//   1. THE STORE IS WIDE, AND THE LOG HANGS OFF IT ON A LEADER. The source
//      draws a tall cylinder with the rows inside it. `cylinder()` in this
//      set REFUSES to be taller than it is wide - it throws, because a store
//      lying on its side is a broker and the two must not be confusable - so
//      a tall cylinder with a list in its belly is not a shape this set has.
//      What it does have is the dashed leader `actors-game-example` uses to
//      say "that thing is this thing", and the log is drawn on one. The
//      relation is the same and the store still reads as the store.
//
//   2. THE NEW ROWS ARE IN THE LOG, MARKED, rather than in a second block
//      floating outside the cylinder. The source puts activity2 done and
//      activity3 done in their own box overlapping the cylinder's edge, which
//      is how it shows them arriving. Here they are the last two rows of the
//      one log, outlined in teal where the others are plain, and step 3
//      points at them. That says the same thing - these two are what this
//      turn added - without drawing the log twice.
//
//   3. THE ACTOR IS A CIRCLE AND THE CODE IS AN APP HEXAGON, as in
//      `workflow-actor-reminder-flow` a few paragraphs above. The source
//      draws both as hexagons. An actor in these docs is a solid circle.

import { APP, C, el } from '../engine.mjs';
import {
  arrow, box, cylinder, elbowArrow, group, hex, hexHalfWidth, hexHalfWidthAt,
  label, lineWidth, node, roundedPath,
} from '../shapes.mjs';

const EDGE = 29;
const V_EDGE = 14;

const TEXT = 13;
const NAME = 15;

// The same radius `workflow-actor-reminder-flow` gives all three of its
// shapes, a few paragraphs above this one on the page. The first draft had
// the actor at 54 here and 62 there - the same actor, two sizes, two
// pictures a reader meets within one screen.
const ACTOR_R = 62;
const CODE_R = 62;

// The store. Its width sets its height - a cylinder in this set is
// STORE_RATIO wider than it is tall - and the width is set by its own name
// with room around it.
const STORE_W = 200;
const STORE_H = STORE_W / 1.2;

// One row per state store key. The width is the longest key in the source's
// example, "activity1 done", set in the page's code font.
const ROW_W = 164;
const ROW_H = 27;

const KEPT = ['started', 'call activity1', 'activity1 done', 'call activity2', 'call activity3'];
const ADDED = ['activity2 done', 'activity3 done'];
const ROWS = [...KEPT, ...ADDED];

// Between the store and the log it holds, and between the log and the actor.
const LEADER = 44;
const GAP_TO_ACTOR = 290;
const GAP_TO_CODE = 250;

const WORD_DY = 11;

const STORE_X = EDGE + STORE_W / 2;
const STORE_Y = V_EDGE + STORE_H / 2;

const LOG_X = STORE_X - ROW_W / 2;
const LOG_TOP = STORE_Y + STORE_H / 2 + LEADER;
const LOG_H = ROW_H * ROWS.length;
const rowY = (i) => LOG_TOP + ROW_H * (i + 0.5);

const ACTOR_X = STORE_X + STORE_W / 2 + GAP_TO_ACTOR + ACTOR_R;
const CODE_X = ACTOR_X + ACTOR_R + GAP_TO_CODE + hexHalfWidth(CODE_R);
const ROW_Y = STORE_Y;

// Step 3 points at the rows this turn added, which is where the log stops
// being a record and starts being an answer.
const ADDED_Y = (rowY(KEPT.length) + rowY(ROWS.length - 1)) / 2;

const W = Math.ceil(CODE_X + hexHalfWidth(CODE_R) + EDGE);
const H = Math.ceil(Math.max(LOG_TOP + LOG_H, ROW_Y + CODE_R) + V_EDGE);

const word = (x, y, text, anchor = 'middle') => label({
  x, y, text, size: TEXT, weight: 500, color: C.caption, anchor, halo: true,
});

// One state store key. A rect and a mono label, because these are keys and
// the page sets them in code font in the table above this picture. box()
// cannot set mono, which is why this is drawn here rather than called.
const logRow = (text, i, isNew) => group([
  el('rect', {
    x: LOG_X,
    y: LOG_TOP + ROW_H * i,
    width: ROW_W,
    height: ROW_H,
    fill: C.bg,
    stroke: isNew ? C.teal : C.caption,
    'stroke-width': lineWidth(),
  }),
  label({
    x: LOG_X + 10,
    y: rowY(i),
    text,
    size: TEXT - 1,
    weight: 400,
    anchor: 'start',
    mono: true,
    color: C.body,
  }),
]);

export default {
  width: W,
  height: H,
  title: 'What a workflow actor reads from and writes to the state store on one turn',
  desc:
    'On the left, a gold cylinder named State store, with a dashed leader down '
    + 'to the history log it holds: seven rows, one per state store key - '
    + 'started, call activity1, activity1 done, call activity2, call '
    + 'activity3, and then activity2 done and activity3 done, the two this '
    + 'turn added, outlined in teal. In the middle a circle named Workflow '
    + 'Actor, and on the right an app hexagon named Workflow code. Three '
    + 'steps: load the existing history, which is cached; execute the next '
    + 'step in the workflow code and get its result; and append the new '
    + 'history to the log.',

  build() {
    return [
      // ---- the store, and the log it holds ---------------------------------
      roundedPath({
        points: [
          [STORE_X, STORE_Y + STORE_H / 2],
          [STORE_X, LOG_TOP],
        ],
        color: C.caption,
        dash: true,
      }),

      // ---- 1: load what is already there -----------------------------------
      arrow({
        from: [STORE_X + STORE_W / 2, ROW_Y],
        to: [ACTOR_X - ACTOR_R - 2, ROW_Y],
      }),
      word(
        (STORE_X + STORE_W / 2 + ACTOR_X - ACTOR_R) / 2,
        ROW_Y - WORD_DY - TEXT * 0.6,
        '1. Load existing history\n(cached)',
      ),

      // ---- 2: run the step --------------------------------------------------
      arrow({
        from: [ACTOR_X + ACTOR_R, ROW_Y],
        to: [CODE_X - hexHalfWidthAt(CODE_R, 0) - 2, ROW_Y],
      }),
      arrow({
        from: [CODE_X - hexHalfWidthAt(CODE_R, 0), ROW_Y],
        to: [ACTOR_X + ACTOR_R + 2, ROW_Y],
      }),
      word(
        (ACTOR_X + ACTOR_R + CODE_X - hexHalfWidth(CODE_R)) / 2,
        ROW_Y - WORD_DY - TEXT * 0.6,
        '2. Execute\nnext step',
      ),

      // ---- 3: and append what it produced -----------------------------------
      elbowArrow({
        points: [
          [ACTOR_X, ROW_Y + ACTOR_R],
          [ACTOR_X, ADDED_Y],
          [LOG_X + ROW_W + 2, ADDED_Y],
        ],
      }),
      word(
        (LOG_X + ROW_W + ACTOR_X) / 2,
        ADDED_Y - WORD_DY,
        '3. Append new history',
      ),

      // ---- the shapes, over the lines that reach them -----------------------
      cylinder({ x: STORE_X, y: STORE_Y, w: STORE_W, label: 'State store' }),
      group({
        class: 'd-named-mark',
        children: ROWS.map((text, i) => logRow(text, i, i >= KEPT.length)),
      }),
      node({
        x: ACTOR_X,
        y: ROW_Y,
        r: ACTOR_R,
        fill: APP[2].fill,
        stroke: APP[2].stroke,
        ink: APP[2].ink,
        label: 'Workflow\nActor',
        labelInside: true,
        size: TEXT,
      }),
      hex({
        x: CODE_X, y: ROW_Y, r: CODE_R, label: 'Workflow\ncode', size: NAME, ...APP[1],
      }),
    ];
  },
};
