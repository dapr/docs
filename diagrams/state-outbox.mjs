// WHAT THE TWO OUTBOX PICTURES AGREE ABOUT.
//
// howto-outbox.md draws the outbox twice: once at a height, as one transaction
// that spans a state store and a broker, and once opened up into nine numbered
// steps. A reader meets both on one page, so the apps, the store, the broker
// and the numbered discs have to be the same objects at the same sizes - which
// is what this file holds. The ARRANGEMENT is not shared: the first picture is
// one flow and the second is two, and a flag deciding which would make this a
// scene with two modes rather than a set of measurements two scenes agree on.
// Same split as pubsub-raw.mjs, invocation-row.mjs and secrets-example.mjs.

import { C } from './engine.mjs';
import { STEP_R, group, label, stepMark } from './shapes.mjs';

// Least space from the drawing to the side edges, and to the top and bottom.
export const EDGE = 29;
export const V_EDGE = 14;

// 13, the size render-width.mjs is calibrated against; see
// diagrams/type-size.test.mjs.
export const TEXT = 13;

// A shape's NAME scales with the shape rather than with the scene's body type.
export const NAME = 17;

// 62, the radius the rest of this set settled on: the longest NAME an app
// hexagon carries clears the sloping edges by half an em each side, which is
// what the rendered rule `holds every shape's own name inside it` enforces.
export const APP_R = 62;
export const SIDE_R = 44;

// The broker: a cylinder on its side, open at both ends, which is the house
// shape for a topic everywhere in this set. pipe() refuses anything but two to
// three diameters long, and it carries its own name inside.
export const PIPE_RY = 30;
export const PIPE_RX = 12;
export const PIPE_LEN = 158;

// The state store: a cylinder, which is the house shape for a store. Wide
// enough for "State store" at STORE_NAME with half an em clear each side.
export const STORE_W = 148;
export const STORE_NAME = 14;

// What a dashed boundary leaves around what it holds.
export const PAD = 28;

// A STEP'S DISC AND ITS WORDS ARE ONE BLOCK, laid out left to right from the
// block's own centre rather than each placed at its own offset from something
// else. Placed separately the two landed on top of each other in
// pubsub-deadletter, and nothing but a render could see it: both labels
// existed, were the right size and were inside the canvas.
//
// `textW` is measured on the rendered page, because the exporter has no font
// metrics and cannot derive it from the words.
export const DISC_GAP = 14;
export const stepWidth = (textW) => STEP_R * 2 + DISC_GAP + textW;

export function stepBlock({ x, y, step, text, textW, color = C.body }) {
  const total = stepWidth(textW);
  const left = x - total / 2;
  return group({
    class: 'd-named-mark',
    children: [
      stepMark({ x: left + STEP_R, y, step }),
      label({
        x: left + STEP_R * 2 + DISC_GAP + textW / 2, y, text, size: TEXT, color,
      }),
    ],
  });
}

// How far a step block stands off the run it explains.
export const BLOCK_GAP = 24;
