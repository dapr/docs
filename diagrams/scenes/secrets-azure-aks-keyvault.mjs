// THE SAME SERVICE GETTING THE SAME SECRET FROM AZURE KEY VAULT, with the
// sidecar authenticating as the pod rather than with a credential of its own.
//
// Replaces /images/secrets-overview-azure-aks-keyvault.png on
// developing-applications/building-blocks/secrets/secrets-overview.md, under
// "In Azure, you can configure Dapr to retrieve secrets using managed
// identities to authenticate with Azure Key Vault".
//
// The third of the page's three, sharing every measurement with the other two
// through diagrams/secrets-example.mjs. The page's closing claim - "the
// application code did not have to change to get the same secret" - is what a
// reader checks by looking across all three, so the call, the response, the
// app and the sidecar are identical in each.
//
// Fact-check, against the page's own numbered prose:
//   1. "An Azure Kubernetes Service (AKS) cluster is configured to use managed
//      identities" - which is why the cluster here is named AKS and the plain
//      Kubernetes picture before it is not.
//   2. "Dapr uses pod identities to retrieve secrets from Azure Key Vault on
//      behalf of the application" - so the identity belongs to the POD and the
//      sidecar uses it. It is drawn inside the pod for that reason, and the
//      line to Key Vault leaves from the sidecar, which is the thing doing the
//      retrieving.
//   - the store is still named `vault` in the path, as the source draws it.
//     That is the COMPONENT's name, not the product's: a secret store called
//     `vault` here happens to be Azure Key Vault, exactly as the cloud-stores
//     picture's `vault` happens to be whichever of four is configured. That
//     is the page's whole point, and it is why the path does not change.
//
// Where this departs from the source image, and why:
//   - Key Vault is a named MARK rather than a bordered box with the caption
//     "Cloud Secret Store" beside it. Same vocabulary as the other two, and
//     the layout already says it is outside the cluster.
//   - the cluster and the pod are the house region() and pod(), not nested
//     grey and white rectangles with a Kubernetes logo at the corner.
//   - the exchange is the same httpCard() under the cluster.
//   - Service A takes APP[0], as in the other two.

import { C, APP } from '../engine.mjs';
import {
  CAPTION_H, arrow, box, captionReach, group, hex, hexHalfWidth, httpCard, label, region,
} from '../shapes.mjs';
import { icon, markHex } from '../icons.mjs';
import {
  APP_NAME, APP_R, CARD_DY, CARD_H, CARD_W, EDGE, METHOD, NAME, PAIR_GAP,
  SIDECAR_NAME, SIDE_R, TEXT, V_EDGE, nameY, urlParts,
} from '../secrets-example.mjs';

const PAD = 28;
// Bigger than the others, and derived from the pill rather than chosen: a
// caption pill is centred ON its border and reaches CAPTION_H / 2 each side,
// so this is exactly how far the cluster's name and the pod's name stand
// apart. At PAD they were two units apart. diagrams/caption-clear.test.mjs is
// the check, and it found this.
const NEST_CLEAR = 14;
const PAD_TOP = CAPTION_H + NEST_CLEAR;
const POD_PAD_X = 30;
const POD_TOP_PAD = 34;

const STORE_MARK = 44;
const STORE_NAME = 'Azure\nKey Vault';
// Measured on the rendered page: "Key Vault" is the longer line.
const STORE_NAME_W = 59.4;
const STORE_W = Math.max(STORE_MARK, STORE_NAME_W);
const STORE_NAME_DY = STORE_MARK / 2 + 22;

// The identity the sidecar authenticates as. It belongs to the pod, so it is
// drawn inside it, under the sidecar that uses it.
const ID_W = 182;
const ID_H = 32;
const ID_DY = 50;

// ---- every vertical first, so the one slack horizontal can be derived -------
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
const ID_Y = NAME_Y + ID_DY;
const ID = { x: SIDE.x, y: ID_Y, w: ID_W, h: ID_H };

const POD_H = ID_Y + ID_H / 2 + 20 - POD_Y;
const CLUSTER_BOTTOM = POD_Y + POD_H + PAD;
const CLUSTER_H = CLUSTER_BOTTOM - CLUSTER_Y;
const CARD_Y = CLUSTER_BOTTOM + CARD_DY + CARD_H / 2;
const H = Math.ceil(CARD_Y + CARD_H / 2 + V_EDGE);

