// SERVICE INVOCATION END TO END: seven numbered hops, the name resolution
// component that finds the callee, the mTLS between the two sidecars, and the
// tracing that falls out of it.
//
// Replaces /images/service-invocation-overview.png on
// developing-applications/building-blocks/service-invocation/
// service-invocation-overview.md, under "The diagram below is an overview of
// how Dapr's service invocation works between two Dapr-ized applications".
//
// It shares its spine - radii, leg heights, step discs - with
// `service-invocation-simple` further down the same page and
// `service-invocation-example-detailed` below that, through
// diagrams/invocation-row.mjs. All three count hops along the same shapes.
//
// ---------------------------------------------------------------------------
// DISCREPANCY: THE SOURCE PUTS STEP 3 ON THE WRONG ARROW.
//
// It draws "3" at the left end of the RETURN leg, beside the padlock, and
// leaves the forward sidecar-to-sidecar leg carrying only the words "Invoke
// method". The page's own list says:
//
//   3. Dapr forwards the message to App B's Dapr sidecar
//   6. Dapr forwards the response to App A's Dapr sidecar
//
// Three is the hop OUT and six is the hop BACK, so in the source they are both
// on the line that goes back. A reader following the numbers round the picture
// gets to three and finds the arrow pointing the wrong way. Drawn here on the
// forward leg, where the prose puts it.
//
// The padlock moves with it, but not onto a leg: mTLS protects BOTH
// directions, so it sits between the two lines rather than on either. The
// source hangs it off the return leg alone, which reads as the response being
// the encrypted half.
// ---------------------------------------------------------------------------
//
// Where else this departs from the source, and why:
//   - NO OPENTELEMETRY MARK. The source puts the OpenTelemetry wordmark beside
//     the observability backend. This page does not mention OpenTelemetry
//     anywhere - its observability section says only that "all calls between
//     applications are traced and metrics are gathered" - so the mark would
//     name a product the page never does. It is also not a mark this repo has
//     vendored, and vendoring one to put a brand on a page that avoided it is
//     the wrong way round.
//   - the observability backend is the heart-pulse glyph this set already uses
//     for health and telemetry, rather than the source's own squiggle.
//   - name resolution is a BOX, not a hexagon. A hexagon in this set is an
//     application or a Dapr sidecar, and the name resolution component is
//     neither; the source paints it the same navy as its App A, which
//     makes it look like a third app.
//   - the apps take APP[0] and APP[1].
//   - THE NAMES ARE "App A" AND "App B", where the source says "Service A" and
//     "Service B". Maintainer's call, 2026-11-03, and it settles an
//     inconsistency the page already had: the streaming section further down
//     lists its six steps as "App A" to "Dapr sidecar A" and so on, so one
//     page was calling the same pair of hexagons two different things. The
//     page's own prose was renamed with the picture, so the seven steps under
//     this figure now say App A and App B too.
//
//     The LETTERS stay, unlike the secrets pictures where "Service A" became
//     plain "App": there is one app in each of those and the letter
//     distinguishes nothing, while here there are two and all seven steps
//     refer to them by letter.
//   - the two calls are set as the house sets a documented call: the path
//     only, the method above it in blue, the building block picked out. The
//     source writes both hosts in full. `localhost:3500` is whatever the
//     reader's `dapr run` chose and the reference writes it `<daprPort>`;
//     `localhost:5100` is App B's own app port, which this page never
//     names. The app ids in the path - `checkout`, `order` - are the source's
//     own and the page gives no others.

import { APP, C } from '../engine.mjs';
import {
  STEP_R, arrow, box, group, hex, hexHalfWidth, label, richLabel, secureLock, stepMark,
} from '../shapes.mjs';
import { icon, markHex } from '../icons.mjs';
import {
  APP_R, EDGE, NAME, SIDE_R, STEP_DY, TEXT, V_EDGE, hop, outY, spineReach,
} from '../invocation-row.mjs';
import { NAME_DY } from '../services.mjs';

