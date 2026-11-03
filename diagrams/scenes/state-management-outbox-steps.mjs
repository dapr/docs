// THE OUTBOX OPENED UP: the nine steps, in the two flows the page names.
//
// Replaces /images/state-management-outbox-steps.png on
// developing-applications/building-blocks/state-management/howto-outbox.md,
// under "Dapr outbox processes requests in two flows: the user request flow
// and the background message flow".
//
// Fact-check, against the nine numbered paragraphs directly below the image.
// Every one of them matches the picture, and the numbers are the page's:
//   1 the app calls the State Management API transactionally
//   2 Dapr publishes an intent message to an INTERNAL outbox topic
//   3 the state and a transaction marker are written atomically
//   4 the app gets its success response
//   5 a background subscriber reads the intent message
//   6 it verifies the transaction marker in the state store
//   7 the verified business event goes to the EXTERNAL topic
//   8 the marker is deleted
//   9 the message is acknowledged and removed from the internal topic
//
// Where this departs from the source image, and why:
//
//   - THE WORD "Transaction" ACROSS THE TOP IS DROPPED. In the source it
//     floats above the gap between the two dashed boxes, naming neither, and
//     a reader cannot tell what it encloses. The page says what the atomic
//     transaction is - step three, "the state and a transaction marker are
//     written atomically in the same state store" - and that is one step, not
//     a band over the whole picture. The other outbox diagram on this page
//     does draw a Transaction boundary, around what its own prose puts inside
//     one.
//
//   - THE TWO SIDECARS ARE ONE SIDECAR. Both flows run in the app's own Dapr
//     sidecar: "when outbox is enabled, Dapr starts consumers that process the
//     internal outbox topic". Drawing it once would put nine runs on one
//     hexagon and tell a reader nothing about which flow each belongs to, so
//     it is drawn in each flow, exactly as the source does.
//
//   - THE SIDECARS ARE NOT NAMED, for two reasons. The Dapr hexagon is this
//     set's mark for a sidecar and says so on its own; and the runs to the
//     state store leave each sidecar's BOTTOM POINT, straight through where a
//     name under it would sit. The other picture on this page leaves its
//     sidecars unnamed too, so the two agree.
//
//   - the internal topic and the state store sit BETWEEN the two dashed
//     boxes rather than straddling their borders. They belong to both flows,
//     which is what the source's overlap is trying to say; a shape drawn
//     half inside a dashed border reads as a mistake before it reads as
//     shared.
//
//   - the topics are PIPES and the store a CYLINDER, the house shapes, and
//     the apps take APP entries rather than the source's flat green.

import { APP, C } from '../engine.mjs';
import {
  arrow, cylinder, elbowArrow, group, hex, hexHalfWidth, hexHalfWidthAt, pipe,
  region, captionReach, STEP_R, STORE_RATIO,
} from '../shapes.mjs';
import { markHex } from '../icons.mjs';
import {
  APP_R, BLOCK_GAP, EDGE, NAME, PAD, PIPE_LEN, PIPE_RX, PIPE_RY, SIDE_R,
  STORE_NAME, STORE_W, TEXT, V_EDGE, stepBlock, stepWidth,
} from '../state-outbox.mjs';

// Measured on the rendered page, because the exporter has no font metrics.
const SAVE_W = 70;        // "Save state"
const RESPONSE_W = 66;    // "Response"
const PUBLISH_W = 50;     // "Publish"
// "Save state" - step three's words break over two lines, as the source
// breaks them, because on one line the block was wider than the leg it rides
// on and its disc closed to ten units of the riser beside it.
const MARKER_W = 70;
const CONSUME_W = 64;     // "Consume"
const ACK_W = 78;         // "ACK/NACK"
const READ_W = 84;        // "Read marker"
const DELETE_W = 92;      // "Delete marker"
// A caption pill has to leave half an em clear of its text at each end, which
// is what `keeps every caption pill's text clear of its own ends` checks; both
// of these are the measured text plus thirteen.
const SYNC_W = 212;       // "User request processing (sync)"
const ASYNC_W = 262;      // "Background outbox processing (async)"

