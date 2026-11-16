// THE THREE SECRETS OVERVIEW PICTURES, which secrets-overview.md shows one
// after another under "Configure secrets without changing application code".
//
// They are one arrangement in three states. Every one of them is Service A
// asking its Dapr sidecar for the same secret over the same API and getting
// the same value back; what changes is WHERE the secret comes from and what
// the sidecar had to do to get it:
//
//   cloud stores     a configured cloud secret store, any of four
//   kubernetes       the built-in Kubernetes secret store, from inside a pod
//   azure aks        Azure Key Vault, reached with a pod managed identity
//
// The page's own closing line is the reason they have to agree: "In the
// examples above, the application code did not have to change to get the same
// secret." A reader checks that by looking at the three pictures, so the call,
// the response and the shapes making them MUST be identical across all three.
// Drawing them three times is how that claim quietly stops being true.
//
// So the measurements live here and each scene arranges its own surroundings -
// the same split `pubsub-raw.mjs` uses, and for the same reason: what is
// shared is every number, not the layout, because the layout is the one thing
// that genuinely differs between them.

import { C } from './engine.mjs';
import { NAME_DY } from './services.mjs';

// Least space from the drawing to the side edges, and to the top and bottom.
export const EDGE = 29;
export const V_EDGE = 14;

// 13, the size render-width.mjs is calibrated against; see
// diagrams/type-size.test.mjs.
export const TEXT = 13;

// A shape's NAME scales with the shape rather than with the scene's body type.
// 17 is what "Dapr sidecar" wants under a 48 hexagon, and it is what the
// conversation, configuration and state overviews already set.
export const NAME = 17;

export const APP_R = 60;
export const SIDE_R = 48;

// The gap carries only the line: the call is drawn under the row, not along
// it, so the two shapes sit as close as two things that talk can.
export const PAIR_GAP = 86;

// What the page calls them. The source images say "Service A", but the page's
// own prose never names the app - it says "an application" and "the
// application" throughout - and the letter distinguishes nothing here, because
// there is only one. Maintainer ruling of 2026-11-03: App.
//
// NOT a rename to make everywhere. `security-end-to-end`, `security-threat-
// model`, `sentry-kubernetes` and `sentry-selfhosted` all say Service A, and
// each of them also says Service B: there the letters are the whole point,
// because the picture is two services talking to each other.
export const APP_NAME = 'App';
export const SIDECAR_NAME = 'Dapr sidecar';

// Where a mark's name sits under it, shared so the row keeps one baseline.
export const nameY = (rowY, r = SIDE_R) => rowY + r * NAME_DY;

// ---- the call, which is the same call in all three --------------------------
// GET /v1.0/secrets/<store>/<name>, as reference/api/secrets_api.md writes it
// and as all three source images draw it. The store name is the only part
// that changes: `vault` in two of them, `kubernetes` in the Kubernetes one.
//
// The HOST is dropped. The sources write `http://localhost:3500/...`; the
// reference writes `<daprPort>`, and the port is whatever the reader's
// `dapr run` chose, so it carries no fact the path does not. Same ruling as
// conversation-overview and the configuration and state how-tos.
export const urlParts = (store) => [
  { text: '/v1.0/' },
  { text: 'secrets', color: C.orange, weight: 700 },
  { text: `/${store}/mysecret` },
];

export const METHOD = 'GET';

// The card's own box. Sized to the LONGEST url any of the three sets -
// `/v1.0/secrets/kubernetes/mysecret` - so the three cards are one size and a
// reader moving down the page sees the same card three times rather than
// three cards that happen to say similar things. Measured on the rendered
// page, because the exporter has no font metrics.
export const URL_W = 257.4;
export const CARD_W = Math.ceil(URL_W + TEXT * 4);
// httpCard() lays its lines out from the card's own box: the method a padding
// in from the top, the url a lead under it. With no response to carry, the
// card is only as tall as those two lines plus the same padding under the url
// as over the method. At 112 - the height it needed when it carried a response
// - the two lines sat in the top half with a hand's breadth of nothing below.
export const CARD_H = 84;

// The card hangs under the pair it belongs to, clear of the sidecar's NAME
// rather than of the sidecar: the name is set at 17 and reaches about twelve
// below its own baseline, which is what put a call measured against the
// hexagon on top of it in conversation-overview.
export const CARD_DY = TEXT * 2.6;
