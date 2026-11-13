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
// It began as constants and nothing else, on the grounds that `node()`, `box()`
// and `decision()` already draw these shapes correctly and all that was missing
// was one place to say which colour each role wears. That was half the job. The
// concept scenes have a MIDDLE layer the workflow scenes did not - `app.mjs`,
// `services.mjs`, `cards.mjs`: modules that own an arrangement, so a scene
// names a thing rather than re-deriving it - and every module there exists
// because some arrangement had already drifted between scenes before anyone
// looked. The workflow scenes re-derived their lanes and their annotations ten
// times over, and three of the four defects a review of the multi-application
// page found were that drift: five copies of the lane pad, five hand-written
// note labels, four hand-rolled lane helpers, and a caption size every one of
// them forgot to pass. `flowLane()` and `note()` are that middle layer. They
// are deliberately thin - a lane IS a region() and a note IS a label() - and
// the point of them is not what they compute but what a scene can no longer
// get wrong.
//
// A terminal names itself INSIDE its circle, the way the source flowcharts
// draw Start and End. The first draft of this kit hung the name underneath,
// reasoning that C.orange is the INK version of the brand orange rather than a
// fill meant to carry dark type. That was over-cautious: measured, C.appInk on
// --d-orange is 5.5:1 in light and 7.0:1 in dark, and on --d-green it is
// 10.3:1, so both clear the floor. The circles are sized to hold the word.

import { C } from './engine.mjs';
import { captionReach, label, region } from './shapes.mjs';

// The type size every shape in a flow diagram carries. One number, because a
// step, a wait and a terminal sit on the same line and a difference between
// them reads as a mistake rather than as emphasis.
const SIZE = 13;

// A step box and a terminal circle, named here so the lane heights below can
// be derived from them rather than restated.
const W = 172;
const H = 46;
const NODE_R = 30;

// How far a lane stands off whatever it holds. Measured from how far the
// caption pill hangs INSIDE the border - `captionReach()` - and not from the
// border itself, because the pill is the first thing a shape placed at the top
// of a lane runs into. Rounded up from that reach so there is daylight rather
// than a touch.
const PAD = Math.ceil(captionReach()) + 13;

export const FLOW = Object.freeze({
  // A workflow activity box. Narrower and taller than the first draft, on the
  // maintainer's review: 194x34 spent horizontal space these diagrams do not
  // have - the external-system pattern is four columns wide - and was too
  // shallow to set a name in at a readable size. 172x46 holds the longest name
  // on the page ("Release Inventory") on one line at SIZE with room either
  // side, and buys back 22 units per column.
  W,
  H,
  SIZE,

  // What a region's caption is set in. region() defaults to 15, which is right
  // for the concept diagrams - their body text is 13 to 15 and the caption is
  // the largest thing on a dashed band that holds cards. A flow diagram's text
  // is SIZE, so a 15 pill sat two steps above the activity names underneath it
  // and read as a heading for the page rather than a name for the lane. The
  // regular scenes already do this: each one has a TEXT constant and passes
  // `captionSize: TEXT`. This is the flow set's TEXT, and `flowLane()` below
  // is what makes passing it no longer a thing a scene can forget.
  CAPTION_SIZE: SIZE,

  // What an annotation on the flow is set in: "allowed", "denied", "Yes",
  // "caller identity over mTLS". One step below SIZE and lighter, because it
  // is a remark ABOUT the flow rather than the name OF a shape, and the two
  // have to be told apart at a glance. One number, in one place, for the same
  // reason CAPTION_SIZE is: five scenes each wrote this out, and a sixth that
  // wrote 13 instead of 12 would have looked like emphasis.
  NOTE_SIZE: 12,

  // How far a lane stands off its contents. See PAD above.
  PAD,

  // The two lane heights, because a lane holds one row and a row is either
  // terminals or activities. Terminals are circles and taller than a step box,
  // so these are different numbers; the scenes that hold both rows had each
  // written out both of them.
  LANE_TERMINAL_H: NODE_R * 2 + PAD * 2,
  LANE_ACTIVITY_H: H + PAD * 2,

  // Between step edges, along and down the flow. The skill records about 65
  // between activity CENTRES vertically, which is this plus the box height.
  GAP_X: 58,
  GAP_Y: 28,

  // A terminal circle, big enough to set its own name in. It is LARGER than a
  // step is tall, which is what the source images do: the terminal is the one
  // shape on the line that is not a rectangle, and reading it as a marker
  // rather than a step depends on that.
  NODE_R,

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

// The dashed band a row of a flow diagram sits in: an application, a workflow,
// a try or a catch. It is `pod()`'s counterpart for this set - a region() with
// the house decisions already made - and it takes region()'s own x/y/w/h,
// because where a lane goes is the one thing only the scene knows.
//
// `captionX` moves the pill along the top border. A region's pill is drawn WITH
// the region, before the arrows, so a leg that drops through it paints over it
// and the pill is no ground at all; a lane that something enters from above
// puts its caption clear of that leg. The source images do the same.
//
// `captionW` is measured, like every pill in the set, because the exporter has
// no font metrics. What it must leave room for is `captionPad()` at each end -
// see shapes.mjs, and the rendered check that enforces it.
export const flowLane = ({ x, y, w, h, caption, captionW, captionX }) =>
  region({ x, y, w, h, caption, captionW, captionX, captionSize: FLOW.CAPTION_SIZE });

// A remark on the flow rather than a name for a shape: what a leg carries, or
// which way out of a gate this one is.
//
// `halo` paints a copy of the text underneath in the page colour, so a line
// passes behind the words. It is what the rendered suite accepts as ground for
// a label sitting on a connector, and it is cheaper than bending the layout
// around the type.
export const note = ({ x, y, text, anchor = 'middle', halo = false }) =>
  label({ x, y, text, size: FLOW.NOTE_SIZE, weight: 500, color: C.caption, anchor, halo });
