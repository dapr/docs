// THE SAME SEVEN STEPS WITH REAL NAMES AND REAL ADDRESSES, on one machine.
//
// Replaces /images/service-invocation-overview-example.png on
// developing-applications/building-blocks/service-invocation/
// service-invocation-overview.md, under "Example Architecture" - "The diagram
// below shows sequence 1-7 again on a local machine showing the API calls".
//
// "again" is the page's own word, so this is deliberately
// `service-invocation-overview` with the names filled in: same spine, same
// radii, same seven numbers through diagrams/invocation-row.mjs. What it adds
// is the two actual calls and the machine they happen on.
//
// Fact-check, against the page's own numbered list under the image:
//   1. "The python app invokes the Node.js app's `neworder` method by POSTing
//      `http://localhost:3500/v1.0/invoke/nodeapp/method/neworder`, which
//      first goes to the python app's local Dapr sidecar."
//   2. "Dapr discovers the Node.js app's location using name resolution
//      component (in this case mDNS while self-hosted) which runs on your
//      local machine." - so the component is mDNS and it is INSIDE the
//      machine, which is why the region holds it.
//   3. "Dapr forwards the request to the Node.js app's sidecar using the
//      location it just received."
//   4-7 as the overview draws them.
//   - the app ids are `nodeapp` and, from the same paragraph, the python app;
//     the source names the hexagons `pythonapp` and `nodeapp` and the page's
//     step 1 confirms `nodeapp`.
//
// THIS IS THE ONE PICTURE IN THE SET THAT KEEPS THE HOSTS, and it is the
// exception that proves the rule. Everywhere else the host comes off a
// documented call, because it is `<daprPort>` and carries no fact the path
// does not. Here the two hosts ARE the fact: the python app POSTs to
// `localhost:3500`, its own sidecar, and what reaches the Node.js app comes
// from `10.0.0.2:8000`, the address mDNS just resolved. Step 3 says "using
// the location it just received", and with both hosts off, the picture no
// longer shows a location being received or used.
//
// Where this departs from the source image, and why:
//   - the apps are solid hexagons in the palette's order rather than grey
//     boxes carrying the Python and Node.js logos. An app in this set is a
//     hexagon; a hexagon with a brand mark in it is markHex(), which means a
//     container running something else, and that is not what these are. The
//     names say which language each is, which is what the logos were for.
//   - mDNS is a BOX under the sidecar, not a sky hexagon. A hexagon here is an
//     app or a sidecar; the source's own colour choice makes its name
//     resolution component look like a third app.
//   - the two calls are httpCard()s. Each carries a request BODY - the page's
//     own `{"orderid":"123","data":"item1"}` - which is what a card's body
//     is for; the secrets pictures carry none because their calls send none.

import { APP, C } from '../engine.mjs';
import {
  arrow, box, captionReach, group, hex, hexHalfWidth, httpCard, label, region, stepMark, STEP_R,
} from '../shapes.mjs';
import { markHex } from '../icons.mjs';
import {
  APP_R, EDGE, NAME, SIDE_R, TEXT, V_EDGE, hop, spineReach,
} from '../invocation-row.mjs';
import { NAME_DY } from '../services.mjs';

const PAD = 26;

// ---- the two calls, which are the widest things in the picture --------------
// So they set the horizontal: the row is spread until the two cards clear each
// other, rather than the cards being squeezed under a row laid out without
// them. Measured on the rendered page at 13 in the code face.
const CARD_H = 112;
const CARD_GAP = 28;
const CALL_A = {
  url: [
    { text: 'http://localhost:3500/v1.0/' },
    { text: 'invoke', color: C.orange, weight: 700 },
    { text: '/nodeapp/method/neworder' },
  ],
  w: 492,
};
// The BODY is the widest line on this one, not the url: both cards carry the
// same payload and the right card's address is shorter than the left's.
const CALL_B = { url: 'http://10.0.0.2:8000/neworder', w: 298 };
const BODY = '{"orderid":"123","data":"item1"}';

