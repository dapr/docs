// THE PUB/SUB PATTERN ITSELF, before Dapr enters it: a publisher writing to a
// channel, a broker copying each message, and the subscribers reading from
// theirs.
//
// Replaces /images/pubsub-overview-pattern.png on
// developing-applications/building-blocks/pubsub/pubsub-overview.md, at the
// top of the page.
//
// Fact-check, against the three bullets directly above the image:
//   - "The producer, or publisher, writes messages to an input channel and
//     sends them to a topic, unaware which application will receive them."
//   - "The consumer, or subscriber, subscribes to the topic and receives
//     messages from an output channel, unaware which service produced these
//     messages."
//   - "An intermediary message broker copies each message from a publisher's
//     input channel to an output channel for all subscribers interested in
//     that message."
// One publisher, one input channel, one broker, one output channel, and the
// subscribers - which is what the source draws and what this draws.
//
// THERE IS NO DAPR IN THIS PICTURE, deliberately. It is the pattern the page
// opens with, and the Dapr pub/sub API arrives in the section after it; a
// sidecar here would answer a question the reader has not been asked yet. The
// source leaves it out too.
//
// WHY THE THREE SUBSCRIBERS SHARE A COLOUR. They carry one name - the source
// calls all three "Subscriber" - so they are one role drawn three times, not
// three different applications. diagrams/app-colour.test.mjs allows a shared
// fill exactly when the names match, and three different colours here would
// say three different things subscribe, when what the bullet says is "all
// subscribers interested in that message".
//
// Where this departs from the source image, and why:
//   - the publisher and subscribers are hexagons, which is what an
//     application is in this set; the source draws plain rectangles.
//   - the broker is the house pipe - a cylinder on its side, open at both
//     ends - rather than a pale box, and the two channels are pills, which is
//     what the source draws them as.
//   - the channels keep the source's names. They are the pattern's own words,
//     used in all three bullets.

import { APP, C } from '../engine.mjs';
import {
  arrow, elbowArrow, group, hex, hexHalfWidth, pill, pipe,
} from '../shapes.mjs';

const EDGE = 29;
const V_EDGE = 14;
const TEXT = 13;
// "Subscriber" is the longest name here and a hexagon is 1.732r across, so
// the radius is set by the WORD rather than by the other scenes' 52: at that
// radius the name ran to 85 units inside a 90-unit shape and touched both
// sloping edges.
const NAME = 16;

const APP_R = 62;

const PIPE_RY = 30;
const PIPE_RX = 12;
const PIPE_LEN = 140;

// Measured on the rendered page at 13: "Output channel" is the longer.
const CHANNEL_W = 128;
const CHANNEL_H = 30;

const GAP = 56;

// ---- three subscribers stacked against one publisher ------------------------
// DERIVED from the hexagons it separates, not chosen: a hexagon is 2r tall,
// so a pitch of 128 against a radius of 62 left the three subscribers six
// units apart and all but touching. The clearance is what the eye needs to
// read them as three shapes rather than a column.
const ROW_CLEAR = 26;
const ROW_GAP = APP_R * 2 + ROW_CLEAR;
const ROWS = 3;
const ROW_T = V_EDGE + APP_R;
const rowY = (i) => ROW_T + i * ROW_GAP;
const MID_Y = rowY(1);

const PUB = { x: EDGE + hexHalfWidth(APP_R), y: MID_Y, r: APP_R, hex: true };
const IN_X = PUB.x + hexHalfWidth(APP_R) + GAP + CHANNEL_W / 2;
const PIPE_X1 = IN_X + CHANNEL_W / 2 + GAP + PIPE_RX;
const PIPE_X2 = PIPE_X1 + PIPE_LEN;
const OUT_X = PIPE_X2 + PIPE_RX + GAP + CHANNEL_W / 2;

// The fan turns once, out of the output channel and along to each subscriber.
const FAN_X = OUT_X + CHANNEL_W / 2 + 54;
const SUB_X = FAN_X + 96 + hexHalfWidth(APP_R);

const W = Math.ceil(SUB_X + hexHalfWidth(APP_R) + EDGE);
const H = Math.ceil(rowY(ROWS - 1) + APP_R + V_EDGE);

export default {
  width: W,
  height: H,
  title: 'The publish and subscribe pattern: a publisher, a broker, and the subscribers reading from it',
  desc:
    'On the left, a green hexagon named Publisher. An arrow runs from it to a '
    + 'pill named Input channel, on to a green message broker named Message '
    + 'broker, and on to a second pill named Output channel. From that pill '
    + 'three lines fan out, each turning once, to three blue hexagons all '
    + 'named Subscriber - one role drawn three times, so all three carry the '
    + 'same name and the same colour.',

  build() {
    return [
      // ---- the publisher writes to its channel, and the broker copies it --
      arrow({ from: PUB, to: [IN_X - CHANNEL_W / 2 - 2, MID_Y] }),
      arrow({
        from: [IN_X + CHANNEL_W / 2, MID_Y],
        to: [PIPE_X1 - PIPE_RX - 2, MID_Y],
      }),
      arrow({
        from: [PIPE_X2 + PIPE_RX, MID_Y],
        to: [OUT_X - CHANNEL_W / 2 - 2, MID_Y],
      }),

      // ---- and every interested subscriber reads from the other channel ---
      [0, 1, 2].map((i) => {
        const from = [OUT_X + CHANNEL_W / 2 + 2, MID_Y];
        const to = [SUB_X - hexHalfWidth(APP_R) - 2, rowY(i)];
        // The middle run is straight, because its row IS the channel's row:
        // fed through an elbow it would ask for a turn of no length.
        return rowY(i) === MID_Y
          ? arrow({ from, to })
          : elbowArrow({ points: [from, [FAN_X, MID_Y], [FAN_X, rowY(i)], to] });
      }),

      // ---- the shapes, over the lines that reach them ---------------------
      hex({ x: PUB.x, y: MID_Y, r: APP_R, label: 'Publisher', size: NAME, ...APP[0] }),
      pill({
        x: IN_X, y: MID_Y, w: CHANNEL_W, h: CHANNEL_H,
        text: 'Input channel', color: C.navy, size: TEXT,
      }),
      group({
        class: 'd-named-mark',
        children: [
          pipe({
            x1: PIPE_X1, x2: PIPE_X2, y: MID_Y,
            ry: PIPE_RY, rx: PIPE_RX, fill: C.green, label: 'Message\nbroker', size: TEXT,
          }),
        ],
      }),
      pill({
        x: OUT_X, y: MID_Y, w: CHANNEL_W, h: CHANNEL_H,
        text: 'Output channel', color: C.navy, size: TEXT,
      }),
      // ONE name and ONE colour for all three: it is one role, not three apps.
      [0, 1, 2].map((i) => hex({
        x: SUB_X, y: rowY(i), r: APP_R, label: 'Subscriber', size: NAME, ...APP[1],
      })),
    ];
  },
};
