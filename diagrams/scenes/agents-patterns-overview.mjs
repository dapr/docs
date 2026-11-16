// THE EIGHT AGENTIC PATTERNS, AS A MAP.
//
// Replaces dapr-agents/agents-patterns-overview.png, which opens
// developing-ai/dapr-agents/dapr-agents-patterns.md and is drawn again on
// dapr-agents-introduction.md.
//
// THIS IS NOT A CONTACT SHEET, AND THE SOURCE IS. The source puts eight
// complete diagrams on one canvas, labels and all. That cannot be done here
// and it is not done there either: eight of these pictures at the size they
// are drawn below need about 3700 scene units, which renders a 13-unit label
// at 2.7 CSS px in a docs column against the house 10.6 - and the source PNG,
// at its own natural 1200px, sets its miniatures' type at about 8px. It is a
// picture you scan, not one you read.
//
// So this draws what a reader actually takes from it: eight named panels, each
// a SILHOUETTE of its pattern - how many calls, in what arrangement, with what
// around them - at a canvas width that keeps the eight names at the house size.
// The names carry the information. The shapes carry the shape. Anyone who
// wants to read one reads it further down the page, at full size, which is
// where the detail has always been.
//
// WHY THE SILHOUETTES ARE OUTLINED IN THE APP INK rather than in each shape's
// own colour. A teal or mint outline fails contrast on the light ground unless
// the shape carries a label to do the work - shapes.mjs refuses to draw one,
// and at this size none of these carries a label. The FILLS are the set's own,
// so a panel still reads as green in, orange out, teal call, blue outside,
// gold gate; only the line around them is the app ink every solid shape in the
// set already wears.
//
// THE AUTONOMOUS AGENT PANEL HAS NO SECTION ON THE PAGE. It is in the source's
// eight, and `agents-autonomous.png` exists in the image tree, but nothing in
// the English docs references that file and the page explains Human-in-the-Loop
// instead, which the source leaves out. Reviewed and kept as the source has
// it: this is a map of the pattern space rather than an index of one page's
// headings, and dropping a panel would change what the picture claims. The
// mismatch is worth someone's attention and is recorded here rather than
// quietly resolved.

import { C } from '../engine.mjs';
import { FLOW, flowLane } from '../flow.mjs';
import {
  arrow, box, decision, elbowArrow, group, label, node,
} from '../shapes.mjs';

const PT = FLOW.SIZE;
const EDGE = 29;

// ---- a panel -----------------------------------------------------------------
const PANEL_W = 324;
const COL_GAP = 34;
const ROW_GAP = 32;
// The name, the air under it, and the room the silhouette gets.
const TITLE_H = 18;
const TITLE_AIR = 14;
// The depth of the two deepest silhouettes - the pair with a row of outside
// things under them - which is the one number those two place from. Every
// other panel declares its own depth in PANELS below.
const SIL_H = 116;

// ---- a silhouette ------------------------------------------------------------
// Small enough that eight fit, large enough that an 8-unit arrowhead is a head
// on a line rather than the whole line. MGAP is what sets that: at 16 the head
// is half the run, which is as far as it can be pushed.
const MR = 13;
const MW = 40;
const MH = 20;
const MGAP = 16;
const DW = 32;
const DH = 22;
// Between stacked rows inside a silhouette.
const MROW = 30;
// The corner an elbow turns at this size. The default 12 is most of a run.
const MR_CORNER = 5;

// A silhouette's shapes carry no names, so none of them may wear an outline
// that needs one, and none of them may rely on a TINT to be seen: see the
// header, and `solid` in shapes.mjs. Every panel is solid Dapr fills outlined
// in the app ink, which is how a hexagon in this set reads on either ground.
const START = { stroke: C.appInk, fill: C.green, labelInside: true };
const END = { stroke: C.appInk, fill: C.orange, labelInside: true };
const CALL = { stroke: C.appInk, fill: C.appTeal, solid: true };
const OUTSIDE = { stroke: C.appInk, fill: C.appSky, solid: true };
const GATE = { stroke: C.appInk, fill: C.appGold, solid: true };

