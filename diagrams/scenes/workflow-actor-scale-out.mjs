// HOW WORKFLOW AND ACTIVITY ACTORS SPREAD ACROSS A CLUSTER: three nodes, and
// calls that cross between them as readily as they stay put.
//
// Replaces /images/workflow-overview/workflow-actor-scale-out.png on
// developing-applications/building-blocks/workflow/workflow-architecture.md,
// under "Workflow scalability".
//
// Fact-check, against the paragraph the image sits under:
//   - "if a workflow schedules 10 activity tasks to run in parallel, all 10
//     tasks may run on as many as 10 different compute nodes or as few as a
//     single compute node" - which is why some activity calls in the picture
//     stay inside their node and others cross to the next one, and why no
//     node holds a tidy set.
//   - "Each workflow instance executes on a single node at a time, but a
//     workflow can schedule activities and child workflows which run on
//     other nodes" - the two kinds of run the legend names.
//   - "The actual scale behavior is determined by the actor placement
//     service" - which is the picture above this one on the page; this one
//     shows the result, not the mechanism, and so draws no placement
//     service.
// The wiring is illustrative in the source - the prose names no particular
// actor - and it is kept as the source drew it rather than tidied, because a
// tidier arrangement would quietly claim a locality the page says does not
// exist.
//
// DEPARTURES FROM THE SOURCE:
//
//   1. ACTORS ARE CIRCLES, as everywhere else on this page.
//
//   2. THE TWO KINDS ARE GOLD AND BLUE, not green and blue. Gold is what the
//      workflow actor already wears in three pictures on this page. The
//      source's green would make the same object a different colour in its
//      fourth appearance, and green in this set is the FIRST app rather than
//      a kind of actor.
//
//   3. NO "Dapr Runtime" WATERMARK. The source sets those words in the
//      middle of each node's grey panel, among the hexagons. Here the panel
//      is a region and its name is on its border, which is where this set
//      puts the name of a boundary - and it cannot then collide with
//      whatever the panel holds.

import { APP, C } from '../engine.mjs';
import {
  arrow, captionReach, elbowArrow, group, label, node, region,
} from '../shapes.mjs';

const EDGE = 29;
// 26, not 14: the outermost boundary carries a caption pill, and a pill is
// centred ON its border, so it reaches captionReach() above it. At 14 the
// pill came within 7.5 units of the viewBox, under the 10 the rendered suite
// asks for.
const V_EDGE = 26;

const TEXT = 13;

const R = 26;

// Inside a runtime panel: three columns, two rows.
const COL_GAP = 48;
const ROW_GAP = 48;
const COLS = 3;
const ROWS = 2;

// 34, not 26: the run that reaches from the third node's workflow actor
// back to the activity actor at the far end of the same node travels ABOVE
// its row, and it needs a lane between the runtime panel's caption pill and
// the top of that row. At 26 there was no such lane and the run was drawn
// through the pill.
const PAD = 34;
// A node's border and its runtime panel's border each carry a caption pill,
// and a pill is centred ON its border. This is what keeps the two apart.
const NEST_PAD = 42;
const NODE_GAP = 38;
const CLUSTER_PAD = 36;

const COL_PITCH = R * 2 + COL_GAP;
const ROW_PITCH = R * 2 + ROW_GAP;

const RUN_W = PAD * 2 + COLS * R * 2 + (COLS - 1) * COL_GAP;
const RUN_H = PAD * 2 + ROWS * R * 2 + (ROWS - 1) * ROW_GAP;
const NODE_W = RUN_W + NEST_PAD * 2;
const NODE_H = RUN_H + NEST_PAD * 2;

const CLUSTER_X0 = EDGE;
const CLUSTER_Y0 = V_EDGE;
const nodeX0 = (i) => CLUSTER_X0 + CLUSTER_PAD + i * (NODE_W + NODE_GAP);
const NODE_Y0 = CLUSTER_Y0 + CLUSTER_PAD;

const CLUSTER_X1 = nodeX0(2) + NODE_W + CLUSTER_PAD;
const CLUSTER_Y1 = NODE_Y0 + NODE_H + CLUSTER_PAD;

