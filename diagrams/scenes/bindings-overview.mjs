// The bindings API, both directions at once: an input binding component
// triggering a method on the app, and the app executing an operation on an
// output binding component.
//
// Replaces binding-overview.png on
// developing-applications/building-blocks/bindings/bindings-overview.md,
// under "For example, with bindings, your application can respond to incoming
// Twilio/SMS messages without...".
//
// Fact-check, against the two sentences the page puts directly under it:
//   - "The input binding triggers a method on your application." So the left
//     arrow runs INTO the app and is captioned as the source captions it,
//     "Trigger endpoint methods on app".
//   - "Execute output binding operations on the component, such as `create`."
//     So the right arrow runs OUT of the app to the component, captioned
//     "Execute operations on component". The page lists the operations
//     (`create`, `update`, `delete`, `exec`) further down, under "Output
//     bindings"; the diagram says there are operations, as the source does,
//     and the page's own list says which.
//   - `/method` is the source's, and it is what the left caption is about: the
//     endpoint the input binding calls. It is a path, so it is set in the code
//     font, as every other path in this set is.
//
// Both arrows end where the source ends them, on the APP rather than on its
// sidecar. In the runtime the component is loaded by the sidecar and it is the
// sidecar that calls the app, but neither sentence on this page is about that
// hop - they are about what a binding does - and the sidecar is drawn, so the
// pair is there to be read.
//
// Where this departs from the source image, and why:
//   - the app is appSidecar(), the pair every other diagram in this set draws.
//     The source has the same two shapes - an app hexagon with the Dapr
//     hexagon behind and below it - drawn as a decoration rather than as the
//     sidecar, with the wordmark half outside the shape.
//   - each component carries the Fluent plug mark, which is already what a
//     binding wears in this set: `resiliency-policies` marks the external
//     system an output binding reaches with the same glyph. The source draws a
//     connector glyph of its own, used nowhere else.
//   - the component hexagons are outlined in blue rather than black. Black is
//     not a token here, and blue is what every non-app hexagon in this set is
//     outlined in.

import { C, APP } from '../engine.mjs';
import { arrow, group, hex, hexHalfWidth, label } from '../shapes.mjs';
import { icon } from '../icons.mjs';
import { appSidecar } from '../app.mjs';

const W = 1000;
const H = 250;

const TEXT = 15;

// ---- the row ---------------------------------------------------------------
// One line, left to right, as the source has it: in, app, out. MID_Y clears the
// sidecar's lowest point against the bottom margin, and the component hexagons
// against the top.
const MID_Y = 106;

// ---- the two binding components --------------------------------------------
const COMP_R = 78;
const COMP_L = { x: 92, y: MID_Y, r: COMP_R, hex: true };
const COMP_R_AT = { x: 908, y: MID_Y, r: COMP_R, hex: true };
// The mark over the name, as the source has them - and the PAIR is centred in
// the hexagon, not the name. Centring the name alone leaves the block sitting
// high, with the mark crowding the upper edge and the lower half empty.
// The mark's ink box is square, so it draws at GLYPH tall; the name takes
// label()'s own line height per line; and the two offsets below are the
// positions that put the block's midpoint on the hexagon's centre.
const GLYPH = 34;
const GLYPH_GAP = 10; // the mark's lowest ink to the name's first line
const NAME_LINES = 2;
const NAME_H = NAME_LINES * TEXT * 1.2;
const BLOCK_H = GLYPH + GLYPH_GAP + NAME_H;
const GLYPH_DY = BLOCK_H / 2 - GLYPH / 2;
const NAME_DY = BLOCK_H / 2 - NAME_H / 2;

// ---- the app ---------------------------------------------------------------
const APP_R = 62;
// appSidecarCentre() for a pair at the canvas centre: the sidecar hangs off the
// right and below, so centring the hexagon instead leaves the pair off-centre.
// 486.6 rounded; the sidecar's own offset is derived, never written here.
const APP_AT = { x: 487, y: MID_Y, r: APP_R, hex: true };

// The captions sit above their arrows, far enough up to clear the arrowheads
// and still clear of the hexagons' sloping edges at that height. Each is
// centred on the GAP its arrow crosses, not between the two hexagon centres:
// the component hexagons are wider than the app, so the two are not the same
// point and the second leaves the caption nearer one shape than the other.
const CAPTION_DY = 28;
const gapCentre = (a, b) => (a.x + hexHalfWidth(a.r) + b.x - hexHalfWidth(b.r)) / 2;

const component = ({ x, y, r, text }) => group([
  hex({ x, y, r, stroke: C.blue, fill: C.bg, label: text, size: TEXT, labelDy: NAME_DY }),
  icon({ name: 'fluent-plug-connected', x, y: y - GLYPH_DY, size: GLYPH, color: C.blue, fit: 'ink' }),
]);

export default {
  width: W,
  height: H,
  title: 'An input binding triggering an app, and the app calling an output binding',
  desc:
    'Three shapes in a row. On the left, a hexagon marked with a plug and named "Input binding component". In the middle, the application: a green hexagon named App, with the endpoint /method under its name, and its Dapr sidecar hexagon below and to the right. On the right, another plug-marked hexagon, "Output binding component". An arrow runs from the input binding component to the app, labelled "Trigger endpoint methods on app". A second arrow runs from the app to the output binding component, labelled "Execute operations on component".',

  build() {
    return [
      // ---- in: the component triggers the app ----------------------------
      component({ ...COMP_L, text: 'Input binding\ncomponent' }),
      arrow({ from: COMP_L, to: APP_AT }),
      label({
        x: gapCentre(COMP_L, APP_AT), y: MID_Y - CAPTION_DY,
        text: 'Trigger endpoint methods on app', size: TEXT,
      }),

      // ---- out: the app executes an operation on the component -----------
      component({ ...COMP_R_AT, text: 'Output binding\ncomponent' }),
      arrow({ from: APP_AT, to: COMP_R_AT }),
      label({
        x: gapCentre(APP_AT, COMP_R_AT), y: MID_Y - CAPTION_DY,
        text: 'Execute operations on component', size: TEXT,
      }),

      // ---- the app itself, over the lines that reach it ------------------
      appSidecar({ x: APP_AT.x, y: APP_AT.y, r: APP_R, label: 'App', sub: '/method', ...APP[0] }),
    ];
  },
};
