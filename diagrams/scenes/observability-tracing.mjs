// Distributed tracing: three apps, their sidecars, and the trace that
// crosses all three.
//
// Replaces observability-tracing.png on concepts/observability-concept.md,
// under "Dapr can be configured to emit tracing data using the widely adopted
// protocols of Open Telemetry (OTEL) and Zipkin. This makes it easily
// integrated with multiple observability tools."
//
// THE LAYOUT IS THE ARGUMENT. Everything the application does runs along one
// line - sidecar to sidecar to broker to sidecar - and everything the
// OBSERVER sees hangs below it. The page's point is that the top line is the
// application's own traffic and the application writes no instrumentation for
// it: the three arrows down are Dapr's doing, not the apps'.
//
// Fact-check, against that page:
//   - every call on the top line leaves and arrives at a SIDECAR, never at a
//     service. "Since this inter-service communication flows through the Dapr
//     runtime (or 'sidecar'), Dapr is in a unique position to offload the
//     burden of application-level instrumentation" - the traffic between
//     services is sidecar-to-sidecar, which is also why Dapr can trace it.
//     The source draws these arrows service-to-service, which says the
//     opposite of what the page does.
//   - "W3C tracing context" is the page's own term: "Dapr uses the W3C tracing
//     specification for tracing context, included as part Open Telemetry
//     (OTEL), to generate and propagate the context header".
//   - the two calls are the page's two examples, "service-to-service calls,
//     pub/sub messaging": A invokes B, B publishes and C subscribes.
//
// Where this departs from the source image, and why:
//   - the broker is a PIPE, not a data store: a topic is something messages
//     pass THROUGH, and a store is a tank they sit IN. The Kafka mark is gone
//     with it. The page says "pub/sub messaging" and names no broker, and
//     naming one in a diagram about tracing invites the reader to think the
//     broker matters here, which it does not.
//   - the broker is the house green, although App A is green too. Three
//     apps in three colours is already telling the reader what colour means
//     here, and a pipe is not a hexagon: only a diagram with ONE app hands
//     its broker another fill.
//   - the three apps are APP[0], APP[1] and APP[2] in order, as every
//     scene's apps are, which lands App C on the palette's yellow - the
//     colour the source drew it in.
//   - the three hexagons under "Visualize" take those same three colours, in
//     the order the trace visits them. That is the only thing they say, and
//     it is why they are in the picture: a trace is one line through three
//     apps, and the colours are what connect the strip to the row above.
//   - the pair of app and sidecar is appSidecar(), the component every
//     hosting diagram uses, rather than three hand-placed badges.
//   - the three runs down to the tools are ONE line, not three arrows
//     converging: B is square to the region and drops straight down, and A
//     and C turn onto that drop. The source fans three angled arrows at a
//     box; the three carry the same thing to the same place, so they are
//     drawn as the same line.
//   - the labels on the row are centred on the gap the APP HEXAGONS leave,
//     not on the arrows they name, so "Service invocation" and "Subscribe"
//     sit left of the arrows' midpoints. See rowEdge() below.

import { APP, C } from '../engine.mjs';
import { arrow, group, hex, hexHalfWidthAt, label, pipe, region, roundedPath, slots } from '../shapes.mjs';
import { icon, plate } from '../icons.mjs';
import { appSidecar, sidecarAt } from '../app.mjs';

const W = 1122;
const H = 410;

const TEXT = 14;

// ---- the row ---------------------------------------------------------------
// One line through four things. The apps sit on it by their hexagons; the
// traffic runs along it at the SIDECARS' height, which is a little lower,
// because that is where every arrow on this row starts and ends.
const APP_R = 56;
const ROW_Y = 74;

const APPS = [
  { name: 'App A', x: 72, app: APP[0] },
  { name: 'App B', x: 372, app: APP[1] },
  { name: 'App C', x: 902, app: APP[2] },
];

// Where a service's sidecar lands, and what an arrow to or from it aims at.
const sidecar = (s) => sidecarAt({ x: s.x, y: ROW_Y, r: APP_R });
const LINE_Y = sidecar(APPS[0]).y;

// The row's labels sit above the line, which puts them beside the APP
// hexagons rather than beside the sidecars the arrows actually run between.
// An app hexagon is the wider shape and it hangs lower, so its sloping edge,
// not the sidecar's, is what a label has to clear - and it is nearest the
// text at the TOP of the glyphs, so that is the height to measure at.
// Centred between the sidecars instead, "Subscribe" ran into App C.
const LABEL_Y = LINE_Y - 24;
const GLYPH_TOP = LABEL_Y - TEXT * 0.72;

