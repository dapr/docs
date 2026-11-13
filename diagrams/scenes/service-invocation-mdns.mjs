// ROUND ROBIN ACROSS THREE INSTANCES OF ONE APP, which is what mDNS name
// resolution does when an app id has been scaled out.
//
// Replaces /images/service-invocation-mdns-round-robin.png on
// developing-applications/building-blocks/service-invocation/
// service-invocation-overview.md, under "Round robin load balancing with
// mDNS".
//
// ---------------------------------------------------------------------------
// DISCREPANCY, and it is why this is not a trace of its source.
// THE SOURCE IMAGE HAS THE CALLER CALLING ITSELF.
//
// It draws "Service A" on the left and "Service A Instance 1", "Service A
// Instance 2" and "Service A Instance 3" on the right - one application
// round-robining across instances of itself, which is not what round robin
// load balancing is and not what the page says.
//
// The paragraph directly above the image says:
//
//   "If you have 1 instance of an application with app ID `FrontEnd` and 3
//    instances of application with app ID `Cart` and you call from `FrontEnd`
//    app to `Cart` app, Dapr round robins' between the 3 instances."
//
// Two different app ids, named, with the counts given. And the note directly
// BELOW the image is about exactly the distinction the image loses: "App ID is
// unique per application, not application instance. Regardless how many
// instances of that application exist (due to scaling), all of them will share
// the same app ID."
//
// So the prose wins: `FrontEnd` calls `Cart`, and the three hexagons on the
// right are three instances of Cart. The old image stays on disk; correcting
// it is the maintainers' call.
// ---------------------------------------------------------------------------
//
// HOW THE THREE INSTANCES ARE COLOURED, which the note below the image is the
// argument for. They are one application, so they carry ONE name and ONE
// colour, with the instance said beside each - the treatment the maintainer
// settled on for `distributed-lock-overview` (2026-11-02) and the rule
// diagrams/app-colour.test.mjs enforces. Three colours would say three
// applications, which would mean three app ids, which is the one thing the
// page is at pains to deny.
//
// Where else this departs from the source, and why:
//   - the fan is three elbowed runs from the caller's sidecar, not three
//     straight diagonals. This set draws no diagonals except a callout's
//     leader.
//   - the source's curved brace labelled "Round robin load balancing" becomes
//     a caption over the fan. A brace is a shape used nowhere else here, and
//     what it is doing is naming the three runs.
//   - each callee keeps its own sidecar, as the source draws it: the call
//     arrives at the instance's sidecar and the sidecar hands it on.

import { APP, C } from '../engine.mjs';
import {
  arrow, elbowArrow, group, hex, hexHalfWidth, label,
} from '../shapes.mjs';
import { markHex } from '../icons.mjs';
import { NAME_DY } from '../services.mjs';

const EDGE = 29;
const V_EDGE = 14;
const TEXT = 13;
const NAME = 17;

const APP_R = 54;
const SIDE_R = 40;

// Three rows, so the shapes are a little smaller than the single-row pictures
// on the same page: at APP_R 60 the stack is taller than the page's column
// wants and the type derived from it would be bigger here than there.
// The row pitch is what the INSTANCE CAPTION needs, not what the hexagons
// need: the caption hangs INST_DY below its own centre and the next hexagon
// reaches APP_R above its, so the two close on each other from both sides. At
// 130 the caption would be drawn and then painted over by the hexagon under
// it, which is exactly what shipped on the distributed lock how-to before
// diagrams/label-cover.test.mjs existed.
const ROW_GAP = 150;
const ROWS = 3;

// The instance caption sits under its hexagon, clear of the name inside it.
const INST_DY = APP_R + 20;

const ROW_T = Math.round(V_EDGE + APP_R);
const rowY = (i) => ROW_T + i * ROW_GAP;
const MID_Y = rowY(1);

// ---- the caller, on the middle row -----------------------------------------
const CALLER = { x: EDGE + hexHalfWidth(APP_R), y: MID_Y, r: APP_R, hex: true };
const GAP = 92;
const SIDE = {
  x: CALLER.x + hexHalfWidth(APP_R) + GAP + hexHalfWidth(SIDE_R),
  y: MID_Y,
  r: SIDE_R,
  hex: true,
};

