// THE SIX STEPS OF A SERVICE INVOCATION, counted bare.
//
// Replaces /images/service-invocation-simple.webp on
// developing-applications/building-blocks/service-invocation/
// service-invocation-overview.md, under "Streaming for HTTP service
// invocation" - "The diagram below demonstrates the six steps of data flow."
//
// Fact-check, against the page's own numbered list under the image:
//   1. Request: App A to Dapr sidecar A
//   2. Request: Dapr sidecar A to Dapr sidecar B
//   3. Request: Dapr sidecar B to App B
//   4. Response: App B to Dapr sidecar B
//   5. Response: Dapr sidecar B to Dapr sidecar A
//   6. Response: Dapr sidecar A to App A
// The source draws exactly that, and so does this. The names are the page's:
// "App A" and "App B", not the "Service A" and "Service B" the overview
// diagram higher up the same page uses - two names for one pair on one page
// is the page's own inconsistency and not this scene's to resolve, so each
// picture keeps the words its own paragraph uses.
//
// It shares the spine - radii, leg heights, disc offsets - with
// `service-invocation-overview` and `service-invocation-example-detailed`
// through diagrams/invocation-row.mjs. A reader meets all three of them on
// this one page, counting the same hops.
//
// Where this departs from the source image, and why:
//   - the two sidecars are drawn as hexagons carrying the Dapr wordmark and
//     NAMED underneath. The source leaves them unnamed, which makes its own
//     step list - "Dapr sidecar A", "Dapr sidecar B" - impossible to follow
//     against the picture: the reader has to guess which hexagon is which.
//   - the apps take APP[0] and APP[1]. The source paints App A dark navy and
//     App B pale blue, which is the old house style; the palette assigns app
//     colours in order.

import { APP, C } from '../engine.mjs';
import { group, hex, hexHalfWidth, label } from '../shapes.mjs';
import { markHex } from '../icons.mjs';
import {
  APP_R, EDGE, NAME, SIDE_R, TEXT, V_EDGE, hop, spineReach,
} from '../invocation-row.mjs';
import { NAME_DY } from '../services.mjs';

// Each gap carries only a line and a disc, so it is as short as two shapes
// that talk to each other can sit without the disc touching either.
const GAP = 104;

const ROW_Y = Math.round(V_EDGE + spineReach());

const APP_A = { x: EDGE + hexHalfWidth(APP_R), y: ROW_Y, r: APP_R, hex: true };
const SIDE_A = {
  x: APP_A.x + hexHalfWidth(APP_R) + GAP + hexHalfWidth(SIDE_R), y: ROW_Y, r: SIDE_R, hex: true,
};
const SIDE_B = {
  x: SIDE_A.x + hexHalfWidth(SIDE_R) + GAP + hexHalfWidth(SIDE_R), y: ROW_Y, r: SIDE_R, hex: true,
};
const APP_B = {
  x: SIDE_B.x + hexHalfWidth(SIDE_R) + GAP + hexHalfWidth(APP_R), y: ROW_Y, r: APP_R, hex: true,
};

// ONE baseline for both sidecar names, taken off the row rather than off each
// shape: derived per shape they would be identical here anyway, but the next
// scene to use this spine has a deeper shape in the row and the two names
// would part company.
const NAME_Y = ROW_Y + SIDE_R * NAME_DY;

const W = Math.ceil(APP_B.x + hexHalfWidth(APP_R) + EDGE);
const H = Math.ceil(Math.max(ROW_Y + spineReach(), NAME_Y + TEXT) + V_EDGE);

export default {
  width: W,
  height: H,
  title: 'The six steps of a request and its response travelling through two Dapr sidecars',
  desc:
    'Four shapes in a row: a green hexagon named App A, a hexagon carrying the '
    + 'Dapr logo named Dapr sidecar A, a second such hexagon named Dapr '
    + 'sidecar B, and a blue hexagon named App B. Along the top, three arrows '
    + 'carry the request left to right, numbered one from App A to sidecar A, '
    + 'two from sidecar A to sidecar B, and three from sidecar B to App B. '
    + 'Along the bottom, three arrows carry the response back, numbered four '
    + 'from App B to sidecar B, five from sidecar B to sidecar A, and six from '
    + 'sidecar A to App A.',

  build() {
    return [
      // ---- the request, left to right -------------------------------------
      hop({ a: APP_A, b: SIDE_A, rowY: ROW_Y, step: 1 }),
      hop({ a: SIDE_A, b: SIDE_B, rowY: ROW_Y, step: 2 }),
      hop({ a: SIDE_B, b: APP_B, rowY: ROW_Y, step: 3 }),

      // ---- and the response, back again -----------------------------------
      hop({ a: APP_B, b: SIDE_B, rowY: ROW_Y, step: 4, dir: 'back' }),
      hop({ a: SIDE_B, b: SIDE_A, rowY: ROW_Y, step: 5, dir: 'back' }),
      hop({ a: SIDE_A, b: APP_A, rowY: ROW_Y, step: 6, dir: 'back' }),

      // ---- the shapes, over the lines that reach them ---------------------
      hex({ x: APP_A.x, y: ROW_Y, r: APP_R, label: 'App A', size: NAME, ...APP[0] }),
      [[SIDE_A, 'Dapr sidecar A'], [SIDE_B, 'Dapr sidecar B']].map(([s, name]) => group({
        class: 'd-named-mark',
        children: [
          markHex({ x: s.x, y: s.y, r: s.r, mark: 'logo-blue', stroke: C.blue }),
          label({ x: s.x, y: NAME_Y, text: name, size: TEXT }),
        ],
      })),
      hex({ x: APP_B.x, y: ROW_Y, r: APP_R, label: 'App B', size: NAME, ...APP[1] }),
    ];
  },
};
