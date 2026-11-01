// Task chaining: steps run in succession, each one's output feeding the next.
//
// Replaces workflows-chaining.png on
// developing-applications/building-blocks/workflow/workflow-patterns.md, under
// "multiple steps in a workflow are run in succession, and the output of one
// step may be passed as the input to the next step".
//
// This is the simplest scene in the workflow pattern set and it is the one the
// others are sized against: every pattern on that page uses FLOW.W, FLOW.H and
// FLOW.GAP_X, so the six diagrams read as one family down the page. Change a
// step's size here and the page stops being a set.
//
// Fact-check, against the page's own words: the prose says the output of one
// step "may" feed the next, so the arrows carry no payload label - naming them
// would claim more than the page does. The source image does the same.
//
// This follows the source image: one row, terminals naming themselves inside
// their circles, nothing else on the canvas.

import { FLOW } from '../flow.mjs';
import { arrow, box, group, node } from '../shapes.mjs';

const STEPS = ['Activity 1', 'Activity 2', 'Activity 3'];

// One row, left to right. Everything is placed from the left edge by a pitch,
// rather than spread across the canvas with slots(): slots() leaves half a
// pitch of margin at each end, which would be padding nobody chose.
const MARGIN = 40;
const PITCH = FLOW.W + FLOW.GAP_X;
// Every name is now inside the shape that carries it, so the tallest thing on
// the row is the terminal circle and the row simply sits a margin below it.
const ROW_Y = MARGIN + FLOW.NODE_R;

const startX = MARGIN + FLOW.NODE_R;
const firstStepX = startX + FLOW.NODE_R + FLOW.GAP_X + FLOW.W / 2;
const stepX = (i) => firstStepX + i * PITCH;
const endX = stepX(STEPS.length - 1) + FLOW.W / 2 + FLOW.GAP_X + FLOW.NODE_R;

export default {
  width: endX + FLOW.NODE_R + MARGIN,
  height: ROW_Y + FLOW.NODE_R + MARGIN,
  title: 'The task chaining workflow pattern',
  desc:
    'A workflow runs three activities one after another. Start leads to '
    + 'Activity 1, which leads to Activity 2, which leads to Activity 3, '
    + 'which leads to End.',

  build() {
    const boxes = STEPS.map((name, i) =>
      box({ x: stepX(i), y: ROW_Y, w: FLOW.W, h: FLOW.H, label: name, ...FLOW.step }));

    // Edge to edge: arrow() stops at each shape, so the gaps stay equal even
    // if a step's width changes.
    const hops = [
      arrow({ from: [startX + FLOW.NODE_R, ROW_Y], to: [stepX(0) - FLOW.W / 2, ROW_Y] }),
      ...STEPS.slice(1).map((_, i) =>
        arrow({
          from: [stepX(i) + FLOW.W / 2, ROW_Y],
          to: [stepX(i + 1) - FLOW.W / 2, ROW_Y],
        })),
      arrow({
        from: [stepX(STEPS.length - 1) + FLOW.W / 2, ROW_Y],
        to: [endX - FLOW.NODE_R, ROW_Y],
      }),
    ];

    return [
      group(hops),
      group(boxes),
      node({ x: startX, y: ROW_Y, r: FLOW.NODE_R, ...FLOW.start, label: 'Start' }),
      node({ x: endX, y: ROW_Y, r: FLOW.NODE_R, ...FLOW.end, label: 'End' }),
    ];
  },
};
