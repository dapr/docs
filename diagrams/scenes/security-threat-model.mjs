// The Dapr threat model: the trust boundaries, and every flow that crosses
// one.
//
// Replaces security-threat-model.png on concepts/security-concept.md
// ("Threat model").
//
// NOT A REDRAW. The source is a broken draw.io export - its grid is visible,
// a placeholder icon sits in every label box and beside three of the group
// titles, and "Dapr Microservice Service B" is clipped by its own boundary.
// There is nothing faithful to reproduce, so this is drawn from what the
// source MEANS: four trust boundaries and the flows between them. It needs a
// security maintainer's sign-off before it ships, because a threat model that
// is merely plausible is worse than none.
//
// THE APP AND ITS SIDECAR ARE DRAWN APART, which is the one place this set
// does that. Everywhere else they are one object, because everywhere else the
// question is what the PAIR does. Here the question is what crosses what, and
// the request and the response between an app and its sidecar are two flows
// in opposite directions: they need two arrows, and two arrows need two
// shapes with air between them.
//
// EVERY FLOW NAME IS A PLAIN LABEL beside the line it names, not a card. The
// source boxes them because draw.io boxes everything; a box here would say
// "note about the drawing", which is what callout() is for and the opposite
// of what these are. A name that crosses a line or a dashed border carries a
// halo so it stays readable through it.
//
// What it says, and what the source said:
//   - four trust boundaries: the certificate authority, each app with its own
//     sidecar, and whatever injects the trust anchors.
//   - Sentry reads the CA private key from the filesystem or a Kubernetes
//     secret.
//   - each sidecar sends a CSR over its own boundary and gets a workload
//     certificate back. Each name sits at the end its own flow ARRIVES at.
//   - the two sidecars call each other over mTLS.
//   - the app sends Dapr API requests to its sidecar and gets responses back,
//     both INSIDE the boundary: the only flows here that cross nothing.
//   - the injector reads the root certificate and injects it into both
//     sidecars.
//
// Where this leaves the source image, beyond redrawing it:
//   - "Microservice A" is App A, and the boundary around it is App A rather
//     than "Dapr Microservice Service A".
//   - App B is mirrored, so the two sidecars face each other and the line
//     between them reaches neither app.

import { APP, C } from '../engine.mjs';
import {
  arrow, elbowArrow, hex, hexHalfWidth, hexHalfWidthAt, label, lockBox, region,
} from '../shapes.mjs';
import { markHex } from '../icons.mjs';
import { serviceHex } from '../services.mjs';

const W = 1220;
const H = 696;

const TEXT = 13;
const FLOW = 12; // every flow's name, one size

// ---- the three bands, all centred on the same line ---------------------------
// The authority above and the injector below are centred on the two apps
// between them, so the picture has one axis and not three.
const GROUP_L = 140;
const GROUP_R = 1140;
const MID = (GROUP_L + GROUP_R) / 2;

// ---- the certificate authority ----------------------------------------------
const CA = { x: MID - 190, y: 64, w: 380, h: 216 };
const SERVICE_R = 30;
// Far enough below the border for the caption pill, which hangs half its
// height INTO the box and sits over this corner of it.
const STORE = { x: MID, y: CA.y + 52, size: 42 };
const SENTRY = { x: MID, y: CA.y + 146 };
const SENTRY_CORNER_Y = SENTRY.y + SERVICE_R / 2;
const SENTRY_UPPER_Y = SENTRY.y - SERVICE_R / 2;
const SENTRY_L = +(SENTRY.x - hexHalfWidth(SERVICE_R)).toFixed(2);
const SENTRY_R = +(SENTRY.x + hexHalfWidth(SERVICE_R)).toFixed(2);

// ---- the two apps, each with its own sidecar --------------------------------
const APP_R = 42;
const SIDE_R = 34;
const NS_Y = 318;
const NS_H = 180;
const ROW_Y = 408;
const APP_HALF = hexHalfWidth(APP_R);
const SIDE_HALF = hexHalfWidth(SIDE_R);
// The request rides above the line between app and sidecar and the response
// below, and the gap between the two hexagons is wide enough to set a name
// over each without either touching a shape.
const REQ_DY = 9;

const BOUND = {
  a: { x: GROUP_L, w: 400, caption: 'App A', app: 230, side: 430, fill: APP[0] },
  b: { x: 740, w: 400, caption: 'App B', app: 1050, side: 850, fill: APP[1] },
};
const A = BOUND.a;
const B = BOUND.b;

