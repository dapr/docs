// Eight security capabilities on one application.
//
// Replaces security-overview-capabilities-example.png on
// concepts/security-concept.md ("Security capabilities example").
//
// The eight NUMBERS are the diagram's job. Each one is an item in the
// numbered list under it on the page, so the picture is read by finding a
// number in it and the prose by finding the same number in the list. They are
// drawn as one kind of mark - navy, bold, to the left of the words they
// introduce - so that no number reads as part of a label.
//
// Fact-check, against the eight items in that list:
//   1. API token authentication is between the reverse proxy and ITS sidecar,
//      so the mark sits on that pair rather than on a line between apps.
//   2. mTLS and a service access policy are between the reverse proxy and
//      App A.
//   3. App B takes a pub/sub topic access policy on what App A publishes.
//   4. The Redis component's own scoping policy lets only App B call it.
//   5. App B's sidecar is restricted to the pub/sub, state and secrets APIs.
//   6. A secrets policy restricts which secrets App B can read.
//   7. App B is in its own namespace, and the store is in another, which is
//      why the namespaces are drawn and named.
//   8. The data in the store is encrypted at rest.
//
// THE TWO CALLS RUN AT SIDECAR HEIGHT, straight, sidecar edge to sidecar
// edge. That height is the whole reason `appSidecar` drops the sidecar a
// clearance below its app's lowest point: a line along it passes UNDER an app
// hexagon rather than through it, so a call can reach the sidecar of a pair it
// has to get past. Each label rides above its line and carries a halo,
// because the line crosses two dashed namespace borders on the way and the
// words would otherwise be read through them.
//
// Where this departs from the source image, and why:
//   - the reverse proxy is an APP with a Dapr sidecar, drawn the way every
//     other workload in this set is drawn. The source draws a loose Dapr
//     hexagon with NGINX and Traefik logos under it, which says the capability
//     needs those products; the page says "reverse proxy" and nothing more.
//     Two brand marks are not vendored to make that point.
//   - the control plane services carry their names and no role lines. Nothing
//     in the eight items refers to them: they are here because they are in the
//     cluster, so they are drawn small and quiet.
//   - the store carries no Redis mark. The component is Redis in the prose,
//     the namespace says so, and a brand mark inside the cylinder adds a
//     product logo to a drawing about policies.
//   - the cluster carries its name and no Kubernetes mark. The name sits on
//     the border, which is where a region's name goes in this set, and a mark
//     cannot: it would sit ON a dashed line.

import { APP, C } from '../engine.mjs';
import {
  arrow, cylinder, elbowArrow, group, hexHalfWidth, label, pod, region, secureLock,
} from '../shapes.mjs';
import { icon, plate } from '../icons.mjs';
import { serviceHex } from '../services.mjs';
import { appSidecar, appSidecarCentre, sidecarAt } from '../app.mjs';

const W = 1240;
const H = 664;

const TEXT = 13;
const SMALL = 12;
const NUM = 15;

// ---- the frame --------------------------------------------------------------
// The globe stands OUTSIDE the cluster: the request it sends is the one thing
// in the picture that starts somewhere else.
const GLOBE = { x: 80, size: 50 };
const CLUSTER = { x: 150, y: 24, w: 1066, h: 616 };
const INNER_L = CLUSTER.x + 32;
const INNER_R = CLUSTER.x + CLUSTER.w - 32;

// ---- the control plane, one pod each ----------------------------------------
const SERVICE_R = 30;
const CP = { x: INNER_L, y: 72, w: 818, h: 200 };
const CP_POD = { w: 140, h: 116 };
const CP_GAP = 24;
const CP_PITCH = CP_POD.w + CP_GAP;
const CP_ROW_W = 5 * CP_POD.w + 4 * CP_GAP;
const CP_X0 = CP.x + (CP.w - CP_ROW_W) / 2 + CP_POD.w / 2;
const CP_CY = 158;
const CONTROL_PLANE = ['placement', 'injector', 'sentry', 'operator', 'scheduler'];

// ---- the store, in a namespace of its own -----------------------------------
const STORE_NS = { x: CP.x + CP.w + 24, y: CP.y, w: INNER_R - (CP.x + CP.w + 24), h: CP.h };
const STORE = { x: STORE_NS.x + STORE_NS.w / 2, y: 152, w: 92 };

// ---- the three workloads ----------------------------------------------------
const NS_Y = 320;
const NS_H = 284;
const APP_R = 44;
const APP_SIZE = 15;
const PAIR_Y = 420;

const NS = {
  proxy: { x: INNER_L, w: 300, caption: 'namespace: default' },
  a: { x: INNER_L + 324, w: 290, caption: 'namespace: A' },
  b: { x: INNER_L + 638, w: INNER_R - (INNER_L + 638), caption: 'namespace: B' },
};