// The pod has to hold the identity box as well as the pair, so it is wider
// here than in the Kubernetes picture.
const POD_W = Math.max(
  SIDE.x + hexHalfWidth(SIDE_R) + POD_PAD_X,
  ID.x + ID_W / 2 + POD_PAD_X,
) - POD_X;

// THE GAP BETWEEN THE CLUSTER AND KEY VAULT. It used to be derived from the
// 16:9 floor, which stranded the vault 300 units off the cluster's edge; the
// maintainer rejected it on sight (2026-11-03). It is now what the drawing
// wants - a little more than the pod leaves inside the cluster, because this
// run crosses a boundary and should look like it does.
//
// THE COST IS THE FRAME, recorded rather than hidden: this picture is
// naturally about 3:2, and the only way to 16:9 is to put that empty line
// back. The scene is in EXCEPTIONS in diagrams/aspect.test.mjs with the
// reason.
const CLUSTER_W = POD_X + POD_W + PAD - EDGE;
const GAP = 70;

const STORE_X = EDGE + CLUSTER_W + GAP + STORE_W / 2;
const STORE_Y = ROW_Y;
const STORE_NAME_Y = STORE_Y + STORE_NAME_DY;

const CARD_MID = Math.max(EDGE + CARD_W / 2, POD_X + POD_W / 2);
const W = Math.ceil(Math.max(STORE_X + STORE_W / 2, CARD_MID + CARD_W / 2) + EDGE);

export default {
  width: W,
  height: H,
  title: 'A service in an AKS pod getting a secret from Azure Key Vault using a pod managed identity',
  desc:
    'A dashed region captioned AKS cluster. Inside it, a dashed pod holds a '
    + 'green hexagon named App joined by a line with a head at each end '
    + 'to a hexagon carrying the Dapr logo, named Dapr sidecar. Under the '
    + 'sidecar, still inside the pod, is a box named Pod managed identity, '
    + 'joined to the sidecar. Outside the cluster on the right is the Azure '
    + 'Key Vault mark, named Azure Key Vault, joined to the sidecar by a line '
    + 'with a head at each end. Below the cluster is a card holding the '
    + 'exchange: GET over the path /v1.0/secrets/vault/mysecret, and under it '
    + 'the value that comes back, mysecret "supersecret".',

  build() {
    return [
      region({
        x: EDGE, y: CLUSTER_Y, w: CLUSTER_W, h: CLUSTER_H,
        stroke: C.navy, caption: 'AKS cluster', captionW: 110, captionSize: TEXT,
      }),

      // ---- the service asks its sidecar, and is answered ------------------
      arrow({ from: APP_AT, to: SIDE }),
      arrow({ from: SIDE, to: APP_AT }),

      // ---- the sidecar authenticates as the pod ---------------------------
      arrow({ from: SIDE, to: ID }),
      arrow({ from: ID, to: SIDE }),

      // ---- and reaches Key Vault outside the cluster ----------------------
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
          // HALOED, and it is the only one of the three that needs to be: this
          // is the scene where a line runs down from the sidecar to the identity
          // under it, and the name sits in its path. The halo is the page's own
          // ground painted behind the glyphs, so the run stops at the word and
          // picks up after it instead of striking through it. `paints ground
          // behind any label a line crosses` in tests/diagrams.spec.js checks it.
          label({ x: SIDE.x, y: NAME_Y, text: SIDECAR_NAME, size: NAME, halo: true }),
        ],
      }),
      box({
        x: ID.x, y: ID.y, w: ID_W, h: ID_H,
        label: 'Pod managed identity', size: TEXT,
        stroke: C.blue, fill: C.blueFill,
      }),
      group({
        class: 'd-named-mark',
        children: [
          icon({
            name: 'azure-key-vault', x: STORE_X, y: STORE_Y,
            size: STORE_MARK, fit: 'ink',
          }),
          label({ x: STORE_X, y: STORE_NAME_Y, text: STORE_NAME, size: TEXT }),
        ],
      }),

      // ---- the exchange the page documents --------------------------------
      httpCard({
        x: CARD_MID, y: CARD_Y, w: CARD_W, h: CARD_H,
        method: METHOD, url: urlParts('vault'), size: TEXT,
      }),
    ];
  },
};
