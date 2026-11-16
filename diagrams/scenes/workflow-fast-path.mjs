// HOW AN EVENT GETS A TURN RUN FOR IT ON THE FAST PATH, and what the janitor
// does on each of its fires.
//
// Replaces the `flowchart TD` on
// developing-applications/building-blocks/workflow/workflow-fast-path.md,
// under "The janitor backstop". The five `sequenceDiagram` blocks on the page
// stay Mermaid: lifelines and activations are a notation this set does not
// have and should not grow one for. Maintainer's ruling of 2026-11-01.
//
// It is the largest graph in the set - 23 nodes, 9 gates, two back edges into
// one node and a subgraph - and the maintainer's call of 2026-11-04 was to
// draw it WHOLE rather than split it into a drive-loop scene and a janitor
// scene. One picture, because the dashed hand-off from "the janitor owns
// recovery" to the janitor's first step is the point of the drawing: the two
// halves only mean something next to each other.
//
// Fact-check, against the prose the block sits under:
//   - "The actor first makes sure its janitor backstop reminder exists. If the
//     janitor cannot be created, the actor falls back to the durable
//     per-event reminder for this event" - which is why the Create failed leg
//     and the fast-path-off leg reach the SAME box.
//   - "posts a notification to a per-instance channel with a capacity of one.
//     Pending notifications coalesce" - the box says exactly that.
//   - "A reclaim handshake between the loop and the poster guarantees that a
//     notification posted while the loop is exiting is never lost: either the
//     exiting loop picks it up, or the poster starts a fresh loop" - the leaf
//     off "Drive loop running?".
//   - "retries it in place with a decorrelated jittered backoff between 50 ms
//     and 2 s, for a total retry budget of about six seconds. If the turn
//     still fails, the loop exits and the janitor takes over recovery at its
//     next fire" - the retry gate and the dashed hand-off.
//   - "A running workflow that acks an empty-inbox reminder stays resident in
//     memory" - both "stays resident" boxes.
//   - "Only due-now work is driven locally" - the first gate asks it.
//   - the janitor table above the block lists six states; the source's own
//     flowchart folds Purged and terminal into one gate, and so does this.
// Every node and every edge of the Mermaid agrees with the prose, and so does
// this. Nothing was added and nothing was dropped.
//
// THERE IS NO ARRANGEMENT TO MATCH, which is the difference between a Mermaid
// source and an image one: the positions in a rendered Mermaid block are its
// layout engine's output, not a decision. What the source gives is the graph.
// Drawn as Mermaid lays a `flowchart TD` out - one spine, nine rows of gates,
// each with its question - this is about 1300 units tall for 900 of width,
// and the retry loop and the janitor cascade both fight the spine for room.
// So the graph is laid out in three BANDS, each read left to right like a
// line of text, each wrapping back to the left margin for the next:
//
//   1. the local wake, from the event to "is a loop already running?"
//   2. the drive loop, and what happens when a turn fails
//   3. the janitor, which is the source's own subgraph and so is the one
//      thing here drawn in a lane
//
// Within a band the house rule holds: the path the picture follows runs ALONG
// the band and every leaf drops DOWN out of its gate. A question rides ABOVE
// its diamond rather than inside it, as `workflow-stateful-client` sets out -
// a diamond is widest only on its centre line, so a second line of label
// overflows a shape that still passes every geometric check.
//
// The two back edges into "Run one turn" both come back up into its lower
// edge, one from each side of the leg that leaves it. Mirrored, because
// they mean the same thing - go round and run the turn again - and because
// the only channel to the LEFT of that box is the one the arrow from
// "Start drive loop" already crosses.

import { FLOW, flowLane, note } from '../flow.mjs';
import {
  arrow, box, decision, decisionPoints, elbowArrow,
} from '../shapes.mjs';

const EDGE = 29;
const V_EDGE = 14;

// One height for every box, including the ones whose name is a single line. A
// step that is shorter than the step beside it reads as a different kind of
// thing.
const BOX_H = 60;
const GATE_W = 96;
const GATE_H = 62;

// Three widths, one per band, and the reason is the LEAF row rather than the
// row above it. Band three hangs four boxes under four consecutive gates, so
// its gate pitch is set by how wide those boxes are, and its names are the
// shortest on the drawing - 176 holds "janitor_fold_recovered" with room.
// Band one's leaf row holds two boxes a third of the canvas apart, so the one
// box carrying the source's longest name can simply be wider.
const W_BOX = 206;
const W_WIDE = 244;
const W_SMALL = 176;

