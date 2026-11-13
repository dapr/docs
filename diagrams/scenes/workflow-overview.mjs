// WHAT DAPR WORKFLOW IS: an app holding workflow and activity definitions,
// and the Dapr engine that runs them.
//
// Replaces /images/workflow-overview/workflow-overview.png on
// developing-applications/building-blocks/workflow/workflow-overview.md,
// under the three bullets that say what the capability offers.
//
// Fact-check, against the page's opening and those bullets:
//   - "You write workflow logic as ordinary code with a Dapr SDK" - the
//     definitions live in the app, which is why the flow is drawn inside a
//     callout off the app hexagon rather than inside the engine.
//   - "Offers a built-in workflow runtime for driving Dapr Workflow
//     execution" - the engine on the right.
//   - "Provides HTTP and gRPC APIs for managing workflows" - the two-headed
//     run between them, named Dapr API and HTTP/gRPC exactly as the source
//     names it.
//   - the flow itself is a generic illustration - Start, three activities, a
//     gate, End - and the page names none of its parts, so the names are the
//     source's.
//
// Where this departs from the source as a DRAWING, and why:
//   - the flow is drawn with diagrams/flow.mjs, the kit the workflow pattern
//     pages already use: green terminal, teal activity, gold gate, orange
//     end. The source happens to use the same four colours for the same four
//     things, so this is the house vocabulary agreeing with it rather than
//     overriding it - but a reader meeting workflow-patterns next sees one
//     set of shapes, not two.
//   - the zoom cone is a dashed LEADER, as `actors-game-example` draws one.
//     A cone is a perspective effect; this set says "that thing is this
//     thing" with a dashed line.
//   - the engine is the house Dapr hexagon, named under it like every other
//     sidecar in the set, rather than the source's outlined logo.

import { APP, C } from '../engine.mjs';
import { FLOW, flowLane } from '../flow.mjs';
import {
  arrow, box, decision, decisionPoints, elbowArrow, group, hex,
  hexHalfWidth, label, node,
} from '../shapes.mjs';
import { markHex } from '../icons.mjs';
import { NAME_DY as HEX_NAME_DY } from '../services.mjs';

const EDGE = 29;
const V_EDGE = 14;

// 13, the size render-width.mjs is calibrated against.
const TEXT = 13;
const NAME = 17;

// 82, not the 76 this was drawn at: measured on the page, "Workflow App" at
// NAME came two units short of the half-em of clear space a name inside a
// shape has to keep, because a hexagon's bounding box is its full width and
// the name is set across the whole of it. The lever is the shape, not the
// type - NAME is the house size for a hexagon's name and the same number
// every other app in the set wears.
const APP_R = 82;
const SIDE_R = 62;

// ---- the flow, which sets the height of everything ---------------------------
// Two columns and six rows, laid out as the source lays them out: the gate
// sends one way straight down and the other way across, and the two branches
// meet again at End.
const COL_GAP = 46;
// Tighter than the flow kit's own GAP_Y. That number is for a pattern page,
// where a column of activities is the whole picture; here the flow is one
// of three things in a row, and at 28 the six rows made the canvas taller
// than the 16:9 floor allows for its width.
const ROW_GAP = 24;

const STEP_W = 132;
const GATE_W = 86;
const GATE_H = 60;

// A plain pad, for the same reason: nothing hangs into this region's top.
const FLOW_PAD = 26;

// Row centres, from the top of the flow's own box.
const R0 = FLOW.NODE_R;                                  // Start
const R1 = R0 + FLOW.NODE_R + ROW_GAP + FLOW.H / 2;      // Activity 1
const R2 = R1 + FLOW.H / 2 + ROW_GAP + GATE_H / 2;       // the gate
const R3 = R2 + GATE_H / 2 + ROW_GAP + FLOW.H / 2;       // Activity 2
const R4 = R3 + FLOW.H / 2 + ROW_GAP + FLOW.H / 2;       // Activity 3
const R5 = R4 + FLOW.H / 2 + ROW_GAP + FLOW.NODE_R;      // End

const FLOW_H = R5 + FLOW.NODE_R + FLOW_PAD * 2;
const FLOW_W = STEP_W * 2 + COL_GAP + FLOW_PAD * 2;

// ---- the three columns -------------------------------------------------------
const PAIR_GAP = 54;
// Long enough for the two names the run carries, with air at both ends:
// this is a boundary between an app and the runtime, and a short run
// between two hexagons reads as a join rather than as an API.
const API_GAP = 180;

const APP_X = EDGE + hexHalfWidth(APP_R);
const FLOW_X = Math.round(APP_X + hexHalfWidth(APP_R) + PAIR_GAP);
const SIDE_X = Math.round(FLOW_X + FLOW_W + API_GAP + hexHalfWidth(SIDE_R));

// No caption's reach to allow for: this region carries no name. The app
// hexagon beside it, on the leader, is what names it.
const FLOW_Y = V_EDGE;
const MID_Y = Math.round(FLOW_Y + FLOW_H / 2);

// The two hexagons stand level with the middle of the flow, which is the one
// row in the picture that is not part of it.
const ROW_Y = MID_Y;
const NAME_Y = Math.round(ROW_Y + Math.max(APP_R, SIDE_R) * HEX_NAME_DY);

const COL_A = Math.round(FLOW_X + FLOW_PAD + STEP_W / 2);
const COL_B = COL_A + STEP_W + COL_GAP;
const rowY = (r) => Math.round(FLOW_Y + FLOW_PAD + r);

