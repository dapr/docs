// App health checks: the sidecar probing the app it serves.
//
// Replaces observability-app-health.webp on concepts/resiliency-concept.md,
// under "Dapr provides a capability for monitoring app health through probes
// that check the health of your application and react to status changes. When
// an unhealthy app is detected, Dapr stops accepting new work on behalf of the
// application".
//
// This scene and `sidecar-health` are a PAIR: the same two shapes in the same
// two places, the app on the left and its sidecar on the right. What differs
// is the direction of the probe and which of the two owns the endpoint, and
// that is the whole difference between the two pages. Keep them in step: a
// change to the geometry of one belongs in the other.
//
// Fact-check, against operations/resiliency/health-checks/app-health.md:
//   - "the Dapr runtime (sidecar) periodically polls your application", so the
//     probe runs sidecar to app. The source image draws no direction at all.
//   - every 5 seconds by default (`app-health-probe-interval`), and "for your
//     app to be considered healthy, the response must have an HTTP status code
//     in the 200-299 range".
//   - "Before Dapr considers an app to have entered an unhealthy state, it will
//     wait for `app-health-threshold` consecutive failures, whose default value
//     is 3."
//   - what stops when it does is the page's own sentence, listed in full:
//     "Unsubscribing from all pub/sub subscriptions; Stopping all input
//     bindings; Short-circuiting all service-invocation requests...;
//     Unregistering Dapr Actor types".
//
// Where this departs from the source image, and why:
//   - the source shows only the flags that turn it on. What the concept page
//     actually says is what Dapr DOES when the app is unhealthy, and that was
//     nowhere in the picture.
//   - the endpoint is drawn as a lollipop on the APP, because the app is what
//     provides it. The source puts the marker on the line between the two,
//     which leaves the reader to guess whose endpoint it is.
//   - the path is shown as the flag that sets it rather than as a default.
//     app-health.md gives the default twice and differently - `/healthz` in the
//     flag table, `/health` in the prose under "Health check paths" - so the
//     diagram states neither.

import { C, APP } from '../engine.mjs';
import { group, hex, hexHalfWidth, label, lollipop, region, socket, SOCKET_R } from '../shapes.mjs';
import { markHex } from '../icons.mjs';

const W = 940;
const H = 420;

const TEXT = 14;
const SMALL = 13;
const CODE = 12;
// SVG trims leading spaces and collapses runs of them, so an indent written
// with ordinary spaces is not drawn. These are the ones that survive.
const NBSP = '\u00a0';

// ---- the pair, shared with sidecar-health ----------------------------------
const APP_AT = { x: 170, y: 150, r: 60 };
const SIDE = { x: 560, y: 150, r: 48 };
const APP_EDGE = APP_AT.x + hexHalfWidth(APP_AT.r);
const SIDE_EDGE = SIDE.x - hexHalfWidth(SIDE.r);

// The app provides the endpoint, so the ball sits on the app's side of the gap.
const BALL_X = 330;

const CARD_Y = 250;
const CARD_H = 130;

export default {
  width: W,
  height: H,
  title: 'Dapr probing the health of the app it serves',
  desc:
    'An application hexagon named my-app on the left, its Dapr sidecar on the right. The app provides a health endpoint, drawn as a ball on a stalk beside it and named /healthz. An arrow runs from the sidecar to that endpoint, labelled "Health probe, every 5 seconds", with a note that a 200 to 299 response is healthy. Below, a dashed card headed "Turn it on" holds a dapr run command with the app health check flags. Beside it a second card, "After 3 failures in a row", lists what Dapr stops doing on the application behalf: pub/sub subscriptions, input bindings, service invocation and actor types.',

  build() {
    return [
      // ---- the app, and the endpoint it provides -------------------------
      hex({ x: APP_AT.x, y: APP_AT.y, r: APP_AT.r, label: 'my-app', ...APP[0] }),
      markHex({ x: SIDE.x, y: SIDE.y, r: SIDE.r, mark: 'logo-blue' }),

      // The assembly connector of the source image, and the only notation
      // here that says who calls whom without an arrowhead: the app PROVIDES
      // the endpoint (the ball) and the sidecar REQUIRES it (the socket), so
      // the call runs from the socket to the ball. The socket is drawn first,
      // because the ball's fill covers where the two stalks meet it.
      socket({ x: BALL_X, y: APP_AT.y, from: SIDE_EDGE - 2 }),
      lollipop({ x: BALL_X, y: APP_AT.y, to: APP_EDGE }),
      label({ x: BALL_X, y: APP_AT.y + 32, text: '/healthz', size: SMALL, mono: true, weight: 400 }),
      label({
        x: (BALL_X + SOCKET_R + SIDE_EDGE) / 2, y: APP_AT.y - 36,
        text: 'Health probe,\nevery 5 seconds', size: TEXT,
      }),
      // A line below the endpoint name, not beside it: at the same height the
      // two are a character and a half apart.
      label({
        x: (BALL_X + SOCKET_R + SIDE_EDGE) / 2, y: APP_AT.y + 58,
        text: '200-299 is healthy', size: SMALL, color: C.blue,
      }),

      // ---- how it is turned on -------------------------------------------
      region({
        x: 60, y: CARD_Y, w: 460, h: CARD_H, stroke: C.caption,
        caption: 'Turn it on', captionW: 118, captionH: 26, captionSize: TEXT,
      }),
      label({
        x: 92, y: CARD_Y + 74, anchor: 'start',
        text: ['dapr run \\', ...[
          '--app-id my-app \\',
          '--app-protocol http \\',
          '--enable-app-health-check \\',
          '--app-health-check-path=/healthz',
        ].map((l) => `${NBSP}${NBSP}${l}`)].join('\n'),
        size: CODE, mono: true, weight: 400,
      }),

      // ---- and what it costs the app to fail it --------------------------
      region({
        x: 560, y: CARD_Y, w: 260, h: CARD_H, stroke: C.blue,
        caption: 'After 3 failures in a row', captionW: 216, captionH: 26, captionSize: TEXT,
      }),
      group([
        label({
          x: 586, y: CARD_Y + 78, anchor: 'start',
          text: 'pub/sub subscriptions stop\ninput bindings stop\nservice invocation short-circuits\nactor types unregister',
          size: SMALL,
        }),
      ]),
    ];
  },
};
