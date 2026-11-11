// A multi-application ACTIVITY call: a workflow on App1 runs one of its
// activities on App2 and waits for the result.
//
// Replaces workflow-multi-app-callactivity.png on
// developing-applications/building-blocks/workflow/workflow-multi-app.md,
// above the four SDK snippets, every one of which calls `ActivityA` with the
// target app `App2`. The names in the drawing are those names.
//
// Fact-check, against the page: "Upon execution, the target app ID executes
// the activity or child workflow, and returns the result to the parent
// workflow of the originating app ID." So the control flow LEAVES App1, runs
// on App2, and comes BACK before App1 can finish - which is why the onward hop
// out of the call box is dashed and headless, and the arrow that actually
// reaches End comes up from App2. The source image draws it the same way.
//
// Where this departs from the source image, and why:
//   - each application is a dashed region() with its hexagon beside it, where
//     the source paints a flat grey band. region() is the house container and
//     the sibling diagram on this page already uses it for Workflow1 and
//     Workflow2; a grey band would be a second way of saying the same thing.
//   - App2 is the sky hexagon, APP[1]. The source draws both applications
//     green, which in this set means both are the same application.

import { APP } from '../engine.mjs';
import { FLOW, flowLane } from '../flow.mjs';
import { arrow, box, elbowArrow, group, hex, hexHalfWidth, node } from '../shapes.mjs';

const MARGIN = 40;
const HEX_R = 46;
const HEX_HALF = hexHalfWidth(HEX_R);

// The call box carries a SENTENCE, not a name, so it is wider than FLOW.W.
// "call activity ActivityA" measures about 150 units at FLOW.SIZE and a 172
// box would leave 11 either side, which reads as a label that only just fits.
const CALL_W = 244;

const APP_X = MARGIN + HEX_HALF;
const LANE_X = APP_X + HEX_HALF + 34;

const ROW = [MARGIN + 60, MARGIN + 60 + 190];

const START_X = LANE_X + FLOW.PAD + FLOW.NODE_R;
const CALL_X = START_X + FLOW.NODE_R + 54 + CALL_W / 2;
// The return leg turns up here, clear of the call box, and the dashed onward
// hop runs into the same point: one junction, as the source draws it.
const RETURN_X = CALL_X + CALL_W / 2 + 76;
const END_X = RETURN_X + 70 + FLOW.NODE_R;

const LANE_W = END_X + FLOW.NODE_R + FLOW.PAD - LANE_X;
// Both rows hold terminals, so both take the taller of the two lane heights.
const LANE_H = FLOW.LANE_TERMINAL_H;

const lane = (y, caption, captionW) =>
  flowLane({ x: LANE_X, y: y - LANE_H / 2, w: LANE_W, h: LANE_H, caption, captionW });

export default {
  width: END_X + FLOW.NODE_R + FLOW.PAD + MARGIN,
  height: ROW[1] + LANE_H / 2 + MARGIN,
  title: 'A workflow calling an activity on another application',
  desc:
    'A workflow on App1 starts, calls the activity ActivityA on App2, and '
    + 'waits. ActivityA runs inside App2 and returns its result to App1, '
    + 'which then ends.',

  build() {
    return [
      // Measured at FLOW.CAPTION_SIZE with half an em clear of each end. 46
      // was the text's own width and nothing more, which drew "App2" with 3.5
      // units of pill either side of it.
      lane(ROW[0], 'App1', 58),
      lane(ROW[1], 'App2', 58),

      // Out of the call box and down into App2, then back up into End.
      arrow({ from: [CALL_X, ROW[0] + FLOW.H / 2], to: [CALL_X, ROW[1] - FLOW.H / 2] }),
      arrow({ from: [CALL_X + CALL_W / 2, ROW[0]], to: [RETURN_X, ROW[0]], dash: true, head: false }),
      elbowArrow({
        points: [[CALL_X + FLOW.W / 2, ROW[1]], [RETURN_X, ROW[1]], [RETURN_X, ROW[0]]],
        heads: 'none',
      }),
      arrow({ from: [RETURN_X, ROW[0]], to: [END_X - FLOW.NODE_R, ROW[0]] }),
      arrow({ from: [START_X + FLOW.NODE_R, ROW[0]], to: [CALL_X - CALL_W / 2, ROW[0]] }),

      box({
        x: CALL_X, y: ROW[0], w: CALL_W, h: FLOW.H,
        label: 'call activity ActivityA\non App2',
        // Teal, like every other activity rectangle in the set: this is a step
        // of Workflow1, not a different kind of object. The source draws it
        // white; white-on-outline is this set's "not a workflow step".
        ...FLOW.step,
      }),
      box({ x: CALL_X, y: ROW[1], w: FLOW.W, h: FLOW.H, label: 'ActivityA', ...FLOW.step }),

      node({ x: START_X, y: ROW[0], r: FLOW.NODE_R, ...FLOW.start, label: 'Start' }),
      node({ x: END_X, y: ROW[0], r: FLOW.NODE_R, ...FLOW.end, label: 'End' }),

      group([
        hex({ x: APP_X, y: ROW[0], r: HEX_R, label: 'App1', ...APP[0] }),
        hex({ x: APP_X, y: ROW[1], r: HEX_R, label: 'App2', ...APP[1] }),
      ]),
    ];
  },
};
