// RETRIEVING A SECRET, AND THE THREE NAMES THAT HAVE TO AGREE FOR IT TO WORK.
//
// Replaces /images/howto-secrets/secrets-mgmt-overview.png on
// developing-applications/building-blocks/secrets/howto-secrets.md, at the top
// of the page.
//
// The shapes along the top are the ordinary picture - a service, its sidecar,
// a secret store - but the point of this one is the band underneath. The store
// name in the code is the component's `metadata.name`; the component's
// `secretsFile` is the file beside it; the key in that file is the secret name
// back in the code. A reader can only check a chain like that by seeing the
// three artifacts side by side with their real contents in them, which is why
// each card sits under the shape it configures.
//
// ---------------------------------------------------------------------------
// TWO DISCREPANCIES, both in the source image's own code, and both corrected
// here against the page that carries it.
//
// 1. THE COMPONENT YAML IN THE IMAGE WOULD NOT LOAD. It draws
//
//        spec:
//          name: secretsFile
//          value: secrets.json
//
//    with `secretsFile` directly under `spec`, and no `type` at all. The
//    page's own file puts it under `spec.metadata` as a list item, and names
//    the type:
//
//        spec:
//          type: secretstores.local.file
//          version: v1
//          metadata:
//          - name: secretsFile
//            value: secrets.json
//
//    A reader copying the picture gets a component Dapr cannot load. The card
//    here follows the page. `version: v1` is the one line left out, for room:
//    it is the same in every component on the site and it is not part of the
//    chain this diagram is about.
//
// 2. THE SECRET'S VALUE IS NOT THE PAGE'S. The image shows
//    `"secret": "YourPasskeyHere"`; the file the page tells you to create is
//    `{ "secret": "Order Processing pass key" }`. The key is the same, so the
//    chain still held, but the value shown was from somewhere else.
//
// Neither is resolved silently and neither is a change to the page: the old
// image stays on disk, and correcting it is the maintainers' call.
// ---------------------------------------------------------------------------
//
// Fact-check of what IS drawn:
//   - `SECRET_STORE_NAME = "localsecretstore"` is in every SDK sample on the
//     page, and `"secret"` is the name each of them asks for.
//   - the call is the page's own: `curl
//     http://localhost:3601/v1.0/secrets/localsecretstore/secret`, with the
//     host dropped as the house rule asks - the reference writes it
//     `<daprPort>` and 3601 is whatever the reader's `dapr run` chose.
//   - no response is drawn, because the page shows none. The overview page's
//     three pictures show one and carry an httpCard() for it; this page's curl
//     prints nothing, so this is the method and the path alone.
//
// Where this departs from the source image, and why:
//   - the store is a lockBox(), the house shape for a secret store and the one
//     `resiliency-policies` already names "Secret store". The source draws a
//     padlock inside a shield, which in this set is secureLock() and means
//     secure COMMUNICATION - it is what `security-end-to-end` and
//     `sentry-kubernetes` put on an mTLS link.
//   - the three marks share ONE baseline rather than each taking its own
//     offset. lockBox() measures its name from its own half height and the
//     sidecar hexagon from its radius, so left alone the two names sit at
//     different heights and the row reads as misaligned.
//   - Order Processor takes APP[0]. The source paints it the dark navy of the
//     old house style; the palette assigns app colours in order and this scene
//     has one app.

import { C, APP } from '../engine.mjs';
import {
  arrow, codeCard, group, hex, hexHalfWidth, label, lockBox, richLabel,
} from '../shapes.mjs';
import { markHex } from '../icons.mjs';
import { NAME_DY } from '../services.mjs';

const EDGE = 29;
const V_EDGE = 14;

const TEXT = 13;
const NAME = 17;
// The artifacts are set a shade under the scene's body type: three cards of
// code is a lot of mono at once, and 12 keeps the widest of them - the JSON,
// which is the page's file verbatim - inside a canvas this page can show.
const CODE = 12;

const APP_R = 60;
const SIDE_R = 48;
const STORE = 56;

// ---- the three artifacts, which are the widest things here ------------------
// So they set the horizontal: each shape stands over the card it configures,
// rather than the cards being fitted under a row laid out without them. The
// source aligns them the same way, and the alignment is the whole argument -
// a card under no particular shape is just a code listing.
const CARD_PAD = 14;
const CARD_GAP = 40;
// Measured on the rendered page at 12 in the code face; the exporter has no
// font metrics. Each is its own longest line.
const CARDS = [
  {
    title: 'Order Processor service',
    code: 'SECRET_STORE_NAME =\n  "localsecretstore"\nSECRET_NAME = "secret"',
    w: 190,
  },
  {
    title: 'local-secret-store.yaml',
    code: 'metadata:\n  name: localsecretstore\nspec:\n  type: secretstores.local.file\n  metadata:\n  - name: secretsFile\n    value: secrets.json',
    w: 254,
  },
  {
    title: 'secrets.json',
    code: '{\n   "secret": "Order Processing pass key"\n}',
    w: 312,
  },
];

