// Fan-out/fan-in: several activities run at once, and the flow waits for all
// of them before carrying on.
//
// Replaces workflows-fanin-fanout.png on
// developing-applications/building-blocks/workflow/workflow-patterns.md, under
// "you execute multiple tasks simultaneously across potentially multiple
// workers, wait for them to finish, and perform some aggregation on the
// result".
//
// Fact-check: the page's own list asks "What if the number of parallel steps
// is dynamic?", so three is an illustration and not a claim. The source image
// draws three and so does this; the prose carries the caveat.
//
// Where this departs from the source image, and why:
//   - the fan is drawn with elbowArrow() rather than as diagonal lines, which
//     is the house treatment for a bus feeding several shapes and is what
//     every other scene here does.

import { FLOW } from '../flow.mjs';
import { arrow, box, elbowArrow, group, node } from '../shapes.mjs';

const STEPS = ['Activity 1', 'Activity 2', 'Activity 3'];

const MARGIN = 40;
const PITCH = FLOW.W + FLOW.GAP_X;

// Edge to edge between a terminal and the row, through the fan rail. Stated
// once because the fan out and the fan in are the same move mirrored, and
// because the terminals grew: a gap measured from the old circle would now
// put the rail inside the new one.
const REACH = 72;

const START_Y = MARGIN + FLOW.NODE_R;
const ROW_Y = START_Y + FLOW.NODE_R + REACH + FLOW.H / 2;   // the parallel activities
const END_Y = ROW_Y + FLOW.H / 2 + REACH + FLOW.NODE_R;

const colX = (i) => MARGIN + FLOW.W / 2 + i * PITCH;
const centreX = colX(1);           // three columns, so the middle one is the axis

// The two rails the fan turns on, half way along that reach.
const FAN_OUT_Y = START_Y + FLOW.NODE_R + REACH / 2;
const FAN_IN_Y = ROW_Y + FLOW.H / 2 + REACH / 2;

export default {
  width: colX(STEPS.length - 1) + FLOW.W / 2 + MARGIN,
  height: END_Y + FLOW.NODE_R + MARGIN,
  title: 'The fan-out/fan-in workflow pattern',
  desc:
    'A workflow starts, fans out to three activities that run at the same '
    + 'time, waits for all three to finish, and then ends.',

  build() {
    // One run per column, from the terminal to the box, turning on the rail.
    // Each is an elbowArrow, so the turns are ROUNDED like every other corner
    // in this set - the first draft drew the fan as a bus of straight
    // segments, which is what the source image does but leaves square corners
    // in a set where nothing else has them.
    //
    // The middle column is the exception and has to be: its "elbow" would turn
    // at the x it is already on, which is a leg of no length. roundedPath()
    // refuses that outright now, so it is drawn as the straight run it is.
    //
    // The outer runs redraw the stem between the terminal and the rail. Same
    // colour, same width, fully opaque: the overlap is invisible, and the
    // alternative is a separate headless feeder plus a square T junction.
    const fan = (fromY, railY, toY) => STEPS.map((_, i) => (colX(i) === centreX
      ? arrow({ from: [centreX, fromY], to: [centreX, toY] })
      : elbowArrow({
        points: [[centreX, fromY], [centreX, railY], [colX(i), railY], [colX(i), toY]],
      })));

    const fanOut = fan(START_Y + FLOW.NODE_R, FAN_OUT_Y, ROW_Y - FLOW.H / 2);
    const fanIn = STEPS.map((_, i) => (colX(i) === centreX
      ? arrow({ from: [centreX, ROW_Y + FLOW.H / 2], to: [centreX, END_Y - FLOW.NODE_R] })
      : elbowArrow({
        points: [
          [colX(i), ROW_Y + FLOW.H / 2],
          [colX(i), FAN_IN_Y],
          [centreX, FAN_IN_Y],
          [centreX, END_Y - FLOW.NODE_R],
        ],
      })));

    return [
      group(fanOut),
      group(fanIn),
      group(STEPS.map((name, i) =>
        box({ x: colX(i), y: ROW_Y, w: FLOW.W, h: FLOW.H, label: name, ...FLOW.step }))),
      node({ x: centreX, y: START_Y, r: FLOW.NODE_R, ...FLOW.start, label: 'Start' }),
      node({ x: centreX, y: END_Y, r: FLOW.NODE_R, ...FLOW.end, label: 'End' }),
    ];
  },
};
