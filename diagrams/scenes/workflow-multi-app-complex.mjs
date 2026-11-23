// A workflow that spans four applications in three languages: the page's own
// worked example of why multi-application workflows exist.
//
// Replaces workflow-multi-app-complex.png on
// developing-applications/building-blocks/workflow/workflow-multi-app.md.
//
// Fact-check, against the page's own four-bullet breakdown directly below it,
// which this follows exactly:
//   - App1, Main Workflow Service, Java: starts, calls data processing on
//     App2, calls the ML training child workflow on App3, calls model
//     deployment on App4, ends.
//   - App2, Data Processing Pipeline, Go: Data Ingesting Activity, then
//     Feature Engineering Activity.
//   - App3, ML Training, Java: a CHILD WORKFLOW, with its own start and end,
//     orchestrating Data Processing, Model Training and Model Validation.
//   - App4, Model Serving Service, Go: Model Loading Activity, then Inference
//     Setup Activity.
// App3 is the only target drawn with terminals, because it is the only one the
// page calls a child workflow; the other two are activities on an application.
//
// The routing follows the source and is the whole difficulty of this drawing.
// Each call drops out of its box, runs along the band above its target, and
// comes back up. The legs for App3 and App4 have to pass the lanes in between,
// so the lanes that hold only activities are drawn no wider than their
// contents and the legs run down the clear column to their right - which is
// why those two regions stop short while App1's and App3's run the full width.
// `clearOf()` computes that column rather than leaving it to be eyeballed: the
// first draft put the App4 leg 30 units INSIDE App3's region.
//
// Where this departs from the source image, and why:
//   - App4's hexagon takes the teal from APP[3]. The source leaves it white,
//     which in this set means a shape with no application identity.
//   - the activity-only lanes are captioned "GPU activities", which the source
//     leaves bare. The words are the page's own: App2 is "GPU activities only"
//     and App4 a "Beefy GPU app with activities only", and that is the reason
//     the example splits applications at all. Repeating the hexagon's name
//     there would have said nothing twice.

import { APP } from '../engine.mjs';
import { FLOW, flowLane } from '../flow.mjs';
import { arrow, box, elbowArrow, group, hex, hexHalfWidth, node } from '../shapes.mjs';
import { icon } from '../icons.mjs';

const MARGIN = 40;
const HEX_R = 62;                 // big enough to set a three-line name in
const HEX_HALF = hexHalfWidth(HEX_R);
const BAND = 74;                  // between one lane's edge and the next

// A call box carries a sentence, not a name.
const CALL_W = 268;
const CALL_GAP = 46;

// The language mark sits off the hexagon's TOP-LEFT shoulder rather than
// centred above its apex. A pointy-top hexagon's bounding box is empty at both
// top corners, and the mark put above the apex both wasted that space and had
// to stay small to fit the band between one lane and the next. Off the
// shoulder it has the whole corner plus the left margin, so it is drawn half
// as large again and still clears the hexagon: the sloped top-left edge falls
// away at 30 degrees, so at the mark's nearest corner the hexagon is already
// 15 units below it.
const MARK = 40;
const MARK_DX = HEX_HALF + MARK * 0.25;   // the mark's centre, left of the app's
const MARK_DY = HEX_R + MARK * 0.25;      // and above it

const APP_X = MARGIN + MARK_DX + MARK / 2;
const LANE_X = APP_X + HEX_HALF + 34;

// ---------------------------------------------------------------- the rows
// App1 and App3 hold a Start and an End; App2 and App4 hold nothing but
// activities, and their lanes are the shorter of the two for it.
const TERMINAL_H = FLOW.LANE_TERMINAL_H;
const ACTIVITY_H = FLOW.LANE_ACTIVITY_H;

const R1 = MARGIN + MARK_DY + MARK / 2;   // the mark, not the hexagon, sets this
const R2 = R1 + TERMINAL_H / 2 + BAND + ACTIVITY_H / 2;
const R3 = R2 + ACTIVITY_H / 2 + BAND + TERMINAL_H / 2;
const R4 = R3 + TERMINAL_H / 2 + BAND + ACTIVITY_H / 2;

// The band each pair of crossing legs runs along: half way between the lane
// they leave and the lane they enter.
const BAND2 = (R1 + TERMINAL_H / 2 + R2 - ACTIVITY_H / 2) / 2;
const BAND3 = (R2 + ACTIVITY_H / 2 + R3 - TERMINAL_H / 2) / 2;
const BAND4 = (R3 + TERMINAL_H / 2 + R4 - ACTIVITY_H / 2) / 2;

