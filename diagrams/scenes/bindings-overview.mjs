// The bindings API, both directions at once: an input binding component
// triggering a method on the app, and the app executing an operation on an
// output binding component. The Dapr sidecar is in the middle of both, because
// it is in the middle of both.
//
// Replaces binding-overview.png on
// developing-applications/building-blocks/bindings/bindings-overview.md,
// under "For example, with bindings, your application can respond to incoming
// Twilio/SMS messages without...".
//
// Fact-check, against the two sentences the page puts directly under it:
//   - "The input binding triggers a method on your application." That is the
//     leg from the SIDECAR to the app, and the source's caption sits on it.
//   - "Execute output binding operations on the component, such as `create`."
//     That is the leg from the sidecar to the component, and the source's
//     other caption sits on it. The page lists the operations (`create`,
//     `update`, `delete`, `exec`) further down, under "Output bindings"; the
//     diagram says there are operations, as the source does, and the page's
//     own list says which.
//   - `/method` is the source's, and it is what the left caption is about: the
//     endpoint the sidecar calls. It is a path, so it is set in the code font,
//     as every other path in this set is.
//
// WHO THE ARROWS TOUCH. Every arrow that reaches a component reaches the
// SIDECAR, never the app, and the two legs between the app and its sidecar are
// drawn. That is a maintainer ruling (2026-11-02) and it is what the pages
// say happens: howto-bindings.md invokes an output binding by posting to
// `http://localhost:3601/v1.0/bindings/checkout`, which is the app calling its
// own sidecar, and the sidecar is what then talks to Kafka. An input binding
// runs the other way - the sidecar subscribes, and the sidecar calls the app's
// endpoint. It is also what the rest of this set already does: every arrow to
// a store, a broker or a binding in `resiliency-policies` leaves the sidecar's
// edge.
//
// Where this departs from the source image, and why:
//   - the app and its sidecar are two separate hexagons with arrows between
//     them, rather than the docked pair `appSidecar()` draws. The ruling above
//     requires a line between the two, and a line cannot be drawn between
//     shapes that overlap. `app-health` and `sidecar-health` separate them the
//     same way, for the same reason: there, too, the call between the app and
//     its sidecar is the subject.
//   - the source draws ONE arrow in each direction, straight from component to
//     app. Drawing the hop the runtime actually makes costs a second leg each
//     way; the two the source captions are the two that carry its captions,
//     and the other two are left bare, both of their ends being named.
//   - each component carries the Fluent plug mark, which is already what a
//     binding wears in this set: `resiliency-policies` marks the external
//     system an output binding reaches with the same glyph. The source draws a
//     connector glyph of its own, used nowhere else.
//   - the component hexagons are outlined in blue rather than black. Black is
//     not a token here, and blue is what every non-app hexagon in this set is
//     outlined in.

import { C, APP } from '../engine.mjs';
import { arrow, group, hex, hexEdgeAt, hexHalfWidth, label } from '../shapes.mjs';
import { icon, markHex } from '../icons.mjs';

// The span between the two components is set by the captions that cross it,
// and both are wrapped onto two lines - so the gap only has to carry the
// longer LINE, not the whole sentence, and the canvas comes in by a fifth.
// The shortcode passes a width for a canvas this narrow, which is the formula
// doing its job: the type lands at the same rendered size as every other
// diagram in the set rather than at this canvas's own scale.
const W = 800;
const H = 330;

const TEXT = 15;

// ---- the sidecar, which everything else is placed against ------------------
// It is the hub of both directions, so it takes the canvas centre and the two
// components sit on its line.
const SIDE_R = 48;
const SIDE = { x: W / 2, y: 228, r: SIDE_R, hex: true };

// ---- the app, above it -----------------------------------------------------
const APP_R = 60;
const APP_AT = { x: SIDE.x, y: 86, r: APP_R, hex: true };

// ---- the two binding components, left and right ----------------------------
const COMP_R = 76;
const COMP_IN = { x: 92, y: SIDE.y, r: COMP_R, hex: true };
const COMP_OUT = { x: W - 92, y: SIDE.y, r: COMP_R, hex: true };

