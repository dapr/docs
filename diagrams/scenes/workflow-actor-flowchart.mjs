// THE LIFECYCLE OF A WORKFLOW ACTOR: a cycle of five states that returns to
// idle and waits for the next message.
//
// Replaces /images/workflow-overview/workflow-actor-flowchart.png on
// developing-applications/building-blocks/workflow/workflow-architecture.md,
// under "Workflow actors".
//
// Fact-check, against the five numbered steps printed directly beneath the
// image, which are the same five states written out:
//   1. "A workflow actor is activated when it receives a new message" -
//      Message received, which is where Start points.
//   2. "New messages then trigger the associated workflow code (in your
//      application) to run and return an execution result" - Execute
//      workflow code.
//   3. "Once the result is received, the actor schedules any tasks as
//      necessary" - Schedule tasks.
//   4. "After scheduling, the actor updates its state in the state store" -
//      Save state.
//   5. "Finally, the actor goes idle until it receives another message" -
//      Idle, and the run back up to Message received is that next message.
// Every state and every edge agrees with the list. The cycle has no End,
// which is the point of step 5: the actor does not finish, it goes idle and
// may be unloaded.
//
// TWO DELIBERATE DEPARTURES FROM THE SOURCE:
//
//   1. THE STATES ARE BOXES, NOT HEXAGONS. The source draws all five as
//      hexagons, which in these docs is not a free shape: a hexagon is a
//      Dapr app or a sidecar, in every other diagram in the set. Five
//      hexagons here would say five apps. The source's hexagons are its
//      drawing tool's default shape and carry no meaning the prose names,
//      so the states are drawn as the flow kit draws a step.
//
//   2. START IS A TERMINAL, not a tag on the first state. The source hangs
//      a small "Start" rectangle off the first hexagon's corner. This set
//      says where a flow begins with a green terminal circle, and that is
//      what the tag means.
//
// The box is FLOW.W by BOX_H, the same as `workflow-activity-actor-flowchart`
// directly below it on the page. Those two pictures are the same kind of
// thing - the lifecycle of one actor - and a state that is one size in the
// first and another in the second would read as a difference in kind.

import { FLOW } from '../flow.mjs';
import {
  arrow, box, elbowArrow, node,
} from '../shapes.mjs';

const EDGE = 29;
const V_EDGE = 14;

const BOX_W = FLOW.W;
// Deep enough for the two-line names the activity lifecycle beside this one
// carries. Every box on both pages is this height; see the note above.
export const BOX_H = 58;

const COL_GAP = 90;
const ROW_GAP = 56;
// Between the Start terminal and the state it points at.
const START_GAP = 40;

const C1 = EDGE + BOX_W / 2;
const C2 = C1 + BOX_W + COL_GAP;
const C3 = C2 + BOX_W + COL_GAP;

const ROW_START = V_EDGE + FLOW.NODE_R;
const R1 = ROW_START + FLOW.NODE_R + START_GAP + BOX_H / 2;
const R2 = R1 + BOX_H / 2 + ROW_GAP + BOX_H / 2;
const R3 = R2 + BOX_H / 2 + ROW_GAP + BOX_H / 2;

const W = Math.ceil(C3 + BOX_W / 2 + EDGE);
const H = Math.ceil(R3 + BOX_H / 2 + V_EDGE);

const state = (x, y, label) => box({
  x, y, w: BOX_W, h: BOX_H, label, ...FLOW.step,
});

export default {
  width: W,
  height: H,
  title: 'The lifecycle of a Dapr workflow actor',
  desc:
    'A cycle of five states. A green Start terminal points down into Message '
    + 'received, which leads right to Execute workflow code, then down the '
    + 'right-hand side to Schedule tasks, then back left to Save state, then '
    + 'left to Idle, and from Idle up the left-hand side to Message received '
    + 'again. There is no end: the actor goes idle and waits for the next '
    + 'message, and may be unloaded from memory while it waits.',

  build() {
    return [
      // ---- in at the top, and round ---------------------------------------
      arrow({
        from: [C1, ROW_START + FLOW.NODE_R],
        to: [C1, R1 - BOX_H / 2 - 2],
      }),
      arrow({
        from: [C1 + BOX_W / 2, R1],
        to: [C2 - BOX_W / 2 - 2, R1],
      }),
      elbowArrow({
        points: [
          [C2 + BOX_W / 2, R1],
          [C3, R1],
          [C3, R2 - BOX_H / 2 - 2],
        ],
      }),
      elbowArrow({
        points: [
          [C3, R2 + BOX_H / 2],
          [C3, R3],
          [C2 + BOX_W / 2 + 2, R3],
        ],
      }),
      arrow({
        from: [C2 - BOX_W / 2, R3],
        to: [C1 + BOX_W / 2 + 2, R3],
      }),
      // ---- and back up to wait for the next message ------------------------
      arrow({
        from: [C1, R3 - BOX_H / 2],
        to: [C1, R1 + BOX_H / 2 + 2],
      }),

      // ---- the shapes, over the lines that reach them -----------------------
      node({
        x: C1, y: ROW_START, r: FLOW.NODE_R, ...FLOW.start, label: 'Start',
      }),
      state(C1, R1, 'Message received'),
      state(C2, R1, 'Execute workflow code'),
      state(C3, R2, 'Schedule tasks'),
      state(C2, R3, 'Save state'),
      state(C1, R3, 'Idle'),
    ];
  },
};
