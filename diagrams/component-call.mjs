// AN APP, ITS DAPR SIDECAR, AND ONE COMPONENT IT REACHES - the picture the
// building-block how-to pages draw.
//
// Two of those pages, configuration and state management, ship the same source
// image with one word different: an "Order Processing Service" box, a sidecar
// carrying its app id, a Redis circle, and a caption on the line between the
// sidecar and the store. Drawing that twice is how two pages end up disagreeing
// about a shape nobody meant to change - the overview and the building-blocks
// page each carried their own copy of the API list and silently drifted to
// different lengths, which is why apis.mjs exists.
//
// So this is the picture, once. A scene names what differs - its caption, its
// call, its title and desc - and keeps its own fact-check in its own header,
// because what a page CLAIMS is the scene's business and not this module's.
//
// The two pictures are no longer byte-identical, and that is the point of the
// module rather than a failure of it: each page now also shows the HTTP call
// it documents, which is a different endpoint on each. Everything a reader
// moving between the pages could mistake for a change of meaning - every
// radius, every gap, every baseline - is still computed once, here.
//
// It is a whole scene rather than a builder because the whole picture is what
// repeats. The moment one of these pages wants a different arrangement, that
// page stops calling this and draws itself: a skeleton is shared only for as
// long as both pictures want that shape, and letting it break is cheaper than
// bending it with options nobody can check.

import { C, APP } from './engine.mjs';
import {
  arrow, cylinder, group, hex, hexHalfWidth, label, richLabel, STORE_RATIO,
} from './shapes.mjs';
import { icon, markHex } from './icons.mjs';
import { NAME_DY as HEX_NAME_DY } from './services.mjs';

// Three shapes on one line, so the canvas is the distance between them and
// each gap is only as wide as its job: the store's gap carries the caption and
// is sized from it, the app's carries nothing and is the shorter of the two.
const ROW_H = 182;

// Least space from the drawing to any edge.
const EDGE = 29;
const V_EDGE = 14;

// 13, the size render-width.mjs is calibrated against; see
// diagrams/type-size.test.mjs.
const TEXT = 13;

const APP_R = 60;
const SIDE_R = 48;
// The store is a CYLINDER, not a hexagon: it is a data store, and a store is
// the one shape in this set that says so by its outline. Drawn as wide as the
// hexagons beside it are, so the three read as one row.
const STORE_W = 120;
// cylinder() derives its depth from the width, so the mark it holds is sized
// from the width too and the two cannot drift apart.
const STORE_MARK = 44;

// The app's name is CHOSEN rather than derived, as on the service invocation
// example and for the same reason: "Processing" is ten characters, a hexagon
// is 1.732r across and a derived name is r / 3, so the longest line would sit
// against the edges at any radius. 17 leaves it about a character and a half.
const APP_NAME = 17;

// A mark and the name under it are ONE component, and saying so in the markup
// is what lets diagrams/type-size.test.mjs tell a shape's NAME from the
// scene's body type: it reads free labels, and a name a scene draws itself is
// otherwise indistinguishable from a caption. Every shape builder marks its
// own group with a `d-` class; a mark named here has to say it.
const NAMED_MARK = 'd-named-mark';

const ROW_Y = 74;

const APP_AT = { x: EDGE + hexHalfWidth(APP_R), y: ROW_Y, r: APP_R, hex: true };
const SIDE = { x: 255, y: ROW_Y, r: SIDE_R, hex: true };
// As a rect for the arrow: cylinder() derives its depth from the width by
// STORE_RATIO, so the box the line stops at is the box the shape draws rather
// than a second set of numbers that could drift from it.
// The store's gap is sized from the LONGEST caption this picture carries, not
// from each page's own: "State management" measures 118.5 units where "Get
// configuration" measures 109.6, and a gap cut to the shorter one leaves the
// longer five units a side where the house rule asks for two characters.
// Sizing both from the longest is what keeps the two pages the SAME picture,
// which is the whole reason they share this file - the cost is nine units of
// slack on the shorter caption, and the alternative is a drawing that shifts
// under a reader moving between the pages. Measured on the rendered page,
// because the exporter has no font metrics.
const CAPTION_W = 118.5;

// Derived rather than typed, so the gap cannot quietly stop matching the rule
// above: the caption, plus two characters of clearance at each end.
const STORE_X = SIDE.x + hexHalfWidth(SIDE_R) + CAPTION_W + TEXT * 2 + STORE_W / 2;
const STORE = { x: STORE_X, y: ROW_Y, w: STORE_W, h: STORE_W / STORE_RATIO };

// Whole units: a canvas is a number a reader of the scene can hold.
const W = Math.ceil(STORE_X + STORE_W / 2 + EDGE);

const CAPTION_DY = 30;
// Each shape's own half width, because the row is not three hexagons: a
// hexagon is measured by its radius and the store by the box it draws in.
const halfW = (s) => (s.w === undefined ? hexHalfWidth(s.r) : s.w / 2);
const gapCentre = (a, b) => (a.x + halfW(a) + b.x - halfW(b)) / 2;

// A mark's name sits outside its shape, below it, at the offset serviceHex()
// uses. Two marks standing in a ROW take ONE baseline rather than each its
// own: the offset scales with the radius, so deriving it per shape put the
// sidecar's name sixteen units above the store's and the pair read as
// misaligned. It comes off the DEEPEST shape, so the shallower one's name
// still clears it.
const NAME_Y = ROW_Y + Math.max(SIDE_R, STORE_W / 2) * HEX_NAME_DY;

