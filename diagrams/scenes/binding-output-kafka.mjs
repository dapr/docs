// One output binding, end to end: a service invokes its Dapr sidecar, and the
// sidecar is what reaches Kafka. The page's example binding is named
// `checkout` and its component is `bindings.kafka`.
//
// Replaces howto-bindings/kafka-output-binding.png on
// developing-applications/building-blocks/bindings/howto-bindings.md, under
// "With output bindings, you can invoke external resources."
//
// Fact-check, against the page's own prose and its example:
//   - "The example invokes the `/binding` endpoint with `checkout`, the name
//     of the binding to invoke." The page's curl is
//     `POST http://localhost:3601/v1.0/bindings/checkout` - port 3601 is the
//     SIDECAR, so the app's call is to its own sidecar, and the component's
//     `brokers: localhost:9092` is the hop the sidecar then makes to Kafka.
//     The drawing follows that split; the source image does not draw it.
//   - the component is `type: bindings.kafka`, so Kafka is the external
//     system at the far end, not the binding component itself.
//
// WHO THE ARROWS TOUCH. Every arrow that reaches a component reaches the
// SIDECAR, never the app, and the leg between the app and its sidecar is
// drawn. That is the maintainer ruling of 2026-11-02, recorded in
// bindings-overview.mjs, and this page is the example the ruling cites: the
// curl above is the app calling its own sidecar.
//
// Where this departs from the source image, and why:
//   - the source runs ONE arrow, Service straight to Kafka, captioned "Output
//     binding". The ruling requires the sidecar in the middle, so that one run
//     becomes two legs. The source's caption names the hop the binding
//     actually performs - the sidecar's call OUT - so it rides that leg, which
//     is also where bindings-overview puts both of its captions. The app's leg
//     to its sidecar is left bare, both of its ends being named, exactly as
//     the four legs in bindings-overview are. The app's leg carries the
//     ENDPOINT it posts to instead - the page's own example, which the source
//     does not name and the maintainer asked for. It is also what says the
//     call goes to the sidecar rather than to Kafka.
//   - the app and its sidecar are two separate hexagons rather than the docked
//     pair daprApp() draws, because a line cannot be drawn between shapes that
//     overlap. Same reason, same treatment as bindings-overview, app-health
//     and sidecar-health.
//   - Kafka's hexagon is outlined in blue rather than the source's black.
//     Black is not a token here, and blue is what every non-app hexagon in
//     this set is outlined in.
//   - the source sets the Kafka wordmark INSIDE the hexagon. The vendored mark
//     is the symbol without a wordmark (see assets/icons/README.md), so the
//     symbol is centred in the hexagon and the name sits under it in body ink,
//     which is what this set does with a mark that carries no label of its own.
//   - Kafka's hexagon is filled with C.markPlate so the near-black vendor
//     symbol stays legible in dark mode; see the note at the call.
//   - the source's Service is pale blue. The palette assigns app colours in
//     order and this scene has one app, so it takes APP[0], as every other
//     single-app scene in the set does.

import { C, APP } from '../engine.mjs';
import { arrow, group, hex, hexHalfWidth, label } from '../shapes.mjs';
import { markHex, MARK_IN_HEX } from '../icons.mjs';
import { NAME_DY as HEX_NAME_DY } from '../services.mjs';

// Three shapes on one line, so the canvas is the distance between them, and
// each gap is only as wide as its job. The sidecar-to-Kafka gap carries the
// caption and is sized from it: the measured text is 94 units at this size,
// plus two characters of clearance at each end, which is what the house rule
// asks for and what preview-scene.mjs measured back. The app-to-sidecar gap
// carries the endpoint the app posts to, set in the CODE font, which runs
// wider per character than the body font - it is that label rather than the
// drawing that sets this canvas's width. Its measured box is 180 units and a
// mono character advances about 0.6 of its size, so the two characters of
// clearance the house rule asks for is 16 units a side here, not the 13 a
// body-font label of this size would want.
const W = 682;
const H = 180;