// How far the service-and-sidecar pair reaches at that height, on the side
// given: whichever of the two hexagons comes further in.
const rowEdge = (s, side) => {
  const sc = sidecar(s);
  const app = s.x + side * hexHalfWidthAt(APP_R, GLYPH_TOP - ROW_Y);
  const badge = sc.x + side * hexHalfWidthAt(sc.r, GLYPH_TOP - LINE_Y);
  return side > 0 ? Math.max(app, badge) : Math.min(app, badge);
};

// ---- the broker, on that same line -----------------------------------------
// Two and a bit diameters long, which is the house proportion for a broker,
// and long enough to carry its name inside with room at both ends.
const PIPE_X1 = 590;
const PIPE_X2 = 730;
const PIPE_RY = 26;
const PIPE_RX = 11;
// What an arrow aims at: the body plus the cap that bulges past each end.
const PIPE_BOX = {
  x: (PIPE_X1 + PIPE_X2) / 2, y: LINE_Y,
  w: PIPE_X2 - PIPE_X1 + PIPE_RX * 2, h: PIPE_RY * 2,
};

// ---- what the observer sees, below the row ---------------------------------
const PANEL_Y = 254;
const PANEL_H = 130;

// The run down to the tools. All three sidecars send the same thing to the
// same place, so they are drawn as one line: B is already square to the
// region, so its drop is the TRUNK, and A and C come down onto a bus and
// turn into it. Nothing here is angled - see the axes rule in the skill.
const TRUNK_X = sidecar(APPS[1]).x;
const BUS_Y = 222;        // clear of the W3C label above and the region below
const BUS_R = 14;         // the house radius for a turn in a bus

// A sidecar hexagon's lowest point, which is where its line leaves.
const sidecarFoot = (s) => sidecar(s).y + sidecar(s).r;

const TOOLS_X = 28;
const TOOLS_W = 614;
const TOOLS_MID = { x: TOOLS_X + TOOLS_W / 2, y: PANEL_Y + PANEL_H / 2, w: TOOLS_W, h: PANEL_H };

// The marks, each in the box it draws in, all on one line and evenly spaced.
// Zipkin, Jaeger and Datadog are full-colour files; New Relic is Simple Icons'
// single-colour symbol, tinted with body ink so it reads on either ground.
const TOOLS = [
  { name: 'zipkin', w: 54, h: 54 },
  { name: 'jaeger', w: 48, h: 54 },
  { name: 'newrelic', w: 48, h: 48, color: C.body },
  // `backed`: the Datadog mark is one purple, #632ca6, which reads on white
  // and all but disappears on the dark ground, and its owner's terms do not
  // allow recolouring it. C.markPlate is transparent in light mode, so the
  // backing only exists where it is needed - the same rule band three of the
  // overview follows.
  { name: 'datadog', w: 54, h: 54, backed: true },
];
const TOOLS_PLATE_PAD = 16;
const MARK_Y = PANEL_Y + PANEL_H / 2 + 6;
// "and more" is the FIFTH thing on this line, not a note parked at the end:
// the four marks and it are spaced as one row, with the same gap at each
// border. Mark centres are what is spaced, so the slightly narrower text
// sits a little clear of its neighbour on both sides, which is what a row of
// unequal items looks like when it is right.
const TOOLS_EDGE = 60;   // least space from either border to an item centre

const VIZ_X = 694;
const VIZ_W = 400;
const VIZ_R = 30; // the three hexagons in the strip
const VIZ_MID = { x: VIZ_X + VIZ_W / 2, y: PANEL_Y + PANEL_H / 2, w: VIZ_W, h: PANEL_H };

