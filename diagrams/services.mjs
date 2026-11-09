// The Dapr control plane services: one definition each, shared by every scene.
//
// Placement, scheduler, sentry, operator and injector are drawn the same way
// wherever they appear - a Dapr hexagon with the service's name under it, and
// its role under that where there is room. Before this module each scene
// carried its own list and its own offsets, and the offsets had drifted: the
// name sat r + 18 below the hexagon in two scenes and r + 14 in a third.
//
// SCALING. A scene picks the radius and everything else follows from it, so a
// small sidecar in a dense diagram and a large one in a sparse diagram are the
// same drawing at two sizes rather than two drawings. The ratios below are the
// definition; `r` is the only thing a scene chooses.
//
// The NAME scales too. The hexagon and the name under it are one component,
// not a shape with a caption near it, so the name is derived from the radius
// like every other measurement. The practical consequence is that keeping the
// radii near each other across diagrams keeps the names near each other too -
// which is the point: a service should look the same size wherever it is
// drawn. Below 11px a name is not worth drawing, so a hexagon that small is
// refused rather than quietly made illegible.

import { C } from './engine.mjs';
import { MIN_LABEL, group, label } from './shapes.mjs';
import { markHex } from './icons.mjs';

// The reference radius: the control plane hexagons on the Kubernetes diagram.
export const SERVICE_R = 34;

// Offsets from the hexagon's centre, as multiples of the radius.
export const NAME_DY = 1.4;
export const ROLE_DY = 2.4;

// The name's size, as a multiple of the radius.
export const SERVICE_LABEL = 13 / 34;

// How far right of the centre a name set BESIDE the hexagon starts, as a
// multiple of the radius. The hexagon's own half width is 0.866r, so this is
// the edge plus a little under a third of a radius.
export const NAME_DX = 1.15;

// The size a name takes beside a hexagon of this radius. Exported because a
// neighbour that is NOT a Dapr service - Consul, Redis, Zipkin - has to set
// its name the same way, or the names in one column come out at two sizes.
export function serviceLabel(r) {
  const size = +(r * SERVICE_LABEL).toFixed(2);
  if (size < MIN_LABEL) {
    throw new Error(`serviceLabel(): radius ${r} gives a ${size}px name, below the ${MIN_LABEL}px floor. Draw the hexagon larger.`);
  }
  return size;
}

const entry = (key, name, role, wrap = role) => ({ key, name, role, wrap });

export const SERVICES = [
  entry('placement', 'Placement', 'Actor partition placement', 'Actor partition\nplacement'),
  entry('scheduler', 'Scheduler', 'Distributed job scheduling', 'Distributed job\nscheduling'),
  entry('sentry', 'Sentry', 'Certificate authority', 'Certificate\nauthority'),
  entry('operator', 'Operator', 'Component updates', 'Component\nupdates'),
  entry('injector', 'Injector', 'Dapr runtime injector', 'Dapr runtime\ninjector'),
];

const BY_KEY = new Map(SERVICES.map((s) => [s.key, s]));

export function service(key) {
  const found = BY_KEY.get(key);
  if (!found) {
    throw new Error(`service(): "${key}" is not a Dapr control plane service. Known: ${[...BY_KEY.keys()].join(', ')}`);
  }
  return found;
}

// One service. `r` is the only size: the hexagon, the mark, the offsets and
// the name all follow from it. `role` draws the second line, for a diagram
// with room under the name.
//
// `size` overrides the derived name, and exists for one case: a scene that
// sizes the hexagon to match a NEIGHBOUR rather than to its own role. The
// Scheduler drawn beside a sidecar is as big as the sidecar, which is three
// times the reference radius, and a name derived from that would be twice the
// scene's body type. A scene that passes it owes a comment saying which
// neighbour set the radius - and passes the same size to that neighbour's
// name, or it has just reintroduced the drift this module exists to stop.
// `side` is where the name goes. 'below' is the house arrangement and what
// every scene should ask for. 'right' stacks the name and the role to the
// RIGHT of the hexagon, centred on it, and exists for the one case a scene
// cannot design its way out of: a line arriving at the hexagon's BOTTOM node,
// which is where the name would otherwise be. `sentry-selfhosted` has one -
// the two certificate requests merge below Sentry and come up into it. The
// offsets for both arrangements live here rather than in the scene, so a
// hexagon labelled beside cannot drift away from one labelled under.
export function serviceHex({ key, x, y, r = SERVICE_R, role = false, wrap = false, size: given, side = 'below' }) {
  const s = service(key);
  const size = given ?? serviceLabel(r);
  if (size < MIN_LABEL) {
    throw new Error(`serviceHex(): a ${size}px name is below the ${MIN_LABEL}px floor.`);
  }
  if (side !== 'below' && side !== 'right') {
    throw new Error(`serviceHex(): side "${side}" is neither 'below' nor 'right'.`);
  }
  const roleText = role ? (wrap ? s.wrap : s.role) : null;
  if (side === 'below') {
    return group([
      markHex({ x, y, r, mark: 'logo-blue' }),
      label({ x, y: y + r * NAME_DY, text: s.name, size }),
      roleText ? label({ x, y: y + r * ROLE_DY, text: roleText, size, color: C.blue }) : null,
    ]);
  }
  // Beside: the name's row and the role's rows are ONE stack of lines, centred
  // on the hexagon, so a hexagon with a two-line role does not sit higher in
  // its own name than one with a single line.
  const lh = size * 1.2;
  const roleLines = roleText ? roleText.split('\n').length : 0;
  const nameRow = +(y - (roleLines * lh) / 2).toFixed(2);
  const lx = +(x + r * NAME_DX).toFixed(2);
  return group([
    markHex({ x, y, r, mark: 'logo-blue' }),
    label({ x: lx, y: nameRow, text: s.name, size, anchor: 'start' }),
    roleText
      ? label({
        x: lx, y: +(nameRow + lh + ((roleLines - 1) * lh) / 2).toFixed(2),
        text: roleText, size, color: C.blue, anchor: 'start',
      })
      : null,
  ]);
}
