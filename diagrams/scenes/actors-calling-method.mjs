// CALLING AN ACTOR METHOD, and how the call reaches the host the actor
// actually lives on.
//
// Replaces /images/actors-calling-method.png on
// developing-applications/building-blocks/actors/actors-overview.md, under
// "You can invoke actor methods by calling them over HTTP, as shown in the
// general example below".
//
// Fact-check, against the three numbered lines directly below the image:
//   1 "The service calls the actor API on the sidecar."
//   2 "With the cached partitioning information from the placement service,
//     the sidecar determines which actor service instance will host actor ID
//     3. The call is forwarded to the appropriate sidecar." - which is why
//     Actor 3 is in the SECOND pod and the second step runs between the two
//     sidecars.
//   3 "The sidecar instance in pod 2 calls the service instance to invoke the
//     actor and execute the actor method."
//
// DISCREPANCY, raised and NOT resolved silently:
//
//   THE CALL IN STEP THREE IS A PUT, NOT A POST. The source draws POST on
//   both cards. The two calls are different endpoints on different servers:
//   the one the app makes is
//   `POST/GET/PUT/DELETE http://localhost:<daprPort>/v1.0/actors/...`, and
//   the one the runtime makes back into the app is documented as
//   `PUT http://localhost:<appPort>/actors/<actorType>/<actorId>/method/
//   <methodName>` - reference/api/actors_api.md, "Invoke actor method" under
//   the app-side API. POST is kept on the first card, which is what a method
//   invocation uses and what the source shows.
//
// Where this departs from the source as a DRAWING, and why:
//   - THE SERVICE IS A BORDERED CONTAINER, not the hexagon this set draws an
//     app with. What the picture is about is that actor instances are hosted
//     INSIDE a service instance - the whole point of step two is that ID 3
//     lives in the second one - and a hexagon cannot hold anything. Drawing
//     the actors loose in the pod instead would say the POD hosts them, which
//     is the one thing that would make step two meaningless.
//   - the HOST is dropped from both URLs, as everywhere else in this set. It
//     also happens to be the only thing the source's two URLs differ in
//     besides `/v1.0`, and `/v1.0` is the difference that matters: one call
//     goes to the Dapr API, the other to the app's own actor endpoint.
//   - the step discs sit ON their runs, as the source puts them: each has a
//     number and no words, and a disc is filled, so the run passes behind it
//     rather than through it.
//   - no drop shadows, and the sidecar is the house Dapr hexagon rather than
//     the source's shadowed logo block.

import { C, el } from '../engine.mjs';
import {
  arrow, box, captionReach, elbowArrow, group, hexHalfWidth, httpCard,
  httpCardH, label, lineWidth, region, stepMark, STEP_R,
} from '../shapes.mjs';
import { markHex } from '../icons.mjs';

const EDGE = 29;
const V_EDGE = 14;

// 13, the size render-width.mjs is calibrated against.
const TEXT = 13;
const NAME = 15;

const SIDE_R = 52;
const SIDE_HALF = hexHalfWidth(SIDE_R);

// What a dashed boundary leaves around what it holds.
const PAD = 26;

// ---- the service container, and the actors inside it ------------------------
// Measured on the rendered page: "Ordering" at NAME, and "Actor 1" at TEXT
// inside a chip with half an em of air each side.
const SERVICE_NAME_W = 78;
const CHIP_W = 104;
const CHIP_H = 44;
const CHIP_GAP = 16;
const BOX_PAD = 16;
const BOX_W = BOX_PAD + SERVICE_NAME_W + BOX_PAD + CHIP_W + CHIP_GAP + CHIP_W + BOX_PAD;
const BOX_H = CHIP_H + BOX_PAD * 2 + 20;

// ---- the row inside a pod ---------------------------------------------------
// The gap between the service and its sidecar carries step one's disc with
// air at both ends, so a bigger disc cannot close on either shape.
const RUN_GAP = STEP_R * 2 + 56;

