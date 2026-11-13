// THE STATE MANAGEMENT API: an app saving, reading and querying key/value
// pairs through its Dapr sidecar, and the three calls that do it.
//
// Replaces /images/state-management-overview.png on
// developing-applications/building-blocks/state-management/
// state-management-overview.md, under "Your application can use Dapr's state
// management API to save, read, and query key/value pairs".
//
// This is configuration-api-overview's twin - the same row, the same table,
// the same card - because the two APIs are the same shape and a reader meets
// both. What differs is that this page documents THREE calls rather than one,
// so there are three cards.
//
// DISCREPANCIES, raised and NOT resolved silently. The page's own prose names
// only the methods ("Use HTTP POST to save or query", "Use HTTP GET to read a
// specific key"), so the values are checked against this repository's
// reference, daprdocs/content/en/reference/api/state_api.md, and against
// developing-applications/.../howto-state-query-api.md:
//
//   1. THE STORED KEYS ARE WRONG IN THE SOURCE. It shows `myApp-weapon` and
//      `myApp-planet`. The default `appid` prefix strategy separates the app
//      id from the key with a DOUBLE PIPE - howto-share-state.md: "the key
//      will be saved as `myApp||darth`" - and `||` is reserved, which is why
//      it is the separator. Same correction configuration-api-overview
//      carries, confirmed by the maintainer on 2026-11-02.
//
//      What is NOT a discrepancy: the calls ask for the key UNPREFIXED while
//      the table shows it prefixed. The app asks for `planet`; Dapr prefixes
//      it with the app id to find the row.
//
//   2. SAVING STATE ANSWERS 204, NOT 200. The reference's response codes for
//      POST /v1.0/state/<storename> are `204 State saved`, `400`, `500` -
//      there is no 200, and no response body, which is why that card has a
//      divider with nothing under it.
//
//   3. THE QUERY BODY HAS NO `query` WRAPPER. The source sends
//      `{"query": {"filter": {...}}}`. Every query in the reference and in
//      the query how-to is `{"filter": ..., "sort": ..., "page": ...}` at the
//      top level.
//
//   4. A QUERY FILTER KEY IS RELATIVE TO THE VALUE. The source filters on
//      `value.name`. The how-to's dataset stores `{"person": ..., "state":
//      ...}` under each key and filters on `state` and `person.id`, with no
//      `value.` prefix, so the filter here is `name`.
//
//   5. A QUERY RESULT CARRIES `data` AND AN `etag`, NOT `value`. Both the
//      reference and the how-to return `{"key": ..., "data": {...},
//      "etag": "..."}`.
//
// All five are matters of fact rather than drawing, and a diagram cannot show
// the call wrongly while sitting on the page about that call.
//
// Where this departs from the source as a DRAWING, and why:
//   - the store is a CYLINDER holding one mark, named under it, exactly as
//     configuration-api-overview draws its configuration store. The source
//     draws a bordered box with four vendor logos in it and "state store
//     component" beside them in red; red is not a token here, a mark belongs
//     inside the shape it names, and the catalogue of stores is what
//     supported-state-stores.md is for.
//   - the app is named App. "Service A" was renamed across this set on the
//     maintainer's call, 2026-11-03.
//   - the three cards are ONE SIZE, as the three secrets cards are: a reader
//     moving across them should see the same card three times rather than
//     three cards that happen to say similar things.

import { C, APP, el } from '../engine.mjs';
import {
  arrow, cylinder, group, hex, hexHalfWidth, httpCard, httpCardH, label,
  lineWidth, STORE_RATIO,
} from '../shapes.mjs';
import { icon, markHex } from '../icons.mjs';
import { NAME_DY as HEX_NAME_DY } from '../services.mjs';

const EDGE = 29;
const V_EDGE = 14;

// 13, the size render-width.mjs is calibrated against.
const TEXT = 13;
// A shape's NAME scales with the shape, so it is not the scene's body type.
const NAME = 17;

const APP_R = 60;
const SIDE_R = 48;
const STORE_W = 132;
const STORE_MARK = 48;

const ROW_Y = 74;
const PAIR_GAP = 84;

// ---- the row, measured from its own left edge --------------------------------
// The row is NARROWER than the three cards under it, so it is centred on the
// canvas rather than pushed against the left margin: every x here is an offset
// from the row's own start, and ROW_LEFT - which cannot be known until the
// cards have settled the width - is added once, below.
const APP_DX = hexHalfWidth(APP_R);
const SIDE_DX = Math.round(APP_DX + hexHalfWidth(APP_R) + PAIR_GAP + hexHalfWidth(SIDE_R));
const STORE_DX = Math.round(SIDE_DX + hexHalfWidth(SIDE_R) + PAIR_GAP + STORE_W / 2);
const STORE_H = STORE_W / STORE_RATIO;