// ---- the band above the row -------------------------------------------------
const NR = { w: 186, h: 48 };
const OBS_MARK = 36;
// How far the band's lowest ink stands above the sidecars.
const RISE = 72;

const BAND_Y = V_EDGE + NR.h / 2;
const BAND_BOTTOM = BAND_Y + NR.h / 2;
const ROW_Y = Math.round(BAND_BOTTOM + RISE + SIDE_R);

// ---- the row ----------------------------------------------------------------
const PAIR_GAP = 104;
// The sidecar-to-sidecar gap carries more than a line: the step disc, the
// words naming the hop above it, and the padlock between the two legs. It is
// the one gap here sized by what it holds rather than by what it joins.
const MID_GAP = 208;

const APP_A = { x: EDGE + hexHalfWidth(APP_R), y: ROW_Y, r: APP_R, hex: true };
const SIDE_A = {
  x: APP_A.x + hexHalfWidth(APP_R) + PAIR_GAP + hexHalfWidth(SIDE_R),
  y: ROW_Y, r: SIDE_R, hex: true,
};
const SIDE_B = {
  x: SIDE_A.x + hexHalfWidth(SIDE_R) + MID_GAP + hexHalfWidth(SIDE_R),
  y: ROW_Y, r: SIDE_R, hex: true,
};
const APP_B = {
  x: SIDE_B.x + hexHalfWidth(SIDE_R) + PAIR_GAP + hexHalfWidth(APP_R),
  y: ROW_Y, r: APP_R, hex: true,
};

const MID_X = (SIDE_A.x + SIDE_B.x) / 2;

// The words naming the middle hop ride above its disc, which already sits
// above the leg.
const INVOKE_Y = outY(ROW_Y) - STEP_DY - 26;

const NAME_Y = ROW_Y + SIDE_R * NAME_DY;

// ---- the calls, under the pairs that make them ------------------------------
const METHOD_Y = NAME_Y + 34;
const CALL_Y = METHOD_Y + TEXT * 1.9;
// Measured on the rendered page at 13 in the code face.
const CALL_A_W = 266;
const callMid = (a, b) => (a.x - hexHalfWidth(a.r) + b.x + hexHalfWidth(b.r)) / 2;
const CALL_A_X = Math.max(EDGE + CALL_A_W / 2, callMid(APP_A, SIDE_A));
const CALL_B_X = callMid(SIDE_B, APP_B);

const W = Math.ceil(APP_B.x + hexHalfWidth(APP_R) + EDGE);
const H = Math.ceil(Math.max(ROW_Y + spineReach(), CALL_Y + TEXT * 0.5) + V_EDGE);

