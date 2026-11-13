// COMPETING CONSUMERS: three instances of one application subscribed to one
// topic, and each message going to exactly one of them.
//
// Replaces /images/pubsub-overview-pattern-competing-consumers.png on
// developing-applications/building-blocks/pubsub/pubsub-overview.md, under
// "Consumer groups and competing consumers pattern".
//
// Fact-check, against the paragraphs around the image:
//   - "multiple application instances using a single consumer group compete
//     for the message"
//   - "Dapr enforces the competing consumer pattern when replicas use the
//     same `app-id` without explicit consumer group overrides"
//   - "When multiple instances of the same application (with same `app-id`)
//     subscribe to a topic, Dapr delivers each message to *only one instance
//     of that application*. This concept is illustrated in the diagram
//     below."
//
// ---------------------------------------------------------------------------
// DISCREPANCY: THE SOURCE ILLUSTRATES A DIFFERENT CLAIM.
//
// It draws five cog glyphs on the left captioned "Application instances -
// generating messages", a queue in the middle, and three cogs inside a circle
// on the right captioned "Consumer service instance pool - processing
// messages". That is the generic competing-consumers picture, and the thing
// it emphasises - many PRODUCERS - is not what either paragraph around it
// says. The page's sentence is about SUBSCRIBERS: many instances of one
// application, one consumer group, one delivery each.
//
// So the producers collapse to a single publisher, which is all the prose
// needs, and the three consumers become what the prose actually describes:
// three instances of one application, carrying one name and one colour, with
// the consumer group drawn round them. The old image stays on disk.
// ---------------------------------------------------------------------------
//
// WHY THE THREE SHARE A COLOUR. They are one `app-id` - that is the whole
// mechanism - so they carry one name with the instance said beside each, the
// treatment the maintainer settled on for `distributed-lock-overview` and the
// rule diagrams/app-colour.test.mjs enforces. Three colours would say three
// applications, and three applications would each get their own copy, which
// is the opposite of what the page is explaining.

import { APP, C } from '../engine.mjs';
import {
  CAPTION_INSET, arrow, captionReach, elbowArrow, group, hex, hexHalfWidth, label, pipe, region,
} from '../shapes.mjs';

const EDGE = 29;
const V_EDGE = 14;
const TEXT = 13;
const NAME = 16;

const APP_R = 54;

const PIPE_RY = 30;
const PIPE_RX = 12;
const PIPE_LEN = 140;

const PAD = 26;

// ---- three instances stacked against one publisher --------------------------
const ROWS = 3;

// The instance caption hangs under each hexagon, and the row pitch has to
// clear it: the caption reaches INST_DY + its own half below one centre while
// the next hexagon reaches APP_R above the next, so the two close from both
// sides. This is the collision that shipped on the distributed lock how-to
// before diagrams/label-cover.test.mjs existed.
const INST_DY = APP_R + 22;
const INST_CLEAR = 14;
// DERIVED, not chosen: the caption hangs INST_DY + half a line below one
// centre and the next hexagon reaches APP_R above the next.
const ROW_GAP = Math.ceil(INST_DY + TEXT + APP_R + INST_CLEAR);

const REGION_Y = Math.round(V_EDGE + captionReach());
const ROW_T = REGION_Y + PAD + APP_R;
const rowY = (i) => ROW_T + i * ROW_GAP;
const MID_Y = rowY(1);

const PUB = { x: EDGE + hexHalfWidth(APP_R), y: MID_Y, r: APP_R, hex: true };
const PIPE_X1 = PUB.x + hexHalfWidth(APP_R) + 72 + PIPE_RX;
const PIPE_X2 = PIPE_X1 + PIPE_LEN;

// The fan turns once, out of the topic and along to each instance.
const FAN_X = PIPE_X2 + PIPE_RX + 70;
const REGION_X = FAN_X + 54;


