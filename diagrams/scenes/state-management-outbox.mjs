// THE OUTBOX AT A HEIGHT: one transaction that spans a state store and a
// message broker, and the delivery that follows it.
//
// Replaces /images/state-management-outbox.png on
// developing-applications/building-blocks/state-management/howto-outbox.md,
// under "The diagram below is an overview of how the outbox feature works at
// a high level".
//
// Fact-check, against the three numbered lines directly above the image,
// which describe the picture step by step:
//   - "1) Service A saves/updates state to the state store using a
//     transaction" - step one, down to the store.
//   - "2) A message is written to the broker under the same transaction. When
//     the message is successfully delivered to the message broker, the
//     transaction completes" - step two, and the reason the dashed boundary
//     closes to the RIGHT of the broker: writing the message is inside the
//     transaction, delivering it to a subscriber is not.
//   - "3) The message broker delivers the message topic to any subscribers -
//     in this case, Service B" - step three, outside the boundary.
//
// Where this departs from the source image, and why:
//   - THE STORE IS NAMED "State store", not "database". The page's own step
//     one calls it the state store, the feature requires a TRANSACTIONAL
//     STATE STORE rather than any database, and "database" is the one word in
//     the picture that does not appear in the prose it illustrates.
//   - the apps are named App A and App B. "Service A" was renamed across this
//     set on the maintainer's call, 2026-11-03, and the page's prose is
//     changed with it.
//   - THE RUNS LEAVE THE SIDECAR, not the app. Everywhere in this set a call
//     to a component is drawn from the Dapr sidecar, because that is what
//     holds the connection to the store and the broker; the source draws
//     steps one and two leaving Service A itself, with the sidecar hanging
//     off it taking no part.
//   - the broker is a PIPE and the store a CYLINDER, the house shapes. The
//     source draws the broker as a stack of blocks with a chevron, which is
//     not a shape this set uses for anything.
//   - the source's two page-of-text glyphs, captioned "Send message" and
//     "Deliver message", are dropped. A document in this set means a FILE;
//     what those glyphs carry is said by the step words instead.

import { APP, C } from '../engine.mjs';
import {
  arrow, elbowArrow, group, hexHalfWidth, pipe, region, cylinder, captionReach,
  STEP_R, STORE_RATIO,
} from '../shapes.mjs';
import { appSidecar, sidecarAt } from '../app.mjs';
import {
  APP_R, BLOCK_GAP, EDGE, NAME, PAD, PIPE_LEN, PIPE_RX, PIPE_RY, STORE_NAME,
  STORE_W, TEXT, V_EDGE, stepBlock, stepWidth,
} from '../state-outbox.mjs';

// Measured on the rendered page, because the exporter has no font metrics.
const SAVE_W = 70;      // "Save state"
const WRITE_W = 98;     // "Write message"
const DELIVER_W = 108;  // "Deliver message"
const CAPTION_W = 92;   // "Transaction"

// How much air a step block keeps from whatever stands beside it.
const CLEAR = 22;

// ---- the verticals, settled first ------------------------------------------
// The height of this picture does not depend on how wide it is: the row sits
// under the boundary's caption, the sidecars hang off the row, the broker
// rides at the sidecars' height so steps two and three are one straight run
// through it, and the store hangs under the sidecar that writes to it.
const REGION_Y = Math.round(V_EDGE + captionReach());
const PAD_TOP = captionReach() + PAD;
const ROW_Y = Math.round(REGION_Y + PAD_TOP + APP_R);

const SIDE_A = sidecarAt({ x: 0, y: ROW_Y, r: APP_R, size: NAME });
const SIDE_Y = SIDE_A.y;
const SIDE_HALF = hexHalfWidth(SIDE_A.r);

// Step one's disc and words ride above the run that reaches the store, so the
// drop under the sidecar is as deep as that block and its air.
const STORE_H = STORE_W / STORE_RATIO;
const STORE_GAP = STEP_R * 2 + BLOCK_GAP * 2;
const STORE_Y = Math.round(SIDE_Y + SIDE_A.r + STORE_GAP + STORE_H / 2);

const REGION_BOTTOM = Math.round(STORE_Y + STORE_H / 2 + PAD);
const REGION_H = REGION_BOTTOM - REGION_Y;

// ---- then the horizontals ---------------------------------------------------
const APP_A_X = Math.round(EDGE + PAD + hexHalfWidth(APP_R));
const SIDE_A_X = sidecarAt({ x: APP_A_X, y: ROW_Y, r: APP_R, size: NAME }).x;

// Each gap carries the step block that explains the run across it, with air
// at both ends: derived from the words rather than chosen, so a longer label
// cannot quietly close on the shapes it sits between.
const GAP_WRITE = Math.round(stepWidth(WRITE_W) + CLEAR * 2);

const PIPE_X1 = Math.round(SIDE_A_X + SIDE_HALF + GAP_WRITE + PIPE_RX);
const PIPE_X2 = PIPE_X1 + PIPE_LEN;
const PIPE_RIGHT = PIPE_X2 + PIPE_RX;

const REGION_RIGHT = PIPE_RIGHT + PAD;
const REGION_W = REGION_RIGHT - EDGE;

