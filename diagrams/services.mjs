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
export function serviceHex({ key, x, y, r = SERVICE_R, role = false, wrap = false }) {
  const s = service(key);
  const size = serviceLabel(r);
  return group([
    markHex({ x, y, r, mark: 'logo-blue' }),
    label({ x, y: y + r * NAME_DY, text: s.name, size }),
    role ? label({ x, y: y + r * ROLE_DY, text: wrap ? s.wrap : s.role, size, color: C.caption }) : null,
  ]);
}
