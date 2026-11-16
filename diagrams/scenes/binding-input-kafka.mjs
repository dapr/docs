// One input binding, end to end: Kafka produces an event, the Dapr sidecar
// picks it up and triggers the service on the endpoint named after the
// binding. The page's example binding is named `checkout` and its component
// is `bindings.kafka` with `direction: input`.
//
// Replaces howto-triggers/kafka-input-binding.png on
// developing-applications/building-blocks/bindings/howto-triggers.md, under
// "With input bindings, you can trigger your application when an event from
// an external resource occurs."
//
// This is `binding-output-kafka` mirrored: the same three shapes at the same
// radii, in the same order of travel, with the traffic running the other way.
// The two pages are the two halves of one API and a reader meets them one
// after the other, so they are deliberately the same drawing - anything that
// changes in one changes in the other.
//
// Fact-check, against the page's own prose and its code:
//   - "Listen on a POST endpoint with the name of the binding, as specified in
//     metadata.name in the binding.yaml file." The component is named
//     `checkout` and every SDK example on the page routes POST /checkout, so
//     that is the endpoint the sidecar calls and it is what the app's leg
//     carries.
//   - the component is `type: bindings.kafka` with `brokers: localhost:9092`,
//     so Kafka is the external system the SIDECAR subscribes to, not something
//     the app talks to.
//
// DISCREPANCY, raised and not resolved here. The three numbered points under
// this diagram are byte-identical to the ones on howto-bindings.md, the
// OUTPUT binding page: they describe invoking the `/binding` endpoint, the
// `operation` field, and link to "which operations are supported for every
// output binding". None of that describes an input binding, where Dapr calls
// the app rather than the app calling Dapr. The page's own "Listen for
// incoming events" section and all five code samples are correct and
// consistent, so the drawing follows those. The numbered list is left alone
// for the maintainers.
//
// WHO THE ARROWS TOUCH. Every arrow that reaches a component reaches the
// SIDECAR, never the app, and the leg between the sidecar and the app is
// drawn. That is the maintainer ruling of 2026-11-02, recorded in
// bindings-overview.mjs. For an input binding it runs inward: the sidecar
// subscribes to Kafka, and the sidecar calls the app.
//
// Where this departs from the source image, and why:
//   - the source runs ONE arrow, Kafka straight to the Service, captioned
//     "Input binding". The ruling puts the sidecar in the middle, so that run
//     becomes two legs. The source's caption names the hop the binding
//     performs - the sidecar's subscribe - so it rides that leg, and the
//     app's leg carries the endpoint the sidecar calls.
//   - the app and its sidecar are two separate hexagons rather than the docked
//     pair daprApp() draws, because a line cannot be drawn between shapes that
//     overlap. Same reason and same treatment as bindings-overview.
//   - Kafka is drawn as a MESSAGE BROKER - a cylinder on its side, open at
//     both ends - rather than the source's hexagon. That is what it is, and
//     the shape is the one outline in this set that says so (2026-11-02). It
//     takes a sky fill rather than the house green, because the green belongs
//     to the app and this scene has exactly one app.
//   - the source's Service is pale blue. The palette assigns app colours in
//     order and this scene has one app, so it takes APP[0].

import { C, APP } from '../engine.mjs';
import { arrow, group, hex, hexHalfWidth, label, pipe } from '../shapes.mjs';
import { icon, markHex } from '../icons.mjs';

// Three shapes on one line, so the canvas is the distance between them and
// each gap is only as wide as its job. Kafka's gap carries the caption; the
// app's carries the endpoint, which is set in the CODE font and runs wider
// per character, so it needs two MONO characters of clearance a side rather
// than the thirteen units a body-font label of this size would want.
const W = 632;
const H = 170;

// 13, the size render-width.mjs is calibrated against and the size the rest
// of the set uses for its body type. diagrams/type-size.test.mjs checks it.
const TEXT = 13;

// A shape's NAME is not body type: it belongs to the shape and scales with it,
// which is why hex() derives it from the radius. Both hexagons take the same
// one, matching binding-output-kafka and bindings-overview.
const NAME = 60 / 3;

// The same radii as binding-output-kafka and bindings-overview: near-equal
// dimensions across the three pages are what make the derived type near-equal,
// so the set reads as one drawing at one size.
const APP_R = 60;
const SIDE_R = 48;

// Kafka is a MESSAGE BROKER, and the broker shape is the one outline in this
// set that says so: a cylinder lying on its side, open at both ends, two to
// three times as long as it is across - pipe() refuses anything else.
const PIPE_RY = 30;
const PIPE_RX = 12;
const PIPE_LEN = 140;
const PIPE_MARK = 32;