// Marks standing in a row share ONE name baseline, off the deepest of them.
const NAME_Y = ROW_Y + Math.max(SIDE_R, STORE_H / 2) * HEX_NAME_DY;

// ---- what the store holds, as the source lists it ---------------------------
// A plain two-column table, written out here as configuration-api-overview
// writes its own: this and that page are the only two in the set that show
// one, and the second page that wants one is when it earns a place in
// shapes.mjs.
//
// The keys are as the STORE holds them: prefixed with the app id, separated
// by the double pipe Dapr reserves for it. The calls below ask for them
// unprefixed, which is the other half of the same fact.
const ROWS = [
  ['myApp||weapon', '"Death Star"'],
  ['myApp||planet', '{"name": "Tatooine"}'],
];
const CELL_H = 34;
// Measured on the rendered page - the exporter has no font metrics - from the
// longest string in each column at TEXT in the code font.
const KEY_W = 112;
const VAL_W = 164;
const TABLE_PAD = 16;
const TABLE_W = TABLE_PAD + KEY_W + TABLE_PAD + VAL_W + TABLE_PAD;
const TABLE_H = CELL_H * (ROWS.length + 1);
const TABLE_DX = Math.round(STORE_DX + STORE_W / 2 + 34);
const TABLE_Y = ROW_Y - TABLE_H / 2;
const ROW_W = TABLE_DX + TABLE_W;

// ---- the three calls, under the row -----------------------------------------
// The HOST is dropped from every URL. The sources write
// `http://localhost:3500/...`; the reference writes `<daprPort>`, and the
// port is whatever the reader's `dapr run` chose, so it carries no fact the
// path does not. Same ruling as the secrets, configuration and conversation
// pages.
const path = (rest, version = '/v1.0/') => [
  { text: version },
  { text: 'state', color: C.orange, weight: 700 },
  { text: rest },
];

const CALLS = [
  {
    method: 'POST',
    url: path('/myStateStore'),
    request: '[{\n  "key": "weapon",\n  "value": "Death Star"\n}, {\n  "key": "planet",\n'
      + '  "value": { "name": "Tatooine" }\n}]',
    status: '204 No Content',
    statusW: 112,
  },
  {
    method: 'GET',
    url: path('/myStateStore/planet'),
    status: '200 OK',
    body: '{"name": "Tatooine"}',
  },
  {
    method: 'POST',
    url: path('/myStateStore/query', '/v1.0-alpha1/'),
    request: '{\n  "filter": {\n    "EQ": { "name": "Tatooine" }\n  }\n}',
    status: '200 OK',
    body: '{\n  "results": [{\n    "key": "planet",\n    "data": { "name": "Tatooine" },\n'
      + '    "etag": "1"\n  }]\n}',
  },
];

// The longest line any card holds, measured on the rendered page: the query
// URL at TEXT in the code font. The cards take it rather than each taking its
// own, so the three are one size.
const LINE_W = 292;
const CARD_W = Math.ceil(LINE_W + TEXT * 4);
const CARD_GAP = 36;

// EACH CARD IS AS DEEP AS ITS OWN EXCHANGE, and the three share a TOP. One
// depth for all three would be the deepest, which leaves the GET - a URL, a
// status and twenty characters back - sitting in a box two thirds empty; and
// a box whose contents are centred in that emptiness puts the three method
// lines at three different heights, so they stop reading as the headings they
// are. Sharing the top lines the headings up and wastes nothing. The ragged
// lower edge is the honest part: these three exchanges are not the same size.
const CARD_H = CALLS.map((c) => Math.ceil(httpCardH({ ...c, size: TEXT })));

const CARD_DY = 46;
const CARD_TOP = Math.round(Math.max(NAME_Y + TEXT, TABLE_Y + TABLE_H) + CARD_DY);

const CARDS_W = CARD_W * CALLS.length + CARD_GAP * (CALLS.length - 1);
const W = Math.ceil(Math.max(ROW_W, CARDS_W) + EDGE * 2);
const H = Math.ceil(CARD_TOP + Math.max(...CARD_H) + V_EDGE);

// ---- and now the row can be placed ------------------------------------------
const ROW_LEFT = Math.round((W - ROW_W) / 2);
const APP_X = ROW_LEFT + APP_DX;
const SIDE_X = ROW_LEFT + SIDE_DX;
const STORE_X = ROW_LEFT + STORE_DX;
const TABLE_X = ROW_LEFT + TABLE_DX;
const KEY_X = TABLE_X + TABLE_PAD;
const VAL_X = KEY_X + KEY_W + TABLE_PAD;

