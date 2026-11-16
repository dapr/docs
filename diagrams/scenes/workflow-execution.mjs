// WHERE WORKFLOW ACTORS LIVE IN A CLUSTER: the placement service spreads
// them across pods, and each one is paired with the workflow instance it
// drives in the app beside it.
//
// Replaces /images/workflow-overview/workflow-execution.png on
// developing-applications/building-blocks/workflow/workflow-architecture.md,
// under "Workflow actors".
//
// Fact-check, against the paragraphs the image sits between:
//   - "workflow actors are distributed across the cluster by the hashing
//     lookup table provided by the actor placement service" - the two runs
//     out of Placement, one per pod, and four actors across two pods.
//   - "these workflow actors are embedded into the Dapr sidecar" - which is
//     why the actors are inside the sidecar's boundary and the workflow
//     instances are inside the app container's, not the other way round.
//   - "Application code is completely unaware that these actors exist" -
//     the gRPC run is the only thing crossing between the two, and nothing
//     reaches from the app into the sidecar's actors.
//   - The pairing the source writes as "WF 1 (actor 1)" is kept verbatim:
//     it is the one thing in the picture that says which actor drives which
//     workflow.
// Nothing here disagrees with the prose.
//
// DEPARTURES FROM THE SOURCE:
//
//   1. THE ACTORS ARE CIRCLES, not cells in a table. An actor in these docs
//      is a solid circle, and here the names are short enough to sit inside
//      one, which is what `actors-communication` does. The source draws a
//      two-cell table because its actors are hexagons and two hexagons
//      would not fit; that constraint is not this set's.
//
//      Note the difference from `workflows-architecture-k8s` at the top of
//      this page, where the same shape carries its name BELOW it. The lever
//      is the name: "Actor 1" fits inside a circle this size, "Workflow
//      actor (internal)" does not fit inside any circle this diagram has
//      room for.
//
//   2. THE INNER BOUNDARIES CARRY NO HEXAGON ON THEIR EDGE. The source hangs
//      the Dapr mark on the sidecar's border and a green "App container"
//      hexagon on the app's. Both name a thing the border's own caption
//      already names. Same call as the k8s picture at the top of the page.
//
//   3. THE WORKFLOW INSTANCES ARE BOXES. They are not actors - they are what
//      the actors drive - so they must not wear the actor's shape.

import { APP, C } from '../engine.mjs';
import {
  arrow, box, elbowArrow, group, hexHalfWidth, label, node, pod, region,
} from '../shapes.mjs';
import { markHex } from '../icons.mjs';
import { NAME_DY as HEX_NAME_DY } from '../services.mjs';

const EDGE = 29;
// 26, not 14: the outermost boundary carries a caption pill, and a pill is
// centred ON its border, so it reaches captionReach() above it. At 14 the
// pill came within 7.5 units of the viewBox, under the 10 the rendered suite
// asks for.
const V_EDGE = 26;

const TEXT = 13;

const PLACEMENT_R = 62;
const ACTOR_R = 34;

const WF_W = 140;
const WF_H = 58;

// 40, not 30: a pod's caption pill and the sidecar pill inside it each hang
// CAPTION_H / 2 inside their own border, so a 30 pad left them 4 units apart.
const PAD = 40;
// The app container and the sidecar are nested one border inside the pod, so
// their caption pills need the same clearance the k8s picture gives its own.
const NEST_PAD = 34;

// Between the two shapes inside each boundary.
const IN_GAP = 26;
// Between the sidecar and the app container, which is what the gRPC run and
// its name sit in.
const GRPC_GAP = 118;
// Between the two pods.
const POD_GAP = 48;
// From the placement service to the pods' left border.
const BUS_GAP = 150;

const WORD_DY = 12;

// ---- across ------------------------------------------------------------------
const PLACEMENT_X = EDGE + hexHalfWidth(PLACEMENT_R);
const POD_X0 = PLACEMENT_X + hexHalfWidth(PLACEMENT_R) + BUS_GAP;

const SIDE_X0 = POD_X0 + PAD;
const ACTOR_1_X = SIDE_X0 + NEST_PAD + ACTOR_R;
const ACTOR_2_X = ACTOR_1_X + ACTOR_R + IN_GAP + ACTOR_R;
const SIDE_X1 = ACTOR_2_X + ACTOR_R + NEST_PAD;

const APP_X0 = SIDE_X1 + GRPC_GAP;
const WF_1_X = APP_X0 + NEST_PAD + WF_W / 2;
const WF_2_X = WF_1_X + WF_W + IN_GAP;
const APP_X1 = WF_2_X + WF_W / 2 + NEST_PAD;
const POD_X1 = APP_X1 + PAD;

// ---- down --------------------------------------------------------------------
// A pod is as deep as the deeper of the two things it holds, plus its own pad.
const SIDE_H = NEST_PAD * 2 + ACTOR_R * 2;
const APP_H = NEST_PAD * 2 + WF_H;
const INNER_H = Math.max(SIDE_H, APP_H);
const POD_H = PAD * 2 + INNER_H;

