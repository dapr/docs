// HOW A SERVICE INSTANCE REGISTERS ITS ACTOR TYPES WITH THE PLACEMENT
// SERVICE, and how the partition table gets back to every instance.
//
// Replaces /images/actors_background_placement_service_registration.png on
// developing-applications/building-blocks/actors/actors-features-concepts.md,
// under "The Dapr actor runtime manages distribution scheme and key range
// settings for you via the actor `Placement` service".
//
// DISCREPANCIES, raised and NOT resolved silently:
//
//   1. THE SOURCE LABELS TWO DIFFERENT INSTANCES "Instance 1". The top one
//      and the bottom one both carry it; the bottom one hosts MyActor2 while
//      the top hosts MyActor1, so they are plainly not the same instance.
//      Drawn as Instance 3.
//
//   2. THE SOURCE'S NUMBERING IS NOT THE PAGE'S. The page gives three
//      numbered steps - the sidecar asks its service for its actor types, the
//      runtime registers them, Placement calculates the partitioning - and
//      the source marks two steps whose words are its own. A reader counting
//      "1, 2, 3" in the prose and finding "1, 2" in the picture beside it has
//      to reconcile them, so the steps here are the PAGE's, in the page's
//      order. The fourth is not numbered in the prose; it is the sentence
//      directly under the list - "This partition data table for each actor
//      type is updated and stored in each Dapr instance running in the
//      environment" - which is the only thing that explains the cached copy
//      the source draws on all three instances and never accounts for.
//
// Where this departs from the source as a DRAWING, and why:
//   - an instance is a captioned dashed boundary holding the service hexagon,
//     its sidecar and its cached copy of the table. The source draws three
//     nested white-on-grey rectangles with the name floating outside them.
//   - the step words are SHORT. The source sets two full sentences in bold
//     beside the drawing, which is the page's job; the picture names each
//     step and the page explains it.
//   - the Placement service is a filled panel rather than the source's dark
//     blue box with a drop shadow, and its table is the house one.

import { C } from '../engine.mjs';
import {
  arrow, elbowArrow, group, label, stepMark, STEP_R,
} from '../shapes.mjs';
import {
  EDGE, INST_APP_DX, INST_H, INST_ROW_DY, INST_SIDE_DX, INST_W, PLACE_H,
  PLACE_W, TEXT, V_EDGE, instance, placement,
} from '../actors-placement.mjs';
import { captionReach } from '../shapes.mjs';

// What each instance hosts, and what its boundary is called. Two instances of
// the MyActor1 service and one of MyActor2, as the source has it.
const INSTANCES = [
  { name: 'Instance 1', note: 'MyActor1' },
  { name: 'Instance 2', note: 'MyActor1' },
  { name: 'Instance 3', note: 'MyActor2' },
];
// Measured on the rendered page: "Instance 1" at TEXT, plus half an em each
// side of the pill.
const CAPTION_W = 88;

const INST_GAP_Y = 24;

// ---- the steps, in the page's own order -------------------------------------
const STEPS = [
  'The sidecar asks its service\nwhich actor types it has',
  'The runtime registers those\ntypes with Placement',
  'Placement calculates the\npartitioning across instances',
  'The table is broadcast, and\ncached in every instance',
];
// Measured on the rendered page: the longest line of the longest step.
const STEP_TEXT_W = 196;
const STEP_DISC_GAP = 14;
const STEP_W = STEP_R * 2 + STEP_DISC_GAP + STEP_TEXT_W;
const STEP_PITCH = 54;

// ALL FOUR ARE NUMBERED. The fourth is the sentence directly under the
// page's numbered list rather than an item in it, and it was set in the
// caption colour with no disc to say so - but it is a step the picture
// draws, and a run with no number beside three that have one reads as
// something the diagram forgot. Maintainer's call, 2026-11-03.
const NUMBERED = 4;

// ---- the frame --------------------------------------------------------------
// 120, not 56: the three registration runs are ELBOWED, like every other run
// in this set, and the two outer ones turn halfway across this gap - which
// leaves each of their legs long enough to carry a step's disc above it.
// Maintainer's call, 2026-11-03; the first version drew them as three
// diagonals, which is the one line shape nothing else here uses.
const COL_GAP = 120;

// How far a step's disc stands off the thing it counts.
const DISC_LIFT = 26;

