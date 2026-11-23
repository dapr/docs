// THE SAME SERVICE GETTING THE SAME SECRET FROM THE BUILT-IN KUBERNETES
// SECRET STORE.
//
// Replaces /images/secrets-overview-kubernetes-store.png on
// developing-applications/building-blocks/secrets/secrets-overview.md, under
// "In the example below, the application retrieves the same secret mysecret
// from a Kubernetes secret store".
//
// The second of the page's three. Every measurement it shares with the other
// two comes from diagrams/secrets-example.mjs, because the page's closing
// claim - "the application code did not have to change to get the same
// secret" - is checked by a reader looking at all three, and three
// independently drawn pictures would quietly stop supporting it.
//
// Fact-check, against the page's own prose:
//   - "By default, Dapr enables a built-in Kubernetes secret store in
//     Kubernetes mode", which is why this one is inside a cluster and the
//     cloud-stores picture is not.
//   - the store name in the path is `kubernetes`, which is what the source
//     draws and what reference/api/secrets_api.md uses in its own Kubernetes
//     example: `curl http://localhost:3500/v1.0/secrets/kubernetes/db-secret`.
//     The secret name stays `mysecret`, as the prose says - "the SAME secret".
//
// Where this departs from the source image, and why:
//   - the store is a named MARK rather than the source's bordered box with
//     wide-tracked text. That is how this set names a specific component -
//     `components-concept` and `cryptography-overview` both draw Kubernetes
//     secrets exactly this way - and it is the same vocabulary the
//     cloud-stores picture beside it uses.
//   - no dashed area around it. A region in this set means "any of these";
//     one store needs none, and the cloud-stores picture keeps its region
//     because four alternatives is precisely what it is showing.
//   - the cluster is a captioned dashed region and the pod the house pod(),
//     rather than the source's two nested grey and white rectangles with a
//     Kubernetes logo floating at the corner. The caption says which is which.
//   - the exchange is an httpCard() under the pod, not a method and URL along
//     the line with the response floating over the app hexagon. Same ruling
//     and same card as the other two.

import { C, APP } from '../engine.mjs';
import {
  CAPTION_H, arrow, captionReach, group, hex, hexHalfWidth, httpCard, label, region,
} from '../shapes.mjs';
import { icon, markHex } from '../icons.mjs';
import {
  APP_NAME, APP_R, CARD_DY, CARD_H, CARD_W, EDGE, METHOD, NAME, PAIR_GAP,
  SIDECAR_NAME, SIDE_R, TEXT, V_EDGE, nameY, urlParts,
} from '../secrets-example.mjs';

// What a boundary leaves around what it holds.
const PAD = 28;

// THE TOP PAD IS ITS OWN NUMBER, and it is bigger than the others, because the
// thing it has to clear is not the pod but the pod's NAME. A caption pill is
// centred ON its border and reaches CAPTION_H / 2 each side, so the cluster's
// pill and the pod's pill are exactly this far apart vertically and no
// further. At PAD the two came to two units apart and read as one smudge.
// Derived from the pill rather than chosen, so it cannot drift back:
// diagrams/caption-clear.test.mjs is the check, and it found this.
const NEST_CLEAR = 14;
const PAD_TOP = CAPTION_H + NEST_CLEAR;

const STORE_MARK = 44;
const STORE_NAME = 'Kubernetes\nsecret store';
// Measured on the rendered page: the longest line is "secret store".
const STORE_NAME_W = 104;

// ---- the pod, and the pair inside it ---------------------------------------
const POD_PAD_X = 30;
const POD_TOP_PAD = 34;

const CLUSTER_Y = Math.round(V_EDGE + captionReach());
const POD_Y = CLUSTER_Y + PAD_TOP;
const ROW_Y = POD_Y + POD_TOP_PAD + APP_R;

const POD_X = EDGE + PAD;
const APP_AT = {
  x: POD_X + POD_PAD_X + hexHalfWidth(APP_R), y: ROW_Y, r: APP_R, hex: true,
};
const SIDE = {
  x: Math.round(APP_AT.x + hexHalfWidth(APP_R) + PAIR_GAP + hexHalfWidth(SIDE_R)),
  y: ROW_Y,
  r: SIDE_R,
  hex: true,
};

const NAME_Y = nameY(ROW_Y);

// The pod reaches past the sidecar's NAME, not past the sidecar: the name is
// the lowest ink inside it.
const POD_W = SIDE.x + hexHalfWidth(SIDE_R) + POD_PAD_X - POD_X;
const POD_H = NAME_Y + TEXT + 20 - POD_Y;

// ---- the store, outside the pod and inside the cluster ----------------------
const STORE_W = Math.max(STORE_MARK, STORE_NAME_W);
const STORE_NAME_DY = STORE_MARK / 2 + 22;