// ---- the band above the row -------------------------------------------------
// mDNS stands ABOVE the sidecar that asks it, and the calls go BELOW the row.
// That is the order the numbers travel in: the reader meets 1 coming out of
// the app, 2 going UP to the component that answers it, then 3 and 4 carrying
// on across the row. With mDNS underneath, step 2 doubled back under the
// drawing before 3 resumed above it. It also puts this page's picture the same
// way up as `service-invocation-overview` directly above it, which has had
// name resolution over the row and the call under it all along.
// (Maintainer's call, 2026-11-03.)
const MDNS = { w: 210, h: 48 };
// How far the band's lowest ink stands above the sidecars, matching the
// overview's own riser so the two pictures breathe the same.
const RISE = 72;

// ---- the row ----------------------------------------------------------------
const PAIR_GAP = 104;

const REGION_Y = Math.round(V_EDGE + captionReach());
const MDNS_Y = REGION_Y + PAD + MDNS.h / 2;
const ROW_Y = Math.round(MDNS_Y + MDNS.h / 2 + RISE + SIDE_R);

const ROW_LEFT = EDGE + PAD;
const APP_A = { x: ROW_LEFT + hexHalfWidth(APP_R), y: ROW_Y, r: APP_R, hex: true };
const SIDE_A = {
  x: APP_A.x + hexHalfWidth(APP_R) + PAIR_GAP + hexHalfWidth(SIDE_R),
  y: ROW_Y, r: SIDE_R, hex: true,
};

// Each card is centred on the pair whose call it carries, so where the cards
// sit is a consequence of where the shapes sit - which means the gap between
// the sidecars is the only thing that can keep the two cards apart.
const pairMid = (a, b) => (a.x - hexHalfWidth(a.r) + b.x + hexHalfWidth(b.r)) / 2;
const CALL_A_X = Math.max(ROW_LEFT + CALL_A.w / 2, pairMid(APP_A, SIDE_A));
// Where the right card's own centre falls relative to its sidecar, which does
// not depend on the gap: half of the pair it is centred on.
const CARD_B_OFF = (PAIR_GAP + 2 * hexHalfWidth(APP_R)) / 2;

// THE GAP BETWEEN THE SIDECARS IS DERIVED from the cards above it, not
// chosen. The left card carries a 56-character URL and is half as wide again
// as the pair it belongs to, so it reaches well past its own sidecar; chosen
// at 168 the two cards overlapped and the left URL was drawn UNDER the right
// card, which no test could see because both labels existed, were the right
// size and were inside the canvas. Derived, the cards cannot close on each
// other again when one of these URLs changes length.
const MID_NATURAL = 168;
const MID_GAP = Math.max(
  MID_NATURAL,
  CALL_A_X + CALL_A.w / 2 + CARD_GAP + CALL_B.w / 2 - CARD_B_OFF
    - SIDE_A.x - 2 * hexHalfWidth(SIDE_R),
);

const SIDE_B = {
  x: SIDE_A.x + hexHalfWidth(SIDE_R) + MID_GAP + hexHalfWidth(SIDE_R),
  y: ROW_Y, r: SIDE_R, hex: true,
};
const APP_B = {
  x: SIDE_B.x + hexHalfWidth(SIDE_R) + PAIR_GAP + hexHalfWidth(APP_R),
  y: ROW_Y, r: APP_R, hex: true,
};

const NAME_Y = ROW_Y + SIDE_R * NAME_DY;

// ---- the two calls, under the pairs that carry them -------------------------
// Clear of the sidecars' NAMES rather than of the sidecars: the name is the
// lowest ink on the row.
const CARD_Y = NAME_Y + 34 + CARD_H / 2;
const CALL_B_X = pairMid(SIDE_B, APP_B);

const REGION_W = APP_B.x + hexHalfWidth(APP_R) + PAD - EDGE;
const REGION_H = CARD_Y + CARD_H / 2 + PAD - REGION_Y;

const W = Math.ceil(EDGE + REGION_W + EDGE);
const H = Math.ceil(REGION_Y + REGION_H + V_EDGE);