// ------------------------------------------------------------- the columns
const START_X = LANE_X + FLOW.PAD + FLOW.NODE_R;
const callX = (i) => START_X + FLOW.NODE_R + 50 + CALL_W / 2 + i * (CALL_W + CALL_GAP);
const END1_X = callX(2) + CALL_W / 2 + 54 + FLOW.NODE_R;
const LANE1_W = END1_X + FLOW.NODE_R + FLOW.PAD - LANE_X;

// App2 and App4 hold two activities each, laid out the same way.
const PAIR_FIRST_X = LANE_X + FLOW.PAD + FLOW.W / 2;
const PAIR_SECOND_X = PAIR_FIRST_X + FLOW.W + 54;
const PAIR_W = PAIR_SECOND_X + FLOW.W / 2 + FLOW.PAD - LANE_X;

const childX = (i) => START_X + FLOW.NODE_R + 44 + FLOW.W / 2 + i * (FLOW.W + 44);
const END3_X = childX(2) + FLOW.W / 2 + 44 + FLOW.NODE_R;
const LANE3_W = END3_X + FLOW.NODE_R + FLOW.PAD - LANE_X;

// The first column clear of every lane a leg has to pass on its way down.
const clearOf = (...laneWidths) => LANE_X + Math.max(...laneWidths) + 36;

const CALLS = [
  { label: 'call Data Processing Activities\non App2' },
  { label: 'call ML Training Child Workflow\non App3' },
  { label: 'call Model Deployment\non App4' },
];

// A region's pill is drawn WITH the region, before the arrows, so a leg that
// drops through it paints over it and the pill is no ground at all - which is
// what the rendered suite failed on. Captions therefore sit right of the leg
// that enters their lane, which is also where the source image puts them.
const lane = (y, h, w, caption, captionW, captionX) =>
  flowLane({ x: LANE_X, y: y - h / 2, w, h, caption, captionW, captionX });

const rightOf = (x, captionW) => x + 30 + captionW / 2;

const activity = (x, y, label) => box({ x, y, w: FLOW.W, h: FLOW.H, label, ...FLOW.step });

