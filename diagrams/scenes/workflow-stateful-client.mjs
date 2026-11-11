// HOW A WORKER DECIDES WHAT TO REPLAY when a work item arrives: the full
// history, a cached prefix plus a delta, or a fresh fetch.
//
// Replaces the `flowchart TD` on
// developing-applications/building-blocks/workflow/workflow-stateful-client.md,
// under "Cache hits and misses". The page's `sequenceDiagram` above it stays
// Mermaid: lifelines and activations are a notation this set does not have
// and should not grow one for. That split is the maintainer's ruling of
// 2026-11-01, and tests/diagrams.spec.js enforces exactly it.
//
// Fact-check, against the paragraph the block sits under:
//   "The worker validates every delta before using it: the number of events
//   it has cached must exactly match the count the sidecar says it omitted.
//   If it does not match, or nothing is cached at all, the worker treats it
//   as a cache miss and fetches the full history from the sidecar with a
//   `GetInstanceHistory` call."
// Every node and every edge of the Mermaid agrees with that, and so does
// this. The next sentence - "A cache miss costs one extra call and is always
// safe" - is why the miss path ends in a replay rather than a failure.
//
// THERE IS NO ARRANGEMENT TO MATCH, which is the whole difference between a
// Mermaid source and an image one: the positions in a rendered Mermaid block
// are its layout engine's output, not a decision. What the source gives is
// the graph. So the graph is laid out the way this set lays out a decision:
//
//   - the path that is expected runs STRAIGHT DOWN - a work item arrives,
//     there is a cached history, the counts match, replay the prefix and the
//     delta - and every exception leaves its gate SIDEWAYS.
//     `workflow-cross-app-client` does the same with allowed and denied.
//   - a question rides ABOVE its diamond rather than inside it. A diamond is
//     widest only on its centre line, so a second line of label overflows a
//     shape that still passes every geometric check; Mermaid has no such
//     constraint and sets all three lines inside.
//   - every box is one height, including the ones whose name is a single
//     line. A step that is shorter than the step beside it reads as a
//     different kind of thing.

import { C } from '../engine.mjs';
import { FLOW, note } from '../flow.mjs';
import {
  arrow, box, decision, decisionPoints, elbowArrow,
} from '../shapes.mjs';

const EDGE = 29;
const V_EDGE = 14;

// Wide enough for the longest line any box holds - "is redelivered to a cold
// stream" - measured on the rendered page, with half an em clear each side.
const BOX_W = 222;
// One height for every box, set by the two-line names. See the note above.
const BOX_H = 58;

const GATE_W = 92;
const GATE_H = 62;

// Between columns, and between one row's lower edge and the next row's upper
// one. The row gap also has to carry the word on the run that crosses it.
const COL_GAP = 46;
const ROW_GAP = 46;

// How far a question stands above its diamond, and a branch's word off the
// run it names.
const ASK_DY = 18;
const WORD_DY = 14;

// A question sits centred over its diamond, which is directly under the run
// that arrives there - so the run crosses it, and it needs ground behind it.
// `workflow-cross-app-client` haloes its own for the same reason, and the
// rendered rule `paints ground behind any label a line crosses` is the check.
const ask = (x, y, text) => note({ x, y, text, halo: true });

// A branch's word rides just under the gate it leaves, not at the middle of
// the run: at the middle it met the next gate's question coming the other
// way.
const WORD_DROP = 22;

// ---- the three columns -------------------------------------------------------
const COL_1 = EDGE + BOX_W / 2;
const COL_2 = COL_1 + BOX_W + COL_GAP;
const COL_3 = COL_2 + BOX_W + COL_GAP;

// ---- the four rows -----------------------------------------------------------
// The questions above the gates are the deepest thing between two rows, so
// the gap a gate row takes is the question plus its air. TWO lines of it:
// the second gate asks about cachedHistory.eventCount, and on one line that
// question is wider than the whole left column and ran off the canvas.
const ASK_LINES = 2;
const ASK_ROOM = ROW_GAP + FLOW.NOTE_SIZE * 1.2 * ASK_LINES + ASK_DY;

const ROW_ARRIVE = V_EDGE + BOX_H / 2;
const ROW_GATE_1 = ROW_ARRIVE + BOX_H / 2 + ASK_ROOM + GATE_H / 2;
const ROW_GATE_2 = ROW_GATE_1 + GATE_H / 2 + ASK_ROOM + GATE_H / 2;
const ROW_LEAF = ROW_GATE_2 + GATE_H / 2 + ROW_GAP + BOX_H / 2;

const W = Math.ceil(COL_3 + BOX_W / 2 + EDGE);
const H = Math.ceil(ROW_LEAF + BOX_H / 2 + V_EDGE);

