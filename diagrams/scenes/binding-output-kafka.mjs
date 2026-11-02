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
//   - Kafka is drawn as a MESSAGE BROKER - a cylinder on its side, open at
//     both ends - rather than the source's hexagon. That is what it is, and
//     the shape is the one outline in this set that says so (2026-11-02). It
//     takes a sky fill rather than the house green, because the green belongs
//     to the app and this scene has exactly one app.
//   - the source sets the Kafka wordmark INSIDE the hexagon. The vendored mark
//     is the symbol without a wordmark (see assets/icons/README.md), so the
//     symbol is centred in the hexagon and the name sits under it in body ink,
//     which is what this set does with a mark that carries no label of its own.
//   - the source's Service is pale blue. The palette assigns app colours in
//     order and this scene has one app, so it takes APP[0], as every other
//     single-app scene in the set does.

import { C, APP } from '../engine.mjs';
import { arrow, group, hex, hexHalfWidth, label, pipe } from '../shapes.mjs';
import { icon, markHex } from '../icons.mjs';

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
const W = 742;
const H = 170;

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

// Kafka is a MESSAGE BROKER, and the broker shape is the one outline in this
// set that says so: a cylinder lying on its side, open at both ends, two to
// three times as long as it is across - pipe() refuses anything else. Same
// numbers as binding-input-kafka, the mirror of this page.
const PIPE_RY = 30;
const PIPE_RX = 12;
const PIPE_LEN = 140;
const PIPE_MARK = 32;

// A shape's NAME is not body type: it belongs to the shape and scales with
// it, which is why hex() derives it from the radius rather than taking the
// scene's TEXT. bindings-overview names its app hexagon at that default and
// this scene must agree with it, the two being adjacent pages about one API.
// Both hexagons here take the same one, because a part beside a component
// copies its measurements rather than deriving its own.
const NAME = APP_R / 3;

const ROW_Y = 72;

const APP_AT = { x: 81, y: ROW_Y, r: APP_R, hex: true };
const SIDE = { x: 387, y: ROW_Y, r: SIDE_R, hex: true };
// The broker's drawn extent runs rx beyond each end: the left rim is an
// ellipse centred on x1 and the right end bulges by the same.
const PIPE_X1 = 561;
const PIPE_X2 = PIPE_X1 + PIPE_LEN;
const PIPE = { x: (PIPE_X1 + PIPE_X2) / 2, y: ROW_Y, w: PIPE_LEN + PIPE_RX * 2, h: PIPE_RY * 2 };

// The endpoint the page's own example posts to. It is a PATH, so it takes the
// page's code font - the one font-family a scene may set - rather than the
// body font, which would read as prose. Naming it is what says the app's call
// goes to its own sidecar and not to Kafka.
const ENDPOINT = '/v1.0/bindings/checkout';

// The caption rides above the leg it names, centred on the SPAN rather than on
// either end, so it belongs to the run and not to one of the two shapes.
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
  title: 'A service invoking an output binding to Kafka through its Dapr sidecar',
  desc:
    'Three hexagons in a row. On the left, a green hexagon named App. In the middle, a hexagon carrying the Dapr logo, the service\'s sidecar, with an arrow running to it from the Service labelled with the path /v1.0/bindings/checkout. On the right, a message broker: a blue cylinder lying on its side, open at the near end, holding the Apache Kafka symbol, with the name Kafka under it. An arrow runs from the Dapr sidecar to Kafka, labelled Output binding.',

  build() {
    return [
      // ---- the app calls its own sidecar ---------------------------------
      arrow({ from: APP_AT, to: SIDE }),
      label({
        x: gapCentre(APP_AT, SIDE), y: ROW_Y - CAPTION_DY,
        text: ENDPOINT, size: TEXT, mono: true,
      }),

      // ---- the sidecar performs the binding operation on Kafka -----------
      arrow({ from: SIDE, to: PIPE }),
      label({
        x: gapCentre(SIDE, PIPE), y: ROW_Y - CAPTION_DY,
        text: 'Output binding', size: TEXT,
      }),

      // ---- the shapes, over the lines that reach them ---------------------
      hex({ x: APP_AT.x, y: APP_AT.y, r: APP_R, label: 'App', ...APP[0] }),
      group({
        class: NAMED_MARK,
        children: [
          markHex({ x: SIDE.x, y: SIDE.y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
          label({ x: SIDE.x, y: NAME_Y, text: 'Dapr sidecar', size: NAME }),
        ],
      }),
      group({
        class: NAMED_MARK,
        children: [
          // Not the house green: that is the APP's colour, and this scene has
          // exactly one app, so the broker takes another standard Dapr fill
          // rather than competing with it. Sky is the one that reads as an
          // external system Dapr connects to, and it is light enough to carry
          // the mark in the same dark ink every solid fill in the set takes -
          // which also retires the markPlate this scene needed when the mark
          // sat on bare ground and vanished in dark mode.
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
    ];
  },
};
