// How Sentry issues certificates in self-hosted mode.
//
// Replaces security-mTLS-sentry-selfhosted.png on
// concepts/security-concept.md ("mTLS in self hosted mode") and on
// concepts/dapr-services/sentry.md ("Self-hosted mode").
//
// THE ARRANGEMENT, which follows the source image rather than its Kubernetes
// twin: one row across the middle holding the certs and the two app/sidecar
// pairs, Sentry centred over the apps and close above them, and the operator
// centred UNDER them at the bottom. Everything that passes between an app and
// Sentry therefore happens in the column between the two apps - the requests
// go up it, the trust anchors come up it - and the two relationships that are
// not about a running app, the certs' and the operator's, are the two ends of
// the middle row. `sentry-kubernetes` still has Sentry off to the side beside
// the certs: it has to find room for two pods and an injector that this scene
// does not draw, and the two skeletons parted company when this one was
// rearranged.
//
// Fact-check, against operations/security/mtls.md and the concepts page:
//   - "In self-hosted mode, the certs are persisted to disk." Sentry is run
//     with `--issuer-credentials $HOME/.dapr/certs`, and "if successful, the
//     Sentry service runs and creates the root certs in the given directory" -
//     it reads that directory or it writes it, which is why the line between
//     the two has a head at each end.
//   - "Unless you've provided existing root certificates, the Sentry service
//     automatically creates and persists self-signed root certificates valid
//     for one year."
//   - "When a new Dapr sidecar initializes, it checks if mTLS is enabled. If
//     so, a private key and certificate signing request are generated and sent
//     to Sentry via a gRPC interface."
//   - the trust anchors reach the sidecar BY HAND, from the same files: "you
//     also need to provide the TLS certificates to each Dapr sidecar instance.
//     You can do so by setting the following environment variables before
//     running the Dapr instance: DAPR_TRUST_ANCHORS, DAPR_CERT_CHAIN,
//     DAPR_CERT_KEY". The operator is the one who does that, so the run to the
//     sidecars starts at the operator and the label says where the values come
//     from.
//
// Where this departs from the source image, and why:
//   - the source labels that last arrow "Inject trust anchors (root cert)",
//     which is the Kubernetes injector's wording. Nothing injects anything
//     here - there is no injector service in self-hosted mode - so the run
//     starts at the person who sets the variables. That is the real difference
//     between this picture and the Kubernetes one, and it is the one thing the
//     two source images drew identically.
//   - Service A and Service B are App A and App B, in the first two app
//     colours. The source draws the second app yellow, which is the THIRD
//     colour in the house order.
//   - the lines run on the axes with rounded elbows, like the rest of the set.

import { C, APP } from '../engine.mjs';
import { elbowArrow, hexHalfWidth, label, secureLock } from '../shapes.mjs';
import { icon } from '../icons.mjs';
import { appSidecar, appSidecarCentre, sidecarAt } from '../app.mjs';
import { serviceHex } from '../services.mjs';

const W = 770;
const H = 450;

const TEXT = 13;
const SMALL = 12;

// A Fluent glyph draws 16 units across in a 20-unit-tall ink box, so `fit:
// 'ink'` at `size` puts `size` on the page vertically and four fifths of it
// horizontally. A line meeting one of these marks edge-on stops at that
// narrower edge, not at size / 2.
const inkHalf = (size) => +(size * 0.4).toFixed(2);

// ---- the middle row ---------------------------------------------------------
// The certs and the two pairs stand on one line. Putting the filesystem in the
// apps' own row is what lets Sentry sit over the apps instead of beside the
// certs: the read runs up the left edge and along the top to reach it.
// Every x below is set so the DRAWING is centred in the canvas, not just
// inside it: the figure is centred on the page by the stylesheet, so an
// off-centre bbox reads as a diagram that is not centred. Moving the certs
// right in review left 106 of air on the left against 38 on the right, and
// the whole arrangement moved 34 left to square that up.
const ROW_Y = 222; // the PAIRS' centre, which is not the app hexagons' line
const APP_R = 48;
const APP_SIZE = 16;
const A_CX = 356;
const B_CX = 646;
const MID = (A_CX + B_CX) / 2;

