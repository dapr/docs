// THE PUB/SUB HOW-TO's ONE PICTURE: two services with Dapr sidecars, a
// RabbitMQ topic between them, one publishing and one subscribing.
//
// Replaces /images/pubsub-howto-overview.png on
// developing-applications/building-blocks/pubsub/howto-publish-subscribe.md,
// above "Dapr automatically wraps the user payload in a CloudEvents v1.0
// compliant envelope".
//
// ---------------------------------------------------------------------------
// DISCREPANCY, and it is the reason this scene is not a trace of its source:
// THE SOURCE IMAGE HAS PUBLISH AND SUBSCRIBE THE WRONG WAY ROUND.
//
// The PNG draws Checkout -> publish -> RabbitMQ -> subscribe -> Order
// processor. Everything else on the page says the opposite, and says it four
// times over:
//
//   - the page's own opening bullets: "A checkout service using Dapr to
//     SUBSCRIBE to the topic in the message queue" and "An order processing
//     service using Dapr to PUBLISH a message to RabbitMQ".
//   - subscription.yaml routes the `orders` topic to `/checkout`, and every
//     subscriber sample on the page - C#, Java, Python, Go, JavaScript - is a
//     CheckoutService answering POST /checkout.
//   - every publisher sample is an OrderProcessingService calling
//     publish_event, and the CLI line is
//     `dapr publish --publish-app-id orderprocessing`.
//   - the two `dapr run` commands: the subscriber runs `--app-id checkout
//     --app-port 6002 --dapr-http-port 3602`, the publisher `--app-id
//     orderprocessing --app-port 6001 --dapr-http-port 3601`, and the curl
//     that publishes goes to port 3601.
//
// The prose wins, so this draws order processing publishing and checkout
// subscribing, which also puts the publisher on the left where a reader
// expects the start of a flow. The old image is left on disk; correcting the
// PNG itself is the maintainers' call.
//
// Its alt text is wrong too - "Diagram showing state management of example
// service", copied from the state management page - and that goes away with
// the <img>, since the shortcode takes `title` and `desc` from here.
// ---------------------------------------------------------------------------
//
// Fact-check of what IS drawn, against the page:
//   - RabbitMQ is named, not generic: the prose says "publish a message to
//     RabbitMQ", and both component tabs - Self-Hosted and Kubernetes - are
//     `type: pubsub.rabbitmq`. So the brand mark is earned here, unlike
//     `distributed-lock-overview`, where the page says "a resource" and the
//     store is deliberately unbranded.
//   - both services run Dapr, so both are drawn as the combined
//     app-and-sidecar pair. The source draws a Dapr badge on each too.
//
// WHO THE ARROWS TOUCH. Both runs leave and enter the SIDECAR, never the app:
// publishing and subscribing are Dapr API calls. That is the maintainer ruling
// of 2026-11-02, and `pubsub-publish-raw` draws the publish leg the same way.
//
// Where this departs from the source image, and why:
//   - the topic is a MESSAGE BROKER - a cylinder on its side, open at both
//     ends - rather than the source's white card. That is the house shape for
//     a broker and the one outline in this set that says "things pass
//     THROUGH", which is exactly what a topic does.
//   - the broker keeps the house GREEN even though the first app is green too.
//     That is the rule in SKILL.md: with two or more apps the broker stays
//     green, because a reader telling two apps apart by colour will not
//     mistake the pipe between them for one of them, and a green broker in
//     every such diagram is worth more than a local distinction.
//   - the RabbitMQ mark sits on a PLATE inside the pipe. It is a full-colour
//     mark - brand orange, #f60 - and icon() leaves full-colour marks
//     untouched, so without the plate it would be orange on green, which is
//     neither legible nor anything the brand guidelines would recognise.
//     `binding-input-kafka` needs no plate for the same reason reversed: its
//     mark is near-black and its pipe is sky.
//   - the apps are coloured by POSITION, APP[0] then APP[1], as the palette
//     assigns them. The source colours Checkout dark and Order processor
//     light; with the direction corrected, the publisher moves to the left and
//     takes the first colour. The colours say "first" and "second", not
//     "publisher" and "subscriber".
//
// THE CALL UNDER THE PUBLISHER, which the source does not draw. The page's own
// curl is
//
//   curl -X POST http://localhost:3601/v1.0/publish/order-pub-sub/orders \
//        -H "Content-Type: application/json" -d '{"orderId": "100"}'
//
// and it is set here the way `conversation-overview`, `configuration-example`
// and `state-management-example` set theirs: the PATH only, in the code face,
// with the building block picked out of it; the method on the line above in
// the blue this set gives a method; the body a line below in the code face at
// weight 400. The host is left off, as it is there - port 3601 is whatever the
// reader's `dapr run` chose, and `--dapr-http-port 3601` is on this page twice.
//
// It sits UNDER THE PUBLISHING PAIR, not on the run to the broker, because
// that is who makes it: the app POSTs to its OWN sidecar on localhost, and the
// sidecar then speaks AMQP to RabbitMQ. Putting it on the run would say the
// app POSTs to RabbitMQ, which is the one thing Dapr is there to stop being
// true. `component-call` places its own the same way and for the same reason,
// and keeps a verb on the component leg beside it - which is why `publish`
// stays where it is rather than being replaced by the path.
//
// NOT DRAWN, and deliberately: the topic name `orders` and the component name
// `order-pub-sub` as labels of their own. Both are IN the path now, which is
// where a reader can act on them.

