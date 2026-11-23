// The distributed lock API: two instances of one application ask the same
// lock component for the same named lock. One gets it and may update the
// shared resource; the other does not and may not.
//
// Replaces lock-overview.png on
// developing-applications/building-blocks/distributed-lock/
// distributed-lock-api-overview.md, under "In the diagram below, two
// instances of the same application, App1, use the Redis lock component to
// take a lock on a shared resource."
//
// Fact-check, against the page's own prose:
//   - "The first app instance acquires the named lock and gets exclusive
//     access. The second app instance is unable to acquire the lock and
//     therefore is not allowed to access the resource." That is the drawing.
//   - release - "explicitly through the unlock API, or after a period of time,
//     due to a lease timeout" - is NOT drawn, as it is not in the source
//     either. It is two lines of prose directly under the image, and the
//     unlock half of the story is drawn on howto-use-distributed-lock.
//
// TWO THINGS HERE ARE MAINTAINER DECISIONS OF 2026-11-02 that a later reader
// should not quietly "correct" back:
//
//   1. BOTH HEXAGONS CARRY THE SAME NAME, "App 1", AND THE SAME COLOUR, and
//      each is captioned with which INSTANCE it is. The page's prose says
//      "two instances of the SAME application, `App1`" - one app id, two
//      instances, which is what makes the lock contended at all; the Features
//      section adds that locks are scoped to a Dapr app-id, so two differently
//      named apps would each get their own lock and never compete.
//
//      This is the one scene in the set where two app hexagons share a colour,
//      and `diagrams/app-colour.test.mjs` is the check that keeps it honest:
//      two app hexagons may share a fill only when they carry the same name.
//      Rename one of these and that test fails, which is the point.
//
//   2. THE RUNS TO THE SHARED RESOURCE LEAVE THE SIDECARS. An earlier draft
//      ran them from the APPS, on the reading that Dapr hands out a lock while
//      the application opens its own connection, and routed them the long way
//      round the outside of the frame to get past the sidecars. Overruled: the
//      app and its sidecar are drawn here as ONE combined shape, as the source
//      draws them, so a run leaving that shape leaves the pair rather than
//      saying anything about which half of it opened the socket.
//
// WHAT THE LOCK COMPONENT IS. A component YAML - the file both sidecars are
// configured with, naming the store they both go to - and so a FILE, not a
// store. It had been drawn as a Redis cylinder, which put two stores in the
// frame and invited the reader to think the lock lives in one and the data in
// the other. The store in this picture is the shared resource, and it carries
// no brand mark: the API is agnostic about what is being locked, and the
// page's own examples run from a database row to a queue.
//
// HOW DENIAL IS DRAWN. RED, dashed, with `fluent-dismiss-circle` beside the
// run - the house default, set by the maintainer on 2026-11-03 and applied
// across every scene that blocks a path: this one, `api-scoping`,
// `lock-example` and the two pub/sub pages.
//
// It used to be orange, on the reasoning that red-and-green carries nothing
// for a reader who cannot tell the two apart. That reasoning still holds -
// which is why nothing in this set pairs red WITH green. What marks a path as
// allowed here is that it is solid and navy, not that it is green, so red
// adds a second signal to a distinction the dashing already makes rather than
// being the only one carrying it.
//
// THE PADLOCK is `fluent-lock-closed`, and deliberately not
// `fluent-lock-closed-key`, which apis.mjs already spends on the cryptography
// building block: a reader who has met that mark would read this picture as
// being about cryptography.

import { C } from '../engine.mjs';
import {
  cylinder, elbowArrow, group, hexHalfWidth, label, STORE_RATIO,
} from '../shapes.mjs';
import { appSidecar, pairExtent, sidecarAt } from '../app.mjs';
import { icon } from '../icons.mjs';

const EDGE = 29;
const V_EDGE = 14;

const TEXT = 13;
const NAME = 17;

const APP_R = 60;
// hex() sizes a name at a third of the radius, and appSidecar() follows it.
const APP_NAME = APP_R / 3;

const STORE_W = 120;
const STORE_H = STORE_W / STORE_RATIO;

// The glyph that says what became of each run, and the air between it and the
// words it belongs to.
const GLYPH = 36;
const GLYPH_GAP = 16;
const FILE = 48;

// ---- the two instances ------------------------------------------------------
const APP_X = EDGE + hexHalfWidth(APP_R);
const ROW_T = V_EDGE + APP_R;
// Far enough apart that the component file, its name and the two runs that
// reach it all fit between the sidecars - the sidecars, not the apps, because
// the sidecar hangs below its app and is the thing the file is joined to.
const ROW_GAP = 260;
const ROW_B = ROW_T + ROW_GAP;

