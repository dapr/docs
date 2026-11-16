// THE THREE NAMESPACE CONSUMER GROUP PICTURES, which howto-namespace.md shows
// one after another as a problem and its fix.
//
//   basic     one namespace, two apps, two consumer groups
//   without   a second namespace with the SAME app ids, and App1 in it gets
//             nothing: both App1s share one consumer group
//   with      `consumerID: "{namespace}"`, so the groups are namespaced and
//             both namespaces work
//
// The whole argument is the list of consumer group names, which goes from
// two, to the same two with a second namespace competing for them, to four.
// A reader checks it by looking down the three cards, so the cards have to be
// the same card in the same place at the same size - which is what this file
// is for. Same split as pubsub-raw.mjs and secrets-example.mjs: every number
// is shared, each scene arranges its own.
//
// WHY THE RISERS GO TO A BUS. The sources run a diagonal from each app to the
// broker, and with four apps those diagonals cross each other and the
// namespace borders at angles. This set draws no diagonals except a callout's
// leader, so each app rises straight to a horizontal bus under the broker -
// the idiom `components-concept` already uses to feed fifteen blocks off one
// line. Each riser keeps its own arrowhead, so publish and subscribe are
// still told apart per app rather than by the bus.

import { C } from './engine.mjs';
import { CAPTION_H, CAPTION_INSET, hexHalfWidth } from './shapes.mjs';

export const EDGE = 29;
export const V_EDGE = 14;

// 13, the size render-width.mjs is calibrated against.
export const TEXT = 13;

// Four apps across in two of the three states, so the hexagons are smaller
// than the single-row pictures elsewhere in this section; the name is sized
// with them rather than left at the body type.
export const APP_R = 46;
export const APP_NAME = 15;

// What a boundary leaves around what it holds.
export const PAD = 24;

// THE TOP PAD IS ITS OWN NUMBER, and it is bigger, because what it has to
// clear is not the namespace box but the namespace's NAME. A caption pill is
// centred ON its border and reaches CAPTION_H / 2 each side, so the cluster's
// pill and a namespace's pill stand exactly this far apart. At PAD they would
// be two units apart and read as one smudge - the bug
// diagrams/caption-clear.test.mjs was written for, on the Kubernetes secrets
// pictures.
export const NEST_CLEAR = 14;
export const PAD_TOP = CAPTION_H + NEST_CLEAR;

// ---- the broker, and the list that is the whole argument --------------------
export const PIPE_RY = 28;
export const PIPE_RX = 11;
export const PIPE_LEN = 130;

// The topic goes INSIDE the broker and the broker is named under it, which is
// how this set draws a named mark. The sources write "Message broker" inside
// a hexagon and put the topic only in the arrow captions, so the one fact
// every arrow repeats is the one the shape does not carry.
export const TOPIC = 'order';
export const BROKER_NAME = 'Message broker';

export const CARD_TITLE = 'Consumer group names';
// Measured on the rendered page at 12 in the code face; the widest line any
// of the three states sets is "B.App1". The TITLE is wider than any of them,
// so it is what the card is sized to.
export const CARD_W = 184;
export const CARD_PAD = 14;
export const CODE = 12;
export const cardHeight = (lines) => lines * CODE * 1.2 + CARD_PAD * 2;

// ---- the apps ---------------------------------------------------------------
// Each riser carries one word. "Subscribe" is the longer, and two apps stand
// this far apart so their two words do not meet.
// Two apps stand this far apart so the WORD beside the left one's riser
// clears the right one's hexagon. At 92 "subscribe" ran into it.
export const APP_GAP = 150;
export const appPitch = () => hexHalfWidth(APP_R) * 2 + APP_GAP;

// How far a riser's word sits off the riser, and where the riser leaves.
export const WORD_DX = 10;

export const PUBLISH = 'publish';
export const SUBSCRIBE = 'subscribe';

// A blocked path is RED and DASHED, with `fluent-dismiss-circle` beside it -
// the house default across the set. The run carries both: `dash` says the
// thing does not happen and the colour says so again, so neither is doing the
// work alone.
export const DENIED = C.red;

// ---------------------------------------------------------------------------
// THE PICTURE ITSELF, once.
//
// It is a factory rather than three scenes sharing constants - the way
// lock-example.mjs is - because here the whole arrangement repeats and only
// the contents change: how many namespaces, whether one app is cut off, and
// what the consumer group card lists. Three copies of this would be three
// chances for the cards to stop lining up, and the cards are the argument.
// ---------------------------------------------------------------------------