export default {
  width: W,
  height: H,
  title: 'A Python app invoking a Node.js app on one machine, with the calls and addresses shown',
  desc:
    'A dashed region captioned Local machine holds everything. Inside it, four '
    + 'shapes in a row: a green hexagon named pythonapp, a hexagon carrying the '
    + 'Dapr logo, a second such hexagon, and a blue hexagon named nodeapp. The '
    + 'request runs left to right along the top, numbered one, three and four; '
    + 'the response runs back along the bottom, numbered five, six and seven. '
    + 'A line numbered two drops from the python app\'s sidecar to a box named '
    + 'mDNS name resolution component standing above the row. Below the row are '
    + 'two cards. The left '
    + 'one is the call the python app makes: POST to '
    + 'http://localhost:3500/v1.0/invoke/nodeapp/method/neworder carrying the '
    + 'body {"orderid":"123","data":"item1"}. The right one is what reaches the '
    + 'Node.js app: POST to http://10.0.0.2:8000/neworder, the address mDNS '
    + 'resolved, carrying the same body.',

  build() {
    return [
      region({
        x: EDGE, y: REGION_Y, w: REGION_W, h: REGION_H,
        stroke: C.caption, caption: 'Local machine', captionW: 124, captionSize: TEXT,
      }),

      // ---- the request, and the response back -----------------------------
      hop({ a: APP_A, b: SIDE_A, rowY: ROW_Y, step: 1 }),
      hop({ a: SIDE_A, b: SIDE_B, rowY: ROW_Y, step: 3 }),
      hop({ a: SIDE_B, b: APP_B, rowY: ROW_Y, step: 4 }),
      hop({ a: APP_B, b: SIDE_B, rowY: ROW_Y, step: 5, dir: 'back' }),
      hop({ a: SIDE_B, b: SIDE_A, rowY: ROW_Y, step: 6, dir: 'back' }),
      hop({ a: SIDE_A, b: APP_A, rowY: ROW_Y, step: 7, dir: 'back' }),

      // ---- step 2 rises to the component that resolves nodeapp ------------
      // Its disc sits beside the run, not on it: a disc centred on a vertical
      // line cuts the line in two, and this hop has no horizontal stretch for
      // a number to sit over.
      arrow({
        from: [SIDE_A.x, ROW_Y - SIDE_R - 2],
        to: [SIDE_A.x, MDNS_Y + MDNS.h / 2 + 2],
      }),
      stepMark({
        x: SIDE_A.x - STEP_R - 12,
        y: (ROW_Y - SIDE_R + MDNS_Y + MDNS.h / 2) / 2,
        step: 2,
      }),

      // ---- the shapes, over the lines that reach them ---------------------
      hex({ x: APP_A.x, y: ROW_Y, r: APP_R, label: 'pythonapp', size: NAME, ...APP[0] }),
      [SIDE_A, SIDE_B].map((s) => markHex({
        x: s.x, y: s.y, r: s.r, mark: 'logo-blue', stroke: C.blue,
      })),
      // No halo: with mDNS over the row, the run to it leaves the sidecar's
      // TOP and nothing crosses this name any more.
      label({ x: SIDE_A.x, y: NAME_Y, text: 'Dapr sidecar', size: TEXT }),
      label({ x: SIDE_B.x, y: NAME_Y, text: 'Dapr sidecar', size: TEXT }),
      hex({ x: APP_B.x, y: ROW_Y, r: APP_R, label: 'nodeapp', size: NAME, ...APP[1] }),
      box({
        x: SIDE_A.x, y: MDNS_Y, w: MDNS.w, h: MDNS.h,
        label: 'mDNS name resolution\ncomponent', size: TEXT,
        stroke: C.blue, fill: C.blueFill,
      }),

      // ---- the two calls ---------------------------------------------------
      group([
        httpCard({
          x: CALL_A_X, y: CARD_Y, w: CALL_A.w, h: CARD_H,
          method: 'POST', url: CALL_A.url, body: BODY, size: TEXT,
        }),
        httpCard({
          x: CALL_B_X, y: CARD_Y, w: CALL_B.w, h: CARD_H,
          method: 'POST', url: CALL_B.url, body: BODY, size: TEXT,
        }),
      ]),
    ];
  },
};