const W = Math.ceil(SIDE_X + hexHalfWidth(SIDE_R) + EDGE);
const H = Math.ceil(Math.max(FLOW_Y + FLOW_H, NAME_Y + TEXT * 2.4) + V_EDGE);

// ---- the API run, between the flow and the engine ----------------------------
const API_FROM = FLOW_X + FLOW_W;
const API_TO = SIDE_X - hexHalfWidth(SIDE_R);
const API_MID = Math.round((API_FROM + API_TO) / 2);
const API_DY = 22;

const step = (x, y, name) => box({
  x, y, w: STEP_W, h: FLOW.H, label: name, ...FLOW.step,
});

export default {
  width: W,
  height: H,
  title: 'A workflow app holding its workflow and activity definitions, and the Dapr Workflow engine that runs them',
  desc:
    'On the left, a blue hexagon named Workflow App, captioned Workflow and '
    + 'Activity definitions. A dashed line runs from it to a dashed region in '
    + 'the middle holding a flowchart: a green Start circle down to Activity '
    + '1, down to a gold gate, which goes one way down to Activity 3 and the '
    + 'other way across to Activity 2; both branches meet at an orange End '
    + 'circle. From the region, a line with a head at each end runs to a '
    + 'hexagon carrying the Dapr logo on the right, named Dapr Workflow '
    + 'engine; the line is labelled Dapr API above and HTTP/gRPC below.',

  build() {
    const gate = decisionPoints({ x: COL_A, y: rowY(R2), w: GATE_W, h: GATE_H });
    return [
      // ---- the app, and the definitions inside it -------------------------
      // Dashed and headless: a leader saying the flow beside it is what is
      // inside the hexagon, not traffic between the two.
      // The leader takes the line colour every other run here takes. A flow
      // scene may not reach for C.caption - the rule exists so nobody
      // hand-rolls what note() does - and dashed-and-headless is already
      // enough to say this is a leader rather than traffic.
      arrow({
        from: [APP_X + hexHalfWidth(APP_R) + 2, ROW_Y],
        to: [FLOW_X - 2, ROW_Y],
        head: false,
        dash: true,
      }),
      // flowLane(), not region(): this band IS a lane in the kit's sense -
      // "an application" - and a flow scene that calls region() itself is
      // how two lanes on two pages end up different.
      flowLane({ x: FLOW_X, y: FLOW_Y, w: FLOW_W, h: FLOW_H }),

      // ---- the flow -------------------------------------------------------
      arrow({ from: [COL_A, rowY(R0) + FLOW.NODE_R], to: [COL_A, rowY(R1) - FLOW.H / 2 - 2] }),
      arrow({ from: [COL_A, rowY(R1) + FLOW.H / 2], to: [COL_A, gate.top[1] - 2] }),
      // One way down the first column, to Activity 3.
      elbowArrow({ points: [[COL_A, gate.bottom[1]], [COL_A, rowY(R4) - FLOW.H / 2 - 2]] }),
      // The other way across to the second, to Activity 2.
      elbowArrow({
        points: [
          [gate.right[0], gate.right[1]],
          [COL_B, gate.right[1]],
          [COL_B, rowY(R3) - FLOW.H / 2 - 2],
        ],
      }),
      arrow({ from: [COL_B, rowY(R3) + FLOW.H / 2], to: [COL_B, rowY(R5) - FLOW.NODE_R - 2] }),
      // And the two meet again.
      elbowArrow({
        points: [
          [COL_A, rowY(R4) + FLOW.H / 2],
          [COL_A, rowY(R5)],
          [COL_B - FLOW.NODE_R - 2, rowY(R5)],
        ],
      }),

      node({ x: COL_A, y: rowY(R0), r: FLOW.NODE_R, ...FLOW.start, label: 'Start' }),
      step(COL_A, rowY(R1), 'Activity 1'),
      decision({ x: COL_A, y: rowY(R2), w: GATE_W, h: GATE_H, ...FLOW.wait }),
      step(COL_B, rowY(R3), 'Activity 2'),
      step(COL_A, rowY(R4), 'Activity 3'),
      node({ x: COL_B, y: rowY(R5), r: FLOW.NODE_R, ...FLOW.end, label: 'End' }),

      // ---- the API between the app and the engine -------------------------
      arrow({ from: [API_FROM + 2, ROW_Y], to: [API_TO - 2, ROW_Y] }),
      arrow({ from: [API_TO - 2, ROW_Y], to: [API_FROM + 2, ROW_Y] }),
      label({ x: API_MID, y: ROW_Y - API_DY, text: 'Dapr API', size: TEXT }),
      label({
        x: API_MID, y: ROW_Y + API_DY, text: 'HTTP/gRPC', size: TEXT, weight: 400,
      }),

      // ---- the two hexagons, named under them -----------------------------
      group({
        class: 'd-named-mark',
        children: [
          hex({ x: APP_X, y: ROW_Y, r: APP_R, label: 'Workflow App', size: NAME, ...APP[1] }),
          label({
            x: APP_X, y: NAME_Y, text: 'Workflow and\nActivity definitions', size: TEXT,
          }),
        ],
      }),
      group({
        class: 'd-named-mark',
        children: [
          markHex({ x: SIDE_X, y: ROW_Y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
          label({ x: SIDE_X, y: NAME_Y, text: 'Dapr Workflow\nengine', size: TEXT }),
        ],
      }),
    ];
  },
};