export default {
  width: W,
  height: H,
  title: 'Distributed tracing across three apps with Dapr',
  desc:
    'Four things on one line: App A, App B, a message broker and App C, each app drawn as a hexagon with its Dapr sidecar. App A and App B call each other sidecar to sidecar through service invocation. App B\'s sidecar publishes to the broker and App C\'s sidecar subscribes to it. Below the row, all three sidecars send the W3C tracing context down onto one line that enters a dashed area of backend monitoring tools: the line from App B drops straight down, and the lines from App A and App C turn onto it with two rounded elbows each. The area holds the Zipkin, Jaeger, New Relic and Datadog marks and the words "and more". Beside it a second dashed area, Visualize, holds three small hexagons in the colours of the three apps joined by arrows: one trace running through App A, App B and App C.',

  build() {
    const [a, b, c] = APPS;
    const markX = slots(TOOLS_X + TOOLS_EDGE, TOOLS_X + TOOLS_W - TOOLS_EDGE, TOOLS.length + 1);
    const vizX = slots(VIZ_X + 54, VIZ_X + VIZ_W - 54, APPS.length);
    const mid = (p, q) => (p + q) / 2;

    return [
      // ---- the apps and their sidecars ----------------------------------
      APPS.map((s) => appSidecar({
        x: s.x, y: ROW_Y, r: APP_R, label: s.name, ...s.app,
      })),

      // ---- what runs along the row, all of it sidecar to sidecar --------
      // A and B call each other, so the line carries a head at each end. It
      // runs at the sidecars' height, which clears the underside of B's app
      // hexagon by the same gap that put the sidecar there.
      arrow({ from: sidecar(a), to: sidecar(b) }),
      arrow({ from: sidecar(b), to: sidecar(a) }),
      label({
        x: mid(rowEdge(a, +1), rowEdge(b, -1)),
        y: LABEL_Y, text: 'Service invocation', size: TEXT,
      }),

      pipe({
        x1: PIPE_X1, x2: PIPE_X2, y: LINE_Y, ry: PIPE_RY, rx: PIPE_RX,
        label: 'Message broker', size: TEXT,
      }),
      arrow({ from: sidecar(b), to: PIPE_BOX }),
      arrow({ from: PIPE_BOX, to: sidecar(c) }),
      label({
        x: mid(rowEdge(b, +1), PIPE_X1 - PIPE_RX),
        y: LABEL_Y, text: 'Publish', size: TEXT,
      }),
      label({
        x: mid(PIPE_X2 + PIPE_RX, rowEdge(c, -1)),
        y: LABEL_Y, text: 'Subscribe', size: TEXT,
      }),

      // ---- what the sidecars send down, which is the point of the page --
      // B drops straight down, so its line IS the trunk, and it carries the
      // one head the three share: what reaches the region is a single line.
      arrow({ from: [TRUNK_X, sidecarFoot(b)], to: [TRUNK_X, PANEL_Y - 2] }),
      // A and C come down onto the bus and turn into that trunk. The last
      // leg is two radii long so BOTH corners get the full house radius -
      // roundedPath() clamps a turn to half its shortest leg - and the curve
      // lands ON the trunk rather than beside it.
      [a, c].map((s) => roundedPath({
        points: [
          [sidecar(s).x, sidecarFoot(s)],
          [sidecar(s).x, BUS_Y],
          [TRUNK_X, BUS_Y],
          [TRUNK_X, BUS_Y + BUS_R * 2],
        ],
        r: BUS_R,
      })),
      // One label for three arrows, set on the clearest of them. The three
      // carry the same thing, and the rule is to say once what is true of
      // every copy; the halo is because it sits across the line it names.
      label({
        x: sidecar(b).x + 16, y: mid(LINE_Y, PANEL_Y) + 10,
        text: 'W3C tracing context', size: TEXT, anchor: 'start', halo: true,
      }),

      // ---- where it goes ------------------------------------------------
      region({
        x: TOOLS_X, y: PANEL_Y, w: TOOLS_W, h: PANEL_H, stroke: C.blue,
        caption: 'Backend monitoring tools', captionW: 226, captionH: 26, captionSize: TEXT,
      }),
      TOOLS.map(({ backed, ...m }, i) => group([
        backed
          ? plate({
            x: markX[i], y: MARK_Y, w: m.w + TOOLS_PLATE_PAD, h: m.h + TOOLS_PLATE_PAD,
            fill: C.markPlate,
          })
          : null,
        icon({ ...m, x: markX[i], y: MARK_Y, fit: 'ink' }),
      ])),
      // Body ink, not the blue a description takes: it names the rest of the
      // row rather than describing it, so it reads as one of the items.
      label({
        x: markX[TOOLS.length], y: MARK_Y,
        text: 'and\nmore', size: TEXT, color: C.body,
      }),

      // ---- and what it looks like when it gets there --------------------
      arrow({ from: TOOLS_MID, to: VIZ_MID }),
      region({
        x: VIZ_X, y: PANEL_Y, w: VIZ_W, h: PANEL_H, stroke: C.caption,
        caption: 'Visualize', captionW: 108, captionH: 26, captionSize: TEXT,
      }),
      APPS.map((s, i) => group([
        hex({ x: vizX[i], y: MARK_Y, r: VIZ_R, label: '', ...s.app }),
        i === 0 ? null : arrow({
          from: { x: vizX[i - 1], y: MARK_Y, r: VIZ_R, hex: true },
          to: { x: vizX[i], y: MARK_Y, r: VIZ_R, hex: true },
        }),
      ])),
    ];
  },
};