import { C, APP } from '../engine.mjs';
import {
  elbowArrow, group, hexHalfWidth, label, pipe, richLabel,
} from '../shapes.mjs';
import { appSidecar, sidecarAt } from '../app.mjs';
import { icon, plate } from '../icons.mjs';

const NAMED_MARK = 'd-named-mark';

// Least space from the drawing to the side edges, and to the top and bottom.
// The same pair `pubsub-raw` takes: the canvas is wide and shallow, so five
// per cent sideways is a comfortable band while the same band vertically
// would sit under the twelve-unit floor the house rule puts on a short axis.
const EDGE = 29;
const V_EDGE = 14;

// 13, the size render-width.mjs is calibrated against; see
// diagrams/type-size.test.mjs.
const TEXT = 13;

// The same radii and the same broker proportions as `pubsub-publish-raw` and
// `pubsub-subscribe-raw`. A reader meets all three inside the pub/sub section,
// and near-equal dimensions across the pages are what make the derived type
// near-equal, so the group reads as one drawing at one size.
const APP_R = 60;
// A shape's NAME scales with the shape, so it is not the scene's body type.
// 17 is what the longest line wants: "processor" is nine characters and a
// hexagon is 1.732r across.
const APP_NAME = 17;

const PIPE_RY = 34;
const PIPE_RX = 14;
const PIPE_LEN = 150;
const PIPE_MARK = 34;
// The plate behind the mark, inside the pipe: wide enough to clear the mark on
// both sides and short enough to leave the pipe's fill showing above and below
// it, so it reads as something sitting IN the broker rather than as the
// broker's own face.
const PLATE_W = 62;
const PLATE_H = 52;

const ROW_Y = 88;

// ---- the row ---------------------------------------------------------------
const APP_A_X = EDGE + hexHalfWidth(APP_R);
const APP_A_RIGHT = APP_A_X + hexHalfWidth(APP_R);

// What each gap between a hexagon and the broker carries: one word, set in the
// body type, with air either side. Both gaps take the same number, so the
// picture is symmetric about the broker and neither verb looks more important
// than the other.
const GAP = 170;

const PIPE_X1 = APP_A_RIGHT + GAP + PIPE_RX;
const PIPE_X2 = PIPE_X1 + PIPE_LEN;
const PIPE_MID = (PIPE_X1 + PIPE_X2) / 2;

// The subscriber hangs its sidecar off its LEFT - sidecarAt()'s `mirror` -
// so the sidecar faces the broker. Without it the run from the topic would
// have to cross the app hexagon to reach the sidecar behind it.
const APP_B_X = PIPE_X2 + PIPE_RX + GAP + hexHalfWidth(APP_R);

const SIDE_A = sidecarAt({ x: APP_A_X, y: ROW_Y, r: APP_R, size: APP_NAME });
const SIDE_B = sidecarAt({
  x: APP_B_X, y: ROW_Y, r: APP_R, size: APP_NAME, mirror: true,
});
const SIDE_HALF = hexHalfWidth(SIDE_A.r);

// Where each run turns: out of the sidecar, along, and up to the row - and the
// mirror of that on the other side. The same clearance both ends, so the two
// elbows are the same shape.
const TURN = 34;
const RISE_X = SIDE_A.x + SIDE_HALF + TURN;
const DROP_X = SIDE_B.x - SIDE_HALF - TURN;

// The verb rides above the stretch of its run that lies ON the row, centred in
// it, which is the part of the line a reader's eye follows between the two
// shapes it connects.
const VERB_DY = 20;
const PUBLISH_X = (RISE_X + PIPE_X1 - PIPE_RX) / 2;
const SUBSCRIBE_X = (PIPE_X2 + PIPE_RX + DROP_X) / 2;

// The broker's name sits under it, as every branded mark in this set does -
// the mark is inside the shape, so the name cannot be.
const NAME_Y = ROW_Y + PIPE_RY + 20;

// ---- the call the publisher makes, under the publishing pair ---------------
const CALL = {
  method: 'POST',
  path: [
    { text: '/v1.0/' },
    { text: 'publish', color: C.orange, weight: 700 },
    { text: '/order-pub-sub/orders' },
  ],
  // The payload the page's own `curl -d` sends, character for character.
  body: '{"orderId": "100"}',
  // Measured on the rendered page at 13 in the code face - the exporter has no
  // font metrics - and it is the PATH that is the widest of the three lines.
  width: 265.2,
};