// A slot inside node i: column c, row r, counted from the runtime panel's
// top-left. This is the grid the source lays its hexagons on.
const slotX = (i, c) => nodeX0(i) + NEST_PAD + PAD + R + c * COL_PITCH;
const slotY = (r) => NODE_Y0 + NEST_PAD + PAD + R + r * ROW_PITCH;

// The lane the cross-node run travels in: inside the runtime panel, below
// its caption pill - which hangs captionReach() inside the border - and
// above the first row of actors.
const LOOP_Y = NODE_Y0 + NEST_PAD + captionReach() + 8;

// ---- the legend --------------------------------------------------------------
const LEG_GAP = 40;
const LEG_PAD = 30;
const LEG_ROW_GAP = 44;
const LEG_SWATCH_GAP = 150;
const LEG_NAME_DX = 18;

const LEG_Y0 = CLUSTER_Y1 + LEG_GAP;
const LEG_ROW_1 = LEG_Y0 + LEG_PAD + R;
const LEG_ROW_2 = LEG_ROW_1 + R * 2 + LEG_ROW_GAP;
const LEG_Y1 = LEG_ROW_2 + R + LEG_PAD;

// Two columns: what a colour means, and what a run means. The box is as wide
// as the two of them, and centred under the cluster - stretched to the
// cluster's own width it left half of itself empty.
const LEG_NAME_W = 194;
const LEG_COL_GAP = 96;
const LEG_W = LEG_PAD * 2
  + (R * 2 + LEG_NAME_DX + LEG_NAME_W)
  + LEG_COL_GAP
  + (R * 2 + LEG_SWATCH_GAP);
const LEG_X0 = Math.round((CLUSTER_X0 + CLUSTER_X1) / 2 - LEG_W / 2);

const LEG_COL_1 = LEG_X0 + LEG_PAD + R;
const LEG_COL_2 = LEG_COL_1 + R + LEG_NAME_DX + LEG_NAME_W + LEG_COL_GAP + R;

const W = Math.ceil(CLUSTER_X1 + EDGE);
const H = Math.ceil(LEG_Y1 + V_EDGE);

const WORKFLOW = { fill: APP[2].fill, stroke: APP[2].stroke };
const ACTIVITY = { fill: APP[4].fill, stroke: APP[4].stroke };

const dot = (x, y, kind) => node({ x, y, r: R, ...kind });
const at = (x, y) => ({ x, y, r: R });

const word = (x, y, text, anchor = 'middle') => label({
  x, y, text, size: TEXT, weight: 500, color: C.caption, anchor, halo: true,
});

// Which slot holds which kind, node by node, exactly as the source fills
// them. Row 0 is the upper row. A null slot is empty in the source too.
const FILL = [
  // node 0
  [[WORKFLOW, ACTIVITY, ACTIVITY], [ACTIVITY, null, WORKFLOW]],
  // node 1
  [[WORKFLOW, WORKFLOW, ACTIVITY], [ACTIVITY, null, ACTIVITY]],
  // node 2
  [[ACTIVITY, ACTIVITY, WORKFLOW], [ACTIVITY, null, ACTIVITY]],
];

