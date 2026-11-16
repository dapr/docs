// THE ORCHESTRATOR-WORKERS PATTERN: a model call decides what the subtasks
// are, worker calls do them, and a model call writes up the result.
//
// Replaces dapr-agents/agents-orchestrator-workers.png on
// developing-ai/dapr-agents/dapr-agents-patterns.md, under
// "Orchestrator-Workers".
//
// Fact-check, against the paragraph the image sits under and the code below
// it. The pattern "features a central ORCHESTRATOR LLM that dynamically breaks
// down tasks, delegates them to WORKER LLMs, and synthesizes their results",
// and the sample's three steps are "Orchestrator analyzes request and
// determines required tasks", "Execute each task with a worker LLM" and
// "Synthesize the results into a cohesive travel plan". All five boxes are
// model calls, so all five carry the brain mark. The source draws the
// orchestrator and the synthesizer in the blue it gives plain code, which is
// the one thing in it the prose contradicts outright.
//
// THIS IS THE PATTERN PARALLELIZATION IS COMPARED AGAINST, and the comparison
// is the reason the mark matters: the two pictures have the same skeleton, and
// what tells them apart is that parallelization's Aggregator is code while
// this page's Synthesizer is a model call. Drawn in the source's colours the
// two are indistinguishable; drawn with the mark the difference is the first
// thing you see.
//
// The number of workers is NOT three in general - "the number and nature of
// subtasks can't be known in advance" is the pattern's whole point - and the
// note says so, because three boxes on their own say three.
//
// The shared measurements and the meaning of every shape are in
// diagrams/agent-patterns.mjs.

import {
  EDGE, GAP_X, GAP_Y, NODE_R, STEP_H, STEP_W, V_EDGE, inNode, llm, outNode,
} from '../agent-patterns.mjs';
import { arrow, elbowArrow } from '../shapes.mjs';
import { note } from '../flow.mjs';

const WORKERS = ['LLM 1', 'LLM 2', 'LLM 3'];

// ---- across ------------------------------------------------------------------
const IN_X = EDGE + NODE_R;
const ORCH_X = IN_X + NODE_R + GAP_X + STEP_W / 2;
const LLM_X = ORCH_X + STEP_W + GAP_X;
const SYNTH_X = LLM_X + STEP_W + GAP_X;
const OUT_X = SYNTH_X + STEP_W / 2 + GAP_X + NODE_R;

const W = Math.ceil(OUT_X + NODE_R + EDGE);

// ---- down --------------------------------------------------------------------
const PITCH = STEP_H + GAP_Y;
const ROW_0 = V_EDGE + STEP_H / 2;
const rowY = (i) => ROW_0 + i * PITCH;
const MID = rowY(1);

// The note is about the ORCHESTRATOR - it is the thing that decides how many
// workers there are - so it sits under the orchestrator. See the same note
// on `agents-routing`.
const NOTE_X = ORCH_X;
const NOTE_Y = rowY(2) + STEP_H / 2 + 22;

const H = Math.ceil(NOTE_Y + 12 + EDGE);

export default {
  width: W,
  height: H,
  title: 'The orchestrator-workers pattern',
  desc:
    'A green circle named In leads to a teal box named Orchestrator carrying '
    + 'a brain mark. It fans out to three teal boxes named LLM 1, LLM 2 and '
    + 'LLM 3, each carrying a brain mark, and all three lead to a teal box '
    + 'named Synthesizer, which also carries a brain mark, and on to an orange '
    + 'circle named Out. A note reads that the orchestrator decides how many '
    + 'workers there are, so three is an example rather than a fixed number.',

  build() {
    const orchRight = ORCH_X + STEP_W / 2;
    const llmLeft = LLM_X - STEP_W / 2;
    const llmRight = LLM_X + STEP_W / 2;
    return [
      arrow({ from: [IN_X + NODE_R, MID], to: [ORCH_X - STEP_W / 2 - 2, MID] }),

      // ---- out to the workers the orchestrator decided on -------------------
      elbowArrow({
        points: [
          [ORCH_X, MID - STEP_H / 2],
          [ORCH_X, rowY(0)],
          [llmLeft - 2, rowY(0)],
        ],
      }),
      arrow({ from: [orchRight, MID], to: [llmLeft - 2, MID] }),
      elbowArrow({
        points: [
          [ORCH_X, MID + STEP_H / 2],
          [ORCH_X, rowY(2)],
          [llmLeft - 2, rowY(2)],
        ],
      }),

      // ---- and back in, to be written up ------------------------------------
      elbowArrow({
        points: [
          [llmRight, rowY(0)],
          [SYNTH_X, rowY(0)],
          [SYNTH_X, MID - STEP_H / 2 - 2],
        ],
      }),
      arrow({ from: [llmRight, MID], to: [SYNTH_X - STEP_W / 2 - 2, MID] }),
      elbowArrow({
        points: [
          [llmRight, rowY(2)],
          [SYNTH_X, rowY(2)],
          [SYNTH_X, MID + STEP_H / 2 + 2],
        ],
      }),

      arrow({ from: [SYNTH_X + STEP_W / 2, MID], to: [OUT_X - NODE_R - 2, MID] }),

      note({ x: NOTE_X, y: NOTE_Y, text: 'The orchestrator decides how many\nworkers there are; three is an example' }),

      // ---- the shapes, over the lines that reach them -----------------------
      inNode({ x: IN_X, y: MID }),
      llm({ x: ORCH_X, y: MID, name: 'Orchestrator' }),
      WORKERS.map((name, i) => llm({ x: LLM_X, y: rowY(i), name })),
      llm({ x: SYNTH_X, y: MID, name: 'Synthesizer' }),
      outNode({ x: OUT_X, y: MID }),
    ];
  },
};
