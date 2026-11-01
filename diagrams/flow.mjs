// The flow vocabulary: the shared facts behind every workflow pattern and
// every agent pattern diagram in these docs.
//
// This exists because the same four decisions - a start is green, an end is
// orange, a step that does work is teal, a step that waits is gold - are made
// by about seventeen scenes. A scene that makes them for itself is a copy, and
// copies drift: the overview once drew sixteen API tiles where the
// building-blocks page listed fifteen, because each scene carried its own list.
// Scenes name these; they do not restate them.
//
// It is deliberately constants and not builders. `node()`, `box()` and
// `decision()` already draw these shapes correctly; what was missing was one
// place to say which colour each role wears and how big a step is.
//
// A terminal names itself INSIDE its circle, the way the source flowcharts
// draw Start and End. The first draft of this kit hung the name underneath,
// reasoning that C.orange is the INK version of the brand orange rather than a
// fill meant to carry dark type. That was over-cautious: measured, C.appInk on
// --d-orange is 5.5:1 in light and 7.0:1 in dark, and on --d-green it is
// 10.3:1, so both clear the floor. The circles are sized to hold the word.

import { C } from './engine.mjs';

// The type size every shape in a flow diagram carries. One number, because a
// step, a wait and a terminal sit on the same line and a difference between
// them reads as a mistake rather than as emphasis.
const SIZE = 13;

export const FLOW = Object.freeze({
  // A workflow activity box. Narrower and taller than the first draft, on the
  // maintainer's review: 194x34 spent horizontal space these diagrams do not
  // have - the external-system pattern is four columns wide - and was too
  // shallow to set a name in at a readable size. 172x46 holds the longest name
  // on the page ("Release Inventory") on one line at SIZE with room either
  // side, and buys back 22 units per column.
  W: 172,
  H: 46,
  SIZE,

  // Between step edges, along and down the flow. The skill records about 65
  // between activity CENTRES vertically, which is this plus the box height.
  GAP_X: 58,
  GAP_Y: 28,

  // A terminal circle, big enough to set its own name in. It is LARGER than a
  // step is tall, which is what the source images do: the terminal is the one
  // shape on the line that is not a rectangle, and reading it as a marker
  // rather than a step depends on that.
  NODE_R: 30,

  // Green, solid, dark outline - the same green APP[0] gives the first app in
  // every scene - with its name inside it in the app ink, like every other
  // solid Dapr fill in the set.
  start: Object.freeze({ stroke: C.appInk, fill: C.green, ink: C.appInk, labelInside: true, size: SIZE }),

  // Orange: the flow has left the diagram.
  end: Object.freeze({ stroke: C.appInk, fill: C.orange, ink: C.appInk, labelInside: true, size: SIZE }),

  // Teal, tinted - box()'s own default, named here so a scene can say what it
  // means rather than relying on the default staying what it is.
  step: Object.freeze({ stroke: C.teal, fill: C.tealFill, size: SIZE }),

  // Gold, solid, dark ink: the flow is deliberately doing nothing - a timer,
  // a wait for an external event, or a gate deciding which way to go. The
  // source images colour all three the same and so does this.
  wait: Object.freeze({ stroke: C.appInk, fill: C.appGold, size: SIZE }),
});
