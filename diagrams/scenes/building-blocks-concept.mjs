// What a building block is: an API your code calls, implemented by components.
//
// Replaces concepts-building-blocks.png on concepts/building-blocks-concept.md.
//
// Fact-check, against the two sentences this diagram sits between:
//
//   - "A building block is an HTTP or gRPC API that can be called from your
//     code and uses one or more Dapr components."
//   - "The diagram below shows how building blocks expose a public API that is
//     called from your code, using components to implement the building
//     blocks' capability."
//
// Both halves are drawn: your code on the left calling the API, and the
// components inside the block that implement it. The components stay generic,
// as the source image and the prose both leave them: the point is that there
// are one or more of them, not which ones.
//
// Where this departs from the source image, and why:
//   - the composition is LANDSCAPE. The source is a tall card the page shrinks
//     to 250px with an inline width attribute. An inlined scene scales to the
//     content column instead, so a portrait drawing of this would render about
//     as tall as the screen. Turning it on its side also puts the caller, the
//     API and the block on one line, which is the order the sentence reads in.
//   - "your code" is an app hexagon, as it is in every other diagram here,
//     rather than being implied by an arrow that starts nowhere.
//   - the API is a UML ball-and-socket assembly connector. The source draws a
//     plain circle on a stalk, which is half of the notation; drawing both
//     halves says which side provides the interface and which requires it,
//     which is the whole point of the picture. The stack behind the card is the
//     source's - there is a set of building blocks, and this is one of them.

import { APP, C, el } from '../engine.mjs';
import { box, hex, hexHalfWidth, label, lineWidth, lollipop, socket } from '../shapes.mjs';

const W = 680;
const H = 172;

const TEXT = 10.5;

// ---- your code ------------------------------------------------------------
const APP_X = 156;
const APP_R = 41; // the scene's reference size: the card is kept near 2.7x its width
const MID_Y = 80;

// ---- the building block ---------------------------------------------------
const CARD_L = 359;
const CARD_R = 548;
const CARD_T = 12;
const CARD_B = 148;
const CARD_X = (CARD_L + CARD_R) / 2;

// The set this block belongs to, drawn as the source draws it: two more cards
// behind, offset down and right. One step is the same in both axes so the
// stack reads as depth rather than as a drift.
const STACK_STEP = 6;
const STACK_DEPTH = 2;

// ---- the API, as UML draws one --------------------------------------------
// A ball-and-socket assembly connector. The building block PROVIDES the API,
// so the ball - the lollipop - is on its stalk; your code REQUIRES it, so the
// open arc cupping the ball is on the hexagon's. UML connectors carry no
// arrowheads: which side provides and which requires is said by the two
// shapes, not by a head, so these are plain lines.
// The ball and its socket scale with the drawing, like everything else.
const BALL_R = 7;
const SOCKET_R = 15;
const BALL_X = 303;
const APP_EDGE = APP_X + hexHalfWidth(APP_R);
const LABEL_X = (APP_EDGE + BALL_X - SOCKET_R) / 2;

// ---- the components --------------------------------------------------------
const COMP_W = 140;
const COMP_H = 31;
const COMP_TOP = 73;
const COMP_PITCH = 41;
const COMPONENTS = ['Component', 'Component'];

export default {
  width: W,
  height: H,
  title: 'A building block, its API and its components',
  desc:
    'Your code, drawn as a hexagon on the left, calls a building block over HTTP or gRPC. The arrow ends on a filled circle on the edge of the building block, which is the public API the block exposes. The building block is a card with two component boxes inside it, because a building block uses one or more Dapr components to implement its capability. Two more cards are stacked behind it: this is one building block of a set.',

  build() {
    return [
      // ---- the building block, and the set it belongs to -------------------
      Array.from({ length: STACK_DEPTH }, (_, i) => {
        const d = STACK_STEP * (STACK_DEPTH - i);
        return el('rect', {
          x: CARD_L + d,
          y: CARD_T + d,
          width: CARD_R - CARD_L,
          height: CARD_B - CARD_T,
          rx: 12,
          fill: C.bg,
          ...{ stroke: C.caption, 'stroke-width': lineWidth() },
        });
      }),
      el('rect', {
        x: CARD_L,
        y: CARD_T,
        width: CARD_R - CARD_L,
        height: CARD_B - CARD_T,
        rx: 12,
        fill: C.bg,
        stroke: C.navy,
        'stroke-width': lineWidth(),
      }),
      label({ x: CARD_X, y: CARD_T + 22, text: 'Building block', size: 11 }),

      COMPONENTS.map((name, i) =>
        box({
          x: CARD_X,
          y: COMP_TOP + i * COMP_PITCH,
          w: COMP_W,
          h: COMP_H,
          label: name,
          size: TEXT,
          stroke: C.orange,
          fill: C.bg,
        }),
      ),

      // ---- your code, and the interface it calls ---------------------------
      hex({ x: APP_X, y: MID_Y, r: APP_R, label: 'Your code', size: TEXT, stroke: APP[0].stroke, fill: APP[0].fill }),

      // The socket first, then the ball over it: the ball's fill covers where
      // the stalks meet it, so no stub shows through the circle.
      socket({ x: BALL_X, y: MID_Y, from: APP_EDGE + 2, r: SOCKET_R }),
      lollipop({ x: BALL_X, y: MID_Y, to: CARD_L, r: BALL_R }),

      label({ x: LABEL_X, y: MID_Y - 21, text: 'API', size: TEXT }),
      label({ x: LABEL_X, y: MID_Y + 21, text: 'HTTP or gRPC', size: TEXT }),
    ];
  },
};
