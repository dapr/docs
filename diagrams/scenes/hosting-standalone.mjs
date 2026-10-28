// Self-hosted local development: what `dapr init` sets up on a dev machine,
// and what `dapr run` then starts.
//
// Replaces overview-standalone.png on overview.md ("Self-hosted local
// development").
//
// Fact-checked against getting-started/install-dapr-selfhost.md, which lists
// exactly what `dapr init` runs: a Redis container as local state store and
// message broker, a Zipkin container for observability, a placement service
// container for local actor support, and a scheduler service container for job
// scheduling. All four are current, so the source's four containers stand.
//
// Where this departs from the source image, and why:
//   - the application hexagon was green, a colour this diagram set does not
//     have. One app takes APP[0].
//   - the component names were "Publish / Subscribe", "Workflow", "State
//     Management" and "External Configuration". They are now the names these
//     docs use everywhere else, which is what the building-blocks table and
//     the other two diagrams on overview.md say.
//   - Zipkin's mark is the project's own, from the Apache-2.0 openzipkin site
//     repo. It is the one logo here that is a raster inside an svg wrapper
//     rather than vector art, which is how the project publishes it.
//   - the two commands are set in the page's own monospace font, the one its
//     code and pre elements use. They are things you type, and the body font
//     makes them read as prose.

import { APP, C, el } from '../engine.mjs';
import { OUTLINE, arrow, group, hex, hexHalfWidth, hexPoints, label, panel, pill } from '../shapes.mjs';
import { MARK_IN_HEX, icon, markHex } from '../icons.mjs';
import { apiTile } from '../apis.mjs';
import { appSidecar, sidecarAt } from '../app.mjs';
import { NAME_DY, serviceHex, serviceLabel } from '../services.mjs';

const W = 1200;
const H = 720;

// ---- the containers dapr init runs, in a dashed Docker Desktop region ----
const BOX = { x: 20, y: 34, w: 258, h: 560 };
// Centred in the region, derived from it: the vertical centring below already
// comes from BOX, and a hand-typed x drifts the moment the region moves.
const CONTAINER_X = BOX.x + BOX.w / 2;
// Larger than the reference radius, deliberately: this column stands beside
// 104 cards, and at the reference size the hexagons read as minor next to
// them. The component scales as a whole - mark, name offset and name size
// all follow - so these are the same drawing as the Kubernetes ones, just
// bigger. The cost is that a service's name is 16.8 here against 13 there.
const CONTAINER_R = 44;
const CONTAINER_PITCH = 128;
// The four hexagons and their names are one group, centred in the region
// rather than started at a y that happened to look right. The group runs from
// the first hexagon's top to the last name's descender.
const CONTAINER_COUNT = 4;
const CONTAINER_GROUP_H =
  (CONTAINER_COUNT - 1) * CONTAINER_PITCH + CONTAINER_R + CONTAINER_R * NAME_DY + 4;
const CONTAINER_TOP = BOX.y + BOX.h / 2 - CONTAINER_GROUP_H / 2 + CONTAINER_R;

// [mark, name, what the sidecar uses it for]
// The two Dapr services name a key in ../services.mjs and are drawn by
// serviceHex at this diagram's radius; Redis and Zipkin are not Dapr
// services, so they carry their own mark and name at the same offset.
const CONTAINERS = [
  { key: 'scheduler', why: 'Schedule jobs to run\nat specified intervals' },
  { key: 'placement', why: 'Create mapping table of\nactor instances and pods' },
  { mark: 'redis', name: 'Redis', why: 'State management and\npub/sub messaging' },
  { mark: 'zipkin', name: 'Zipkin', why: 'Send distributed\ntracing' },
];

const WHY_X = 310; // where each container's reason starts
const LEFT_BUS_X = 520; // the vertical line the container arrows leave from

// ---- the app and its sidecar ----
const APP_X = 740;
const APP_Y = 320;
const APP_R = 66;

// The sidecar's LEFTMOST point sits on the app's LOWEST point, so the two
// hexagons interlock at a definite place rather than at one that looked right.
const APP_SIZE = 18;
const SIDE = sidecarAt({ x: APP_X, y: APP_Y, r: APP_R, size: APP_SIZE });

// ---- the components it uses ----
const CARD_X = 1104;
// The overview's card, scaled down: this column has to clear the platform
// band below it, and apiTile derives the glyph from the card, so one number
// resizes the whole block rather than the box and its mark separately.
const CARD_W = 104;
const CARD_H = 104;
const CARD_TOP = 78;
const CARD_PITCH = 118;
const BUS_X = 960; // the vertical line the component arrows leave from

// Named from the catalogue in ../apis.mjs, in this scene's own order: the
// mark and the name are the same here as on the overview, by construction.
const COMPONENTS = ['pubsub', 'workflows', 'state', 'configuration', 'secrets'];