// The words the fan carries: what the page's sentence actually claims.
const FAN_CAPTION = 'Each message goes\nto one instance';
const FAN_CAPTION_W = 130;
// Measured off the BROKER's own edge rather than off the row: the pipe
// reaches PIPE_RY above the centre line, so words placed against the centre
// sat on its rim.
const FAN_CAPTION_Y = MID_Y - PIPE_RY - TEXT * 2.2;

// Wide enough for its own CAPTION as well as its contents: a region's name
// sits in a pill inset from the left edge, and at 152 that pill ran 26 units
// past the right edge of the box it names and off the canvas with it.
const CAPTION_W = 152;
const REGION_W = Math.max(
  PAD + hexHalfWidth(APP_R) * 2 + PAD,
  CAPTION_INSET * 2 + CAPTION_W,
);
// CENTRED IN THE REGION, not padded in from its left edge. The box is as wide
// as its own name - "One consumer group" is wider than a hexagon - so the
// column of instances sat hard against the left border with all the slack
// piled on the right.
const INST_X = REGION_X + REGION_W / 2;
const REGION_H = rowY(ROWS - 1) + INST_DY + TEXT + PAD - REGION_Y;

const W = Math.ceil(REGION_X + REGION_W + EDGE);
const H = Math.ceil(REGION_Y + REGION_H + V_EDGE);

export default {
  width: W,
  height: H,
  title: 'Three instances of one application competing for the messages on one topic',
  desc:
    'On the left, a green hexagon named Publisher, with an arrow to a green '
    + 'message broker named Message broker. From it three lines fan out into a '
    + 'dashed region captioned One consumer group, which holds three blue '
    + 'hexagons all named App - they are one application id, so all three '
    + 'carry the same name and the same colour - captioned Instance 1, '
    + 'Instance 2 and Instance 3. Beside the fan are the words: each message '
    + 'goes to one instance.',

  build() {
    return [
      // ---- one publisher writing to the topic -----------------------------
      arrow({ from: PUB, to: [PIPE_X1 - PIPE_RX - 2, MID_Y] }),

      // ---- and one delivery per message, to whichever instance gets it ----
      [0, 1, 2].map((i) => {
        const from = [PIPE_X2 + PIPE_RX, MID_Y];
        const to = [INST_X - hexHalfWidth(APP_R) - 2, rowY(i)];
        // The middle run is straight, because its row IS the topic's row: fed
        // through an elbow it would ask for a turn of no length.
        return rowY(i) === MID_Y
          ? arrow({ from, to })
          : elbowArrow({ points: [from, [FAN_X, MID_Y], [FAN_X, rowY(i)], to] });
      }),
      label({
        x: (PIPE_X2 + PIPE_RX + FAN_X) / 2 + 4, y: FAN_CAPTION_Y,
        // HALOED: the fan's vertical runs through these words on its way to
        // the top and bottom instances, and there is nowhere left of it wide
        // enough to hold two lines of them.
        text: FAN_CAPTION, size: TEXT, halo: true,
      }),

      // ---- the shapes, over the lines that reach them ---------------------
      hex({ x: PUB.x, y: MID_Y, r: APP_R, label: 'Publisher', size: NAME, ...APP[0] }),
      group({
        class: 'd-named-mark',
        children: [
          pipe({
            x1: PIPE_X1, x2: PIPE_X2, y: MID_Y,
            ry: PIPE_RY, rx: PIPE_RX, fill: C.green, label: 'Message broker', size: TEXT,
          }),
        ],
      }),
      region({
        x: REGION_X, y: REGION_Y, w: REGION_W, h: REGION_H,
        stroke: C.caption, caption: 'One consumer group', captionW: CAPTION_W, captionSize: TEXT,
      }),
      // ONE name and ONE colour for all three: it is one app id.
      [0, 1, 2].map((i) => [
        hex({ x: INST_X, y: rowY(i), r: APP_R, label: 'App', size: NAME, ...APP[1] }),
        label({
          x: INST_X, y: rowY(i) + INST_DY, text: `Instance ${i + 1}`, size: TEXT,
        }),
      ]),
    ];
  },
};
