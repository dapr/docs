// WHAT DAPR DOES WHEN VERIFICATION FAILS: one gate on the failure type, and
// three different endings - a terminal event, or an error to the reader, with
// the state store left alone either way.
//
// Replaces the `flowchart TD` on
// developing-applications/building-blocks/workflow/workflow-history-signing.md,
// under "Metadata queries (API path)".
//
// Fact-check, against the paragraph the block sits under and the section it
// closes ("What happens when verification fails"):
//   - "the error is returned directly to the caller" - the metadata query
//     path ends at "Return error to reader", which is what the drawing shows.
//   - "Tamper of an in-flight workflow" (its own subsection) appends the
//     terminal event and deletes the reminders; the workflow then "surfaces
//     as FAILED on next read". Both are the source's own words.
//   - "Configuration error" (its own subsection) returns the error with NO
//     terminal append, which is why its box says so and why it joins the
//     "State store NOT modified" ending rather than the terminal one.
// Nothing here disagrees with the prose.
//
// TWO DELIBERATE DEPARTURES FROM THE SOURCE, both recorded here because
// neither is visible in the result:
//
//   1. THE FAILURE PATH RUNS DOWN THE MIDDLE, and "Pass" leaves sideways.
//      This set's rule is that the EXPECTED path runs straight down and the
//      exception leaves its gate sideways, which would put "Continue normal
//      execution" on the spine. It is inverted here because the section this
//      block closes is called "What happens when verification fails": the
//      failure fan IS the subject, and a drawing whose subject hangs off the
//      side of a one-box success path would be answering a question the page
//      is not asking. A Mermaid source has no spine to disagree with - the
//      positions in a rendered block are its layout engine's output, not a
//      decision - so this costs nothing in fidelity.
//
//   2. THE TWO EDGES THAT BOTH END AT "Return error to reader" ARE DRAWN AS
//      ONE RUN carrying both conditions. The source has
//      `D -->|Tamper, completed| F` and `D -->|Metadata query path| F`: two
//      edges between the same pair of nodes, which Mermaid draws as two
//      parallel lines. The graph says that box is reached under either
//      condition, and one run named with both says exactly that. Two lines
//      between one pair of shapes would read, in this set, as two different
//      things happening.
//
// THE RUN OUT OF "Verify" INTO THE GATE IS RED, and nothing below it is.
// Red, in this set, is a path that is BLOCKED - `api-scoping` uses it for a
// denied call - and `workflow-signing-verify`, the scene directly above this
// one on the same page, spends it on the seven ways verification fails. A
// failure edge drawn navy here and red there would be the same page saying
// two different things with one colour. What follows the gate is not a
// blocked path but what Dapr DOES about one, so it is drawn as ordinary
// flow.

import { C } from '../engine.mjs';
import { FLOW, note } from '../flow.mjs';
import {
  arrow, box, decision, decisionPoints, elbowArrow,
} from '../shapes.mjs';

const EDGE = 29;
const V_EDGE = 14;

// Wide enough for the longest line any box holds, which is the constant
// `(DAPR_WORKFLOW_HISTORY_TAMPERED)` at FLOW.SIZE with half an em clear each
// side. That line MEASURES 269 units - the first draft set the box at 268 and
// the text hung out of both ends of its own box, which every numeric test
// passed. The identifier is NOT broken across lines: a name split mid-word
// reads as two names, and horizontal space is the cheaper thing to spend.
const BOX_W = 292;
// One height for every box, set by the deepest name - the three-line terminal
// event box. A step shorter than the step beside it reads as a different kind
// of thing.
const BOX_H = 76;

const GATE_W = 104;
const GATE_H = 62;

// 48, not the 40 the first draft used: at 40 the canvas was 1014x640, which
// is 1.58 and just under the 1.60 the 16:9 floor allows. Eight units of air
// between the three endings is the cheapest way to clear it, and the only
// other lever - taking height out of the row rhythm - would have made this
// scene tighter than every flow scene beside it.
const COL_GAP = 48;
const ROW_GAP = 46;

const ASK_DY = 18;
const WORD_DY = 14;
const WORD_DROP = 22;

// A question sits centred over its diamond, directly under the run that
// arrives there, so the run crosses it and it needs ground behind it.
const ask = (x, y, text) => note({ x, y, text, halo: true });

// ---- three columns, one per ending ------------------------------------------
const COL_1 = EDGE + BOX_W / 2;
const COL_2 = COL_1 + BOX_W + COL_GAP;
const COL_3 = COL_2 + BOX_W + COL_GAP;

// ---- the rows ----------------------------------------------------------------
const ASK_ROOM = ROW_GAP + FLOW.NOTE_SIZE * 1.2 + ASK_DY;

const ROW_LOAD = V_EDGE + BOX_H / 2;
const ROW_VERIFY = ROW_LOAD + BOX_H / 2 + ROW_GAP + BOX_H / 2;
const ROW_GATE = ROW_VERIFY + BOX_H / 2 + ASK_ROOM + GATE_H / 2;
// The branch words out of the gate are two lines deep on the middle run, so
// the leaf row stands off the gate by that much rather than by ROW_GAP.
const FAN_ROOM = ROW_GAP + FLOW.NOTE_SIZE * 1.2 * 2;
const ROW_LEAF = ROW_GATE + GATE_H / 2 + FAN_ROOM + BOX_H / 2;
const ROW_END = ROW_LEAF + BOX_H / 2 + ROW_GAP + BOX_H / 2;

