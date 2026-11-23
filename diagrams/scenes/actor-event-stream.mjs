// THE APP-INITIATED ACTOR EVENT STREAM, message by message: the app opens one
// gRPC stream, registers what it hosts, and daprd then calls back down that
// stream instead of into a port the app would otherwise have to expose.
//
// Replaces the mermaid sequenceDiagram under "Protocol summary" on
// developing-applications/building-blocks/actors/howto-actors-app-initiated-streams.md.
//
// WHY THIS MERMAID BLOCK AND NOT THE OTHER SEQUENCE DIAGRAMS IN THESE DOCS.
// `workflow-fast-path` has five participants and seventeen messages that loop
// back on each other, and `workflow-stateful-client` interleaves notes with
// its messages to mark time passing; both need a lifeline, which is a
// primitive this set does not have and should not grow for two drawings. This
// one has TWO participants and nine messages that strictly alternate, which is
// the shape `agents-tool-call-flow` already draws: parties as columns, every
// message a straight run between them, order read top to bottom.
//
// Fact-check, against the page around it. The nine messages, their order and
// their text are the mermaid block's own. Two things the picture adds, both
// from the page rather than from the diagram:
//
//   - the two bands are the page's own Step 1 ("Open the stream and register
//     actor types") and Step 2 ("Handle callbacks"). The mermaid draws nine
//     messages in a row and leaves the reader to find the seam.
//   - the three callbacks are the same exchange three times over, which is
//     what "Every callback and response is correlated by a unique id generated
//     by daprd" means - and the ids in the labels are what show it.
//
// The message text is MONO, because every one of them is an identifier off the
// wire. The two parenthetical halves sit on their own line, as the mermaid's
// own <br/> puts them.

import { C } from '../engine.mjs';
import { arrow, box, label, region } from '../shapes.mjs';

const TEXT = 13;
const EDGE = 29;

// ---- across ------------------------------------------------------------------
const COL_W = 132;
const APP_X = EDGE + COL_W / 2;

// What the longest identifier needs: SubscribeActorEventsResponseInitialAlpha1
// is 41 characters, and the page's code font is about 0.6em per character -
// so 320 units would hold it. The span is wider than that because the picture
// is NINE ROWS DEEP and a diagram this tall has to earn its width back: at 520
// the canvas came out at 1.36 wide to high, under the 1.60 floor the aspect
// test holds every scene to.
const SPAN = 700;
const GAP = 34;

const DAPRD_X = APP_X + COL_W / 2 + GAP + SPAN + GAP + COL_W / 2;

const W = Math.ceil(DAPRD_X + COL_W / 2 + EDGE);
const MID_X = (APP_X + DAPRD_X) / 2;

// ---- the messages, in the order the stream carries them -----------------------
// `out` is app -> daprd. Every label is set from the mermaid block verbatim.
const OPEN = [
  { out: true, text: 'SubscribeActorEventsAlpha1()\nopen stream' },
  { out: true, text: 'SubscribeActorEventsRequestInitialAlpha1\n(register actor types + config)' },
  { out: false, text: 'SubscribeActorEventsResponseInitialAlpha1\n(ack - empty = success)' },
];

const CALLBACKS = [
  { out: false, text: 'invoke_request (id="abc", method="x")' },
  { out: true, text: 'invoke_response (id="abc", data=...)' },
  { out: false, text: 'reminder_request (id="def")' },
  { out: true, text: 'reminder_response (id="def")' },
  { out: false, text: 'deactivate_request (id="ghi")' },
  { out: true, text: 'deactivate_response (id="ghi")' },
];

// ---- down --------------------------------------------------------------------
// A row is as deep as its label: two lines where the mermaid breaks the line,
// one where it does not.
const LINE = TEXT * 1.25;
const WORD_DY = 10; // how far the lowest line of a label rides above its run
const ROW_PAD = 20; // between one run and the next label

const rowDepth = (m) => (m.text.includes('\n') ? 2 : 1) * LINE + WORD_DY + ROW_PAD;

const BAND_PAD = 18;
const BAND_GAP = 22;

const laidOut = (() => {
  const rows = [];
  let y = EDGE + 26 + BAND_PAD; // below the first band's caption pill
  const bands = [];
  for (const [i, band] of [OPEN, CALLBACKS].entries()) {
    const top = y - BAND_PAD;
    for (const m of band) {
      y += rowDepth(m);
      rows.push({ ...m, y, lines: m.text.split('\n') });
    }
    y += BAND_PAD;
    bands.push({ top, bottom: y });
    if (i === 0) y += BAND_GAP + 26 + BAND_PAD;
  }
  return { rows, bands, bottom: y };
})();

const H = Math.ceil(laidOut.bottom + EDGE);

const COL_TOP = laidOut.bands[0].top;
const COL_BOTTOM = laidOut.bottom;
const COL_Y = (COL_TOP + COL_BOTTOM) / 2;
const COL_H = COL_BOTTOM - COL_TOP;

const BAND_CAPTIONS = [
  { caption: 'Step 1: open the stream and register', captionW: 262 },
  { caption: 'Step 2: handle callbacks', captionW: 180 },
];

export default {
  width: W,
  height: H,
  title: 'The app-initiated actor event stream, message by message',
  desc:
    'Two columns: an app on the left and daprd, the Dapr sidecar, on the '
    + 'right. In the first band the app opens the stream with '
    + 'SubscribeActorEventsAlpha1, sends an initial request registering the '
    + 'actor types it hosts, and daprd acknowledges. In the second band daprd '
    + 'calls back three times - an invoke request, a reminder request and a '
    + 'deactivate request - and the app answers each one, every pair carrying '
    + 'the same id.',

  build() {
    const appEdge = APP_X + COL_W / 2;
    const daprdEdge = DAPRD_X - COL_W / 2;

    return [
      // ---- the two halves of the protocol, drawn behind the messages -------
      laidOut.bands.map((b, i) => region({
        x: APP_X + COL_W / 2 + GAP / 2,
        y: b.top,
        w: SPAN + GAP,
        h: b.bottom - b.top,
        stroke: C.caption,
        caption: BAND_CAPTIONS[i].caption,
        captionW: BAND_CAPTIONS[i].captionW,
        captionX: MID_X,
        captionH: 22,
        captionSize: TEXT,
      })),

      // ---- every message, in order -----------------------------------------
      laidOut.rows.map(({ out, y, lines }) => [
        arrow({
          from: [out ? appEdge + 2 : daprdEdge - 2, y],
          to: [out ? daprdEdge - 2 : appEdge + 2, y],
        }),
        lines.map((line, i) => label({
          x: MID_X,
          y: y - WORD_DY - (lines.length - 1 - i) * LINE,
          text: line,
          size: TEXT,
          mono: true,
        })),
      ]),

      // ---- who is talking ---------------------------------------------------
      // PLAIN BOXES, NOT CARDS. A card derives where its mark and its name sit
      // from its own proportions, which is right for a card and wrong for a
      // column eleven times taller than it is wide: the first draft of this
      // put the glyph a quarter of the way down and the name three quarters,
      // 260 units apart, reading as two things rather than one column. A box
      // centres its name, which is what a lifeline with a label on it does.
      box({
        x: APP_X, y: COL_Y, w: COL_W, h: COL_H, label: 'App', size: TEXT,
      }),
      box({
        x: DAPRD_X,
        y: COL_Y,
        w: COL_W,
        h: COL_H,
        label: 'daprd\n(Dapr sidecar)',
        size: TEXT,
        stroke: C.blue,
        fill: C.blueFill,
      }),
    ];
  },
};
