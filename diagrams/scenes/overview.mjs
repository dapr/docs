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
//   - "Azure" is set beside its cube inside the plate, in C.plateInk, so the
//     infrastructure row carries no stray caption under one card.
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
import { OUTLINE, arrow, group, hex, hexPoints, label, panel, pill, slots, tile } from '../shapes.mjs';
import { PLATE_H, brand, icon } from '../icons.mjs';

const W = 1512;
const H = 779;

// Panels span the full canvas width, inset by the same margin.
const PX = 16;
const PW = W - 2 * PX;

// Band 1: languages. Band 2: Dapr. Band 3: infrastructure.
const B1 = { y: 30, h: 168 };
const B2 = { y: 242, h: 352 };
const B3 = { y: 652, h: 114 };

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

const INFRA_Y = 709; // centre line of the infrastructure row
const INFRA_GLYPH_DX = -58; // glyph centre, left of its slot centre
const INFRA_TEXT_DX = -32; // where its label starts, as dapr.io lays them out

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

// Vendored cloud marks, each on its plate. Azure's file is the cube with no
// wordmark, so its name is set beside it inside the plate.
const CLOUDS = [
  { name: 'azure', w: 49, h: 49, content: 45, plate: 127, dx: -30, inside: 'Azure', insideDx: -2 },
  { name: 'aws', w: 68, h: 41, content: 67 },
  { name: 'google-cloud', w: 131, h: 21, content: 128 },
  { name: 'kubernetes', w: 132, h: 24, content: 130 },
];

// What Dapr runs on and talks to that has no logo of its own: the same Fluent
// glyphs dapr.io uses, with the label inline beside them. No plate. A plate is
// for a vendored brand mark that must keep its own colours; these are drawn in
// a theme colour and follow the page.
const INFRA = [
  ['server', 'Virtual or\nphysical machines'],
  ['database', 'Databases'],
  ['mail-copy', 'Message brokers'],
  ['plug-disconnected', 'Services'],
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
        icon({ name: 'logo-blue', x: HUB_X, y: HUB_Y, w: 132, h: 132 }),
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
        text: 'Dapr APIs',
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
          icon: (cx, cy) => icon({ name: `fluent-${mark}`, x: cx, y: cy, size: TILE_GLYPH, color: C.blue }),
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
          icon: (cx, cy) => icon({ name: `fluent-${mark}`, x: cx, y: cy, size: 30, color: C.bg }),
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
      CLOUDS.map((m, i) => brand({ ...m, x: infraX[i], y: INFRA_Y })),
      INFRA.map(([mark, name], i) =>
        group([
          icon({ name: `fluent-${mark}`, x: infraX[i + 4] + INFRA_GLYPH_DX, y: INFRA_Y, size: 36, color: C.blue }),
          label({
            x: infraX[i + 4] + INFRA_TEXT_DX,
            y: INFRA_Y,
            text: name,
            size: 13,
            anchor: 'start',
          }),
        ]),
      ),
    ];
  },
};
