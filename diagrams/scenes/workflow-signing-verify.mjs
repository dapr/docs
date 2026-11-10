// HOW DAPR VERIFIES A SIGNATURE CHAIN ON EVERY LOAD: two gates that decide
// whether verification runs at all, then the seven checks each signature must
// pass, any one of which fails the load.
//
// Replaces the `flowchart TD` on
// developing-applications/building-blocks/workflow/workflow-history-signing.md,
// under "Verification on load".
//
// Fact-check, against the sentence the block sits under and the numbered list
// below it:
//   - "Every time workflow state is loaded (whether for execution or a
//     metadata query) the full signature chain is verified" - which is why
//     the lane is captioned for each signature in the chain rather than for
//     the workflow, and why the last gate asks whether all events are
//     covered.
//   - The seven checks are the page's own list, in the page's own order and
//     its own words: chain linkage, event range contiguity, the recomputed
//     events digest, the cryptographic signature, the certificate time
//     window, chain-of-trust to the CA, and the SPIFFE app identity.
//   - Both refusals are the page's: unsigned history cannot be loaded with
//     signing enabled, and signed history cannot be loaded without a signer.
// Nothing here disagrees with the prose.
//
// THREE DELIBERATE DEPARTURES FROM THE SOURCE:
//
//   1. THE SEVEN FAILURE EDGES ARE A BUS, not seven separate runs to one
//      box. The source draws `E -->|Mismatch| M`, `F -->|Gap| M` and five
//      more: seven lines converging on one node, which Mermaid fans out and
//      this set draws as a bus with seven feeders. The meaning is the one
//      the source states - any check failing ends the load the same way -
//      and a bus says that in one line instead of seven crossing ones. Each
//      feeder keeps its own word, so no condition is lost.
//
//   2. "All events covered?" IS A GATE, drawn as a gold diamond. The source
//      writes it `L["All events covered?"]` - a box - while writing every
//      other question `{...}`. It has a Yes edge and a No edge, so it is a
//      gate by every other rule in the source itself, and the square
//      brackets read as an authoring slip rather than a decision. A question
//      in a rectangle, in this set, is a step that happens to end in a
//      question mark.
//
//   3. THE TICKS AND CROSSES ARE DROPPED. The source ends at "Verification
//      passed ✓" and "Verification failed ✗". This set has no glyph in body
//      text; what it has is a red run for a path that is blocked, which the
//      pub/sub dead-letter scene established and which `api-scoping` uses
//      for exactly this - a denied path in C.red. The failed end therefore
//      wears a red outline and every run into it is red, and the passed end
//      is an ordinary step. The words still say which is which.
//
// The chain runs DOWN rather than across because its seven steps are one
// sequence and reading them is the point; the bus runs down its right-hand
// side so that no feeder crosses another.

import { C } from '../engine.mjs';
import { FLOW, flowLane, note } from '../flow.mjs';
import {
  arrow, box, CAPTION_INSET, decision, decisionPoints, elbowArrow,
} from '../shapes.mjs';

const EDGE = 29;
const V_EDGE = 14;

// One width for every box in the scene, entry and step alike. Set by the
// longest line that has to sit on one: "Validate certificate time window".
const BOX_W = 250;
// The entry boxes carry up to three lines - both refusals do - and the steps
// carry at most two, so they are different heights. They are never side by
// side, which is the only place a difference in height would read as a
// difference in kind.
const ENTRY_H = 68;
const STEP_H = 48;

const GATE_W = 104;
const GATE_H = 62;

const COL_GAP = 46;
const ROW_GAP = 46;
// Down the chain, inside the lane. Tighter than ROW_GAP because the seven
// checks are one sequence rather than seven separate things that happen.
const STEP_GAP = 20;

// "in the chain" is in this scene's title, in its description and in the
// sentence the block sits under. What the band has room for is the loop.
const CAPTION = 'For each signature';
const CAPTION_W = 136;

