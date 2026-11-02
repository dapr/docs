// Subscribing to a RAW message: an app that does not run Dapr publishes
// without CloudEvent encapsulation, and a Dapr app consumes it.
//
// Replaces pubsub_subscribe_raw.png on
// developing-applications/building-blocks/pubsub/pubsub-raw.md, under
// "Subscribing to raw messages".
//
// Fact-check, against the page's own prose: the page is about apps that "need
// to communicate via pub/sub messages not encapsulated in CloudEvents, due to
// either compatibility reasons or some apps not using Dapr", and this is the
// half where the NON-Dapr app is the publisher.
//
// THE PAIR. This is `pubsub-publish-raw` with the Dapr app on the other side,
// which is the whole difference between the page's two diagrams - the same
// relationship `app-health` and `sidecar-health` have. Every measurement comes
// from diagrams/pubsub-raw.mjs so the two cannot drift apart in size or
// spacing; what each file holds is its own arrangement and its own fact-check.
//
// Where this departs from the source image, and why - the first three are
// shared with the publish diagram and its header gives them in full:
//   - the topic is a message broker rather than the source's blocks-and-
//     chevron glyph, the raw message is the house `envelope()` rather than a
//     document page, and the apps are coloured by POSITION as the palette
//     assigns them - which is also what the source does, colouring its left
//     app dark and its right app light in BOTH diagrams.
//   - the subscribing line arrives at the SIDECAR, not at the app. That is the
//     ruling of 2026-11-02, and it is what the source draws here already.
//   - the Dapr app is on the right, so it turns its sidecar INWARD. Docked on
//     its outer side the line from the topic would have to cross the app's own
//     hexagon to reach it.

import { C, APP } from '../engine.mjs';
import { arrow, elbowArrow, group, hex, hexHalfWidth, label, pipe } from '../shapes.mjs';
import { appSidecar, sidecarAt } from '../app.mjs';
import { icon } from '../icons.mjs';
import {
  APP_A_X, APP_B_X, APP_NAME, APP_R, H, MSG_DY, MSG_MARK, MSG_NAME_DY, PIPE_FILL, PIPE_RX, PIPE_RY,
  PIPE_X1, PIPE_X2, ROW_Y, TEXT, TOPIC, W,
} from '../pubsub-raw.mjs';

// Mirrored, so the sidecar hangs on the app's LEFT and the line reaches it
// without crossing the hexagon it belongs to.
const SIDE = sidecarAt({ x: APP_B_X, y: ROW_Y, r: APP_R, mirror: true });

// Out of the topic, along, down to the sidecar, and in: one path, so the
// corners are rounded and the head sits at the end of the whole run. The drop
// stands the same distance clear of the sidecar that the publish diagram's
// rise does, which is what keeps the two elbows the same shape.
const DROP_X = SIDE.x - hexHalfWidth(SIDE.r) - 34;

// The message rides above the run it names, centred in it.
const MSG_X = (APP_A_X + hexHalfWidth(APP_R) + PIPE_X1 - PIPE_RX) / 2;

export default {
  width: W,
  height: H,
  title: 'A non-Dapr app publishing a raw message that a Dapr app subscribes to',
  desc:
    'Three shapes in a row. On the left, a green hexagon named Non-Dapr publisher. In the middle, a green message broker lying on its side, named Pub/sub topic. On the right, a blue hexagon named Dapr subscriber with a Dapr sidecar hexagon docked on its lower left. A line runs from the non-Dapr publisher into the topic, with an envelope above it named Raw message. A second line leaves the topic, drops to the sidecar and runs into it.',

  build() {
    return [
      // ---- the non-Dapr app publishes straight to the topic ---------------
      arrow({
        from: [APP_A_X + hexHalfWidth(APP_R), ROW_Y],
        to: [PIPE_X1 - PIPE_RX - 2, ROW_Y],
      }),
      group({
        class: 'd-named-mark',
        children: [
          icon({
            name: 'fluent-mail', x: MSG_X, y: ROW_Y - MSG_DY,
            size: MSG_MARK, color: C.navy, fit: 'ink',
          }),
          label({
            x: MSG_X, y: ROW_Y - MSG_DY + MSG_NAME_DY,
            text: 'Raw\nmessage', size: TEXT,
          }),
        ],
      }),

      // ---- and the Dapr sidecar takes it off the topic --------------------
      pipe({
        x1: PIPE_X1, x2: PIPE_X2, y: ROW_Y,
        ry: PIPE_RY, rx: PIPE_RX, fill: PIPE_FILL, label: TOPIC, size: TEXT,
      }),
      elbowArrow({
        points: [
          [PIPE_X2 + PIPE_RX, ROW_Y],
          [DROP_X, ROW_Y],
          [DROP_X, SIDE.y],
          [SIDE.x - hexHalfWidth(SIDE.r) - 2, SIDE.y],
        ],
      }),

      // ---- the two apps, over the lines that reach them -------------------
      hex({
        x: APP_A_X, y: ROW_Y, r: APP_R,
        label: 'Non-Dapr\npublisher', size: APP_NAME, ...APP[0],
      }),
      appSidecar({
        x: APP_B_X, y: ROW_Y, r: APP_R, mirror: true,
        label: 'Dapr\nsubscriber', size: APP_NAME, ...APP[1],
      }),
    ];
  },
};
