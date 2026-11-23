// The Scheduler control plane service, reached through the Jobs API.
//
// Replaces scheduler/scheduler-architecture.png on
// concepts/dapr-services/scheduler.md, under "The diagram below shows how the
// Scheduler service is used via the jobs API when called from your
// application. All the jobs that are tracked by the Scheduler service are
// stored in the Etcd database."
//
// Fact-check, against that page:
//   - the application calls its own sidecar, and the sidecar calls the
//     Scheduler. The page says the Scheduler "is used via the jobs API when
//     called from your application", so the outer call is the Jobs API and
//     the source's generic "Dapr service gRPC/HTTP calls" is named for what
//     this picture is about.
//   - schedule / get / delete and WatchJobs are the source's names for the two
//     directions between sidecar and Scheduler, and WatchJobs is what makes
//     the return path a STREAM the sidecar holds open rather than a reply.
//   - etcd is inside the dashed process with the Scheduler because the page
//     says "By default, Etcd is embedded in the Scheduler service, which means
//     that the Scheduler service runs its own instance of Etcd". That is the
//     whole reason the source drew a box around the two, and the caption says
//     it in words rather than leaving the reader to infer it from a border.
//
// Where this departs from the source image, and why:
//   - the Scheduler hexagon is serviceHex(), the same component every other
//     diagram draws a control plane service with, so Scheduler here and
//     Scheduler on the hosting diagrams are one object at two sizes. The
//     source wrapped its name onto two lines as "Schedule / r".
//   - the app and its sidecar are drawn APART rather than as appSidecar().
//     The pair exists to show one process beside another; here the two arrows
//     BETWEEN them are the subject, and docking the sidecar onto the app
//     leaves nowhere to draw them.
//   - OnJobEvent and WatchJobs are set in the page's own mono font. They are
//     names of calls, which is what mono is for in this set; the source set
//     them in a red that is not in the palette.

import { APP, C } from '../engine.mjs';
import { arrow, group, hex, hexHalfWidth, label, region } from '../shapes.mjs';
import { icon, markHex, plate } from '../icons.mjs';
import { NAME_DY, serviceHex } from '../services.mjs';

// The canvas is trimmed to the drawing: the process pill's top edge is the
// highest ink and the dashed border its lowest, with the same small band of
// air above and below.
const W = 960;
const H = 302;

const TEXT = 13;

// ---- the row of three ------------------------------------------------------
const MID_Y = 132;
const APP_X = 96;
const APP_R = 60;
const DAPR_X = 392;
const DAPR_R = 60;

// The two directions run at their own heights, so each carries its own name
// with clear air around it. The split is kept small: the pair should read as
// two lines leaving the middle of a hexagon, not as two separate routes that
// happen to pass it. 16 is well inside the flat vertical face of the SMALLEST
// hexagon the arrows touch - the Scheduler's, whose face spans half its
// radius, 19 - so every line leaves a square edge rather than a sloped corner.
const SPLIT = 16;
const UP_Y = MID_Y - SPLIT;
const DOWN_Y = MID_Y + SPLIT;

// Under each lower arrow: the call's name, then what it carries. Both
// descriptions are set on two lines so each sits BETWEEN the two shapes the
// arrow joins - a line of type that runs past a hexagon stops reading as that
// arrow's label - and both are centred at the same depth, so their first lines
// share a baseline.
const NAME_DOWN = DOWN_Y + 16;
const DESC_DOWN = DOWN_Y + 44;

// ---- the Scheduler process -------------------------------------------------
// The dashed border starts well clear of the sidecar, because the two names on
// the link between them sit on the run OUTSIDE the box: a label that crosses a
// dashed line reads as being part of what the line encloses.
const PROC_X = 648;
const PROC_W = 300;
const PROC_Y = 28;
const PROC_H = 262;

// The Scheduler is drawn at the SIDECAR's radius. They are the same component
// - a Dapr hexagon with a name under it - and one of them drawn smaller reads
// as the lesser of the two, which is not what this picture says: the sidecar
// calls the Scheduler, and neither contains the other. Their names follow:
// serviceHex() derives a name from the radius, so the sidecar's takes
// serviceLabel() at the same radius rather than the scene's body size.
const SCHED_R = DAPR_R;
// One size for all three names under the hexagons, chosen rather than derived.
// serviceHex() normally takes its name from the radius, but the radius here is
// the SIDECAR's - three times the reference - and a name derived from it would
// be set at 23 beside a diagram whose body type is 13. A tier above the arrow
// labels is enough to say these are the three objects; twice their size says
// the names are the subject.
const HEX_NAME = 17;
// Both names sit on serviceHex()'s own line, so the three under the hexagons
// share one baseline.
const HEX_NAME_Y = MID_Y + SCHED_R * NAME_DY;

