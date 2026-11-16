// External system interaction: the workflow pauses until something outside it
// raises an event - here, a human approving a purchase order.
//
// Replaces workflow-human-interaction-pattern.png on
// developing-applications/building-blocks/workflow/workflow-patterns.md, under
// the page's five-step example, which this follows exactly:
//   1. a workflow is triggered when a purchase order is received
//   2. a rule determines a human needs to act
//   3. the workflow sends a notification requesting a human action
//   4. the workflow pauses and waits for approve or reject
//   5. if approval is not received in time, it performs compensation logic
//
// Fact-check: step 5 says the timeout path "performs some compensation logic,
// such as canceling the order", so the third branch is a real activity and not
// an error exit. The source draws it as an activity too.
//
// The gate's three ways out leave from three different POINTS of the diamond,
// which is what the source draws and what a diamond means: approved from the
// right point, rejected from the bottom, timed out from the left. The first
// draft ran all three from the right point onto a shared rail, which reads as
// one arrow splitting rather than as a decision.
//
// Where this departs from the source image, and why:
//   - the person is fluent-person, the house figure, rather than the source's
//     own outline. The skill retired hand-drawn people in favour of the glyph
//     because a drawn shape and a glyph beside it never match in weight.

import { C } from '../engine.mjs';
import { FLOW, note } from '../flow.mjs';
import {
  arrow, box, decision, decisionPoints, elbowArrow, group, node,
} from '../shapes.mjs';
import { icon, serviceInvocation, SI_W } from '../icons.mjs';

const MARGIN = 40;

// The left column: the service-invocation mark the notification reaches, and
// the person who raises the event. The source stacks them in one column and so
// does this.
const SIDE_X = MARGIN + 30;

// The spine sits far enough right that the gap between the person and the wait
// step is wider than the words riding on that arrow. "Approval Event" is about
// 95 units at size 12; a narrower gap puts the label over the box, which every
// geometric check still passes.
const SPINE_X = 300;
const BRANCH_X = 616;

const GATE_W = 110;
const GATE_H = 74;

const START_Y = MARGIN + FLOW.NODE_R;
const REQUEST_Y = START_Y + FLOW.NODE_R + 40 + FLOW.H / 2;
const WAIT_Y = REQUEST_Y + FLOW.H + FLOW.GAP_Y;
const GATE_Y = WAIT_Y + FLOW.H / 2 + 44 + GATE_H / 2;

// The first branch shares the gate's line, as the source draws it, so the
// approved path is a straight run out of the diamond's right point.
const BRANCH_PITCH = FLOW.H + FLOW.GAP_Y;
const BRANCH_Y = [GATE_Y, GATE_Y + BRANCH_PITCH, GATE_Y + 2 * BRANCH_PITCH];
const BRANCHES = [
  { name: 'Approved Activity', when: 'Is Approved' },
  { name: 'Rejected Activity', when: 'Is Rejected' },
  { name: 'TimeOut Activity', when: 'Is TimeOut' },
];

const END_X = BRANCH_X + FLOW.W / 2 + 90 + FLOW.NODE_R;
// The timeout branch comes home outside the terminal and turns in from the
// right, which is the only one of the three that cannot share a rail.
const FAR_X = END_X + FLOW.NODE_R + 52;
// The timeout branch leaves the gate to the LEFT, so it needs a column of its
// own clear of the diamond before it drops.
const LEFT_RAIL_X = SPINE_X - GATE_W / 2 - 38;

const when = (x, y, text) => note({ x, y, text });

