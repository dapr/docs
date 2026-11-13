// HOW A CALL FOR A PARTICULAR ACTOR ID REACHES THE INSTANCE THAT HOLDS IT.
//
// Replaces /images/actors_background_id_hashing_calling.png on
// developing-applications/building-blocks/actors/actors-features-concepts.md,
// under "When a client calls an actor with a particular id (for example,
// actor id 123), the Dapr instance for the client hashes the actor type and
// id, and uses the information to call onto the corresponding Dapr instance
// that can serve the requests for that particular actor id".
//
// It is the registration picture with the caller added, and everything the
// two share comes from diagrams/actors-placement.mjs: the page draws them two
// paragraphs apart and a reader is meant to see the same three instances.
//
// Fact-check, against that paragraph and the one above it:
//   - "the Dapr instance for the client hashes the actor type and id, and
//     uses the information" - the information is the caller's own CACHED
//     table. The page says so in the paragraph above: "This partition data
//     table for each actor type is updated and stored in each Dapr instance
//     running in the environment." So step one is a local lookup.
//   - "the same partition (or service instance) is always called for any
//     given actor id" - which is why ID 123 lands on Instance 2 and would
//     land there again.
//
// DISCREPANCY, raised and NOT resolved silently:
//
//   THE SOURCE DRAWS A LIVE LINK TO THE PLACEMENT SERVICE for the lookup - a
//   line with a head at each end between the caller's runtime and the
//   Placement panel, sitting right beside the callout that says the caller
//   "looks this up in the local cache". A reader cannot have both: either the
//   lookup is local or it is a round trip to Placement, and the prose says
//   local. Here the caller's link to Placement is the one the previous
//   picture draws - the broadcast that FILLS the cache - so it is dashed, in
//   the caption colour, and labelled as the table arriving rather than as the
//   lookup going out.
//
// Where this departs from the source as a DRAWING: the same three departures
// the registration picture records, and one more - the run from the caller to
// Instance 2 goes down and round the stack rather than through the gap
// between two instance boundaries, where it would cross Instance 3's caption.

import { C } from '../engine.mjs';
import {
  arrow, captionReach, elbowArrow, group, label, stepMark, STEP_R,
} from '../shapes.mjs';
import {
  EDGE, INST_APP_DX, INST_H, INST_ROW_DY, INST_TABLE_DX, INST_TABLE_SIZE,
  INST_W, PLACE_H, PLACE_W, SIDE_R, TEXT, V_EDGE,
  instance, instanceSide, placement, tableSize,
} from '../actors-placement.mjs';

// The cached table's own width, so the note under it is centred on the table
// rather than on a number typed here.
const TABLE_W = tableSize(INST_TABLE_SIZE).w;
// Half the table's depth, plus air: the band between it and the boundary's
// lower edge is the only clear space inside an instance.
const NOTE_DY = Math.round(tableSize(INST_TABLE_SIZE).h / 2 + 18);

const INSTANCES = [
  { name: 'Instance 1', note: 'MyActor1' },
  { name: 'Instance 2', note: 'MyActor1' },
  { name: 'Instance 3', note: 'MyActor2' },
];
// Which of them ends up serving ID 123: the second, as the source has it.
const TARGET = 1;
const CAPTION_W = 88;

// 36, not 24: the run between the two sidecars uses the lane between
// Instance 2 and Instance 3, and it arrives from the left across the x
// Instance 3's caption pill occupies. The pill hangs a caption's reach
// into the gap, so the lane needs room on both sides of it.
const INST_GAP_Y = 36;

// The three steps, in the maintainer's own words (2026-11-03), each with a
// disc on the thing it describes: the caller's service, the caller's sidecar,
// and the run between the two sidecars.
const STEPS = [
  'Client code calls actor ID 123 for actor type MyActor1',
  'The Dapr instance hashes the request for ID 123 to a\n'
    + 'Dapr instance (partition) and looks this up in the local cache',
  'Client call for actor ID 123 sent to the Dapr instance\nto create the actor',
];
// Measured on the rendered page: the longest line of the longest step.
const STEP_TEXT_W = 378;
const STEP_DISC_GAP = 14;
const STEP_W = STEP_R * 2 + STEP_DISC_GAP + STEP_TEXT_W;
const STEP_PITCH = 50;