// The hexagon and the mark are centred as a pair inside the box, so the air
// inside it is even rather than pooling to the right of the mark.
const PAIR_GAP = 40;
const ETCD_PLATE = 72;
const ETCD_MARK = 52;
const PAIR_W = hexHalfWidth(SCHED_R) * 2 + PAIR_GAP + ETCD_PLATE;
const PAIR_X = PROC_X + (PROC_W - PAIR_W) / 2;
const SCHED_X = PAIR_X + hexHalfWidth(SCHED_R);
const ETCD_X = PAIR_X + PAIR_W - ETCD_PLATE / 2;

export default {
  width: W,
  height: H,
  title: 'How the Scheduler service is used through the Jobs API',
  desc:
    'An application hexagon on the left, the Dapr sidecar in the middle and a dashed process on the right holding the Scheduler service and etcd. The application calls its sidecar over the Jobs API, using gRPC or HTTP, and the sidecar sends the triggered job back to the application as an OnJobEvent. The sidecar schedules, gets and deletes jobs on the Scheduler, and holds a WatchJobs stream open on which the Scheduler returns jobs as they come due. The Scheduler stores every job it tracks in etcd, which by default is embedded in the Scheduler service itself.',

  build() {
    const schedEdge = { x: SCHED_X, y: 0, r: SCHED_R, hex: true };
    return [
      // ---- the application and its sidecar ------------------------------
      // The app's name takes HEX_NAME as well, for the same reason the other
      // three do: these four are the objects in the picture, and a name that
      // is derived here - hex() would give 20 - puts the one INSIDE a hexagon
      // above the three beside them.
      hex({ x: APP_X, y: MID_Y, r: APP_R, label: 'My app', size: HEX_NAME, ...APP[0] }),
      markHex({ x: DAPR_X, y: MID_Y, r: DAPR_R, mark: 'logo-blue' }),
      label({ x: DAPR_X, y: HEX_NAME_Y, text: 'Dapr sidecar', size: HEX_NAME }),

      // ---- what the application asks for, and what comes back -----------
      arrow({
        from: { x: APP_X, y: UP_Y, r: APP_R, hex: true },
        to: { x: DAPR_X, y: UP_Y, r: DAPR_R, hex: true },
      }),
      label({ x: (APP_X + DAPR_X) / 2, y: UP_Y - 14, text: 'Jobs API, gRPC or HTTP', size: TEXT }),

      arrow({
        from: { x: DAPR_X, y: DOWN_Y, r: DAPR_R, hex: true },
        to: { x: APP_X, y: DOWN_Y, r: APP_R, hex: true },
      }),
      label({ x: (APP_X + DAPR_X) / 2, y: NAME_DOWN, text: 'OnJobEvent', size: TEXT, mono: true }),
      label({
        x: (APP_X + DAPR_X) / 2, y: DESC_DOWN,
        text: 'the triggered job,\nback to the app',
        size: TEXT, color: C.blue,
      }),

      // ---- what the sidecar asks of the Scheduler -----------------------
      arrow({
        from: { x: DAPR_X, y: UP_Y, r: DAPR_R, hex: true },
        to: { ...schedEdge, y: UP_Y },
      }),
      label({ x: (DAPR_X + SCHED_X) / 2, y: UP_Y - 14, text: 'schedule / get / delete', size: TEXT }),

      arrow({
        from: { ...schedEdge, y: DOWN_Y },
        to: { x: DAPR_X, y: DOWN_Y, r: DAPR_R, hex: true },
      }),
      label({ x: (DAPR_X + SCHED_X) / 2, y: NAME_DOWN, text: 'WatchJobs', size: TEXT, mono: true }),
      label({
        x: (DAPR_X + SCHED_X) / 2, y: DESC_DOWN,
        text: 'jobs as they\ncome due',
        size: TEXT, color: C.blue,
      }),

      // ---- the process that holds the Scheduler and its store -----------
      region({
        x: PROC_X, y: PROC_Y, w: PROC_W, h: PROC_H, stroke: C.navy,
        caption: 'Scheduler process', captionW: 150, captionX: PROC_X + 96, captionH: 26, captionSize: TEXT,
      }),
      serviceHex({ key: 'scheduler', x: SCHED_X, y: MID_Y, r: SCHED_R, size: HEX_NAME }),

      // etcd is a full-colour vendored mark, so it takes a plate: on the dark
      // ground its own blue would sit on near-black.
      plate({ x: ETCD_X, y: MID_Y, w: ETCD_PLATE, h: ETCD_PLATE }),
      icon({ name: 'etcd', x: ETCD_X, y: MID_Y, size: ETCD_MARK, fit: 'ink' }),
      // On the Scheduler's own name line, and in the size serviceHex() would
      // have given it: etcd is not a Dapr service, but it is a peer of one in
      // this picture, and two names at two heights would say otherwise.
      label({ x: ETCD_X, y: HEX_NAME_Y, text: 'etcd', size: HEX_NAME }),

      label({
        x: PROC_X + PROC_W / 2, y: PROC_Y + PROC_H - 36,
        text: 'Every tracked job is stored in etcd,\nembedded in the Scheduler by default',
        size: TEXT, color: C.blue,
      }),
    ];
  },
};