// How much air a step block keeps from whatever stands beside it.
const CLEAR = 22;

// THE REQUEST AND THE RESPONSE RUN AT TWO HEIGHTS, not as one line with a
// head at each end. Everywhere else in this set a pair of shapes that answer
// each other share one line, because the point there is that they talk; here
// the point is the ORDER, and nine numbered steps cannot be told apart on
// four lines. invocation-row.mjs carries the same note for the same reason.
const LEG_DY = 15;
// A step block clears its own leg, outside the pair: the upper step's above
// the upper leg, the lower step's below the lower one. Between them they
// would each belong to either.
const LEG_BLOCK_DY = LEG_DY + BLOCK_GAP + STEP_R;

// ---- the verticals ----------------------------------------------------------
const REGION_Y = Math.round(V_EDGE + captionReach());
const PAD_TOP = captionReach() + PAD;
const ROW_Y = Math.round(REGION_Y + PAD_TOP + Math.max(APP_R, LEG_BLOCK_DY + STEP_R));

// The store hangs under the middle, deep enough for the pipe above it to
// clear and for the two blocks that ride on its runs - one above the run and,
// on the right, one below it as well.
const STORE_H = STORE_W / STORE_RATIO;
const STORE_Y = Math.round(
  ROW_Y + PIPE_RY + BLOCK_GAP + STEP_R * 2 + BLOCK_GAP + STORE_H / 2,
);
const REGION_BOTTOM = Math.round(
  Math.max(STORE_Y + STORE_H / 2, STORE_Y + BLOCK_GAP + STEP_R * 2) + PAD,
);
const REGION_H = REGION_BOTTOM - REGION_Y;

// ---- then the horizontals ---------------------------------------------------
const SIDE_HALF = hexHalfWidth(SIDE_R);
const APP_HALF = hexHalfWidth(APP_R);

// Each gap carries the block that explains the run across it, with air at both
// ends: derived from the words rather than chosen, so a longer label cannot
// quietly close on the shapes it sits between.
const gapFor = (textW, extra = 0) => Math.round(stepWidth(textW) + CLEAR * 2 + extra);

// What the middle column keeps clear of the two dashed borders beside it.
const COL_CLEAR = 24;

const APP_X = Math.round(EDGE + PAD + APP_HALF);
const SIDE_A_X = Math.round(
  APP_X + APP_HALF + gapFor(Math.max(SAVE_W, RESPONSE_W)) + SIDE_HALF,
);
const PIPE_X1 = Math.round(SIDE_A_X + SIDE_HALF + gapFor(PUBLISH_W, COL_CLEAR) + PIPE_RX);
const PIPE_X2 = PIPE_X1 + PIPE_LEN;
const SIDE_B_X = Math.round(
  PIPE_X2 + PIPE_RX + gapFor(Math.max(CONSUME_W, ACK_W), COL_CLEAR) + SIDE_HALF,
);
const EXT_X1 = Math.round(SIDE_B_X + SIDE_HALF + gapFor(PUBLISH_W) + PIPE_RX);
const EXT_X2 = EXT_X1 + PIPE_LEN;

const W = Math.ceil(EXT_X2 + PIPE_RX + PAD + EDGE);
const H = Math.ceil(REGION_BOTTOM + V_EDGE);

// The middle column: the internal topic, and the store under it. Its width is
// whichever of the two reaches further, so neither can come closer to a border
// than the other.
const MID_X = Math.round((PIPE_X1 + PIPE_X2) / 2);
const COL_HALF = Math.max(PIPE_LEN / 2 + PIPE_RX, STORE_W / 2);
const MID_LEFT = Math.round(MID_X - COL_HALF - COL_CLEAR);
const MID_RIGHT = Math.round(MID_X + COL_HALF + COL_CLEAR);

const STORE_LEFT = MID_X - STORE_W / 2;
const STORE_RIGHT = MID_X + STORE_W / 2;