// Both calls answer, so each is ONE line with a head at each end rather than
// two lines side by side: the same arrow drawn twice, once each way.
const bothWays = (from, to) => [arrow({ from, to }), arrow({ from: to, to: from })];

// ---- the HTTP call, under the row -------------------------------------------
// Set as `conversation-overview` sets its own: the PATH only, in the code
// face, with the building block picked out of it; the method on the line
// above, in the blue this set gives a method. The host is left off there
// because the reference writes it as `<daprPort>` and it carries no fact the
// path does not - the same is true of the `localhost:3601` these pages print
// in their curl commands, which is whatever port the reader's `dapr run`
// chose.
//
// It clears the sidecar's NAME, not the sidecar. The name is set at 17 and
// reaches about twelve below its own baseline while the method reaches eight
// above its own, so measuring against the baselines puts the two boxes
// together although neither baseline looks close: 5.2 is what clears them,
// and it is the number conversation-overview arrived at the same way.
const CALL_DY = TEXT * 5.2;
const METHOD_DY = TEXT * 1.9;
// A request BODY, where the page's command sends one, goes a line under the
// path at the same pitch the method sits above it, so the three read as one
// block. Set as httpCard() sets its own body: the code face at weight 400,
// because a request and what it carries are the same kind of text and
// label()'s own default of 600 makes the payload the louder of the two.
const BODY_DY = TEXT * 1.9;

/**
 * Where the call is centred. It belongs to the APP-to-SIDECAR leg, so it is
 * centred on that pair - but the configuration path is 344 units against the
 * pair's 268, so centring alone would hang it off the left edge of the canvas.
 * Clamped to the margin, which is where `conversation-overview` puts its own
 * for the same reason. The clamp is against the call's WIDEST line, which on
 * the state page is the payload rather than the path.
 */
const callMid = (width) =>
  Math.max(EDGE + width / 2, (APP_AT.x - hexHalfWidth(APP_R) + SIDE.x + hexHalfWidth(SIDE_R)) / 2);

/**
 * The scene. `caption` is the only thing these pages differ by today; the
 * rest take the defaults both of them draw, and are options so that the next
 * page to show this picture with another app or another store does not have
 * to fork the module to say so.
 */
export function componentCall({
  title,
  desc,
  caption,
  call,
  app = 'Order\nProcessing\nService',
  sidecar = 'Dapr sidecar',
  storeMark = 'redis',
  storeName = 'Redis',
}) {
  if (!caption) throw new Error('componentCall(): a caption names the call and is required');
  if (call && !(call.width > 0)) {
    // The exporter has no font metrics, so the width is measured on the
    // rendered page and passed in. Refuse rather than guess: a call placed
    // from an estimate is the one thing here that can run off the canvas, and
    // nothing downstream would see it.
    throw new Error('componentCall(): a call needs its measured `width`');
  }
  const CALL_Y = NAME_Y + CALL_DY;
  const CALL_MID = call ? callMid(call.width) : 0;
  const BODY_Y = CALL_Y + BODY_DY;
  const LAST_Y = call?.body ? BODY_Y : CALL_Y;
  return {
    width: W,
    height: call ? Math.ceil(LAST_Y + TEXT * 0.5 + V_EDGE) : ROW_H,
    title,
    desc,

    build() {
      return [
        // ---- the app asks its own sidecar, and is answered ---------------
        bothWays(APP_AT, SIDE),

        // ---- the sidecar reaches the store, and is answered --------------
        bothWays(SIDE, STORE),
        label({
          x: gapCentre(SIDE, STORE), y: ROW_Y - CAPTION_DY,
          text: caption, size: TEXT,
        }),

        // ---- the shapes, over the lines that reach them -------------------
        hex({
          x: APP_AT.x, y: APP_AT.y, r: APP_R,
          label: app, size: APP_NAME, ...APP[0],
        }),
        group({
          class: NAMED_MARK,
          children: [
            markHex({ x: SIDE.x, y: SIDE.y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
            label({ x: SIDE.x, y: NAME_Y, text: sidecar, size: APP_NAME }),
          ],
        }),
        group({
          class: NAMED_MARK,
          children: [
            cylinder({ x: STORE.x, y: STORE.y, w: STORE_W }),
            // On the store's own gold, in the ink everything else on that fill
            // takes. A single-colour mark tints and follows the shape it sits
            // on - no plate, unlike the full-colour marks.
            icon({
              name: storeMark, x: STORE.x, y: STORE.y, size: STORE_MARK,
              color: C.appInk, fit: 'ink',
            }),
            label({ x: STORE.x, y: NAME_Y, text: storeName, size: APP_NAME }),
          ],
        }),

        // ---- and the call the page documents for that first leg -----------
        // The PATH is emitted BEFORE the method, though it is drawn under it.
        // The theme check samples the first text in a scene that is not on a
        // plate or a solid fill, and a method is C.blue - a brand colour, the
        // same value in both themes by design - so leading with it makes the
        // check read a scene that re-themes perfectly as one that does not.
        // Nothing moves: the two do not overlap.
        call
          ? group([
            richLabel({
              x: CALL_MID, y: CALL_Y, size: TEXT, anchor: 'middle', mono: true,
              parts: call.path,
            }),
            call.body
              ? label({
                x: CALL_MID, y: BODY_Y, text: call.body,
                size: TEXT, weight: 400, mono: true,
              })
              : null,
            label({
              x: CALL_MID, y: CALL_Y - METHOD_DY,
              text: call.method, size: TEXT, weight: 700, color: C.blue,
            }),
          ])
          : null,
      ];
    },
  };
}
