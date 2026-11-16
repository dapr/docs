// A SERVICE GETTING A SECRET FROM A CONFIGURED CLOUD SECRET STORE.
//
// Replaces /images/secrets-overview-cloud-stores.png on
// developing-applications/building-blocks/secrets/secrets-overview.md, under
// "the diagram below shows an application requesting the secret called
// mysecret from a secret store called vault from a configured cloud secret
// store".
//
// The first of the page's three, which are one arrangement in three states and
// share every measurement through diagrams/secrets-example.mjs. The page's own
// closing line - "the application code did not have to change to get the same
// secret" - is a claim a reader checks by looking at all three, so the call,
// the response and the shapes making them are identical across them.
//
// Fact-check, against the page's own prose:
//   - the store is named `vault` and the secret `mysecret`, which is what the
//     path says. The reference writes the call
//     `GET http://localhost:<daprPort>/v1.0/secrets/<secret-store-name>/<name>`
//     and the source image draws exactly that, so nothing here is invented.
//   - the four marks are the four the source shows. The page's own prose names
//     three of them - "AWS Secrets Manager, Azure Key Vault, Hashicorp Vault,
//     etc" - and the fourth, Google Key Management, is the source's; the `etc`
//     covers it and supported-secret-stores lists it.
//
// Where this departs from the source image, and why:
//   - the call is an httpCard(), the house drawing for a Dapr API exchange: a
//     verb, the URL, and what came back. The source writes the method and URL
//     along the app-to-sidecar line and floats the returned value in a second
//     card overlapping the app hexagon. Those are one exchange and the card
//     says so. No status chip: the page shows none, and inventing a 200 would
//     be putting a fact in the picture that is not on the page.
//   - the call sits UNDER the row rather than along it. That is the maintainer
//     ruling of 2026-11-02 recorded in conversation-overview: written along
//     the line it is a block of text between two shapes that have nothing else
//     to say to each other, and the arrow has to grow to carry it.
//   - the stores are a logoStrip() - a dashed area with its name on the border
//     - rather than the source's white box with the caption inside it. Same
//     builder, same look as the LLMs on conversation-overview and the stores
//     on cryptography-overview, which a reader meets in the same section.
//   - two columns, not the source's single row of four. The strip stands
//     BESIDE the row here rather than above it, and four abreast would make a
//     canvas twice as wide as it is tall for no gain.
//   - Service A takes APP[0]. The source paints it the pale blue every app in
//     that family is painted; the palette assigns app colours in order and
//     this scene has one app.

import { C, APP } from '../engine.mjs';
import {
  arrow, group, hex, hexHalfWidth, httpCard, label,
} from '../shapes.mjs';
import { logoStrip, logoStripSize, markHex } from '../icons.mjs';
import {
  APP_NAME, APP_R, CARD_DY, CARD_H, CARD_W, EDGE, METHOD, NAME, PAIR_GAP,
  SIDECAR_NAME, SIDE_R, TEXT, URL_W, V_EDGE, nameY, urlParts,
} from '../secrets-example.mjs';

// Named as their own component pages name them, not as the source's image
// labels them: the page's words beat the picture's.
const STORES = [
  { mark: 'aws-secrets-manager', name: 'AWS Secrets\nManager' },
  { mark: 'azure-key-vault', name: 'Azure\nKey Vault' },
  { mark: 'google-key-management', name: 'Google Key\nManagement' },
  { mark: 'vault', name: 'HashiCorp\nVault' },
];

// An item is as wide as its NAME, which is wider than its mark: "Google Key"
// is the longest line. Measured on the rendered page.
const ITEM_W = 96;

const STRIP = {
  marks: STORES, caption: 'Cloud secret stores', cols: 2, markSize: 30,
  size: TEXT, gapX: 134, pad: 26, plated: true, itemW: ITEM_W,
};
// Asked of the builder rather than worked out again here: a scene recomputing
// the strip's box is a second copy of the formula, and the two drifted by six
// units before logoStripSize() existed.
const { w: STRIP_W, h: STRIP_H, reach: STRIP_REACH } = logoStripSize(STRIP);

// The caption pill straddles the strip's TOP edge, so it draws `reach` higher
// than its own box; centring on the box alone puts the pill against the canvas
// edge.
const ROW_Y = Math.round(V_EDGE + STRIP_REACH + STRIP_H / 2);

const APP_AT = { x: EDGE + hexHalfWidth(APP_R), y: ROW_Y, r: APP_R, hex: true };
const SIDE = {
  x: Math.round(APP_AT.x + hexHalfWidth(APP_R) + PAIR_GAP + hexHalfWidth(SIDE_R)),
  y: ROW_Y,
  r: SIDE_R,
  hex: true,
};
const STRIP_X = SIDE.x + hexHalfWidth(SIDE_R) + 96 + STRIP_W / 2;

const NAME_Y = nameY(ROW_Y);

// Centred on the pair it belongs to, clamped so a card wider than the pair
// cannot cross the margin.
const CARD_MID = Math.max(
  EDGE + CARD_W / 2,
  (APP_AT.x - hexHalfWidth(APP_R) + SIDE.x + hexHalfWidth(SIDE_R)) / 2,
);
const CARD_Y = NAME_Y + CARD_DY + CARD_H / 2;

const W = Math.ceil(STRIP_X + STRIP_W / 2 + EDGE);
const H = Math.ceil(Math.max(ROW_Y + STRIP_H / 2, CARD_Y + CARD_H / 2) + V_EDGE);

export default {
  width: W,
  height: H,
  title: 'A service getting a secret from a configured cloud secret store through its Dapr sidecar',
  desc:
    'On the left, a green hexagon named App. A line with a head at each '
    + 'end joins it to a hexagon carrying the Dapr logo, named Dapr sidecar. A '
    + 'second such line joins the sidecar to a dashed area captioned Cloud '
    + 'secret stores, which holds the marks and names of four stores in two '
    + 'columns: AWS Secrets Manager, Azure Key Vault, Google Key Management '
    + 'and HashiCorp Vault. Below the service and its sidecar is a card '
    + 'holding the exchange between them: GET over the path '
    + '/v1.0/secrets/vault/mysecret, and under it the value that comes back, '
    + 'mysecret "supersecret".',

  build() {
    return [
      // ---- the service asks its sidecar, and is answered ------------------
      arrow({ from: APP_AT, to: SIDE }),
      arrow({ from: SIDE, to: APP_AT }),

      // ---- and the sidecar reaches whichever store its component names ----
      arrow({ from: SIDE, to: [STRIP_X - STRIP_W / 2 - 2, ROW_Y] }),
      arrow({ from: [STRIP_X - STRIP_W / 2 - 2, ROW_Y], to: SIDE }),

      // ---- the shapes, over the lines that reach them ---------------------
      hex({ x: APP_AT.x, y: APP_AT.y, r: APP_R, label: APP_NAME, size: NAME, ...APP[0] }),
      group({
        class: 'd-named-mark',
        children: [
          markHex({ x: SIDE.x, y: SIDE.y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
          label({ x: SIDE.x, y: NAME_Y, text: SIDECAR_NAME, size: NAME }),
        ],
      }),
      logoStrip({ x: STRIP_X, y: ROW_Y, ...STRIP }),

      // ---- the exchange the page documents, under the pair ----------------
      httpCard({
        x: CARD_MID, y: CARD_Y, w: CARD_W, h: CARD_H,
        method: METHOD, url: urlParts('vault'), size: TEXT,
      }),
    ];
  },
};
