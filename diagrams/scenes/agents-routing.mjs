// THE ROUTING PATTERN: one model call classifies the request, and the request
// goes to whichever specialist handles that kind.
//
// Replaces dapr-agents/agents-routing.png on
// developing-ai/dapr-agents/dapr-agents-patterns.md, under "Routing".
//
// Fact-check, against the paragraph the image sits under and the code below
// it. The pattern "addresses diverse request types by classifying inputs and
// directing them to specialized follow-up tasks". THE ROUTER IS AN LLM CALL:
// the sample comments its first step "Classify the query type using an LLM",
// and the advantages list names "LLM-Powered Classification - Uses an LLM to
// categorize queries dynamically". The source image draws the router in the
// blue it gives plain code, which the prose does not support, so the router
// carries the brain mark here like every other model call in the set.
//
// ALL THREE ROUTES ARE DRAWN THE SAME, where the source draws the first solid
// and the other two dashed. Nothing makes route one the real one - three
// specialists are three peers - and in this set a dashed line says the run is
// not traffic at all. What the dashing was reaching for is that only ONE route
// runs, and the picture says that in words instead of by demoting two thirds
// of itself. See the module header.
//
// The shared measurements and the meaning of every shape are in
// diagrams/agent-patterns.mjs.

import {
  EDGE, GAP_X, GAP_Y, NODE_R, STEP_H, STEP_W, V_EDGE, inNode, llm, outNode,
} from '../agent-patterns.mjs';
import { arrow, elbowArrow } from '../shapes.mjs';
import { note } from '../flow.mjs';

const SPECIALISTS = ['LLM 1', 'LLM 2', 'LLM 3'];

// ---- across ------------------------------------------------------------------
const IN_X = EDGE + NODE_R;
const ROUTER_X = IN_X + NODE_R + GAP_X + STEP_W / 2;
const LLM_X = ROUTER_X + STEP_W + GAP_X;
const OUT_X = LLM_X + STEP_W / 2 + GAP_X + NODE_R;

const W = Math.ceil(OUT_X + NODE_R + EDGE);

// ---- down --------------------------------------------------------------------
const PITCH = STEP_H + GAP_Y;
const ROW_0 = V_EDGE + STEP_H / 2;
const rowY = (i) => ROW_0 + i * PITCH;
const MID = rowY(1);

// The note is about the ROUTER - what it does and how many of its three
// routes run - so it sits under the router, not under the gap between the
// router and the specialists. Centred on the gap it read as a caption for
// whichever box it happened to end up beneath, which on this canvas was the
// bottom specialist.
const NOTE_X = ROUTER_X;
const NOTE_Y = rowY(2) + STEP_H / 2 + 22;

const H = Math.ceil(NOTE_Y + 12 + EDGE);

export default {
  width: W,
  height: H,
  title: 'The routing pattern',
  desc:
    'A green circle named In leads to a teal box named Router carrying a '
    + 'brain mark. Three routes leave it, one to each of three teal boxes '
    + 'named LLM 1, LLM 2 and LLM 3, each carrying a brain mark, and each of '
    + 'the three leads on to a single orange circle named Out. A note reads '
    + 'that the router classifies the request and only one route runs.',

  build() {
    const routerRight = ROUTER_X + STEP_W / 2;
    const llmLeft = LLM_X - STEP_W / 2;
    const llmRight = LLM_X + STEP_W / 2;
    return [
      arrow({ from: [IN_X + NODE_R, MID], to: [ROUTER_X - STEP_W / 2 - 2, MID] }),

      // ---- out to the three specialists -------------------------------------
      // The outer two leave the router's own top and bottom edges, so no two
      // routes share a unit of ink on the way out.
      elbowArrow({
        points: [
          [ROUTER_X, MID - STEP_H / 2],
          [ROUTER_X, rowY(0)],
          [llmLeft - 2, rowY(0)],
        ],
      }),
      arrow({ from: [routerRight, MID], to: [llmLeft - 2, MID] }),
      elbowArrow({
        points: [
          [ROUTER_X, MID + STEP_H / 2],
          [ROUTER_X, rowY(2)],
          [llmLeft - 2, rowY(2)],
        ],
      }),

      // ---- and whichever one ran, out --------------------------------------
      elbowArrow({
        points: [
          [llmRight, rowY(0)],
          [OUT_X, rowY(0)],
          [OUT_X, MID - NODE_R - 2],
        ],
      }),
      arrow({ from: [llmRight, MID], to: [OUT_X - NODE_R - 2, MID] }),
      elbowArrow({
        points: [
          [llmRight, rowY(2)],
          [OUT_X, rowY(2)],
          [OUT_X, MID + NODE_R + 2],
        ],
      }),

      note({ x: NOTE_X, y: NOTE_Y, text: 'The router classifies the request;\nexactly one route runs' }),

      // ---- the shapes, over the lines that reach them -----------------------
      inNode({ x: IN_X, y: MID }),
      llm({ x: ROUTER_X, y: MID, name: 'Router' }),
      SPECIALISTS.map((name, i) => llm({ x: LLM_X, y: rowY(i), name })),
      outNode({ x: OUT_X, y: MID }),
    ];
  },
};
