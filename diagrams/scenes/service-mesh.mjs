// What Dapr and a service mesh each do, and what they both do.
//
// Replaces service-mesh.png on concepts/faq/service-mesh.md, under "The
// illustration below captures the overlapping features and unique capabilities
// that Dapr and service meshes offer."
//
// It is a Venn drawn as two overlapping bands rather than two circles, because
// the two also sit at different HEIGHTS in a stack: application code above,
// hosting infrastructure below, and an axis on the right saying which end of
// that stack each one belongs to. Position is the whole argument here - a
// capability is Dapr's, the mesh's, or both, according to which bands it is
// inside - so the six capability boxes are drawn identically and only their
// placement differs.
//
// Fact-check, against the page:
//   - the four in the overlap are the page's own list, in its words: "Some
//     common capabilities that Dapr shares with service meshes include: Secure
//     service-to-service communication with mTLS encryption; Service-to-service
//     metric collection; Service-to-service distributed tracing; Resiliency
//     through retries".
//   - the two the mesh has alone are the page's: "Dapr does not provide
//     capabilities for traffic behavior such as routing or traffic splitting".
//   - the axis is "Dapr is developer-centric, versus service meshes which are
//     infrastructure-centric", and "Service meshes are mostly managed and
//     deployed by system operators, whereas Dapr building block APIs are
//     intended to be used by developers explicitly in their code".
//
// Where this departs from the source image, and why:
//   - the six Dapr blocks are apiTile(), the same component the overview and
//     the hosting diagrams draw an API with, so a reader who has met Publish &
//     subscribe once meets the same object here. The source drew lettered
//     rectangles, and named two of them differently: "Resource bindings and
//     triggers" and "Service-to-service invocation" are Bindings and Service
//     invocation everywhere else in these docs.
//   - the mesh band is NAVY and the Dapr band SKY, which is this set's rule
//     rather than the source's blue-and-grey: navy is what is not Dapr - the
//     infrastructure underneath - and sky is Dapr. The overlap is where the
//     two tints fall on each other, so it reads darker than either band
//     without being painted a third colour.
//   - the source's language strip ended with "Any code or framework...", in
//     type, beside six marks. It says the set is open, which a strip of six
//     logos otherwise denies, so it is kept - as the strip's name rather than
//     as a seventh item.

import { C, el } from '../engine.mjs';
import { FILL_OPACITY, arrow, group, label, lineWidth, region, slots } from '../shapes.mjs';
import { brand, icon } from '../icons.mjs';
import { CLOUDS, CLOUD_TEXT_DX, LANGUAGES, cloudMark, scaleMarks } from '../brands.mjs';
import { apiTile } from '../apis.mjs';

const W = 1180;
const H = 658;

const TEXT = 15;

// ---- the two bands ---------------------------------------------------------
// They overlap by design: the four capabilities both provide sit in the band
// of air they share. Everything else follows from these eight numbers.
const DAPR_X = 28;
// Past the mesh band at both ends, because Dapr is the wider of the two, but
// only far enough on the right to say so: the extra room on the LEFT is a
// column, and holds the Dapr wordmark.
const DAPR_W = 996;
const DAPR_Y = 158;
const DAPR_H = 262;

const MESH_X = 150;
const MESH_W = 836;
const MESH_Y = 334;
const MESH_H = 176;

// The overlap, which is where the shared capabilities go.
const SHARE_Y = (MESH_Y + DAPR_Y + DAPR_H) / 2;

// ---- the strips above and below --------------------------------------------
// The two strips span the DAPR band, not the mesh band: they are the context
// both sit in, so neither of the two should look like it owns them.
const CODE_X = DAPR_X;
const CODE_W = DAPR_W;
const CODE_Y = 52;
const STRIP_H = 80;

const HOST_Y = 532;

// Each strip is named by a PILL on its own border, the way every named region
// in this set is. That is what sets STRIP_H: a 46-unit plate has to clear the
// pill above it, so the strip is tall enough to hold the pill's half-height,
// a gap, and the plate.
const CAP_H = 26;
// The marks are centred in what is LEFT of the strip once the pill has taken
// its half-height off the top, not in the strip itself: centred in the strip
// they sit six units under the pill and nineteen off the floor.
const MARK_Y = (CAP_H / 2 + STRIP_H) / 2;
const TOP_CAPTION = 'Application code, in any language or framework';
const BOTTOM_CAPTION = 'Hosting infrastructure';