const ASK_DY = 18;
const WORD_DY = 14;
const WORD_DROP = 22;

const ask = (x, y, text) => note({ x, y, text, halo: true });

// ---- three columns: the refusals, the chain, and what it ends at -------------
const COL_LEFT = EDGE + BOX_W / 2;
const COL_MAIN = COL_LEFT + BOX_W / 2 + COL_GAP + BOX_W / 2;
// The lane reaches 30 units further LEFT than its contents need. The run out
// of the second gate drops into the first check at COL_MAIN, which is the
// lane's own centre line, so a caption pill at the default inset was drawn
// straight through it. Thirty units of extra band, and a caption cut to what
// that leaves room for, is what moves the pill clear; the alternative is a
// pill wider than half the lane, which no inset can place.
const CAPTION_ROOM = 30;
const LANE_X0 = COL_MAIN - BOX_W / 2 - FLOW.PAD - CAPTION_ROOM;
const LANE_X1 = COL_MAIN + BOX_W / 2 + FLOW.PAD;
// The bus runs down the lane's right-hand side. The offset is what carries
// each feeder's word OUTSIDE the lane: at 30 the words were centred on the
// run and landed squarely on the dashed border, which every numeric test
// passed and the render showed at once.
const BUS_X = LANE_X1 + 84;
// Where a feeder's word starts: just clear of the lane border, so the seven
// of them line up as a column rather than each centring on its own run.
const WORD_X = LANE_X1 + 10;
const COL_RIGHT = BUS_X + 30 + BOX_W / 2;

// ---- the rows ----------------------------------------------------------------
const ASK_ROOM = ROW_GAP + FLOW.NOTE_SIZE * 1.2 + ASK_DY;

const ROW_LOAD = V_EDGE + ENTRY_H / 2;
const ROW_GATE_1 = ROW_LOAD + ENTRY_H / 2 + ASK_ROOM + GATE_H / 2;
const ROW_GATE_2 = ROW_GATE_1 + GATE_H / 2 + ASK_ROOM + GATE_H / 2;

const LANE_Y0 = ROW_GATE_2 + GATE_H / 2 + ROW_GAP;
const ROW_STEP_1 = LANE_Y0 + FLOW.PAD + STEP_H / 2;
const STEP_PITCH = STEP_H + STEP_GAP;
const stepY = (i) => ROW_STEP_1 + i * STEP_PITCH;

const STEPS = [
  ['Verify chain linkage', 'Mismatch'],
  ['Verify event range contiguity', 'Gap'],
  ['Recompute events digest\nfrom raw bytes', 'Mismatch'],
  ['Verify cryptographic signature', 'Failed'],
  ['Validate certificate time window', 'Expired'],
  ['Verify certificate\nchain-of-trust to CA', 'Untrusted'],
  ['Verify SPIFFE app identity', 'Wrong app'],
];

const ROW_STEP_LAST = stepY(STEPS.length - 1);
const LANE_Y1 = ROW_STEP_LAST + STEP_H / 2 + FLOW.PAD;

const ROW_GATE_3 = LANE_Y1 + ROW_GAP + GATE_H / 2;
const ROW_PASS = ROW_GATE_3 + GATE_H / 2 + ROW_GAP + ENTRY_H / 2;

// The failed end sits beside the bus it collects, halfway down the chain, so
// that the run out of the bus is a short one and the last gate can reach it
// from below without crossing anything.
const ROW_FAIL = (ROW_STEP_1 + ROW_STEP_LAST) / 2;

const W = Math.ceil(COL_RIGHT + BOX_W / 2 + EDGE);
const H = Math.ceil(ROW_PASS + ENTRY_H / 2 + V_EDGE);

const entry = (x, y, label) => box({
  x, y, w: BOX_W, h: ENTRY_H, label, ...FLOW.step,
});
const step = (x, y, label) => box({
  x, y, w: BOX_W, h: STEP_H, label, ...FLOW.step,
});