const POD_1_Y0 = V_EDGE;
const POD_2_Y0 = POD_1_Y0 + POD_H + POD_GAP;
const podMid = (y0) => y0 + POD_H / 2;

const PLACEMENT_Y = (podMid(POD_1_Y0) + podMid(POD_2_Y0)) / 2;
const PLACEMENT_NAME_Y = Math.round(PLACEMENT_Y + PLACEMENT_R * HEX_NAME_DY);

// Where the two runs out of Placement turn.
const BUS_X = PLACEMENT_X + hexHalfWidth(PLACEMENT_R) + BUS_GAP / 2;

const W = Math.ceil(POD_X1 + EDGE);
const H = Math.ceil(Math.max(
  POD_2_Y0 + POD_H,
  PLACEMENT_NAME_Y + TEXT * 1.4,
) + V_EDGE);

const word = (x, y, text, anchor = 'middle') => label({
  x, y, text, size: TEXT, weight: 500, color: C.caption, anchor, halo: true,
});

const actor = (x, y, name) => node({
  x,
  y,
  r: ACTOR_R,
  fill: APP[2].fill,
  stroke: APP[2].stroke,
  ink: APP[2].ink,
  label: name,
  labelInside: true,
  size: TEXT,
});

// One pod: its boundary, the sidecar with its two actors, the app container
// with the two workflow instances they drive, and the stream between them.
const onePod = (y0, name, n) => {
  const mid = podMid(y0);
  const sideY0 = mid - SIDE_H / 2;
  const appY0 = mid - APP_H / 2;
  return group([
    pod({
      x: POD_X0,
      y: y0,
      w: POD_X1 - POD_X0,
      h: POD_H,
      name,
      captionW: 64,
    }),
    region({
      x: SIDE_X0,
      y: sideY0,
      w: SIDE_X1 - SIDE_X0,
      h: SIDE_H,
      caption: 'Sidecar',
      captionW: 74,
      captionSize: TEXT,
    }),
    region({
      x: APP_X0,
      y: appY0,
      w: APP_X1 - APP_X0,
      h: APP_H,
      caption: 'App container',
      captionW: 118,
      captionSize: TEXT,
    }),
    arrow({ from: [SIDE_X1, mid], to: [APP_X0 - 2, mid] }),
    arrow({ from: [APP_X0, mid], to: [SIDE_X1 + 2, mid] }),
    word((SIDE_X1 + APP_X0) / 2, mid - WORD_DY, 'gRPC'),
    actor(ACTOR_1_X, mid, `Actor ${n * 2 - 1}`),
    actor(ACTOR_2_X, mid, `Actor ${n * 2}`),
    box({
      x: WF_1_X, y: mid, w: WF_W, h: WF_H, label: `WF ${n * 2 - 1}\n(actor ${n * 2 - 1})`, ...{ stroke: C.teal, fill: C.tealFill, size: TEXT },
    }),
    box({
      x: WF_2_X, y: mid, w: WF_W, h: WF_H, label: `WF ${n * 2}\n(actor ${n * 2})`, ...{ stroke: C.teal, fill: C.tealFill, size: TEXT },
    }),
  ]);
};

export default {
  width: W,
  height: H,
  title: 'How Dapr workflow actors are distributed across pods in a cluster',
  desc:
    'On the left, the Dapr hexagon named Placement, with a run to each of two '
    + 'pods. Each pod holds a region named Sidecar and a region named App '
    + 'container, joined by a two-way gRPC run. Pod 1 holds Actor 1 and Actor '
    + '2 in its sidecar and the workflow instances WF 1, driven by actor 1, '
    + 'and WF 2, driven by actor 2, in its app container. Pod 2 holds Actor 3 '
    + 'and Actor 4 and the instances WF 3 and WF 4 the same way. The actors '
    + 'live in the sidecar, not in the application, and the application code '
    + 'is unaware of them.',

  build() {
    return [
      // ---- placement spreads them across the pods --------------------------
      elbowArrow({
        points: [
          [PLACEMENT_X + hexHalfWidth(PLACEMENT_R), PLACEMENT_Y],
          [BUS_X, PLACEMENT_Y],
          [BUS_X, podMid(POD_1_Y0)],
          [POD_X0 - 2, podMid(POD_1_Y0)],
        ],
      }),
      elbowArrow({
        points: [
          [PLACEMENT_X + hexHalfWidth(PLACEMENT_R), PLACEMENT_Y],
          [BUS_X, PLACEMENT_Y],
          [BUS_X, podMid(POD_2_Y0)],
          [POD_X0 - 2, podMid(POD_2_Y0)],
        ],
      }),

      // ---- the two pods ----------------------------------------------------
      onePod(POD_1_Y0, 'Pod 1', 1),
      onePod(POD_2_Y0, 'Pod 2', 2),

      // ---- and the service that placed them --------------------------------
      group({
        class: 'd-named-mark',
        children: [
          markHex({
            x: PLACEMENT_X, y: PLACEMENT_Y, r: PLACEMENT_R, mark: 'logo-blue', stroke: C.blue,
          }),
          label({ x: PLACEMENT_X, y: PLACEMENT_NAME_Y, text: 'Placement', size: TEXT }),
        ],
      }),
    ];
  },
};
