// What the Dapr sidecar exposes: three interfaces, over HTTP or gRPC.
//
// Replaces overview-sidecar-apis.png on concepts/dapr-services/sidecar.md,
// under "The Dapr sidecar exposes:".
//
// Fact-check, against the list this diagram sits under. The page names exactly
// three, and in this order:
//
//   - the building block APIs, "used by your application business logic"
//   - a metadata API, "for discoverability of capabilities and to set
//     attributes"
//   - a health API, "to determine health status and sidecar readiness and
//     liveness"
//
// The sentence below the image says they "are called from your application
// over local http or gRPC endpoints", which is what the HTTP/gRPC note on the
// stalks says.
//
// Where this departs from the source image, and why:
//   - the balls are UML lollipops - hollow, on a stalk from the thing that
//     provides them - rather than solid dots. The source draws the shape
//     without the notation's meaning; drawn properly it says these are
//     interfaces the sidecar PROVIDES, which is the point of the picture. The
//     same two builders draw the connector on building-blocks-concept.
//   - the sidecar is markHex(), the same Dapr hexagon every other diagram
//     uses, rather than a bare outline with the wordmark floating inside it,
//     and it is drawn at a size that leaves the three interfaces room to be
//     the subject rather than the hexagon.
//   - each interface carries the one line the page gives it. The source leaves
//     three bare names, and the names alone do not say what a metadata API is
//     for.

import { C } from '../engine.mjs';
import { group, hexHalfWidth, label, lollipop } from '../shapes.mjs';
import { markHex } from '../icons.mjs';

// The canvas width is held while the drawing inside it is at 80%, which is
// what makes it render smaller: the inlined svg always fills the content
// column, so only the ratio of drawing to canvas is visible.
const W = 740;
const H = 212;

const TEXT = 12;

// ---- the sidecar ----------------------------------------------------------
const HEX_X = 562;
const HEX_Y = 106;
const HEX_R = 60;

// ---- the interfaces it provides -------------------------------------------
// All three leave the hexagon's LEFT FACE, which is the flat vertical run over
// its middle third, so they leave the same edge at three heights rather than
// meeting the sloped corners at three different depths.
const FACE_X = HEX_X - hexHalfWidth(HEX_R);
const FACE_PITCH = 19; // between the three entry points, well inside the face

const BALL_X = 298;
// The balls line up with their names, which are not level with the face, so
// the outer two elbow across. The turn is nearer the balls than the face,
// which keeps the three horizontal runs into the hexagon short and equal.
const ELBOW_X = 426;

const NAME_X = BALL_X - 22; // names are right-aligned, ending short of the ball
const ROW_TOP = 39;
const ROW_PITCH = 67;

// [name, what the page says it is for]
const APIS = [
  ['Building block APIs', 'Called from your\napplication business logic'],
  ['Metadata API', 'Discover capabilities\nand set attributes'],
  ['Health API', 'Health status, readiness\nand liveness'],
];

export default {
  width: W,
  height: H,
  title: 'The interfaces the Dapr sidecar exposes',
  desc:
    'The Dapr sidecar, drawn as a hexagon carrying the Dapr mark, provides three interfaces, each drawn as a hollow ball on a stalk leaving the sidecar. The building block APIs are called from your application business logic. The metadata API discovers capabilities and sets attributes. The health API reports health status, readiness and liveness. All three are called over HTTP or gRPC.',

  build() {
    return [
      markHex({ x: HEX_X, y: HEX_Y, r: HEX_R, mark: 'logo-blue' }),

      APIS.map(([name, role], i) => {
        const y = ROW_TOP + i * ROW_PITCH;
        const faceY = HEX_Y + (i - 1) * FACE_PITCH;
        return group([
          lollipop({ x: BALL_X, y, to: FACE_X, toY: faceY, elbowX: ELBOW_X }),
          label({ x: NAME_X, y: y - 7, text: name, size: TEXT, anchor: 'end' }),
          label({ x: NAME_X, y: y + 13, text: role, size: TEXT, anchor: 'end', color: C.blue }),
        ]);
      }),

      // Over the topmost stalk, where there is clear run between the ball and
      // the hexagon, so it labels all three without sitting on any of them.
      label({
        x: (BALL_X + ELBOW_X) / 2,
        y: ROW_TOP - 21,
        text: 'HTTP or gRPC',
        size: TEXT,
      }),
    ];
  },
};