export default {
  width: W,
  height: H,
  title: 'The seven steps of one service invoking a method on another through their Dapr sidecars',
  desc:
    'Four shapes in a row: a green hexagon named App A, a hexagon carrying '
    + 'the Dapr logo, a second such hexagon, and a blue hexagon named Service '
    + 'B. The request runs left to right along the top, numbered one from '
    + 'App A to its sidecar, three from that sidecar to App B\'s '
    + 'sidecar under the words Invoke method, and four on to App B. The '
    + 'response runs back along the bottom, numbered five, six and seven. '
    + 'Between the two sidecar legs is a padlock in a shield labelled mTLS. A '
    + 'line numbered two rises from App A\'s sidecar to a box named Name '
    + 'resolution component, and another rises from App B\'s sidecar to a '
    + 'heart-pulse mark named Observability backend. Under each service and '
    + 'its sidecar is the call it carries: POST over the path '
    + '/v1.0/invoke/checkout/method/order on the left, and POST /order on the '
    + 'right.',

  build() {
    return [
      // ---- the request, and the response back -----------------------------
      hop({ a: APP_A, b: SIDE_A, rowY: ROW_Y, step: 1 }),
      hop({ a: SIDE_A, b: SIDE_B, rowY: ROW_Y, step: 3 }),
      hop({ a: SIDE_B, b: APP_B, rowY: ROW_Y, step: 4 }),
      hop({ a: APP_B, b: SIDE_B, rowY: ROW_Y, step: 5, dir: 'back' }),
      hop({ a: SIDE_B, b: SIDE_A, rowY: ROW_Y, step: 6, dir: 'back' }),
      hop({ a: SIDE_A, b: APP_A, rowY: ROW_Y, step: 7, dir: 'back' }),
      label({ x: MID_X, y: INVOKE_Y, text: 'Invoke method', size: TEXT }),

      // ---- step 2 rises to the component that finds App B -------------
      // Its disc sits BESIDE the riser rather than on it: a disc centred on a
      // vertical line cuts the line in two, and this is the one hop in the
      // picture whose number has no horizontal run to sit over.
      arrow({
        from: [SIDE_A.x, ROW_Y - SIDE_R - 2],
        to: [SIDE_A.x, BAND_BOTTOM + 2],
      }),
      stepMark({
        x: SIDE_A.x - STEP_R - 12,
        y: (ROW_Y - SIDE_R + BAND_BOTTOM) / 2,
        step: 2,
      }),

      // ---- and the sidecar's traces go out to the backend ------------------
      arrow({
        from: [SIDE_B.x, ROW_Y - SIDE_R - 2],
        to: [SIDE_B.x, BAND_Y + OBS_MARK / 2 + 16],
      }),

      // ---- mTLS belongs to BOTH legs, so it sits between them --------------
      group({
        class: 'd-named-mark',
        children: [
          secureLock({ x: MID_X, y: ROW_Y, size: 30 }),
          label({ x: MID_X + 32, y: ROW_Y, text: 'mTLS', size: TEXT, anchor: 'start' }),
        ],
      }),

      // ---- the shapes, over the lines that reach them ---------------------
      box({
        x: SIDE_A.x, y: BAND_Y, w: NR.w, h: NR.h,
        label: 'Name resolution\ncomponent', size: TEXT,
        stroke: C.blue, fill: C.blueFill,
      }),
      group({
        class: 'd-named-mark',
        children: [
          icon({
            name: 'fluent-heart-pulse', x: SIDE_B.x, y: BAND_Y - 6,
            size: OBS_MARK, color: C.navy, fit: 'ink',
          }),
          label({
            x: SIDE_B.x, y: BAND_Y + OBS_MARK / 2 + 2,
            text: 'Observability backend', size: TEXT,
          }),
        ],
      }),

      hex({ x: APP_A.x, y: ROW_Y, r: APP_R, label: 'App A', size: NAME, ...APP[0] }),
      [SIDE_A, SIDE_B].map((s) => markHex({
        x: s.x, y: s.y, r: s.r, mark: 'logo-blue', stroke: C.blue,
      })),
      label({ x: SIDE_A.x, y: NAME_Y, text: 'Dapr sidecar', size: TEXT }),
      label({ x: SIDE_B.x, y: NAME_Y, text: 'Dapr sidecar', size: TEXT }),
      hex({ x: APP_B.x, y: ROW_Y, r: APP_R, label: 'App B', size: NAME, ...APP[1] }),

      // ---- the two calls ---------------------------------------------------
      // Each PATH is emitted before its method, though it is drawn under it:
      // the theme check samples the first text in a scene that is not on a
      // plate or a solid fill, and a method is C.blue, a brand colour that is
      // the same value in both themes by design.
      richLabel({
        x: CALL_A_X, y: CALL_Y, size: TEXT, anchor: 'middle', mono: true,
        parts: [
          { text: '/v1.0/' },
          { text: 'invoke', color: C.orange, weight: 700 },
          { text: '/checkout/method/order' },
        ],
      }),
      label({ x: CALL_A_X, y: METHOD_Y, text: 'POST', size: TEXT, weight: 700, color: C.blue }),
      label({ x: CALL_B_X, y: CALL_Y, text: '/order', size: TEXT, weight: 400, mono: true }),
      label({ x: CALL_B_X, y: METHOD_Y, text: 'POST', size: TEXT, weight: 700, color: C.blue }),
    ];
  },
};
