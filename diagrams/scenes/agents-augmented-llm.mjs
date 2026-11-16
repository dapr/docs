// THE AUGMENTED LLM PATTERN: one model call, and the three things outside it
// that the call can reach for.
//
// Replaces dapr-agents/agents-augmented-llm.png on
// developing-ai/dapr-agents/dapr-agents-patterns.md, under "Augmented LLM".
//
// Fact-check, against the paragraph the image sits under: the pattern "enhances
// a language model with external capabilities like memory and tools, providing
// a basic but powerful foundation", and "the augmented LLM can access external
// tools, maintain conversation history, and provide consistent responses". The
// three boxes are the source's own - Retrieval, Tools, Memory - and so are the
// three words on the runs to them.
//
// The shared measurements and the meaning of every shape are in
// diagrams/agent-patterns.mjs. What is here is this picture's arrangement.
//
// THE THREE EXCHANGES ARE ORTHOGONAL, not the source's three diagonals. The
// house already settled this on the same subject: agents-overview replaced a
// radial source image and its header records why - "a bus keeps the horizontal
// runs short and makes the five read as one set", where diagonals "give every
// arrow a different angle". Tools sits straight under the call and takes a
// straight drop; Retrieval and Memory leave the same edge and turn away from
// each other, so the two rails never share a unit of ink.
//
// Each run carries a head at BOTH ends, which is the whole of what the
// source's dotting was reaching for: the call asks and the resource answers.
// See the module header.

import {
  EDGE, GAP_X, LEG_DX, NODE_R, RAIL_DROP, RES_DROP, RES_PITCH, RES_W, STEP_H,
  STEP_W, V_EDGE, WORD_DY, exchange, inNode, llm, outNode, outside,
} from '../agent-patterns.mjs';
import { arrow } from '../shapes.mjs';
import { note } from '../flow.mjs';

// ---- across ------------------------------------------------------------------
const HALF = RES_PITCH + RES_W / 2;
const W = Math.ceil(HALF * 2 + EDGE * 2);
const CX = W / 2;

const RETRIEVAL_X = CX - RES_PITCH;
const TOOLS_X = CX;
const MEMORY_X = CX + RES_PITCH;

const IN_X = CX - (STEP_W / 2 + GAP_X + NODE_R);
const OUT_X = CX + (STEP_W / 2 + GAP_X + NODE_R);

// ---- down --------------------------------------------------------------------
const ROW_Y = V_EDGE + NODE_R;
const CALL_BOTTOM = ROW_Y + STEP_H / 2;
const RAIL_Y = CALL_BOTTOM + RAIL_DROP;
const RES_TOP = RAIL_Y + RES_DROP;
const RES_Y = RES_TOP + STEP_H / 2;

// `Call/Response` rides BELOW the rail on the straight drop, where the rail
// and the two words on it are not in the way.
const CALL_WORD_Y = RAIL_Y + 24;

const H = Math.ceil(RES_Y + STEP_H / 2 + EDGE);

const word = (x, y, text, anchor = 'middle') => note({
  x, y, text, anchor, halo: true,
});

export default {
  width: W,
  height: H,
  title: 'The augmented LLM pattern',
  desc:
    'A green circle named In leads to a teal box named LLM carrying a brain '
    + 'mark, which leads to an orange circle named Out. Beneath the LLM box, '
    + 'three blue boxes stand in a row: Retrieval on the left, Tools in the '
    + 'middle and Memory on the right. A run with an arrowhead at each end '
    + 'joins the LLM to each of them: Query and Results to Retrieval, Call '
    + 'and Response to Tools, Read and Write to Memory.',

  build() {
    return [
      // ---- in, through, and out --------------------------------------------
      arrow({ from: [IN_X + NODE_R, ROW_Y], to: [CX - STEP_W / 2 - 2, ROW_Y] }),
      arrow({ from: [CX + STEP_W / 2, ROW_Y], to: [OUT_X - NODE_R - 2, ROW_Y] }),

      // ---- and what the call reaches for -----------------------------------
      exchange({
        points: [
          [CX - LEG_DX, CALL_BOTTOM + 2],
          [CX - LEG_DX, RAIL_Y],
          [RETRIEVAL_X, RAIL_Y],
          [RETRIEVAL_X, RES_TOP - 2],
        ],
      }),
      word((CX - LEG_DX + RETRIEVAL_X) / 2, RAIL_Y - WORD_DY, 'Query / Results'),

      exchange({
        points: [[TOOLS_X, CALL_BOTTOM + 2], [TOOLS_X, RES_TOP - 2]],
      }),
      word(TOOLS_X + 10, CALL_WORD_Y, 'Call / Response', 'start'),

      exchange({
        points: [
          [CX + LEG_DX, CALL_BOTTOM + 2],
          [CX + LEG_DX, RAIL_Y],
          [MEMORY_X, RAIL_Y],
          [MEMORY_X, RES_TOP - 2],
        ],
      }),
      word((CX + LEG_DX + MEMORY_X) / 2, RAIL_Y - WORD_DY, 'Read / Write'),

      // ---- the shapes, over the lines that reach them -----------------------
      inNode({ x: IN_X, y: ROW_Y }),
      llm({ x: CX, y: ROW_Y, name: 'LLM' }),
      outNode({ x: OUT_X, y: ROW_Y }),
      outside({ x: RETRIEVAL_X, y: RES_Y, name: 'Retrieval', w: RES_W }),
      outside({ x: TOOLS_X, y: RES_Y, name: 'Tools', w: RES_W }),
      outside({ x: MEMORY_X, y: RES_Y, name: 'Memory', w: RES_W }),
    ];
  },
};