const dot = (x, y, kind) => node({ x, y, r: MR, label: '', ...kind });
const bar = (x, y, w = MW) => box({
  x, y, w, h: MH, label: '', ...CALL,
});
const outer = (x, y, w = MW) => box({
  x, y, w, h: MH, label: '', ...OUTSIDE,
});
const diamond = (x, y) => decision({
  x, y, w: DW, h: DH, label: '', ...GATE,
});
const run = (x1, y1, x2, y2) => arrow({ from: [x1, y1], to: [x2, y2] });
const bend = (points, heads = 'end') => elbowArrow({ points, r: MR_CORNER, heads });

// A RUN THAT CARRIES A HEAD AT EACH END needs room for two of them. A
// chevron is HEAD units drawn BACK from its tip, so a run with heads both
// ways spends sixteen units on heads before it has drawn any line at all:
// at MGAP the two met in the middle and the pair read as one solid bowtie.
// This is the gap such a run gets, and it leaves about a dozen units of
// plain line between the two heads.
const MGAP_BOTH = 30;

// A row of shapes, left to right, centred on cx: returns the centre x of each.
const spread = (cx, widths, gap = MGAP) => {
  const total = widths.reduce((a, b) => a + b, 0) + gap * (widths.length - 1);
  let edge = cx - total / 2;
  return widths.map((w) => {
    const c = edge + w / 2;
    edge += w + gap;
    return c;
  });
};

// ---- the eight ---------------------------------------------------------------
// Each takes the panel's centre and the top of its silhouette, and draws
// inside SIL_H of room.

// The three runs down to the row of outside things, on the same orthogonal
// plan the full-size pictures use: the middle one drops straight, the outer
// two leave either side of it, meet a shared rail and turn away from each
// other. Shared by the two panels that have such a row.
const LEAVE_DX = 12;

const downToRow = (cx, fromY, resX, resTop) => {
  const railY = (fromY + resTop) / 2;
  return resX.map((x, i) => {
    if (i === 1) return bend([[cx, fromY + 2], [x, resTop - 2]], 'both');
    const leave = cx + (i === 0 ? -LEAVE_DX : LEAVE_DX);
    return bend(
      [[leave, fromY + 2], [leave, railY], [x, railY], [x, resTop - 2]],
      'both',
    );
  });
};

const augmented = (cx, top) => {
  const rowY = top + MH / 2;
  const [inX, callX, outX] = spread(cx, [MR * 2, MW, MR * 2]);
  const resY = top + SIL_H - MH / 2;
  const resX = spread(cx, [MW, MW, MW]);
  return [
    run(inX + MR, rowY, callX - MW / 2 - 2, rowY),
    run(callX + MW / 2, rowY, outX - MR - 2, rowY),
    downToRow(cx, rowY + MH / 2, resX, resY - MH / 2),
    dot(inX, rowY, START),
    bar(callX, rowY),
    dot(outX, rowY, END),
    resX.map((x) => outer(x, resY)),
  ];
};

const durable = (cx, top) => {
  // The band, with two stacked calls in it.
  const bandW = MW + 34;
  const bandH = 62;
  const bandY0 = top;
  const bandY1 = top + bandH;
  const midY = (bandY0 + bandY1) / 2;
  const [inX, , outX] = spread(cx, [MR * 2, bandW, MR * 2]);
  const upperY = bandY0 + 16;
  const lowerY = bandY1 - 16;
  const resY = top + SIL_H - MH / 2;
  const resX = spread(cx, [MW, MW, MW]);
  return [
    flowLane({
      x: cx - bandW / 2,
      y: bandY0,
      w: bandW,
      h: bandH,
      caption: '',
      captionW: 0,
    }),
    run(inX + MR, midY, cx - bandW / 2 - 2, midY),
    run(cx + bandW / 2, midY, outX - MR - 2, midY),
    bend([[cx + MW / 2, upperY], [cx + MW / 2 + 9, upperY], [cx + MW / 2 + 9, lowerY], [cx + MW / 2 + 2, lowerY]]),
    bend([[cx - MW / 2, lowerY], [cx - MW / 2 - 9, lowerY], [cx - MW / 2 - 9, upperY], [cx - MW / 2 - 2, upperY]]),
    downToRow(cx, bandY1, resX, resY - MH / 2),
    dot(inX, midY, START),
    bar(cx, upperY),
    bar(cx, lowerY),
    dot(outX, midY, END),
    resX.map((x) => outer(x, resY)),
  ];
};

