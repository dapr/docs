// overview - replaces daprdocs/static/images/overview.png on overview.md.
//
// Three bands, top to bottom: the languages an application can be written in,
// the Dapr sidecar and its APIs, and the infrastructure Dapr runs on and talks
// to. The canvas keeps the source image's 1512x779 shape.
//
// Colour system proposed here and reused by every later scene:
//   neutral dashed panel  = a band, a grouping line that carries no meaning
//   navy outlined pill    = a band title
//   navy filled pill      = a protocol or transport
//   sky hexagon           = an application or a service
//   navy hexagon + plate  = Dapr itself, holding the Dapr wordmark
//   sky box               = a building block API
//   orange box            = a cross cutting API
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
} from '../shapes.mjs';
import { icon, plate } from '../icons.mjs';

const W = 1512;
const H = 779;

const SCOPE = 'overview';

// Panels span the full canvas width, inset by the same margin.
const PX = 16;
const PW = W - 2 * PX;

// Band 1: languages. Band 2: Dapr. Band 3: infrastructure.
const B1 = { y: 36, h: 180 };
const B2 = { y: 282, h: 298 };
const B3 = { y: 624, h: 138 };

const LANG_Y = 130; // centre line of the language marks and the App hexagon
const HUB_X = 138; // centre of the App / Dapr hexagon column

const ROW1 = 388;
const ROW2 = 492;
const TILE_W = 112;
const TILE_H = 88;
const TILE_SIZE = 13;

const INFRA_Y = 682; // centre line of the infrastructure row
const INFRA_LABEL = 728; // baseline row for its one line labels
const INFRA_LABEL2 = 736; // the same optical line for a two line label

const PLATE_H = 66; // one plate height for every full colour mark
const PLATE_PAD = 28; // horizontal padding around the mark inside its plate

// Evenly spaced centres for `n` slots across [x0, x1].
function slots(x0, x1, n) {
  const pitch = (x1 - x0) / n;
  return Array.from({ length: n }, (_, i) => x0 + pitch * (i + 0.5));
}

// A full colour brand mark on its neutral plate. `w` and `h` are the box the
// mark is fitted into; `content` is how wide the mark actually draws inside it,
// which is what the plate is sized around (several marks have slack viewBoxes).
function brand({ name, x, y, w, h, content }) {
  return group([
    plate({ x, y, w: content + PLATE_PAD, h: PLATE_H }),
    icon({ name, x, y, w, h, scope: SCOPE }),
  ]);
}

// A single colour mark, tinted to the body ink so it reads on either ground.
// No plate: it is already drawn in a theme colour.
function tinted({ name, x, y, size }) {
  return icon({ name, x, y, size, color: C.body, scope: SCOPE });
}

const LANGUAGES = [
  { name: 'nodejs', w: 66, h: 41, content: 66 },
  { name: 'python', w: 121, h: 36, content: 111 },
  { name: 'dotnet', w: 42, h: 42, content: 42 },
  { name: 'go', size: 64 },
  { name: 'java', w: 31, h: 55, content: 31 },
  { name: 'cpp', size: 42 },
  { name: 'php', size: 50 },
  { name: 'rust', size: 42, label: 'Rust' },
];

// The fourteen building block APIs, in the order overview.md's own table lists
// them. Seven per row.
const BLOCKS = [
  'Workflows',
  'Service\ninvocation',
  'Publish &\nsubscribe',
  'State\nmanagement',
  'Bindings',
  'Actors',
  'Secrets',
  'Configuration',
  'Distributed\nlock',
  'Cryptography',
  'Jobs',
  'Conversation',
  'Search',
  'Vector',
];

const CROSS_CUTTING = ['Observability', 'Security', 'Resiliency'];

const CLOUDS = [
  { name: 'azure', w: 49, h: 49, content: 45, label: 'Azure' },
  { name: 'aws', w: 68, h: 41, content: 67 },
  { name: 'google-cloud', w: 130, h: 21, content: 128 },
  { name: 'kubernetes', w: 138, h: 25, content: 136 },
];

export default {
  width: W,
  height: H,
  title: 'Any language, any framework, anywhere',
  desc:
    'Three bands. At the top, an application hexagon beside the brand marks for Node.js, Python, .NET, Go, Java, C++, PHP and Rust, under the heading "Use any language or runtime". In the middle, the application calls Dapr over HTTP or gRPC, and Dapr offers fourteen building block APIs: Workflows, Service invocation, Publish and subscribe, State management, Bindings, Actors, Secrets, Configuration, Distributed lock, Cryptography, Jobs, Conversation, Search and Vector, alongside the cross cutting APIs Observability, Security and Resiliency. At the bottom, under the heading "Host on and integrate with any cloud or edge infrastructure", Dapr exchanges data with Azure, AWS, Google Cloud, Kubernetes, virtual or physical machines, databases, message brokers and services.',

  build() {
    const langX = slots(254, 1470, LANGUAGES.length);
    const blockX = slots(264, 1156, 7);
    const crossX = slots(1218, 1460, 2);
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
        r: 56,
        label: 'App',
        size: 17,
        stroke: APP[0].stroke,
        fill: APP[0].fill,
      }),
      LANGUAGES.map((m, i) =>
        group([
          m.content === undefined
            ? tinted({ name: m.name, x: langX[i], y: LANG_Y, size: m.size })
            : brand({ ...m, x: langX[i], y: LANG_Y }),
          m.label ? label({ x: langX[i], y: LANG_Y + 42, text: m.label, size: 13 }) : null,
        ]),
      ),

      // ---- the application reaches Dapr over HTTP or gRPC ----------------
      arrow({
        from: { x: HUB_X, y: LANG_Y, r: 56, hex: true },
        to: { x: HUB_X, y: B2.y, w: 152, h: 34 },
      }),
      arrow({
        from: { x: HUB_X, y: B2.y, w: 152, h: 34 },
        to: { x: HUB_X, y: 440, r: 76, hex: true },
      }),

      // ---- band 2: Dapr and its APIs -------------------------------------
      panel({ x: PX, y: B2.y, w: PW, h: B2.h }),
      group([
        el('polygon', {
          points: hexPoints(HUB_X, 440, 76),
          fill: C.plate,
          stroke: C.navy,
          'stroke-width': OUTLINE,
          'stroke-linejoin': 'round',
        }),
        icon({ name: 'logo-blue', x: HUB_X, y: 440, w: 114, h: 114, scope: SCOPE }),
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
      label({ x: 710, y: 314, text: 'Building block APIs', size: 13, color: C.caption }),
      label({ x: 1339, y: 314, text: 'Cross-cutting APIs', size: 13, color: C.caption }),
      BLOCKS.map((name, i) =>
        box({
          x: blockX[i % 7],
          y: i < 7 ? ROW1 : ROW2,
          w: TILE_W,
          h: TILE_H,
          label: name,
          size: TILE_SIZE,
          stroke: C.blue,
          fill: APP[0].fill,
        }),
      ),
      CROSS_CUTTING.map((name, i) =>
        box({
          x: i < 2 ? crossX[i] : (crossX[0] + crossX[1]) / 2,
          y: i < 2 ? ROW1 : ROW2,
          w: TILE_W,
          h: TILE_H,
          label: name,
          size: TILE_SIZE,
          stroke: C.orange,
          fill: APP[3].fill,
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
          m.label
            ? label({ x: infraX[i], y: INFRA_LABEL, text: m.label, size: 13 })
            : null,
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
