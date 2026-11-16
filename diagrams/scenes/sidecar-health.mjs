// Sidecar health checks: the platform probing the sidecar.
//
// Replaces sidecar-health.png on concepts/resiliency-concept.md, under "Dapr
// provides a way to determine its health using an HTTP /healthz endpoint. With
// this endpoint, the daprd process, or sidecar, can be: Probed for its health;
// Determined for readiness and liveness".
//
// This scene and `app-health` are a PAIR: the same two shapes in the same two
// places, the app on the left and its sidecar on the right. What differs is
// the direction of the probe and which of the two owns the endpoint, and that
// is the whole difference between the two pages. Keep them in step.
//
// Fact-check, against reference/api/health_api.md and
// operations/resiliency/health-checks/sidecar-health.md:
//   - the endpoint is `GET http://localhost:<daprPort>/v1.0/healthz`, and it
//     answers 204 when Dapr is healthy, 500 when it is not.
//   - it belongs to the SIDECAR, and the prober is the platform:
//     "Probed for Dapr sidecar readiness from infrastructure platforms;
//     Determined for readiness and liveness with Kubernetes". The page also
//     warns, in a box, "Do not depend on the /healthz endpoint in your
//     application code... it creates a circular dependency", which is why no
//     arrow in this picture runs from the app to the endpoint.
//
// Where this departs from the source image, and why:
//   - the source draws the /healthz marker beside my-app, which says the APP
//     owns the endpoint. It is the sidecar's, so the lollipop is on the
//     sidecar and the app is on the far side of it.
//   - the source draws no prober at all, leaving the line between dapr and the
//     app to be read as the probe - the one reading the page warns against.
//     Kubernetes probes it here, as the page says.

import { C, APP } from '../engine.mjs';
import { arrow, hex, hexHalfWidth, label, lollipop, region, socket, SOCKET_R } from '../shapes.mjs';
import { icon, markHex } from '../icons.mjs';

const W = 940;
const H = 420;

const TEXT = 14;
const SMALL = 13;
const CODE = 12;
// SVG trims leading spaces and collapses runs of them, so the gap that lines
// a status code up with its meaning has to be one of these.
const NBSP = '\u00a0';

// ---- the pair, shared with app-health --------------------------------------
const APP_AT = { x: 170, y: 150, r: 60 };
const SIDE = { x: 560, y: 150, r: 48 };
const APP_EDGE = APP_AT.x + hexHalfWidth(APP_AT.r);
const SIDE_L = SIDE.x - hexHalfWidth(SIDE.r);
const SIDE_R = SIDE.x + hexHalfWidth(SIDE.r);

// The SIDECAR provides this endpoint, so the ball sits on its far side, where
// the platform can reach it without crossing the app.
const BALL_X = 700;
const PROBER = { x: 850, y: 150, size: 52 };

const CARD_Y = 250;
const CARD_H = 130;

export default {
  width: W,
  height: H,
  title: 'A platform probing the health of the Dapr sidecar',
  desc:
    'An application hexagon named my-app on the left, joined by a plain line to its Dapr sidecar on the right. The sidecar provides a health endpoint, drawn as a ball on a stalk beyond it and named /v1.0/healthz. A Kubernetes mark sits further right, with an arrow to that endpoint labelled "Readiness and liveness". Below, a dashed card headed "The endpoint" gives GET http://localhost:<daprPort>/v1.0/healthz and its two answers: 204 when Dapr is healthy and 500 when it is not. Beside it a note says the endpoint is for infrastructure probes and not for your application code to depend on.',

  build() {
    return [
      // ---- the pair ------------------------------------------------------
      hex({ x: APP_AT.x, y: APP_AT.y, r: APP_AT.r, label: 'my-app', ...APP[0] }),
      // They run together: a line, not a call. Nothing is being requested here.
      arrow({ from: [APP_EDGE, APP_AT.y], to: [SIDE_L, APP_AT.y], head: false }),
      markHex({ x: SIDE.x, y: SIDE.y, r: SIDE.r, mark: 'logo-blue' }),

      // ---- the endpoint the sidecar provides, and who requires it --------
      // The assembly connector of the source image: the sidecar PROVIDES the
      // endpoint (the ball) and the platform REQUIRES it (the socket), which
      // says the call runs from the platform to the sidecar without needing
      // an arrowhead. Socket first: the ball's fill covers the stalks.
      icon({ name: 'kubernetes-color', x: PROBER.x, y: PROBER.y, size: PROBER.size, fit: 'ink' }),
      socket({ x: BALL_X, y: APP_AT.y, from: PROBER.x - PROBER.size / 2 - 4 }),
      lollipop({ x: BALL_X, y: APP_AT.y, to: SIDE_R }),
      label({ x: BALL_X, y: APP_AT.y + 32, text: '/v1.0/healthz', size: SMALL, mono: true, weight: 400 }),
      label({
        x: (BALL_X + SOCKET_R + PROBER.x - PROBER.size / 2) / 2, y: APP_AT.y - 36,
        text: 'Readiness\nand liveness', size: TEXT,
      }),

      // ---- what it answers -------------------------------------------------
      region({
        x: 60, y: CARD_Y, w: 460, h: CARD_H, stroke: C.caption,
        caption: 'The endpoint', captionW: 134, captionH: 26, captionSize: TEXT,
      }),
      label({
        x: 92, y: CARD_Y + 54, anchor: 'start',
        text: 'GET http://localhost:<daprPort>/v1.0/healthz',
        size: CODE, mono: true, weight: 400,
      }),
      label({
        x: 92, y: CARD_Y + 98, anchor: 'start',
        text: `204${NBSP}${NBSP}Dapr is healthy\n500${NBSP}${NBSP}Dapr is not healthy`,
        size: CODE, mono: true, weight: 400,
      }),

      // ---- and who it is for ------------------------------------------------
      region({
        x: 560, y: CARD_Y, w: 224, h: CARD_H, stroke: C.blue,
        caption: 'Who calls it', captionW: 132, captionH: 26, captionSize: TEXT,
      }),
      label({
        x: 586, y: CARD_Y + 78, anchor: 'start',
        text: 'the platform, for its probes,\nand an SDK waiting for the\nsidecar to be ready - never\nyour own application code',
        size: SMALL,
      }),
    ];
  },
};