const pair = (y) => ({ x: APP_X, y, r: APP_R, size: APP_NAME });
const SIDE_T = sidecarAt(pair(ROW_T));
const SIDE_B = sidecarAt(pair(ROW_B));
const SIDE_R = SIDE_T.r;
const SIDE_RIGHT = SIDE_T.x + hexHalfWidth(SIDE_R);

// Which instance each pair is, captioned UNDER the pair rather than set inside
// the hexagon: the hexagon's name is the APP, and both of them are the same
// app. pairExtent() is how far the pair reaches below the app's own centre -
// the sidecar hangs below the hexagon, so the app's radius is the wrong
// number and was the first one tried.
const PAIR_BOTTOM = pairExtent({ r: APP_R, size: APP_NAME }).bottom;
const INST_SIZE = TEXT;
// Measured on the rendered page at 13/600 - the exporter has no font metrics.
const INST_W = 63;
// Clear of the run that leaves the sidecar's FOOT - which both pairs have, the
// upper one to the component file and the lower one to the store. Centred
// under the app, it sat seven units off that line.
const INST_X = SIDE_T.x - 12 - INST_W / 2;
const instanceY = (y) => y + PAIR_BOTTOM + 18;

// ---- the component file, halfway between the two sidecars -------------------
// In its OWN COLUMN, clear to the right of the pair, not on the sidecars' own
// x. A sidecar sits over its app's lower right corner, so its top and left
// faces look into the app and only its right and foot are free - and the
// space directly between the two sidecars is where the LOWER app's hexagon
// rises. Put here, the file glyph was drawn over that hexagon and the run up
// from the lower sidecar disappeared behind it entirely.
const FILE_X = SIDE_RIGHT + 60;
const FILE_Y = (SIDE_T.y + SIDE_B.y) / 2;
// The name sits BESIDE the file, not under it. Under it, the run rising from
// the lower sidecar is drawn straight through the words - nothing numeric sees
// that, and it is how the first version of this scene shipped its two store
// names. serviceHex()'s `side: 'right'` is the same move.
const FILE_NAME_X = FILE_X + FILE / 2 + 14;
// Measured on the rendered page at 17/600 - the exporter has no font metrics.
const FILE_NAME_W = 138;

// ---- the shared resource ----------------------------------------------------
// Measured on the rendered page at 13/600. The wider caption sets the band;
// both are centred in it, so the two read as one column of commentary.
const CAPTION_W = 203;
const GLYPH_X = FILE_NAME_X + FILE_NAME_W + 30 + GLYPH / 2;
const CAPTION_X = GLYPH_X + GLYPH / 2 + GLYPH_GAP + CAPTION_W / 2;

// The store's name stands to its LEFT, so its foot is free for the lower run
// to come in at. The widest line is "resource".
const RES_NAME_W = 73;
const RES_X = Math.round(CAPTION_X + CAPTION_W / 2 + 30 + RES_NAME_W + 14 + STORE_W / 2);
const RES_Y = FILE_Y;

const W = Math.ceil(RES_X + STORE_W / 2 + EDGE);

// ---- the two runs out, and what is said about them --------------------------
// The lower run goes UNDER the drawing on its own rail, because it comes up
// into the foot of the store and because leaving the lower sidecar's right
// would put it on top of that sidecar's run to the component file. See the
// note on build() for why the two rows are not mirror images.
const BOT_RAIL = SIDE_B.y + SIDE_R + 42;

// Each caption sits just clear of the run it explains rather than in the
// middle of the frame: the glyph is the verdict on that run, and a verdict
// floating equidistant from two runs belongs to neither.
const CAP_DY = 40;
const CAP_T_Y = SIDE_T.y - CAP_DY;
const CAP_B_Y = BOT_RAIL - CAP_DY + 6;

const H = Math.ceil(BOT_RAIL + V_EDGE);

// THE TWO ROWS ARE NOT MIRROR IMAGES, and the reason is worth writing down
// because the obvious symmetric version does not draw.
//
// A sidecar sits over its app's lower right corner, so only its RIGHT face and
// its FOOT are free; the other two look into the app. Each sidecar here has
// two things to join - the component file in the middle and the store on the
// right - so each uses both free faces, and which goes where is forced:
//
//   upper  file from the FOOT (straight down to it), store from the RIGHT
//   lower  store from the FOOT (down, along, and up into it), file from
//          the RIGHT
//
// Every other pairing either runs the two out of the same point - where they
// share a stretch of line, and on the lower row a dashed red run and a
// solid navy one become one line that changes colour halfway - or crosses the
// store run with the file run. This one does neither.
const accessTop = () => elbowArrow({
  points: [
    [SIDE_RIGHT + 2, SIDE_T.y],
    [RES_X, SIDE_T.y],
    [RES_X, RES_Y - STORE_H / 2 - 2],
  ],
});