// EVERY VERTICAL IS SETTLED BEFORE ANY HORIZONTAL, because the height of this
// picture does not depend on how wide it is: the pod is as tall as the pair
// inside it, the cluster as tall as the pod, and the card hangs under the
// cluster. That is what lets the one gap that carries nothing be DERIVED from
// the frame rather than chosen.
const STORE_Y = ROW_Y;
const CLUSTER_BOTTOM = Math.max(
  POD_Y + POD_H,
  STORE_Y + STORE_NAME_DY + TEXT,
) + PAD;
const CLUSTER_H = CLUSTER_BOTTOM - CLUSTER_Y;
const CARD_Y = CLUSTER_BOTTOM + CARD_DY + CARD_H / 2;
const H = Math.ceil(CARD_Y + CARD_H / 2 + V_EDGE);

// THE GAP BETWEEN THE POD AND THE STORE. It used to be derived from the 16:9
// floor, which made it 236 units - a run of empty line two thirds the width of
// the pod, and the maintainer rejected it on sight (2026-11-03). It is now
// what the drawing wants: about what the app and its sidecar leave between
// them, so the two runs in this picture are the same kind of length.
//
// THE COST IS THE FRAME, and it is recorded rather than hidden. A pod inside a
// cluster with a store beside it and the call beneath is naturally about 3:2;
// the only way to reach 16:9 is to put that empty line back. The scene is in
// EXCEPTIONS in diagrams/aspect.test.mjs with this reason.
const GAP = 56;

const STORE_X = POD_X + POD_W + GAP + STORE_W / 2;
const STORE_NAME_Y = STORE_Y + STORE_NAME_DY;
const CLUSTER_W = STORE_X + STORE_W / 2 + PAD - EDGE;

// ---- the exchange, under the pod it belongs to ------------------------------
const CARD_MID = Math.max(EDGE + CARD_W / 2, POD_X + POD_W / 2);

const W = Math.ceil(Math.max(EDGE + CLUSTER_W, CARD_MID + CARD_W / 2) + EDGE);

export default {
  width: W,
  height: H,
  title: 'A service in a Kubernetes pod getting a secret from the built-in Kubernetes secret store',
  desc:
    'A dashed region captioned Kubernetes cluster. Inside it on the left, a '
    + 'dashed pod holds a green hexagon named App joined by a line with '
    + 'a head at each end to a hexagon carrying the Dapr logo, named Dapr '
    + 'sidecar. To the right of the pod, still inside the cluster, is the '
    + 'Kubernetes mark named Kubernetes secret store, joined to the sidecar by '
    + 'another line with a head at each end. Below the cluster is a card '
    + 'holding the exchange: GET over the path '
    + '/v1.0/secrets/kubernetes/mysecret, and under it the value that comes '
    + 'back, mysecret "supersecret".',

  build() {
    return [
      // ---- the boundaries, drawn first so everything sits on them ---------
      region({
        x: EDGE, y: CLUSTER_Y, w: CLUSTER_W, h: CLUSTER_H,
        stroke: C.navy, caption: 'Kubernetes cluster', captionW: 150, captionSize: TEXT,
      }),

      // ---- the service asks its sidecar, and is answered ------------------
      arrow({ from: APP_AT, to: SIDE }),
      arrow({ from: SIDE, to: APP_AT }),

      // ---- and the sidecar reaches the store outside the pod --------------
      arrow({ from: SIDE, to: [STORE_X - STORE_MARK / 2 - 4, STORE_Y] }),
      arrow({ from: [STORE_X - STORE_MARK / 2 - 4, STORE_Y], to: SIDE }),

      // ---- the shapes, over the lines that reach them ---------------------
      region({
        x: POD_X, y: POD_Y, w: POD_W, h: POD_H,
        stroke: C.blue, r: 8, caption: 'Pod', captionW: 56, captionSize: TEXT,
      }),
      hex({ x: APP_AT.x, y: APP_AT.y, r: APP_R, label: APP_NAME, size: NAME, ...APP[0] }),
      group({
        class: 'd-named-mark',
        children: [
          markHex({ x: SIDE.x, y: SIDE.y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
          label({ x: SIDE.x, y: NAME_Y, text: SIDECAR_NAME, size: NAME }),
        ],
      }),
      group({
        class: 'd-named-mark',
        children: [
          icon({
            name: 'kubernetes-secret', x: STORE_X, y: STORE_Y,
            size: STORE_MARK, fit: 'ink',
          }),
          label({ x: STORE_X, y: STORE_NAME_Y, text: STORE_NAME, size: TEXT }),
        ],
      }),

      // ---- the exchange the page documents --------------------------------
      httpCard({
        x: CARD_MID, y: CARD_Y, w: CARD_W, h: CARD_H,
        method: METHOD, url: urlParts('kubernetes'), size: TEXT,
      }),
    ];
  },
};