// How far a question stands off the top of its diamond, measured to the
// BOTTOM of the text block rather than to its centre, so a two-line question
// and a one-line one clear the shape by the same amount. Every question here
// is set on two lines: on one line the longest of them is wider than the gap
// between two gates and they ran into each other.
const ASK_DY = 20;
const ASK_LINES = 2;
const ASK_LEAD = FLOW.NOTE_SIZE * 1.2;
// What a question needs above the diamond's top edge, and where its block is
// centred to get it. label() centres a multi-line block on the y it is given.
const ASK_ROOM = ASK_DY + ASK_LEAD * (ASK_LINES - 1) + FLOW.NOTE_SIZE * 0.6;
const askY = (gateY) => gateY - GATE_H / 2 - ASK_DY - (ASK_LEAD * (ASK_LINES - 1)) / 2;

// A question sits centred over its diamond, which is directly under the run
// that arrives there - so the run crosses it, and it needs ground behind it.
// The rendered rule `paints ground behind any label a line crosses` is the
// check, and `workflow-stateful-client` haloes its own for the same reason.
const ask = (x, y, text) => note({ x, y, text, halo: true });

// Between a band's main row and its leaf row, and between one band's lowest
// ink and the next band's highest.
const ROW_GAP = 38;
const BAND_GAP = 52;

// Along a band, between one shape's edge and the next. Every leg here carries
// a word, so this is the room that word needs rather than a line length.
const GAP = 86;

// ---- band one: the local wake ------------------------------------------------
const E_X = EDGE + W_BOX / 2;
const G_X = E_X + W_BOX / 2 + GAP + GATE_W / 2;
const EJ_X = G_X + GATE_W + GAP;
const N_X = EJ_X + GATE_W / 2 + GAP + W_BOX / 2;
const L_X = N_X + W_BOX / 2 + GAP + GATE_W / 2;
const X_X = L_X + GATE_W / 2 + GAP + W_WIDE / 2;
// The durable reminder is what BOTH exceptions in this band reach, so it sits
// under the second of the two gates: one leg drops straight into it and the
// other turns once.
const R_X = EJ_X;

const W = Math.ceil(X_X + W_WIDE / 2 + EDGE);

const MAIN1_Y = V_EDGE + ASK_ROOM + GATE_H / 2;
const LEAF1_Y = MAIN1_Y + GATE_H / 2 + ROW_GAP + BOX_H / 2;
// Where the band wraps: below everything band one holds, above everything
// band two holds.
const WRAP_Y = LEAF1_Y + BOX_H / 2 + 28;

// ---- band two: the drive loop ------------------------------------------------
const BAND2_TOP = LEAF1_Y + BOX_H / 2 + BAND_GAP;
const ROWA = BAND2_TOP + ASK_ROOM + GATE_H / 2;
const ROWB = ROWA + GATE_H / 2 + ROW_GAP + ASK_ROOM + GATE_H / 2;

const SP_X = EDGE + W_BOX / 2;
const T_X = SP_X + W_BOX / 2 + GAP + W_BOX / 2;
const M_X = T_X + W_BOX / 2 + GAP + GATE_W / 2;
const I_X = M_X + GATE_W / 2 + GAP + W_BOX / 2;
// The retry gate sits directly under the turn it retries, so "Failed" is a
// straight drop and the question it carries is the only thing that run
// crosses - which is what the halo is for.
const RT_X = T_X;
const JW_X = M_X;

// Where the two back edges run. BOTH come back up into the turn's lower
// edge, one from each side of the leg that leaves it - the retry from the
// left, "more notifications" from the right - so the three runs that meet
// that edge are evenly spaced and none of them crosses another.
//
// The first draft took the retry round the LEFT of the turn and in at the
// top, on the grounds that a retry that wraps round the box looks like a
// retry. Rendered, its upward leg ran straight through the arrow from "Start
// drive loop", because the only channel to the left of the turn is the gap
// that arrow crosses. Mirroring the two loops costs nothing and crosses
// nothing.
const RT_RETURN_X = T_X - 78;
const M_RETURN_X = T_X + 78;
const M_LOOP_Y = ROWA + GATE_H / 2 + 28;
const RT_LOOP_Y = ROWB + GATE_H / 2 + 24;

