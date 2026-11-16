// THE PARALLELIZATION PATTERN: three model calls run at once on different
// parts of the problem, and code puts their answers back together.
//
// Replaces dapr-agents/agents-parallelization.png on
// developing-ai/dapr-agents/dapr-agents-patterns.md, under "Parallelization".
//
// Fact-check, against the paragraph the image sits under: the pattern "enables
// processing multiple dimensions of a problem simultaneously, with outputs
// aggregated PROGRAMMATICALLY". That last word is why the Aggregator is the
// one box in this family of pictures that is a step and carries no brain mark:
// it is code you wrote, not a model call, and it is the only thing that tells
// this pattern from orchestrator-workers at a glance. The source draws it in
// the same blue it gives the router and the orchestrator, which says the three
// are alike; the prose says they are not.
//
// The shared measurements and the meaning of every shape are in
// diagrams/agent-patterns.mjs.

import {
  EDGE, GAP_X, GAP_Y, NODE_R, STEP_H, STEP_W, V_EDGE, inNode, llm, outNode,
  step,
} from '../agent-patterns.mjs';
import { arrow, elbowArrow } from '../shapes.mjs';

const WORKERS = ['LLM 1', 'LLM 2', 'LLM 3'];

// ---- across ------------------------------------------------------------------
const IN_X = EDGE + NODE_R;
const LLM_X = IN_X + NODE_R + GAP_X + STEP_W / 2;
const AGG_X = LLM_X + STEP_W + GAP_X;
const OUT_X = AGG_X + STEP_W / 2 + GAP_X + NODE_R;

const W = Math.ceil(OUT_X + NODE_R + EDGE);

// ---- down --------------------------------------------------------------------
const PITCH = STEP_H + GAP_Y;
const ROW_0 = V_EDGE + STEP_H / 2;
const rowY = (i) => ROW_0 + i * PITCH;
const MID = rowY(1);

const H = Math.ceil(rowY(2) + STEP_H / 2 + EDGE);

export default {
  width: W,
  height: H,
  title: 'The parallelization pattern',
  desc:
    'A green circle named In fans out to three teal boxes named LLM 1, LLM 2 '
    + 'and LLM 3, each carrying a brain mark, which run at the same time. All '
    + 'three lead to a teal box named Aggregator, which carries no brain mark '
    + 'because it is code rather than a model call, and the aggregator leads '
    + 'to an orange circle named Out.',

  build() {
    const llmLeft = LLM_X - STEP_W / 2;
    const llmRight = LLM_X + STEP_W / 2;
    return [
      // ---- one request, three ways -----------------------------------------
      elbowArrow({
        points: [[IN_X, MID - NODE_R], [IN_X, rowY(0)], [llmLeft - 2, rowY(0)]],
      }),
      arrow({ from: [IN_X + NODE_R, MID], to: [llmLeft - 2, MID] }),
      elbowArrow({
        points: [[IN_X, MID + NODE_R], [IN_X, rowY(2)], [llmLeft - 2, rowY(2)]],
      }),

      // ---- and three answers, put back together ----------------------------
      elbowArrow({
        points: [
          [llmRight, rowY(0)],
          [AGG_X, rowY(0)],
          [AGG_X, MID - STEP_H / 2 - 2],
        ],
      }),
      arrow({ from: [llmRight, MID], to: [AGG_X - STEP_W / 2 - 2, MID] }),
      elbowArrow({
        points: [
          [llmRight, rowY(2)],
          [AGG_X, rowY(2)],
          [AGG_X, MID + STEP_H / 2 + 2],
        ],
      }),

      arrow({ from: [AGG_X + STEP_W / 2, MID], to: [OUT_X - NODE_R - 2, MID] }),

      // ---- the shapes, over the lines that reach them -----------------------
      inNode({ x: IN_X, y: MID }),
      WORKERS.map((name, i) => llm({ x: LLM_X, y: rowY(i), name })),
      step({ x: AGG_X, y: MID, name: 'Aggregator' }),
      outNode({ x: OUT_X, y: MID }),
    ];
  },
};