// ---- where the blocks sit ---------------------------------------------------
const PAIR_X = Math.round((APP_X + APP_HALF + SIDE_A_X - SIDE_HALF) / 2);
const PUB_X = Math.round((SIDE_A_X + SIDE_HALF + MID_LEFT) / 2);
const BACK_X = Math.round((MID_RIGHT + SIDE_B_X - SIDE_HALF) / 2);
const EXT_BLOCK_X = Math.round((SIDE_B_X + SIDE_HALF + EXT_X1 - PIPE_RX) / 2);

const UP_Y = ROW_Y - LEG_BLOCK_DY;
const DOWN_Y = ROW_Y + LEG_BLOCK_DY;
const RUN_BLOCK_Y = Math.round(ROW_Y - PIPE_RY - BLOCK_GAP);

const MARKER_X = Math.round((SIDE_A_X + STORE_LEFT) / 2);
const STORE_BLOCK_X = Math.round((STORE_RIGHT + SIDE_B_X) / 2);
const ABOVE_STORE_Y = Math.round(STORE_Y - BLOCK_GAP - STEP_R);
const BELOW_STORE_Y = Math.round(STORE_Y + BLOCK_GAP + STEP_R);

const sideAt = (x) => ({ x, y: ROW_Y, r: SIDE_R, hex: true });

// WHERE A LEG MEETS A HEXAGON. A hexagon is only its full width across the
// middle, and these legs run LEG_DY off centre where the sloping edge has
// already come in; measured against the widest the shape ever gets, a leg
// stops short with a gap under it. The pair of points also has to be written
// out, rather than handed to arrow() as two shapes: given a descriptor whose
// y is the LEG's, arrow() measures the edge of a hexagon centred there and
// draws a line that slopes across the row. invocation-row.mjs carries the
// same two notes.
const legL = (x, r, dy) => [x - hexHalfWidthAt(r, dy) - 2, ROW_Y + dy];
const legR = (x, r, dy) => [x + hexHalfWidthAt(r, dy) + 2, ROW_Y + dy];

// The broker's rim has come in at the legs' height too: it is an ellipse
// PIPE_RX deep, so at LEG_DY of its PIPE_RY it stands this far past the body.
const rimDx = (dy) => +(PIPE_RX * Math.sqrt(1 - (dy / PIPE_RY) ** 2)).toFixed(2);

