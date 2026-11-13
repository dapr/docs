// THE EVALUATOR-OPTIMIZER PATTERN: one model call writes an answer, another
// judges it, and a rejected answer goes back with the reasons why.
//
// Replaces dapr-agents/agents-evaluator-optimizer.png on
// developing-ai/dapr-agents/dapr-agents-patterns.md, under
// "Evaluator-Optimizer".
//
// Fact-check, against the paragraph the image sits under: the pattern
// "implements a dual-LLM process where one model generates responses while
// another provides evaluation and feedback in an iterative loop". Two calls,
// both models, and a loop - which is why the two boxes carry the brain mark
// and why there is no straight run between them: everything that passes
// between the pair is going round the loop.
//
// THE LOOP IS TWO RAILS, not the source's two arcs. A curve says nothing here
// that a rail does not, and every other run in this set of pictures is
// orthogonal; one picture drawing its loop freehand would read as a different
// kind of connection rather than as the same kind drawn differently. The
// source's own layout is kept in every other respect: the solution goes OVER
// the top from the generator to the evaluator, the rejection comes back
// UNDERNEATH, and the way out is off the evaluator's right-hand side.
//
// The shared measurements and the meaning of every shape are in
// diagrams/agent-patterns.mjs.

import {
  EDGE, GAP_X, NODE_R, STEP_H, STEP_W, V_EDGE, WORD_DY, inNode, llm, outNode,
} from '../agent-patterns.mjs';
import { arrow, elbowArrow } from '../shapes.mjs';
import { note } from '../flow.mjs';

// How far above and below the row the two rails run. The same number both
// ways: the loop is one circuit and a lopsided one would read as two
// different kinds of return.
const RAIL_GAP = 46;
// The air a word on a rail needs above or below it, measured from the rail.
const WORD_ROOM = 22;

// ---- across ------------------------------------------------------------------
const IN_X = EDGE + NODE_R;
const GEN_X = IN_X + NODE_R + GAP_X + STEP_W / 2;
const EVAL_X = GEN_X + STEP_W + GAP_X;
const OUT_X = EVAL_X + STEP_W / 2 + GAP_X + NODE_R;

const W = Math.ceil(OUT_X + NODE_R + EDGE);

// ---- down --------------------------------------------------------------------
const ROW_Y = V_EDGE + WORD_ROOM + RAIL_GAP + STEP_H / 2;
const TOP_Y = ROW_Y - STEP_H / 2 - RAIL_GAP;
const BOT_Y = ROW_Y + STEP_H / 2 + RAIL_GAP;

const H = Math.ceil(BOT_Y + WORD_ROOM + EDGE);

export default {
  width: W,
  height: H,
  title: 'The evaluator-optimizer pattern',
  desc:
    'A green circle named In leads to a teal box named LLM Call Generator '
    + 'carrying a brain mark. Its solution goes over the top to a teal box '
    + 'named LLM Call Evaluator, also carrying a brain mark, which leads on to '
    + 'an orange circle named Out. Underneath, a second run carries a rejected '
    + 'answer and the feedback on it back from the evaluator to the generator, '
    + 'so the pair loops until the answer is accepted.',

  build() {
    return [
      arrow({ from: [IN_X + NODE_R, ROW_Y], to: [GEN_X - STEP_W / 2 - 2, ROW_Y] }),

      // ---- over the top: what the generator produced ------------------------
      elbowArrow({
        points: [
          [GEN_X, ROW_Y - STEP_H / 2],
          [GEN_X, TOP_Y],
          [EVAL_X, TOP_Y],
          [EVAL_X, ROW_Y - STEP_H / 2 - 2],
        ],
      }),
      note({ x: (GEN_X + EVAL_X) / 2, y: TOP_Y - WORD_DY, text: 'Solution', halo: true }),

      // ---- and underneath: what the evaluator sent back ---------------------
      elbowArrow({
        points: [
          [EVAL_X, ROW_Y + STEP_H / 2],
          [EVAL_X, BOT_Y],
          [GEN_X, BOT_Y],
          [GEN_X, ROW_Y + STEP_H / 2 + 2],
        ],
      }),
      note({
        x: (GEN_X + EVAL_X) / 2,
        y: BOT_Y + WORD_DY + 4,
        text: 'Rejected + Feedback',
        halo: true,
      }),

      arrow({ from: [EVAL_X + STEP_W / 2, ROW_Y], to: [OUT_X - NODE_R - 2, ROW_Y] }),

      // ---- the shapes, over the lines that reach them -----------------------
      inNode({ x: IN_X, y: ROW_Y }),
      llm({ x: GEN_X, y: ROW_Y, name: 'LLM Call\nGenerator' }),
      llm({ x: EVAL_X, y: ROW_Y, name: 'LLM Call\nEvaluator' }),
      outNode({ x: OUT_X, y: ROW_Y }),
    ];
  },
};