const A_SIDE_R = +(A.side + SIDE_HALF).toFixed(2);
const B_SIDE_L = +(B.side - SIDE_HALF).toFixed(2);
const CSR_OUT = 44;
const CSR_A_X = +(A_SIDE_R + CSR_OUT).toFixed(2);
const CSR_B_X = +(B_SIDE_L - CSR_OUT).toFixed(2);
const CSR_NODE_Y = ROW_Y - SIDE_R / 2;

// The certificate comes back along the SAME shape as the request that asked
// for it - out of a corner, one turn, one turn, in - running a lane above it
// the whole way. Two paths that read as a pair say "these two go together"
// louder than either could alone, which is worth more here than landing the
// head square on a node: a threat model is read as pairs of flows.
const LANE = 12;
const CERT_Y_AT_SENTRY = SENTRY_CORNER_Y - LANE;
const CERT_Y_AT_SIDE = CSR_NODE_Y - LANE;
const CERT_SIDE_HALF = +hexHalfWidthAt(SIDE_R, -(SIDE_R / 2 + LANE)).toFixed(2);

// ---- whatever injects the trust anchors -------------------------------------
const INJ = { x: MID - 120, y: 540, w: 240, h: 120 };
const INJECTOR = { x: MID, y: 590 };
const INJECT_Y = 612;
const READ_ROW = 690;
const READ_COL = 95;

const flow = ({ x, y, text, anchor = 'middle', halo = false }) =>
  label({ x, y, text, size: FLOW, anchor, halo });