// ---- the frame --------------------------------------------------------------
// NO CHANNEL DOWN THE LEFT, unlike the registration picture: nothing here
// has to reach all three instances, and the one run that reaches the middle
// of the stack gets there through the gap between two of them instead.
const COL_GAP = 56;
// The caller stands further off the panel than the stack does, because the
// line between them carries a name and the stack's lines carry none.
const CALLER_GAP = 130;

// THE CALLER IS ON THE LEFT and the three instances on the right, which is
// the order the picture is read in: a client calls, the call is hashed, the
// call lands on an instance. Maintainer's call, 2026-11-03. The source has
// it the other way round, which puts the first thing that happens at the
// far right of the drawing.
const CALLER_X = EDGE;
const PLACE_X = CALLER_X + INST_W + CALLER_GAP;
const STACK_X = PLACE_X + PLACE_W + COL_GAP;

const STACK_Y = Math.round(V_EDGE + captionReach());
const STACK_H = INST_H * INSTANCES.length + INST_GAP_Y * (INSTANCES.length - 1);
const instY = (i) => STACK_Y + i * (INST_H + INST_GAP_Y);

// The caller stands level with the instance it ends up calling, so the run
// between them is as short as the picture allows and the pair reads as a
// pair.
const CALLER_Y = instY(TARGET);

// The Placement panel is centred on the caller's ROW, not on the caller's
// box: the line between them leaves the panel and arrives at the service
// inside the caller, and centred on the box it came out six units off level.
const PLACE_Y = Math.round(CALLER_Y + INST_ROW_DY - PLACE_H / 2);

// The call from the caller to the instance that holds ID 123 runs in the
// lane BETWEEN Instance 2 and Instance 3: the only way to the middle of the
// stack that crosses no boundary's contents. The lane rides HIGH in that
// gap, because Instance 3's caption pill hangs a caption's reach above its
// own border and the run arrives from the left, across the very x the pill
// occupies. INST_GAP_Y is what it is so that both clearances exist.
const LANE_CLEAR = 13;
const GAP_Y = Math.round(instY(TARGET) + INST_H + LANE_CLEAR);

// The legend stands under the CALLER, in the left column. Under the whole
// drawing it added the stack's last row to the height for nothing; under the
// caller it fills a band that is empty anyway, and the picture is a third
// shorter. Maintainer's call, 2026-11-03.
const STEP_0_Y = Math.round(CALLER_Y + INST_H + 36 + STEP_PITCH / 2);

const W = Math.ceil(STACK_X + INST_W + EDGE);
const H = Math.ceil(Math.max(
  STACK_Y + STACK_H,
  STEP_0_Y + STEP_PITCH * (STEPS.length - 0.5),
) + V_EDGE);

const STEP_X = CALLER_X;

// Where the run leaves the caller and where it arrives: the two sidecars.
const CALLER_SIDE = instanceSide(CALLER_X, CALLER_Y);
const TARGET_SIDE = instanceSide(STACK_X, instY(TARGET));

// Where the discs stand. One and two go over the caller's two shapes, above
// its boundary rather than inside it: inside, the top pad is a caption's
// reach deep and a disc there sits on the "Caller" pill.
const CALLER_APP_X = CALLER_X + INST_APP_DX;
const DISC_Y = CALLER_Y - 38;