// The three sit in a row centred on the canvas, at one pitch: slots() spaces
// centres evenly inside a span, which is not the same thing once the cards
// have a width of their own.
const CARDS_LEFT = (W - CARDS_W) / 2;
const CARD_X = CALLS.map((_, i) => CARDS_LEFT + CARD_W / 2 + i * (CARD_W + CARD_GAP));

const cell = (x, y, text, mono = true) =>
  label({ x, y, text, size: TEXT, anchor: 'start', mono, weight: mono ? 400 : 700 });

export default {
  width: W,
  height: H,
  title: 'An app saving, reading and querying key/value pairs through its Dapr sidecar',
  desc:
    'Along the top, three shapes in a row: a green hexagon named App, a '
    + 'hexagon carrying the Dapr logo named Dapr sidecar, and a gold '
    + 'data-store cylinder holding the Redis mark, named State store '
    + 'component. A line with a head at each end joins each pair. To the '
    + 'right of the store, a two-column table headed Key and Value lists '
    + 'myApp||weapon with the value "Death Star" and myApp||planet with the '
    + 'value {"name": "Tatooine"}. Below the row, three cards hold the calls: '
    + 'POST on /v1.0/state/myStateStore saving both pairs and answering 204 '
    + 'No Content; GET on /v1.0/state/myStateStore/planet answering 200 OK '
    + 'with {"name": "Tatooine"}; and POST on '
    + '/v1.0-alpha1/state/myStateStore/query filtering on the name Tatooine '
    + 'and answering 200 OK with one result.',

  build() {
    return [
      // ---- the app asks its sidecar, and the sidecar reaches the store ----
      arrow({ from: { x: APP_X, y: ROW_Y, r: APP_R, hex: true }, to: { x: SIDE_X, y: ROW_Y, r: SIDE_R, hex: true } }),
      arrow({ from: { x: SIDE_X, y: ROW_Y, r: SIDE_R, hex: true }, to: { x: APP_X, y: ROW_Y, r: APP_R, hex: true } }),
      arrow({ from: { x: SIDE_X, y: ROW_Y, r: SIDE_R, hex: true }, to: { x: STORE_X, y: ROW_Y, w: STORE_W, h: STORE_H } }),
      arrow({ from: { x: STORE_X, y: ROW_Y, w: STORE_W, h: STORE_H }, to: { x: SIDE_X, y: ROW_Y, r: SIDE_R, hex: true } }),

      // ---- the shapes -----------------------------------------------------
      hex({ x: APP_X, y: ROW_Y, r: APP_R, label: 'App', size: NAME, ...APP[0] }),
      group({
        class: 'd-named-mark',
        children: [
          markHex({ x: SIDE_X, y: ROW_Y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
          label({ x: SIDE_X, y: NAME_Y, text: 'Dapr sidecar', size: NAME }),
        ],
      }),
      group({
        class: 'd-named-mark',
        children: [
          cylinder({ x: STORE_X, y: ROW_Y, w: STORE_W }),
          icon({
            name: 'redis', x: STORE_X, y: ROW_Y, size: STORE_MARK,
            color: C.appInk, fit: 'ink',
          }),
          label({ x: STORE_X, y: NAME_Y, text: 'State store\ncomponent', size: NAME }),
        ],
      }),

      // ---- what the store holds -------------------------------------------
      group({
        class: 'd-kv-table',
        children: [
          el('rect', {
            x: TABLE_X, y: TABLE_Y, width: TABLE_W, height: TABLE_H, rx: 8,
            fill: C.bg, stroke: C.caption, 'stroke-width': lineWidth(),
          }),
          // A rule under the column names, so they read as a heading rather
          // than as a third row of data. The source fills that band in blue;
          // a rule says the same thing without a second filled region in a
          // drawing whose other fills all mean something.
          el('line', {
            x1: TABLE_X, y1: TABLE_Y + CELL_H, x2: TABLE_X + TABLE_W, y2: TABLE_Y + CELL_H,
            stroke: C.caption, 'stroke-width': lineWidth(),
          }),
          cell(KEY_X, TABLE_Y + CELL_H / 2, 'Key', false),
          cell(VAL_X, TABLE_Y + CELL_H / 2, 'Value', false),
          ROWS.map(([key, value], i) => {
            const y = TABLE_Y + CELL_H * (i + 1.5);
            return group([cell(KEY_X, y, key), cell(VAL_X, y, value)]);
          }),
        ],
      }),

      // ---- and the three calls that do it ---------------------------------
      CALLS.map((call, i) => httpCard({
        ...call,
        x: CARD_X[i],
        y: CARD_TOP + CARD_H[i] / 2,
        w: CARD_W,
        h: CARD_H[i],
        size: TEXT,
      })),
    ];
  },
};
