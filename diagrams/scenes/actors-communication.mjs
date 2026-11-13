// WHAT TURN-BASED ACCESS MEANS FOR A FAN-IN: one actor serving many clients
// is a bottleneck, and the two shapes that are not.
//
// Replaces /images/actors_background_communication.png on
// developing-applications/building-blocks/actors/actors-features-concepts.md,
// under "A single actor instance cannot process more than one request at a
// time. An actor instance can cause a throughput bottleneck if it is expected
// to handle concurrent requests."
//
// Fact-check, against that paragraph and the one above it:
//   - "no more than one thread can be active inside an actor object's code at
//     any time" - which is why the first panel is marked wrong: the requests
//     do not fail, they QUEUE, and the picture is about throughput.
//   - the two panels the source ticks are the two ways out: one actor per
//     client, and one client fanning out over many actors. Neither is stated
//     in the prose; both follow from it, and the source draws them.
//
// Where this departs from the source as a DRAWING, and why:
//   - EACH PANEL IS CAPTIONED with what it shows. The source gives three
//     unlabelled boxes and a tick or a cross, so a reader has to work out
//     what each one is a picture of before they can tell why it is good or
//     bad. A region in this set carries its name on its border.
//   - the tick is NAVY, not green. `C.green` is a fill token that assertInk()
//     refuses as glyph ink - it is an app hexagon's colour, not something
//     that reads on the page in both themes - and `api-scoping` and
//     `lock-unlock-example` both draw a permitted call with the navy
//     `fluent-checkmark-circle`. The cross stays red, which is what this set
//     marks a path that does not work with.
//   - an actor is a DISC, as `actors-game-example` draws one on the overview
//     page, and a client is a chip.
//   - the "and so on" between the rows is three dots rather than the source's
//     typographic ellipsis: a glyph that is not in the page's face comes out
//     as a box, and three circles are three circles in any font.

import { APP, C, el } from '../engine.mjs';
import {
  arrow, box, captionReach, group, node, region,
} from '../shapes.mjs';
import { icon } from '../icons.mjs';

const EDGE = 29;
const V_EDGE = 14;

// 13, the size render-width.mjs is calibrated against.
const TEXT = 13;

const CHIP_W = 76;
const CHIP_H = 34;
const ACTOR_R = 26;

// Four rows and, between the third and the fourth, the three dots that say
// there are more: five slots, which is what the source shows.
// 64, not 58: at 58 two actor discs of ACTOR_R stood six units apart and
// the rendered rule `keeps its shapes clear of each other` wants eight.
const SLOT = 64;
const ROWS = 4;
const GAP_SLOT = 3;        // the slot the dots take, counting from zero
const SLOTS = ROWS + 1;

// Where a row sits inside the panel, skipping the slot the dots take.
const slotOf = (i) => (i < GAP_SLOT ? i : i + 1);

const PANEL_PAD = 24;
const PANEL_TOP_PAD = captionReach() + 20;

// The run between a client and an actor carries nothing, so it is as long as
// it needs to read as a run rather than as a join.
const RUN_GAP = 70;

const PANEL_W = PANEL_PAD + CHIP_W + RUN_GAP + ACTOR_R * 2 + PANEL_PAD;
const MARK = 32;
const MARK_GAP = 22;
const BODY_H = SLOT * SLOTS - (SLOT - Math.max(CHIP_H, ACTOR_R * 2));
const PANEL_H = PANEL_TOP_PAD + BODY_H + MARK_GAP + MARK + PANEL_PAD;

const PANEL_GAP = 30;
const PANEL_Y = Math.round(V_EDGE + captionReach());

const W = Math.ceil(EDGE * 2 + PANEL_W * 3 + PANEL_GAP * 2);
const H = Math.ceil(PANEL_Y + PANEL_H + V_EDGE);

const panelX = (i) => EDGE + i * (PANEL_W + PANEL_GAP);
const ROW_0_Y = Math.round(PANEL_Y + PANEL_TOP_PAD + Math.max(CHIP_H, ACTOR_R * 2) / 2);
const rowY = (i) => ROW_0_Y + slotOf(i) * SLOT;
// The middle of the rows, which is where a single shape facing all of them
// sits. Taken from the first and last row rather than from the panel, so it
// lines up with what it is talking to.
const MID_Y = (rowY(0) + rowY(ROWS - 1)) / 2;
const DOTS_Y = ROW_0_Y + GAP_SLOT * SLOT;