// ---- band three: the janitor, in the source's own subgraph -------------------
const JW_LEAD_Y = ROWB + GATE_H / 2 + 48;
const BAND3_TOP = ROWB + GATE_H / 2 + 76;

const LANE_X = EDGE;
const LANE_W = W - EDGE * 2;
const JF_X = LANE_X + FLOW.PAD + W_SMALL / 2;
// Far enough that the leaf hanging under the first gate clears "Load state".
const C1_X = JF_X + W_SMALL + 33;
const C_PITCH = 244;
const cX = (i) => C1_X + i * C_PITCH;
const NOP_X = cX(3) + GATE_W / 2 + 60 + W_SMALL / 2;

const MAIN3_Y = BAND3_TOP + FLOW.PAD + ASK_ROOM + GATE_H / 2;
const LEAF3_Y = MAIN3_Y + GATE_H / 2 + ROW_GAP + BOX_H / 2;
const LANE_H = LEAF3_Y + BOX_H / 2 + FLOW.PAD - BAND3_TOP;

const H = Math.ceil(BAND3_TOP + LANE_H + V_EDGE);

// Measured on the rendered page, like every pill in the set: the exporter has
// no font metrics.
const LANE_CAPTION_W = 164;

const step = (x, y, label, w = W_BOX) => box({
  x, y, w, h: BOX_H, label, ...FLOW.step,
});
const gate = (x, y) => decision({ x, y, w: GATE_W, h: GATE_H, ...FLOW.wait });
const gateAt = (x, y) => decisionPoints({ x, y, w: GATE_W, h: GATE_H });

// A word ON a leg of the flow: above a run that goes along a band, and just
// off a run that goes down or back.
const along = (x, y, text) => note({ x, y, text });
const beside = (x, y, text) => note({ x, y, text, anchor: 'start' });