// App B is mirrored so its sidecar faces inward; without that the mTLS line
// would have to cross App B to reach it.
const A = appSidecarCentre({ x: A_CX, y: ROW_Y, r: APP_R, size: APP_SIZE });
const B = appSidecarCentre({ x: B_CX, y: ROW_Y, r: APP_R, size: APP_SIZE, mirror: true });
const SIDE_A = sidecarAt({ x: A.x, y: A.y, r: APP_R, size: APP_SIZE });
const SIDE_B = sidecarAt({ x: B.x, y: B.y, r: APP_R, size: APP_SIZE, mirror: true });
const SIDE_HALF = hexHalfWidth(SIDE_A.r);

// The filesystem sits on the app HEXAGONS' line, which is above the pairs'
// centre by however far the sidecar hangs below.
const STORE = { x: 106, y: A.y, size: 48 };
// icon() hangs a name this far under the mark's centre, and sets it at
// `labelSize`. The operator's run ends on the underside of that name, so the
// scene needs to know where its lower edge falls.
const STORE_LABEL_DY = STORE.size / 2 + 14;
const STORE_LABEL_BOTTOM = +(STORE.y + STORE_LABEL_DY + 13 * 0.6).toFixed(2);

// ---- Sentry, over the apps it serves ----------------------------------------
const SERVICE_R = 32;
const SENTRY_Y = 68;
const SENTRY_BOTTOM = SENTRY_Y + SERVICE_R; // the bottom NODE, where requests arrive
const SENTRY_L = +(MID - hexHalfWidth(SERVICE_R)).toFixed(2);

// ---- the certificate requests -----------------------------------------------
// Each request leaves its sidecar at the upper node facing the middle and runs
// sideways before it turns up: straight up from that node would lie along the
// vertical edge below it, which reads as the line sliding off the shape rather
// than leaving it, and the sidecar's top node is under the app hexagon. The
// two risers meet on one line between the apps and go up to Sentry as a single
// arrow.
const CSR_Y = SIDE_A.y - 18;
const A_OUT = +(SIDE_A.x + SIDE_HALF).toFixed(2);
const B_OUT = +(SIDE_B.x - SIDE_HALF).toFixed(2);
const SIDE_BOTTOM = +(SIDE_A.y + SIDE_A.r + 2).toFixed(2);

const CSR_IN = 46; // how far either side of the trunk the risers stand
const CSR_A = MID - CSR_IN;
const CSR_B = MID + CSR_IN;
const CSR_BUS = 155; // where they meet: clear of the lock below, the apps beside

// Above the arrow it marks and below the merge, in the gap between the two
// risers - the only column at this height carrying nothing else. The name
// stacks under the shield because a vertical group needs a third of the width,
// and the risers stand 31 away on either side.
const LOCK = { x: MID, y: 200, size: 38 };

// ---- the operator, under the apps -------------------------------------------
const OPERATOR = { x: MID, y: 378, size: 46 };
const TRUST_BUS = 320; // the fork that feeds both sidecars, below them

