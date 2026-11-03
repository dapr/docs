// WHAT THE TWO PLACEMENT PICTURES AGREE ABOUT.
//
// actors-features-concepts.md draws the Placement service twice: once while
// three service instances REGISTER with it, and once while a client call is
// routed to the instance that holds actor ID 123. The left-hand side of the
// two is the same picture - the same three instances, each with its service,
// its sidecar and its cached partition table, and the same Placement panel
// beside them - and a reader meets both within two paragraphs, so they have
// to be the same objects at the same sizes.
//
// What is shared is every MEASUREMENT and the two builders that draw a
// repeated thing. The ARRANGEMENT is not: the first picture has nothing on
// the right of the Placement service and the second has the caller there, and
// a flag deciding that would make this a scene with two modes rather than a
// set of measurements two scenes agree on. Same split as pubsub-raw.mjs,
// invocation-row.mjs, secrets-example.mjs and state-outbox.mjs.

import { APP, C, el } from './engine.mjs';
import {
  arrow, captionReach, group, hex, hexHalfWidth, label, lineWidth, region,
} from './shapes.mjs';
import { markHex } from './icons.mjs';

export const EDGE = 29;
export const V_EDGE = 14;

// 13, the size render-width.mjs is calibrated against.
export const TEXT = 13;

// A shape's NAME scales with the shape. 12 is what "Service code" wants
// inside a hexagon of APP_R: eleven characters against 1.732r of width, with
// half an em clear each side.
export const NAME = 12;
// 56, not 52: at 52 the caller's sub-line, "Call ID 123", cleared the
// sloping edges by two units short of the half an em the rendered rule
// `holds every shape's own name inside it` asks for.
export const APP_R = 56;
export const SIDE_R = 40;

export const PAD = 22;

// ---- the partition table ----------------------------------------------------
// Every instance caches one, and the Placement service holds the master. It
// is the same table at two sizes, so it is one builder: a reader has to see
// that the thing broadcast is the thing stored.
//
// The right-hand column is the same words in every row because that is what
// the table IS - a schema, not data. The source writes "Dapr Instances
// (partitions)" in both rows for the same reason.
export const TABLE_ROWS = ['MyActor1', 'MyActor2'];
export const TABLE_VALUE = 'Dapr instances';
export const TABLE_HEAD = ['Actor type', 'Partitions'];

export const CELL_PAD = 10;
// Measured on the rendered page at the size each table is set in.
const COL_1_AT = { 11: 62, 13: 74 };
const COL_2_AT = { 11: 86, 13: 102 };

export const tableSize = (size) => {
  const c1 = COL_1_AT[size];
  const c2 = COL_2_AT[size];
  if (!c1) throw new Error(`actors-placement: no measured columns at ${size}`);
  const rowH = Math.round(size * 1.9);
  return {
    w: CELL_PAD * 3 + c1 + c2,
    h: rowH * (TABLE_ROWS.length + 1),
    rowH,
    c1,
    c2,
  };
};

/**
 * The partition table, drawn from its top-left corner.
 *
 * Grouped as one named mark: the rule and the cells are parts of a table, not
 * shapes crowding each other, and the clearance check reads them that way.
 */
export function partitionTable({ x, y, size = 11, ink = C.body }) {
  const { w, h, rowH, c1 } = tableSize(size);
  const cell = (cx, cy, text, head) => label({
    x: cx, y: cy, text, size, anchor: 'start', color: ink,
    weight: head ? 700 : 400,
  });
  const col2X = x + CELL_PAD + c1 + CELL_PAD;
  return group({
    class: 'd-named-mark',
    children: [
      el('rect', {
        x, y, width: w, height: h, rx: 6,
        fill: C.bg, stroke: C.caption, 'stroke-width': lineWidth(),
      }),
      el('line', {
        x1: x, y1: y + rowH, x2: x + w, y2: y + rowH,
        stroke: C.caption, 'stroke-width': lineWidth(),
      }),
      cell(x + CELL_PAD, y + rowH / 2, TABLE_HEAD[0], true),
      cell(col2X, y + rowH / 2, TABLE_HEAD[1], true),
      TABLE_ROWS.map((name, i) => group([
        cell(x + CELL_PAD, y + rowH * (i + 1.5), name),
        cell(col2X, y + rowH * (i + 1.5), TABLE_VALUE),
      ])),
    ],
  });
}

