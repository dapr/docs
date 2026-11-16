// One service invocation: the checkout service calls the order processor's
// `/orders` method, and both calls go through the two Dapr sidecars.
//
// Replaces building-block-service-invocation-example.png on
// developing-applications/building-blocks/service-invocation/
// howto-invoke-discover-services.md, under "This article demonstrates how to
// deploy services each with an unique application ID".
//
// Fact-check, against the page's own `dapr run` commands:
//   - the two app ids are `checkout` and `order-processor`, which is what the
//     two hexagons are named. The source's "Checkout" and "Order Processor"
//     are those ids as prose and are kept.
//   - the order processor is started with `--app-port 8001` and the page's
//     samples route `/orders` on it, so `/orders` is the endpoint it answers
//     on. The source puts that under its name and so does this.
//
// WHO THE ARROWS TOUCH. The call leaves the caller's SIDECAR and arrives at
// the callee's, which is what service invocation does and what the rest of
// this set draws: every call in `resiliency-policies` runs between sidecar
// edges, never between app hexagons. The source draws one arrow between the
// two apps instead, with the badges beside them as decoration.
//
// Where this departs from the source image, and why:
//   - the arrow runs sidecar to sidecar rather than app to app, per the above.
//     It sits at the sidecars' own height, which is below the apps' centres,
//     so the two sidecars are the shapes the line connects and the apps are
//     what they belong to.
//   - the order processor's sidecar is turned INWARD with `mirror: true`.
//     Docked on its outer side, as the source draws it, the line from the
//     checkout sidecar would have to cross the order processor's own hexagon
//     to reach it.
//   - the source's Checkout is dark navy and its Order Processor light blue.
//     The palette assigns app colours in order, so they take APP[0] and
//     APP[1]: what the source means is "an app" and "a second app", and that
//     is what is mapped, not the two particular colours it happened to use.
//   - the caption is one line of prose with a path inside it, so the path
//     takes the code font and the words around it do not. That is richLabel's
//     per-part `mono`.

import { APP, C } from '../engine.mjs';
import { arrow, hexHalfWidth, richLabel } from '../shapes.mjs';
import { appSidecar, sidecarAt } from '../app.mjs';

// Two apps side by side, so the canvas is the distance between them and that
// distance is set by the caption the line carries - 151 units measured, plus
// about two and a half characters of air at each end. The first draft left
// 67 a side, which is five times what the caption asks for: a call drawn
// across a hole the reader has to cross for no reason.
const W = 560;
const H = 208;

// 13, the size render-width.mjs is calibrated against; see
// diagrams/type-size.test.mjs. A shape's NAME is not this - it scales with the
// shape, and appSidecar derives it from the radius.
const TEXT = 13;

const APP_R = 60;

// The name size is CHOSEN here rather than derived, which is the exception
// this scene has to state. hex() derives a name at r / 3, and a pointy-top
// hexagon is 1.732r across at its widest, so a line of n characters takes
// about n * 0.5 * (r / 3) of that - which for "Processor", nine characters,
// leaves under three units a side. The constraint does not scale away: both
// terms are multiples of r, so a LARGER hexagon has exactly the same problem.
// 17 gives the longest line about a character and a half of air, and BOTH
// apps take it so the two names stay one size.
const APP_NAME = 17;

// The apps sit on one line; their sidecars therefore do too, and the call runs
// between the sidecars' edges at the sidecars' own height.
const ROW_Y = 72;

const CHECKOUT = { x: 83, y: ROW_Y };
const ORDERS = { x: 477, y: ROW_Y };

// The sidecar each app actually draws, which is what the arrow must reach:
// the right-hand one is mirrored, so its sidecar hangs on its LEFT.
const SIDE_OUT = sidecarAt({ x: CHECKOUT.x, y: CHECKOUT.y, r: APP_R });
const SIDE_IN = sidecarAt({ x: ORDERS.x, y: ORDERS.y, r: APP_R, mirror: true });

const edgeR = (s) => s.x + hexHalfWidth(s.r);
const edgeL = (s) => s.x - hexHalfWidth(s.r);

// The caption rides above the line, centred on the span it crosses rather than
// on either end, so it belongs to the run and not to one of the two sidecars.
const CAPTION_DY = 28;

export default {
  width: W,
  height: H,
  title: 'One service invoking a method on another through their Dapr sidecars',
  desc:
    'Two application hexagons side by side, each with a Dapr sidecar hexagon docked on it. On the left, a green hexagon named Checkout with its sidecar on its lower right. On the right, a blue hexagon named Order Processor with the path /orders under its name and its sidecar turned inward, on its lower left. An arrow runs from the Checkout sidecar to the Order Processor sidecar, labelled Invoke /orders method.',

  build() {
    return [
      // ---- the call, sidecar to sidecar ----------------------------------
      arrow({ from: [edgeR(SIDE_OUT), SIDE_OUT.y], to: [edgeL(SIDE_IN) - 2, SIDE_IN.y] }),
      richLabel({
        x: (edgeR(SIDE_OUT) + edgeL(SIDE_IN)) / 2,
        y: SIDE_OUT.y - CAPTION_DY,
        size: TEXT,
        weight: 600,
        anchor: 'middle',
        color: C.body,
        parts: [
          { text: 'Invoke ' },
          { text: '/orders', mono: true },
          { text: ' method' },
        ],
      }),

      // ---- the two apps, over the line that joins them --------------------
      appSidecar({
        x: CHECKOUT.x, y: CHECKOUT.y, r: APP_R, label: 'Checkout',
        size: APP_NAME, ...APP[0],
      }),
      appSidecar({
        x: ORDERS.x, y: ORDERS.y, r: APP_R, label: 'Order\nProcessor',
        size: APP_NAME, sub: '/orders', mirror: true, ...APP[1],
      }),
    ];
  },
};