const step = (x, y, label) => box({
  x, y, w: BOX_W, h: BOX_H, label, ...FLOW.step,
});

export default {
  width: W,
  height: H,
  title: 'How a workflow worker decides what to replay when a work item arrives',
  desc:
    'A flow running down the left column: a box, Work item arrives, down to a '
    + 'gold gate asking whether cachedHistory is set; its Yes (delta send) '
    + 'branch goes down to a second gate asking whether the cached events '
    + 'match cachedHistory.eventCount, and that gate’s Yes branch ends at '
    + 'Replay cached prefix plus the delta. Each No leaves its gate sideways: '
    + 'No (full send) goes right to Replay pastEvents as the full history, and '
    + 'No (cache miss) goes right to Fetch the full history via '
    + 'GetInstanceHistory, which ends either at Replay the fetched history on '
    + 'success or at Drop the stream so the turn is redelivered to a cold '
    + 'stream on failure.',

  build() {
    const gate1 = decisionPoints({ x: COL_1, y: ROW_GATE_1, w: GATE_W, h: GATE_H });
    const gate2 = decisionPoints({ x: COL_1, y: ROW_GATE_2, w: GATE_W, h: GATE_H });
    const fetchY = ROW_GATE_2;
    return [
      // ---- down the expected path -----------------------------------------
      arrow({ from: [COL_1, ROW_ARRIVE + BOX_H / 2], to: [COL_1, gate1.top[1] - 2] }),
      ask(COL_1, gate1.top[1] - ASK_DY, 'Is cachedHistory set?'),

      arrow({ from: gate1.bottom, to: [COL_1, gate2.top[1] - 2] }),
      note({
        x: COL_1 + 10,
        y: gate1.bottom[1] + WORD_DROP,
        text: 'Yes (delta send)',
        anchor: 'start',
      }),
      ask(
        COL_1,
        gate2.top[1] - ASK_DY - FLOW.NOTE_SIZE * 0.6,
        'Do the cached events match\ncachedHistory.eventCount?',
      ),

      arrow({ from: gate2.bottom, to: [COL_1, ROW_LEAF - BOX_H / 2 - 2] }),
      note({
        x: COL_1 + 10, y: gate2.bottom[1] + WORD_DROP, text: 'Yes', anchor: 'start',
      }),

      // ---- and each exception, sideways -----------------------------------
      arrow({ from: gate1.right, to: [COL_2 - BOX_W / 2 - 2, ROW_GATE_1] }),
      note({
        x: (gate1.right[0] + COL_2 - BOX_W / 2) / 2,
        y: ROW_GATE_1 - WORD_DY,
        text: 'No (full send)',
      }),
      arrow({ from: gate2.right, to: [COL_2 - BOX_W / 2 - 2, fetchY] }),
      note({
        x: (gate2.right[0] + COL_2 - BOX_W / 2) / 2,
        y: fetchY - WORD_DY,
        text: 'No (cache miss)',
      }),

      // ---- the fetch has two outcomes of its own --------------------------
      arrow({ from: [COL_2, fetchY + BOX_H / 2], to: [COL_2, ROW_LEAF - BOX_H / 2 - 2] }),
      note({
        x: COL_2 + 10, y: fetchY + BOX_H / 2 + WORD_DROP, text: 'Success', anchor: 'start',
      }),
      elbowArrow({
        points: [
          [COL_2 + BOX_W / 2 + 2, fetchY],
          [COL_3, fetchY],
          [COL_3, ROW_LEAF - BOX_H / 2 - 2],
        ],
      }),
      note({
        x: (COL_2 + BOX_W / 2 + COL_3) / 2,
        y: fetchY - WORD_DY,
        text: 'Failure',
      }),

      // ---- the shapes, over the lines that reach them ---------------------
      step(COL_1, ROW_ARRIVE, 'Work item arrives'),
      decision({ x: COL_1, y: ROW_GATE_1, w: GATE_W, h: GATE_H, ...FLOW.wait }),
      decision({ x: COL_1, y: ROW_GATE_2, w: GATE_W, h: GATE_H, ...FLOW.wait }),
      step(COL_1, ROW_LEAF, 'Replay cached prefix\nplus the delta'),
      step(COL_2, ROW_GATE_1, 'Replay pastEvents\nas the full history'),
      step(COL_2, fetchY, 'Fetch the full history\nvia GetInstanceHistory'),
      step(COL_2, ROW_LEAF, 'Replay the fetched history'),
      step(COL_3, ROW_LEAF, 'Drop the stream so the turn\nis redelivered to a cold stream'),
    ];
  },
};