const chaining = (cx, top) => {
  const rowY = top + DH / 2 + 4;
  const [inX, c1X, gX, c2X, c3X, outX] =
    spread(cx, [MR * 2, MW, DW, MW, MW, MR * 2]);
  const exitY = rowY + DH / 2 + 26 + MR;
  return [
    run(inX + MR, rowY, c1X - MW / 2 - 2, rowY),
    run(c1X + MW / 2, rowY, gX - DW / 2 - 2, rowY),
    run(gX + DW / 2, rowY, c2X - MW / 2 - 2, rowY),
    run(c2X + MW / 2, rowY, c3X - MW / 2 - 2, rowY),
    run(c3X + MW / 2, rowY, outX - MR - 2, rowY),
    run(gX, rowY + DH / 2, gX, exitY - MR - 2),
    dot(inX, rowY, START),
    bar(c1X, rowY),
    diamond(gX, rowY),
    bar(c2X, rowY),
    bar(c3X, rowY),
    dot(outX, rowY, END),
    dot(gX, exitY, END),
  ];
};

const evaluator = (cx, top) => {
  const rowY = top + 26 + MH / 2;
  const [inX, genX, evalX, outX] = spread(cx, [MR * 2, MW, MW, MR * 2]);
  const upY = rowY - MH / 2 - 18;
  const downY = rowY + MH / 2 + 18;
  return [
    run(inX + MR, rowY, genX - MW / 2 - 2, rowY),
    run(evalX + MW / 2, rowY, outX - MR - 2, rowY),
    bend([[genX, rowY - MH / 2], [genX, upY], [evalX, upY], [evalX, rowY - MH / 2 - 2]]),
    bend([[evalX, rowY + MH / 2], [evalX, downY], [genX, downY], [genX, rowY + MH / 2 + 2]]),
    dot(inX, rowY, START),
    bar(genX, rowY),
    bar(evalX, rowY),
    dot(outX, rowY, END),
  ];
};

const autonomous = (cx, top) => {
  const rowY = top + MH / 2 + 4;
  // Both of this panel's horizontal runs go two ways, so the row is spaced
  // for a head at each end. See MGAP_BOTH.
  const [inX, callX, envX] = spread(cx, [MR * 2, MW, MW], MGAP_BOTH);
  const outY = rowY + MH / 2 + 30 + MR;
  return [
    bend([[inX + MR, rowY], [callX - MW / 2 - 2, rowY]], 'both'),
    bend([[callX + MW / 2, rowY], [envX - MW / 2 - 2, rowY]], 'both'),
    run(callX, rowY + MH / 2, callX, outY - MR - 2),
    dot(inX, rowY, START),
    bar(callX, rowY),
    outer(envX, rowY),
    dot(callX, outY, END),
  ];
};

