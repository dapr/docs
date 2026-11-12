// AN ACTOR TYPE, AND THE MANY ACTORS OF THAT TYPE SPREAD ACROSS A CLUSTER.
//
// Replaces /images/actor_background_game_example.png on
// developing-applications/building-blocks/actors/actors-overview.md, under
// "Every actor is defined as an instance of an actor type, identical to the
// way an object is an instance of a class".
//
// Fact-check, against that paragraph:
//   - "identical to the way an object is an instance of a class" - which is
//     why the type is drawn holding its STATE and its METHODS, the two things
//     a class declares. The source has the same seven labels; it scatters
//     them around the circle rather than grouping them, so a reader cannot
//     tell `Weapons` (state) from `Attack()` (behaviour) except by the
//     brackets.
//   - "there could be many actors of that type that are distributed on
//     various nodes across a cluster" - the two hosts and the dots in them.
//   - NOTE FOR THE MAINTAINER: the paragraph's own example is a CALCULATOR
//     ("there may be an actor type that implements the functionality of a
//     calculator"); the picture's is a video game enemy. Neither is wrong -
//     the sentence says "for example" - but the words and the picture give
//     different examples of the same thing, which is a small tax on every
//     reader. The picture keeps the source's example; changing the sentence
//     is a call for the maintainer.
//   - the paragraph ends "Each such actor is uniquely identified by an actor
//     ID", and neither the source nor this drawing shows an ID. Left as the
//     source has it.
//
// Where this departs from the source as a DRAWING, and why:
//   - the zoom cone is a dashed LEADER from one actor to the type it is an
//     instance of. A cone is a perspective effect; this set has one way of
//     saying "that thing is this thing", and it is a dashed line.
//   - the circle is outlined on the page's own ground rather than filled with
//     a blue-to-green gradient. Nothing here has a gradient, and the source's
//     has black text over its pale half and white over its dark half, which
//     is two decisions a theme cannot make.
//   - the members are laid out in two named columns instead of floating.
//   - the hosts are captioned dashed regions, which is what a boundary is in
//     this set; the source draws two grey rectangles with the name inside.
//   - no drop shadows.

import { APP, C, el } from '../engine.mjs';
import {
  arrow, captionReach, group, label, lineWidth, node, region,
} from '../shapes.mjs';

const EDGE = 29;
const V_EDGE = 14;

// 13, the size render-width.mjs is calibrated against.
const TEXT = 13;
const NAME = 17;

// ---- the type ---------------------------------------------------------------
// Big enough to hold its own members: the widest line is the two columns side
// by side, and a circle is narrowest where the first and last rows sit, so the
// radius is checked against those rather than against the middle.
const TYPE_R = 120;

const STATE = ['X pos', 'Y pos', 'Z pos', 'Difficulty', 'Weapons'];
const METHODS = ['Spawn()', 'Attack()'];

const ROW_H = 19;
// Measured on the rendered page. Each column is as wide as the widest thing
// in it INCLUDING ITS HEADING - "Methods" is wider than either method under
// it - because the pair is centred on the circle from these two numbers, and
// taking the second column's width from the first put the whole block thirty
// units right of centre.
const COL_1_W = 68;   // "Difficulty"
const COL_2_W = 70;   // "Methods"
const COL_GAP = 26;
const BLOCK_W = COL_1_W + COL_GAP + COL_2_W;

// The title sits above a rule, and the two columns below it - the same three
// bands a class box has, which is the comparison the paragraph makes.
const TITLE_DY = 62;
const RULE_DY = 38;
const HEAD_DY = 18;

const TYPE_X = EDGE + TYPE_R;
const COL_1_X = TYPE_X - BLOCK_W / 2;
const COL_2_X = COL_1_X + COL_1_W + COL_GAP;

// ---- the hosts, and the actors on them --------------------------------------
const HOST_W = 360;
const HOST_H = 170;
const HOST_GAP = 40;
const DOT_R = 11;

// Where the actors sit inside a host, as fractions of it. Written out rather
// than scattered by a random number, because a diagram that draws itself
// differently on every export is one nobody can review. The top row keeps
// clear of the caption pill, which hangs into the left of the border.
const TOP_DOTS = [
  [0.10, 0.68], [0.26, 0.36], [0.42, 0.80], [0.52, 0.50],
  [0.68, 0.26], [0.80, 0.66], [0.92, 0.40],
];
const BOTTOM_DOTS = [
  [0.18, 0.42], [0.34, 0.72], [0.50, 0.34], [0.66, 0.64], [0.84, 0.46],
];

const GROUP_GAP = 76;
const HOST_X = Math.round(TYPE_X + TYPE_R + GROUP_GAP);

const HOST_1_Y = Math.round(V_EDGE + captionReach());
const HOST_2_Y = HOST_1_Y + HOST_H + HOST_GAP;