// Step one's disc stands higher, because what it has to clear is not the
// line but the two HEXAGONS the line joins: a hexagon is full width over the
// middle half of its height, so at DISC_LIFT the disc sat on the service's
// shoulder. At PAIR_LIFT both shapes have tapered away from it.
const PAIR_LIFT = 44;
const STACK_H = INST_H * INSTANCES.length + INST_GAP_Y * (INSTANCES.length - 1);

// A CHANNEL DOWN THE LEFT for the broadcast to climb. It has to reach all
// three instances and the two lower ones stand in the way of the top one, so
// the one line that carries it runs outside the stack and branches into each
// boundary. Inside the stack it would have to cross whatever it passed.
const BUS_CHANNEL = 44;
const BUS_X = EDGE + 20;

const STACK_X = EDGE + BUS_CHANNEL;
const PLACE_X = STACK_X + INST_W + COL_GAP;
const STEP_X = PLACE_X + PLACE_W + COL_GAP;

const STACK_Y = Math.round(V_EDGE + captionReach());
const instY = (i) => STACK_Y + i * (INST_H + INST_GAP_Y);

// THE PANEL IS CENTRED ON THE MIDDLE INSTANCE'S ROW, not on the stack as a
// whole. That is what makes the middle registration a single straight line
// and the outer two exact mirrors of each other - same drop, same rise, same
// legs - which is the arrangement the maintainer asked for (2026-11-03).
// Centred on the stack it sat high, and all three ran at different angles.
//
// THE ARRIVALS ARE BUILT OUTWARD FROM THE MIDDLE ONE, which is pinned to
// that row exactly. Taking them as fractions of the panel's height instead
// put the middle arrival ONE UNIT below the row - a rounding of PLACE_H / 2
// against a rounding of PLACE_H / 4 - and one unit over a five-hundred-unit
// run is a tilt you can see. The panel moves up by that unit; nothing else
// about it changes.
const STEPS_H = STEP_PITCH * STEPS.length;
const MID = (INSTANCES.length - 1) / 2;
const MID_ROW_Y = instY(MID) + INST_ROW_DY;
const ARRIVE_SPREAD = Math.round(PLACE_H / (INSTANCES.length + 1));
const PLACE_Y = MID_ROW_Y - Math.round(PLACE_H / 2);
const STEP_0_Y = Math.round(PLACE_Y + PLACE_H + 34 + STEP_PITCH / 2);

// Where the registration runs leave the stack and where they arrive.
//
// EACH ARRIVES AT ITS OWN HEIGHT on the panel's left edge. Three orthogonal
// runs into ONE point would share their last leg, so the three would read as
// one line with three sources; spread, each is a registration you can
// follow. The two outer ones turn at the SAME x, halfway across the gap,
// which is what makes them mirror images; the middle one needs no turn at
// all, because the panel is centred on its row.
const PLACE_LEFT = PLACE_X;
const PLACE_MID_Y = PLACE_Y + PLACE_H / 2;
const STACK_RIGHT = STACK_X + INST_W;
const TURN_X = Math.round(STACK_RIGHT + COL_GAP / 2);
const arriveY = (i) => MID_ROW_Y + Math.round((i - MID) * ARRIVE_SPREAD);

// The broadcast runs back along a line of its own, under the stack, so it
// cannot be mistaken for one of the three registrations going the other way.
const BROADCAST_Y = Math.round(STACK_Y + STACK_H + 22);

const W = Math.ceil(STEP_X + STEP_W + EDGE);
const H = Math.ceil(Math.max(
  STEP_0_Y + STEP_PITCH * (STEPS.length - 0.5),
  BROADCAST_Y,
) + V_EDGE);