export default {
  width: FAR_X + MARGIN,
  height: BRANCH_Y[2] + FLOW.H / 2 + MARGIN,
  title: 'The external system interaction workflow pattern',
  desc:
    'A workflow requests an approval, then pauses waiting for an external '
    + 'event. A person raises the approval event. The workflow then branches '
    + 'on whether the order was approved, rejected, or timed out, running the '
    + 'matching activity before it ends.',

  build() {
    const gate = decisionPoints({ x: SPINE_X, y: GATE_Y, w: GATE_W, h: GATE_H });
    const boxLeft = BRANCH_X - FLOW.W / 2;
    const boxRight = BRANCH_X + FLOW.W / 2;

    const spine = [
      arrow({ from: [SPINE_X, START_Y + FLOW.NODE_R], to: [SPINE_X, REQUEST_Y - FLOW.H / 2] }),
      arrow({ from: [SPINE_X, REQUEST_Y + FLOW.H / 2], to: [SPINE_X, WAIT_Y - FLOW.H / 2] }),
      arrow({ from: [SPINE_X, WAIT_Y + FLOW.H / 2], to: [SPINE_X, gate.top[1]] }),
    ];

    // One way out per point of the diamond. Each condition rides above the
    // horizontal run into its own activity, where the run is the full width of
    // the gap and the words have room.
    const ways = [
      arrow({ from: gate.right, to: [boxLeft, BRANCH_Y[0]] }),
      elbowArrow({ points: [gate.bottom, [SPINE_X, BRANCH_Y[1]], [boxLeft, BRANCH_Y[1]]] }),
      elbowArrow({
        points: [gate.left, [LEFT_RAIL_X, GATE_Y], [LEFT_RAIL_X, BRANCH_Y[2]], [boxLeft, BRANCH_Y[2]]],
      }),
    ];

    const conditions = BRANCHES.map((b, i) =>
      when((gate.right[0] + boxLeft) / 2, BRANCH_Y[i] - 16, b.when));

    // Home: the approved path runs straight in, the rejected one turns up into
    // the terminal's underside, and the timeout one comes back outside it and
    // turns in from the right. Three ways in, as the source draws them.
    const converge = [
      arrow({ from: [boxRight, BRANCH_Y[0]], to: [END_X - FLOW.NODE_R, BRANCH_Y[0]] }),
      elbowArrow({
        points: [[boxRight, BRANCH_Y[1]], [END_X, BRANCH_Y[1]], [END_X, GATE_Y + FLOW.NODE_R]],
      }),
      elbowArrow({
        points: [[boxRight, BRANCH_Y[2]], [FAR_X, BRANCH_Y[2]], [FAR_X, GATE_Y], [END_X + FLOW.NODE_R, GATE_Y]],
      }),
    ];

    return [
      group(spine),
      group(ways),
      group(converge),
      group(conditions),

      // The notification leaving the workflow for another service, and the
      // event arriving from the person. The activity reaches the mark with an
      // arrow of its own; the mark is a glyph, not a connector.
      arrow({ from: [SPINE_X - FLOW.W / 2, REQUEST_Y], to: [SIDE_X + SI_W / 2 + 12, REQUEST_Y] }),
      serviceInvocation({ x: SIDE_X, y: REQUEST_Y }),

      icon({ name: 'fluent-person', x: SIDE_X, y: WAIT_Y - 10, size: 44, color: C.navy }),
      arrow({ from: [SIDE_X + 26, WAIT_Y], to: [SPINE_X - FLOW.W / 2, WAIT_Y] }),
      when((SIDE_X + 26 + SPINE_X - FLOW.W / 2) / 2, WAIT_Y - 20, 'Approval Event'),

      box({ x: SPINE_X, y: REQUEST_Y, w: FLOW.W, h: FLOW.H, label: 'RequestApproval', ...FLOW.step }),
      box({ x: SPINE_X, y: WAIT_Y, w: FLOW.W, h: FLOW.H, label: 'Wait for event', ...FLOW.wait }),
      decision({ x: SPINE_X, y: GATE_Y, w: GATE_W, h: GATE_H, ...FLOW.wait }),

      group(BRANCHES.map((b, i) =>
        box({ x: BRANCH_X, y: BRANCH_Y[i], w: FLOW.W, h: FLOW.H, label: b.name, ...FLOW.step }))),

      node({ x: SPINE_X, y: START_Y, r: FLOW.NODE_R, ...FLOW.start, label: 'Start' }),
      node({ x: END_X, y: GATE_Y, r: FLOW.NODE_R, ...FLOW.end, label: 'End' }),
    ];
  },
};