const BOX_X = EDGE + PAD;
const SIDE_X = Math.round(BOX_X + BOX_W + RUN_GAP + SIDE_HALF);

const POD_W = SIDE_X + SIDE_HALF + PAD - EDGE;
const POD_TOP_PAD = captionReach() + PAD;
const POD_H = POD_TOP_PAD + Math.max(BOX_H, SIDE_R * 2) + PAD;

// ---- the two pods, and the hop between them ---------------------------------
// Deep enough for step two's disc to sit on the run between the sidecars with
// the same air each side that step one gets.
const POD_GAP = STEP_R * 2 + 40;

// The cards hang off the drawing on leaders, so the gap above and below is
// what a leader needs to read as one.
const LEAD = 34;

const CARD_W = 356;
const CARD_H = Math.ceil(httpCardH({ size: TEXT }));

const CARD_TOP_Y = Math.round(V_EDGE + CARD_H / 2);
const POD_1_Y = Math.round(CARD_TOP_Y + CARD_H / 2 + LEAD);
const POD_2_Y = POD_1_Y + POD_H + POD_GAP;
const CARD_BOT_Y = Math.round(POD_2_Y + POD_H + LEAD + CARD_H / 2);

const ROW_1_Y = Math.round(POD_1_Y + POD_TOP_PAD + Math.max(BOX_H, SIDE_R * 2) / 2);
const ROW_2_Y = ROW_1_Y + POD_H + POD_GAP;

const W = Math.ceil(EDGE + POD_W + EDGE);
const H = Math.ceil(CARD_BOT_Y + CARD_H / 2 + V_EDGE);

const CARD_X = Math.round(W / 2);

// Where each step's disc sits: on the middle of the run it numbers.
const STEP_1 = { x: Math.round((BOX_X + BOX_W + SIDE_X - SIDE_HALF) / 2), y: ROW_1_Y };
const STEP_2 = { x: SIDE_X, y: Math.round((ROW_1_Y + SIDE_R + ROW_2_Y - SIDE_R) / 2) };
const STEP_3 = { x: STEP_1.x, y: ROW_2_Y };

// The URL both cards carry, with the building block picked out as every Dapr
// call in this set picks it out.
const path = (prefix) => [
  { text: prefix },
  { text: 'actors', color: C.orange, weight: 700 },
  { text: '/OrderActor/3/method/ship' },
];

// A SERVICE AND THE ACTORS IT HOSTS, as one object: a bordered container with
// the service's name on the left and a chip per actor beside it. Grouped so
// the shape-clearance check reads the chips as part of the container they sit
// inside rather than as three shapes crowding each other.
function service({ y, names }) {
  const top = y - BOX_H / 2;
  return group({
    class: 'd-named-mark',
    children: [
      el('rect', {
        x: BOX_X, y: top, width: BOX_W, height: BOX_H, rx: 8,
        fill: C.bg, stroke: C.navy, 'stroke-width': lineWidth(),
      }),
      label({
        x: BOX_X + BOX_PAD, y, text: 'Ordering\nService', size: NAME, anchor: 'start',
      }),
      names.map((name, i) => box({
        x: BOX_X + BOX_PAD + SERVICE_NAME_W + BOX_PAD + CHIP_W / 2 + i * (CHIP_W + CHIP_GAP),
        y,
        w: CHIP_W,
        h: CHIP_H,
        label: name,
        size: TEXT,
      })),
    ],
  });
}