export default {
  width: W,
  height: H,
  title: 'How Dapr verifies a workflow history signature chain when state is loaded',
  desc:
    'A flow running down the middle: Load workflow state from state store, '
    + 'then a gold gate asking whether signatures are present. With no '
    + 'signatures but a signer configured and history present it refuses the '
    + 'load; with no signer configured it continues without verification. '
    + 'With signatures present a second gate asks whether a signer is '
    + 'configured, and refuses the load if not. Otherwise a dashed lane, for '
    + 'each signature in the chain, holds seven checks in order: verify chain '
    + 'linkage, verify event range contiguity, recompute the events digest '
    + 'from raw bytes, verify the cryptographic signature, validate the '
    + 'certificate time window, verify certificate chain-of-trust to the CA, '
    + 'and verify the SPIFFE app identity. A red bus down the right-hand side '
    + 'collects a failure from every one of them - mismatch, gap, mismatch, '
    + 'failed, expired, untrusted, wrong app - and ends at Verification '
    + 'failed. Below the lane a last gate asks whether all events are '
    + 'covered: yes ends at Verification passed, no joins the failed end.',

  build() {
    const gate1 = decisionPoints({ x: COL_MAIN, y: ROW_GATE_1, w: GATE_W, h: GATE_H });
    const gate2 = decisionPoints({ x: COL_MAIN, y: ROW_GATE_2, w: GATE_W, h: GATE_H });
    const gate3 = decisionPoints({ x: COL_MAIN, y: ROW_GATE_3, w: GATE_W, h: GATE_H });
    const failLeft = COL_RIGHT - BOX_W / 2;

    return [
      // ---- down the spine, which is the path that verifies ------------------
      arrow({ from: [COL_MAIN, ROW_LOAD + ENTRY_H / 2], to: [COL_MAIN, gate1.top[1] - 2] }),
      ask(COL_MAIN, gate1.top[1] - ASK_DY, 'Signatures present?'),

      arrow({ from: gate1.bottom, to: [COL_MAIN, gate2.top[1] - 2] }),
      note({
        x: COL_MAIN + 10, y: gate1.bottom[1] + WORD_DROP, text: 'Yes', anchor: 'start',
      }),
      ask(COL_MAIN, gate2.top[1] - ASK_DY, 'Signer configured?'),

      arrow({ from: gate2.bottom, to: [COL_MAIN, ROW_STEP_1 - STEP_H / 2 - 2] }),
      note({
        x: COL_MAIN + 10, y: gate2.bottom[1] + WORD_DROP, text: 'Yes', anchor: 'start',
      }),

      // ---- the two ways the load is refused, and the one way it is skipped --
      arrow({ from: gate1.left, to: [COL_LEFT + BOX_W / 2 + 2, ROW_GATE_1] }),
      // THREE lines, not the two the width of the gap would suggest. This is
      // the longest branch word in the scene and it has 119 units to sit in -
      // between the refusal box's right edge and the gate's left point. On two
      // lines it measured 230 and fouled whichever end it was pushed towards:
      // centred it was drawn over the gate, ended against the gate it was
      // drawn over the box. Three lines is what fits the gap it actually has.
      note({
        x: (COL_LEFT + BOX_W / 2 + gate1.left[0]) / 2,
        y: ROW_GATE_1 - WORD_DY - FLOW.NOTE_SIZE * 1.2,
        text: 'No, but signer\nconfigured and\nhistory exists',
      }),
      arrow({ from: gate1.right, to: [COL_RIGHT - BOX_W / 2 - 2, ROW_GATE_1] }),
      note({
        x: (COL_RIGHT - BOX_W / 2 + gate1.right[0]) / 2,
        y: ROW_GATE_1 - WORD_DY - FLOW.NOTE_SIZE * 1.2,
        text: 'No, signer\nnot configured',
      }),
      arrow({ from: gate2.left, to: [COL_LEFT + BOX_W / 2 + 2, ROW_GATE_2] }),
      note({
        x: (COL_LEFT + BOX_W / 2 + gate2.left[0]) / 2,
        y: ROW_GATE_2 - WORD_DY,
        text: 'No',
      }),

      // ---- down the chain, one check to the next ----------------------------
      STEPS.slice(0, -1).map((_, i) => arrow({
        from: [COL_MAIN, stepY(i) + STEP_H / 2],
        to: [COL_MAIN, stepY(i + 1) - STEP_H / 2 - 2],
      })),

      // ---- and the bus every one of them can leave by -----------------------
      arrow({
        from: [BUS_X, ROW_STEP_1],
        to: [BUS_X, ROW_STEP_LAST],
        head: false,
        color: C.red,
      }),
      STEPS.map(([, word], i) => [
        arrow({
          from: [COL_MAIN + BOX_W / 2, stepY(i)],
          to: [BUS_X, stepY(i)],
          head: false,
          color: C.red,
        }),
        note({
          x: WORD_X,
          y: stepY(i) - WORD_DY + 2,
          text: word,
          anchor: 'start',
          halo: true,
        }),
      ]),
      arrow({ from: [BUS_X, ROW_FAIL], to: [failLeft - 2, ROW_FAIL], color: C.red }),

      // ---- the last gate, and the two ends ----------------------------------
      arrow({ from: [COL_MAIN, ROW_STEP_LAST + STEP_H / 2], to: [COL_MAIN, gate3.top[1] - 2] }),
      ask(COL_MAIN, gate3.top[1] - ASK_DY, 'All events covered?'),
      arrow({ from: gate3.bottom, to: [COL_MAIN, ROW_PASS - ENTRY_H / 2 - 2] }),
      note({
        x: COL_MAIN + 10, y: gate3.bottom[1] + WORD_DROP, text: 'Yes', anchor: 'start',
      }),
      elbowArrow({
        points: [
          gate3.right,
          [COL_RIGHT, ROW_GATE_3],
          [COL_RIGHT, ROW_FAIL + ENTRY_H / 2 + 2],
        ],
        color: C.red,
      }),
      note({
        x: (COL_RIGHT + gate3.right[0]) / 2,
        y: ROW_GATE_3 - WORD_DY,
        text: 'No',
      }),

      // ---- the lane the seven checks sit in ---------------------------------
      flowLane({
        x: LANE_X0,
        y: LANE_Y0,
        w: LANE_X1 - LANE_X0,
        h: LANE_Y1 - LANE_Y0,
        caption: CAPTION,
        captionW: CAPTION_W,
        captionX: LANE_X0 + CAPTION_INSET + CAPTION_W / 2,
      }),

      // ---- the shapes, over the lines that reach them -----------------------
      entry(COL_MAIN, ROW_LOAD, 'Load workflow state\nfrom state store'),
      decision({ x: COL_MAIN, y: ROW_GATE_1, w: GATE_W, h: GATE_H, ...FLOW.wait }),
      decision({ x: COL_MAIN, y: ROW_GATE_2, w: GATE_W, h: GATE_H, ...FLOW.wait }),
      decision({ x: COL_MAIN, y: ROW_GATE_3, w: GATE_W, h: GATE_H, ...FLOW.wait }),
      entry(COL_LEFT, ROW_GATE_1, 'FAIL: unsigned history cannot\nbe loaded with signing enabled'),
      entry(COL_LEFT, ROW_GATE_2, 'FAIL: signed history cannot\nbe loaded without a signer'),
      entry(COL_RIGHT, ROW_GATE_1, 'Continue without verification'),
      STEPS.map(([name], i) => step(COL_MAIN, stepY(i), name)),
      box({
        x: COL_RIGHT,
        y: ROW_FAIL,
        w: BOX_W,
        h: ENTRY_H,
        label: 'Verification failed',
        stroke: C.red,
        fill: C.bg,
        size: FLOW.SIZE,
      }),
      entry(COL_MAIN, ROW_PASS, 'Verification passed'),
    ];
  },
};
