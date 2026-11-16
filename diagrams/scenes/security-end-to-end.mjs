// End-to-end security on a call between two Dapr applications.
//
// Replaces security-end-to-end-communication.png on
// concepts/security-concept.md, under "Dapr provides end-to-end security with
// the service invocation API, with the ability to authenticate an application
// with Dapr and set endpoint access policies."
//
// THE SHAPE OF IT. Three links, three protections, and the point of the
// picture is WHERE each one sits:
//   - app to its own sidecar, over localhost: an API token, one per direction.
//   - sidecar to sidecar: mTLS, on by default.
//   - at the sidecar itself: the access policies that say who may call what.
//
// Fact-check, against the page and the how-tos it links to:
//   - "Dapr provides the app with API level authentication using tokens. This
//     feature guarantees that, even on localhost: Only an authenticated
//     application may call into Dapr; An application can check that Dapr is
//     calling it back." Two guarantees, two tokens, and they are two different
//     settings: DAPR_API_TOKEN (operations/security/api-token.md) is the one
//     the app sends when it calls Dapr, APP_API_TOKEN
//     (operations/security/app-api-token.md) the one Dapr sends when it calls
//     the app. Both travel in the same `dapr-api-token` header, which is why
//     naming the header here instead would say nothing about direction.
//   - "Dapr includes an 'on by default', automatic mTLS that provides
//     in-transit encryption for traffic between Dapr sidecars."
//   - the two access policies are the page's own sections: service invocation
//     scoping, "which applications are allowed (or denied) to call it", and
//     pub/sub topic scoping, "limit which topic types and applications are
//     allowed to publish and subscribe to specific topics".
//
// Where this departs from the source image, and why:
//   - Service A and Service B are App A and App B, the names the rest of the
//     set uses, and the page's own atomic unit of identity is the App ID.
//   - the two policy items floated above the picture attached to nothing. They
//     sit in a region here whose caption says who checks them, with a leader
//     down to each sidecar.
//   - each sidecar sat in a dashed box holding a key glyph and a list glyph,
//     and nothing said what either glyph meant or what the box grouped. Both
//     are gone: a glyph nobody names means nothing in particular.
//   - the source labels both app-to-sidecar links "API Token Authentication"
//     and stops there. There are two tokens, and which one guards which
//     direction is the part worth drawing.
//   - the pairs of black-out, grey-back arrows are one line with a head at
//     each end, as everywhere else in the set.

import { C, APP } from '../engine.mjs';
import { arrow, hex, hexHalfWidth, label, region, secureLock } from '../shapes.mjs';
import { icon, markHex } from '../icons.mjs';

const W = 980;
const H = 344;

const TEXT = 14;
const SMALL = 12.5;
const CODE = 11.5;

// ---- the row ---------------------------------------------------------------
// App, sidecar, sidecar, app, at one height so all three links are straight.
const ROW_Y = 246;
const APP_A = { x: 95, y: ROW_Y, r: 56, hex: true };
const SIDE_A = { x: 325, y: ROW_Y, r: 44, hex: true };
const SIDE_B = { x: 655, y: ROW_Y, r: 44, hex: true };
const APP_B = { x: 885, y: ROW_Y, r: 56, hex: true };

// The middle of a link, which is where its annotation goes.
const between = (l, r) => +((l.x + hexHalfWidth(l.r) + (r.x - hexHalfWidth(r.r))) / 2).toFixed(2);
const LINK_A = between(APP_A, SIDE_A);
const LINK_B = between(SIDE_B, APP_B);

// ---- what the sidecar checks -----------------------------------------------
const POLICY = { x: 338, y: 40, w: 304, h: 124 };
const GLYPH_X = 383.5;
const POLICY_X = 414.5;
// Centred in what the caption pill leaves rather than in the whole region: the
// pill hangs over the top of this column, so the rows move down by half of it.
const POLICY_MID = 108;
const POLICY_ROWS = [POLICY_MID - 29, POLICY_MID + 29];
const POLICIES = [
  ['arrow-step-in-right', 'Service access policies', 'endpoint allow and deny lists'],
  ['mail-copy', 'Pub/sub topic access policies', 'topic allow and deny lists'],
];
const POLICY_AT = { x: POLICY.x + POLICY.w / 2, y: POLICY.y + POLICY.h / 2, w: POLICY.w, h: POLICY.h };

