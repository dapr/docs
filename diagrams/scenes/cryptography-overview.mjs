// The cryptography API: an app asks its Dapr sidecar to encrypt or decrypt,
// and the sidecar does it either inside itself or inside a managed key service
// - never handing the raw key material to the app.
//
// Replaces cryptography-overview.png on
// developing-applications/building-blocks/cryptography/
// cryptography-overview.md, under "With Dapr, you can perform cryptographic
// operations without exposing cryptographic keys to your application."
//
// DISCREPANCIES, raised and not resolved silently.
//
//   1. "ENCRYPT AND DECRYPT AI" IS A TYPO in the source, for API. Phase 1
//      flagged it as fact-check finding 2 and the drawing says API.
//   2. TWO OF THE SIX COMPONENTS ARE NOT LISTED FOR THIS BUILDING BLOCK.
//      reference/components-reference/supported-cryptography/ holds four:
//      azure-key-vault, json-web-key-sets, kubernetes-secrets and
//      local-storage. Google Key Management and AWS Secrets Manager are not
//      among them - AWS Secrets Manager is listed under
//      supported-secret-stores instead - and the page's prose says "key vaults
//      such as Azure Key Vault (with more components coming in the future)".
//
//      The source image shows them, and they are DRAWN here on the
//      maintainer's ruling of 2026-11-02, after that reading was put to them.
//      If the reference pages are the thing that is behind, this diagram is
//      right and the gap closes on its own; if they are not, the two marks
//      come out of IN_CLOUD and nothing else in this file changes.
//
// WHERE THIS DIFFERS FROM `components-concept`, which draws the same block:
//   - that scene shows FOUR cryptography components and captions itself "These
//     are examples, not the full list". This one shows six and groups them.
//   - it marks Kubernetes secrets with `kubernetes-color`, the project wheel.
//     This scene uses `kubernetes-secret`, the Secret resource icon from the
//     Kubernetes icon set, which `sentry-kubernetes` already draws: the row it
//     stands in is one of named services, and the wheel would name the cluster
//     rather than the thing in it.
//
// Where this departs from the source as a DRAWING, and why:
//   - the source splits its components into "Generic" and "Cloud". That split
//     is real and the page's prose is built on it: a managed key service
//     performs the operation itself and never releases the key, while a
//     generic component only holds the key and Dapr's own engine does the
//     work. It is kept.
//   - the source wraps the Dapr hexagon in a box carrying four lines of
//     explanation. Here the hexagon is named as every sidecar in this set is
//     and the explanation is a description under it, in the blue this set
//     gives a second reading of something it already says.
//   - the components are PLATED, all of them: four of the six marks are full
//     colour and two are single, and a row that plates some and not others
//     reads as two kinds of thing.

import { C, APP } from '../engine.mjs';
import { arrow, elbowArrow, group, hex, hexHalfWidth, label } from '../shapes.mjs';
import { logoStrip, logoStripSize, markHex } from '../icons.mjs';
import { NAME_DY as HEX_NAME_DY } from '../services.mjs';

const EDGE = 29;
const V_EDGE = 14;

const TEXT = 13;
const NAME = 17;

const APP_R = 60;
const SIDE_R = 48;

const MARK = 30;
const PAD = 26;

// The six components, in the two kinds the page's prose distinguishes.
const IN_DAPR = [
  { mark: 'fluent-key-multiple', name: 'JWKS' },
  { mark: 'kubernetes-secret', name: 'Kubernetes\nsecrets' },
  { mark: 'fluent-document-multiple', name: 'Local storage' },
];
const IN_CLOUD = [
  { mark: 'azure-key-vault', name: 'Azure\nKey Vault' },
  { mark: 'google-key-management', name: 'Google Key\nManagement' },
  { mark: 'aws-secrets-manager', name: 'AWS Secrets\nManager' },
];

// An item is as wide as the WIDEST LINE of its name, measured on the rendered
// page at 13/600 - the exporter has no font metrics. "Local storage" is 85 on
// the generic side and "Management" is 83 on the cloud side. The names wrap
// where they do for this reason: "Google Key Management" on one line is 158,
// which would make the strip half as wide again for one component's sake.
const NAME_W = { dapr: 86, cloud: 84 };
// Clear space between one item's name and the next one's. A column's pitch has
// to clear the NAME, not the mark: the plate is 48 and every name here is
// wider than that.
const AIR = 20;

const common = { markSize: MARK, size: TEXT, pad: PAD, plated: true };
// Short captions: a pill is as wide as its text, and a long one over a strip
// this size drew a caption nearly as wide as the area under it. These are the
// source's own words, with "Cloud" pluralised now that three stand there.
const DAPR_SIDE = {
  ...common, marks: IN_DAPR, caption: 'Generic', cols: 3,
  itemW: NAME_W.dapr, gapX: NAME_W.dapr + AIR,
};
const CLOUD_SIDE = {
  ...common, marks: IN_CLOUD, caption: 'Clouds', cols: 3,
  itemW: NAME_W.cloud, gapX: NAME_W.cloud + AIR,
};

