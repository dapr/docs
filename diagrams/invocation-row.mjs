// THE SERVICE INVOCATION SPINE, which the service-invocation pages draw three
// times: an app, its sidecar, the callee's sidecar, the callee, with the
// request running left along the top and the response back along the bottom,
// and a numbered disc on every hop.
//
// `service-invocation-overview` draws it with name resolution, mTLS and an
// observability backend hanging off it; `service-invocation-simple` draws it
// bare to count six steps; `service-invocation-example-detailed` draws it as
// two named apps on a local machine. Same spine, same radii, same two
// heights, same step discs - and a reader meets all three on one page, so
// three independent versions would be three different pictures of one thing.
//
// What is shared here is every NUMBER and the two helpers that place a hop.
// The arrangement is not: each scene hangs its own extras off the spine, and a
// flag deciding the layout would make this a scene with three modes rather
// than a set of measurements three scenes agree on. Same split as
// pubsub-raw.mjs and secrets-example.mjs.

import { C } from './engine.mjs';
import { arrow, hexHalfWidthAt, stepMark, STEP_R } from './shapes.mjs';

export const EDGE = 29;
export const V_EDGE = 14;

// 13, the size render-width.mjs is calibrated against; see
// diagrams/type-size.test.mjs.
export const TEXT = 13;

// A shape's NAME scales with the shape rather than with the scene's body type.
export const NAME = 17;

export const APP_R = 60;
export const SIDE_R = 44;

// THE REQUEST AND THE RESPONSE RUN AT TWO HEIGHTS, not as one line with a head
// at each end. Everywhere else in this set a pair of shapes that answer each
// other share one line, because the point there is that they talk; here the
// point is the ORDER, and six or seven numbered hops cannot be told apart on
// three lines. The sources all draw it this way too.
export const LEG_DY = 15;
export const outY = (rowY) => rowY - LEG_DY;
export const backY = (rowY) => rowY + LEG_DY;

// The disc sits clear of its own leg, outside the pair: the request's above
// the request, the response's below the response. Between them they would each
// belong to either.
export const STEP_DY = 30;

/**
 * Where a leg starts and stops on a hexagon's edge.
 *
 * A hexagon is only its full width across the middle, and these legs run
 * LEG_DY off centre where the sloping edge has already come in. Measured
 * against hexHalfWidth(r) - the widest the shape ever gets - a leg stops short
 * of the shape with a gap under it; hexHalfWidthAt() is the number that
 * actually touches.
 */
export const edgeAt = (shape, dy) => hexHalfWidthAt(shape.r, dy);

/**
 * One numbered hop from `a` to `b`, on the request line or the response line.
 *
 * `dir` is 'out' for the upper, left-to-right leg and 'back' for the lower,
 * right-to-left one; the disc follows it above or below. The arrow stops two
 * units off each hexagon so the head reads as arriving rather than as part of
 * the outline.
 */
export function hop({
  a, b, rowY, step, dir = 'out', color = C.navy, gap = 2,
}) {
  const out = dir === 'out';
  const y = out ? outY(rowY) : backY(rowY);
  const from = out
    ? [a.x + edgeAt(a, LEG_DY) + gap, y]
    : [a.x - edgeAt(a, LEG_DY) - gap, y];
  const to = out
    ? [b.x - edgeAt(b, LEG_DY) - gap, y]
    : [b.x + edgeAt(b, LEG_DY) + gap, y];
  return [
    arrow({ from, to, color }),
    step === undefined
      ? null
      : stepMark({
        x: (from[0] + to[0]) / 2,
        y: y + (out ? -STEP_DY : STEP_DY),
        step,
      }),
  ];
}

/**
 * How far above and below the row the spine reaches, so a scene can size its
 * canvas from the spine rather than from a number somebody typed. The discs
 * are the outermost thing on it, not the hexagons: at APP_R 60 the app is
 * deeper, but the sidecars are 44 and their discs reach further.
 */
export const spineReach = (r = APP_R) => Math.max(
  r,
  LEG_DY + STEP_DY + STEP_R,
);
