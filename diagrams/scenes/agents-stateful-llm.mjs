// THE DURABLE AGENT PATTERN: the augmented LLM again, with a workflow driving
// the calls so the agent survives a restart.
//
// Replaces dapr-agents/agents-stateful-llm.png on
// developing-ai/dapr-agents/dapr-agents-patterns.md, under "Durable Agent".
//
// Fact-check, against the section the image sits under: the Durable Agent is
// the one whose "underlying workflow is created dynamically by the LLM's
// planning decisions", and the page's own code wraps the model call in a Dapr
// Workflow with a retry policy on it. The loop between the two boxes is the
// source's own: the workflow calls the model, the model's answer comes back,
// and round it goes.
//
// THIS PICTURE AND agents-augmented-llm ARE ONE IDEA TWICE, which is the
// source's point - the three things outside the process are the same three,
// drawn the same way, in the same place - so every measurement they share
// comes from diagrams/agent-patterns.mjs and neither scene writes one of its
// own. The whole difference is in the middle: where the augmented LLM has one
// model call, this has a workflow and a model call inside a band, and the
// band is what the runs to Retrieval, Tools and Memory now leave from.
//
// THE BAND IS NAMED. The source draws it as an unlabelled dashed blue
// rectangle, which leaves a reader to work out that the dashes mean "this is
// the durable agent and these two are inside it". A lane in this set carries
// its name on its border; flowLane() is what makes that hard to forget.
//
// The workflow box carries the flowchart mark rather than the brain, which is
// the whole of how it is told from the call beneath it. See the module header.

import {
  EDGE, GAP_X, GAP_Y, LEG_DX, NODE_R, RAIL_DROP, RES_DROP, RES_PITCH, RES_W,
  STEP_H, STEP_W, V_EDGE, WORD_DY, exchange, inNode, llm, outNode, outside,
  workflowStep,
} from '../agent-patterns.mjs';
import { FLOW, flowLane, note } from '../flow.mjs';
import { arrow } from '../shapes.mjs';

// How far outside the two boxes the loop rails run, and how far the lane
// stands off those rails.
const LOOP_DX = 30;
const LANE_SIDE = 24;

// ---- across ------------------------------------------------------------------
// The row of outside things is the widest thing here, as it is on the
// augmented LLM, so the canvas is set by it and everything else is centred.
const HALF = RES_PITCH + RES_W / 2;
const W = Math.ceil(HALF * 2 + EDGE * 2);
const CX = W / 2;

const RETRIEVAL_X = CX - RES_PITCH;
const TOOLS_X = CX;
const MEMORY_X = CX + RES_PITCH;

const LOOP_L = CX - STEP_W / 2 - LOOP_DX;
const LOOP_R = CX + STEP_W / 2 + LOOP_DX;
const LANE_X0 = LOOP_L - LANE_SIDE;
const LANE_X1 = LOOP_R + LANE_SIDE;

const IN_X = LANE_X0 - GAP_X - NODE_R;
const OUT_X = LANE_X1 + GAP_X + NODE_R;

// ---- down --------------------------------------------------------------------
const LANE_Y0 = V_EDGE;
const WF_Y = LANE_Y0 + FLOW.PAD + STEP_H / 2;
const CALL_Y = WF_Y + STEP_H + GAP_Y;
const LANE_Y1 = CALL_Y + STEP_H / 2 + FLOW.PAD;
const LANE_MID = (LANE_Y0 + LANE_Y1) / 2;

const RAIL_Y = LANE_Y1 + RAIL_DROP;
const RES_TOP = RAIL_Y + RES_DROP;
const RES_Y = RES_TOP + STEP_H / 2;

const CALL_WORD_Y = RAIL_Y + 24;

const H = Math.ceil(RES_Y + STEP_H / 2 + EDGE);

const word = (x, y, text, anchor = 'middle') => note({
  x, y, text, anchor, halo: true,
});

export default {
  width: W,
  height: H,
  title: 'The durable agent pattern',
  desc:
    'A green circle named In leads into a dashed band captioned Durable '
    + 'agent. Inside it a teal box named Workflow, carrying a flowchart mark, '
    + 'and a teal box named LLM, carrying a brain mark, pass work round a loop '
    + 'to each other. The band leads on to an orange circle named Out. '
    + 'Beneath the band, three blue boxes stand in a row: Retrieval on the '
    + 'left, Tools in the middle and Memory on the right, and a run with an '
    + 'arrowhead at each end joins the band to each of them: Query and Results '
    + 'to Retrieval, Call and Response to Tools, Read and Write to Memory.',

  build() {
    return [
      flowLane({
        x: LANE_X0,
        y: LANE_Y0,
        w: LANE_X1 - LANE_X0,
        h: LANE_Y1 - LANE_Y0,
        caption: 'Durable agent',
        captionW: 112,
      }),

      // ---- in, and out ------------------------------------------------------
      arrow({ from: [IN_X + NODE_R, LANE_MID], to: [LANE_X0 - 2, LANE_MID] }),
      arrow({ from: [LANE_X1, LANE_MID], to: [OUT_X - NODE_R - 2, LANE_MID] }),

      // ---- round the loop, down the right and back up the left --------------
      exchange({
        points: [
          [CX + STEP_W / 2, WF_Y],
          [LOOP_R, WF_Y],
          [LOOP_R, CALL_Y],
          [CX + STEP_W / 2 + 2, CALL_Y],
        ],
        heads: 'end',
      }),
      exchange({
        points: [
          [CX - STEP_W / 2, CALL_Y],
          [LOOP_L, CALL_Y],
          [LOOP_L, WF_Y],
          [CX - STEP_W / 2 - 2, WF_Y],
        ],
        heads: 'end',
      }),

      // ---- and what the agent reaches for -----------------------------------
      exchange({
        points: [
          [CX - LEG_DX, LANE_Y1 + 2],
          [CX - LEG_DX, RAIL_Y],
          [RETRIEVAL_X, RAIL_Y],
          [RETRIEVAL_X, RES_TOP - 2],
        ],
      }),
      word((CX - LEG_DX + RETRIEVAL_X) / 2, RAIL_Y - WORD_DY, 'Query / Results'),

      exchange({
        points: [[TOOLS_X, LANE_Y1 + 2], [TOOLS_X, RES_TOP - 2]],
      }),
      word(TOOLS_X + 10, CALL_WORD_Y, 'Call / Response', 'start'),

      exchange({
        points: [
          [CX + LEG_DX, LANE_Y1 + 2],
          [CX + LEG_DX, RAIL_Y],
          [MEMORY_X, RAIL_Y],
          [MEMORY_X, RES_TOP - 2],
        ],
      }),
      word((CX + LEG_DX + MEMORY_X) / 2, RAIL_Y - WORD_DY, 'Read / Write'),

      // ---- the shapes, over the lines that reach them -----------------------
      inNode({ x: IN_X, y: LANE_MID }),
      workflowStep({ x: CX, y: WF_Y, name: 'Workflow' }),
      llm({ x: CX, y: CALL_Y, name: 'LLM' }),
      outNode({ x: OUT_X, y: LANE_MID }),
      outside({ x: RETRIEVAL_X, y: RES_Y, name: 'Retrieval', w: RES_W }),
      outside({ x: TOOLS_X, y: RES_Y, name: 'Tools', w: RES_W }),
      outside({ x: MEMORY_X, y: RES_Y, name: 'Memory', w: RES_W }),
    ];
  },
};