export default {
  width: END1_X + FLOW.NODE_R + FLOW.PAD + MARGIN,
  height: R4 + HEX_R + MARGIN,
  title: 'One workflow spanning four applications in three languages',
  desc:
    'A main orchestration workflow on App1, written in Java, starts and then '
    + 'makes three calls. It calls two data processing activities on App2, '
    + 'written in Go. It calls an ML training child workflow on App3, written '
    + 'in Java, which runs data processing, model training and model '
    + 'validation activities of its own. It calls model deployment on App4, '
    + 'written in Go, which loads the model and sets up inference. Each call '
    + 'returns to App1 before the next begins, and App1 then ends.',

  build() {
    const down3 = Math.max(callX(1) - 64, clearOf(PAIR_W));
    const up3 = callX(1) + 64;
    const down4 = Math.max(callX(2) - 64, clearOf(PAIR_W, LANE3_W));
    const up4 = Math.max(callX(2) + 64, down4 + 40);

    const main = [
      arrow({ from: [START_X + FLOW.NODE_R, R1], to: [callX(0) - CALL_W / 2, R1] }),
      arrow({ from: [callX(0) + CALL_W / 2, R1], to: [callX(1) - CALL_W / 2, R1] }),
      arrow({ from: [callX(1) + CALL_W / 2, R1], to: [callX(2) - CALL_W / 2, R1] }),
      arrow({ from: [callX(2) + CALL_W / 2, R1], to: [END1_X - FLOW.NODE_R, R1] }),
    ];

    const toApp2 = [
      elbowArrow({
        points: [
          [callX(0) - 64, R1 + FLOW.H / 2],
          [callX(0) - 64, BAND2],
          [PAIR_FIRST_X, BAND2],
          [PAIR_FIRST_X, R2 - FLOW.H / 2],
        ],
      }),
      // Straight up: the second activity sits under the call box that is
      // waiting for it, so this leg needs no turn at all.
      arrow({ from: [PAIR_SECOND_X, R2 - FLOW.H / 2], to: [PAIR_SECOND_X, R1 + FLOW.H / 2] }),
      arrow({ from: [PAIR_FIRST_X + FLOW.W / 2, R2], to: [PAIR_SECOND_X - FLOW.W / 2, R2] }),
    ];

    const toApp3 = [
      elbowArrow({
        points: [
          [down3, R1 + FLOW.H / 2],
          [down3, BAND3],
          [START_X, BAND3],
          [START_X, R3 - FLOW.NODE_R],
        ],
      }),
      elbowArrow({
        points: [
          [END3_X, R3 - FLOW.NODE_R],
          [END3_X, BAND3],
          [up3, BAND3],
          [up3, R1 + FLOW.H / 2],
        ],
      }),
      arrow({ from: [START_X + FLOW.NODE_R, R3], to: [childX(0) - FLOW.W / 2, R3] }),
      arrow({ from: [childX(0) + FLOW.W / 2, R3], to: [childX(1) - FLOW.W / 2, R3] }),
      arrow({ from: [childX(1) + FLOW.W / 2, R3], to: [childX(2) - FLOW.W / 2, R3] }),
      arrow({ from: [childX(2) + FLOW.W / 2, R3], to: [END3_X - FLOW.NODE_R, R3] }),
    ];

    const toApp4 = [
      elbowArrow({
        points: [
          [down4, R1 + FLOW.H / 2],
          [down4, BAND4],
          [PAIR_FIRST_X, BAND4],
          [PAIR_FIRST_X, R4 - FLOW.H / 2],
        ],
      }),
      elbowArrow({
        points: [
          [PAIR_SECOND_X + FLOW.W / 2, R4],
          [up4, R4],
          [up4, R1 + FLOW.H / 2],
        ],
      }),
      arrow({ from: [PAIR_FIRST_X + FLOW.W / 2, R4], to: [PAIR_SECOND_X - FLOW.W / 2, R4] }),
    ];

    return [
      // Measured at FLOW.CAPTION_SIZE with half an em clear of each end. At 15
      // the first of these was 214 wide around 213.5 of text: the caption was
      // drawn 0.4 units WIDER than the pill it sits in.
      lane(R1, TERMINAL_H, LANE1_W, 'Main Orchestration Workflow', 210),
      lane(R2, ACTIVITY_H, PAIR_W, 'GPU activities', 112, rightOf(PAIR_FIRST_X, 112)),
      lane(R3, TERMINAL_H, LANE3_W, 'ML Training Workflow', 162, rightOf(START_X, 162)),
      lane(R4, ACTIVITY_H, PAIR_W, 'GPU activities', 112, rightOf(PAIR_FIRST_X, 112)),

      group(main),
      group(toApp2),
      group(toApp3),
      group(toApp4),

      // The same teal as every other activity rectangle in the set. The source
      // draws these white, but white-on-outline is this set's "not a workflow
      // step" - the client's own code in `workflow-cross-app-client` is drawn
      // that way - and these three ARE the Main Orchestration Workflow's
      // steps. Two fills for one role read as two kinds of thing.
      group(CALLS.map((c, i) =>
        box({ x: callX(i), y: R1, w: CALL_W, h: FLOW.H, label: c.label, ...FLOW.step }))),

      activity(PAIR_FIRST_X, R2, 'Data Ingesting Activity'),
      activity(PAIR_SECOND_X, R2, 'Feature Engineering\nActivity'),

      activity(childX(0), R3, 'Data Processing\nActivity'),
      activity(childX(1), R3, 'Model Training\nActivity'),
      activity(childX(2), R3, 'Model Validation\nActivity'),

      activity(PAIR_FIRST_X, R4, 'Model Loading Activity'),
      activity(PAIR_SECOND_X, R4, 'Inference Setup Activity'),

      group([
        node({ x: START_X, y: R1, r: FLOW.NODE_R, ...FLOW.start, label: 'Start' }),
        node({ x: END1_X, y: R1, r: FLOW.NODE_R, ...FLOW.end, label: 'End' }),
        node({ x: START_X, y: R3, r: FLOW.NODE_R, ...FLOW.start, label: 'Start' }),
        node({ x: END3_X, y: R3, r: FLOW.NODE_R, ...FLOW.end, label: 'End' }),
      ]),

      // The applications, each with the language the page gives it.
      group([
        [R1, 'App1: Main\nWorkflow Service', APP[0], 'java'],
        [R2, 'App2: Data\nProcessing\nPipeline', APP[1], 'go'],
        [R3, 'App3: ML\nTraining Service', APP[2], 'java'],
        [R4, 'App4: Model\nServing Service', APP[3], 'go'],
      ].map(([y, name, palette, mark]) => group([
        icon({ name: mark, x: APP_X - MARK_DX, y: y - MARK_DY, size: MARK, fit: 'ink' }),
        hex({ x: APP_X, y, r: HEX_R, label: name, size: 11, ...palette }),
      ]))),
    ];
  },
};