export default {
  width: W,
  height: H,
  title: 'Sentry issuing workload certificates in self-hosted mode',
  desc:
    'A filesystem mark on the left holds the certs. A line with a head at each end leaves its top, runs up and along to Sentry, the Dapr certificate authority, which stands above the middle of the picture, and is labelled "Read the existing root and issuer certs, or create a self-signed root". To the right of the filesystem and on the same line, App A and App B each run beside a Dapr sidecar, and the two sidecars are joined by a line with a head at each end carrying a shield and padlock marked mTLS. A line leaves each sidecar on the side facing the other and rises between the two apps, where the pair merge into one arrow into the bottom of the Sentry hexagon, labelled "Request a workload certificate". Below the apps an operator figure stands in the middle. One run goes up from the operator and forks into both sidecars, labelled "Set the trust anchors from those files, as environment variables"; another leaves the operator sideways and reaches the filesystem, marked optional, because the operator may bring existing root and issuer certs.',

  build() {
    return [
      // ---- the certs -------------------------------------------------------
      // The name goes UNDER the mark: its top carries the read to Sentry and
      // its right-hand side takes the operator's optional arrow.
      icon({
        name: 'fluent-document-multiple', x: STORE.x, y: STORE.y, size: STORE.size,
        color: C.navy, fit: 'ink', label: 'Filesystem', labelSize: TEXT,
      }),

      // ---- Sentry, and what it does with them ------------------------------
      // Both ways, because Sentry does one or the other: it reads what is
      // already there, or it writes a root of its own.
      elbowArrow({
        points: [
          [STORE.x, STORE.y - STORE.size / 2 - 2],
          [STORE.x, SENTRY_Y],
          [SENTRY_L - 2, SENTRY_Y],
        ],
        heads: 'both',
      }),
      // Under the run it names, in the gap the row leaves between the certs
      // and App A.
      label({
        x: 220, y: 103, size: TEXT,
        text: 'Read the existing root and\nissuer certs, or create\na self-signed root',
      }),
      // The name and the role go BESIDE the hexagon: the merged request comes
      // up into the bottom node, which is where they would otherwise sit.
      serviceHex({
        key: 'sentry', x: MID, y: SENTRY_Y, r: SERVICE_R, role: true, wrap: true, side: 'right',
      }),

      // ---- the two apps, and the channel between them ----------------------
      appSidecar({ x: A.x, y: A.y, r: APP_R, size: APP_SIZE, label: 'App A', ...APP[0] }),
      appSidecar({ x: B.x, y: B.y, r: APP_R, size: APP_SIZE, label: 'App B', mirror: true, ...APP[1] }),
      elbowArrow({ points: [[A_OUT, SIDE_A.y], [B_OUT, SIDE_B.y]], heads: 'both' }),
      secureLock({ x: LOCK.x, y: LOCK.y, size: LOCK.size }),
      label({ x: LOCK.x, y: LOCK.y + 34, text: 'mTLS', size: TEXT }),

      // ---- what each sidecar asks Sentry for -------------------------------
      // Two feeders into one junction and one trunk out of it: the feeders
      // carry no head, because the traffic arrives where the trunk ends.
      elbowArrow({
        points: [[A_OUT, CSR_Y], [CSR_A, CSR_Y], [CSR_A, CSR_BUS], [MID, CSR_BUS]],
        heads: 'none',
      }),
      elbowArrow({
        points: [[B_OUT, CSR_Y], [CSR_B, CSR_Y], [CSR_B, CSR_BUS], [MID, CSR_BUS]],
        heads: 'none',
      }),
      elbowArrow({ points: [[MID, CSR_BUS], [MID, SENTRY_BOTTOM]] }),
      // To the right of the trunk, under Sentry's own name: the trunk is the
      // only thing in that column, so the words have to stand beside it.
      label({
        x: 586, y: 128, size: TEXT,
        text: 'Request a workload\ncertificate',
      }),

      // ---- the operator, and the two things they do ------------------------
      icon({
        name: 'fluent-person', x: OPERATOR.x, y: OPERATOR.y, size: OPERATOR.size,
        color: C.navy, fit: 'ink', label: 'Operator', labelSize: TEXT,
      }),
      // Up the middle, then out both ways into the sidecars' bottom nodes.
      elbowArrow({
        points: [
          [OPERATOR.x, OPERATOR.y - OPERATOR.size / 2 - 2], [MID, TRUST_BUS],
          [SIDE_A.x, TRUST_BUS], [SIDE_A.x, SIDE_BOTTOM],
        ],
      }),
      elbowArrow({ points: [[MID, TRUST_BUS], [SIDE_B.x, TRUST_BUS], [SIDE_B.x, SIDE_BOTTOM]] }),
      // Right of the operator's riser, where the fork above it is the only
      // line it can belong to: the run to the certs stops short of this column.
      label({
        x: 616, y: 362, size: TEXT,
        text: 'Set the trust anchors\nfrom those files, as\nenvironment variables',
      }),

      // Sideways out of the operator, back under the apps, then straight up
      // the certs' own column into the underside of their name. It cannot
      // leave the operator's top - the trust anchors do - nor its bottom,
      // where its own name is; and it arrives under the name rather than at
      // the mark's side, so the run has one corner instead of two and the
      // whole left column stands on one line.
      elbowArrow({
        points: [
          [OPERATOR.x - inkHalf(OPERATOR.size) - 2, OPERATOR.y],
          [STORE.x, OPERATOR.y],
          [STORE.x, STORE_LABEL_BOTTOM + 4],
        ],
      }),
      // Above that run and left of where the fork overhead reaches, so the
      // only line it can belong to is the one below it: bringing your own
      // certs is what is optional, not the operator.
      label({
        x: 256, y: 345, size: SMALL,
        text: '(optional)\nBring your own root\nand issuer certs',
      }),
    ];
  },
};