// ---- where it all runs ----
const PLATFORM = { x: 170, y: 640, w: 900, h: 46 };

export default {
  width: W,
  height: H,
  title: 'Dapr in self-hosted mode',
  desc:
    'On the left, a dashed region labelled Docker Desktop holds the four containers that dapr init runs: the Dapr scheduler, which schedules jobs to run at specified intervals; the Dapr placement service, which creates a mapping table of actor instances and pods; Redis, for state management and pub/sub messaging; and Zipkin, which receives distributed tracing. In the middle, dapr run starts an application with a Dapr sidecar beside it, and the sidecar talks to each of those containers. On the right, the sidecar uses components for publish and subscribe, workflows, state management, configuration and secrets. Along the bottom, a dashed strip says this runs on a local dev machine or virtual machine, on Windows, macOS, Linux or ARM.',

  build() {
    return [
      // ---- band: what dapr init installs ---------------------------------
      panel({ x: BOX.x, y: BOX.y, w: BOX.w, h: BOX.h, stroke: C.navy }),
      // pill() takes x as the CENTRE, like every other builder.
      pill({ x: BOX.x + 110, y: BOX.y, w: 186, h: 34, text: 'Docker Desktop', color: C.navy }),

      label({ x: APP_X, y: 92, text: 'dapr init', size: 22, weight: 700, color: C.navy, mono: true }),

      CONTAINERS.map((container, i) => {
        const y = CONTAINER_TOP + i * CONTAINER_PITCH;
        return group([
          // A hexagon per container, the name below it at the shared offset so
          // all four line up whether or not they are Dapr services.
          container.key
            ? serviceHex({ key: container.key, x: CONTAINER_X, y, r: CONTAINER_R })
            : group([
              markHex({ x: CONTAINER_X, y, r: CONTAINER_R, mark: container.mark, size: CONTAINER_R * MARK_IN_HEX, color: C.navy }),
              label({ x: CONTAINER_X, y: y + CONTAINER_R * NAME_DY, text: container.name, size: serviceLabel(CONTAINER_R) }),
            ]),

          // The sidecar reaches each container off one vertical bus, and the
          // reason rides above its arrow rather than beside it.
          arrow({ from: [LEFT_BUS_X, y], to: [CONTAINER_X + CONTAINER_R + 6, y] }),
          label({ x: WHY_X, y: y - 24, text: container.why, size: 14, anchor: 'start' }),
        ]);
      }),

      // ---- the app and its sidecar ---------------------------------------
      // The sidecar overlaps the app, as in the source: one process beside the
      // other, not a separate box somewhere else on the machine.
      appSidecar({ x: APP_X, y: APP_Y, r: APP_R, label: 'App', size: APP_SIZE, stroke: APP[0].stroke, fill: APP[0].fill }),
      label({ x: APP_X, y: 505, text: 'dapr run [flags]', size: 22, weight: 700, color: C.navy, mono: true }),

      // One line down the left, with the sidecar feeding it. It runs at the
      // sidecar's height, which is below the app hexagon, so the arrow into the
      // sidecar does not cut through the app.
      el('polyline', {
        points: `${LEFT_BUS_X} ${CONTAINER_TOP} ${LEFT_BUS_X} ${CONTAINER_TOP + 3 * CONTAINER_PITCH}`,
        fill: 'none',
        stroke: C.navy,
        'stroke-width': 2,
      }),
      arrow({ from: SIDE, to: [LEFT_BUS_X, SIDE.y] }),

      // ---- the components it uses ----------------------------------------
      el('polyline', {
        points: `${BUS_X} ${CARD_TOP} ${BUS_X} ${CARD_TOP + 4 * CARD_PITCH}`,
        fill: 'none',
        stroke: C.navy,
        'stroke-width': 2,
      }),
      arrow({ from: [BUS_X, SIDE.y], to: SIDE }),
      label({ x: (BUS_X + SIDE.x + SIDE.r) / 2, y: SIDE.y - 22, text: 'Use components', size: 14 }),

      COMPONENTS.map((key, i) => {
        const y = CARD_TOP + i * CARD_PITCH;
        return group([
          arrow({ from: [BUS_X, y], to: { x: CARD_X, y, w: CARD_W, h: CARD_H } }),
          apiTile({
            key,
            wrap: true,
            x: CARD_X,
            y,
            w: CARD_W,
            h: CARD_H,
          }),
        ]);
      }),

      // ---- what it all runs on -------------------------------------------
      panel({ x: PLATFORM.x, y: PLATFORM.y, w: PLATFORM.w, h: PLATFORM.h, stroke: C.navy }),
      label({
        x: PLATFORM.x + PLATFORM.w / 2,
        y: PLATFORM.y + PLATFORM.h / 2,
        text: 'Windows, macOS, Linux or ARM: a local dev machine or virtual machine',
        size: 16,
      }),
    ];
  },
};