// The two ends of the developer / operator axis. 26, not less: these
// ascenders are the highest ink in the drawing, and the layout test holds
// every scene to 10 units from the edge.
const TOP_LINE = 26;
const BOTTOM_LINE = HOST_Y + STRIP_H + 24;

// ---- the developer / operator axis -----------------------------------------
const AXIS_X = 1122;
const AXIS_TOP = CODE_Y;
const AXIS_BOTTOM = HOST_Y + STRIP_H;

// ---- the pieces ------------------------------------------------------------
const BLOCKS = ['service-invocation', 'state', 'pubsub', 'bindings', 'secrets', 'actors'];
const CARD = 104;
const CARD_Y = 246;

// Both bands' capabilities, drawn the same way: only where they sit says who
// has them.
const CAP_W = 182; // the widest name, 'Distributed tracing', with air either side
const BOX_H = 42;
const SHARED = ['mTLS', 'Metrics', 'Resiliency', 'Distributed tracing'];
const MESH_ONLY = ['Traffic routing', 'Traffic splitting'];
const MESH_ONLY_Y = 465;

// Both rows are the overview's own, from ../brands.mjs, each scaled by ONE
// factor. Picking a size per mark is what put a 86-wide Azure beside a
// 100-wide Google Cloud here before, when the two marks are a small square
// logo and a wide wordmark and the overview draws them 30 and 156.
//
// The two factors differ because the rows do: seven language marks have to
// share the width four cloud marks do. The language row is the binding one -
// at anything above about 0.63 the Python wordmark's plate meets its
// neighbour's - while the cloud row has room for the overview's own sizes,
// and takes them.
const LANG_K = 0.6;
const CLOUD_K = 1;

// The language marks keep brand()'s plate: Node.js, Python and Go are
// dark-on-light wordmarks their owners forbid recolouring, and unplated they
// vanish on the dark ground. 50 holds the tallest of them, the Java cup, at
// this scale. The cloud marks use cloudMark() instead, which backs only the
// two that need it - the overview's rule, and why band three of the overview
// is pixel-identical to dapr.io in light mode.
const PLATE_H = 50;
const CLOUD_BACKING_H = 52;

// A band: panel()'s dashed grouping border with a FILL behind it. Every
// container in this set is dashed and these are no exception, but panel()
// paints nothing, and here the paint is the point: two tints crossing is what
// says a capability belongs to both. The dash pattern is panel()'s, so a band
// and a region read as the same kind of border.
function band({ x, y, w, h, stroke, fill, r = 14 }) {
  return el('rect', {
    class: 'd-band',
    x, y, width: w, height: h, rx: r,
    fill, 'fill-opacity': FILL_OPACITY,
    stroke, 'stroke-width': lineWidth(), 'stroke-dasharray': '6 6', 'stroke-linejoin': 'round',
  });
}

// One capability. Filled with the page's own ground, so a box in the overlap
// is not read through two tints - the box says what it is, the air around it
// says whose it is.
function capability({ x, y, text }) {
  return group([
    el('rect', {
      x: x - CAP_W / 2, y: y - BOX_H / 2, width: CAP_W, height: BOX_H, rx: 8,
      fill: C.bg, stroke: C.navy, 'stroke-width': lineWidth(), 'stroke-linejoin': 'round',
    }),
    label({ x, y, text, size: TEXT }),
  ]);
}

