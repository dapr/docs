// overview - replaces daprdocs/static/images/overview.png on overview.md.
//
// Aligned with the `apis` scene that dapr.io already ships
// (dapr/website, themes/bigspring/assets/js/diagrams.js): same sixteen APIs in
// the same order, the same Fluent glyphs, the same alpha tags, the same column
// of filled tiles for what Dapr gives every API. The canvas keeps the source
// image's 1512x779 shape rather than the website's 1200x624, and the
// proportions are scaled to fit it.
//
// Where this scene departs from the website, and why:
//   - the three filled tiles are navy, not sky. Sky fill under C.bg text
//     measures 2.56:1; the website has no dark mode and never had to check.
//   - every language mark sits on a plate, single colour ones included, so the
//     row reads as one set on the dark ground as well as the light one.
//   - "Configuration", not "External Configuration": the replaced PNG was the
//     only place in this repository using the longer name.
//   - band panels are neutral, not teal/blue/navy. A grouping line carries no
//     meaning, and panel() refuses teal outright.
//
// Colour system, reused by every later scene:
//   neutral dashed panel  = a band
//   navy outlined pill    = a band title
//   navy filled pill      = a protocol or transport
//   sky hexagon           = an application or a service
//   navy hexagon + plate  = Dapr itself, holding the Dapr wordmark
//   sky tile              = an API building block
//   navy filled tile      = something Dapr gives every API
//   navy glyphs           = infrastructure Dapr integrates with
// Teal and mint are unused: both fail contrast on the light ground.

import { C, APP, el } from '../engine.mjs';
import {
  OUTLINE,
  arrow,
  box,
  broker,
  cylinder,
  group,
  hex,
  hexPoints,
  label,
  panel,
  pill,
  tile,
} from '../shapes.mjs';
import { icon, plate } from '../icons.mjs';

const W = 1512;
const H = 779;

const SCOPE = 'overview';

// Panels span the full canvas width, inset by the same margin.
const PX = 16;
const PW = W - 2 * PX;

// Band 1: languages. Band 2: Dapr. Band 3: infrastructure.
const B1 = { y: 30, h: 168 };
const B2 = { y: 242, h: 352 };
const B3 = { y: 640, h: 126 };

const LANG_Y = 114; // centre line of the language marks and the App hexagon
const HUB_X = 138; // centre of the App / Dapr hexagon column
const HUB_Y = 427; // centre of the Dapr hexagon

const CAPTION_Y = 274;
const ROW1 = 360;
const ROW2 = 494;
const TILE_W = 112;
const TILE_H = 118;
const TILE_LABEL = 12;
const TILE_GLYPH = 34;

const CROSS_X = 1358;
const CROSS_W = 160;
const CROSS_H = 76;
const CROSS_TOP = 339; // centre of the first of the three; pitch CROSS_H + 12

const INFRA_Y = 690; // centre line of the infrastructure row
const INFRA_LABEL = 740; // baseline row for its one line labels
const INFRA_LABEL2 = 748; // the same optical line for a two line label

const PLATE_H = 68; // one plate height for every marked logo
const PLATE_PAD = 28; // horizontal padding around the mark inside its plate

// Evenly spaced centres for `n` slots across [x0, x1].
function slots(x0, x1, n) {
  const pitch = (x1 - x0) / n;
  return Array.from({ length: n }, (_, i) => x0 + pitch * (i + 0.5));
}

// A brand mark on its neutral plate. `w` and `h` are the box the mark is fitted
// into; `content` is how wide it actually draws inside that box, which is what
// the plate is sized around (several marks have slack viewBoxes). Single colour
// marks are plated too, so the row does not go ragged in dark mode, and they
// are tinted C.plateInk rather than C.body: the plate is near-white in BOTH
// themes, so an ink that inverts with the page would vanish on it.
function brand({ name, x, y, w, h, content }) {
  return group([
    plate({ x, y, w: content + PLATE_PAD, h: PLATE_H }),
    icon({ name, x, y, w, h, color: C.plateInk, scope: SCOPE }),
  ]);
}

// A Fluent glyph. Its path paints `currentColor`, which beats the fill that
// icon() puts on the wrapping group, so the colour is set here as well, on an
// outer group, where currentColor can resolve to it.
function glyph(name, x, y, size, color) {
  return el('g', { color }, [icon({ name: `fluent-${name}`, x, y, size, color, scope: SCOPE })]);
}

