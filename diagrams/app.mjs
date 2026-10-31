// An application and its Dapr sidecar: the pair that appears on every hosting
// diagram and wherever else an app is shown running under Dapr.
//
// Before this module each scene placed the sidecar itself and the three
// hosting diagrams had drifted to three different offsets, while the
// components page used daprApp()'s small docked badge and so looked like a
// different object entirely.
//
// THE ARRANGEMENT. The sidecar's LEFT EDGE sits on the app hexagon's centre.
// Horizontally that is as far right as it can go: pushed further, the pair
// stops reading as one object and starts reading as two shapes that happen to
// touch. Vertically its centre sits a small clearance below the app's lowest
// point, because arrows run into and out of the sidecar at that height and at
// the app's own bottom edge they graze the hexagon. The clearance is kept
// small for the same reason the horizontal offset is: most of the sidecar
// still overlaps the app. Everything follows from the app's radius, so the
// pair is one drawing at whatever size a scene wants it.
//
// The app's colour and name are the scene's to choose - each app in a diagram
// takes the next entry in APP - but the sidecar is always the Dapr hexagon.

import { APP, C } from './engine.mjs';
import { group, hex, hexHalfWidth, MIN_LABEL } from './shapes.mjs';
import { markHex } from './icons.mjs';

// The sidecar's radius, as a multiple of the app's. The three hosting diagrams
// had 0.727, 0.741 and 0.750 before this was one number.
export const SIDECAR_R = 0.75;

// The sidecar's centre, this far below the app's LOWEST point, as a multiple
// of the app's radius. It is the clearance a horizontal arrow at the sidecar's
// height has from the app hexagon above it.
export const SIDECAR_CLEARANCE = 0.15;

// The least space between the lower edge of the app's name and the top of the
// sidecar, which only binds when a name is large for its hexagon.
export const SIDECAR_GAP = 7;

// How far right of the app's centre the sidecar's centre sits: half the
// SIDECAR's width, which puts its left edge on the app's centre. A scene that
// wants the sidecar at a particular x places the app this far to the left.
export const sidecarDx = (r) => hexHalfWidth(r * SIDECAR_R);

// hex() sizes its name this way, so the pair agrees with it about how much
// room the name takes.
const nameSize = (r, size) => size ?? Math.max(MIN_LABEL, +(r / 3).toFixed(2));

// Where the sidecar lands, as an arrow descriptor: a scene drawing a line to
// or from the sidecar asks for this rather than recomputing the offsets, so
// the arrow and the drawing cannot drift apart.
// `mirror` hangs the sidecar off the app's LEFT instead, for an app on the
// right-hand side of a picture whose sidecar has to face inward. Everything
// else is the same drawing: the sidecar's near edge still sits on the app's
// centre, and it still drops below the app's lowest point by the same
// clearance. Without it the two apps in `sentry-kubernetes` would talk to
// each other through the right-hand app hexagon.
export function sidecarAt({ x, y, r = 54, size, mirror = false }) {
  const rs = +(r * SIDECAR_R).toFixed(2);
  const name = nameSize(r, size);
  const clear = y + r + r * SIDECAR_CLEARANCE;
  const belowName = y + name * 0.5 + SIDECAR_GAP + rs;
  return {
    x: +(x + (mirror ? -1 : 1) * sidecarDx(r)).toFixed(2),
    y: +Math.max(clear, belowName).toFixed(2),
    r: rs,
    hex: true,
  };
}

// How far the PAIR reaches from the app's centre, which is not the same as
// how far the app reaches: the sidecar hangs off one side and below. A scene
// that centres the pair in a box - a pod, a card - needs this rather than the
// app's own radius, and `hosting-kubernetes` worked it out inline before this
// existed.
export function pairExtent({ r = 54, size, mirror = false }) {
  const s = sidecarAt({ x: 0, y: 0, r, size, mirror });
  const half = hexHalfWidth(s.r);
  return {
    left: mirror ? s.x - half : -hexHalfWidth(r),
    right: mirror ? hexHalfWidth(r) : s.x + half,
    top: -r,
    bottom: s.y + s.r,
  };
}

// Where to put the APP so that the whole pair is centred on (x, y).
export function appSidecarCentre({ x, y, r = 54, size, mirror = false }) {
  const e = pairExtent({ r, size, mirror });
  return {
    x: +(x - (e.left + e.right) / 2).toFixed(2),
    y: +(y - (e.top + e.bottom) / 2).toFixed(2),
  };
}

export function appSidecar({
  x, y, r = 54, label = 'App', size, mirror = false,
  stroke = APP[0].stroke, fill = APP[0].fill, ink = APP[0].ink, solid = APP[0].solid,
}) {
  const name = nameSize(r, size);
  const s = sidecarAt({ x, y, r, size, mirror });
  return group([
    hex({ x, y, r, label, size: name, stroke, fill, ink, solid }),
    markHex({ x: s.x, y: s.y, r: s.r, mark: 'logo-blue', stroke: C.blue }),
  ]);
}
