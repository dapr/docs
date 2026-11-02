// Getting configuration from a store: the order processing service asks its
// Dapr sidecar, and the sidecar reads the Redis configuration store. Both
// calls answer, so both lines carry a head at each end.
//
// Replaces building-block-configuration-example.png on
// developing-applications/building-blocks/configuration/
// howto-manage-configuration.md, under "This example uses the Redis
// configuration store component".
//
// Fact-check, against the page's own commands and component file:
//   - the source labels the sidecar "ID: orderprocessing", which is the app
//     id the page's five language tabs all run with. This names the shape
//     "Dapr sidecar" instead - a maintainer decision of 2026-11-02: the
//     diagram's subject is where configuration is read from, not what the app
//     is called, and the id is in every `dapr run` command on the page.
//   - the component is `name: configstore`, `type: configuration.redis`, so
//     the store at the far end is Redis and the page runs it in Docker.
//   - the page is "get application configuration AND subscribe for changes".
//     The source draws only the get, and names it "Get configuration"; this
//     is a redraw, so it draws the get and the page's own prose covers the
//     subscribe.
//
// WHO THE ARROWS TOUCH. The app asks its SIDECAR and the sidecar reads the
// store, which is the maintainer ruling of 2026-11-02 recorded in
// bindings-overview.mjs. The source already draws it that way - app, sidecar,
// store, with a line between each pair - so unlike the bindings pages nothing
// had to be re-routed here.
//
// Where this departs from the source image, and why:
//   - the source is drawn in an older style this set does not use: grey boxes,
//     a blue square sidecar, a white circle for Redis. The shapes are mapped
//     onto the house ones - an app hexagon, the Dapr hexagon, and a marked
//     hexagon for the component, which is exactly how the two bindings how-tos
//     next door draw Kafka.
//   - a Dapr hexagon carries the Dapr mark and nothing else here, so its name
//     sits under it the way every mark in this set is named - and it is a
//     NAME, in the body font, rather than the id the source set there.
//   - Redis is a CYLINDER, where the bindings pages draw Kafka in a hexagon.
//     It is a data store, and the cylinder is the one outline in this set that
//     says so; Kafka there is a broker reached through a binding, not a store.
//     Gold with dark ink on it, as every store in the set is.
//   - the mark is `redis.svg`, Simple Icons' current one, not the older
//     stacked-cubes `redis-color.svg`. It is single-colour, so it takes the
//     ink the store's own fill carries and needs no plate - the plate exists
//     for full-colour marks that cannot be tinted.

import { C, APP } from '../engine.mjs';
import { arrow, cylinder, group, hex, hexHalfWidth, label, STORE_RATIO } from '../shapes.mjs';
import { icon, markHex } from '../icons.mjs';
import { NAME_DY as HEX_NAME_DY } from '../services.mjs';

// Three shapes on one line, so the canvas is the distance between them and
// each gap is only as wide as its job: the store's gap carries the caption and
// is sized from it, the app's carries nothing and is the shorter of the two.
const W = 566;
const H = 182;

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
// own group with a `d-` class; a mark named by the scene has to say it here.
const NAMED_MARK = 'd-named-mark';

const ROW_Y = 74;

const APP_AT = { x: 81, y: ROW_Y, r: APP_R, hex: true };
const SIDE = { x: 255, y: ROW_Y, r: SIDE_R, hex: true };
// As a rect for the arrow: cylinder() derives its depth from the width by
// STORE_RATIO, so the box the line stops at is the box the shape draws rather
// than a second set of numbers that could drift from it.
const STORE = { x: 485, y: ROW_Y, w: STORE_W, h: STORE_W / STORE_RATIO };

const CAPTION_DY = 30;
// Each shape's own half width, because the row is no longer three hexagons:
// a hexagon is measured by its radius and the store by the box it draws in.
const halfW = (s) => (s.w === undefined ? hexHalfWidth(s.r) : s.w / 2);
const gapCentre = (a, b) => (a.x + halfW(a) + b.x - halfW(b)) / 2;

// A mark's name sits outside its shape, below it, at the offset serviceHex()
// uses. Two marks standing in a ROW take ONE baseline rather than each its
// own: the offset scales with the radius, so deriving it per shape put the
// sidecar's id sixteen units above Redis's name and the pair read as
// misaligned. It comes off the DEEPEST shape, so the shallower one's name
// still clears it.
const NAME_Y = ROW_Y + Math.max(SIDE_R, STORE_W / 2) * HEX_NAME_DY;

// Both calls answer, so each is ONE line with a head at each end rather than
// two lines side by side: the same arrow drawn twice, once each way.
const bothWays = (from, to) => [arrow({ from, to }), arrow({ from: to, to: from })];

export default {
  width: W,
  height: H,
  title: 'A service reading configuration from a Redis store through its Dapr sidecar',
  desc:
    'Three shapes in a row. On the left, a green hexagon named Order Processing Service. In the middle, a hexagon carrying the Dapr logo, named Dapr sidecar. On the right, a gold data-store cylinder holding the Redis mark, named Redis. A line with a head at each end joins the service to its sidecar, and a second joins the sidecar to Redis, labelled Get configuration.',

  build() {
    return [
      // ---- the app asks its own sidecar, and is answered -----------------
      bothWays(APP_AT, SIDE),

      // ---- the sidecar reads the store, and is answered ------------------
      bothWays(SIDE, STORE),
      label({
        x: gapCentre(SIDE, STORE), y: ROW_Y - CAPTION_DY,
        text: 'Get configuration', size: TEXT,
      }),

      // ---- the shapes, over the lines that reach them ---------------------
      hex({
        x: APP_AT.x, y: APP_AT.y, r: APP_R,
        label: 'Order\nProcessing\nService', size: APP_NAME, ...APP[0],
      }),
      group({
        class: NAMED_MARK,
        children: [
          markHex({ x: SIDE.x, y: SIDE.y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
          label({
            // Named, not identified: the size matches "Redis" beside it on
            // the same baseline, because the two are the same kind of thing -
            // a mark and its name - and a row of names at two sizes reads as
            // a mistake rather than as a hierarchy.
            x: SIDE.x, y: NAME_Y, text: 'Dapr sidecar', size: APP_NAME,
          }),
        ],
      }),
      group({
        class: NAMED_MARK,
        children: [
          cylinder({ x: STORE.x, y: STORE.y, w: STORE_W }),
          // On the store's own gold, in the ink everything else on that fill
          // takes. The mark is single-colour, so it tints and follows nothing
          // but the shape it sits on - no plate, unlike the full-colour marks.
          icon({
            name: 'redis', x: STORE.x, y: STORE.y, size: STORE_MARK,
            color: C.appInk, fit: 'ink',
          }),
          label({ x: STORE.x, y: NAME_Y, text: 'Redis', size: APP_NAME }),
        ],
      }),
    ];
  },
};
