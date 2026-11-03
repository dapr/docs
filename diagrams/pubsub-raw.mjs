// THE TWO RAW PUB/SUB PICTURES, which pubsub-raw.md shows in two places.
//
// A publisher, a pub/sub topic, and a subscriber, in a row. One of the two
// apps runs Dapr and the other does not, and WHICH one is the entire
// difference between the page's two diagrams - the same relationship the two
// health pages have, where `app-health` and `sidecar-health` are the same two
// shapes with the ball on the other one.
//
// So the two scenes share their measurements here and each draws its own
// arrangement. Not one scene with a flag: the flag would decide the LAYOUT,
// and a shared thing a caller can still rearrange has not made anything
// consistent. What is shared is every number, so the two pictures cannot drift
// apart in size, spacing or type while they remain the same picture.

import { C } from './engine.mjs';
import { hexHalfWidth } from './shapes.mjs';
import { SIDECAR_CLEARANCE, SIDECAR_R } from './app.mjs';

// Least space from the drawing to the side edges, and to the top and bottom.
// They differ because the canvas is wide and shallow: five per cent sideways
// is a comfortable band, and the same band vertically would be under the
// twelve-unit floor the house rule puts on a short axis.
export const EDGE = 29;
export const V_EDGE = 14;

// 13, the size render-width.mjs is calibrated against; see
// diagrams/type-size.test.mjs.
export const TEXT = 13;

// 62 rather than 60, so the longest NAME clears the outline by half an em
// each side - the rule `holds every shape's own name inside it` enforces,
// and the one caption pills have always been held to. At 60 the name sat
// about seven units off the sloping edges, which reads as a shape drawn too
// small for what it carries.
export const APP_R = 62;

// A shape's NAME scales with the shape, so it is not the scene's body type.
// 17 is what the longest line here wants: "subscriber" is ten characters and
// a hexagon is 1.732r across, so the derived r / 3 would sit it against the
// edges at any radius.
export const APP_NAME = 17;

// The topic is a MESSAGE BROKER: a cylinder on its side, open at both ends.
// pipe() refuses anything but two to three diameters long, and it carries its
// own name inside, as every broker and store in this set does.
export const PIPE_RY = 34;
export const PIPE_RX = 14;
export const PIPE_LEN = 150;
export const TOPIC = 'Pub/sub topic';

// Both diagrams have TWO apps, so the broker keeps the house green: the rule
// that hands green to the app instead applies only where there is exactly one,
// and a reader telling two apps apart by colour will not mistake the pipe
// between them for one of them.
export const PIPE_FILL = C.green;

// The row. Everything is measured from the left edge rather than typed, so the
// two scenes cannot disagree about where anything sits.
export const ROW_Y = 88;

export const APP_A_X = EDGE + hexHalfWidth(APP_R);
const APP_A_RIGHT = APP_A_X + hexHalfWidth(APP_R);

// The publisher's gap carries the message and its name, so it is the wider of
// the two; the subscriber's carries only the line.
const GAP_PUBLISH = 150;
const GAP_SUBSCRIBE = 110;

export const PIPE_X1 = APP_A_RIGHT + GAP_PUBLISH + PIPE_RX;
export const PIPE_X2 = PIPE_X1 + PIPE_LEN;
// As a rect for an arrow: the box the line stops at is the box the shape
// draws, including the rims that stand rx beyond each end.
export const PIPE = {
  x: (PIPE_X1 + PIPE_X2) / 2,
  y: ROW_Y,
  w: PIPE_LEN + PIPE_RX * 2,
  h: PIPE_RY * 2,
};

export const APP_B_X = PIPE_X2 + PIPE_RX + GAP_SUBSCRIBE + hexHalfWidth(APP_R);

export const W = Math.ceil(APP_B_X + hexHalfWidth(APP_R) + EDGE);

// Where a docked sidecar's centre sits, which is what the elbowed runs have to
// reach. appSidecar() puts it below the app's lowest point by its own
// clearance, and that is the number to route to rather than one measured off
// the picture.
export const SIDE_R = +(APP_R * SIDECAR_R).toFixed(2);
export const SIDE_DY = +(APP_R + APP_R * SIDECAR_CLEARANCE).toFixed(2);

// The message rides above the run it names, with its name under it and still
// clear of the line. Both scenes take these, so the two cannot end up with the
// message at two sizes or two heights - which is exactly what happened when
// each passed its own: one name went in at 13 and the other kept label()'s
// default of 11, and the pair read as differently spaced.
export const MSG_DY = 62;
export const MSG_MARK = 34;
// The mark's lowest ink to the name's centre.
export const MSG_NAME_DY = 30;

// Tall enough for the message above the row and the sidecar below it.
export const H = Math.ceil(ROW_Y + SIDE_DY + SIDE_R + V_EDGE);