const pairAt = (ns, dx = 0) => {
  const at = appSidecarCentre({ x: ns.x + ns.w / 2 + dx, y: PAIR_Y, r: APP_R, size: APP_SIZE });
  return { ...at, side: sidecarAt({ x: at.x, y: at.y, r: APP_R, size: APP_SIZE }) };
};
const PROXY = pairAt(NS.proxy);
const APP_A = pairAt(NS.a);
const APP_B = pairAt(NS.b, -70);
const SIDE_HALF = hexHalfWidth(PROXY.side.r);
const sideR = (p) => +(p.side.x + SIDE_HALF).toFixed(2);
const sideL = (p) => +(p.side.x - SIDE_HALF).toFixed(2);
const appLeft = (p) => +(p.x - hexHalfWidth(APP_R)).toFixed(2);

// The height both calls run at, and the band above each line that is clear of
// the app hexagon the line passes under.
const CALL_Y = PROXY.side.y;

// ---- the marks the list numbers ---------------------------------------------
const SECRETS = { x: APP_B.side.x, y: 540, size: 32 };
const STORE_RUN_X = NS.b.x + NS.b.w - 26;

/**
 * A numbered note. The number is the whole point of this diagram, so it is
 * one mark everywhere: navy, bold, right-aligned at `x`, level with the FIRST
 * line of the words it introduces rather than with the middle of them.
 *
 * `halo` is for a note that sits over a line or a dashed border, which two of
 * them do: without it the border is read straight through the words.
 */
function numbered({ x, y, n, text, size = TEXT, halo = false }) {
  const lines = String(text).split('\n').length;
  const lh = size * 1.2;
  return group([
    label({
      x, y: y - ((lines - 1) * lh) / 2, text: String(n),
      size: NUM, weight: 700, color: C.navy, anchor: 'end', halo,
    }),
    label({ x: x + 11, y, text, size, anchor: 'start', halo }),
  ]);
}

