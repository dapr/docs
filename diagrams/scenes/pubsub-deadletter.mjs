// A MESSAGE THAT COULD NOT BE DELIVERED, and where it goes instead.
//
// Replaces /images/pubsub_deadletter.png on
// developing-applications/building-blocks/pubsub/pubsub-deadletter.md, under
// "The diagram below is an example of how dead letter topics work".
//
// Fact-check, against the paragraph directly above the image, which describes
// the picture step by step and agrees with it throughout:
//   - "a message is sent from a publisher on an `orders` topic"
//   - "the orders topic message fails to be delivered to the `/checkout`
//     endpoint on the application, even after retries"
//   - "the message is forwarded to the `poisonMessages` topic which delivers
//     this to the `/failedMessages` endpoint"
//   - "in this case on the same application" - which is why there is ONE
//     subscriber hexagon with two endpoints arriving at it, not two apps.
// The declarative subscription under the image confirms every name:
// `topic: orders`, `routes.default: /checkout`, `deadLetterTopic:
// poisonMessages`, `scopes: [checkout]`.
//
// HOW THE FAILED DELIVERY IS DRAWN. The whole run to `/checkout` is DASHED and
// RED, with the cross above the line rather than on it. Maintainer's call,
// 2026-11-03.
//
//   This is the only scene in the set that draws `C.red`. Everywhere else a
//   blocked path is ORANGE and dashed with `fluent-dismiss-circle` over it -
//   `api-scoping`, for a call its allowlist blocks, and
//   `distributed-lock-overview`, for a lock that denies access - and both are
//   committed and drawn that way deliberately, because red and green together
//   carry nothing for a reader who cannot tell them apart. Red carries here
//   because it is not paired with a green: the contrast a reader needs is
//   against the navy runs around it, and dashed-against-solid already makes
//   that without any colour at all. If the three should match instead, this
//   is one token.
//
// THE RUNS REACH THE SUBSCRIBER AT ITS POINTS, top and bottom, not at its left
// face: two runs arriving at one hexagon from the same side crowd each other,
// and a hexagon's two points are the only places a line can arrive square.
//
// Where else this departs from the source image, and why:
//   - both topics are drawn as MESSAGE BROKERS, the house shape: a cylinder on
//     its side, open at both ends. The source draws `orders` as a stack of
//     blocks with a chevron and `poisonMessages` as nothing at all - just
//     words under a line - so the two topics in one picture are drawn two
//     different ways, and the one that matters most is the one left out.
//   - the two endpoints ride on the runs that reach them, in the code font.
//     That is how this set names an endpoint a call arrives on;
//     `binding-input-kafka` does the same.
//   - the app hexagons take APP[0] and APP[1]; the source's dark navy and pale
//     blue are the old house style.
//   - the source's three page-of-text glyphs are dropped. A document in this
//     set means a file, which is what `distributed-lock-overview` spends it
//     on, and the shapes here already say what each step carries: a topic is a
//     broker and a failure is a cross.

import { APP, C } from '../engine.mjs';
import {
  arrow, elbowArrow, group, hex, hexHalfWidth, label, pipe, stepMark, STEP_R,
} from '../shapes.mjs';
import { icon, markHex } from '../icons.mjs';
import { NAME_DY } from '../services.mjs';

const EDGE = 29;
const V_EDGE = 14;
const TEXT = 13;
const NAME = 17;

// 64 rather than 60, so the longest NAME clears the outline by half an em
// each side - the rule `holds every shape's own name inside it` enforces,
// and the one caption pills have always been held to. At 60 the name sat
// about five units off the sloping edges, which reads as a shape drawn too
// small for what it carries.
const APP_R = 64;
const SIDE_R = 44;

const PIPE_RY = 30;
const PIPE_RX = 12;
// Long enough for the LONGER of the two names it has to hold inside it -
// "poisonMessages" measures 107 - with air at both ends. Both pipes take it:
// one shape at one size, or the two topics read as different kinds of thing.
// pipe() refuses anything outside two to three times its own depth.
const PIPE_LEN = 170;

const CROSS = 30;
// How far a step's words stand off the run they explain.
const BLOCK_GAP = 26;

