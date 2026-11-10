// PUBLISH, COMPONENTS, SUBSCRIBE - the picture pubsub-overview.md draws twice,
// once to show where the component configuration comes from and once to show
// the calls the API makes.
//
// Both are the same three bands: a cart service publishing through its
// sidecar on the left, the pub/sub components it could be backed by in the
// middle, and two subscribing services on the right. What changes is what
// hangs off the sidecars - a component configuration in one, an HTTP exchange
// in the other - and a reader meets them one after the other on the same page,
// so the shapes behind them must not move. Same split as pubsub-raw.mjs and
// secrets-example.mjs: every number here, each scene arranges its own extras.

import { C } from './engine.mjs';

export const EDGE = 29;
export const V_EDGE = 14;

// 13, the size render-width.mjs is calibrated against.
export const TEXT = 13;
export const NAME = 16;

export const APP_R = 52;
export const SIDE_R = 40;

// ---- the components, which are the page's own list --------------------------
// "Each service loads pub/sub component configuration files that point to the
// same pub/sub message broker component; for example: Redis Streams, NATS
// Streaming, Azure Service Bus, or GCP pub/sub."
//
// THE FOURTH IS RabbitMQ, NOT GCP PUB/SUB, and the page's sentence was changed
// with the picture so the two still agree. Maintainer's call, 2026-11-03:
// there is no Google Cloud Pub/Sub mark this repo can carry. It is in neither
// official Google package - the core products download holds 19 products and
// the categories download 26, and Pub/Sub is in neither, the same gap
// `google-key-management.svg` records for Cloud KMS - and the only drawing
// available, from the Iconify `gcp` set, is built out of `<mask>` and
// `<filter>`, which icons.mjs refuses because these files are inlined into
// every docs page. RabbitMQ is a supported pub/sub component, it is already
// vendored, and the pub/sub how-to two pages on is written around it, so a
// reader meets the same broker twice.
export const COMPONENTS = [
  // The 2024 rebrand mark, tinted with its own brand red: it is published
  // single-colour only, and left in the body ink it would be the one grey
  // thing in a column of full-colour marks.
  { mark: 'redis', name: 'Redis', color: C.redisBrand },
  { mark: 'nats', name: 'NATS' },
  { mark: 'azure-service-bus', name: 'Azure\nService Bus' },
  { mark: 'rabbitmq', name: 'RabbitMQ' },
];

export const MARK = 34;
// Measured on the rendered page at 13: "Azure Service Bus" breaks to two
// lines and "Service Bus" is the longer of them.
export const ITEM_W = 92;
export const ITEM_GAP = 30;

// HOW MANY COMPONENTS THERE ACTUALLY ARE. Counted from the docs on
// 2026-11-03: reference/components-reference/supported-pubsub holds 16
// component pages - AMQP 1.0, Apache Kafka, AWS SNS/SQS, Azure Event Hubs,
// Azure Service Bus Queues, Azure Service Bus Topics, GCP, In-memory,
// JetStream, KubeMQ, MQTT, MQTT3, Pulsar, RabbitMQ, Redis Streams and
// RocketMQ. The four marks here stand for FIVE of them, because one Azure
// Service Bus mark covers both the queues and the topics page, so eleven
// are not drawn. A reader counting four icons and adding eleven gets
// fifteen rather than sixteen, and that is the honest arithmetic: the
// label says how many MORE there are, not how many the icons omit.
export const MORE_COMPONENTS = 11;

export const BAND_CAPTIONS = {
  publish: 'Publish',
  components: 'Pub/Sub brokers',
  subscribe: 'Subscribe',
};

// ---- the services ------------------------------------------------------------
// The page's own names: "a 'shipping' service and an 'email' service have both
// subscribed to topics published by a 'cart' service".
export const PUBLISHER = 'Cart';
export const SUBSCRIBERS = ['Shipping', 'Email'];

// The two subscriber rows, and the publisher sitting between them.
export const ROW_GAP = 150;

export const GAP = 72;

// How far a band's dashed border stands off what it holds.
export const PAD = 26;

export const COMPONENT_COLUMN_W = ITEM_W;