const accessBottom = () => elbowArrow({
  color: C.red,
  dash: true,
  points: [
    [SIDE_B.x, SIDE_B.y + SIDE_R + 2],
    [SIDE_B.x, BOT_RAIL],
    [RES_X, BOT_RAIL],
    [RES_X, RES_Y + STORE_H / 2 + 2],
  ],
});

export default {
  width: W,
  height: H,
  title: 'Two instances of one app competing for a named lock on a shared resource',
  desc:
    'Two green hexagons, one above the other, both named App 1 - they are two instances of one application - each with a hexagon carrying the Dapr logo overlapping its lower right corner, and each captioned underneath, Instance 1 and Instance 2. Between the two Dapr hexagons is a file glyph named Lock component YAML, joined to each of them by a line with a head at each end. From the upper Dapr hexagon a line runs right and turns down into the top of a gold data-store cylinder named Shared resource; a padlock and the words "Acquire named lock on resource for mutually exclusive access" stand just above that line. From the lower Dapr hexagon a dashed red line runs right and turns up into the foot of the same store; a cross in a circle and the words "Named lock denies access to update resource" stand just below it.',

  build() {
    return [
      // ---- both sidecars are configured by the SAME component file ------
      // One file, two runs: that both instances are pointed at the same lock
      // is the entire mechanism, and two files side by side would say the
      // opposite.
      //
      // Each of these leaves its sidecar at the same point as that sidecar's
      // run to the store and FORKS at the file's column. That is not a
      // drafting accident: a sidecar reads the component file and goes to the
      // store the file names, so the two are one journey for its first sixty
      // units. It is also the only way out - see FILE_X on why a sidecar
      // drawn over its app has just two free faces.
      // A head at the FILE and none at the sidecar: this is configuration
      // being read, not a call being answered, and a head at each end would
      // say the file talks back.
      elbowArrow({
        points: [
          [SIDE_T.x, SIDE_T.y + SIDE_R + 2],
          [SIDE_T.x, FILE_Y],
          [FILE_X - FILE / 2 - 2, FILE_Y],
        ],
      }),
      elbowArrow({
        points: [
          [SIDE_RIGHT + 2, SIDE_B.y],
          [FILE_X, SIDE_B.y],
          [FILE_X, FILE_Y + FILE / 2 + 2],
        ],
      }),

      group({
        class: 'd-named-mark',
        children: [
          icon({
            name: 'fluent-document', x: FILE_X, y: FILE_Y, size: FILE,
            color: C.navy, fit: 'ink',
          }),
          label({
            x: FILE_NAME_X, y: FILE_Y, anchor: 'start',
            text: 'Lock component\nYAML', size: NAME,
          }),
        ],
      }),

      // ---- the first instance holds the lock, and goes in ---------------
      accessTop(),
      icon({
        name: 'fluent-lock-closed', x: GLYPH_X, y: CAP_T_Y, size: GLYPH,
        color: C.navy, fit: 'ink',
      }),
      label({
        x: CAPTION_X, y: CAP_T_Y, size: TEXT,
        text: 'Acquire named lock on resource\nfor mutually exclusive access',
      }),

      // ---- the second does not, and is turned away ----------------------
      accessBottom(),
      icon({
        name: 'fluent-dismiss-circle', x: GLYPH_X, y: CAP_B_Y, size: GLYPH,
        color: C.red, fit: 'ink',
      }),
      label({
        x: CAPTION_X, y: CAP_B_Y, size: TEXT,
        text: 'Named lock denies access\nto update resource',
      }),

      // ---- the shapes, over the lines that reach them -------------------
      // Both take appSidecar()'s default colours - APP[0] - because they are
      // one application, twice.
      [[ROW_T, 'Instance 1'], [ROW_B, 'Instance 2']].map(([y, instance]) => [
        appSidecar({ ...pair(y), label: 'App 1' }),
        label({ x: INST_X, y: instanceY(y), text: instance, size: INST_SIZE }),
      ]),

      group({
        class: 'd-named-mark',
        children: [
          // No brand mark: the page does not say what the shared resource is,
          // only that it is shared and that updates happen to it. Its own
          // examples run from a database row to a queue.
          cylinder({ x: RES_X, y: RES_Y, w: STORE_W }),
          label({
            x: RES_X - STORE_W / 2 - 14, y: RES_Y, anchor: 'end',
            text: 'Shared\nresource', size: NAME,
          }),
        ],
      }),
    ];
  },
};