// The three that fan out, which differ only in what stands either side of the
// three workers.
const fan = ({ before, after }) => (cx, top) => {
  const widths = [MR * 2, ...(before ? [MW] : []), MW, ...(after ? [MW] : []), MR * 2];
  const xs = spread(cx, widths);
  const inX = xs[0];
  const outX = xs[xs.length - 1];
  const headX = before ? xs[1] : inX;
  const workX = xs[before ? 2 : 1];
  const tailX = after ? xs[xs.length - 2] : outX;
  const midY = top + MROW + MH / 2;
  const rows = [midY - MROW, midY, midY + MROW];
  // A box is MW across and MH deep, a terminal is MR either way: a run
  // arriving on a SIDE stops at the one, a run arriving on the TOP or BOTTOM
  // at the other. Reading the side's number for a top arrival is what left
  // two of these runs ending in mid air on the first draft.
  const headSide = before ? MW / 2 : MR;
  const headFace = before ? MH / 2 : MR;
  const tailSide = after ? MW / 2 : MR;
  const tailFace = after ? MH / 2 : MR;
  return [
    before ? run(inX + MR, midY, headX - MW / 2 - 2, midY) : null,
    bend([[headX, midY - headFace], [headX, rows[0]], [workX - MW / 2 - 2, rows[0]]]),
    run(headX + headSide, midY, workX - MW / 2 - 2, midY),
    bend([[headX, midY + headFace], [headX, rows[2]], [workX - MW / 2 - 2, rows[2]]]),
    bend([[workX + MW / 2, rows[0]], [tailX, rows[0]], [tailX, midY - tailFace - 2]]),
    run(workX + MW / 2, midY, tailX - tailSide - 2, midY),
    bend([[workX + MW / 2, rows[2]], [tailX, rows[2]], [tailX, midY + tailFace + 2]]),
    after ? run(tailX + MW / 2, midY, outX - MR - 2, midY) : null,
    dot(inX, midY, START),
    before ? bar(headX, midY) : null,
    rows.map((y) => bar(workX, y)),
    after ? bar(tailX, midY) : null,
    dot(outX, midY, END),
  ];
};

// Each panel declares how deep its silhouette actually is, and a ROW is as
// deep as the deepest panel in it. Giving every panel the depth the deepest
// one needs - which is the pair with a row of outside things under them -
// left the middle and bottom rows with forty units of nothing under each
// drawing, and a grid of drawings that do not fill their cells reads as a
// grid of drawings that are missing something.
const PANELS = [
  ['Augmented LLM', augmented, 116],
  ['Durable Agent', durable, 116],
  ['Prompt Chaining', chaining, 78],
  ['Evaluator-Optimizer', evaluator, 72],
  ['Autonomous Agent', autonomous, 80],
  ['Parallelization', fan({ before: false, after: true }), 80],
  ['Routing', fan({ before: true, after: false }), 80],
  ['Orchestrator-Workers', fan({ before: true, after: true }), 80],
];

const COLS = 3;
const ROWS = Math.ceil(PANELS.length / COLS);

const rowDepth = (r) => Math.max(
  ...PANELS.slice(r * COLS, r * COLS + COLS).map(([, , d]) => d),
);
const rowTop = (r) => {
  let y = EDGE;
  for (let k = 0; k < r; k++) y += TITLE_H + TITLE_AIR + rowDepth(k) + ROW_GAP;
  return y;
};

const W = Math.ceil(COLS * PANEL_W + (COLS - 1) * COL_GAP + EDGE * 2);
const H = Math.ceil(rowTop(ROWS - 1) + TITLE_H + TITLE_AIR + rowDepth(ROWS - 1) + EDGE);

const panelCx = (i) => EDGE + (i % COLS) * (PANEL_W + COL_GAP) + PANEL_W / 2;
const panelTop = (i) => rowTop(Math.floor(i / COLS));

export default {
  width: W,
  height: H,
  title: 'The eight agentic patterns',
  desc:
    'Eight named panels, each showing the shape of one agentic pattern '
    + 'without its detail. Augmented LLM: one call with three things beneath '
    + 'it. Durable Agent: the same, with a workflow and a call inside a band. '
    + 'Prompt Chaining: three calls in a row with a gate after the first that '
    + 'can exit early. Evaluator-Optimizer: two calls passing work round a '
    + 'loop. Autonomous Agent: a call exchanging with both the caller and the '
    + 'world outside it. Parallelization: three calls at once, gathered by '
    + 'one. Routing: one call choosing between three. '
    + 'Orchestrator-Workers: one call planning three and one writing them up. '
    + 'Each pattern is drawn in full further down the page.',

  build() {
    return PANELS.map(([name, draw], i) => {
      const cx = panelCx(i);
      const top = panelTop(i);
      return group([
        label({
          x: cx, y: top + TITLE_H / 2, text: name, size: PT, weight: 700,
        }),
        group(draw(cx, top + TITLE_H + TITLE_AIR).flat().filter(Boolean)),
      ]);
    });
  },
};