export default {
  width: W,
  height: H,
  title: 'The nine steps of the Dapr outbox, in the user request flow and the background outbox flow',
  desc:
    'Two dashed regions side by side, captioned User request processing '
    + '(sync) and Background outbox processing (async), with a message broker '
    + 'named Internal topic between them and a gold data-store cylinder named '
    + 'State store below it. In the left region, a green hexagon named My app '
    + 'and a hexagon carrying the Dapr logo exchange step one, Save state, and '
    + 'step four, Response. From that sidecar step two, Publish, runs right to '
    + 'the internal topic, and step three, Save state and marker, runs down and '
    + 'across to the state store. In the right region, a second Dapr hexagon '
    + 'takes step five, Consume, from the internal topic and answers with step '
    + 'nine, ACK/NACK; step six, Read marker, and step eight, Delete marker, '
    + 'run down and across to the state store, and step seven, Publish, runs '
    + 'right to a second broker named External topic.',

  build() {
    return [
      // ---- the two flows, drawn first so everything sits on them ----------
      region({
        x: EDGE, y: REGION_Y, w: MID_LEFT - EDGE, h: REGION_H,
        caption: 'User request processing (sync)', captionW: SYNC_W, captionSize: TEXT,
      }),
      region({
        x: MID_RIGHT, y: REGION_Y, w: W - EDGE - MID_RIGHT, h: REGION_H,
        caption: 'Background outbox processing (async)', captionW: ASYNC_W, captionSize: TEXT,
      }),

      // ---- one and four: the app's own call, and its answer ---------------
      arrow({
        from: legR(APP_X, APP_R, -LEG_DY),
        to: legL(SIDE_A_X, SIDE_R, -LEG_DY),
      }),
      stepBlock({ x: PAIR_X, y: UP_Y, step: 1, text: 'Save state', textW: SAVE_W }),
      arrow({
        from: legL(SIDE_A_X, SIDE_R, LEG_DY),
        to: legR(APP_X, APP_R, LEG_DY),
      }),
      stepBlock({ x: PAIR_X, y: DOWN_Y, step: 4, text: 'Response', textW: RESPONSE_W }),

      // ---- two: the intent message goes to the internal topic -------------
      arrow({ from: sideAt(SIDE_A_X), to: [PIPE_X1 - PIPE_RX - 2, ROW_Y] }),
      stepBlock({ x: PUB_X, y: RUN_BLOCK_Y, step: 2, text: 'Publish', textW: PUBLISH_W }),

      // ---- three: state and marker, written together ----------------------
      elbowArrow({
        points: [
          [SIDE_A_X, ROW_Y + SIDE_R + 2],
          [SIDE_A_X, STORE_Y],
          [STORE_LEFT - 2, STORE_Y],
        ],
      }),
      stepBlock({
        x: MARKER_X, y: ABOVE_STORE_Y, step: 3, text: 'Save state\n& marker', textW: MARKER_W,
      }),

      // ---- five and nine: the background subscriber takes it and answers ---
      arrow({
        from: [PIPE_X2 + rimDx(LEG_DY), ROW_Y - LEG_DY],
        to: legL(SIDE_B_X, SIDE_R, -LEG_DY),
      }),
      stepBlock({ x: BACK_X, y: UP_Y, step: 5, text: 'Consume', textW: CONSUME_W }),
      arrow({
        from: legL(SIDE_B_X, SIDE_R, LEG_DY),
        to: [PIPE_X2 + rimDx(LEG_DY), ROW_Y + LEG_DY],
      }),
      stepBlock({ x: BACK_X, y: DOWN_Y, step: 9, text: 'ACK/NACK', textW: ACK_W }),

      // ---- six and eight: it checks the marker, then clears it ------------
      // ONE run carries both, as the source draws it: the subscriber reads the
      // marker before publishing and deletes it after, and the two are the
      // same reach into the same store.
      elbowArrow({
        points: [
          [SIDE_B_X, ROW_Y + SIDE_R + 2],
          [SIDE_B_X, STORE_Y],
          [STORE_RIGHT + 2, STORE_Y],
        ],
      }),
      stepBlock({
        x: STORE_BLOCK_X, y: ABOVE_STORE_Y, step: 6, text: 'Read marker', textW: READ_W,
      }),
      stepBlock({
        x: STORE_BLOCK_X, y: BELOW_STORE_Y, step: 8, text: 'Delete marker', textW: DELETE_W,
      }),

      // ---- seven: the business event leaves for the external topic --------
      arrow({ from: sideAt(SIDE_B_X), to: [EXT_X1 - PIPE_RX - 2, ROW_Y] }),
      stepBlock({
        x: EXT_BLOCK_X, y: RUN_BLOCK_Y, step: 7, text: 'Publish', textW: PUBLISH_W,
      }),

      // ---- the shapes, over the lines that reach them ---------------------
      hex({ x: APP_X, y: ROW_Y, r: APP_R, label: 'My app', size: NAME, ...APP[0] }),
      markHex({ x: SIDE_A_X, y: ROW_Y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
      group({
        class: 'd-named-mark',
        children: [
          pipe({
            x1: PIPE_X1, x2: PIPE_X2, y: ROW_Y,
            ry: PIPE_RY, rx: PIPE_RX, fill: C.green, label: 'Internal topic', size: TEXT,
          }),
        ],
      }),
      markHex({ x: SIDE_B_X, y: ROW_Y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
      group({
        class: 'd-named-mark',
        children: [
          pipe({
            x1: EXT_X1, x2: EXT_X2, y: ROW_Y,
            ry: PIPE_RY, rx: PIPE_RX, fill: C.green, label: 'External topic', size: TEXT,
          }),
        ],
      }),
      group({
        class: 'd-named-mark',
        children: [
          cylinder({ x: MID_X, y: STORE_Y, w: STORE_W, label: 'State store', size: STORE_NAME }),
        ],
      }),
    ];
  },
};
