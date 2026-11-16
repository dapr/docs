// Publishing a RAW message: a Dapr app publishes without CloudEvent
// encapsulation, so an app that does not run Dapr can consume what arrives.
//
// Replaces pubsub_publish_raw.png on
// developing-applications/building-blocks/pubsub/pubsub-raw.md, under
// "Publishing raw messages".
//
// Fact-check, against the page's own prose:
//   - "Dapr apps are able to publish raw events to pub/sub topics without
//     CloudEvent encapsulation, for compatibility with non-Dapr apps." That is
//     the drawing: the Dapr side publishes, the non-Dapr side subscribes.
//   - the page calls these "raw" pub/sub messages, which is what the message
//     beside the line is named.
//
// THE PAIR. This page shows a second diagram further down with the Dapr app on
// the OTHER side - `pubsub-subscribe-raw` - and which side runs Dapr is the
// whole difference between them. They share every measurement through
// diagrams/pubsub-raw.mjs so they cannot drift apart in size or spacing, the
// way `app-health` and `sidecar-health` are the same two shapes with the ball
// on the other one.
//
// Where this departs from the source image, and why:
//   - the topic is drawn as a message broker - a cylinder on its side, open at
//     both ends - rather than the source's three blocks and a chevron, which
//     is a glyph used nowhere else in this set. A broker is what a pub/sub
//     topic lives in, and the shape says so.
//   - the raw message is an `envelope()`, the house shape for a message, where
//     the source draws a document page. Reusing one of the vendored document
//     glyphs would have borrowed a mark that already means something else
//     here: `fluent-document-multiple` is local files and `fluent-mail-copy`
//     is the pub/sub API itself.
//   - the apps are coloured by POSITION, APP[0] then APP[1], as the palette
//     assigns them. The source colours its left app dark and its right app
//     light in BOTH diagrams, so the colours say "first" and "second" there
//     too - not "Dapr" and "non-Dapr".
//   - the publishing line leaves the SIDECAR, not the app. That is the ruling
//     of 2026-11-02 and it is what the source draws here already.

import { C, APP } from '../engine.mjs';
import { elbowArrow, group, hex, hexHalfWidth, label, pipe } from '../shapes.mjs';
import { appSidecar, sidecarAt } from '../app.mjs';
import { icon } from '../icons.mjs';
import {
  APP_A_X, APP_B_X, APP_NAME, APP_R, H, MSG_DY, MSG_MARK, MSG_NAME_DY, PIPE, PIPE_FILL, PIPE_RX,
  PIPE_RY, PIPE_X1, PIPE_X2, ROW_Y, TEXT, TOPIC, W,
} from '../pubsub-raw.mjs';

const SIDE = sidecarAt({ x: APP_A_X, y: ROW_Y, r: APP_R });

// Out of the sidecar, along, up to the row, and on to the topic: one path, so
// the corners are rounded and the head sits at the end of the whole run rather
// than on a second shape laid over the first.
const RISE_X = SIDE.x + hexHalfWidth(SIDE.r) + 34;

// The message rides above the horizontal run into the topic, centred in what
// that run leaves between the rise and the topic's near rim.
const MSG_X = (RISE_X + PIPE_X1 - PIPE_RX) / 2;

export default {
  width: W,
  height: H,
  title: 'A Dapr app publishing a raw message that a non-Dapr app subscribes to',
  desc:
    'Three shapes in a row. On the left, a green hexagon named Dapr publisher with a Dapr sidecar hexagon docked on its lower right. In the middle, a green message broker lying on its side, named Pub/sub topic. On the right, a blue hexagon named Non-Dapr subscriber. A line leaves the sidecar, rises to the row and runs into the topic, with an envelope above it named Raw message. A second line runs from the topic to the non-Dapr subscriber.',

  build() {
    return [
      // ---- the sidecar publishes to the topic -----------------------------
      elbowArrow({
        points: [
          [SIDE.x + hexHalfWidth(SIDE.r), SIDE.y],
          [RISE_X, SIDE.y],
          [RISE_X, ROW_Y],
          [PIPE_X1 - PIPE_RX - 2, ROW_Y],
        ],
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

      // ---- and the non-Dapr app reads it off the topic --------------------
      pipe({
        x1: PIPE_X1, x2: PIPE_X2, y: ROW_Y,
        ry: PIPE_RY, rx: PIPE_RX, fill: PIPE_FILL, label: TOPIC, size: TEXT,
      }),
      elbowArrow({
        points: [
          [PIPE_X2 + PIPE_RX, ROW_Y],
          [APP_B_X - hexHalfWidth(APP_R) - 2, ROW_Y],
        ],
      }),

      // ---- the two apps, over the lines that reach them -------------------
      appSidecar({
        x: APP_A_X, y: ROW_Y, r: APP_R,
        label: 'Dapr\npublisher', size: TEXT + 4, ...APP[0],
      }),
      hex({
        x: APP_B_X, y: ROW_Y, r: APP_R,
        label: 'Non-Dapr\nsubscriber', size: TEXT + 4, ...APP[1],
      }),
    ];
  },
};