export default {
  width: W,
  height: H,
  title:
    'How an event gets a workflow turn run for it on the fast path, and what '
    + 'the janitor does on each of its fires',
  desc:
    'Three bands, each read left to right. The first: an event committed to '
    + 'the inbox or held for folding reaches a gold gate asking whether the '
    + 'fast path is on and the work is due now; No drops to Durable '
    + 'per-event reminder, unchanged. Yes goes on to a gate asking whether '
    + 'the janitor reminder is asserted; Create failed drops to that same '
    + 'reminder box. Yes goes on to Post notification, capacity 1, coalesces, '
    + 'then to a gate asking whether a drive loop is running; Yes goes on to '
    + 'Running loop consumes it, or the reclaim handshake re-posts it. No '
    + 'wraps back to the left margin and into the second band. The second '
    + 'band: Start drive loop, then Run one turn through the reminder path. '
    + 'Committed goes on to a gate asking whether there are more '
    + 'notifications; Yes loops back underneath into the turn, No goes on to '
    + 'Loop exits, actor stays resident. Failed drops from the turn to a gate '
    + 'asking whether retry budget is left, about six seconds and jittered; '
    + 'Yes loops back underneath into the turn as well, No goes to Loop '
    + 'exits, the janitor owns recovery. A dashed line runs from '
    + 'there down into the third band, a dashed lane captioned Janitor fire '
    + 'every 20s. Inside it: Load state, then four gates in a row, each '
    + 'dropping a box when the answer is Yes and passing the question on when '
    + 'it is No. Purged or terminal drops Settle and delete the janitor; '
    + 'Inbox rows pending drops Drive a turn, janitor_recovered; Held '
    + 'completions with no driver drops Drive a turn, '
    + 'janitor_fold_recovered; Unresolved TaskScheduled events drops '
    + 'Re-dispatch activities. The last No ends at No-op, actor stays '
    + 'resident.',

  build() {
    const g = gateAt(G_X, MAIN1_Y);
    const ej = gateAt(EJ_X, MAIN1_Y);
    const l = gateAt(L_X, MAIN1_Y);
    const m = gateAt(M_X, ROWA);
    const rt = gateAt(RT_X, ROWB);
    const c = [0, 1, 2, 3].map((i) => gateAt(cX(i), MAIN3_Y));

    const R_TOP = LEAF1_Y - BOX_H / 2;
    const T_BOT = ROWA + BOX_H / 2;
    const LEAF3_TOP = LEAF3_Y - BOX_H / 2;

    return [
      // ---- band one: along the band ---------------------------------------
      arrow({ from: [E_X + W_BOX / 2, MAIN1_Y], to: [g.left[0] - 2, MAIN1_Y] }),
      arrow({ from: g.right, to: [ej.left[0] - 2, MAIN1_Y] }),
      along((g.right[0] + ej.left[0]) / 2, MAIN1_Y - 16, 'Yes'),
      arrow({ from: ej.right, to: [N_X - W_BOX / 2 - 2, MAIN1_Y] }),
      along((ej.right[0] + N_X - W_BOX / 2) / 2, MAIN1_Y - 16, 'Yes'),
      arrow({ from: [N_X + W_BOX / 2, MAIN1_Y], to: [l.left[0] - 2, MAIN1_Y] }),
      arrow({ from: l.right, to: [X_X - W_WIDE / 2 - 2, MAIN1_Y] }),
      along((l.right[0] + X_X - W_WIDE / 2) / 2, MAIN1_Y - 16, 'Yes'),

      // ---- band one: the two legs that fall out of it ---------------------
      // Both reach the same box, so one turns into its left face and the
      // other drops straight onto its top.
      elbowArrow({
        points: [g.bottom, [G_X, LEAF1_Y], [R_X - W_BOX / 2 - 2, LEAF1_Y]],
      }),
      beside(G_X + 10, (MAIN1_Y + GATE_H / 2 + R_TOP) / 2, 'No'),
      arrow({ from: ej.bottom, to: [EJ_X, R_TOP - 2] }),
      beside(EJ_X + 10, (MAIN1_Y + GATE_H / 2 + R_TOP) / 2, 'Create failed'),

      // ---- band one wraps into band two -----------------------------------
      elbowArrow({
        points: [
          l.bottom,
          [L_X, WRAP_Y],
          [SP_X, WRAP_Y],
          [SP_X, ROWA - BOX_H / 2 - 2],
        ],
      }),
      beside(L_X + 10, LEAF1_Y - 28, 'No'),

      // ---- band two: along the band ---------------------------------------
      arrow({ from: [SP_X + W_BOX / 2, ROWA], to: [T_X - W_BOX / 2 - 2, ROWA] }),
      arrow({ from: [T_X + W_BOX / 2, ROWA], to: [m.left[0] - 2, ROWA] }),
      along((T_X + W_BOX / 2 + m.left[0]) / 2, ROWA - 16, 'Committed'),
      arrow({ from: m.right, to: [I_X - W_BOX / 2 - 2, ROWA] }),
      along((m.right[0] + I_X - W_BOX / 2) / 2, ROWA - 16, 'No'),

      // ---- band two: the turn fails ---------------------------------------
      arrow({ from: [T_X, T_BOT], to: [RT_X, rt.top[1] - 2] }),
      beside(T_X + 10, T_BOT + 18, 'Failed'),
      arrow({ from: rt.right, to: [JW_X - W_BOX / 2 - 2, ROWB] }),
      along((rt.right[0] + JW_X - W_BOX / 2) / 2, ROWB - 16, 'No'),

      // ---- band two: the two ways back into the turn ----------------------
      // More notifications: underneath, from the right.
      elbowArrow({
        points: [
          m.bottom,
          [M_X, M_LOOP_Y],
          [M_RETURN_X, M_LOOP_Y],
          [M_RETURN_X, T_BOT + 2],
        ],
      }),
      beside(M_X + 10, M_LOOP_Y - 14, 'Yes'),
      // The retry: underneath, from the left.
      elbowArrow({
        points: [
          rt.bottom,
          [RT_X, RT_LOOP_Y],
          [RT_RETURN_X, RT_LOOP_Y],
          [RT_RETURN_X, T_BOT + 2],
        ],
      }),
      along((RT_RETURN_X + RT_X) / 2, RT_LOOP_Y - 14, 'Yes'),

      // ---- band two hands over to band three ------------------------------
      // Dashed, because the janitor does not run when this says so - it runs
      // on its own twenty-second clock, and this is the turn it will find
      // waiting for it. The source draws the same edge dotted.
      elbowArrow({
        points: [
          [JW_X, ROWB + BOX_H / 2],
          [JW_X, JW_LEAD_Y],
          [JF_X, JW_LEAD_Y],
          [JF_X, MAIN3_Y - BOX_H / 2 - 2],
        ],
        dash: true,
      }),

      // ---- band three: the janitor ----------------------------------------
      // flowLane(), not region(): this band IS the source's subgraph, and a
      // flow scene that calls region() itself is how two lanes on two pages
      // end up different. The caption sits at the RIGHT end of the border,
      // clear of the dashed leg that drops through the left end of it.
      flowLane({
        x: LANE_X,
        y: BAND3_TOP,
        w: LANE_W,
        h: LANE_H,
        caption: 'Janitor fire every 20s',
        captionW: LANE_CAPTION_W,
        captionX: LANE_X + LANE_W - 20 - LANE_CAPTION_W / 2,
      }),

      arrow({ from: [JF_X + W_SMALL / 2, MAIN3_Y], to: [c[0].left[0] - 2, MAIN3_Y] }),
      [0, 1, 2].map((i) => [
        arrow({ from: c[i].right, to: [c[i + 1].left[0] - 2, MAIN3_Y] }),
        along((c[i].right[0] + c[i + 1].left[0]) / 2, MAIN3_Y - 16, 'No'),
      ]),
      arrow({ from: c[3].right, to: [NOP_X - W_SMALL / 2 - 2, MAIN3_Y] }),
      along((c[3].right[0] + NOP_X - W_SMALL / 2) / 2, MAIN3_Y - 16, 'No'),

      [0, 1, 2, 3].map((i) => [
        arrow({ from: c[i].bottom, to: [cX(i), LEAF3_TOP - 2] }),
        beside(cX(i) + 10, (MAIN3_Y + GATE_H / 2 + LEAF3_TOP) / 2, 'Yes'),
      ]),

      // ---- the shapes, over the lines that reach them ---------------------
      step(E_X, MAIN1_Y, 'Event committed to the\ninbox or held for folding'),
      gate(G_X, MAIN1_Y),
      ask(G_X, askY(MAIN1_Y), 'Fast path on\nand due now?'),
      gate(EJ_X, MAIN1_Y),
      ask(EJ_X, askY(MAIN1_Y), 'Janitor reminder\nasserted?'),
      step(N_X, MAIN1_Y, 'Post notification,\ncapacity 1, coalesces'),
      gate(L_X, MAIN1_Y),
      ask(L_X, askY(MAIN1_Y), 'Drive loop\nrunning?'),
      step(X_X, MAIN1_Y, 'Running loop consumes it, or the\nreclaim handshake re-posts it', W_WIDE),
      step(R_X, LEAF1_Y, 'Durable per-event\nreminder, unchanged'),

      step(SP_X, ROWA, 'Start drive loop'),
      step(T_X, ROWA, 'Run one turn through\nthe reminder path'),
      gate(M_X, ROWA),
      ask(M_X, askY(ROWA), 'More\nnotifications?'),
      step(I_X, ROWA, 'Loop exits,\nactor stays resident'),
      gate(RT_X, ROWB),
      ask(RT_X, askY(ROWB), 'Retry budget left?\nabout 6s, jittered'),
      step(JW_X, ROWB, 'Loop exits, the janitor\nowns recovery'),

      step(JF_X, MAIN3_Y, 'Load state', W_SMALL),
      gate(cX(0), MAIN3_Y),
      ask(cX(0), askY(MAIN3_Y), 'Purged or\nterminal?'),
      gate(cX(1), MAIN3_Y),
      ask(cX(1), askY(MAIN3_Y), 'Inbox rows\npending?'),
      gate(cX(2), MAIN3_Y),
      ask(cX(2), askY(MAIN3_Y), 'Held completions\nwith no driver?'),
      gate(cX(3), MAIN3_Y),
      ask(cX(3), askY(MAIN3_Y), 'Unresolved TaskScheduled\nevents?'),
      step(NOP_X, MAIN3_Y, 'No-op, actor\nstays resident', W_SMALL),
      step(cX(0), LEAF3_Y, 'Settle and delete\nthe janitor', W_SMALL),
      step(cX(1), LEAF3_Y, 'Drive a turn:\njanitor_recovered', W_SMALL),
      step(cX(2), LEAF3_Y, 'Drive a turn:\njanitor_fold_recovered', W_SMALL),
      step(cX(3), LEAF3_Y, 'Re-dispatch\nactivities', W_SMALL),
    ];
  },
};