// The language and runtime marks, in the website's order. C++ is deliberately
// absent on the maintainer's instruction; cpp.svg stays vendored for a later
// scene. Only Rust needs a text label: its mark is the gear, with no wordmark.
const LANGUAGES = [
  { name: 'nodejs', w: 66, h: 41, content: 66 },
  { name: 'python', w: 121, h: 36, content: 111 },
  { name: 'dotnet', w: 44, h: 44, content: 44 },
  { name: 'go', w: 64, h: 64, content: 64 },
  { name: 'java', w: 28, h: 51, content: 27 },
  { name: 'php', w: 50, h: 50, content: 50 },
  { name: 'rust', w: 44, h: 44, content: 44, label: 'Rust' },
];

// The sixteen APIs, two rows of eight, in the website's set and order: the six
// alpha ones are tagged and grouped at the end of the second row. The tag set
// is operations/support/alpha-beta-apis.md. Glyphs are the website's choices.
const APIS = [
  ['flowchart', 'Workflows'],
  ['mail-copy', 'Publish &\nsubscribe'],
  ['arrow-step-in-right', 'Service\ninvocation'],
  ['database', 'State\nmanagement'],
  ['people-team', 'Actors'],
  ['clock', 'Jobs'],
  ['settings-cog-multiple', 'Configuration'],
  ['key', 'Secrets'],
  ['plug-disconnected', 'Bindings'],
  ['arrow-move', 'Middleware'],
  ['lock-closed-key', 'Cryptography', 'alpha'],
  ['table-lock', 'Distributed\nlock', 'alpha'],
  ['chat', 'Conversation', 'alpha'],
  ['cloud-archive', 'Binary Store', 'alpha'],
  ['document-search', 'Search', 'alpha'],
  ['data-scatter', 'Vector', 'alpha'],
];

const CROSS_CUTTING = [
  ['heart-pulse', 'Observability'],
  ['shield-lock', 'Security'],
  ['arrow-clockwise', 'Resiliency'],
];

const CLOUDS = [
  { name: 'azure', w: 49, h: 49, content: 45, label: 'Azure' },
  { name: 'aws', w: 68, h: 41, content: 67 },
  { name: 'google-cloud', w: 131, h: 21, content: 128 },
  { name: 'kubernetes', w: 132, h: 24, content: 130 },
];

