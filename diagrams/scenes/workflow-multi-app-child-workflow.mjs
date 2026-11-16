// A multi-application CHILD WORKFLOW call: a workflow on App1 runs a whole
// second workflow on App2 and waits for it.
//
// Replaces workflow-multi-app-child-workflow.png on
// developing-applications/building-blocks/workflow/workflow-multi-app.md,
// above the three SDK snippets, every one of which calls `Workflow2` with the
// target app `App2`. The names in the drawing are those names.
//
// What makes this different from the activity diagram above it on the same
// page, and the reason both are worth drawing: the thing running on App2 is
// not one step but a workflow with its own Start and End. The page's own
// wording - "an activity OR A CHILD WORKFLOW will be executed on a different
// application" - is the distinction, and the regions carry it.
//
// Fact-check: the page says the target "executes the activity or child
// workflow, and returns the result to the parent workflow of the originating
// app ID", so Workflow1 is still open while Workflow2 runs and the return
// arrow comes back INTO the call box. The source image draws it that way.
//
// Where this departs from the source image, and why:
//   - App2 is the sky hexagon, APP[1]. The source draws both applications
//     green, which in this set means they are the same application.
//   - the two workflow regions are the house region(), which is what the
//     source draws here too - this one needed no translation.

import { APP } from '../engine.mjs';
import { FLOW, flowLane } from '../flow.mjs';
import { arrow, box, elbowArrow, group, hex, hexHalfWidth, node, slots } from '../shapes.mjs';

const MARGIN = 40;
const HEX_R = 46;
const HEX_HALF = hexHalfWidth(HEX_R);

// The call box carries a sentence rather than a name, so it is wider than
// FLOW.W. "call child workflow (Workflow2)" is the longest line in the set.
const CALL_W = 268;

const APP_X = MARGIN + HEX_HALF;
const LANE_X = APP_X + HEX_HALF + 34;

const R1 = MARGIN + 60;
const R2 = R1 + 244;

const START_X = LANE_X + FLOW.PAD + FLOW.NODE_R;
const CALL_X = START_X + FLOW.NODE_R + 54 + CALL_W / 2;
const END_X = CALL_X + CALL_W / 2 + 96 + FLOW.NODE_R;

// Workflow2's own row, spread across the same span. `slots()` is the regular
// builder's way of spacing a row between two fixed ends, and it is what this
// should have used from the start: laid out by accumulated offsets instead,
// the activity landed 54 units left of centre, so Workflow2's single step sat
// under Workflow1's call box rather than between its own Start and End. One
// item between two ends is the midpoint, and now it says so.
const [ACT_X] = slots(START_X, END_X, 1);

const LANE_W = END_X + FLOW.NODE_R + FLOW.PAD - LANE_X;
// Both lanes hold a Start and an End, so both take the taller lane height.
const LANE_H = FLOW.LANE_TERMINAL_H;

// The band both crossing legs run along. They share it because they never
// share any of it: the leg going down runs left from the call box's left half,
// the leg coming back runs left from Workflow2's End, and the two x ranges do
// not touch. The source image puts them on one line for the same reason.
const MID = (R1 + LANE_H / 2 + R2 - LANE_H / 2) / 2;
const DOWN_X = CALL_X - 64;
const UP_X = CALL_X + 64;

// The caption sits to the RIGHT of the leg that drops into the lane, not at
// the default inset. A region's pill is drawn with the region, before the
// arrows, so a line that crosses it is painted OVER it and the pill is no
// ground at all - which is exactly what the rendered suite failed on. The
// source image places its captions the same way, right of the Start.
const CAPTION_X = START_X + FLOW.NODE_R + 64;

const lane = (y, caption, captionW) =>
  flowLane({ x: LANE_X, y: y - LANE_H / 2, w: LANE_W, h: LANE_H, caption, captionW, captionX: CAPTION_X });

export default {
  width: END_X + FLOW.NODE_R + FLOW.PAD + MARGIN,
  height: R2 + LANE_H / 2 + MARGIN,
  title: 'A workflow calling a child workflow on another application',
  desc:
    'Workflow1 runs on App1. It starts, calls the child workflow Workflow2 on '
    + 'App2, and waits. Workflow2 runs on App2 with its own start, an '
    + 'activity, and its own end, and its result returns to the call in '
    + 'Workflow1, which then ends.',

  build() {
    return [
      // Measured at FLOW.CAPTION_SIZE with half an em clear of each end.
      // "Workflow2" is the wider of the two and sets the width; both take it,
      // so the pair reads as a pair.
      lane(R1, 'Workflow1', 90),
      lane(R2, 'Workflow2', 90),

      // Down into Workflow2's Start, and back up into the call that is waiting.
      elbowArrow({
        points: [[DOWN_X, R1 + FLOW.H / 2], [DOWN_X, MID], [START_X, MID], [START_X, R2 - FLOW.NODE_R]],
      }),
      elbowArrow({
        points: [[END_X, R2 - FLOW.NODE_R], [END_X, MID], [UP_X, MID], [UP_X, R1 + FLOW.H / 2]],
      }),

      // Workflow1's own row.
      arrow({ from: [START_X + FLOW.NODE_R, R1], to: [CALL_X - CALL_W / 2, R1] }),
      arrow({ from: [CALL_X + CALL_W / 2, R1], to: [END_X - FLOW.NODE_R, R1] }),

      // Workflow2's own row.
      arrow({ from: [START_X + FLOW.NODE_R, R2], to: [ACT_X - FLOW.W / 2, R2] }),
      arrow({ from: [ACT_X + FLOW.W / 2, R2], to: [END_X - FLOW.NODE_R, R2] }),

      box({
        x: CALL_X, y: R1, w: CALL_W, h: FLOW.H,
        label: 'call child workflow (Workflow2)\non App2',
        // Teal, like every other activity rectangle in the set: this is a step
        // of Workflow1, not a different kind of object.
        ...FLOW.step,
      }),
      box({ x: ACT_X, y: R2, w: FLOW.W, h: FLOW.H, label: 'Activity A', ...FLOW.step }),

      group([
        node({ x: START_X, y: R1, r: FLOW.NODE_R, ...FLOW.start, label: 'Start' }),
        node({ x: END_X, y: R1, r: FLOW.NODE_R, ...FLOW.end, label: 'End' }),
        node({ x: START_X, y: R2, r: FLOW.NODE_R, ...FLOW.start, label: 'Start' }),
        node({ x: END_X, y: R2, r: FLOW.NODE_R, ...FLOW.end, label: 'End' }),
      ]),

      group([
        hex({ x: APP_X, y: R1, r: HEX_R, label: 'App1', ...APP[0] }),
        hex({ x: APP_X, y: R2, r: HEX_R, label: 'App2', ...APP[1] }),
      ]),
    ];
  },
};