const A = logoStripSize(DAPR_SIDE);
const B = logoStripSize(CLOUD_SIDE);

// The two strips sit side by side, on one baseline, with a gap between them.
const BAND_GAP = 44;
const BAND_W = A.w + BAND_GAP + B.w;
const BAND_H = Math.max(A.h, B.h);
const BAND_Y = V_EDGE + A.reach + BAND_H / 2;
const BAND_BOTTOM = BAND_Y + BAND_H / 2;

const W = Math.ceil(BAND_W + EDGE * 2);
const BAND_X = W / 2;
const A_X = BAND_X - BAND_W / 2 + A.w / 2;
const B_X = BAND_X + BAND_W / 2 - B.w / 2;

// The row of shapes sits under the band, far enough down to carry the run
// between them - a stem, a turn and a riser - and no further: the frame has a
// 16:9 floor.
const ROW_Y = Math.round(BAND_BOTTOM + 110);
const NAME_Y = ROW_Y + SIDE_R * HEX_NAME_DY;
// The description is a second reading of what the drawing already says, so it
// takes the blue this set gives one.
const DESC_Y = NAME_Y + TEXT * 2.2;

const H = Math.ceil(DESC_Y + TEXT * 2 + V_EDGE);

// THE SIDECAR STANDS UNDER THE BAND'S CENTRE, and the app is placed from it
// rather than from the canvas edge. The gap between the two carries the call's
// name, so it is sized from it: 155 units measured, plus two characters of
// clearance at each end. An earlier version put the app at the left margin and
// derived the sidecar from it; the sidecar then landed in the 44-unit gap
// BETWEEN the two strips, which is the one place a run upward can go nowhere.
const CALL_W = 155;
const SIDE = { x: BAND_X, y: ROW_Y, r: SIDE_R, hex: true };
const APP_AT = {
  x: Math.round(SIDE.x - hexHalfWidth(SIDE_R) - CALL_W - TEXT * 4 - hexHalfWidth(APP_R)),
  y: ROW_Y,
  r: APP_R,
  hex: true,
};

const CALL_MID = (APP_AT.x + hexHalfWidth(APP_R) + SIDE.x - hexHalfWidth(SIDE_R)) / 2;

// Where the two runs part company: halfway up the corridor between the
// sidecar's top point and the band's lower edge.
const RAIL_Y = Math.round((BAND_BOTTOM + (ROW_Y - SIDE_R)) / 2);
const STEM = [SIDE.x, ROW_Y - SIDE_R - 2];

// One run to each kind of component, sharing a stem. A single run to the
// generic strip would say the sidecar cannot reach a managed key service at
// all, and two runs leaving the sidecar sideways would cross the app's own
// line. Both carry a head at each end, because both answer; the two heads at
// the stem's foot are drawn at the same point and read as one.
const fan = (x) => elbowArrow({
  heads: 'both',
  points: [STEM, [SIDE.x, RAIL_Y], [x, RAIL_Y], [x, BAND_BOTTOM + 2]],
});

export default {
  width: W,
  height: H,
  title: 'An app encrypting and decrypting through Dapr without ever holding the key',
  desc:
    'Along the top, two dashed areas side by side. The left, captioned Generic, holds three marked components: JWKS, Kubernetes secrets and Local storage. The right, captioned Clouds, holds Azure Key Vault, Google Key Management and AWS Secrets Manager. Below them, a green hexagon named App with an arrow to a hexagon carrying the Dapr logo, labelled Encrypt and Decrypt API. The Dapr hexagon is named Dapr sidecar, with the line "Built-in cryptographic engine" under it, and a line with a head at each end rises from it and divides, one branch turning left and up into the generic components, the other right and up into the clouds.',

  build() {
    return [
      // ---- the app asks, and the sidecar answers --------------------------
      arrow({ from: APP_AT, to: SIDE }),
      arrow({ from: SIDE, to: APP_AT }),
      label({
        x: CALL_MID, y: ROW_Y - TEXT * 1.8,
        text: 'Encrypt and Decrypt API', size: TEXT,
      }),

      // ---- and reaches BOTH kinds of component above it -------------------
      fan(A_X),
      fan(B_X),

      logoStrip({ x: A_X, y: BAND_Y, ...DAPR_SIDE }),
      logoStrip({ x: B_X, y: BAND_Y, ...CLOUD_SIDE }),

      hex({ x: APP_AT.x, y: APP_AT.y, r: APP_R, label: 'App', size: NAME, ...APP[0] }),
      group({
        class: 'd-named-mark',
        children: [
          markHex({ x: SIDE.x, y: SIDE.y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
          label({ x: SIDE.x, y: NAME_Y, text: 'Dapr sidecar', size: NAME }),
          label({
            x: SIDE.x, y: DESC_Y, text: 'Built-in cryptographic engine',
            size: TEXT, color: C.blue,
          }),
        ],
      }),
    ];
  },
};