// The mark over the name, as the source has them - and the PAIR is centred in
// the hexagon, not the name. Centring the name alone leaves the block sitting
// high, with the mark crowding the upper edge and the lower half empty.
// The mark's ink box is square, so it draws at GLYPH tall; the name takes
// label()'s own line height per line; and the two offsets below are the
// positions that put the block's midpoint on the hexagon's centre.
const GLYPH = 30;
const GLYPH_GAP = 10; // the mark's lowest ink to the name's first line
const NAME_LINES = 2;
const NAME_H = NAME_LINES * TEXT * 1.2;
const BLOCK_H = GLYPH + GLYPH_GAP + NAME_H;
const GLYPH_DY = BLOCK_H / 2 - GLYPH / 2;
const NAME_DY = BLOCK_H / 2 - NAME_H / 2;

// ---- the two legs between the app and its sidecar --------------------------
// Side by side in the corridor between the two shapes: the one the input
// travels UP on the left, where the input arrives, and the one the output
// travels DOWN on the right, where it leaves. Offset from the centre line, so
// each has to stop at the SLOPING part of the two hexagons rather than at the
// bottom and top vertices - which is what hexEdgeAt() answers.
const V_DX = 20;
const CLEAR = 2;
const V_TOP = APP_AT.y + hexEdgeAt(APP_R, V_DX) + CLEAR;
const V_BOTTOM = SIDE.y - hexEdgeAt(SIDE_R, V_DX) - CLEAR;

// Both captions sit above the leg between the SIDECAR and a component, which
// is where the maintainer put them: the leg between the app and its sidecar
// carries neither. Each is wrapped onto two lines and centred on the span it
// crosses, so the span has to be as wide as the longer line rather than as
// the whole sentence.
const CAPTION_DY = 30;
const gapCentre = (a, b) => (a.x + hexHalfWidth(a.r) + b.x - hexHalfWidth(b.r)) / 2;

const component = ({ x, y, r, text }) => group([
  hex({ x, y, r, stroke: C.blue, fill: C.bg, label: text, size: TEXT, labelDy: NAME_DY }),
  icon({ name: 'fluent-plug-connected', x, y: y - GLYPH_DY, size: GLYPH, color: C.blue, fit: 'ink' }),
]);

export default {
  width: W,
  height: H,
  // Pinned rather than computed. The 800 canvas asks for 75%, which is what
  // the formula gives every other scene of this size, and at that width the
  // maintainer read the drawing as too large beside the rest of the bindings
  // pages: 65% (2026-11-02). The scene is unchanged - this is the render
  // lever, not the drawing - so its type comes out a shade smaller than the
  // set's, which is the cost of the exception and is why it is recorded here
  // rather than typed into the call site.
  renderWidth: 65,
  title: 'An input binding triggering an app through its sidecar, and the app calling an output binding the same way',
  desc:
    'In the middle of the drawing, the application: a green hexagon named App with the endpoint /method under its name, and below it the Dapr sidecar, a hexagon carrying the Dapr logo. Left and right of the sidecar, on its line, sits a plug-marked hexagon each: "Input binding component" on the left and "Output binding component" on the right. Coming in, an arrow runs from the input binding component to the sidecar, and a second from the sidecar up to the app, labelled "Trigger endpoint methods on app". Going out, an arrow runs from the app down to the sidecar, and a second from the sidecar to the output binding component, labelled "Execute operations on component".',

  build() {
    return [
      // ---- in: the component reaches the sidecar, which calls the app -----
      component({ ...COMP_IN, text: 'Input binding\ncomponent' }),
      arrow({ from: COMP_IN, to: SIDE }),
      arrow({ from: [SIDE.x - V_DX, V_BOTTOM], to: [SIDE.x - V_DX, V_TOP] }),
      label({
        x: gapCentre(COMP_IN, SIDE), y: SIDE.y - CAPTION_DY,
        text: 'Trigger endpoint\nmethods on app', size: TEXT,
      }),

      // ---- out: the app calls the sidecar, which reaches the component ----
      arrow({ from: [SIDE.x + V_DX, V_TOP], to: [SIDE.x + V_DX, V_BOTTOM] }),
      component({ ...COMP_OUT, text: 'Output binding\ncomponent' }),
      arrow({ from: SIDE, to: COMP_OUT }),
      label({
        x: gapCentre(SIDE, COMP_OUT), y: SIDE.y - CAPTION_DY,
        text: 'Execute operations\non component', size: TEXT,
      }),

      // ---- the app and its sidecar, over the lines that reach them --------
      hex({ x: APP_AT.x, y: APP_AT.y, r: APP_R, label: 'App', sub: '/method', ...APP[0] }),
      markHex({ x: SIDE.x, y: SIDE.y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
    ];
  },
};
