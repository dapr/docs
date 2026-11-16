// ONE AGENT BROADCASTS, AND THE OTHERS HEAR IT - without either side knowing
// the other exists.
//
// Replaces dapr-agents/home_concepts_principles_message.png on
// developing-ai/dapr-agents/dapr-agents-why.md, under "Message-Driven
// Communication".
//
// Fact-check, against the three bullets it sits under:
//
//   - "Decoupled Architecture: Asynchronous communication for scalability and
//     modularity." Hence nothing joining Frodo to Legolas or Gandalf. The only
//     thing any of the three touches is the broker, and that is the claim.
//   - "Real-Time Adaptability: Agents react dynamically to events." Hence the
//     delivery routes: each subscriber is called on its OWN endpoint, which is
//     what makes adding a fourth agent a matter of subscribing rather than of
//     changing the publisher.
//   - the alert under the section: "Pub/Sub messaging serves as the backbone
//     for Dapr Agents' event-driven workflows."
//
// The names are the source image's own - Frodo publishing to Legolas and
// Gandalf - and so is the message. A reader comparing the two sees the same
// broadcast.
//
// WHAT TRAVELS IS DRAWN ONCE, NOT THREE TIMES. The source repeats the whole
// payload beside each of the three arrows, which is a lot of ink to say "the
// same message". It is the same message, so it is drawn where it is sent and
// each delivery carries only the thing that differs: the route it arrives on.
//
// The publish card sits ON the run rather than beside it, which is how
// `agents-tool-call-flow` draws a message, and the broker is pipe(), which is
// what a message broker is everywhere else in these docs.

import { APP } from '../engine.mjs';
import {
  elbowArrow, httpCard, httpCardH, label, pipe,
} from '../shapes.mjs';
import { appSidecar, pairExtent } from '../app.mjs';
import { hexHalfWidth } from '../shapes.mjs';

const TEXT = 13;
const EDGE = 29;

const AGENT_R = 42;

// EVERY AGENT RUNS WITH A SIDECAR, and the pair is app.mjs's appSidecar() -
// one hexagon carrying the name, one carrying the Dapr wordmark, docked where
// every other app with a sidecar in this set docks it. The first draft of this
// scene placed the two by hand at the offsets the source image uses, which
// drew the same picture and told the shape-clearance check nothing: that check
// exempts a pair only when it is the CLASSED group this helper builds, because
// two hexagons thirty units inside each other are indistinguishable from a
// mistake to anything measuring the drawing.
const EXT = pairExtent({ r: AGENT_R });
const HEX_HALF = hexHalfWidth(AGENT_R);

const agent = ({ x, y, name, app }) => appSidecar({
  x, y, r: AGENT_R, label: name, ...app,
});

// ---- what is sent --------------------------------------------------------
const URL = 'v1.0/publish/pubsub/broadcast';
const BODY = '"name": "Frodo",\n"role": "Assistant",\n"content": "Let’s go to Mordor!"';
const CARD_W = 340;
const CARD_H = Math.ceil(httpCardH({ size: TEXT, body: BODY }));

// ---- across --------------------------------------------------------------
const FRODO_X = EDGE - EXT.left;
const CARD_X = 350;
const BROKER_RY = 30;
const BROKER_X1 = 600;
const BROKER_X2 = 750; // 150 long against 60 across: pipe() allows two to three
// Where the two deliveries turn out of the broker's line.
const RAIL_X = 800;
const AGENT_X = 1045;

const W = Math.ceil(AGENT_X + EXT.right + EDGE);

// ---- down ----------------------------------------------------------------
// Far enough apart that the upper agent's sidecar, which hangs well below its
// hexagon, stays clear of the lower agent's.
const BRANCH_DY = 92;
const MID_Y = EDGE + BRANCH_DY - EXT.top;
// How far a route rides above the run it names.
const WORD_DY = 20;

const H = Math.ceil(MID_Y + BRANCH_DY + EXT.bottom + EDGE);

const SUBSCRIBERS = [
  { name: 'Legolas', route: 'POST /broadcast/legolas', dy: -BRANCH_DY, app: APP[1] },
  { name: 'Gandalf', route: 'POST /broadcast/gandalf', dy: BRANCH_DY, app: APP[2] },
];

export default {
  width: W,
  height: H,
  title: 'Agents talking through a broker',
  desc:
    'A green hexagon named Frodo, carrying a Dapr sidecar badge, sends a POST '
    + 'to v1.0/publish/pubsub/broadcast whose body names the sender, its role '
    + 'and what it said. The call reaches a green message broker, and the '
    + 'broker delivers to two further agents, a blue one named Legolas and a '
    + 'gold one named Gandalf, each on its own route: POST /broadcast/legolas '
    + 'and POST /broadcast/gandalf. Nothing joins the three agents to each '
    + 'other.',

  build() {
    return [
      // ---- Frodo broadcasts ------------------------------------------------
      // The run leaves the HEXAGON's edge, not the sidecar's: the sidecar hangs
      // below the midline, so a run along that line passes over it rather than
      // out of it, and starting past it would waste the only short gap here.
      elbowArrow({ points: [[FRODO_X + HEX_HALF + 4, MID_Y], [CARD_X - CARD_W / 2 - 2, MID_Y]] }),
      elbowArrow({ points: [[CARD_X + CARD_W / 2, MID_Y], [BROKER_X1 - BROKER_RY * 0.47 - 2, MID_Y]] }),

      // ---- and whoever subscribed is called ---------------------------------
      SUBSCRIBERS.map(({ route, dy }) => [
        elbowArrow({
          points: [
            [BROKER_X2, MID_Y],
            [RAIL_X, MID_Y],
            [RAIL_X, MID_Y + dy],
            [AGENT_X - HEX_HALF - 2, MID_Y + dy],
          ],
        }),
        label({
          x: (RAIL_X + AGENT_X - HEX_HALF) / 2,
          y: MID_Y + dy - WORD_DY,
          text: route,
          size: TEXT,
        }),
      ]),

      // ---- the shapes, over the runs that reach them -------------------------
      agent({ x: FRODO_X, y: MID_Y, name: 'Frodo', app: APP[0] }),

      httpCard({
        x: CARD_X, y: MID_Y, w: CARD_W, h: CARD_H, method: 'POST', url: URL, body: BODY, size: TEXT,
      }),

      pipe({
        x1: BROKER_X1, x2: BROKER_X2, y: MID_Y, ry: BROKER_RY, label: 'Message broker', size: TEXT,
      }),

      SUBSCRIBERS.map(({ name, dy, app }) => agent({
        x: AGENT_X, y: MID_Y + dy, name, app,
      })),
    ];
  },
};