export default {
  width: W,
  height: H,
  title: 'A call to an actor method being routed to the host the actor lives on',
  desc:
    'Two dashed regions stacked, captioned Machine 1 or Pod 1 and Machine 2 '
    + 'or Pod 2. Each holds a bordered container named Ordering Service with '
    + 'two chips inside it - Actor 1 and Actor 2 above, Actor 3 and Actor 4 '
    + 'below - and a hexagon carrying the Dapr logo to its right. Step one '
    + 'runs from the first container to its sidecar; step two runs down from '
    + 'that sidecar to the sidecar in the second pod; step three runs from '
    + 'that sidecar back into the second container. A card above the drawing '
    + 'holds POST on /v1.0/actors/OrderActor/3/method/ship, and a card below '
    + 'it holds PUT on /actors/OrderActor/3/method/ship.',

  build() {
    return [
      // ---- the two pods, drawn first so everything sits on them -----------
      region({
        x: EDGE, y: POD_1_Y, w: POD_W, h: POD_H,
        caption: 'Machine 1 or Pod 1', captionW: 150, captionSize: TEXT,
      }),
      region({
        x: EDGE, y: POD_2_Y, w: POD_W, h: POD_H,
        caption: 'Machine 2 or Pod 2', captionW: 150, captionSize: TEXT,
      }),

      // ---- one: the service calls the actor API on its own sidecar --------
      arrow({
        from: [BOX_X + BOX_W + 2, ROW_1_Y],
        to: { x: SIDE_X, y: ROW_1_Y, r: SIDE_R, hex: true },
      }),

      // ---- two: the sidecar forwards it to the host that has ID 3 ---------
      arrow({
        from: { x: SIDE_X, y: ROW_1_Y, r: SIDE_R, hex: true },
        to: { x: SIDE_X, y: ROW_2_Y, r: SIDE_R, hex: true },
      }),

      // ---- three: and that sidecar invokes the method on the service ------
      arrow({
        from: { x: SIDE_X, y: ROW_2_Y, r: SIDE_R, hex: true },
        to: [BOX_X + BOX_W + 2, ROW_2_Y],
      }),

      // ---- the leaders from each card to the step it explains -------------
      // Dashed, because a leader is not traffic: it says "this block is about
      // that run", which is the one thing `dash` means in this set.
      //
      // IT TURNS IN THE BAND BETWEEN THE CARD AND THE POD, then drops in the
      // clear corridor between the service and its sidecar - the one the disc
      // already sits in. Taken straight down from the card's own centre it
      // ran through the service container and came out the other side as a
      // stub beside it, which nothing but a render could see: the shapes are
      // drawn over the lines, so the leader simply vanished.
      elbowArrow({
        color: C.caption,
        dash: true,
        heads: 'none',
        points: [
          [CARD_X, CARD_TOP_Y + CARD_H / 2],
          [CARD_X, POD_1_Y - LEAD / 2],
          [STEP_1.x, POD_1_Y - LEAD / 2],
          [STEP_1.x, STEP_1.y - STEP_R],
        ],
      }),
      elbowArrow({
        color: C.caption,
        dash: true,
        heads: 'none',
        points: [
          [CARD_X, CARD_BOT_Y - CARD_H / 2],
          [CARD_X, POD_2_Y + POD_H + LEAD / 2],
          [STEP_3.x, POD_2_Y + POD_H + LEAD / 2],
          [STEP_3.x, STEP_3.y + STEP_R],
        ],
      }),

      // ---- the shapes, over the lines that reach them ---------------------
      service({ y: ROW_1_Y, names: ['Actor 1', 'Actor 2'] }),
      service({ y: ROW_2_Y, names: ['Actor 3', 'Actor 4'] }),
      markHex({ x: SIDE_X, y: ROW_1_Y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
      markHex({ x: SIDE_X, y: ROW_2_Y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),

      // ---- and the numbers, over the runs they belong to ------------------
      stepMark({ x: STEP_1.x, y: STEP_1.y, step: 1 }),
      stepMark({ x: STEP_2.x, y: STEP_2.y, step: 2 }),
      stepMark({ x: STEP_3.x, y: STEP_3.y, step: 3 }),

      // ---- the two calls --------------------------------------------------
      httpCard({
        x: CARD_X, y: CARD_TOP_Y, w: CARD_W, h: CARD_H, size: TEXT,
        method: 'POST', url: path('/v1.0/'),
      }),
      httpCard({
        x: CARD_X, y: CARD_BOT_Y, w: CARD_W, h: CARD_H, size: TEXT,
        method: 'PUT', url: path('/'),
      }),
    ];
  },
};