export default {
  width: W,
  height: H,
  title: 'What Dapr and a service mesh each do, and what they share',
  desc:
    'Two overlapping bands. The upper, wider band is Dapr and holds six building block APIs: service invocation, state management, publish and subscribe, bindings, secrets and actors. The lower band is the service mesh and holds traffic routing and traffic splitting, which Dapr does not provide. Where the two bands overlap sit the four capabilities both offer: mTLS, metrics, resiliency and distributed tracing. A strip above the bands holds the application code, in Go, Node.js, Python, Java, .NET, C++ or any other code or framework; a strip below holds the hosting infrastructure, on Azure, AWS, Google Cloud or Kubernetes. An axis down the right side runs from Developer at the top to Operator at the bottom: Dapr is developer-centric and a service mesh is infrastructure-centric.',

  build() {
    const cardX = slots(MESH_X + CARD / 2, MESH_X + MESH_W - CARD / 2, BLOCKS.length);
    // Centred in the column the band keeps to the left of the first card.
    const logoX = (DAPR_X + cardX[0] - CARD / 2) / 2;
    const capX = slots(MESH_X + 16, MESH_X + MESH_W - 16, SHARED.length);
    // Pushed right of the band's name, which sits at its left edge.
    const meshOnlyX = slots(MESH_X + 330, MESH_X + MESH_W - 60, MESH_ONLY.length);
    const langX = slots(CODE_X, CODE_X + CODE_W, LANGUAGES.length);
    // The insets are not equal, because the ROW is not symmetric about its
    // slot centres: Azure and Kubernetes carry their name to the RIGHT of the
    // mark, so a row centred on those centres puts its ink 46 units right of
    // the strip's middle. The extra inset on the right is that 46 twice over,
    // and it lands the drawn row - 138 to 914 - centred on the strip's 526.
    const cloudX = slots(CODE_X + 14, CODE_X + CODE_W - 106, CLOUDS.length);

    return [
      // ---- what the application is written in ---------------------------
      region({
        // Green, the same border the overview gives its language band: both
        // bands say the same thing - this is the application, in whatever it
        // is written in - and a reader who meets one should recognise the
        // other.
        x: CODE_X, y: CODE_Y, w: CODE_W, h: STRIP_H, stroke: C.green,
        caption: TOP_CAPTION, captionW: 400, captionH: CAP_H, captionSize: TEXT,
      }),
      scaleMarks(LANGUAGES, LANG_K).map((m, i) => brand({
        ...m, x: langX[i], y: CODE_Y + MARK_Y, plateH: PLATE_H,
      })),

      // ---- the two bands, and the air they share ------------------------
      band({ x: DAPR_X, y: DAPR_Y, w: DAPR_W, h: DAPR_H, stroke: C.blue, fill: C.blueFill }),
      band({ x: MESH_X, y: MESH_Y, w: MESH_W, h: MESH_H, stroke: C.navy, fill: C.navyFill }),

      // Each band is named at its own left edge, clear of the other's.
      // Centred in the column the band keeps to the left of the cards, and on
      // the cards' own line: the wordmark names the band, so it should read as
      // the first thing in the row rather than as something floating above it.
      icon({
        name: 'logo-blue', x: logoX, y: CARD_Y,
        w: 150, h: 62, fit: 'ink',
      }),
      label({ x: MESH_X + 92, y: MESH_ONLY_Y, text: 'Service mesh', size: 19, weight: 700 }),

      // ---- what only Dapr has -------------------------------------------
      BLOCKS.map((key, i) => apiTile({
        key, wrap: true, x: cardX[i], y: CARD_Y, w: CARD, h: CARD,
      })),

      // ---- what both have, in the overlap -------------------------------
      SHARED.map((text, i) => capability({ x: capX[i], y: SHARE_Y, text })),

      // ---- what only the mesh has ---------------------------------------
      MESH_ONLY.map((text, i) => capability({ x: meshOnlyX[i], y: MESH_ONLY_Y, text })),

      // ---- what it all runs on ------------------------------------------
      region({
        // Body ink: the infrastructure is the ground everything else stands
        // on, and the one border here that is neither Dapr's nor the mesh's.
        x: CODE_X, y: HOST_Y, w: CODE_W, h: STRIP_H, stroke: C.body,
        caption: BOTTOM_CAPTION, captionW: 202, captionH: CAP_H, captionSize: TEXT,
      }),
      CLOUDS.map((m, i) => cloudMark({
        mark: m, x: cloudX[i], y: HOST_Y + MARK_Y, k: CLOUD_K,
        textDx: CLOUD_TEXT_DX * CLOUD_K, backingH: CLOUD_BACKING_H,
      })),

      // ---- who each end belongs to --------------------------------------
      // One line with a head at each end: the stack runs from the developer's
      // concerns to the operator's, and the page says Dapr sits at one end of
      // it and a service mesh at the other.
      arrow({ from: [AXIS_X, AXIS_TOP], to: [AXIS_X, AXIS_BOTTOM] }),
      arrow({ from: [AXIS_X, AXIS_BOTTOM], to: [AXIS_X, AXIS_TOP] }),
      label({ x: AXIS_X, y: TOP_LINE, text: 'Developer', size: TEXT }),
      label({ x: AXIS_X, y: BOTTOM_LINE, text: 'Operator', size: TEXT }),
    ];
  },
};