const MARK_Y = Math.round(PANEL_Y + PANEL_H - PANEL_PAD - MARK / 2);

const chipX = (i) => panelX(i) + PANEL_PAD + CHIP_W / 2;
const actorX = (i) => panelX(i) + PANEL_W - PANEL_PAD - ACTOR_R;

const client = (x, y) => box({
  x, y, w: CHIP_W, h: CHIP_H, label: 'Client', size: TEXT,
});
const actor = (x, y) => node({
  x, y, r: ACTOR_R, fill: APP[2].fill, stroke: APP[2].stroke,
  label: 'Actor', labelInside: true, ink: APP[2].ink, size: TEXT,
});

// THREE DOTS, drawn rather than set: "and so on" is a shape here, and a
// typographic ellipsis in a face that lacks it arrives as a box.
const dots = (x, y) => group([0, 1, 2].map((i) => el('circle', {
  cx: x, cy: y - 10 + i * 10, r: 2.4, fill: C.caption,
})));

export default {
  width: W,
  height: H,
  title: 'One actor serving many clients is a bottleneck; one actor per client, or one client over many actors, is not',
  desc:
    'Three dashed panels side by side. The first, captioned Many clients, one '
    + 'actor, shows four client chips all pointing at a single gold disc named '
    + 'Actor, and is marked with a red cross. The second, captioned Many '
    + 'clients, many actors, pairs each client with its own actor and is '
    + 'marked with a navy tick. The third, captioned One client, many actors, '
    + 'has a single client pointing at four actors and is also marked with a '
    + 'navy tick. Three dots in each panel say the rows go on.',

  build() {
    const rows = Array.from({ length: ROWS }, (_, i) => i);
    return [
      // ---- the three panels, drawn first ----------------------------------
      region({
        x: panelX(0), y: PANEL_Y, w: PANEL_W, h: PANEL_H,
        caption: 'Many clients, one actor', captionW: 174, captionSize: TEXT,
      }),
      region({
        x: panelX(1), y: PANEL_Y, w: PANEL_W, h: PANEL_H,
        caption: 'Many clients, many actors', captionW: 190, captionSize: TEXT,
      }),
      region({
        x: panelX(2), y: PANEL_Y, w: PANEL_W, h: PANEL_H,
        caption: 'One client, many actors', captionW: 176, captionSize: TEXT,
      }),

      // ---- one: every client onto the same actor --------------------------
      rows.map((i) => arrow({
        from: { x: chipX(0), y: rowY(i), w: CHIP_W, h: CHIP_H },
        to: { x: actorX(0), y: MID_Y, r: ACTOR_R },
      })),
      rows.map((i) => client(chipX(0), rowY(i))),
      dots(chipX(0), DOTS_Y),
      actor(actorX(0), MID_Y),
      icon({
        name: 'fluent-dismiss-circle', x: panelX(0) + PANEL_W / 2, y: MARK_Y,
        size: MARK, color: C.red, fit: 'ink',
      }),

      // ---- two: a client each ---------------------------------------------
      rows.map((i) => arrow({
        from: { x: chipX(1), y: rowY(i), w: CHIP_W, h: CHIP_H },
        to: { x: actorX(1), y: rowY(i), r: ACTOR_R },
      })),
      rows.map((i) => client(chipX(1), rowY(i))),
      rows.map((i) => actor(actorX(1), rowY(i))),
      dots(chipX(1), DOTS_Y),
      dots(actorX(1), DOTS_Y),
      icon({
        name: 'fluent-checkmark-circle', x: panelX(1) + PANEL_W / 2, y: MARK_Y,
        size: MARK, color: C.navy, fit: 'ink',
      }),

      // ---- three: one client over many actors -----------------------------
      rows.map((i) => arrow({
        from: { x: chipX(2), y: MID_Y, w: CHIP_W, h: CHIP_H },
        to: { x: actorX(2), y: rowY(i), r: ACTOR_R },
      })),
      client(chipX(2), MID_Y),
      rows.map((i) => actor(actorX(2), rowY(i))),
      dots(actorX(2), DOTS_Y),
      icon({
        name: 'fluent-checkmark-circle', x: panelX(2) + PANEL_W / 2, y: MARK_Y,
        size: MARK, color: C.navy, fit: 'ink',
      }),
    ];
  },
};
