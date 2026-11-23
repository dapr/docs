// THE LIFECYCLE OF AN ACTIVITY ACTOR: three states, start to end. Activity
// actors are short-lived, which is why this one is a strip and the workflow
// actor's is a cycle.
//
// Replaces /images/workflow-overview/workflow-activity-actor-flowchart.png on
// developing-applications/building-blocks/workflow/workflow-architecture.md,
// under "Activity actors".
//
// Fact-check, against the five numbered steps printed directly beneath the
// image:
//   1. "Activity actors are activated when a workflow actor schedules an
//      activity task" - Invocation message received, where Start points.
//   2. "Activity actors then immediately call into the workflow application
//      to invoke the associated activity code" - Execute activity code.
//   3. "Once the activity code has finished running and has returned its
//      result, the activity actor sends a message to the parent workflow
//      actor with the execution results" - Send result to workflow actor.
//   4. "The activity actor then deactivates itself" - the End terminal.
//   5. "Once the results are sent, the workflow is triggered to move forward
//      to its next step" - that is the WORKFLOW actor's next turn, not a
//      state of this actor, and the source's picture does not draw it. It is
//      not drawn here either: the cycle in the picture above this one on the
//      page is where that happens, and a sixth shape would be this scene
//      answering for the one above it.
//
// The same two departures as `workflow-actor-flowchart`, for the same
// reasons, and they are kept identical on purpose - the two pictures sit
// within a screen of each other:
//   - the states are BOXES, not hexagons. A hexagon in these docs is an app
//     or a sidecar; the source's hexagons are its drawing tool's default.
//   - START and END are terminals, not tags hung off a shape's corner. The
//     source draws both as small rectangles; this set has a green terminal
//     for where a flow begins and an orange one for where it leaves.
//
// The box is FLOW.W by the same BOX_H the workflow actor lifecycle uses, so
// a state is one size on this page.

import { FLOW } from '../flow.mjs';
import { arrow, box, node } from '../shapes.mjs';
import { BOX_H } from './workflow-actor-flowchart.mjs';

const EDGE = 29;
const V_EDGE = 14;

const BOX_W = FLOW.W;
const GAP = FLOW.GAP_X;

const STATES = [
  'Invocation message\nreceived',
  'Execute activity code',
  'Send result to\nworkflow actor',
];

// Start, three states, End, in one row.
const START_X = EDGE + FLOW.NODE_R;
const stateX = (i) => START_X + FLOW.NODE_R + GAP + BOX_W / 2 + i * (BOX_W + GAP);
const END_X = stateX(STATES.length - 1) + BOX_W / 2 + GAP + FLOW.NODE_R;

const ROW_Y = V_EDGE + Math.max(FLOW.NODE_R, BOX_H / 2);

const W = Math.ceil(END_X + FLOW.NODE_R + EDGE);
const H = Math.ceil(ROW_Y + Math.max(FLOW.NODE_R, BOX_H / 2) + V_EDGE);

export default {
  width: W,
  height: H,
  title: 'The lifecycle of a Dapr workflow activity actor',
  desc:
    'A strip, left to right: a green Start terminal, then Invocation message '
    + 'received, then Execute activity code, then Send result to workflow '
    + 'actor, then an orange End terminal. Activity actors are short-lived - '
    + 'they are activated for one task, call the activity code, send the '
    + 'result to the parent workflow actor, and deactivate themselves.',

  build() {
    return [
      arrow({
        from: [START_X + FLOW.NODE_R, ROW_Y],
        to: [stateX(0) - BOX_W / 2 - 2, ROW_Y],
      }),
      STATES.slice(0, -1).map((_, i) => arrow({
        from: [stateX(i) + BOX_W / 2, ROW_Y],
        to: [stateX(i + 1) - BOX_W / 2 - 2, ROW_Y],
      })),
      arrow({
        from: [stateX(STATES.length - 1) + BOX_W / 2, ROW_Y],
        to: [END_X - FLOW.NODE_R - 2, ROW_Y],
      }),

      node({
        x: START_X, y: ROW_Y, r: FLOW.NODE_R, ...FLOW.start, label: 'Start',
      }),
      STATES.map((label, i) => box({
        x: stateX(i), y: ROW_Y, w: BOX_W, h: BOX_H, label, ...FLOW.step,
      })),
      node({
        x: END_X, y: ROW_Y, r: FLOW.NODE_R, ...FLOW.end, label: 'End',
      }),
    ];
  },
};