// ---- one service instance ---------------------------------------------------
// A captioned boundary holding the service, its sidecar and the copy of the
// table the sidecar caches. The service and the sidecar answer each other, so
// they share one line with a head at each end - the house rule everywhere a
// pair TALKS rather than a sequence being counted.
export const INST_TABLE_SIZE = 11;
// 44, not 18: the service and its sidecar answer each other on ONE line with
// a head at each end, and at 18 the two heads met in the middle and the pair
// read as a small diamond between the shapes rather than as a line.
export const INST_GAP = 44;

const inst = tableSize(INST_TABLE_SIZE);

export const INST_TOP_PAD = captionReach() + 18;
export const INST_H = INST_TOP_PAD + APP_R * 2 + 18;
export const INST_W = PAD
  + hexHalfWidth(APP_R) * 2 + INST_GAP + hexHalfWidth(SIDE_R) * 2
  + INST_GAP + inst.w + PAD;

// Where each piece sits inside an instance, as an offset from its left edge.
export const INST_APP_DX = PAD + hexHalfWidth(APP_R);
export const INST_SIDE_DX = INST_APP_DX + hexHalfWidth(APP_R) + INST_GAP + hexHalfWidth(SIDE_R);
export const INST_TABLE_DX = INST_SIDE_DX + hexHalfWidth(SIDE_R) + INST_GAP;
// The row the service and the sidecar stand on, from the boundary's top.
export const INST_ROW_DY = INST_TOP_PAD + APP_R;

/**
 * One instance: the boundary, the service, its sidecar and the cached table.
 *
 * `note` is the second line inside the service hexagon - the actor type it
 * hosts, or what it is doing in the picture that draws it.
 */
export function instance({
  x, y, name, note, captionW, appFill = APP[0],
}) {
  const rowY = y + INST_ROW_DY;
  const app = { x: x + INST_APP_DX, y: rowY, r: APP_R, hex: true };
  const side = { x: x + INST_SIDE_DX, y: rowY, r: SIDE_R, hex: true };
  return group([
    region({
      x, y, w: INST_W, h: INST_H, caption: name, captionW, captionSize: TEXT,
    }),
    arrow({ from: app, to: side }),
    arrow({ from: side, to: app }),
    hex({
      x: app.x, y: app.y, r: APP_R, label: 'Service code', size: NAME,
      sub: note, subSize: NAME, ...appFill,
    }),
    markHex({ x: side.x, y: side.y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
    partitionTable({
      x: x + INST_TABLE_DX, y: rowY - inst.h / 2, size: INST_TABLE_SIZE,
    }),
  ]);
}

/** Where an instance's sidecar sits, for a scene routing a line to it. */
export const instanceSide = (x, y) => ({
  x: x + INST_SIDE_DX, y: y + INST_ROW_DY, r: SIDE_R, hex: true,
});

// ---- the Placement service --------------------------------------------------
export const PLACE_TABLE_SIZE = 13;
const place = tableSize(PLACE_TABLE_SIZE);

export const PLACE_PAD = 20;
export const PLACE_TITLE_H = 38;
export const PLACE_W = PLACE_PAD * 2 + place.w;
export const PLACE_H = PLACE_TITLE_H + place.h + PLACE_PAD;

/**
 * The Placement service: a filled navy panel with the master table on it.
 *
 * Filled, because it is the one thing in the picture that is not a copy of
 * something else, and the instances around it are all outlined. The title
 * takes `d-on-fill` through label()'s own colour, which is what tells the
 * theme check this type is meant not to follow the page.
 */
export function placement({ x, y }) {
  return group({
    class: 'd-named-mark',
    children: [
      el('rect', {
        x, y, width: PLACE_W, height: PLACE_H, rx: 10,
        fill: C.appBlue, stroke: C.appBlue, 'stroke-width': lineWidth(),
      }),
      el('g', { class: 'd-on-fill' }, [
        label({
          x: x + PLACE_W / 2, y: y + PLACE_TITLE_H / 2 + 4,
          text: 'Dapr Placement service', size: TEXT, color: C.paper,
        }),
      ]),
      partitionTable({ x: x + PLACE_PAD, y: y + PLACE_TITLE_H, size: PLACE_TABLE_SIZE }),
    ],
  });
}