// A STEP'S DISC AND ITS WORDS ARE ONE BLOCK, laid out left to right from the
// block's own centre rather than each placed at its own offset from something
// else. Placed separately the two landed on top of each other, and nothing but
// a render could see it: both labels existed, were the right size and were
// inside the canvas. The caption widths are measured on the rendered page.
const DISC_GAP = 14;
const stepBlock = ({ x, y, step, text, textW }) => {
  const total = STEP_R * 2 + DISC_GAP + textW;
  const left = x - total / 2;
  return group({
    class: 'd-named-mark',
    children: [
      stepMark({ x: left + STEP_R, y, step }),
      label({ x: left + STEP_R * 2 + DISC_GAP + textW / 2, y, text, size: TEXT }),
    ],
  });
};

// THE TWO DELIVERY RUNS SIT CLEAR OF THE SUBSCRIBER'S OWN HEIGHT, because each
// turns down or up into a POINT of that hexagon and a run level with the
// hexagon's middle cannot. Derived from the radius rather than chosen, so the
// two cannot close on the shape if the radius ever changes.
const LEG_CLEAR = 34;
const LEG_DY = APP_R + LEG_CLEAR;

// ---- the row ----------------------------------------------------------------
// DERIVED from what stands above it: the highest thing is step two's words,
// over the cross, over the upper run, which is itself a leg's depth off the
// row.
const ROW_Y = V_EDGE + LEG_DY + CROSS + BLOCK_GAP + STEP_R;
const OUT_Y = ROW_Y - LEG_DY;
const BACK_Y = ROW_Y + LEG_DY;

const PUB = { x: EDGE + hexHalfWidth(APP_R), y: ROW_Y, r: APP_R, hex: true };

// The first gap carries step one and its words.
const ORDERS_X1 = PUB.x + hexHalfWidth(APP_R) + 136 + PIPE_RX;
const ORDERS_X2 = ORDERS_X1 + PIPE_LEN;

const SIDE = {
  x: ORDERS_X2 + PIPE_RX + 96 + hexHalfWidth(SIDE_R), y: ROW_Y, r: SIDE_R, hex: true,
};
const SIDE_RIGHT = SIDE.x + hexHalfWidth(SIDE_R);

// Where each run leaves the row and turns off it.
const TURN = SIDE_RIGHT + 44;

// The dead letter topic sits on the LOWER run, between the sidecar and the
// endpoint that handles what it carries.
const POISON_X1 = TURN + 70 + PIPE_RX;
const POISON_X2 = POISON_X1 + PIPE_LEN;
const POISON_MID = (POISON_X1 + POISON_X2) / 2;

const SUB = {
  x: POISON_X2 + PIPE_RX + 170 + hexHalfWidth(APP_R), y: ROW_Y, r: APP_R, hex: true,
};

const NAME_Y = ROW_Y + SIDE_R * NAME_DY;

// ---- the three steps --------------------------------------------------------
const SENT_X = (PUB.x + hexHalfWidth(APP_R) + ORDERS_X1 - PIPE_RX) / 2;
const SENT_Y = ROW_Y - BLOCK_GAP - STEP_R;

// The cross stands ABOVE the run it condemns rather than on it, so the dashed
// red line reads whole underneath it.
const CROSS_X = (TURN + SUB.x) / 2;
const CROSS_Y = OUT_Y - CROSS / 2 - 12;
const FAIL_Y = CROSS_Y - CROSS / 2 - BLOCK_GAP + 6;
const DEAD_Y = BACK_Y + PIPE_RY + BLOCK_GAP;

const W = Math.ceil(SUB.x + hexHalfWidth(APP_R) + EDGE);
const H = Math.ceil(Math.max(DEAD_Y + STEP_R + 10, NAME_Y + TEXT) + V_EDGE);

