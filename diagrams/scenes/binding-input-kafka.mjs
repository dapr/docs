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
//   - Kafka's hexagon is outlined in blue rather than the source's black, and
//     filled with C.markPlate so the near-black vendor symbol stays legible in
//     dark mode. Both as binding-output-kafka; see its header.
//   - the source's Service is pale blue. The palette assigns app colours in
//     order and this scene has one app, so it takes APP[0].

import { C, APP } from '../engine.mjs';
import { arrow, group, hex, hexHalfWidth, label } from '../shapes.mjs';
import { markHex, MARK_IN_HEX } from '../icons.mjs';
import { NAME_DY as HEX_NAME_DY } from '../services.mjs';

// Three shapes on one line, so the canvas is the distance between them and
// each gap is only as wide as its job. Kafka's gap carries the caption; the
// app's carries the endpoint, which is set in the CODE font and runs wider
// per character, so it needs two MONO characters of clearance a side rather
// than the thirteen units a body-font label of this size would want.
const W = 572;
const H = 188;

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
const KAFKA_R = 60;

const ROW_Y = 74;

// Mirrored against the output scene: Kafka produces on the left, the app is
// triggered on the right.
const KAFKA = { x: 81, y: ROW_Y, r: KAFKA_R, hex: true };
const SIDE = { x: 295, y: ROW_Y, r: SIDE_R, hex: true };
const APP_AT = { x: 491, y: ROW_Y, r: APP_R, hex: true };

// The endpoint the sidecar calls, which is the binding's own name. It is a
// PATH, so it takes the page's code font rather than the body font.
const ENDPOINT = '/checkout';

const CAPTION_DY = 30;
const gapCentre = (a, b) => (a.x + hexHalfWidth(a.r) + b.x - hexHalfWidth(b.r)) / 2;

// A mark's name sits outside its shape, below it, at the offset serviceHex()
// uses, so a hexagon's name is at one height across the set.
const NAME_DY = KAFKA_R * HEX_NAME_DY;

export default {
  width: W,
  height: H,
  title: 'Kafka triggering a service through its Dapr sidecar with an input binding',
  desc:
    'Three hexagons in a row. On the left, a hexagon holding the Apache Kafka symbol with the name Kafka under it. In the middle, a hexagon carrying the Dapr logo, the service\'s sidecar, with an arrow running to it from Kafka labelled Input binding. On the right, a green hexagon named Service, with an arrow running to it from the Dapr sidecar labelled with the path /checkout.',

  build() {
    return [
      // ---- the sidecar subscribes to Kafka --------------------------------
      arrow({ from: KAFKA, to: SIDE }),
      label({
        x: gapCentre(KAFKA, SIDE), y: ROW_Y - CAPTION_DY,
        text: 'Input binding', size: TEXT,
      }),

      // ---- and triggers the app on the binding's own endpoint -------------
      arrow({ from: SIDE, to: APP_AT }),
      label({
        x: gapCentre(SIDE, APP_AT), y: ROW_Y - CAPTION_DY,
        text: ENDPOINT, size: TEXT, mono: true,
      }),

      // ---- the shapes, over the lines that reach them ---------------------
      group([
        markHex({
          x: KAFKA.x, y: KAFKA.y, r: KAFKA_R, mark: 'kafka',
          size: KAFKA_R * MARK_IN_HEX, fill: C.markPlate,
        }),
        label({ x: KAFKA.x, y: KAFKA.y + NAME_DY, text: 'Kafka', size: NAME }),
      ]),
      markHex({ x: SIDE.x, y: SIDE.y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
      hex({ x: APP_AT.x, y: APP_AT.y, r: APP_R, label: 'Service', ...APP[0] }),
    ];
  },
};