export default {
  width: W,
  height: H,
  title: 'Workflow and activity actors scaled out across the nodes of a cluster',
  desc:
    'A cluster holding three nodes, each with a Dapr runtime holding a mix of '
    + 'workflow actors, drawn as gold circles, and workflow activity actors, '
    + 'drawn as blue circles. Runs between them are activity calls and child '
    + 'workflow calls; some stay inside their node and others cross to the '
    + 'next one, because a workflow that schedules tasks in parallel may have '
    + 'them run on as many nodes as there are tasks or on a single node. A '
    + 'legend below names the two kinds of actor and the two kinds of run.',

  build() {
    return [
      // ---- the boundaries --------------------------------------------------
      region({
        x: CLUSTER_X0,
        y: CLUSTER_Y0,
        w: CLUSTER_X1 - CLUSTER_X0,
        h: CLUSTER_Y1 - CLUSTER_Y0,
        caption: 'Cluster',
        captionW: 74,
        captionSize: TEXT,
      }),
      [0, 1, 2].map((i) => group([
        region({
          x: nodeX0(i),
          y: NODE_Y0,
          w: NODE_W,
          h: NODE_H,
          caption: 'Node',
          captionW: 58,
          captionSize: TEXT,
        }),
        region({
          x: nodeX0(i) + NEST_PAD,
          y: NODE_Y0 + NEST_PAD,
          w: RUN_W,
          h: RUN_H,
          caption: 'Dapr runtime',
          captionW: 112,
          captionSize: TEXT,
        }),
      ])),

      // ---- the runs, under the actors they join ----------------------------
      // Node 0: a workflow actor calls an activity beside it and one below
      // it, and the workflow actor in the lower row drives one above it and
      // one on the next node.
      arrow({ from: at(slotX(0, 0), slotY(0)), to: at(slotX(0, 1), slotY(0)) }),
      arrow({ from: at(slotX(0, 0), slotY(0)), to: at(slotX(0, 0), slotY(1)) }),
      arrow({ from: at(slotX(0, 2), slotY(1)), to: at(slotX(0, 2), slotY(0)) }),
      arrow({ from: at(slotX(0, 2), slotY(1)), to: at(slotX(1, 0), slotY(1)) }),

      // Node 1: a workflow actor schedules a child workflow, which schedules
      // an activity.
      arrow({ from: at(slotX(1, 0), slotY(0)), to: at(slotX(1, 1), slotY(0)) }),
      arrow({ from: at(slotX(1, 1), slotY(0)), to: at(slotX(1, 2), slotY(0)) }),

      // Node 2: its workflow actor drives one activity beside it, one below
      // it, and one back at the far end of its own node.
      arrow({ from: at(slotX(2, 2), slotY(0)), to: at(slotX(2, 1), slotY(0)) }),
      arrow({ from: at(slotX(2, 2), slotY(0)), to: at(slotX(2, 2), slotY(1)) }),
      elbowArrow({
        points: [
          [slotX(2, 2), slotY(0) - R],
          [slotX(2, 2), LOOP_Y],
          [slotX(2, 0), LOOP_Y],
          [slotX(2, 0), slotY(0) - R - 2],
        ],
      }),
      // and one that reaches back to the node before it
      arrow({ from: at(slotX(2, 0), slotY(1)), to: at(slotX(1, 2), slotY(1)) }),

      // ---- the actors ------------------------------------------------------
      FILL.map((rows, i) => rows.map((cols, r) => cols.map((kind, c) => (
        kind ? dot(slotX(i, c), slotY(r), kind) : null
      )))),

      // ---- the legend ------------------------------------------------------
      region({
        x: LEG_X0,
        y: LEG_Y0,
        w: LEG_W,
        h: LEG_Y1 - LEG_Y0,
        caption: 'Legend',
        captionW: 74,
        captionSize: TEXT,
      }),
      dot(LEG_COL_1, LEG_ROW_1, WORKFLOW),
      word(LEG_COL_1 + R + LEG_NAME_DX, LEG_ROW_1, 'workflow actor', 'start'),
      dot(LEG_COL_1, LEG_ROW_2, ACTIVITY),
      word(LEG_COL_1 + R + LEG_NAME_DX, LEG_ROW_2, 'workflow activity actor', 'start'),

      arrow({
        from: at(LEG_COL_2, LEG_ROW_1),
        to: at(LEG_COL_2 + LEG_SWATCH_GAP, LEG_ROW_1),
      }),
      dot(LEG_COL_2, LEG_ROW_1, WORKFLOW),
      dot(LEG_COL_2 + LEG_SWATCH_GAP, LEG_ROW_1, ACTIVITY),
      word(LEG_COL_2 + LEG_SWATCH_GAP / 2, LEG_ROW_1 - R - 6, 'activity call'),

      arrow({
        from: at(LEG_COL_2, LEG_ROW_2),
        to: at(LEG_COL_2 + LEG_SWATCH_GAP, LEG_ROW_2),
      }),
      dot(LEG_COL_2, LEG_ROW_2, WORKFLOW),
      dot(LEG_COL_2 + LEG_SWATCH_GAP, LEG_ROW_2, WORKFLOW),
      word(LEG_COL_2 + LEG_SWATCH_GAP / 2, LEG_ROW_2 - R - 6, 'child workflow'),
    ];
  },
};