const LINE_H = CODE * 1.2;
const cardH = (code) => String(code).split('\n').length * LINE_H + CARD_PAD * 2;
// The cards share a TOP edge so their names line up, and each is only as tall
// as its own listing. Aligned by centre instead, three different line counts
// would stagger the three names.
const CARD_H = CARDS.map((c) => cardH(c.code));
const BAND_H = Math.max(...CARD_H);

let runningX = EDGE;
const CARD_X = CARDS.map((c) => {
  const mid = runningX + c.w / 2;
  runningX += c.w + CARD_GAP;
  return mid;
});

const W = Math.ceil(runningX - CARD_GAP + EDGE);

// ---- the row, each shape over its own card ----------------------------------
const ROW_Y = V_EDGE + APP_R;
const APP_AT = { x: CARD_X[0], y: ROW_Y, r: APP_R, hex: true };
const SIDE = { x: CARD_X[1], y: ROW_Y, r: SIDE_R, hex: true };
const STORE_AT = { x: CARD_X[2], y: ROW_Y, w: STORE, h: STORE };

// ONE baseline for both names, taken off the deepest shape in the row, so the
// shallower one's name still clears it.
const NAME_Y = ROW_Y + SIDE_R * NAME_DY;

// ---- the call the page documents, under the pair that makes it --------------
const METHOD_Y = NAME_Y + 34;
const CALL_Y = METHOD_Y + TEXT * 1.9;
// Measured on the rendered page at 13 in the code face.
const CALL_W = 288.6;
const CALL_MID = Math.max(
  EDGE + CALL_W / 2,
  (APP_AT.x - hexHalfWidth(APP_R) + SIDE.x + hexHalfWidth(SIDE_R)) / 2,
);

const BAND_TOP = CALL_Y + 46;
const H = Math.ceil(BAND_TOP + BAND_H + V_EDGE);

export default {
  width: W,
  height: H,
  title: 'A service retrieving a secret through its Dapr sidecar from a local secret store',
  desc:
    'Along the top, three shapes in a row: a green hexagon named Order '
    + 'Processor, a hexagon carrying the Dapr logo named Dapr sidecar, and a '
    + 'padlock in a box named Secret store. A line with a head at each end '
    + 'joins each to the next. Under the service and its sidecar is the call '
    + 'it makes: GET over the path /v1.0/secrets/localsecretstore/secret. '
    + 'Along the bottom, under the shape each configures, are three cards. '
    + 'Order Processor service holds SECRET_STORE_NAME set to localsecretstore '
    + 'and SECRET_NAME set to secret. local-secret-store.yaml holds a component '
    + 'named localsecretstore, of type secretstores.local.file, whose metadata '
    + 'sets secretsFile to secrets.json. secrets.json holds the key secret with '
    + 'the value Order Processing pass key.',

  build() {
    return [
      // ---- the service asks its sidecar, and is answered ------------------
      arrow({ from: APP_AT, to: SIDE }),
      arrow({ from: SIDE, to: APP_AT }),

      // ---- and the sidecar reaches the store ------------------------------
      arrow({ from: SIDE, to: STORE_AT }),
      arrow({ from: STORE_AT, to: SIDE }),

      // ---- the shapes, over the lines that reach them ---------------------
      hex({
        x: APP_AT.x, y: APP_AT.y, r: APP_R,
        label: 'Order\nProcessor', size: NAME, ...APP[0],
      }),
      group({
        class: 'd-named-mark',
        children: [
          markHex({ x: SIDE.x, y: SIDE.y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
          label({ x: SIDE.x, y: NAME_Y, text: 'Dapr sidecar', size: NAME }),
        ],
      }),
      group({
        class: 'd-named-mark',
        children: [
          // Unlabelled, with the name set here instead: lockBox() draws its
          // own at label()'s default of 11, and a row whose three names are
          // 17, 17 and 11 reads as one of them being less important than the
          // others. The builder has no size of its own to pass.
          lockBox({ x: STORE_AT.x, y: STORE_AT.y, size: STORE }),
          label({ x: STORE_AT.x, y: NAME_Y, text: 'Secret store', size: NAME }),
        ],
      }),

      // ---- the call the page documents ------------------------------------
      // The PATH is emitted BEFORE the method, though it is drawn under it:
      // the theme check samples the first text in a scene that is not on a
      // plate or a solid fill, and a method is C.blue, a brand colour that is
      // the same value in both themes by design.
      richLabel({
        x: CALL_MID, y: CALL_Y, size: TEXT, anchor: 'middle', mono: true,
        parts: [
          { text: '/v1.0/' },
          { text: 'secrets', color: C.orange, weight: 700 },
          { text: '/localsecretstore/secret' },
        ],
      }),
      label({
        x: CALL_MID, y: METHOD_Y, text: 'GET', size: TEXT, weight: 700, color: C.blue,
      }),

      // ---- and the three artifacts whose names have to agree --------------
      CARDS.map((c, i) => codeCard({
        x: CARD_X[i], y: BAND_TOP + CARD_H[i] / 2, w: c.w, h: CARD_H[i],
        title: c.title, code: c.code, size: CODE, titleSize: TEXT, pad: CARD_PAD,
      })),
    ];
  },
};