const ROW_Y = 72;

// Mirrored against the output scene: Kafka produces on the left, the app is
// triggered on the right.
// The broker's drawn extent runs rx beyond each end: the left rim is an
// ellipse centred on x1 and the right end bulges by the same.
const PIPE_X1 = 41;
const PIPE_X2 = PIPE_X1 + PIPE_LEN;
const PIPE = { x: (PIPE_X1 + PIPE_X2) / 2, y: ROW_Y, w: PIPE_LEN + PIPE_RX * 2, h: PIPE_RY * 2 };

const SIDE = { x: 355, y: ROW_Y, r: SIDE_R, hex: true };
const APP_AT = { x: 551, y: ROW_Y, r: APP_R, hex: true };

// The endpoint the sidecar calls, which is the binding's own name. It is a
// PATH, so it takes the page's code font rather than the body font.
const ENDPOINT = '/checkout';

const CAPTION_DY = 30;
// Each shape's own half width: the row is no longer three hexagons, so a
// hexagon is measured by its radius and the broker by the box it draws in.
const halfW = (o) => (o.w === undefined ? hexHalfWidth(o.r) : o.w / 2);
const gapCentre = (a, b) => (a.x + halfW(a) + b.x - halfW(b)) / 2;

// The sidecar and the broker are both marks with a name under them, and they
// stand in a ROW, so they share ONE baseline rather than each taking its own
// offset: derived per shape it would sit the sidecar's name eighteen units
// below the broker's and the pair would read as misaligned. It comes off the
// DEEPER of the two, so the shallower one's name still clears it.
const NAME_Y = ROW_Y + Math.max(SIDE_R, PIPE_RY) + 22;

// A mark and the name under it are ONE component. Saying so in the markup is
// what lets diagrams/type-size.test.mjs tell a shape's NAME from the scene's
// body type: it reads free labels, and a name the scene draws itself is
// otherwise indistinguishable from a caption.
const NAMED_MARK = 'd-named-mark';

export default {
  width: W,
  height: H,
  title: 'Kafka triggering a service through its Dapr sidecar with an input binding',
  desc:
    'Three shapes in a row. On the left, a message broker: a blue cylinder lying on its side, open at the near end, holding the Apache Kafka symbol, with the name Kafka under it. In the middle, a hexagon carrying the Dapr logo, the service\'s sidecar, with an arrow running to it from Kafka labelled Input binding. On the right, a green hexagon named App, with an arrow running to it from the Dapr sidecar labelled with the path /checkout.',

  build() {
    return [
      // ---- the sidecar subscribes to Kafka --------------------------------
      arrow({ from: PIPE, to: SIDE }),
      label({
        x: gapCentre(PIPE, SIDE), y: ROW_Y - CAPTION_DY,
        text: 'Input binding', size: TEXT,
      }),

      // ---- and triggers the app on the binding's own endpoint -------------
      arrow({ from: SIDE, to: APP_AT }),
      label({
        x: gapCentre(SIDE, APP_AT), y: ROW_Y - CAPTION_DY,
        text: ENDPOINT, size: TEXT, mono: true,
      }),

      // ---- the shapes, over the lines that reach them ---------------------
      group({
        class: NAMED_MARK,
        children: [
          // Not the house green: that is the APP's colour, and this scene has
          // exactly one app, so the broker takes another standard Dapr fill
          // rather than competing with it. Sky is the one that reads as an
          // external system Dapr connects to, and it is light enough to carry
          // the mark in the same dark ink every solid fill in the set takes.
          pipe({
            x1: PIPE_X1, x2: PIPE_X2, y: ROW_Y,
            ry: PIPE_RY, rx: PIPE_RX, fill: C.appSky,
          }),
          icon({
            name: 'kafka', x: PIPE.x, y: ROW_Y, size: PIPE_MARK,
            color: C.appInk, fit: 'ink',
          }),
          label({ x: PIPE.x, y: NAME_Y, text: 'Kafka', size: NAME }),
        ],
      }),
      group({
        class: NAMED_MARK,
        children: [
          markHex({ x: SIDE.x, y: SIDE.y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
          label({ x: SIDE.x, y: NAME_Y, text: 'Dapr sidecar', size: NAME }),
        ],
      }),
      hex({ x: APP_AT.x, y: APP_AT.y, r: APP_R, label: 'App', ...APP[0] }),
    ];
  },
};