/** One app, its sidecar, and the two flows between them that cross nothing. */
function workload(b) {
  const toSide = b.app < b.side; // which way the request runs
  const appEdge = +(b.app + (toSide ? APP_HALF : -APP_HALF)).toFixed(2);
  const sideEdge = +(b.side + (toSide ? -SIDE_HALF : SIDE_HALF)).toFixed(2);
  const mid = +((appEdge + sideEdge) / 2).toFixed(2);
  return [
    region({
      x: b.x, y: NS_Y, w: b.w, h: NS_H, stroke: C.caption,
      caption: b.caption, captionW: 62, captionH: 26, captionSize: TEXT,
      // App B names itself at the RIGHT end of its border: at the left end it
      // is where that sidecar's certificate request comes down.
      captionX: toSide ? undefined : b.x + b.w - 51,
    }),
    hex({ x: b.app, y: ROW_Y, r: APP_R, label: b.caption, ...b.fill }),
    markHex({ x: b.side, y: ROW_Y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
    arrow({ from: [appEdge, ROW_Y - REQ_DY], to: [sideEdge, ROW_Y - REQ_DY] }),
    arrow({ from: [sideEdge, ROW_Y + REQ_DY], to: [appEdge, ROW_Y + REQ_DY] }),
    flow({ x: mid, y: ROW_Y - REQ_DY - 17, text: 'Dapr API request' }),
    flow({ x: mid, y: ROW_Y + REQ_DY + 17, text: 'Dapr API response' }),
  ];
}

export default {
  width: W,
  height: H,
  title: 'The Dapr threat model: trust boundaries and the flows that cross them',
  desc:
    'Four trust boundaries, each a dashed region, all on one vertical axis. At the top, the certificate authority holds a filesystem or Kubernetes secret above Sentry, joined by a flow labelled CA private key. In the middle, App A and App B each hold an app hexagon and a Dapr sidecar hexagon side by side, with an arrow from the app to the sidecar labelled Dapr API request and another back labelled Dapr API response; both stay inside the boundary. From each sidecar a line rises into Sentry, labelled CSR where it reaches Sentry and workload certificate where it returns to the sidecar. The two sidecars are joined by a line labelled mTLS API calls. At the bottom, a trust anchor injector boundary holds the injector, with a line to each sidecar labelled inject root certificate, and a run round the left of the picture back to the secret, labelled read root certificate.',

  build() {
    return [
      // ---- the certificate authority ---------------------------------------
      region({
        x: CA.x, y: CA.y, w: CA.w, h: CA.h, stroke: C.caption,
        caption: 'Certificate authority', captionW: 168, captionH: 26, captionSize: TEXT,
      }),
      lockBox({ x: STORE.x, y: STORE.y, size: STORE.size }),
      label({
        x: STORE.x + STORE.size / 2 + 14, y: STORE.y, anchor: 'start',
        text: 'Filesystem or\nKubernetes secret', size: TEXT,
      }),
      serviceHex({ key: 'sentry', x: SENTRY.x, y: SENTRY.y, r: SERVICE_R }),
      arrow({
        from: [STORE.x, STORE.y + STORE.size / 2 + 2],
        to: [SENTRY.x, SENTRY.y - SERVICE_R - 2],
      }),
      flow({ x: STORE.x + 12, y: STORE.y + 47, text: 'CA private key', anchor: 'start' }),

      // ---- the two workloads ------------------------------------------------
      workload(A),
      workload(B),

      // ---- what each sidecar asks the authority for ------------------------
      // Two arrows, not one line with a head at each end: a threat model is
      // read flow by flow, and a flow has a direction. The request leaves the
      // sidecar's outer node and arrives at Sentry's lower corner; the
      // certificate leaves Sentry's upper corner and comes down into the
      // sidecar's own apex, which is free because the app stands beside it
      // rather than over it.
      elbowArrow({
        points: [[A_SIDE_R, CSR_NODE_Y], [CSR_A_X, CSR_NODE_Y],
          [CSR_A_X, SENTRY_CORNER_Y], [SENTRY_L - 2, SENTRY_CORNER_Y]],
      }),
      flow({ x: (CSR_A_X + SENTRY_L) / 2, y: SENTRY_CORNER_Y + 15, text: 'CSR' }),
      elbowArrow({
        points: [[SENTRY_L - 2, CERT_Y_AT_SENTRY], [CSR_A_X - LANE, CERT_Y_AT_SENTRY],
          [CSR_A_X - LANE, CERT_Y_AT_SIDE], [A.side + CERT_SIDE_HALF + 2, CERT_Y_AT_SIDE]],
      }),
      flow({
        x: CSR_A_X - LANE - 6, y: CERT_Y_AT_SIDE - 22, anchor: 'end',
        text: 'Workload certificate', halo: true,
      }),

      elbowArrow({
        points: [[B_SIDE_L, CSR_NODE_Y], [CSR_B_X, CSR_NODE_Y],
          [CSR_B_X, SENTRY_CORNER_Y], [SENTRY_R + 2, SENTRY_CORNER_Y]],
      }),
      flow({ x: (CSR_B_X + SENTRY_R) / 2, y: SENTRY_CORNER_Y + 15, text: 'CSR' }),
      elbowArrow({
        points: [[SENTRY_R + 2, CERT_Y_AT_SENTRY], [CSR_B_X + LANE, CERT_Y_AT_SENTRY],
          [CSR_B_X + LANE, CERT_Y_AT_SIDE], [B.side - CERT_SIDE_HALF - 2, CERT_Y_AT_SIDE]],
      }),
      flow({
        x: CSR_B_X + LANE + 6, y: CERT_Y_AT_SIDE - 22, anchor: 'start',
        text: 'Workload certificate', halo: true,
      }),

      // ---- and what they say to each other ---------------------------------
      elbowArrow({ points: [[A_SIDE_R, ROW_Y], [B_SIDE_L, ROW_Y]], heads: 'both' }),
      flow({ x: MID, y: ROW_Y - 18, text: 'mTLS API calls' }),

      // ---- the trust anchors -----------------------------------------------
      region({
        x: INJ.x, y: INJ.y, w: INJ.w, h: INJ.h, stroke: C.caption,
        caption: 'Trust anchor injector', captionW: 164, captionH: 26, captionSize: TEXT,
      }),
      // Its name sits BESIDE it, not under it, which is the one place in this
      // set that happens: the read-root-certificate run is the only flow that
      // has to leave downwards - both sides are taken by the injections - and a
      // name under the hexagon is exactly where that line goes.
      serviceHex({ key: 'injector', x: INJECTOR.x, y: INJECTOR.y, r: SERVICE_R, side: 'right' }),

      elbowArrow({
        points: [[INJECTOR.x - hexHalfWidth(SERVICE_R) - 2, INJECT_Y], [A.side, INJECT_Y],
          [A.side, ROW_Y + SIDE_R + 2]],
      }),
      flow({ x: A.side - 12, y: 519, text: 'Inject root certificate', anchor: 'end', halo: true }),
      elbowArrow({
        points: [[INJECTOR.x + hexHalfWidth(SERVICE_R) + 2, INJECT_Y], [B.side, INJECT_Y],
          [B.side, ROW_Y + SIDE_R + 2]],
      }),
      flow({ x: B.side + 12, y: 519, text: 'Inject root certificate', anchor: 'start', halo: true }),

      // Round the outside: at the store's own height the way back is through
      // both app boundaries.
      elbowArrow({
        points: [[INJECTOR.x, INJECTOR.y + SERVICE_R + 2], [INJECTOR.x, READ_ROW],
          [READ_COL, READ_ROW], [READ_COL, STORE.y], [STORE.x - STORE.size / 2 - 2, STORE.y]],
      }),
      flow({ x: READ_COL + 12, y: STORE.y + 24, text: 'Read root certificate', anchor: 'start' }),
    ];
  },
};
