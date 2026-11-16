// HOW A REMINDER GUARDS ONE WORKFLOW TURN: the actor arms a reminder before
// it runs any application code, and deletes it once the step is done.
//
// Replaces /images/workflow-overview/workflow-actor-reminder-flow.png on
// developing-applications/building-blocks/workflow/workflow-architecture.md,
// under "Reminder usage and execution guarantees".
//
// FACT-CHECK - AND THE ONE PLACE THE SOURCE IMAGE AND THE PAGE DISAGREE.
//
// The image labels step 2 "Create recurring reminder". The page, in the
// paragraph directly above it, says the opposite:
//
//   "By default, prior to invoking application workflow code, the workflow
//    or activity actor will create a new reminder. These reminders are made
//    'one shot', meaning that they will expire after successful triggering."
//
// A repeating reminder is what the page describes as the FAST PATH, two
// paragraphs further down, and it is one janitor per instance rather than
// one per event: "the per-event reminders are replaced by a single repeating
// 'janitor' reminder per live workflow instance". So "recurring" in the
// image is the default path wearing the fast path's word.
//
// The prose wins, and step 2 is drawn as "Create one-shot reminder". This is
// a change of FACT, not of drawing, and it is on the list for the
// maintainer: the old diagram said recurring, the page says one shot, I drew
// one shot.
//
// The rest agrees with the page:
//   - "prior to invoking application workflow code" - 2 comes before 4, so
//     the reminder is armed before the workflow code is called at all.
//   - "If the application code executes without interruption, the reminder
//     is triggered and expired" - 3 and 6.
//   - "if the node or the sidecar hosting the associated workflow or
//     activity crashes, the reminder will reactivate the corresponding actor
//     and the execution will be retried, forever" - why 6 is last rather
//     than first.
//
// DRAWING DEPARTURES:
//
//   1. THE THREE SHAPES WEAR THIS SET'S VOCABULARY. The source draws all
//      three as hexagons in three colours. Here a hexagon is a Dapr process
//      or an app, and an ACTOR is a solid circle with its name inside it,
//      which is what `actors-communication` and the rest of the actors pages
//      draw. So the workflow actor is a circle, the actor runtime is the
//      Dapr hexagon it is part of, and the workflow code is the app hexagon
//      in the fill `workflow-overview` and `workflow-engine-protocol` give
//      the workflow app.
//
//   2. THE ACTOR RUNTIME IS TO THE LEFT, NOT BELOW, and the three runs
//      between it and the actor are stacked horizontals rather than the
//      source's diamond of diagonals. Drawn as the source has it, with the
//      runtime below and the two reminder runs leaving the circle's rim at
//      45 degrees, the vertical gap needed for the words made both runs
//      nearly vertical and the diamond collapsed into three parallel lines
//      with their names floating off to the side. Laid out across, this is
//      the same three-run stack `workflow-engine-protocol` uses at the top
//      of this page - a word sits on the run it names - and the two pictures
//      now read the same way.
//
//   3. THE STEP NUMBERS ARE WRITTEN "1." Like the other numbered pictures on
//      this page. The source writes a bold bare numeral here and a period in
//      the protocol image; one page numbers its steps one way.

import { APP, C } from '../engine.mjs';
import {
  arrow, group, hex, hexHalfWidth, hexHalfWidthAt, label, node,
} from '../shapes.mjs';
import { markHex } from '../icons.mjs';
import { NAME_DY as HEX_NAME_DY } from '../services.mjs';

const EDGE = 29;
const V_EDGE = 14;

const TEXT = 13;
const NAME = 15;

// One radius for all three, so no shape reads as more important than
// another: the picture is about what passes between them.
const R = 62;

// Set by the longest word each gap has to carry: "2. Create one-shot
// reminder" on the left, "5. Send workflow step result" on the right.
const LEFT_GAP = 250;
const RIGHT_GAP = 266;

// How far the outer runs sit from the row they share. The same spacing the
// protocol picture uses, and it is what lets each word sit on its own run
// rather than between two of them.
const RUN_DY = 44;
const STEP_DY = 26;

// The run that starts the whole thing comes down into the actor from above,
// because both of its sides are spoken for.
const STEP1_RUN = 76;

const WORD_DY = 11;

const RUNTIME_X = EDGE + hexHalfWidth(R);
const ACTOR_X = RUNTIME_X + hexHalfWidth(R) + LEFT_GAP + R;
const CODE_X = ACTOR_X + R + RIGHT_GAP + hexHalfWidth(R);

const ROW_Y = V_EDGE + STEP1_RUN + R;
const NAME_Y = Math.round(ROW_Y + R * HEX_NAME_DY);

