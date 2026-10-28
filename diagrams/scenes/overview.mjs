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
//   - the three filled tiles are sky, matching the website, on the maintainer's
//     explicit call after the alternative was put to them. Measured here so the
//     cost is on the record rather than rediscovered: sky fill under C.bg text
//     is 2.56:1 in LIGHT mode, below the 4.5:1 text threshold. Dark mode is
//     unaffected, because C.bg there is the near-black ground. Navy measured
//     12.7:1 light and 7.2:1 dark if this is ever reversed.
//   - every language mark sits on a plate, single colour ones included, so the
//     row reads as one set on the dark ground as well as the light one.
//   - "Configuration", not "External Configuration": the replaced PNG was the
//     only place in this repository using the longer name.
//   - band panels are teal / sky / navy, matching the website band for band.
//     panel() allows teal only because a dashed grouping border is decorative;
//     light teal is 2.90:1, just under the 3:1 non-text threshold.
//   - band three is the website's own layout, item for item: no plates, the
//     website's x for every mark, its Kubernetes helm tinted brand blue with
//     the name beside it, and its sizes scaled by WEB_S. The language row in
//     band one still uses plates, where they earn their keep in dark mode.
//
// Colour system, reused by every later scene:
//   neutral dashed panel  = a band
//   navy outlined pill    = a band title
//   navy filled pill      = a protocol or transport
//   sky hexagon           = an application or a service
//   navy hexagon + plate  = Dapr itself, holding the Dapr wordmark
//   sky tile              = an API building block
//   sky filled tile       = something Dapr gives every API
//   navy glyphs           = infrastructure Dapr integrates with
// Teal and mint are unused: both fail contrast on the light ground.

import { C, APP, el } from '../engine.mjs';
import { OUTLINE, arrow, group, hex, hexPoints, label, panel, pill, slots, tile } from '../shapes.mjs';
import { brand, icon, plate } from '../icons.mjs';

const W = 1512;
const H = 779;

// Panels span the full canvas width, inset by the same margin.
const PX = 16;
const PW = W - 2 * PX;

// Band 1: languages. Band 2: Dapr. Band 3: infrastructure.
const B1 = { y: 30, h: 152 }; // 119 website units scaled by WEB_S, so the band
                              // reads the same height as dapr.io's at any width
const B2 = { y: 242, h: 352 };
const B3 = { y: 652, h: 114 };

const LANG_Y = B1.y + B1.h / 2; // centre line of the language marks and the App hexagon
const HUB_X = 138; // centre of the App / Dapr hexagon column
const HUB_Y = 427; // centre of the Dapr hexagon

const CAPTION_Y = 274;
const ROW1 = 360;
const ROW2 = 494;
const TILE_W = 112;
const TILE_H = 118;
const TILE_LABEL = 14;
const TILE_GLYPH = 44;

const CROSS_X = 1358;
const CROSS_W = 160;
const CROSS_H = 76;
const CROSS_TOP = 339; // centre of the first of the three; pitch CROSS_H + 12

// Band 3 reproduces dapr.io's `apis` scene item for item. Its panel spans 1158
// units from x=23 where ours spans PW from PX, so every x and every size in the
// band is the website's own number put through webX()/WEB_S rather than being
// re-laid-out here. The row sits at the same fraction of the band height (59 of
// 102 in the website), which is slightly below centre.
const WEB_S = PW / 1158;
const webX = (x) => PX + (x - 23) * WEB_S;
const INFRA_Y = B3.y + (59 / 102) * B3.h;