// The type is centred against the pair of hosts, which is the block it is an
// instance of: centred on the canvas instead, it would sit low, because the
// hosts start a caption's reach below the top edge.
const TYPE_Y = Math.round((HOST_1_Y + HOST_2_Y + HOST_H) / 2);

const CAPTION_DY = 26;

const W = Math.ceil(HOST_X + HOST_W + EDGE);
const H = Math.ceil(Math.max(
  HOST_2_Y + HOST_H,
  TYPE_Y + TYPE_R + CAPTION_DY + TEXT,
) + V_EDGE);

// The actor the leader points at: the one nearest the type, so the line is
// short and crosses nothing.
const [LEAD_FX, LEAD_FY] = TOP_DOTS[0];
const LEAD_X = HOST_X + HOST_W * LEAD_FX;
const LEAD_Y = HOST_1_Y + HOST_H * LEAD_FY;

const dot = (x, y) => node({ x, y, r: DOT_R, fill: APP[0].fill, stroke: APP[0].stroke });

const member = (x, y, text) => label({ x, y, text, size: TEXT, anchor: 'start', weight: 400 });
const heading = (x, y, text) => label({ x, y, text, size: TEXT, anchor: 'start', weight: 700 });

export default {
  width: W,
  height: H,
  title: 'An actor type, and the many actors of that type spread across two hosts',
  desc:
    'On the left, a large outlined circle titled Video Game Enemy. Under a '
    + 'rule inside it, two columns: State, listing X pos, Y pos, Z pos, '
    + 'Difficulty and Weapons; and Methods, listing Spawn() and Attack(). '
    + 'The circle is captioned Actor type. On the right, two dashed regions '
    + 'captioned Host/Pod, the upper holding seven green dots and the lower '
    + 'five. A dashed line runs from the dot nearest the circle to the circle, '
    + 'saying that each dot is one actor of that type.',

  build() {
    return [
      // ---- the hosts, drawn first so the dots sit on them -----------------
      region({
        x: HOST_X, y: HOST_1_Y, w: HOST_W, h: HOST_H,
        caption: 'Host/Pod', captionW: 82, captionSize: TEXT,
      }),
      region({
        x: HOST_X, y: HOST_2_Y, w: HOST_W, h: HOST_H,
        caption: 'Host/Pod', captionW: 82, captionSize: TEXT,
      }),

      // ---- one of them is an actor of the type on the left ----------------
      // Dashed and headless: it is a leader, not traffic.
      arrow({
        from: [LEAD_X - DOT_R - 3, LEAD_Y],
        to: { x: TYPE_X, y: TYPE_Y, r: TYPE_R },
        head: false,
        dash: true,
        color: C.caption,
      }),

      // ---- the type -------------------------------------------------------
      group({
        class: 'd-named-mark',
        children: [
          // A PLAIN CIRCLE, not node(). node() tags its group `d-node`, and
          // `d-node` is an OBJECT to the rendered check that keeps free
          // labels off shapes - which counts a label as the shape's own only
          // when the object's own group contains it. A title, a rule and two
          // columns cannot go inside node(), so every one of them came back
          // as a label sitting on top of a shape. The circle here is a
          // container this scene composes, the same way
          // `actors-calling-method` composes its service box out of a rect.
          el('circle', {
            cx: TYPE_X, cy: TYPE_Y, r: TYPE_R,
            fill: C.bg, stroke: C.navy, 'stroke-width': lineWidth(),
          }),
          label({
            x: TYPE_X, y: TYPE_Y - TITLE_DY, text: 'Video Game Enemy', size: NAME,
          }),
          el('line', {
            x1: COL_1_X, y1: TYPE_Y - RULE_DY, x2: COL_1_X + BLOCK_W, y2: TYPE_Y - RULE_DY,
            stroke: C.caption, 'stroke-width': lineWidth(),
          }),
          heading(COL_1_X, TYPE_Y - RULE_DY + HEAD_DY, 'State'),
          heading(COL_2_X, TYPE_Y - RULE_DY + HEAD_DY, 'Methods'),
          STATE.map((t, i) => member(COL_1_X, TYPE_Y - RULE_DY + HEAD_DY + ROW_H * (i + 1), t)),
          METHODS.map((t, i) => member(COL_2_X, TYPE_Y - RULE_DY + HEAD_DY + ROW_H * (i + 1), t)),
          label({
            x: TYPE_X, y: TYPE_Y + TYPE_R + CAPTION_DY, text: 'Actor type', size: TEXT,
          }),
        ],
      }),

      // ---- and the actors of it, one dot each -----------------------------
      TOP_DOTS.map(([fx, fy]) => dot(HOST_X + HOST_W * fx, HOST_1_Y + HOST_H * fy)),
      BOTTOM_DOTS.map(([fx, fy]) => dot(HOST_X + HOST_W * fx, HOST_2_Y + HOST_H * fy)),
    ];
  },
};
