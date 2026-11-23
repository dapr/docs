// THE PROMPT CHAINING PATTERN: three model calls in a row, with a gate after
// the first that can end the run early.
//
// Replaces dapr-agents/agents-prompt-chaining.png on
// developing-ai/dapr-agents/dapr-agents-patterns.md, under "Prompt Chaining".
//
// Fact-check, against the paragraph the image sits under: the pattern
// "decomposes tasks into a sequence of steps, where each LLM call processes
// the output of the previous one", allowing "validation between steps". Three
// calls, each taking the last one's output, and one gate doing the validating
// - which is what the source draws and what the names on the runs say.
//
// THE CHAIN IS ONE ROW, where the source climbs a step at the gate and puts
// the rest of the chain on a higher line. Nothing is said by that climb: the
// three calls are peers in a sequence, and drawn on one line they read as the
// sequence the pattern is named for. What the gate's two ways out DO say is
// kept, by the one axis that is free - pass carries straight on, fail drops
// out of the row to Exit.
//
// The shared measurements and the meaning of every shape are in
// diagrams/agent-patterns.mjs.

import {
  EDGE, GAP_X, HEAD_DY, NODE_R, STEP_H, STEP_W, V_EDGE, WORD_DY, inNode, gate,
  llm, outNode,
} from '../agent-patterns.mjs';
import { arrow, decisionPoints, elbowArrow } from '../shapes.mjs';
import { note } from '../flow.mjs';

// The gate. Wide enough to set "Gate" on its centre line with room either
// side, which is the only line of a diamond that is wide at all.
const GATE_W = 124;
const GATE_H = 74;

// How far below the row the early exit sits.
const EXIT_DROP = 70;

// ---- across ------------------------------------------------------------------
const IN_X = EDGE + NODE_R;
const LLM1_X = IN_X + NODE_R + GAP_X + STEP_W / 2;
const GATE_X = LLM1_X + STEP_W / 2 + GAP_X + GATE_W / 2;
const LLM2_X = GATE_X + GATE_W / 2 + GAP_X + STEP_W / 2;
const LLM3_X = LLM2_X + STEP_W + GAP_X;
const OUT_X = LLM3_X + STEP_W / 2 + GAP_X + NODE_R;

// ---- down --------------------------------------------------------------------
const ROW_Y = V_EDGE + GATE_H / 2;
const EXIT_Y = ROW_Y + GATE_H / 2 + EXIT_DROP + NODE_R;

const W = Math.ceil(OUT_X + NODE_R + EDGE);
const H = Math.ceil(EXIT_Y + NODE_R + EDGE);

const word = (x, y, text, anchor = 'middle') => note({
  x, y, text, anchor, halo: true,
});

export default {
  width: W,
  height: H,
  title: 'The prompt chaining pattern',
  desc:
    'A green circle named In leads to a teal box named LLM 1 carrying a brain '
    + 'mark. Its Output 1 reaches a gold diamond named Gate. On a pass the '
    + 'chain carries on to LLM 2, whose Output 2 reaches LLM 3, whose Output 3 '
    + 'reaches an orange circle named Out. On a fail the run drops out of the '
    + 'row to an orange circle named Exit below the gate.',

  build() {
    const g = decisionPoints({ x: GATE_X, y: ROW_Y, w: GATE_W, h: GATE_H });
    const hop = (fromX, toX) => arrow({ from: [fromX, ROW_Y], to: [toX - 2, ROW_Y] });
    return [
      // ---- along the chain --------------------------------------------------
      hop(IN_X + NODE_R, LLM1_X - STEP_W / 2),
      hop(LLM1_X + STEP_W / 2, g.left[0]),
      word((LLM1_X + STEP_W / 2 + g.left[0]) / 2, ROW_Y - WORD_DY, 'Output 1'),

      hop(g.right[0], LLM2_X - STEP_W / 2),
      word((g.right[0] + LLM2_X - STEP_W / 2) / 2, ROW_Y - WORD_DY, 'Pass'),

      hop(LLM2_X + STEP_W / 2, LLM3_X - STEP_W / 2),
      word((LLM2_X + LLM3_X) / 2, ROW_Y - WORD_DY, 'Output 2'),

      hop(LLM3_X + STEP_W / 2, OUT_X - NODE_R),
      word((LLM3_X + STEP_W / 2 + OUT_X - NODE_R) / 2, ROW_Y - WORD_DY, 'Output 3'),

      // ---- and the way out of it --------------------------------------------
      elbowArrow({ points: [g.bottom, [GATE_X, EXIT_Y - NODE_R - 2]] }),
      word(GATE_X + 10, EXIT_Y - NODE_R - HEAD_DY, 'Fail', 'start'),

      // ---- the shapes, over the lines that reach them -----------------------
      inNode({ x: IN_X, y: ROW_Y }),
      llm({ x: LLM1_X, y: ROW_Y, name: 'LLM 1' }),
      gate({ x: GATE_X, y: ROW_Y, w: GATE_W, h: GATE_H, name: 'Gate' }),
      llm({ x: LLM2_X, y: ROW_Y, name: 'LLM 2' }),
      llm({ x: LLM3_X, y: ROW_Y, name: 'LLM 3' }),
      outNode({ x: OUT_X, y: ROW_Y }),
      outNode({ x: GATE_X, y: EXIT_Y, name: 'Exit' }),
    ];
  },
};
