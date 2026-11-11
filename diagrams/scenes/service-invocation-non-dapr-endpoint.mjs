// INVOKING A NON-DAPR ENDPOINT: one sidecar, not two, because the far side
// does not run Dapr.
//
// Replaces /images/service-invocation-overview-non-dapr-endpoint.png on
// developing-applications/building-blocks/service-invocation/
// howto-invoke-non-dapr-endpoints.md, under "Service invocation and non-Dapr
// HTTP endpoint".
//
// Fact-check, against the page's own numbered list under the image:
//   1. App A makes an HTTP call targeting App B, a non-Dapr endpoint.
//      The call goes to the local Dapr sidecar.
//   2. Dapr discovers App B's location using the HTTPEndpoint or FQDN URL
//      then forwards the message to App B.
//   3. App B sends a response to App A's Dapr sidecar.
//   4. App A receives the response.
// Four steps, one sidecar, and the second hop goes straight to App B.
// That is what the source draws and what this draws.
//
// THE MISSING HALF OF THE PAIR IS THE POINT. Every other picture in this
// section has two sidecars; this one has one, because App B is not a Dapr
// application. The step numbers say the same thing - four hops where the
// overview has seven - and nothing else in the drawing needs to.
//
// Where this departs from the source image, and why:
//   - IT DROPS THE TITLE. The source bakes "Service Invocation to non-Dapr
//     Endpoints" into the drawing in 40-unit type. House style puts a title in
//     the page, and the page already has it twice over: the heading directly
//     above the image says "Service invocation and non-Dapr HTTP endpoint",
//     and the sentence under it says the diagram is an overview of how service
//     invocation works when invoking non-Dapr endpoints. Baked into the
//     picture it cannot be translated, searched or restyled, and it is the
//     largest thing in a drawing whose subject is four small hops.
//     (Phase 1 fact-check finding 5.)
//   - THE NAMES ARE "App A" AND "App B", where the source image says "Service
//     A" and "Service B". Maintainer's call, 2026-11-03, made across the whole
//     service invocation section: the overview page already called the same
//     pair "App A" and "App B" in its streaming steps while calling them
//     "Service A" and "Service B" in its seven, and one building block should
//     not name the same two hexagons two ways. The page's own four steps were
//     renamed with the picture.
//
//     The LETTERS stay. In the secrets pictures "Service A" became plain
//     "App", because each of those has one app and the letter distinguishes
//     nothing; here there are two and all four steps refer to them by letter.
//   - the apps take APP[0] and APP[1]; the source paints the caller dark navy
//     and the callee pale blue, which is the old house style.
//   - the sidecar is named. The source leaves it unlabelled, and its own step
//     list calls it "App A's Dapr sidecar".

import { APP, C } from '../engine.mjs';
import { group, hex, hexHalfWidth, label } from '../shapes.mjs';
import { markHex } from '../icons.mjs';
import {
  APP_R, EDGE, NAME, SIDE_R, TEXT, V_EDGE, hop, spineReach,
} from '../invocation-row.mjs';
import { NAME_DY } from '../services.mjs';

// The same spine as the other three invocation pictures, so a reader moving
// between the how-to and the overview sees one drawing at one size.
const GAP = 104;

const ROW_Y = Math.round(V_EDGE + spineReach());

const APP_A = { x: EDGE + hexHalfWidth(APP_R), y: ROW_Y, r: APP_R, hex: true };
const SIDE = {
  x: APP_A.x + hexHalfWidth(APP_R) + GAP + hexHalfWidth(SIDE_R), y: ROW_Y, r: SIDE_R, hex: true,
};
// The hop from the sidecar to App B carries no disc of its own beyond its
// number, but it is the long one in the picture: it stands for a call leaving
// Dapr altogether, and a gap the same as the others would say it is the same
// kind of hop.
const FAR_GAP = 168;
const APP_B = {
  x: SIDE.x + hexHalfWidth(SIDE_R) + FAR_GAP + hexHalfWidth(APP_R), y: ROW_Y, r: APP_R, hex: true,
};

const NAME_Y = ROW_Y + SIDE_R * NAME_DY;

const W = Math.ceil(APP_B.x + hexHalfWidth(APP_R) + EDGE);
const H = Math.ceil(Math.max(ROW_Y + spineReach(), NAME_Y + TEXT) + V_EDGE);

export default {
  width: W,
  height: H,
  title: 'A Dapr application invoking a non-Dapr HTTP endpoint through its sidecar',
  desc:
    'Three shapes in a row: a green hexagon named App A, a hexagon '
    + 'carrying the Dapr logo named Dapr sidecar, and a blue hexagon named '
    + 'App B, which is a non-Dapr endpoint and has no sidecar of its own. '
    + 'Along the top, an arrow numbered one runs from App A to the '
    + 'sidecar, and an arrow numbered two runs from the sidecar to App B. '
    + 'Along the bottom, an arrow numbered three runs from App B back to '
    + 'the sidecar, and an arrow numbered four from the sidecar back to '
    + 'App A.',

  build() {
    return [
      hop({ a: APP_A, b: SIDE, rowY: ROW_Y, step: 1 }),
      hop({ a: SIDE, b: APP_B, rowY: ROW_Y, step: 2 }),
      hop({ a: APP_B, b: SIDE, rowY: ROW_Y, step: 3, dir: 'back' }),
      hop({ a: SIDE, b: APP_A, rowY: ROW_Y, step: 4, dir: 'back' }),

      hex({ x: APP_A.x, y: ROW_Y, r: APP_R, label: 'App A', size: NAME, ...APP[0] }),
      group({
        class: 'd-named-mark',
        children: [
          markHex({ x: SIDE.x, y: SIDE.y, r: SIDE.r, mark: 'logo-blue', stroke: C.blue }),
          label({ x: SIDE.x, y: NAME_Y, text: 'Dapr sidecar', size: TEXT }),
        ],
      }),
      hex({ x: APP_B.x, y: ROW_Y, r: APP_R, label: 'App B', size: NAME, ...APP[1] }),
    ];
  },
};