// 13, which is what the rest of the set sets its body type at and what the
// render-width formula is calibrated against: it targets a 13-unit label at
// about 11.8 CSS px in this column. A scene that picks 15 instead renders its
// type 15% larger than every diagram around it however the width is set, which
// is the defect the maintainer caught on bindings-overview - and this scene
// had it too, at 13.11px against the set's 11.7 to 12.0.
const TEXT = 13;

// The same radii as bindings-overview, which draws the same three kinds of
// shape: keeping the dimension near-equal across the two pages is what keeps
// the derived type near-equal, so the two diagrams read as one set.
const APP_R = 60;
const SIDE_R = 48;
const KAFKA_R = 60;

const ROW_Y = 74;

const APP_AT = { x: 81, y: ROW_Y, r: APP_R, hex: true };
const SIDE = { x: 387, y: ROW_Y, r: SIDE_R, hex: true };
const KAFKA = { x: 601, y: ROW_Y, r: KAFKA_R, hex: true };

// The endpoint the page's own example posts to. It is a PATH, so it takes the
// page's code font - the one font-family a scene may set - rather than the
// body font, which would read as prose. Naming it is what says the app's call
// goes to its own sidecar and not to Kafka.
const ENDPOINT = '/v1.0/bindings/checkout';

// The caption rides above the leg it names, centred on the SPAN rather than on
// either end, so it belongs to the run and not to one of the two shapes.
const CAPTION_DY = 30;
const gapCentre = (a, b) => (a.x + hexHalfWidth(a.r) + b.x - hexHalfWidth(b.r)) / 2;

// The name of a mark that carries none of its own sits outside the shape,
// below it, in body ink. The offset is the SAME multiple of the radius that
// serviceHex() puts a Dapr service's name at, so a hexagon's name sits at one
// height across the set rather than at whatever looked right here.
const NAME_DY = KAFKA_R * HEX_NAME_DY;

export default {
  width: W,
  height: H,
  title: 'A service invoking an output binding to Kafka through its Dapr sidecar',
  desc:
    'Three hexagons in a row. On the left, a green hexagon named Service. In the middle, a hexagon carrying the Dapr logo, the service\'s sidecar, with an arrow running to it from the Service labelled with the path /v1.0/bindings/checkout. On the right, a hexagon holding the Apache Kafka symbol with the name Kafka under it. An arrow runs from the Dapr sidecar to Kafka, labelled Output binding.',

  build() {
    return [
      // ---- the app calls its own sidecar ---------------------------------
      arrow({ from: APP_AT, to: SIDE }),
      label({
        x: gapCentre(APP_AT, SIDE), y: ROW_Y - CAPTION_DY,
        text: ENDPOINT, size: TEXT, mono: true,
      }),

      // ---- the sidecar performs the binding operation on Kafka -----------
      arrow({ from: SIDE, to: KAFKA }),
      label({
        x: gapCentre(SIDE, KAFKA), y: ROW_Y - CAPTION_DY,
        text: 'Output binding', size: TEXT,
      }),

      // ---- the shapes, over the lines that reach them ---------------------
      hex({ x: APP_AT.x, y: APP_AT.y, r: APP_R, label: 'Service', size: TEXT, ...APP[0] }),
      markHex({ x: SIDE.x, y: SIDE.y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
      group([
        // The Kafka symbol is a single near-black (#1a1919) and its licence
        // does not let the diagram recolour it, so on the dark ground it
        // vanishes - which it did, in a scene whose every numeric test passed.
        // C.markPlate is the token for exactly this: transparent in light mode,
        // so the light rendering is unchanged, and a light plate in dark mode,
        // so the mark keeps the ground it was drawn for. The hexagon itself is
        // the plate, rather than a rectangle laid inside it.
        markHex({
          x: KAFKA.x, y: KAFKA.y, r: KAFKA_R, mark: 'kafka',
          size: KAFKA_R * MARK_IN_HEX, fill: C.markPlate,
        }),
        label({ x: KAFKA.x, y: KAFKA.y + NAME_DY, text: 'Kafka', size: TEXT }),
      ]),
    ];
  },
};
