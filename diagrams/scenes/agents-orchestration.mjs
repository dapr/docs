// THE TWO WAYS AGENTS ARE COORDINATED, side by side: one through messages,
// one through a workflow.
//
// Replaces dapr-agents/home_concepts_principles_workflows.png on
// developing-ai/dapr-agents/dapr-agents-core-concepts.md, under
// "Multi-agent Systems (MAS)".
//
// Fact-check, against the paragraphs this sits between. The page names
// exactly two approaches and the picture draws exactly those two:
//
//   - "Deterministic Workflow-based Orchestration - Provides clear,
//     repeatable processes with predefined sequences and decision points".
//     Hence a start, a sequence, a gate, and an end: the decision point is
//     the one thing that makes it more than a list.
//   - "Event-driven Orchestration - Enables dynamic, adaptive collaboration
//     through message-based coordination among agents". Hence a broker and no
//     fixed order: who picks a message up is not drawn, because that is the
//     point of it.
//   - "Both approaches utilize a central orchestrator that coordinates
//     multiple specialized agents". Hence the same shape at the head of both
//     halves, and it is the reason the two are drawn as ONE picture rather
//     than two: the sentence under them is about what they have in common.
//
// WHY THE ORCHESTRATOR IS JUST A BIGGER HEXAGON. It should be named, and it
// cannot be: "Orchestrator" is about 80 units wide at the size a 72-unit
// hexagon sets its name in, and the hexagon narrows towards the name rather
// than widening. Every other way out is worse - a word hung outside the shape
// reads as a second shape's name, and growing the hexagon until the word fits
// makes it twice the size of the agents it coordinates. Size says "central"
// quietly, the lane captions say which approach is which, and the sentence
// under the picture says the rest.
//
// The broker is pipe(), which is what a message broker is everywhere else in
// these docs. The source draws a green cylinder, which is the same thing.
//
// WHERE THIS DEPARTS FROM THE SOURCE IMAGE. Its workflow half has eight
// shapes, two of which are a pair of bare curved arrows between two agents
// with nothing to say which way round they go or what they carry. The prose
// gives the workflow half three properties - a sequence, a decision point, an
// end - and this draws those three. Shapes that illustrate nothing in the
// text are not kept just because the source had them.

import { APP } from '../engine.mjs';
import {
  arrow, decision, elbowArrow, hex, node, pipe,
} from '../shapes.mjs';
import { FLOW, flowLane } from '../flow.mjs';

const EDGE = 29;

// The head of each half, and the agents it coordinates. See the header.
const ORCH_R = 44;
const AGENT_R = 34;

// ---- the two lanes -------------------------------------------------------
const LANE_TOP = 54;
const LANE_H = 340;
const LANE_BOT = LANE_TOP + LANE_H;

const EV_X = EDGE;
const EV_W = 340;
const EV_CX = EV_X + EV_W / 2;

const WF_X = EV_X + EV_W + 40;
const WF_W = 560;

const W = Math.ceil(WF_X + WF_W + EDGE);
const H = Math.ceil(LANE_BOT + EDGE);

// ---- the event-driven half -----------------------------------------------
const EV_ORCH_Y = 126;
const BROKER_Y = 224;
const BROKER_RY = 28;
// A broker is two to three times as long as it is across - pipe() refuses
// anything else - and within that range this is the long end, because the name
// is set ON the fill and the rounded end-cap at each end has to stay clear of
// it. At the short end the left cap clipped the "M".
const BROKER_HALF = 76;
const EV_ROW_Y = 330;
const EV_PITCH = 98;
// Where the three runs out of the broker turn, and where they leave it.
const RAIL_Y = 276;
const LEG_DX = 30;

// ---- the workflow half ---------------------------------------------------
const MID_Y = LANE_TOP + LANE_H / 2;
const START_X = WF_X + 56;
const WF_ORCH_X = START_X + 112;
const GATE_X = WF_ORCH_X + 120;
const GATE_W = 84;
const GATE_H = 64;
const BRANCH_X = GATE_X + 120;
const END_X = WF_X + WF_W - 56;
const BRANCH_DY = 86;

const NODE_R = FLOW.NODE_R;