export default {
  width: W,
  height: H,
  title: 'A message that fails delivery being forwarded to a dead letter topic',
  desc:
    'On the left, a green hexagon named Publisher, with step one beside it '
    + 'reading Message sent. An arrow runs from it to a message broker named '
    + 'orders, and on to a hexagon carrying the Dapr logo, named Dapr sidecar. '
    + 'From the sidecar one run rises and turns down into the top point of a '
    + 'blue hexagon named Subscriber on the right: it is dashed and red, '
    + 'labelled /checkout, with a red cross above it and step two reading '
    + 'Delivery fails, after retries. A second run drops from the sidecar, '
    + 'passes through a second broker named poisonMessages, and turns up into '
    + 'the bottom point of the Subscriber, labelled /failedMessages, with step '
    + 'three reading Dead letter topic delivery.',

  build() {
    return [
      // ---- the publisher sends on the orders topic ------------------------
      arrow({ from: PUB, to: [ORDERS_X1 - PIPE_RX - 2, ROW_Y] }),
      stepBlock({ x: SENT_X, y: SENT_Y, step: 1, text: 'Message sent', textW: 88 }),
      arrow({ from: [ORDERS_X2 + PIPE_RX, ROW_Y], to: SIDE }),

      // ---- the sidecar tries /checkout, and it fails ----------------------
      // Dashed because the thing does not happen, and red by the maintainer's
      // call recorded at the top of this file. The head stays solid, which is
      // what elbowArrow() does with `dash` and for the same reason: a dashed
      // chevron just reads as a badly drawn one.
      elbowArrow({
        color: C.red,
        dash: true,
        points: [
          [SIDE_RIGHT + 2, ROW_Y],
          [TURN, ROW_Y],
          [TURN, OUT_Y],
          [SUB.x, OUT_Y],
          [SUB.x, SUB.y - APP_R - 2],
        ],
      }),
      label({
        x: CROSS_X, y: OUT_Y + 20, text: '/checkout', size: TEXT, mono: true,
      }),
      icon({
        name: 'fluent-dismiss-circle', x: CROSS_X, y: CROSS_Y, size: CROSS,
        color: C.red, fit: 'ink',
      }),
      stepBlock({
        x: CROSS_X, y: FAIL_Y, step: 2,
        text: 'Delivery fails, after retries', textW: 162,
      }),

      // ---- so it goes to the dead letter topic instead --------------------
      elbowArrow({
        points: [
          [SIDE_RIGHT + 2, ROW_Y],
          [TURN, ROW_Y],
          [TURN, BACK_Y],
          [POISON_X1 - PIPE_RX - 2, BACK_Y],
        ],
      }),
      elbowArrow({
        points: [
          [POISON_X2 + PIPE_RX, BACK_Y],
          [SUB.x, BACK_Y],
          [SUB.x, SUB.y + APP_R + 2],
        ],
      }),
      label({
        x: (POISON_X2 + PIPE_RX + SUB.x) / 2, y: BACK_Y - 18,
        text: '/failedMessages', size: TEXT, mono: true,
      }),
      stepBlock({
        x: POISON_MID, y: DEAD_Y, step: 3,
        text: 'Dead letter topic delivery', textW: 158,
      }),

      // ---- the shapes, over the lines that reach them ---------------------
      hex({ x: PUB.x, y: ROW_Y, r: APP_R, label: 'Publisher', size: NAME, ...APP[0] }),
      group({
        class: 'd-named-mark',
        children: [
          pipe({
            x1: ORDERS_X1, x2: ORDERS_X2, y: ROW_Y,
            ry: PIPE_RY, rx: PIPE_RX, fill: C.green, label: 'orders', size: TEXT,
          }),
        ],
      }),
      group({
        class: 'd-named-mark',
        children: [
          markHex({ x: SIDE.x, y: SIDE.y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
          label({ x: SIDE.x, y: NAME_Y, text: 'Dapr sidecar', size: TEXT }),
        ],
      }),
      group({
        class: 'd-named-mark',
        children: [
          pipe({
            x1: POISON_X1, x2: POISON_X2, y: BACK_Y,
            ry: PIPE_RY, rx: PIPE_RX, fill: C.green, label: 'poisonMessages', size: TEXT,
          }),
        ],
      }),
      hex({ x: SUB.x, y: ROW_Y, r: APP_R, label: 'Subscriber', size: NAME, ...APP[1] }),
    ];
  },
};