export const BAND_STROKE = C.caption;

// ---------------------------------------------------------------------------
// THE PICTURE ITSELF, once. A factory rather than two scenes sharing
// constants, because the whole arrangement repeats and only what hangs off the
// sidecars changes - the same shape as lock-example.mjs and
// pubsub-namespace.mjs.
// ---------------------------------------------------------------------------

import {
  CAPTION_INSET, arrow, elbowArrow, group, hex, hexHalfWidth, label, region, richLabel,
} from './shapes.mjs';
import { icon, markHex } from './icons.mjs';
import { APP } from './engine.mjs';
import { NAME_DY } from './services.mjs';

const CONFIG_MARK = 30;
// The file each sidecar loads, named as the thing it actually is. "yaml" is
// on the end because that is what a reader goes looking for on disk, and the
// glyph is the house file mark rather than a cog: a component configuration
// is a file, and `distributed-lock-overview` already spends this mark on one.
const CONFIG_NAME = 'Component\nconfiguration yaml';

// The call each sidecar carries, as the page's own image writes it, with the
// hosts dropped: `localhost:3500` is whatever `dapr run` chose and the two
// `10.0.0.x` addresses are whatever the subscribers happened to resolve to.
// The path is what a reader can act on.
const PUBLISH_PATH = [
  { text: '/v1.0/' },
  { text: 'publish', color: C.orange, weight: 700 },
  { text: '/pubsub/order' },
];
const SUBSCRIBE_PATH = '/order';
const BODY = '"data":{"user":"JohnDoe","item":"ZeroDay"}';

// Measured on the rendered page at 13 in the code face.
const BODY_W = 300;
// "configuration yaml" is the longer of the file label's two lines.
const CONFIG_W = 130;

/**
 * One state of the picture. `annotation` is 'config' or 'calls'.
 */