const W = Math.ceil(CODE_X + hexHalfWidth(R) + EDGE);
const H = Math.ceil(NAME_Y + TEXT * 1.4 + V_EDGE);

// Where a horizontal run meets the circle at a given height. A circle is
// narrower away from its centre line, so a run drawn to the bounding box
// would stop short of the shape on every row but the middle one.
const circleDx = (dy) => Math.sqrt(R * R - dy * dy);

const word = (x, y, text, anchor = 'middle') => label({
  x, y, text, size: TEXT, weight: 500, color: C.caption, anchor, halo: true,
});

// The three runs between the actor and the runtime it arms its reminder in.
// Two of them go to the runtime and one comes back, which is the whole shape
// of the guarantee: arm, fire, delete.
const REMINDER_RUNS = [
  { dy: -RUN_DY, text: '2. Create one-shot reminder', toRuntime: true },
  { dy: 0, text: '3. Reminder fires', toRuntime: false },
  { dy: RUN_DY, text: '6. Delete reminder', toRuntime: true },
];

export default {
  width: W,
  height: H,
  title: 'How a Dapr workflow actor uses a reminder to guarantee one turn runs',
  desc:
    'In the middle, a circle named Workflow Actor. To its left, the Dapr '
    + 'hexagon named Actor runtime; to its right, an app hexagon named '
    + 'Workflow code. Six numbered steps: Schedule execution arrives at the '
    + 'actor from above; the actor creates a one-shot reminder in the actor '
    + 'runtime; the reminder fires back into the actor; the actor runs the '
    + 'workflow step in the workflow code; the code sends the workflow step '
    + 'result back; and the actor deletes the reminder. The reminder is armed '
    + 'before any application code runs, so a host that crashes mid-step is '
    + 'recovered when the reminder reactivates the actor.',

  build() {
    return [
      // ---- 1: in from above -------------------------------------------------
      arrow({
        from: [ACTOR_X, V_EDGE],
        to: [ACTOR_X, ROW_Y - R - 2],
      }),
      word(ACTOR_X + 12, V_EDGE + STEP1_RUN / 2, '1. Schedule execution', 'start'),

      // ---- 2, 3 and 6: the reminder ----------------------------------------
      REMINDER_RUNS.map(({ dy, text, toRuntime }) => {
        const y = ROW_Y + dy;
        const actorEdge = ACTOR_X - circleDx(dy);
        const runtimeEdge = RUNTIME_X + hexHalfWidthAt(R, dy);
        return [
          arrow({
            from: toRuntime ? [actorEdge, y] : [runtimeEdge, y],
            to: toRuntime ? [runtimeEdge + 2, y] : [actorEdge - 2, y],
          }),
          word((actorEdge + runtimeEdge) / 2, y - WORD_DY, text),
        ];
      }),

      // ---- 4 and 5: the step itself ----------------------------------------
      arrow({
        from: [ACTOR_X + circleDx(STEP_DY), ROW_Y - STEP_DY],
        to: [CODE_X - hexHalfWidthAt(R, -STEP_DY) - 2, ROW_Y - STEP_DY],
      }),
      word(
        (ACTOR_X + R + CODE_X - hexHalfWidth(R)) / 2,
        ROW_Y - STEP_DY - WORD_DY,
        '4. Run workflow step',
      ),
      arrow({
        from: [CODE_X - hexHalfWidthAt(R, STEP_DY), ROW_Y + STEP_DY],
        to: [ACTOR_X + circleDx(STEP_DY) + 2, ROW_Y + STEP_DY],
      }),
      word(
        (ACTOR_X + R + CODE_X - hexHalfWidth(R)) / 2,
        ROW_Y + STEP_DY - WORD_DY,
        '5. Send workflow step result',
      ),

      // ---- the shapes, over the lines that reach them -----------------------
      group({
        class: 'd-named-mark',
        children: [
          markHex({ x: RUNTIME_X, y: ROW_Y, r: R, mark: 'logo-blue', stroke: C.blue }),
          label({ x: RUNTIME_X, y: NAME_Y, text: 'Actor runtime', size: TEXT }),
        ],
      }),
      node({
        x: ACTOR_X,
        y: ROW_Y,
        r: R,
        fill: APP[2].fill,
        stroke: APP[2].stroke,
        ink: APP[2].ink,
        label: 'Workflow\nActor',
        labelInside: true,
        size: NAME,
      }),
      hex({
        x: CODE_X, y: ROW_Y, r: R, label: 'Workflow\ncode', size: NAME, ...APP[1],
      }),
    ];
  },
};
