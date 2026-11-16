// Observing the sidecar itself: its health endpoint, its metrics and its logs.
//
// Replaces observability-sidecar.png on concepts/observability-concept.md,
// under "You can also observe Dapr itself, by: generating logs emitted by the
// Dapr sidecar and the Dapr control plane services; collecting metrics on
// performance, throughput, and latency; using health endpoints probes to
// indicate the Dapr sidecar health status".
//
// THE LAYOUT IS THE ARGUMENT. The sidecar sits alone at the bottom, because
// this page is about watching DAPR rather than watching an application, and
// the page's three bullets are the three columns above it. The direction of
// each arrow is the fact: the health probe comes IN, the metrics and the logs
// go OUT. The source draws it the same way round, and that is worth keeping -
// a reader who knows the old picture should recognise this one.
//
// Fact-check, against the docs this page links to:
//   - the health endpoint is `GET http://localhost:<daprPort>/v1.0/healthz`
//     (reference/api/health_api.md), 3500 in every example. It is probed by
//     the hosting platform: sidecar-health.md says it is "for infrastructure
//     health checks (like Kubernetes probes)" and warns in a box against
//     calling it from application code, which is why the probe in this picture
//     comes from Kubernetes and not from an app.
//   - the metrics endpoint is Prometheus-compatible and "the default metrics
//     port is 9090" (metrics-overview.md).
//   - the log levels are info, warn, debug and error (logs.md's configuration
//     table). The page itself names "warning, error, info, and debug". The
//     source image shows INFO, WARNING and ERROR; `warn` is the name the
//     configuration actually takes, and `debug` belongs with them.
//
// Where this departs from the source image, and why:
//   - the dashed box at the top is CAPTIONED. In the source it is an unlabelled
//     border around three logos, which leaves the reader to work out what the
//     three have in common: they are the things OUTSIDE Dapr that watch it.
//   - the two cards hanging off the sidecar are blue and the outside box is
//     grey, because the metrics endpoint and the log stream are Dapr's own and
//     the platform and the tools are not. The source draws all three borders
//     alike.
//   - Grafana, Fluentd and Prometheus are examples, as they are in the source.
//     The page names Fluentd among its log collectors; Grafana and Prometheus
//     are what the metrics how-tos use.
//   - every line runs on an axis and turns with an elbow, as the rest of the
//     set does. The source already drew them this way.

import { C } from '../engine.mjs';
import { arrow, group, label, region, roundedPath } from '../shapes.mjs';
import { icon, markHex } from '../icons.mjs';

const W = 1000;
const H = 430;

const TEXT = 14;
const SMALL = 13;

// ---- the three columns ------------------------------------------------------
// One per bullet on the page, evenly spaced, each running between the sidecar
// and the thing outside that consumes what it carries.
const HEALTH_X = 160;
const METRICS_X = 500;
const LOGS_X = 840;

// ---- what is outside Dapr ---------------------------------------------------
const OUT = { x: 40, y: 26, w: 920, h: 132 };
const OUT_BOTTOM = OUT.y + OUT.h;
const MARK_Y = 86;
const MARK_NAME_Y = 134;

// ---- the sidecar ------------------------------------------------------------
const SIDE = { x: METRICS_X, y: 352, r: 56, hex: true };
const SIDE_TOP = SIDE.y - SIDE.r;

// ---- the two cards it fills --------------------------------------------------
// Each card is as wide as its own contents need, and the column threads
// through it clear of the caption pill on its top edge - the pill sits at the
// left inset, so a card centred on its line would have the two meet. The
// metrics card is wide because its label is; the logs card holds four short
// words, so the line runs through its right third instead of its middle, as
// the source image draws it.
const CARD_Y = 178;
const CARD_H = 102;
const CARD_CY = CARD_Y + CARD_H / 2;
const CAPTION_H = 26;                 // what region() is given below
// The pill straddles the top edge, so it hangs this far into the card.
const PILL_BOTTOM = CARD_Y + CAPTION_H / 2;
const METRICS = { x: METRICS_X - 140, y: CARD_Y, w: 280, h: CARD_H };

// The mark and its label are ONE thing, centred in the card as one thing.
// Centring each on its own would put the pair low, because the label's box is
// half the mark's height: measure the group, then place its top.
const MARK_SIZE = 30;
const MARK_GAP = 12;        // between the mark and the line under it
// label() takes the centre of a line and drops the baseline by a third of the
// size, so a line's box is about its size tall.
const GROUP_H = MARK_SIZE + MARK_GAP + SMALL;
const GROUP_TOP = CARD_Y + (CARD_H - GROUP_H) / 2;
const MARK_CY = GROUP_TOP + MARK_SIZE / 2;
const MARK_LABEL_CY = GROUP_TOP + MARK_SIZE + MARK_GAP + SMALL / 2;
const LOGS = { x: LOGS_X - 124, y: CARD_Y, w: 160, h: CARD_H };
// The levels centre in the REGION, like any region's contents. The column
// runs up through the right of the card and the two keep clear of each other
// because the card is wide enough for both, which is the card's job, not the
// label's: a label moved off its region's centre to dodge something reads as
// a label that missed.
const LOGS_CONTENT_X = LOGS.x + LOGS.w / 2;