export function pubsubBands({ title, desc, annotation }) {
  const calls = annotation === 'calls';

  // ---- what hangs under a sidecar sets how much room each band needs ----
  // The config state drops further than the calls state, because a RUN has
  // to fit between the sidecar's name and the file: started at the name's
  // baseline the line went through the middle of "Dapr sidecar", which
  // `paints ground behind any label a line crosses` caught.
  const DROP = calls ? 30 : 52;
  const BLOCK_H = calls ? TEXT * 1.9 * 2 + TEXT : CONFIG_MARK + TEXT * 2.4;
  const BLOCK_W = calls ? BODY_W : CONFIG_W;

  const SIDE_SPAN = hexHalfWidth(SIDE_R) * 2;
  const APP_SPAN = hexHalfWidth(APP_R) * 2;
  const PAIR_W = Math.max(APP_SPAN + GAP + SIDE_SPAN, BLOCK_W);

  // THE BAND'S SIDE PADDING HOLDS THE BLOCK UNDER ITS OUTERMOST SHAPE. In the
  // subscribe band the sidecar is the FIRST shape, so a block centred on it
  // reaches BLOCK_W / 2 left of the sidecar's own centre - further left than
  // the sidecar's own edge - and at a plain PAD the words sat on the dashed
  // border. Derived from the block rather than chosen, so it cannot go tight
  // again if the label grows.
  // Only the CONFIG state needs it: there the block is centred on a shape
  // and can reach past it, while in the calls state it is centred on the
  // band and PAIR_W already carries its width. Applied to both, the calls
  // state grew 440 units of padding it had no use for.
  const PAD_X = calls
    ? PAD
    : Math.max(PAD, Math.ceil(BLOCK_W / 2 - SIDE_SPAN / 2) + 12);
  const BAND_W = PAD_X + PAIR_W + PAD_X;
  // The band has to be as wide as its own CAPTION as well as its contents:
  // a region's pill is inset from the left edge, and at 158 it ran past the
  // dashed right edge of the box it names.
  const COMP_CAPTION_W = 136;
  const COMP_W = Math.max(
    PAD + COMPONENT_COLUMN_W + PAD,
    CAPTION_INSET * 2 + COMP_CAPTION_W,
  );

  // ---- verticals -------------------------------------------------------
  const BAND_Y = V_EDGE + 13;
  const ROW_T = BAND_Y + PAD + 18 + APP_R;
  const NAME_Y = (y) => y + SIDE_R * NAME_DY;
  const blockTop = (y) => NAME_Y(y) + DROP;

  const rowY = (i) => ROW_T + i * (APP_R * 2 + BLOCK_H + DROP + 40);
  const SUB_ROWS = SUBSCRIBERS.length;
  const MID_Y = (rowY(0) + rowY(SUB_ROWS - 1)) / 2;

  const BAND_H = Math.ceil(
    blockTop(rowY(SUB_ROWS - 1)) + BLOCK_H + PAD - BAND_Y,
  );

  // ---- horizontals -----------------------------------------------------
  const PUB_X = EDGE;
  const COMP_X = PUB_X + BAND_W + 56;
  const SUB_X = COMP_X + COMP_W + 56;

  const APP_AT = { x: PUB_X + PAD_X + hexHalfWidth(APP_R), y: MID_Y, r: APP_R, hex: true };
  const SIDE_A = {
    x: APP_AT.x + hexHalfWidth(APP_R) + GAP + hexHalfWidth(SIDE_R),
    y: MID_Y, r: SIDE_R, hex: true,
  };
  const COMP_MID = COMP_X + COMP_W / 2;

  const subSide = (i) => ({
    x: SUB_X + PAD_X + hexHalfWidth(SIDE_R), y: rowY(i), r: SIDE_R, hex: true,
  });
  const subApp = (i) => ({
    x: SUB_X + PAD_X + SIDE_SPAN + GAP + hexHalfWidth(APP_R), y: rowY(i), r: APP_R, hex: true,
  });

  const W = Math.ceil(SUB_X + BAND_W + EDGE);
  const H = Math.ceil(BAND_Y + BAND_H + V_EDGE);

  // WHAT HANGS UNDER A SIDECAR IS CENTRED ON ITS BAND, not on the sidecar.
  // The widest line in the `calls` state is the payload at 300 units, half as
  // wide again as the pair it belongs to, and the sidecar sits near its
  // band's left edge - so centred on the sidecar the payload ran out through
  // the band's border and into the components column beside it. Centred on
  // the band it is still under the pair, and inside the box that names it.
  // In the CONFIG state the file stands directly under its own sidecar with a
  // run down to it, so a reader can see which configuration belongs to which
  // service; in the CALLS state the block is centred on the band instead,
  // because its widest line is half as wide again as the pair and centred on
  // the sidecar it ran out through the band's border.
  const under = (x, y, parts) => (calls
    ? group([
      richLabel({
        x, y: blockTop(y) + TEXT * 1.9, size: TEXT, anchor: 'middle', mono: true,
        parts,
      }),
      label({
        x, y: blockTop(y) + TEXT * 1.9 * 2, text: BODY, size: TEXT, weight: 400, mono: true,
      }),
      label({ x, y: blockTop(y), text: 'POST', size: TEXT, weight: 700, color: C.blue }),
    ])
    : group({
      class: 'd-named-mark',
      children: [
        icon({
          name: 'fluent-document', x, y: blockTop(y) + CONFIG_MARK / 2,
          size: CONFIG_MARK, color: C.navy, fit: 'ink',
        }),
        label({
          x, y: blockTop(y) + CONFIG_MARK + TEXT * 1.4,
          text: CONFIG_NAME, size: TEXT,
        }),
      ],
    }));

  // The run from a sidecar down to the file it loads. Only the config state
  // draws one: in the calls state what hangs under the sidecar is a note
  // about the call, not a thing the sidecar reaches for.
  const toFile = (x, y) => (calls
    ? null
    : arrow({
      // Clear of the NAME's box, not of its baseline: label() sets the text
      // around the y it is given, so the glyphs reach about two thirds of the
      // type size below it.
      from: [x, NAME_Y(y) + TEXT],
      to: [x, blockTop(y) - 2],
    }));

  return {
    width: W,
    height: H,
    title,
    desc,

    build() {
      return [
        // ---- the cart publishes through its sidecar into a component ----
        arrow({ from: APP_AT, to: SIDE_A }),
        arrow({
          from: SIDE_A,
          to: [COMP_X - 2, MID_Y],
        }),

        // ---- and each subscriber's sidecar takes it from the same one ---
        [0, 1].map((i) => {
          const s = subSide(i);
          const from = [COMP_X + COMP_W + 2, MID_Y];
          const to = [s.x - hexHalfWidth(SIDE_R) - 2, s.y];
          return s.y === MID_Y
            ? arrow({ from, to })
            : elbowArrow({
              points: [from, [COMP_X + COMP_W + 30, MID_Y], [COMP_X + COMP_W + 30, s.y], to],
            });
        }),
        [0, 1].map((i) => arrow({ from: subSide(i), to: subApp(i) })),

        // ---- the three bands --------------------------------------------
        region({
          x: PUB_X, y: BAND_Y, w: BAND_W, h: BAND_H,
          stroke: BAND_STROKE, caption: BAND_CAPTIONS.publish, captionW: 76, captionSize: TEXT,
        }),
        region({
          x: COMP_X, y: BAND_Y, w: COMP_W, h: BAND_H,
          stroke: BAND_STROKE, caption: BAND_CAPTIONS.components, captionW: COMP_CAPTION_W, captionSize: TEXT,
        }),
        region({
          x: SUB_X, y: BAND_Y, w: BAND_W, h: BAND_H,
          stroke: BAND_STROKE, caption: BAND_CAPTIONS.subscribe, captionW: 92, captionSize: TEXT,
        }),

        // ---- the shapes, over the lines that reach them -----------------
        hex({
          x: APP_AT.x, y: MID_Y, r: APP_R, label: PUBLISHER, size: NAME, ...APP[0],
        }),
        markHex({ x: SIDE_A.x, y: MID_Y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
        label({ x: SIDE_A.x, y: NAME_Y(MID_Y), text: 'Dapr sidecar', size: TEXT }),
        toFile(SIDE_A.x, MID_Y),
        under(calls ? PUB_X + BAND_W / 2 : SIDE_A.x, MID_Y, PUBLISH_PATH),

        SUBSCRIBERS.map((name, i) => {
          const s = subSide(i);
          const a = subApp(i);
          return [
            markHex({ x: s.x, y: s.y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
            label({ x: s.x, y: NAME_Y(s.y), text: 'Dapr sidecar', size: TEXT }),
            toFile(s.x, s.y),
            under(calls ? SUB_X + BAND_W / 2 : s.x, s.y, [{ text: SUBSCRIBE_PATH }]),
            hex({ x: a.x, y: a.y, r: APP_R, label: name, size: NAME, ...APP[i + 1] }),
          ];
        }),

        // ---- the components it could be backed by -----------------------
        COMPONENTS.map((c, i) => {
          const y = BAND_Y + PAD + 18 + MARK / 2 + i * (MARK + ITEM_GAP + TEXT * 2.4);
          return group({
            class: 'd-named-mark',
            children: [
              icon({
                name: c.mark, x: COMP_MID, y, size: MARK, fit: 'ink',
                ...(c.color ? { color: c.color } : {}),
              }),
              label({ x: COMP_MID, y: y + MARK / 2 + 14, text: c.name, size: TEXT }),
            ],
          });
        }),

        // ---- and the count of everything the column does not draw -------
        // A WHOLE ITEM'S PITCH BELOW THE LAST MARK, not a line under its
        // name. Set as the second line of RabbitMQ's label it read as part of
        // that name - "RabbitMQ, +11 more" - when what it counts is the
        // column, not the broker above it.
        label({
          x: COMP_MID,
          y: BAND_Y + PAD + 18 + MARK / 2
            + (COMPONENTS.length - 1) * (MARK + ITEM_GAP + TEXT * 2.4)
            + MARK / 2 + 14 + MARK + ITEM_GAP,
          text: `+${MORE_COMPONENTS} more`,
          size: TEXT,
          color: C.caption,
        }),
      ];
    },
  };
}
