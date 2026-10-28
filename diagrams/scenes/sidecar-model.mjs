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
//   - the application hexagon is green, as the source drew it: APP[0] is that
//     green, drawn solid with dark ink on it, and every scene's first app
//     takes it.
//
// Where this departs from the source image, and why:
//   - the building block in each URL is ORANGE and the method is blue, which
//     is what the source image does. Neither brand colour can be used as type
//     directly: the brand orange is 3.31:1 on white and the sky blue 2.56:1,
//     both under the 4.5:1 text needs. C.orange and C.blue are the
//     ink versions - darker in the light theme, the brand colour in the dark
//     one - at 5.93:1 and 5.72:1.

import { APP, C, el } from '../engine.mjs';
import { arrow, group, hex, hexPoints, label, richLabel } from '../shapes.mjs';
import { icon, markHex } from '../icons.mjs';

// The endpoints and the pair of hexagons are centred on the same x, so the
// list sits under the thing it explains. The canvas is held while the type
// inside it shrinks, which is what makes the drawing render smaller - the
// inlined svg always fills the content column, so only the ratio shows.
const W = 730;
const H = 364; // trimmed to the drawing: about 4.5% of air a side

const HEX_Y = 78;
const HEX_R = 62;
const APP_X = 188;
const DAPR_X = 543;
const MID_X = (APP_X + DAPR_X) / 2;

const CAPTION_Y = 179;

const ROW_TOP = 228; // the list sits close under the pair it explains // centre of the first example call
const ROW_PITCH = 28; // scaled with the type, not left at the old 41
const METHOD_X = 146;
const URL_X = 194;
const URL_SIZE = 12.6;

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
        ...APP[0],
      }),
      label({ x: APP_X, y: CAPTION_Y, text: 'Application code', size: 17 }),

      // The Dapr wordmark paints its own navy, so the hexagon doubles as its
      // plate rather than carrying a rectangular one inside it. Without that
      // fill the wordmark is navy on the dark ground and all but disappears.
      markHex({ x: DAPR_X, y: HEX_Y, r: HEX_R, mark: 'logo-blue' }),
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
          label({ x: METHOD_X, y, text: method, size: URL_SIZE, weight: 700, color: C.blue, anchor: 'start' }),
          richLabel({
            x: URL_X,
            y,
            size: URL_SIZE,
            parts: [
              { text: prefix },
              { text: block, color: C.orange, weight: 700 },
              { text: rest },
            ],
          }),
        ]);
      }),
    ];
  },
};