export default {
  width: W,
  height: H,
  title: 'A call for actor ID 123 routed to the service instance that holds it',
  desc:
    'On the left, three dashed boundaries stacked, captioned Instance 1, '
    + 'Instance 2 and Instance 3, each holding a green hexagon named Service '
    + 'code over the actor type it hosts, a hexagon carrying the Dapr logo, '
    + 'and a small table of actor types and partitions. Instance 2 shows '
    + 'Actor ID 123 created. In the middle, a filled panel named Dapr '
    + 'Placement service holding the same table larger, with a dashed line to '
    + 'a fourth boundary on the right captioned Caller, whose service reads '
    + 'Call Actor ID 123. A run leaves the caller, passes below the stack and '
    + 'arrives at Instance 2. Two steps below: the caller’s sidecar hashes '
    + 'the actor type and ID 123 and looks it up in its cache; the call goes '
    + 'straight to the instance that table names.',

  build() {
    return [
      // ---- three: the call goes SIDECAR TO SIDECAR ------------------------
      // From the caller's Dapr sidecar to the sidecar of the instance that
      // holds ID 123, down into the lane between Instance 2 and Instance 3
      // and back up. Maintainer's call, 2026-11-03: the run is between the
      // two runtimes, not between two boundaries.
      elbowArrow({
        points: [
          [CALLER_SIDE.x, CALLER_SIDE.y + SIDE_R + 2],
          [CALLER_SIDE.x, GAP_Y],
          [TARGET_SIDE.x, GAP_Y],
          [TARGET_SIDE.x, TARGET_SIDE.y + SIDE_R + 2],
        ],
      }),

      // ---- the caller's cache is kept full by Placement, not consulted ----
      // Leftward now, from the panel's left face to the caller's right edge:
      // the caller sits on the left of the panel.
      arrow({
        from: [PLACE_X - 2, PLACE_Y + PLACE_H / 2],
        to: [CALLER_X + INST_W + 2, CALLER_Y + INST_ROW_DY],
        color: C.caption,
        dash: true,
      }),
      label({
        x: (CALLER_X + INST_W + PLACE_X) / 2,
        y: PLACE_Y + PLACE_H / 2 - 18,
        text: 'partition table',
        size: TEXT,
        color: C.caption,
      }),


      // ---- the instances, over the lines that reach them ------------------
      INSTANCES.map((row, i) => instance({
        x: STACK_X,
        y: instY(i),
        name: row.name,
        // WHICH instance holds ID 123 is said by the run that arrives at it,
        // not by a third line inside the hexagon: hexNameBlock() measures a
        // multi-line NAME but not a multi-line sub, so the second sub line
        // was drawn straight through the first.
        note: row.note,
        captionW: CAPTION_W,
      })),
      placement({ x: PLACE_X, y: PLACE_Y }),
      instance({
        x: CALLER_X, y: CALLER_Y, name: 'Caller', note: 'Call ID 123',
        captionW: 66,
      }),

      // ---- what ID 123 means for the instance that ends up with it --------
      // Under that instance's cached table, which is the one band inside the
      // boundary with nothing in it.
      label({
        x: STACK_X + INST_TABLE_DX + TABLE_W / 2,
        y: instY(TARGET) + INST_ROW_DY + NOTE_DY,
        text: 'Actor ID 123 created',
        size: TEXT,
      }),

      // ---- one and two, over the two shapes they happen in ----------------
      stepMark({ x: CALLER_APP_X, y: DISC_Y, step: 1 }),
      stepMark({ x: CALLER_SIDE.x, y: DISC_Y, step: 2 }),
      // ---- and three, on the run it names ---------------------------------
      stepMark({ x: Math.round((CALLER_SIDE.x + TARGET_SIDE.x) / 2), y: GAP_Y, step: 3 }),

      // ---- and what each step is ------------------------------------------
      STEPS.map((text, i) => {
        const y = STEP_0_Y + i * STEP_PITCH;
        return group({
          class: 'd-named-mark',
          children: [
            stepMark({ x: STEP_X + STEP_R, y, step: i + 1 }),
            label({
              x: STEP_X + STEP_R * 2 + STEP_DISC_GAP, y, text, size: TEXT, anchor: 'start',
            }),
          ],
        });
      }),
    ];
  },
};
