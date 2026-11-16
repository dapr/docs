// The monitor pattern: a recurring check that sleeps and then restarts itself.
//
// Replaces workflow-monitor-pattern.png on
// developing-applications/building-blocks/workflow/workflow-patterns.md, under
// "Checks the status of a system; Takes some action based on that status;
// Sleeps for some period of time; Repeat".
//
// Fact-check, against the page:
//   - the loop is closed by continue-as-new, not by a while-loop: the page
//     calls infinite loops "an anti-pattern" and says Dapr "exposes a
//     continue-as-new API that workflow authors can use to restart a workflow
//     function from the beginning with a new input". The caption says restart,
//     not loop.
//   - CreateTimer is a wait, so it takes the wait colour rather than the step
//     colour. The page's step 3 is "Sleeps for some period of time".
//
// The two marks above CheckStatus and SendNotification follow the source
// exactly: a plain arrow leaving the activity, pointing up at the Dapr
// service-invocation glyph. The first draft drew them as lollipop(), the house
// UML provided-interface shape, which says the activity PROVIDES an interface
// when what it does is CALL one - and the lollipop's stalk made the glyph part
// of the activity rather than the thing it reaches.
//
// Where this departs from the source image, and why:
//   - there is no End terminal, because the pattern has no end: the source
//     draws the loop returning to Start and so does this.

import { FLOW, note } from '../flow.mjs';
import { arrow, box, elbowArrow, group, node } from '../shapes.mjs';
import { serviceInvocation, SI_H } from '../icons.mjs';

const STEPS = [
  { name: 'CheckStatus', kind: 'step', call: true },
  { name: 'SendNotification', kind: 'step', call: true },
  { name: 'CreateTimer', kind: 'wait', note: 'Wait to proceed with workflow\nuntil the timer expires' },
  { name: 'ContinueAsNew', kind: 'wait', note: 'Restart the workflow\nwithout the history' },
];

const MARGIN = 40;
const PITCH = FLOW.W + FLOW.GAP_X;

// The service-invocation glyph's centre, and how far it stands off the top of
// the activity that calls it. The arrow between them is what the reader
// follows, so the reach is stated rather than left to fall out of the row's y.
const MARK_Y = MARGIN + 12;
const CALL_REACH = 54;
const ROW_Y = MARK_Y + CALL_REACH + FLOW.H / 2;

const startX = MARGIN + FLOW.NODE_R;
const stepX = (i) => startX + FLOW.NODE_R + FLOW.GAP_X + FLOW.W / 2 + i * PITCH;
const lastX = stepX(STEPS.length - 1) + FLOW.W / 2;

// The return rail runs under the captions, so it never crosses type. The notes
// are two lines of 12 hanging 26 below the boxes, so they end about 70 down.
const RETURN_Y = ROW_Y + 112;

// The loop turns clear of the last box before dropping. That turn is the
// drawing's true right edge, not the box, so the canvas is measured from it -
// measuring from the box left 11 units on the right against 40 on the left.
const TURN_X = lastX + FLOW.GAP_X / 2;

export default {
  width: TURN_X + MARGIN,
  height: RETURN_Y + 40,
  title: 'The monitor workflow pattern',
  desc:
    'A workflow checks a status, sends a notification, creates a timer to '
    + 'wait, and then restarts itself from the beginning with continue-as-new.',

  build() {
    const hops = [
      arrow({ from: [startX + FLOW.NODE_R, ROW_Y], to: [stepX(0) - FLOW.W / 2, ROW_Y] }),
      ...STEPS.slice(1).map((_, i) =>
        arrow({ from: [stepX(i) + FLOW.W / 2, ROW_Y], to: [stepX(i + 1) - FLOW.W / 2, ROW_Y] })),
    ];

    // The loop: out of the last box, down below the captions, back to Start.
    const loop = elbowArrow({
      points: [
        [lastX, ROW_Y],
        [TURN_X, ROW_Y],
        [TURN_X, RETURN_Y],
        [startX, RETURN_Y],
        [startX, ROW_Y + FLOW.NODE_R],
      ],
    });

    // The activity reaches UP to the mark: the arrow belongs to the activity,
    // the glyph stands on its own. Its head stops short of the glyph rather
    // than touching it, which is how the source draws it.
    const calls = STEPS
      .flatMap((s, i) => (s.call
        ? [
          arrow({ from: [stepX(i), ROW_Y - FLOW.H / 2], to: [stepX(i), MARK_Y + SI_H / 2 + 8] }),
          serviceInvocation({ x: stepX(i), y: MARK_Y }),
        ]
        : []));

    const notes = STEPS
      .map((s, i) => (s.note
        ? note({ x: stepX(i), y: ROW_Y + FLOW.H / 2 + 26, text: s.note })
        : null))
      .filter(Boolean);

    return [
      loop,
      group(hops),
      group(calls),
      group(STEPS.map((s, i) =>
        box({ x: stepX(i), y: ROW_Y, w: FLOW.W, h: FLOW.H, label: s.name, ...FLOW[s.kind] }))),
      group(notes),
      node({ x: startX, y: ROW_Y, r: FLOW.NODE_R, ...FLOW.start, label: 'Start' }),
    ];
  },
};