// ---- mTLS, beside the link it protects --------------------------------------
const LOCK = { x: 420, y: 214, size: 38 };

// Two things that talk both ways share ONE line with a head at each end: the
// same arrow twice, drawn over itself.
const bothWays = (a, b) => [arrow({ from: a, to: b }), arrow({ from: b, to: a })];

export default {
  width: W,
  height: H,
  title: 'End-to-end security on a call between two Dapr applications',
  desc:
    'Two applications, App A on the left in green and App B on the right in blue, each joined to its own Dapr sidecar by a line with an arrowhead at each end, and the two sidecars joined to each other by a third such line. Each app-to-sidecar link is labelled "API token" above the line, and below it the two tokens that guard it: DAPR_API_TOKEN for calls into Dapr and APP_API_TOKEN for calls back to the app. Between the two sidecars a shield-and-padlock mark is labelled "mTLS, on by default". Above the picture a dashed region captioned "Checked by the sidecar" lists service access policies, with endpoint allow and deny lists, and pub/sub topic access policies, with topic allow and deny lists; a dashed leader runs from it to each of the two sidecars.',

  build() {
    return [
      // ---- the row -------------------------------------------------------
      hex({ x: APP_A.x, y: ROW_Y, r: APP_A.r, label: 'App A', ...APP[0] }),
      markHex({ x: SIDE_A.x, y: ROW_Y, r: SIDE_A.r, mark: 'logo-blue' }),
      markHex({ x: SIDE_B.x, y: ROW_Y, r: SIDE_B.r, mark: 'logo-blue' }),
      hex({ x: APP_B.x, y: ROW_Y, r: APP_B.r, label: 'App B', ...APP[1] }),

      ...bothWays(APP_A, SIDE_A),
      ...bothWays(SIDE_A, SIDE_B),
      ...bothWays(SIDE_B, APP_B),

      // ---- what guards the two localhost links -----------------------------
      // The names carry the direction: one is the token for calling Dapr, the
      // other the token for calling the app.
      ...[LINK_A, LINK_B].flatMap((x) => [
        label({ x, y: ROW_Y - 32, text: 'API token', size: TEXT }),
        label({ x, y: ROW_Y + 31.6, text: 'DAPR_API_TOKEN', size: CODE, weight: 400, mono: true }),
        label({ x, y: ROW_Y + 45.4, text: 'APP_API_TOKEN', size: CODE, weight: 400, mono: true }),
      ]),

      // ---- and what guards the link between the sidecars -------------------
      secureLock({ x: LOCK.x, y: LOCK.y, size: LOCK.size }),
      label({
        x: LOCK.x + LOCK.size / 2 + 11, y: LOCK.y, anchor: 'start',
        text: 'mTLS, on by default', size: TEXT,
      }),

      // ---- and what the sidecar checks on every call -----------------------
      // Caption grey, not sky: sky is a brand colour and is the same in both
      // themes, so a region drawn in it does not re-theme with the page.
      region({
        x: POLICY.x, y: POLICY.y, w: POLICY.w, h: POLICY.h, stroke: C.caption,
        caption: 'Checked by the sidecar', captionW: 216,
      }),
      ...POLICIES.flatMap(([mark, head, detail], i) => [
        icon({ name: `fluent-${mark}`, x: GLYPH_X, y: POLICY_ROWS[i], size: 30, color: C.blue, fit: 'ink' }),
        label({ x: POLICY_X, y: POLICY_ROWS[i] - 10, text: head, size: TEXT, anchor: 'start' }),
        label({ x: POLICY_X, y: POLICY_ROWS[i] + 10, text: detail, size: SMALL, weight: 400, anchor: 'start' }),
      ]),
      // Dashed, because a leader points rather than carries: no traffic runs
      // down these.
      arrow({ from: POLICY_AT, to: SIDE_A, color: C.caption, dash: true }),
      arrow({ from: POLICY_AT, to: SIDE_B, color: C.caption, dash: true }),
    ];
  },
};
