// Compensation, the saga pattern: when a step fails partway through, the steps
// that already succeeded are undone in reverse order.
//
// Replaces workflows-compensation.png on
// developing-applications/building-blocks/workflow/workflow-patterns.md, under
// the page's e-commerce example.
//
// Fact-check, against that example, which this follows exactly:
//   - forward: reserve inventory, process payment, ship order.
//   - compensating: "The shipment is canceled. The payment is refunded. The
//     inventory reservation is released." That is REVERSE order, and the
//     reversal is the whole point of the pattern, so the catch column is drawn
//     in exactly the order the page lists.
//   - the page calls the regions nothing in particular; `try` and `catch` come
//     from the source image and are kept, because the code samples below the
//     diagram are written as try/catch.
//
// Where this departs from the source image, and why:
//   - terminals name themselves under their circles. See flow.mjs.
//   - the gate is unlabelled and the condition rides on the arrows as Yes and
//     No, which is what the source does. "IsException" sits above the diamond
//     rather than inside it: a diamond is widest at its centre line and that
//     name does not fit there at a readable size.

import { C } from '../engine.mjs';
import { FLOW } from '../flow.mjs';
import { arrow, box, decision, decisionPoints, elbowArrow, group, label, node, region } from '../shapes.mjs';

const MARGIN = 40;

const TRY = ['Reserve Inventory', 'Process Payment', 'Ship Order'];
const CATCH = ['Cancel Shipment', 'Refund Payment', 'Release Inventory'];

const COL_Y = [112, 112 + FLOW.H + FLOW.GAP_Y, 112 + 2 * (FLOW.H + FLOW.GAP_Y)];
const MID_Y = COL_Y[1];

const START_X = MARGIN + FLOW.NODE_R;
const TRY_X = START_X + FLOW.NODE_R + 70 + FLOW.W / 2;
const GATE_X = TRY_X + FLOW.W / 2 + 120;
const CATCH_X = GATE_X + 120 + FLOW.W / 2;
const END_Y = COL_Y[2] + 110;

const GATE_W = 96;
const GATE_H = 64;

// A region is padded from how far its caption pill hangs inside, not from its
// border: `captionReach()` is that distance and the skill says to pad from it.
const PAD = 26;
const regionFor = (x, caption) => region({
  x: x - FLOW.W / 2 - PAD,
  y: COL_Y[0] - FLOW.H / 2 - PAD,
  w: FLOW.W + PAD * 2,
  h: (COL_Y[2] + FLOW.H / 2) - (COL_Y[0] - FLOW.H / 2) + PAD * 2,
  caption,
  captionW: 54,
});

export default {
  width: CATCH_X + FLOW.W / 2 + PAD + MARGIN,
  height: END_Y + FLOW.NODE_R + 34,
  title: 'The compensation workflow pattern',
  desc:
    'A workflow reserves inventory, processes payment and ships an order. If '
    + 'any step raises an exception, the compensating activities run in '
    + 'reverse order: cancel the shipment, refund the payment, release the '
    + 'inventory reservation.',

  build() {
    // In at the left point, Yes out of the right, No out of the bottom: one
    // way per point of the diamond, which is what makes it read as a decision.
    const gate = decisionPoints({ x: GATE_X, y: MID_Y, w: GATE_W, h: GATE_H });

    const column = (x, names) => [
      group(names.map((name, i) =>
        box({ x, y: COL_Y[i], w: FLOW.W, h: FLOW.H, label: name, ...FLOW.step }))),
      group(names.slice(1).map((_, i) =>
        arrow({ from: [x, COL_Y[i] + FLOW.H / 2], to: [x, COL_Y[i + 1] - FLOW.H / 2] }))),
    ];

    return [
      regionFor(TRY_X, 'try'),
      regionFor(CATCH_X, 'catch'),

      // In, across to the gate, and out of the catch column to End.
      arrow({ from: [START_X + FLOW.NODE_R, MID_Y], to: [TRY_X - FLOW.W / 2 - PAD, MID_Y] }),
      arrow({ from: [TRY_X + FLOW.W / 2 + PAD, MID_Y], to: gate.left }),
      arrow({ from: gate.right, to: [CATCH_X - FLOW.W / 2 - PAD, MID_Y] }),

      // No: straight down the middle to End. Yes: through the catch column,
      // which then drops to the same terminal.
      elbowArrow({ points: [gate.bottom, [GATE_X, END_Y], [GATE_X + 60, END_Y]] }),
      elbowArrow({
        points: [
          [CATCH_X, COL_Y[2] + FLOW.H / 2],
          [CATCH_X, END_Y],
          [GATE_X + 60 + FLOW.NODE_R * 2, END_Y],
        ],
        heads: 'end',
      }),

      ...column(TRY_X, TRY),
      ...column(CATCH_X, CATCH),

      decision({ x: GATE_X, y: MID_Y, w: GATE_W, h: GATE_H, ...FLOW.wait }),
      label({ x: GATE_X, y: MID_Y - GATE_H / 2 - 18, text: 'IsException', size: 12, weight: 600 }),
      label({ x: (gate.right[0] + CATCH_X - FLOW.W / 2 - PAD) / 2, y: MID_Y - 14, text: 'Yes', size: 12, weight: 500, color: C.caption }),
      label({ x: GATE_X + 14, y: gate.bottom[1] + 26, text: 'No', size: 12, weight: 500, color: C.caption, anchor: 'start' }),

      node({ x: START_X, y: MID_Y, r: FLOW.NODE_R, ...FLOW.start, label: 'Start' }),
      node({ x: GATE_X + 60 + FLOW.NODE_R, y: END_Y, r: FLOW.NODE_R, ...FLOW.end, label: 'End' }),
    ];
  },
};