export default {
  width: W,
  height: H,
  title: 'The two ways agents are coordinated',
  desc:
    'Two lanes side by side. On the left, event-driven orchestration: a large '
    + 'hexagon acting as the orchestrator publishes to a green message broker, '
    + 'and the broker fans out to three smaller agent hexagons. On the right, '
    + 'deterministic workflow orchestration: a green Start circle leads to the '
    + 'orchestrator hexagon, then to a gold decision diamond, which branches to '
    + 'one of two agent hexagons, and either branch leads on to an orange End '
    + 'circle.',

  build() {
    const brokerL = EV_CX - BROKER_HALF;
    const brokerR = EV_CX + BROKER_HALF;
    const brokerTop = BROKER_Y - BROKER_RY;
    const brokerBot = BROKER_Y + BROKER_RY;
    const workerX = [EV_CX - EV_PITCH, EV_CX, EV_CX + EV_PITCH];
    const gateTop = MID_Y - GATE_H / 2;
    const gateBot = MID_Y + GATE_H / 2;
    const upY = MID_Y - BRANCH_DY;
    const downY = MID_Y + BRANCH_DY;

    return [
      // ---- the lanes, drawn first so they sit behind their contents --------
      flowLane({
        x: EV_X, y: LANE_TOP, w: EV_W, h: LANE_H, caption: 'Event-driven', captionW: 112, captionX: EV_CX,
      }),
      flowLane({
        x: WF_X, y: LANE_TOP, w: WF_W, h: LANE_H, caption: 'Deterministic workflow', captionW: 178, captionX: WF_X + WF_W / 2,
      }),

      // ---- messages out, and whoever is listening picks them up ------------
      arrow({ from: [EV_CX, EV_ORCH_Y + ORCH_R], to: [EV_CX, brokerTop - 2] }),

      elbowArrow({
        points: [
          [EV_CX - LEG_DX, brokerBot],
          [EV_CX - LEG_DX, RAIL_Y],
          [workerX[0], RAIL_Y],
          [workerX[0], EV_ROW_Y - AGENT_R - 2],
        ],
      }),
      arrow({ from: [EV_CX, brokerBot], to: [EV_CX, EV_ROW_Y - AGENT_R - 2] }),
      elbowArrow({
        points: [
          [EV_CX + LEG_DX, brokerBot],
          [EV_CX + LEG_DX, RAIL_Y],
          [workerX[2], RAIL_Y],
          [workerX[2], EV_ROW_Y - AGENT_R - 2],
        ],
      }),

      hex({ x: EV_CX, y: EV_ORCH_Y, r: ORCH_R, label: 'Agent', ...APP[4] }),
      pipe({
        x1: brokerL, x2: brokerR, y: BROKER_Y, ry: BROKER_RY, label: 'Message broker', size: 13,
      }),
      hex({ x: workerX[0], y: EV_ROW_Y, r: AGENT_R, label: 'Agent', ...APP[1] }),
      hex({ x: workerX[1], y: EV_ROW_Y, r: AGENT_R, label: 'Agent', ...APP[2] }),
      hex({ x: workerX[2], y: EV_ROW_Y, r: AGENT_R, label: 'Agent', ...APP[3] }),

      // ---- a sequence, a decision point, and an end ------------------------
      arrow({ from: [START_X + NODE_R, MID_Y], to: [WF_ORCH_X - ORCH_R - 2, MID_Y] }),
      arrow({ from: [WF_ORCH_X + ORCH_R, MID_Y], to: [GATE_X - GATE_W / 2 - 2, MID_Y] }),

      elbowArrow({
        points: [[GATE_X, gateTop], [GATE_X, upY], [BRANCH_X - AGENT_R - 2, upY]],
      }),
      elbowArrow({
        points: [[GATE_X, gateBot], [GATE_X, downY], [BRANCH_X - AGENT_R - 2, downY]],
      }),
      elbowArrow({
        points: [[BRANCH_X + AGENT_R, upY], [END_X, upY], [END_X, MID_Y - NODE_R - 2]],
      }),
      elbowArrow({
        points: [[BRANCH_X + AGENT_R, downY], [END_X, downY], [END_X, MID_Y + NODE_R + 2]],
      }),

      node({ x: START_X, y: MID_Y, r: NODE_R, label: 'Start', ...FLOW.start }),
      hex({ x: WF_ORCH_X, y: MID_Y, r: ORCH_R, label: 'Agent', ...APP[4] }),
      decision({
        x: GATE_X, y: MID_Y, w: GATE_W, h: GATE_H, label: '', ...FLOW.wait, solid: true,
      }),
      hex({ x: BRANCH_X, y: upY, r: AGENT_R, label: 'Agent', ...APP[1] }),
      hex({ x: BRANCH_X, y: downY, r: AGENT_R, label: 'Agent', ...APP[3] }),
      node({ x: END_X, y: MID_Y, r: NODE_R, label: 'End', ...FLOW.end }),
    ];
  },
};
