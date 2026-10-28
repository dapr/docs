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
import { OUTLINE, arrow, group, hex, hexHalfWidth, hexPoints, label, panel, pill, tile } from '../shapes.mjs';
import { icon } from '../icons.mjs';

const W = 1200;
const H = 720;

// ---- the containers dapr init runs, in a dashed Docker Desktop region ----
const BOX = { x: 20, y: 34, w: 258, h: 560 };
const CONTAINER_X = 132;
const CONTAINER_R = 44;
const CONTAINER_PITCH = 128;
const CONTAINER_LABEL_DY = CONTAINER_R + 18; // the name, below its hexagon
// The four hexagons and their names are one group, centred in the region
// rather than started at a y that happened to look right. The group runs from
// the first hexagon's top to the last name's descender.
const CONTAINER_COUNT = 4;
const CONTAINER_GROUP_H =
  (CONTAINER_COUNT - 1) * CONTAINER_PITCH + CONTAINER_R + CONTAINER_LABEL_DY + 4;
const CONTAINER_TOP = BOX.y + BOX.h / 2 - CONTAINER_GROUP_H / 2 + CONTAINER_R;

// [mark, name, what the sidecar uses it for]
const CONTAINERS = [
  ['logo-blue', 'Scheduler', 'Schedule jobs to run\nat specified intervals'],
  ['logo-blue', 'Placement', 'Create mapping table of\nactor instances and pods'],
  ['redis', 'Redis', 'State management and\npub/sub messaging'],
  ['zipkin', 'Zipkin', 'Send distributed\ntracing'],
];

const WHY_X = 310; // where each container's reason starts
const LEFT_BUS_X = 520; // the vertical line the container arrows leave from

// ---- the app and its sidecar ----
const APP_X = 740;
const APP_Y = 320;
const APP_R = 66;
const SIDE_R = 48;
// The sidecar's LEFTMOST point sits on the app's LOWEST point, so the two
// hexagons interlock at a definite place rather than at one that looked right.
const SIDE_X = APP_X + hexHalfWidth(SIDE_R);
const SIDE_Y = 398;

// ---- the components it uses ----
const CARD_X = 1104;
const CARD_W = 104; // square, as the other capability grids are
const CARD_H = 104;
const CARD_TOP = 78;
const CARD_PITCH = 118;
const BUS_X = 960; // the vertical line the component arrows leave from

const COMPONENTS = [
  ['mail-copy', 'Publish &\nsubscribe'],
  ['flowchart', 'Workflows'],
  ['database', 'State\nmanagement'],
  ['settings-cog-multiple', 'Configuration'],
  ['key', 'Secrets'],
];

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

      CONTAINERS.map(([mark, name, why], i) => {
        const y = CONTAINER_TOP + i * CONTAINER_PITCH;
        const dapr = mark === 'logo-blue';
        return group([
          // A hexagon per container. The Dapr services carry the wordmark, so
          // their hexagon is filled to act as its plate; the others are tinted
          // marks that follow the theme and need none.
          el('polygon', {
            points: hexPoints(CONTAINER_X, y, CONTAINER_R),
            fill: dapr ? C.plate : C.bg,
            stroke: C.blue,
            'stroke-width': OUTLINE,
            'stroke-linejoin': 'round',
          }),
          // The mark carries no label of its own, so it is centred in the
          // hexagon both ways. The name sits outside, below.
          icon({
            name: mark,
            x: CONTAINER_X,
            y,
            ...(dapr ? { w: 58, h: 58 } : { size: 34 }),
            ...(dapr ? {} : { color: C.navy }),
          }),
          // The name sits BELOW the hexagon, clear of its outline, so it is
          // ordinary body ink rather than plate ink even for the two that are
          // plated.
          label({ x: CONTAINER_X, y: y + CONTAINER_LABEL_DY, text: name, size: 14 }),
          // The sidecar reaches each container off one vertical bus, and the
          // reason rides above its arrow rather than beside it.
          arrow({ from: [LEFT_BUS_X, y], to: [CONTAINER_X + CONTAINER_R + 6, y] }),
          label({ x: WHY_X, y: y - 24, text: why, size: 14, anchor: 'start' }),
        ]);
      }),

      // ---- the app and its sidecar ---------------------------------------
      // The sidecar overlaps the app, as in the source: one process beside the
      // other, not a separate box somewhere else on the machine.
      hex({
        x: APP_X,
        y: APP_Y,
        r: APP_R,
        label: 'App',
        size: 18,
        stroke: APP[0].stroke,
        fill: APP[0].fill,
      }),
      group([
        el('polygon', {
          points: hexPoints(SIDE_X, SIDE_Y, SIDE_R),
          fill: C.plate,
          stroke: C.blue,
          'stroke-width': OUTLINE,
          'stroke-linejoin': 'round',
        }),
        icon({ name: 'logo-blue', x: SIDE_X, y: SIDE_Y, w: 64, h: 64 }),
      ]),
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
      arrow({ from: { x: SIDE_X, y: SIDE_Y, r: SIDE_R, hex: true }, to: [LEFT_BUS_X, SIDE_Y] }),

      // ---- the components it uses ----------------------------------------
      el('polyline', {
        points: `${BUS_X} ${CARD_TOP} ${BUS_X} ${CARD_TOP + 4 * CARD_PITCH}`,
        fill: 'none',
        stroke: C.navy,
        'stroke-width': 2,
      }),
      arrow({ from: [BUS_X, SIDE_Y], to: { x: SIDE_X, y: SIDE_Y, r: SIDE_R, hex: true } }),
      label({ x: (BUS_X + SIDE_X + SIDE_R) / 2, y: SIDE_Y - 22, text: 'Use components', size: 14 }),

      COMPONENTS.map(([mark, name], i) => {
        const y = CARD_TOP + i * CARD_PITCH;
        return group([
          arrow({ from: [BUS_X, y], to: { x: CARD_X, y, w: CARD_W, h: CARD_H } }),
          tile({
            x: CARD_X,
            y,
            w: CARD_W,
            h: CARD_H,
            color: C.blue,
            icon: (cx, cy) => icon({ name: `fluent-${mark}`, x: cx, y: cy, size: 32, color: C.blue }),
            label: name,
            labelSize: 14,
            // Glyph and name are centred in the square as one group, so a
            // two-line name does not drag the pair up the card.
            glyphSize: 32,
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