export default {
  width: W,
  height: H,
  title: 'Eight Dapr security capabilities protecting one application',
  desc:
    'A Kubernetes cluster holds the Dapr control plane along its top, each service in its own pod in the dapr-system namespace, and a state store in a redis namespace beside them, marked 8 because its data is encrypted at rest. Below are three namespaces. In namespace default a reverse proxy runs beside a Dapr sidecar, reached over SSL by a globe outside the cluster, and marked 1 for API token authentication between the app and its sidecar. In namespace A, App A runs beside a sidecar; the line reaching its sidecar from the reverse proxy is marked 2 for a service access policy and carries a shield and padlock for mTLS. In namespace B, App B runs beside a sidecar; the line reaching its sidecar from App A is marked 3 for a pub/sub topic access policy. From App B a run reaches the state store, marked 4 for a component scope policy, and an arrow runs straight down to a key marked 7 for secrets. Beside App B, 5 marks an API access policy and 6 a secret access policy.',

  build() {
    return [
      // ---- the cluster, and what is outside it ----------------------------
      // The cluster names itself on its own border, which is where a region's
      // name goes in this set.
      region({
        x: CLUSTER.x, y: CLUSTER.y, w: CLUSTER.w, h: CLUSTER.h, stroke: C.navy, r: 10,
        caption: 'Kubernetes', captionW: 104, captionX: INNER_R - 68, captionH: 26, captionSize: TEXT,
      }),

      icon({ name: 'fluent-globe', x: GLOBE.x, y: PROXY.y, size: GLOBE.size, color: C.blue }),
      arrow({ from: [GLOBE.x + GLOBE.size / 2 + 2, PROXY.y], to: [appLeft(PROXY) - 2, PROXY.y] }),
      arrow({ from: [appLeft(PROXY) - 2, PROXY.y], to: [GLOBE.x + GLOBE.size / 2 + 2, PROXY.y] }),
      // Over the cluster's own border, so it needs the halo.
      label({ x: (GLOBE.x + appLeft(PROXY)) / 2, y: PROXY.y - 20, text: 'SSL', size: TEXT, halo: true }),

      // ---- the control plane ----------------------------------------------
      region({
        x: CP.x, y: CP.y, w: CP.w, h: CP.h, stroke: C.caption,
        caption: 'Dapr control plane', captionW: 164, captionH: 26, captionSize: TEXT,
      }),
      CONTROL_PLANE.map((key, i) => {
        const x = CP_X0 + i * CP_PITCH;
        return group([
          pod({ x: x - CP_POD.w / 2, y: CP_CY - 52, w: CP_POD.w, h: CP_POD.h, captionW: 46, size: SMALL }),
          serviceHex({ key, x, y: CP_CY, r: SERVICE_R }),
        ]);
      }),
      label({ x: CP.x + CP.w / 2, y: CP.y + CP.h - 24, text: 'namespace: dapr-system', size: SMALL, color: C.caption }),

      // ---- the store -------------------------------------------------------
      region({
        x: STORE_NS.x, y: STORE_NS.y, w: STORE_NS.w, h: STORE_NS.h, stroke: C.caption,
        caption: 'namespace: redis', captionW: 130, captionH: 26, captionSize: SMALL,
      }),
      cylinder({ x: STORE.x, y: STORE.y, w: STORE.w, label: 'State store\n(encrypted)', size: SMALL }),
      label({ x: STORE.x - STORE.w / 2 - 12, y: STORE.y, text: '8', size: NUM, weight: 700, color: C.navy, anchor: 'end' }),
      // The component behind the store, under it and unnamed: the namespace
      // on the border above already says which one it is.
      icon({ name: 'redis', x: STORE.x, y: 234, size: 34, color: C.navy }),

      // ---- the three workloads ---------------------------------------------
      ...Object.values(NS).map((ns) => region({
        x: ns.x, y: NS_Y, w: ns.w, h: NS_H, stroke: C.caption,
        caption: ns.caption, captionW: ns.caption.length * 6.4 + 22, captionH: 26, captionSize: SMALL,
      })),
      appSidecar({ x: PROXY.x, y: PROXY.y, r: APP_R, size: APP_SIZE, label: 'Reverse\nproxy', ...APP[3] }),
      appSidecar({ x: APP_A.x, y: APP_A.y, r: APP_R, size: APP_SIZE, label: 'App A', ...APP[0] }),
      appSidecar({ x: APP_B.x, y: APP_B.y, r: APP_R, size: APP_SIZE, label: 'App B', ...APP[1] }),

      // 1 - between the proxy and its OWN sidecar, which is what the token
      // authenticates.
      // Directly under the pair, centred on it: the token is between THIS
      // app and THIS sidecar, not between anything and anything else.
      numbered({ x: 285, y: 516, n: 1, text: 'API token\nauthentication' }),

      // ---- 2, the call the proxy makes -------------------------------------
      // Straight, at sidecar height, under App A's hexagon and into the left
      // edge of its sidecar.
      arrow({ from: [sideR(PROXY) + 2, CALL_Y], to: [sideL(APP_A) - 2, CALL_Y] }),
      numbered({ x: 415, y: CALL_Y - 26, n: 2, text: 'Service access policy', halo: true }),
      // The lock goes UNDER the line it marks: above it, between the two pairs,
      // is where the words go.
      plate({ x: 496, y: CALL_Y + 34, w: 28 * 0.8 + 14, h: 28 + 14, fill: C.bg }),
      secureLock({ x: 496, y: CALL_Y + 34, size: 28 }),
      label({ x: 496, y: CALL_Y + 58, text: 'mTLS', size: SMALL, halo: true }),

      // ---- 3, what App A publishes -----------------------------------------
      arrow({ from: [sideR(APP_A) + 2, CALL_Y], to: [sideL(APP_B) - 2, CALL_Y] }),
      numbered({ x: 745, y: CALL_Y - 34, n: 3, text: 'Pub/Sub topic\naccess policy', halo: true }),

      // ---- 4, what may call the store --------------------------------------
      elbowArrow({
        points: [[sideR(APP_B), APP_B.side.y], [STORE_RUN_X, APP_B.side.y],
          [STORE_RUN_X, STORE_NS.y + STORE_NS.h + 2]],
      }),
      numbered({ x: STORE_RUN_X - 100, y: 296, n: 4, text: 'Component\nscope policy', size: SMALL }),

      // ---- 5 and 6, what the sidecar will do for App B ----------------------
      // Under the run that leaves the same sidecar, close enough to read as
      // belonging to it: both are restrictions on what that sidecar will do.
      numbered({ x: NS.b.x + 210, y: 480, n: 5, text: 'API access policy' }),
      numbered({ x: NS.b.x + 210, y: 512, n: 6, text: 'Secret access policy' }),

      // ---- 7, the secrets it may read --------------------------------------
      // Straight down out of the sidecar's bottom node.
      arrow({
        from: [APP_B.side.x, APP_B.side.y + APP_B.side.r + 2],
        to: [SECRETS.x, SECRETS.y - SECRETS.size / 2 - 4],
      }),
      icon({ name: 'fluent-key', x: SECRETS.x, y: SECRETS.y, size: SECRETS.size, color: C.navy }),
      numbered({ x: SECRETS.x - 22, y: SECRETS.y + 34, n: 7, text: 'Secrets' }),
    ];
  },
};