// ---- the fan, and the three instances it reaches ----------------------------
// The runs leave the sidecar's right face and turn once. The turn is far
// enough out that the upper and lower runs are clear of the caption over them.
const FAN_X = SIDE.x + hexHalfWidth(SIDE_R) + 96;
const CALLEE_GAP = 118;
const CALLEE_SIDE_X = FAN_X + CALLEE_GAP + hexHalfWidth(SIDE_R);
const CALLEE_X = CALLEE_SIDE_X + hexHalfWidth(SIDE_R) + 86 + hexHalfWidth(APP_R);

// The caption names the three runs, so it rides over the fan rather than over
// any one of them.
const FAN_CAPTION_Y = rowY(0) - APP_R + 6;

const NAME_Y = (y) => y + SIDE_R * NAME_DY;

const W = Math.ceil(CALLEE_X + hexHalfWidth(APP_R) + EDGE);
const H = Math.ceil(rowY(ROWS - 1) + INST_DY + TEXT + V_EDGE);

export default {
  width: W,
  height: H,
  title: 'Dapr round robining a call from one app across three instances of another',
  desc:
    'On the left, a green hexagon named FrontEnd with an arrow to a hexagon '
    + 'carrying the Dapr logo, named Dapr sidecar. From that sidecar three '
    + 'lines fan out, captioned Round robin load balancing, each turning once '
    + 'and running into its own Dapr sidecar hexagon. Each of those reaches a '
    + 'blue hexagon named Cart. All three are the same application, so all '
    + 'three carry the same name and the same colour, with Instance 1, '
    + 'Instance 2 and Instance 3 written under them in turn.',

  build() {
    return [
      // ---- the caller reaches its own sidecar -----------------------------
      arrow({ from: CALLER, to: SIDE }),

      // ---- which fans out across the three instances ----------------------
      // The MIDDLE run is straight, because its row IS the caller's row: fed
      // through elbowArrow() it asks for a turn of no length, and
      // roundedPath() refuses that rather than emitting a corner radius around
      // nothing. The other two turn once.
      [0, 1, 2].map((i) => {
        const from = [SIDE.x + hexHalfWidth(SIDE_R) + 2, MID_Y];
        const to = [CALLEE_SIDE_X - hexHalfWidth(SIDE_R) - 2, rowY(i)];
        return rowY(i) === MID_Y
          ? arrow({ from, to })
          : elbowArrow({ points: [from, [FAN_X, MID_Y], [FAN_X, rowY(i)], to] });
      }),
      label({
        x: FAN_X, y: FAN_CAPTION_Y, text: 'Round robin load balancing', size: TEXT,
      }),

      // ---- each instance's sidecar hands the call on ----------------------
      [0, 1, 2].map((i) => arrow({
        from: { x: CALLEE_SIDE_X, y: rowY(i), r: SIDE_R, hex: true },
        to: { x: CALLEE_X, y: rowY(i), r: APP_R, hex: true },
      })),

      // ---- the shapes, over the lines that reach them ---------------------
      hex({ x: CALLER.x, y: MID_Y, r: APP_R, label: 'FrontEnd', size: NAME, ...APP[0] }),
      group({
        class: 'd-named-mark',
        children: [
          markHex({ x: SIDE.x, y: SIDE.y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
          label({ x: SIDE.x, y: NAME_Y(MID_Y), text: 'Dapr sidecar', size: TEXT }),
        ],
      }),
      [0, 1, 2].map((i) => [
        markHex({
          x: CALLEE_SIDE_X, y: rowY(i), r: SIDE_R, mark: 'logo-blue', stroke: C.blue,
        }),
        // ONE name and ONE colour for all three: they are one application.
        hex({ x: CALLEE_X, y: rowY(i), r: APP_R, label: 'Cart', size: NAME, ...APP[1] }),
        label({
          x: CALLEE_X, y: rowY(i) + INST_DY, text: `Instance ${i + 1}`, size: TEXT,
        }),
      ]),
    ];
  },
};
