// The sidecar model: application code and the Dapr sidecar as two processes
// talking over a local HTTP or gRPC API, with example calls underneath.
//
// Shown on overview.md ("Sidecar architecture") and on
// concepts/dapr-services/sidecar.md, from this one source.
//
// It replaces overview-sidecar-model.png. Two things in that image did not
// survive the fact-check:
//
//   - the workflow call read /v1.0-beta1/workflows/... The Workflow API is
//     stable and reference/api/workflow_api.md documents the start call as
//     POST /v1.0/workflows/<component>/<workflow>/start, so the version
//     prefix was simply out of date. The other four calls were checked against
//     their own reference pages and are unchanged.
//   - the application hexagon was green, which is not a colour this diagram
//     set has. One app takes APP[0], as everywhere else.
//
// Where this departs from the source image, and why:
//   - the highlighted part of each URL is navy, not orange, and the trailing
//     resource names are body ink rather than light blue. Orange is 3.31:1 on
//     the light ground and sky is 2.56:1, both under the 4.5:1 needed for text
//     this size. Navy is 12.7:1 light and 7.2:1 dark, and the emphasis still
//     lands on the building block, which is the thing the image was pointing
//     at.

import { APP, C, el } from '../engine.mjs';
import { OUTLINE, arrow, group, hex, hexPoints, label, richLabel } from '../shapes.mjs';
import { icon } from '../icons.mjs';

const W = 900;
const H = 494;

const HEX_Y = 95;
const HEX_R = 62;
const APP_X = 306;
const DAPR_X = 661;
const MID_X = (APP_X + DAPR_X) / 2;

const CAPTION_Y = 196;

const ROW_TOP = 287; // centre of the first example call
const ROW_PITCH = 41;
const METHOD_X = 50;
const URL_X = 124;
const URL_SIZE = 21;

// [method, prefix, building block, rest]. The building block is the segment the
// diagram is pointing at, so it is the only part set apart. Every path is from
// that API's own reference page.
const CALLS = [
  ['POST', 'http://localhost:3500/v1.0/', 'invoke', '/cart/method/order'],
  ['GET', 'http://localhost:3500/v1.0/', 'state', '/inventory/item50'],
  ['POST', 'http://localhost:3500/v1.0/', 'publish', '/mybroker/order-messages'],
  ['GET', 'http://localhost:3500/v1.0/', 'secrets', '/vault/dbaccess'],
  ['POST', 'http://localhost:3500/v1.0/', 'workflows', '/dapr/businessprocess/start'],
];

export default {
  width: W,
  height: H,
  title: 'The Dapr sidecar model',
  desc:
    'Application code on the left and the Dapr sidecar on the right, drawn as two hexagons side by side. A two-headed arrow between them is labelled "Dapr API" and "HTTP/gRPC", because the application calls Dapr over a local HTTP or gRPC endpoint rather than linking any Dapr code. Below are five example calls to that endpoint: POST to slash v1.0 slash invoke slash cart slash method slash order, GET to slash v1.0 slash state slash inventory slash item50, POST to slash v1.0 slash publish slash mybroker slash order-messages, GET to slash v1.0 slash secrets slash vault slash dbaccess, and POST to slash v1.0 slash workflows slash dapr slash businessprocess slash start.',

  build() {
    return [
      // ---- the two processes ---------------------------------------------
      hex({
        x: APP_X,
        y: HEX_Y,
        r: HEX_R,
        label: 'App',
        size: 16,
        stroke: APP[0].stroke,
        fill: APP[0].fill,
      }),
      label({ x: APP_X, y: CAPTION_Y, text: 'Application code', size: 17 }),

      // The Dapr wordmark paints its own navy, so the hexagon doubles as its
      // plate rather than carrying a rectangular one inside it. Without that
      // fill the wordmark is navy on the dark ground and all but disappears.
      group([
        el('polygon', {
          points: hexPoints(DAPR_X, HEX_Y, HEX_R),
          fill: C.plate,
          stroke: C.navy,
          'stroke-width': OUTLINE,
          'stroke-linejoin': 'round',
        }),
        icon({ name: 'logo-blue', x: DAPR_X, y: HEX_Y, w: 84, h: 84 }),
      ]),
      label({ x: DAPR_X, y: CAPTION_Y, text: 'Dapr sidecar', size: 17 }),

      // ---- the API between them ------------------------------------------
      // Two arrows along the same line, so it carries a head at each end: the
      // application calls Dapr and Dapr answers.
      arrow({
        from: { x: APP_X, y: HEX_Y, r: HEX_R, hex: true },
        to: { x: DAPR_X, y: HEX_Y, r: HEX_R, hex: true },
      }),
      arrow({
        from: { x: DAPR_X, y: HEX_Y, r: HEX_R, hex: true },
        to: { x: APP_X, y: HEX_Y, r: HEX_R, hex: true },
      }),
      label({ x: MID_X, y: HEX_Y - 28, text: 'Dapr API', size: 17, weight: 700 }),
      label({ x: MID_X, y: HEX_Y + 30, text: 'HTTP/gRPC', size: 17 }),

      // ---- what a call to that API looks like ----------------------------
      CALLS.map(([method, prefix, block, rest], i) => {
        const y = ROW_TOP + i * ROW_PITCH;
        return group([
          label({ x: METHOD_X, y, text: method, size: URL_SIZE, weight: 700, color: C.navy, anchor: 'start' }),
          richLabel({
            x: URL_X,
            y,
            size: URL_SIZE,
            parts: [
              { text: prefix },
              { text: block, color: C.navy, weight: 700 },
              { text: rest },
            ],
          }),
        ]);
      }),
    ];
  },
};