// "State store NOT modified" is reached from the middle and the right column,
// so it sits between them rather than under either.
const COL_END = (COL_2 + COL_3) / 2;

// Where the two runs into that ending meet: halfway down the gap below the
// leaf row, so both turn on the same line rather than each at its own height.
const JOIN_Y = (ROW_LEAF + BOX_H / 2 + ROW_END - BOX_H / 2) / 2;

const W = Math.ceil(COL_3 + BOX_W / 2 + EDGE);
const H = Math.ceil(ROW_END + BOX_H / 2 + V_EDGE);

const step = (x, y, label) => box({
  x, y, w: BOX_W, h: BOX_H, label, ...FLOW.step,
});

export default {
  width: W,
  height: H,
  title: 'What Dapr does when workflow history verification fails',
  desc:
    'A flow running down the middle: Load workflow state, then Verify '
    + 'signature chain plus attestations and lineage. Its Pass branch leaves '
    + 'sideways to Continue normal execution; its Fail branch goes down to a '
    + 'gold gate asking the failure type. The gate fans into three endings: '
    + 'Tamper, in-flight goes left to Append unsigned terminal event '
    + 'DAPR_WORKFLOW_HISTORY_TAMPERED plus delete reminders, which ends at '
    + 'Workflow surfaces as FAILED on next read; Tamper, completed or a '
    + 'metadata query goes down to Return error to reader; and '
    + 'ConfigurationError goes right to Return error to reader with no '
    + 'terminal append. The last two both end at State store NOT modified.',

  build() {
    const gate = decisionPoints({ x: COL_2, y: ROW_GATE, w: GATE_W, h: GATE_H });
    return [
      // ---- down the spine, which is the failure path -----------------------
      arrow({ from: [COL_2, ROW_LOAD + BOX_H / 2], to: [COL_2, ROW_VERIFY - BOX_H / 2 - 2] }),
      arrow({ from: [COL_2, ROW_VERIFY + BOX_H / 2], to: [COL_2, gate.top[1] - 2], color: C.red }),
      note({
        x: COL_2 + 10,
        y: ROW_VERIFY + BOX_H / 2 + WORD_DROP,
        text: 'Fail',
        anchor: 'start',
      }),
      ask(COL_2, gate.top[1] - ASK_DY, 'Failure type'),

      // ---- and the one branch that is not a failure ------------------------
      arrow({
        from: [COL_2 + BOX_W / 2, ROW_VERIFY],
        to: [COL_3 - BOX_W / 2 - 2, ROW_VERIFY],
      }),
      note({
        x: (COL_2 + BOX_W / 2 + COL_3 - BOX_W / 2) / 2,
        y: ROW_VERIFY - WORD_DY,
        text: 'Pass',
      }),

      // ---- the fan: left, down, right --------------------------------------
      elbowArrow({
        points: [
          gate.left,
          [COL_1, ROW_GATE],
          [COL_1, ROW_LEAF - BOX_H / 2 - 2],
        ],
      }),
      note({
        x: (COL_1 + gate.left[0]) / 2,
        y: ROW_GATE - WORD_DY,
        text: 'Tamper, in-flight',
      }),

      arrow({ from: gate.bottom, to: [COL_2, ROW_LEAF - BOX_H / 2 - 2] }),
      note({
        x: COL_2 + 10,
        y: gate.bottom[1] + WORD_DROP,
        text: 'Tamper, completed\nor metadata query path',
        anchor: 'start',
      }),

      elbowArrow({
        points: [
          gate.right,
          [COL_3, ROW_GATE],
          [COL_3, ROW_LEAF - BOX_H / 2 - 2],
        ],
      }),
      note({
        x: (COL_3 + gate.right[0]) / 2,
        y: ROW_GATE - WORD_DY,
        text: 'ConfigurationError',
      }),

      // ---- what each ending leads to ---------------------------------------
      arrow({ from: [COL_1, ROW_LEAF + BOX_H / 2], to: [COL_1, ROW_END - BOX_H / 2 - 2] }),
      elbowArrow({
        points: [
          [COL_2, ROW_LEAF + BOX_H / 2],
          [COL_2, JOIN_Y],
          [COL_END, JOIN_Y],
          [COL_END, ROW_END - BOX_H / 2 - 2],
        ],
      }),
      elbowArrow({
        points: [
          [COL_3, ROW_LEAF + BOX_H / 2],
          [COL_3, JOIN_Y],
          [COL_END, JOIN_Y],
          [COL_END, ROW_END - BOX_H / 2 - 2],
        ],
      }),

      // ---- the shapes, over the lines that reach them -----------------------
      step(COL_2, ROW_LOAD, 'Load workflow state'),
      step(COL_2, ROW_VERIFY, 'Verify signature chain\n+ attestations + lineage'),
      step(COL_3, ROW_VERIFY, 'Continue normal\nexecution'),
      decision({ x: COL_2, y: ROW_GATE, w: GATE_W, h: GATE_H, ...FLOW.wait }),
      step(COL_1, ROW_LEAF, 'Append unsigned terminal event\n(DAPR_WORKFLOW_HISTORY_TAMPERED)\n+ delete reminders'),
      step(COL_2, ROW_LEAF, 'Return error\nto reader'),
      step(COL_3, ROW_LEAF, 'Return error to reader\n(no terminal append)'),
      step(COL_1, ROW_END, 'Workflow surfaces as\nFAILED on next read'),
      step(COL_END, ROW_END, 'State store\nNOT modified'),
    ];
  },
};