import {
  arrow, codeCard, elbowArrow, group, label, pipe, region,
} from './shapes.mjs';
import { appSidecar, pairExtent, sidecarAt, sidecarDx, SIDECAR_R } from './app.mjs';
import { icon } from './icons.mjs';
import { APP } from './engine.mjs';

// The stub a riser takes out of the sidecar before turning up: enough to clear
// the app hexagon the sidecar is docked against, since a line cannot be drawn
// out of a shape another shape overlaps.
const STUB = 22;
const NS_TOP_PAD = PAD + CAPTION_H / 2;
const BLOCK_MARK = 26;
// codeCard() draws its NAME above the card, so the card is placed from where
// that name's top ends up rather than from the broker beside it: aligned on
// the broker, the title ran two units off the top edge.
const CARD_TITLE_ROOM = 28;

/**
 * One state of the picture.
 *
 * `namespaces` is [{ name, apps: [{ name, role, blocked }] }], `groups` the
 * lines the consumer group card lists. The apps are named by the caller
 * because two namespaces hold apps of the SAME app id - that is the page's
 * whole point - and diagrams/app-colour.test.mjs allows two hexagons to share
 * a colour exactly when they share a name.
 */
export function namespaceScene({ title, desc, namespaces, groups }) {
  const perApp = hexHalfWidth(APP_R) * 2;
  const captionRoom = 78;
  const nsWidth = (apps) => PAD + apps.length * perApp
    + (apps.length - 1) * APP_GAP + captionRoom + PAD;

  // ---- verticals, which do not depend on how many namespaces there are ----
  const BROKER_Y = V_EDGE + PIPE_RY;
  const BROKER_NAME_Y = BROKER_Y + PIPE_RY + 18;
  // TWO BENDS PER RUN, and both of them where a reader expects a corner: one
  // just off the sidecar, where the run turns to climb, and one at the
  // broker's own height, where it turns in to the rim. Maintainer's call,
  // 2026-11-03. The rails this replaces put two more corners in the middle of
  // every run, and with four runs that was eight bends stacked in open space
  // with nothing to anchor them to.
  //
  // Everything published arrives at the broker's LEFT rim and everything
  // subscribed leaves from its RIGHT one, so the shape - a cylinder open at
  // both ends - carries the direction of travel on its own.
  const MAX_GROUPS = 4;
  const TALLEST_CARD_BOTTOM = V_EDGE + CARD_TITLE_ROOM + cardHeight(MAX_GROUPS);
  const CLUSTER_Y = Math.max(BROKER_NAME_Y + 26, TALLEST_CARD_BOTTOM + 18) + 44;
  const NS_Y = CLUSTER_Y + PAD_TOP;
  const ROW_Y = NS_Y + NS_TOP_PAD + APP_R;
  const PAIR_BOTTOM = ROW_Y + pairExtent({ r: APP_R, size: APP_NAME }).bottom;
  const NS_H = PAIR_BOTTOM + PAD - NS_Y;
  const CLUSTER_H = NS_Y + NS_H + PAD - CLUSTER_Y;

  // ---- horizontals --------------------------------------------------------
  // THE CLUSTER IS SIZED TO WHAT IT HOLDS. It was sized for two namespaces in
  // all three states so that nothing moved between pictures a reader
  // compares, but the empty right half that left in the first one read as
  // wasted space rather than as a slot waiting to be filled - maintainer's
  // call, 2026-11-03. The cost is that the first picture is narrower than the
  // other two, so the broker and the card sit further left in it.
  const SLOT_W = nsWidth([null, null]);
  // THE CLUSTER'S LEFT PADDING CLEARS ITS OWN CAPTION PILL. A region's name
  // sits in a pill ON its top border, and every riser crosses that border on
  // its way out - so the first app's riser came up at 174.6 and the pill ran
  // from 49 to 199, which put the line straight through the middle of the
  // words "Kubernetes cluster". Nothing caught it: the pill is FILLED, so the
  // rendered check that paints ground behind a crossed label was satisfied by
  // the pill's own background while the line cut the shape in half.
  // diagrams/pill-cross.test.mjs is the check that does see it.
  const CLUSTER_CAPTION_W = 150;
  const PILL_CLEAR = 16;
  const RISER_OFF = PAD + hexHalfWidth(APP_R) + sidecarDx(APP_R)
    + hexHalfWidth(APP_R * SIDECAR_R) + STUB;
  const PAD_LEFT = Math.max(
    PAD,
    CAPTION_INSET + CLUSTER_CAPTION_W + PILL_CLEAR - RISER_OFF,
  );
  let x = EDGE + PAD_LEFT;
  const placed = namespaces.map((ns) => {
    const at = { ...ns, x, w: SLOT_W };
    x += SLOT_W + PAD;
    return at;
  });
  const CLUSTER_W = x - EDGE - PAD + PAD_LEFT;

  const appsOf = (ns) => ns.apps.map((app, i) => ({
    ...app,
    x: ns.x + PAD + hexHalfWidth(APP_R) + i * (perApp + APP_GAP),
  }));
  const all = placed.flatMap(appsOf);
  const riserX = (app) => sidecarAt({ x: app.x, y: ROW_Y, r: APP_R, size: APP_NAME }).x
    + hexHalfWidth(APP_R * 0.75) + STUB;

  // THE BROKER SITS RIGHT OF EVERY PUBLISHER. A publisher's horizontal leg
  // runs along the broker's own height into its LEFT rim, so a publisher
  // standing to the right of that rim would have to travel back through the
  // broker to reach it. Pushed past the last publisher, every publish run
  // approaches the rim from the side it goes in, with two bends.
  const RIM_CLEAR = 52;
  const lastPublisher = Math.max(
    ...all.filter((a) => a.role === PUBLISH).map(riserX),
    EDGE,
  );
  const BROKER_X = Math.round(Math.max(
    EDGE + CLUSTER_W / 2,
    lastPublisher + RIM_CLEAR + PIPE_RX + PIPE_LEN / 2,
  ));
  const PIPE_X1 = BROKER_X - PIPE_LEN / 2;
  const PIPE_X2 = BROKER_X + PIPE_LEN / 2;
  const RIM_R = PIPE_X2 + PIPE_RX;

  // THE SUBSCRIBERS CANNOT ALL BE SATISFIED THE SAME WAY. They sit on both
  // sides of the broker, and one that stands to its LEFT used to run straight
  // from the right rim back across the drawing - which passed behind the
  // shape and read as though it were attached to the broker's left side, the
  // publishers' end. Maintainer's call, 2026-11-03: it must attach on the
  // right like every other subscriber.
  //
  // So a subscriber already standing right of the rim goes straight up, two
  // bends. One standing left of it leaves the rim, drops to a rail UNDER the
  // broker, and comes back along that - four bends, and the only run in the
  // picture with more than two. It is the price of attaching on the correct
  // side with one broker and the apps alternating publisher, subscriber,
  // publisher, subscriber across the row.
  const SUB_TURN_X = RIM_R + 34;
  const SUB_RAIL_Y = BROKER_Y + PIPE_RY + 36;

  // HOW CLOSE TO THE RIM A SUBSCRIBER CAN STILL GO STRAIGHT DOWN. This is NOT
  // the clearance the broker is placed with: that one is the publishers' and
  // it is generous, while this one only has to leave a corner's worth of
  // horizontal between the rim and the riser. Sharing one number put the
  // namespace-b subscriber - 26 units past the rim - on the rail with the
  // namespace-a one, so the two came out of the broker together and bent left
  // in step before one of them turned back. It stands a corner clear instead.
  const DIRECT_MIN = 20;

  const CARD_H = cardHeight(groups.length);
  const CARD_X = PIPE_X2 + PIPE_RX + 48 + CARD_W / 2;
  const CARD_Y = V_EDGE + CARD_TITLE_ROOM + CARD_H / 2;

  const W = Math.ceil(Math.max(EDGE + CLUSTER_W, CARD_X + CARD_W / 2) + EDGE);
  const H = Math.ceil(CLUSTER_Y + CLUSTER_H + V_EDGE);

  return {
    width: W,
    height: H,
    title,
    desc,

    build() {
      return [
        // ---- every run reaches the broker at one of its two open ends ---
        // A publisher's goes IN at the left rim and a subscriber's comes OUT
        // of the right one, so the shape carries the direction and the words
        // beside each riser only confirm it.
        all.map((app) => {
          const rx = riserX(app);
          const side = sidecarAt({ x: app.x, y: ROW_Y, r: APP_R, size: APP_NAME });
          const edge = [side.x + hexHalfWidth(side.r) + 2, side.y];
          const publishes = app.role === PUBLISH;
          // TWO BENDS: one off the sidecar where the run turns to climb, one
          // at the broker's height where it turns in to the rim. The one
          // exception is a subscriber standing LEFT of the right rim, which
          // takes the rail under the broker so that it still arrives on the
          // right - see the note where SUB_RAIL_Y is set.
          const reachesRim = rx > RIM_R + DIRECT_MIN;
          const points = publishes
            ? [
              edge,
              [rx, side.y],
              [rx, BROKER_Y],
              [PIPE_X1 - PIPE_RX - 2, BROKER_Y],
            ]
            : reachesRim
              ? [
                [RIM_R + 2, BROKER_Y],
                [rx, BROKER_Y],
                [rx, side.y],
                edge,
              ]
              : [
                [RIM_R + 2, BROKER_Y],
                [SUB_TURN_X, BROKER_Y],
                [SUB_TURN_X, SUB_RAIL_Y],
                [rx, SUB_RAIL_Y],
                [rx, side.y],
                edge,
              ];
          // The word rides beside the riser, between the lowest rail that run
          // uses and the sidecar it belongs to.
          const top = publishes || reachesRim ? BROKER_Y : SUB_RAIL_Y;
          return [
            elbowArrow({
              points,
              // A run that fails is dashed and red, like the dead letter
              // page's: the message leaves the broker and never arrives.
              ...(app.blocked ? { color: DENIED, dash: true } : {}),
            }),
            label({
              x: rx + WORD_DX, y: (top + side.y) / 2,
              text: app.role, size: TEXT, anchor: 'start', halo: true,
            }),
          ];
        }),

        // ---- the cluster, its namespaces, and the apps inside them ------
        region({
          x: EDGE, y: CLUSTER_Y, w: CLUSTER_W, h: CLUSTER_H,
          stroke: C.navy, caption: 'Kubernetes cluster', captionW: 150, captionSize: TEXT,
        }),
        placed.map((ns) => region({
          x: ns.x, y: NS_Y, w: ns.w, h: NS_H,
          stroke: C.blue, r: 8, caption: ns.name, captionW: ns.captionW, captionSize: TEXT,
        })),
        all.map((app) => [
          appSidecar({
            x: app.x, y: ROW_Y, r: APP_R, label: app.name, size: APP_NAME,
            ...(app.name === 'App1' ? APP[0] : APP[1]),
          }),
          // THE CROSS SITS ON THE RUN THAT FAILS, not on the hexagon. On the
          // hexagon it read as the app being broken; the app is fine, and
          // what fails is the delivery to it - so the mark goes on the
          // dashed red line, a little above the sidecar it never reaches.
          app.blocked
            ? icon({
              name: 'fluent-dismiss-circle',
              x: riserX(app) + BLOCK_MARK / 2 + 8,
              y: sidecarAt({ x: app.x, y: ROW_Y, r: APP_R, size: APP_NAME }).y - 52,
              size: BLOCK_MARK, color: DENIED, fit: 'ink',
            })
            : null,
        ]),

        // ---- the broker, and the list that is the argument --------------
        group({
          class: 'd-named-mark',
          children: [
            pipe({
              x1: PIPE_X1, x2: PIPE_X2, y: BROKER_Y,
              ry: PIPE_RY, rx: PIPE_RX, fill: C.green, label: TOPIC, size: TEXT,
            }),
            // HALOED: the broker's one connection down to the bus leaves its
            // underside and runs straight through this name. The halo is the
            // page's own ground behind the glyphs, so the line stops at the
            // word and picks up after it. `paints ground behind any label a
            // line crosses` in tests/diagrams.spec.js found it.
            label({ x: BROKER_X, y: BROKER_NAME_Y, text: BROKER_NAME, size: TEXT, halo: true }),
          ],
        }),
        codeCard({
          x: CARD_X, y: CARD_Y, w: CARD_W, h: CARD_H,
          title: CARD_TITLE, code: groups.join('\n'), size: CODE,
          titleSize: TEXT, pad: CARD_PAD,
        }),
      ];
    },
  };
}