export default {
  width: W,
  height: H,
  title: 'Three service instances registering their actor types with the Dapr Placement service',
  desc:
    'On the left, three dashed boundaries stacked, captioned Instance 1, '
    + 'Instance 2 and Instance 3. Each holds a green hexagon named Service '
    + 'code over the actor type it hosts - MyActor1, MyActor1 and MyActor2 - '
    + 'joined by a line with a head at each end to a hexagon carrying the Dapr '
    + 'logo, and beside that a small table of actor types and partitions. '
    + 'Each sidecar has an arrow to a filled panel in the middle named Dapr '
    + 'Placement service, which holds the same table larger. A line runs back '
    + 'from the panel under the stack and up into all three sidecars. On the '
    + 'right, four steps: the sidecar asks its service which actor types it '
    + 'has; the runtime registers those types with Placement; Placement '
    + 'calculates the partitioning across instances; the table is broadcast, '
    + 'and cached in every instance.',

  build() {
    return [
      // ---- two: each instance registers its types -------------------------
      // The run leaves the instance's own BOUNDARY rather than the sidecar
      // inside it. Taken from the sidecar it would have to cross that
      // instance's cached table to get out, and the table is drawn over the
      // lines, so the run simply disappeared under it and came out the far
      // side as a stub.
      INSTANCES.map((_, i) => {
        const rowY = instY(i) + INST_ROW_DY;
        // elbowArrow() refuses a zero-length leg, and the middle instance's
        // row IS the height it arrives at: that one is a straight line.
        if (rowY === arriveY(i)) {
          return arrow({ from: [STACK_RIGHT + 2, rowY], to: [PLACE_LEFT - 2, rowY] });
        }
        return elbowArrow({
          points: [
            [STACK_RIGHT + 2, rowY],
            [TURN_X, rowY],
            [TURN_X, arriveY(i)],
            [PLACE_LEFT - 2, arriveY(i)],
          ],
        });
      }),

      // ---- four: and the table comes back to all of them ------------------
      elbowArrow({
        color: C.caption,
        points: [
          [PLACE_X + PLACE_W / 2, PLACE_Y + PLACE_H + 2],
          [PLACE_X + PLACE_W / 2, BROADCAST_Y],
          [BUS_X, BROADCAST_Y],
          [BUS_X, instY(0) + INST_ROW_DY],
          [STACK_X - 2, instY(0) + INST_ROW_DY],
        ],
      }),
      INSTANCES.slice(1).map((_, i) => arrow({
        color: C.caption,
        from: [BUS_X, instY(i + 1) + INST_ROW_DY],
        to: [STACK_X - 2, instY(i + 1) + INST_ROW_DY],
      })),

      // ---- the instances, over the lines that reach them ------------------
      INSTANCES.map((row, i) => instance({
        x: STACK_X, y: instY(i), name: row.name, note: row.note, captionW: CAPTION_W,
      })),
      placement({ x: PLACE_X, y: PLACE_Y }),

      // ---- the numbers, on the drawing as well as in the legend -----------
      // Each sits over the run it counts, once: the three steps happen on
      // every instance, and a disc on all three would say they are three
      // different things rather than one thing happening three times.
      // Maintainer's call, 2026-11-03.
      //
      // One: inside Instance 1, over the line the service and its sidecar
      // share. Above the line rather than on it, because that line already
      // carries a head at each end.
      stepMark({
        x: STACK_X + (INST_APP_DX + INST_SIDE_DX) / 2,
        y: instY(0) + INST_ROW_DY - PAIR_LIFT,
        step: 1,
      }),
      // Two: over the leg that carries Instance 1's registration into the
      // panel. The leg out of the boundary is a turn's width long and has no
      // room above it; this one is the width of the whole gap.
      stepMark({
        x: Math.round((TURN_X + PLACE_LEFT) / 2),
        y: arriveY(0) - DISC_LIFT,
        step: 2,
      }),
      // Three: against the panel's right side. It is the only step that
      // happens INSIDE the Placement service, so it is the only one with no
      // run of its own to sit over.
      stepMark({ x: PLACE_X + PLACE_W + DISC_LIFT, y: PLACE_MID_Y, step: 3 }),
      // Four: where the broadcast leaves the panel, beside the riser rather
      // than on it. It is a step like the other three - the page states it
      // in the sentence under its numbered list rather than in the list -
      // and it was the only thing in the picture without a number.
      stepMark({
        x: PLACE_X + PLACE_W / 2 + DISC_LIFT,
        y: PLACE_Y + PLACE_H + DISC_LIFT,
        step: 4,
      }),

      // ---- and what each step is ------------------------------------------
      STEPS.map((text, i) => {
        const y = STEP_0_Y + i * STEP_PITCH;
        const numbered = i < NUMBERED;
        return group({
          class: 'd-named-mark',
          children: [
            numbered
              ? stepMark({ x: STEP_X + STEP_R, y, step: i + 1 })
              : null,
            label({
              x: STEP_X + STEP_R * 2 + STEP_DISC_GAP,
              y,
              text,
              size: TEXT,
              anchor: 'start',
              color: numbered ? C.body : C.caption,
            }),
          ],
        });
      }),
    ];
  },
};