// The pair's lowest ink: the sidecar hangs below the app, so the app's own
// radius is the wrong number to measure from.
const PAIR_BOTTOM = SIDE_A.y + SIDE_A.r;

// The method sits a line above the path and the body a line below it, at one
// pitch, so the three read as one block - the spacing component-call.mjs
// arrived at.
const LINE_DY = TEXT * 1.9;
const METHOD_Y = PAIR_BOTTOM + 26;
const CALL_Y = METHOD_Y + LINE_DY;
const BODY_Y = CALL_Y + LINE_DY;

// Centred on the pair it belongs to, but the path is wider than the pair, so
// centring alone would hang it off the left edge. Clamped to the margin, which
// is what `conversation-overview` and `component-call` do with theirs.
const CALL_MID = Math.max(
  EDGE + CALL.width / 2,
  (APP_A_X - hexHalfWidth(APP_R) + SIDE_A.x + SIDE_HALF) / 2,
);

const W = Math.ceil(APP_B_X + hexHalfWidth(APP_R) + EDGE);
const H = Math.ceil(Math.max(NAME_Y + TEXT, BODY_Y + TEXT * 0.5) + V_EDGE);

export default {
  width: W,
  height: H,
  title: 'An order processing service publishing to a topic that a checkout service subscribes to',
  desc:
    'Three shapes in a row. On the left, a green hexagon named Order processor '
    + 'with a Dapr sidecar hexagon docked on its lower right. In the middle, a '
    + 'green message broker lying on its side, carrying the RabbitMQ mark and '
    + 'named RabbitMQ beneath it. On the right, a blue hexagon named Checkout '
    + 'with a Dapr sidecar docked on its lower left, facing the broker. A line '
    + 'leaves the left sidecar, rises to the row and runs into the broker, '
    + 'labelled publish. A second line leaves the broker, runs along the row '
    + 'and drops into the right sidecar, labelled subscribe. Below the order '
    + 'processor and its sidecar is the call it makes to publish an order: '
    + 'POST over the path /v1.0/publish/order-pub-sub/orders, carrying the '
    + 'body {"orderId": "100"}.',

  build() {
    return [
      // ---- the order processor's sidecar publishes to the topic -----------
      elbowArrow({
        points: [
          [SIDE_A.x + SIDE_HALF, SIDE_A.y],
          [RISE_X, SIDE_A.y],
          [RISE_X, ROW_Y],
          [PIPE_X1 - PIPE_RX - 2, ROW_Y],
        ],
      }),
      label({ x: PUBLISH_X, y: ROW_Y - VERB_DY, text: 'publish', size: TEXT }),

      // ---- and the checkout service's sidecar subscribes to it ------------
      elbowArrow({
        points: [
          [PIPE_X2 + PIPE_RX, ROW_Y],
          [DROP_X, ROW_Y],
          [DROP_X, SIDE_B.y],
          [SIDE_B.x - SIDE_HALF - 2, SIDE_B.y],
        ],
      }),
      label({ x: SUBSCRIBE_X, y: ROW_Y - VERB_DY, text: 'subscribe', size: TEXT }),

      // ---- the shapes, over the lines that reach them ---------------------
      group({
        class: NAMED_MARK,
        children: [
          pipe({
            x1: PIPE_X1, x2: PIPE_X2, y: ROW_Y,
            ry: PIPE_RY, rx: PIPE_RX, fill: C.green,
          }),
          plate({ x: PIPE_MID, y: ROW_Y, w: PLATE_W, h: PLATE_H }),
          icon({
            name: 'rabbitmq', x: PIPE_MID, y: ROW_Y, size: PIPE_MARK, fit: 'ink',
          }),
          label({ x: PIPE_MID, y: NAME_Y, text: 'RabbitMQ', size: APP_NAME }),
        ],
      }),

      appSidecar({
        x: APP_A_X, y: ROW_Y, r: APP_R,
        label: 'Order\nprocessor', size: APP_NAME, ...APP[0],
      }),
      appSidecar({
        x: APP_B_X, y: ROW_Y, r: APP_R, mirror: true,
        label: 'Checkout', size: APP_NAME, ...APP[1],
      }),

      // ---- and the call the page documents for the publishing side --------
      // The PATH is emitted BEFORE the method, though it is drawn under it.
      // The theme check samples the first text in a scene that is not on a
      // plate or a solid fill, and a method is C.blue - a brand colour, the
      // same value in both themes by design - so leading with it would make a
      // scene that re-themes perfectly read as one that does not. Nothing
      // moves: the two do not overlap.
      group([
        richLabel({
          x: CALL_MID, y: CALL_Y, size: TEXT, anchor: 'middle', mono: true,
          parts: CALL.path,
        }),
        label({
          x: CALL_MID, y: BODY_Y, text: CALL.body, size: TEXT, weight: 400, mono: true,
        }),
        label({
          x: CALL_MID, y: METHOD_Y, text: CALL.method,
          size: TEXT, weight: 700, color: C.blue,
        }),
      ]),
    ];
  },
};