export default {
  width: W,
  height: H,
  title: 'Any language, any framework, anywhere',
  desc:
    'Three bands. At the top, an application hexagon beside the brand marks for Node.js, Python, .NET, Go, Java, PHP and Rust, under the heading "Use any language or runtime". In the middle, the application calls Dapr over HTTP or gRPC, and Dapr offers sixteen APIs in two rows: Workflows, Publish and subscribe, Service invocation, State management, Actors, Jobs, Configuration, Secrets, Bindings, Middleware, and then the six alpha APIs Cryptography, Distributed lock, Conversation, Binary Store, Search and Vector. A column beside them holds what Dapr gives every API: Observability, Security and Resiliency. At the bottom, under the heading "Host on and integrate with any cloud or edge infrastructure", Dapr exchanges data with Azure, AWS, Google Cloud, Kubernetes, virtual or physical machines, databases, message brokers and services.',

  build() {
    const langX = slots(254, 1470, LANGUAGES.length);
    const apiX = Array.from({ length: 8 }, (_, i) => 312 + i * 126);
    const infraX = slots(26, 1470, 8);

    return [
      // ---- band 1: any language or runtime -------------------------------
      panel({ x: PX, y: B1.y, w: PW, h: B1.h }),
      pill({
        x: 1300,
        y: B1.y,
        w: 268,
        h: 34,
        text: 'Use any language or runtime',
        color: C.navy,
      }),
      hex({
        x: HUB_X,
        y: LANG_Y,
        r: 52,
        label: 'App',
        size: 16,
        stroke: APP[0].stroke,
        fill: APP[0].fill,
      }),
      LANGUAGES.map((m, i) =>
        group([
          brand({ ...m, x: langX[i], y: LANG_Y }),
          m.label
            ? label({ x: langX[i], y: LANG_Y + PLATE_H / 2 + 14, text: m.label, size: 13 })
            : null,
        ]),
      ),

      // ---- the application reaches Dapr over HTTP or gRPC ----------------
      arrow({
        from: { x: HUB_X, y: LANG_Y, r: 52, hex: true },
        to: { x: HUB_X, y: B2.y, w: 152, h: 34 },
      }),
      arrow({
        from: { x: HUB_X, y: B2.y, w: 152, h: 34 },
        to: { x: HUB_X, y: HUB_Y, r: 88, hex: true },
      }),

      // ---- band 2: Dapr and its APIs -------------------------------------
      panel({ x: PX, y: B2.y, w: PW, h: B2.h }),
      group([
        // The Dapr wordmark paints its own navy, so the hexagon doubles as its
        // plate rather than carrying a rectangular one inside it.
        el('polygon', {
          points: hexPoints(HUB_X, HUB_Y, 88),
          fill: C.plate,
          stroke: C.navy,
          'stroke-width': OUTLINE,
          'stroke-linejoin': 'round',
        }),
        icon({ name: 'logo-blue', x: HUB_X, y: HUB_Y, w: 132, h: 132, scope: SCOPE }),
      ]),
      pill({
        x: HUB_X,
        y: B2.y,
        w: 152,
        h: 34,
        text: 'HTTP/gRPC',
        color: C.navy,
        filled: true,
      }),
      label({
        x: (apiX[0] + apiX[7]) / 2,
        y: CAPTION_Y,
        text: 'Building block APIs',
        size: 13,
        color: C.caption,
      }),
      label({
        x: CROSS_X,
        y: CAPTION_Y,
        text: 'Cross-cutting APIs',
        size: 13,
        color: C.caption,
      }),
      APIS.map(([mark, name, tag], i) =>
        tile({
          x: apiX[i % 8],
          y: i < 8 ? ROW1 : ROW2,
          w: TILE_W,
          h: TILE_H,
          icon: (cx, cy) => glyph(mark, cx, cy, TILE_GLYPH, C.blue),
          label: name,
          labelSize: TILE_LABEL,
          tag,
          color: C.blue,
        }),
      ),
      CROSS_CUTTING.map(([mark, name], i) =>
        tile({
          x: CROSS_X,
          y: CROSS_TOP + i * (CROSS_H + 12),
          w: CROSS_W,
          h: CROSS_H,
          icon: (cx, cy) => glyph(mark, cx, cy, 30, C.bg),
          label: name,
          labelSize: 13,
          inline: true,
          filled: true,
          color: C.navy,
        }),
      ),

      // ---- Dapr exchanges data with the infrastructure below -------------
      arrow({ from: [HUB_X - 12, B2.y + B2.h + 4], to: [HUB_X - 12, B3.y - 4] }),
      arrow({ from: [HUB_X + 12, B3.y - 4], to: [HUB_X + 12, B2.y + B2.h + 4] }),

      // ---- band 3: cloud and edge infrastructure -------------------------
      panel({ x: PX, y: B3.y, w: PW, h: B3.h }),
      pill({
        x: 1140,
        y: B3.y,
        w: 516,
        h: 34,
        text: 'Host on & integrate with any cloud or edge infrastructure',
        color: C.navy,
      }),
      CLOUDS.map((m, i) =>
        group([
          brand({ ...m, x: infraX[i], y: INFRA_Y }),
          m.label ? label({ x: infraX[i], y: INFRA_LABEL, text: m.label, size: 13 }) : null,
        ]),
      ),
      // Virtual or physical machines: two stacked units.
      group([
        box({ x: infraX[4], y: INFRA_Y - 12, w: 54, h: 20, stroke: C.navy, fill: APP[1].fill }),
        box({ x: infraX[4], y: INFRA_Y + 12, w: 54, h: 20, stroke: C.navy, fill: APP[1].fill }),
        label({
          x: infraX[4],
          y: INFRA_LABEL2,
          text: 'Virtual or\nphysical machines',
          size: 13,
        }),
      ]),
      cylinder({
        x: infraX[5],
        top: INFRA_Y - 20,
        bottom: INFRA_Y + 18,
        rx: 22,
        ry: 8,
        stroke: C.navy,
        fill: APP[1].fill,
        label: 'Databases',
        labelDy: INFRA_LABEL - (INFRA_Y - 20),
      }),
      broker({
        x: infraX[6],
        y: INFRA_Y - 2,
        w: 46,
        stroke: C.navy,
        fill: APP[0].fill,
        label: 'Message brokers',
        labelDy: INFRA_LABEL - (INFRA_Y - 2),
      }),
      group([
        hex({ x: infraX[7], y: INFRA_Y - 2, r: 26, label: '' }),
        label({ x: infraX[7], y: INFRA_LABEL, text: 'Services', size: 13 }),
      ]),
    ];
  },
};
