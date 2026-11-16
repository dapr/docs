// The configuration API: an app reads a configuration item through its Dapr
// sidecar from a configuration component, and the call that does it.
//
// Replaces configuration-api-overview.png on
// developing-applications/building-blocks/configuration/
// configuration-api-overview.md, under "With Dapr's configuration API, you
// can consume configuration items".
//
// DISCREPANCIES, raised and NOT resolved silently. The page's own prose names
// none of the image's values, so the check is against this repository's
// reference for the API, daprdocs/content/en/reference/api/configuration_api.md:
//
//   1. THE URL IS WRONG IN THE SOURCE. It shows the key as a path segment -
//      `/v1.0/configuration/myconfigstore/dbname`. The reference gives
//      `GET http://localhost:<daprPort>/v1.0/configuration/<storename>` with
//      the key as a QUERY parameter: `?key=myConfigKey`. The drawing follows
//      the reference.
//   2. THE RESPONSE IS WRONG IN THE SOURCE. It shows a bare string,
//      `"database:connection"`. The reference returns JSON-encoded key/value
//      pairs - `{"myConfigKey": {"value": "myConfigValue"}}` - and the drawing
//      follows that shape with the source's own example values.
//   3. THE SOURCE'S KEY DELIMITER IS WRONG. Its table holds `myApp-dbname`.
//      Dapr does prefix a stored key with the app id, but the separator is a
//      DOUBLE PIPE: `myApp||dbname`. That is the form
//      state-management-overview.md gives for a stored key, and `||` is
//      reserved - the gRPC error codes reject a user key containing it.
//      Corrected on the maintainer's confirmation, 2026-11-02.
//
//      Note what is NOT a discrepancy, which a first reading took for one:
//      the URL asks for the key UNPREFIXED while the table shows it prefixed,
//      and that is correct. The app asks for `dbname`; Dapr prefixes it with
//      the app id to find the row. The call and the store are talking about
//      the same item in the two forms each of them uses.
//
// All three are matters of fact rather than drawing, so they are for the
// maintainers to confirm; the diagram cannot show the call wrongly while
// sitting on a page about that call.
//
// Where this departs from the source as a DRAWING, and why:
//   - the row is the house one the configuration how-to already draws: an app
//     hexagon, the Dapr hexagon named under it, and the component. Same radii,
//     so a reader meeting both configuration pages sees one set.
//   - the component is a CYLINDER: it is a configuration store, and the store
//     outline is what says so. The source draws a box with the Redis mark in
//     it and the name beside it in red; red is not a token here and the mark
//     sits inside the shape, as every mark in this set does.
//   - the URL picks out `configuration` in the way `sidecar-model` picks out
//     the building block in every Dapr API call it draws.

import { C, APP, el } from '../engine.mjs';
import {
  arrow, cylinder, group, hex, hexHalfWidth, httpCard, label, lineWidth, STORE_RATIO,
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
const STORE_W = 120;
const STORE_MARK = 44;

const ROW_Y = 74;

const APP_AT = { x: EDGE + hexHalfWidth(APP_R), y: ROW_Y, r: APP_R, hex: true };
const SIDE = { x: 265, y: ROW_Y, r: SIDE_R, hex: true };
const STORE = { x: 467, y: ROW_Y, w: STORE_W, h: STORE_W / STORE_RATIO };

// Marks standing in a row share ONE name baseline, off the deepest of them.
const NAME_Y = ROW_Y + Math.max(SIDE_R, STORE_W / 2) * HEX_NAME_DY;

// ---- the store's contents, as the source lists them -------------------------
// A plain two-column table. Written here rather than as a builder because this
// is the only page in the set that shows one; the second page that wants one
// is when it earns a place in shapes.mjs.
// The keys are as the STORE holds them: prefixed with the app id, separated
// by the double pipe Dapr reserves for it. The call below asks for them
// unprefixed, which is the other half of the same fact.
const ROWS = [
  ['myApp||dbname', '"database:connection"'],
  ['myApp||dbpartitionId', '"10"'],
];
const CELL_H = 34;
// Measured on the rendered page - the exporter has no font metrics - from the
// longest string in each column at TEXT in the code font.
const KEY_W = 160;
const VAL_W = 176;
const TABLE_PAD = 16;
const TABLE_W = TABLE_PAD + KEY_W + TABLE_PAD + VAL_W + TABLE_PAD;
const TABLE_H = CELL_H * (ROWS.length + 1);
const TABLE_X = STORE.x + STORE_W / 2 + 30;
const TABLE_Y = ROW_Y - TABLE_H / 2;
const KEY_X = TABLE_X + TABLE_PAD;
const VAL_X = KEY_X + KEY_W + TABLE_PAD;

// ---- the call, under the row ------------------------------------------------
const CARD_W = 620;
const CARD_H = 170;
const CARD_Y = NAME_Y + 44 + CARD_H / 2;

const W = Math.ceil(TABLE_X + TABLE_W + EDGE);
const H = Math.ceil(CARD_Y + CARD_H / 2 + V_EDGE);

const cell = (x, y, text, mono = true) =>
  label({ x, y, text, size: TEXT, anchor: 'start', mono, weight: mono ? 400 : 700 });

export default {
  width: W,
  height: H,
  title: 'An app reading a configuration item through its Dapr sidecar',
  desc:
    'Along the top, three shapes in a row: a green hexagon named myApp, a hexagon carrying the Dapr logo named Dapr sidecar, and a gold data-store cylinder holding the Redis mark, named Configuration component. A line with a head at each end joins each pair. To the right of the store, a two-column table headed Key and Value lists myApp||dbname with the value "database:connection" and myApp||dbpartitionId with the value "10". Below the row, a card shows the call: GET on the URL http://localhost:3500/v1.0/configuration/myconfigstore?key=dbname, a 200 OK divider, and the response {"dbname": {"value": "database:connection"}}.',

  build() {
    return [
      // ---- the app asks its sidecar, and the sidecar reads the store ------
      arrow({ from: APP_AT, to: SIDE }),
      arrow({ from: SIDE, to: APP_AT }),
      arrow({ from: SIDE, to: STORE }),
      arrow({ from: STORE, to: SIDE }),

      // ---- the shapes -----------------------------------------------------
      hex({ x: APP_AT.x, y: APP_AT.y, r: APP_R, label: 'myApp', size: NAME, ...APP[0] }),
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
          cylinder({ x: STORE.x, y: STORE.y, w: STORE_W }),
          icon({
            name: 'redis', x: STORE.x, y: STORE.y, size: STORE_MARK,
            color: C.appInk, fit: 'ink',
          }),
          label({ x: STORE.x, y: NAME_Y, text: 'Configuration\ncomponent', size: NAME }),
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

      // ---- and the call that does it --------------------------------------
      httpCard({
        x: W / 2, y: CARD_Y, w: CARD_W, h: CARD_H, size: TEXT,
        method: 'GET',
        url: [
          { text: 'http://localhost:3500/v1.0/' },
          { text: 'configuration', color: C.orange, weight: 700 },
          { text: '/myconfigstore?key=dbname' },
        ],
        status: '200 OK',
        body: '{"dbname": {"value": "database:connection"}}',
      }),
    ];
  },
};