// Vertically they pass UNDER the caption pill, so they centre in the space it
// leaves rather than in the whole card: down by half the pill's intrusion and
// no further, which leaves the same gap above the levels as below them.
const LEVELS = ['debug', 'info', 'warn', 'error'];
const LEVELS_Y = (PILL_BOTTOM + CARD_Y + CARD_H) / 2;
const bottomOf = (b) => b.y + b.h;

const BUS_R = 14;

export default {
  width: W,
  height: H,
  title: 'Observing the Dapr sidecar',
  desc:
    'The Dapr sidecar, drawn as a hexagon carrying the Dapr logo, with three things above it inside a dashed area named "Your platform and tools": Kubernetes on the left, Grafana in the middle and Fluentd on the right. From Kubernetes a line runs down and turns right into the sidecar, labelled "Health checks" and "GET http://localhost:3500/v1.0/healthz". Above the sidecar a dashed card named "Metrics" holds the Prometheus mark and the words "Prometheus endpoint :9090", and an arrow carries on up from it to Grafana. To the right of the sidecar a line runs right and turns up through a dashed card named "Logs", which lists the levels debug, info, warn and error, and on to Fluentd.',

  build() {
    return [
      // ---- the platform and the tools, which are not Dapr ----------------
      region({
        ...OUT, stroke: C.caption,
        caption: 'Your platform and tools', captionW: 214, captionH: 26, captionSize: TEXT,
      }),
      group([
        icon({ name: 'kubernetes-color', x: HEALTH_X, y: MARK_Y, size: 56, fit: 'ink' }),
        label({ x: HEALTH_X, y: MARK_NAME_Y, text: 'Kubernetes', size: SMALL }),
      ]),
      group([
        icon({ name: 'grafana', x: METRICS_X, y: MARK_Y, size: 52, fit: 'ink' }),
        label({ x: METRICS_X, y: MARK_NAME_Y, text: 'Grafana', size: SMALL }),
      ]),
      group([
        icon({ name: 'fluentd', x: LOGS_X, y: MARK_Y, size: 52, fit: 'ink' }),
        label({ x: LOGS_X, y: MARK_NAME_Y, text: 'Fluentd', size: SMALL }),
      ]),

      // ---- the health probe, which comes IN ------------------------------
      // Down the left and in at the sidecar's own height, so it arrives on the
      // same line the logs leave on and nothing crosses the picture.
      roundedPath({
        points: [
          [HEALTH_X, OUT_BOTTOM],
          [HEALTH_X, SIDE.y],
          [SIDE.x - SIDE.r, SIDE.y],
        ],
        r: BUS_R,
      }),
      arrow({ from: [SIDE.x - SIDE.r, SIDE.y], to: SIDE }),
      label({
        x: (HEALTH_X + SIDE.x - SIDE.r) / 2, y: SIDE.y - 18,
        text: 'Health checks', size: TEXT,
      }),
      // The endpoint, set in the page's code font because it is one.
      label({
        x: (HEALTH_X + SIDE.x - SIDE.r) / 2, y: SIDE.y + 24,
        text: 'GET http://localhost:3500/v1.0/healthz', size: 11, mono: true, weight: 400,
      }),

      // ---- the metrics, which go OUT -------------------------------------
      // The card sits ON the line: the endpoint is part of the sidecar, and
      // what leaves it carries on up to the tool that draws it.
      arrow({ from: [METRICS_X, SIDE_TOP], to: [METRICS_X, bottomOf(METRICS)], head: false }),
      region({
        ...METRICS, stroke: C.blue,
        caption: 'Metrics', captionW: 84, captionH: 26, captionSize: TEXT,
      }),
      group([
        icon({ name: 'prometheus', x: METRICS_X, y: MARK_CY, size: MARK_SIZE, fit: 'ink' }),
        label({
          x: METRICS_X, y: MARK_LABEL_CY,
          text: 'Prometheus endpoint on port 9090', size: SMALL,
        }),
      ]),
      arrow({ from: [METRICS_X, METRICS.y], to: [METRICS_X, MARK_NAME_Y + 10] }),

      // ---- the logs, which go OUT too ------------------------------------
      roundedPath({
        points: [
          [SIDE.x + SIDE.r, SIDE.y],
          [LOGS_X, SIDE.y],
          [LOGS_X, bottomOf(LOGS)],
        ],
        r: BUS_R,
      }),
      region({
        ...LOGS, stroke: C.blue,
        caption: 'Logs', captionW: 62, captionH: 26, captionSize: TEXT,
      }),
      label({
        x: LOGS_CONTENT_X, y: LEVELS_Y,
        text: LEVELS.join('\n'), size: SMALL, mono: true, weight: 400,
      }),
      arrow({ from: [LOGS_X, LOGS.y], to: [LOGS_X, MARK_NAME_Y + 10] }),

      // ---- what is being watched -----------------------------------------
      markHex({ x: SIDE.x, y: SIDE.y, r: SIDE.r, mark: 'logo-blue' }),
    ];
  },
};