// THE STORE SITS UNDER THE MIDDLE OF THE TRANSACTION, not under the sidecar
// that writes to it. Directly beneath the sidecar it left the whole
// lower-right of the boundary empty - a dashed box two thirds air - and a
// reader reads that hole as something missing. The run is an elbow instead,
// and HOW FAR RIGHT the store sits is what step one's block needs on the
// elbow's lower leg: placed at the middle of the boundary instead, the words
// ran under the cylinder and came out as "Save sta".
const SAVE_LEFT = SIDE_A_X + CLEAR;
const STORE_LEFT = Math.round(SAVE_LEFT + stepWidth(SAVE_W) + CLEAR);
const STORE_X = STORE_LEFT + STORE_W / 2;

// App B's sidecar is MIRRORED - docked on the app's left - so the run arrives
// at it rather than passing through the app hexagon to reach it. Step three's
// block starts clear of the BOUNDARY rather than centred in the gap: centred,
// its disc sat on the dashed border.
const DELIVER_LEFT = REGION_RIGHT + CLEAR;
const SIDE_B_X = Math.round(DELIVER_LEFT + stepWidth(DELIVER_W) + CLEAR + SIDE_HALF);
const APP_B_X = Math.round(SIDE_B_X + (SIDE_A_X - APP_A_X));

const W = Math.ceil(APP_B_X + hexHalfWidth(APP_R) + EDGE);
const H = Math.ceil(Math.max(REGION_BOTTOM, SIDE_Y + SIDE_A.r) + V_EDGE);

// ---- where the three step blocks sit ----------------------------------------
const SAVE_X = Math.round(SAVE_LEFT + stepWidth(SAVE_W) / 2);
const SAVE_Y = Math.round(STORE_Y - BLOCK_GAP - STEP_R);
const WRITE_X = Math.round((SIDE_A_X + SIDE_HALF + PIPE_X1 - PIPE_RX) / 2);
const DELIVER_X = Math.round(DELIVER_LEFT + stepWidth(DELIVER_W) / 2);
const RUN_BLOCK_Y = Math.round(SIDE_Y - PIPE_RY - BLOCK_GAP);

export default {
  width: W,
  height: H,
  title: 'One transaction spanning a state store and a message broker, and the delivery that follows it',
  desc:
    'A dashed region captioned Transaction. Inside it on the left, a green '
    + 'hexagon named App A with a smaller hexagon carrying the Dapr logo '
    + 'docked below it. From that sidecar, step one, Save state, runs down to '
    + 'a gold data-store cylinder named State store, and step two, Write '
    + 'message, runs right to a message broker named Message broker. The '
    + 'region closes to the right of the broker. Outside it, step three, '
    + 'Deliver message, runs on from the broker to the docked sidecar of a '
    + 'blue hexagon named App B.',

  build() {
    return [
      // ---- the boundary, drawn first so everything sits on it -------------
      region({
        x: EDGE, y: REGION_Y, w: REGION_W, h: REGION_H,
        caption: 'Transaction', captionW: CAPTION_W, captionSize: TEXT,
      }),

      // ---- one: the sidecar saves state -----------------------------------
      elbowArrow({
        points: [
          [SIDE_A_X, SIDE_Y + SIDE_A.r + 2],
          [SIDE_A_X, STORE_Y],
          [STORE_LEFT - 2, STORE_Y],
        ],
      }),
      stepBlock({ x: SAVE_X, y: SAVE_Y, step: 1, text: 'Save state', textW: SAVE_W }),

      // ---- two: and writes the message under the same transaction ---------
      arrow({
        from: { x: SIDE_A_X, y: SIDE_Y, r: SIDE_A.r, hex: true },
        to: [PIPE_X1 - PIPE_RX - 2, SIDE_Y],
      }),
      stepBlock({
        x: WRITE_X, y: RUN_BLOCK_Y, step: 2, text: 'Write message', textW: WRITE_W,
      }),

      // ---- three: the broker delivers it, outside the transaction ---------
      arrow({
        from: [PIPE_RIGHT, SIDE_Y],
        to: { x: SIDE_B_X, y: SIDE_Y, r: SIDE_A.r, hex: true },
      }),
      stepBlock({
        x: DELIVER_X, y: RUN_BLOCK_Y, step: 3, text: 'Deliver message', textW: DELIVER_W,
      }),

      // ---- the shapes, over the lines that reach them ---------------------
      appSidecar({ x: APP_A_X, y: ROW_Y, r: APP_R, label: 'App A', size: NAME, ...APP[0] }),
      group({
        class: 'd-named-mark',
        children: [
          cylinder({ x: STORE_X, y: STORE_Y, w: STORE_W, label: 'State store', size: STORE_NAME }),
        ],
      }),
      group({
        class: 'd-named-mark',
        children: [
          pipe({
            x1: PIPE_X1, x2: PIPE_X2, y: SIDE_Y,
            ry: PIPE_RY, rx: PIPE_RX, fill: C.green, label: 'Message broker', size: TEXT,
          }),
        ],
      }),
      appSidecar({
        x: APP_B_X, y: ROW_Y, r: APP_R, label: 'App B', size: NAME, mirror: true, ...APP[1],
      }),
    ];
  },
};