// The language and runtime marks, in the website's order. C++ is deliberately
// absent on the maintainer's instruction; cpp.svg stays vendored for a later
// scene. No mark carries a text label: each is a wordmark or a logo readers
// know, and Rust's gear was the last caption, removed on the maintainer's call.
// Go and PHP are the full-colour Commons files dapr.io vendors, so they are wide
// wordmarks rather than the square single-colour glyphs they replaced.
const LANG_PLATE_H = 80;
const LANGUAGES = [
  { name: 'nodejs', w: 81, h: 50, content: 81 },
  { name: 'python', w: 148, h: 44, content: 135 },
  { name: 'dotnet', w: 54, h: 54, content: 54 },
  { name: 'go', w: 112, h: 42, content: 112 },
  { name: 'java', w: 34, h: 62, content: 33 },
  { name: 'php', w: 104, h: 56, content: 104 },
  { name: 'rust', w: 54, h: 54, content: 54 },
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

// The cloud marks, exactly as dapr.io places them: no plates, left to right,
// each at the website's own x. Azure and Kubernetes have no wordmark in their
// file, so each gets a name beside it; AWS and Google Cloud carry theirs.
// Kubernetes is the single-colour wheel tinted its own brand blue, which is why
// C.kubernetes exists: it is the mark's colour, not a theme colour.
const CLOUDS = [
  { name: 'azure', x: 62, size: 30, text: 'Azure', textX: 83 },
  { name: 'aws', x: 172, w: 50, h: 30, backed: true },
  { name: 'google-cloud', x: 302, w: 156, h: 24, backed: true },
  { name: 'kubernetes', x: 412, size: 30, color: C.kubernetes, text: 'Kubernetes', textX: 433 },
];
const CLOUD_LABEL = 15;
// AWS and Google Cloud are wordmarks set in near-black and mid-grey, and their
// owners' terms forbid recolouring them, so on the dark ground they get the
// light backing these logos are designed to sit on. C.markPlate is transparent
// in light mode, so band three stays pixel-identical to dapr.io there. Azure
// and Kubernetes need no backing: one is a blue gradient, the other is tinted
// brand blue, and both carry their name as ordinary theme-coloured text.
const MARK_PLATE_H = 56;
const MARK_PLATE_PAD = 16;

// What Dapr runs on and talks to that has no logo of its own: the same Fluent
// glyphs dapr.io uses, with the label inline beside them. No plate. A plate is
// for a vendored brand mark that must keep its own colours; these are drawn in
// a theme colour and follow the page.
const INFRA = [
  ['server', 'Virtual or\nphysical machines', 560, 582],
  ['database', 'Databases', 755, 777],
  ['mail-copy', 'Message brokers', 890, 912],
  ['plug-disconnected', 'Services', 1062, 1084],
];
const INFRA_LABEL = 13.5;

export default {
  width: W,
  height: H,
  title: 'Any language, any framework, anywhere',
  desc:
    'Three bands. At the top, an application hexagon beside the brand marks for Node.js, Python, .NET, Go, Java, PHP and Rust, under the heading "Use any language or runtime". In the middle, the application calls Dapr over HTTP or gRPC, and Dapr offers sixteen APIs in two rows: Workflows, Publish and subscribe, Service invocation, State management, Actors, Jobs, Configuration, Secrets, Bindings, Middleware, and then the six alpha APIs Cryptography, Distributed lock, Conversation, Binary Store, Search and Vector. A column beside them holds what Dapr gives every API: Observability, Security and Resiliency. At the bottom, under the heading "Host on and integrate with any cloud or edge infrastructure", Dapr exchanges data with Azure, AWS, Google Cloud, Kubernetes, virtual or physical machines, databases, message brokers and services.',

  build() {
    const langX = slots(254, 1470, LANGUAGES.length);
    const apiX = Array.from({ length: 8 }, (_, i) => 312 + i * 126);

    return [
      // ---- band 1: any language or runtime -------------------------------
      panel({ x: PX, y: B1.y, w: PW, h: B1.h, stroke: C.teal }),
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
      LANGUAGES.map((m, i) => brand({ ...m, x: langX[i], y: LANG_Y, plateH: LANG_PLATE_H })),

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
      panel({ x: PX, y: B2.y, w: PW, h: B2.h, stroke: C.blue }),
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
        size: 17,
        color: C.caption,
      }),
      label({
        x: CROSS_X,
        y: CAPTION_Y,
        text: 'Cross-cutting APIs',
        size: 17,
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
          // Same size as the API tiles beside them: these are peers, not a
          // secondary note, so they are not set smaller.
          labelSize: TILE_LABEL,
          inline: true,
          inlinePad: 34,
          filled: true,
          color: C.blue,
        }),
      ),

      // ---- Dapr exchanges data with the infrastructure below -------------
      arrow({ from: [HUB_X - 12, B2.y + B2.h + 4], to: [HUB_X - 12, B3.y - 4] }),
      arrow({ from: [HUB_X + 12, B3.y - 4], to: [HUB_X + 12, B2.y + B2.h + 4] }),

      // ---- band 3: cloud and edge infrastructure -------------------------
      panel({ x: PX, y: B3.y, w: PW, h: B3.h, stroke: C.navy }),
      pill({
        x: 1140,
        y: B3.y,
        w: 516,
        h: 34,
        text: 'Host on & integrate with any cloud or edge infrastructure',
        color: C.navy,
      }),
      CLOUDS.map((m) =>
        group([
          m.backed
            ? plate({
              x: webX(m.x),
              y: INFRA_Y,
              w: m.w * WEB_S + MARK_PLATE_PAD,
              h: MARK_PLATE_H,
              fill: C.markPlate,
            })
            : null,
          icon({
            name: m.name,
            x: webX(m.x),
            y: INFRA_Y,
            ...(m.size ? { size: m.size * WEB_S } : { w: m.w * WEB_S, h: m.h * WEB_S }),
            ...(m.color ? { color: m.color } : {}),
          }),
          m.text
            ? label({
              x: webX(m.textX),
              y: INFRA_Y,
              text: m.text,
              size: CLOUD_LABEL * WEB_S,
              anchor: 'start',
            })
            : null,
        ]),
      ),
      INFRA.map(([mark, name, glyphX, textX]) =>
        group([
          icon({ name: `fluent-${mark}`, x: webX(glyphX), y: INFRA_Y, size: 30 * WEB_S, color: C.blue }),
          label({
            x: webX(textX),
            y: INFRA_Y,
            text: name,
            size: INFRA_LABEL * WEB_S,
            anchor: 'start',
          }),
        ]),
      ),
    ];
  },
};
